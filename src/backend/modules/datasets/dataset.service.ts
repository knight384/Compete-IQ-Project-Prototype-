import { Dataset, DatasetFailureCode } from '@prisma/client';
import { datasetRepository } from './dataset.repository';
import { LocalStorageProvider } from '../../shared/storage/local-storage-provider';
import { StorageProvider } from '../../shared/storage/storage-provider';
import { ParsedDataset } from '../../shared/parsing/dataset-parser';
import { CsvDatasetParser } from '../../shared/parsing/csv-dataset-parser';
import { XlsxDatasetParser } from '../../shared/parsing/xlsx-dataset-parser';
import { DatasetParser } from '../../shared/parsing/dataset-parser';
import { DatasetNotFoundError, DatasetValidationError, DatasetFormatError, DatasetStateError, DatasetMappingError, DatasetIntegrityError, DatasetStorageError, DatasetPersistenceError } from '../../shared/errors/dataset-errors';
import { suggestSemanticMappings, ColumnMapping, SemanticMappingDocument, SemanticField, validateSemanticMappingDocument } from '../../shared/mapping/semantic-mapping';
import { generateDeterministicProfile, DatasetProfileResult } from './dataset-profiler';
import { buildIntelligenceContext } from './dataset-intelligence-context';
import { AiIntelligenceProvider } from '../../shared/ai/ai-provider';
import { GeminiAiProvider } from '../../shared/ai/gemini-ai-provider';
import { StructuredIntelligenceResult } from '../../shared/ai/intelligence-contract';
import { AiConfigurationError, AiProviderError, AiResponseValidationError } from '../../shared/errors/ai-errors';
import { RETRYABLE_DATASET_FAILURE_CODES, isRetryableFailureCode } from '../../shared/utils/dataset-failure-codes';

export interface DatasetIntelligenceGenerationResult {
  datasetId: string;
  status: 'READY';
  profile: DatasetProfileResult;
  intelligence: StructuredIntelligenceResult;
}

export interface DatasetProfileDto {
  rowCount: number | null;
  columnCount: number | null;
  columnMetadata: unknown;
  summaryStatistics: unknown;
}

export interface DatasetInsightDto {
  type: string;
  title: string;
  summary: string;
  confidence: string | null;
  evidence: unknown;
}

export interface DatasetIntelligenceDto {
  datasetId: string;
  status: string;
  failureReason: string | null;
  failureCode: DatasetFailureCode | null;
  profile: DatasetProfileDto | null;
  insights: DatasetInsightDto[];
}

// Hardcoded maximum file size for Milestone 4.3 (10MB limit)
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_MIME_TYPES = [
  'text/csv',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
];

const ALLOWED_EXTENSIONS = ['.csv', '.xlsx'];

export class DatasetService {
  private storage: StorageProvider;
  private aiProviderOverride?: AiIntelligenceProvider;
  private cachedAiProvider?: GeminiAiProvider;

  constructor(aiProvider?: AiIntelligenceProvider) {
    // Injecting the local storage provider for development
    this.storage = new LocalStorageProvider();
    this.aiProviderOverride = aiProvider;
  }

  private getAiProvider(): AiIntelligenceProvider {
    if (this.aiProviderOverride) return this.aiProviderOverride;
    if (!this.cachedAiProvider) {
      this.cachedAiProvider = new GeminiAiProvider();
    }
    return this.cachedAiProvider;
  }

  async uploadDataset(
    orgId: string, 
    originalFilename: string, 
    mimeType: string, 
    buffer: Buffer
  ): Promise<Dataset> {
    
    // 1. Validation
    if (!buffer || buffer.length === 0) {
      throw new Error('File is empty.');
    }

    if (buffer.length > MAX_FILE_SIZE) {
      throw new Error(`File size exceeds the limit of ${MAX_FILE_SIZE / (1024 * 1024)}MB.`);
    }

    if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
      throw new Error(`Unsupported file type: ${mimeType}. Only CSV and XLSX are allowed.`);
    }

    const ext = originalFilename.substring(originalFilename.lastIndexOf('.')).toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      throw new Error(`Unsupported file extension: ${ext}. Only .csv and .xlsx are allowed.`);
    }

    // 2. Storage
    let storageKey: string;
    try {
      storageKey = await this.storage.save(originalFilename, buffer, orgId);
    } catch (error: unknown) {
      console.error('Storage failed:', error);
      throw new Error('Failed to store the dataset file.');
    }

    // 3. Database Persistence
    try {
      const dataset = await datasetRepository.create({
        orgId,
        originalFilename,
        storageKey,
        mimeType,
        fileSize: buffer.length,
        status: 'UPLOADED',
        format: mimeType === 'text/csv' ? 'CSV' : 'XLSX'
      });
      return dataset;
    } catch (error: unknown) {
      console.error('Database persistence failed, attempting storage cleanup:', error);
      
      // Compensation: cleanup the stored file if DB creation failed
      try {
        await this.storage.delete(storageKey);
      } catch (cleanupError: unknown) {
        console.error('Failed to cleanup orphaned storage file:', cleanupError);
      }
      
      throw new Error('Failed to persist dataset metadata.');
    }
  }

  async getDatasets(orgId: string): Promise<Dataset[]> {
    return datasetRepository.findAllByOrganization(orgId);
  }

  async getDatasetById(id: string, orgId: string): Promise<Dataset> {
    const dataset = await datasetRepository.findById(id, orgId);
    if (!dataset) {
      throw new Error('Dataset not found');
    }
    return dataset;
  }

  async deleteDataset(id: string, orgId: string): Promise<void> {
    // 1. Get dataset to find storage key
    const dataset = await datasetRepository.findById(id, orgId);
    if (!dataset) {
      throw new Error('Dataset not found');
    }

    // 2. Delete from database first.
    // Why DB first? If DB fails, file stays (orphaned but safe).
    // If file delete fails but DB is deleted, it's a storage leak but the system is consistent.
    await datasetRepository.delete(id, orgId);

    // 3. Delete from storage
    try {
      await this.storage.delete(dataset.storageKey);
    } catch (error: unknown) {
      console.error('Storage deletion failed for deleted dataset:', error);
      // We don't throw here because the DB record is already successfully gone
    }
  }

  /**
   * Internal helper that reads the stored file, selects the parser,
   * parses and validates, and returns ParsedDataset without mutating database state.
   */
  private async readAndParseDataset(datasetId: string, orgId: string): Promise<ParsedDataset> {
    const dataset = await datasetRepository.findById(datasetId, orgId);
    if (!dataset) {
      throw new DatasetNotFoundError('Dataset not found');
    }

    let buffer: Buffer;
    try {
      buffer = await this.storage.read(dataset.storageKey);
    } catch (error: unknown) {
      console.error('Failed to read dataset from storage:', error);
      throw new DatasetStorageError('Failed to read dataset from storage.');
    }

    let parser: DatasetParser;
    if (dataset.format === 'CSV') {
      parser = new CsvDatasetParser();
    } else if (dataset.format === 'XLSX') {
      parser = new XlsxDatasetParser();
    } else {
      throw new DatasetFormatError('Unsupported dataset format.');
    }

    // This parses and structurally validates (width limits, row limits)
    return parser.parse(buffer);
  }

  async parseDataset(datasetId: string, orgId: string): Promise<ParsedDataset> {
    try {
      const parsedDataset = await this.readAndParseDataset(datasetId, orgId);
      
      // Success -> Transition status
      await datasetRepository.updateStatusAndFailureReason(datasetId, orgId, 'MAPPING_REQUIRED', null);
      
      return parsedDataset;
    } catch (error: unknown) {
      // If the error comes from our readAndParseDataset due to unsupported format, transition it here
      if (error instanceof DatasetFormatError) {
        await datasetRepository.updateStatusAndFailureReason(datasetId, orgId, 'FAILED', 'Unsupported dataset format.');
        throw error;
      }
      
      const failureReason = error instanceof DatasetValidationError 
        ? error.message 
        : 'Unknown validation error occurred during parsing.';
        
      console.error('Dataset parsing validation failed:', failureReason);
      
      // Attempt to update status to FAILED safely. 
      await datasetRepository.updateStatusAndFailureReason(datasetId, orgId, 'FAILED', failureReason);
      
      // Propagate the controlled validation error
      if (error instanceof DatasetValidationError) {
        throw error;
      } else {
        throw new DatasetValidationError(failureReason);
      }
    }
  }

  async getMappingSuggestions(datasetId: string, orgId: string) {
    const dataset = await datasetRepository.findById(datasetId, orgId);
    if (!dataset) {
      throw new DatasetNotFoundError('Dataset not found');
    }

    if (dataset.status !== 'MAPPING_REQUIRED') {
      throw new DatasetStateError(`Cannot generate suggestions for dataset in state: ${dataset.status}`);
    }

    // Reuse parsing infrastructure strictly without mutating database status
    const parsedDataset = await this.readAndParseDataset(datasetId, orgId);
    
    // Suggest mappings deterministically
    return suggestSemanticMappings(parsedDataset.headers);
  }

  async confirmColumnMapping(datasetId: string, orgId: string, mappings: ColumnMapping[]): Promise<Dataset> {
    const dataset = await datasetRepository.findById(datasetId, orgId);
    if (!dataset) {
      throw new DatasetNotFoundError('Dataset not found');
    }

    if (dataset.status !== 'MAPPING_REQUIRED') {
      throw new DatasetStateError(`Cannot map columns for dataset in state: ${dataset.status}`);
    }

    if (!mappings || mappings.length === 0) {
      throw new DatasetMappingError('Mapping payload cannot be empty');
    }

    // Reuse parsing infrastructure to obtain actual headers cleanly
    const parsedDataset = await this.readAndParseDataset(datasetId, orgId);
    const actualHeaders = parsedDataset.headers;
    const actualHeaderSet = new Set(actualHeaders);

    // 4. A confirmed mapping must cover EVERY actual parsed source header exactly once.
    if (mappings.length !== actualHeaders.length) {
      throw new DatasetMappingError(`Mapping must cover exactly ${actualHeaders.length} source columns. Received ${mappings.length}.`);
    }

    const seenSources = new Set<string>();
    const seenSemantics = new Set<SemanticField>();

    for (const mapping of mappings) {
      if (!actualHeaderSet.has(mapping.sourceColumn)) {
        throw new DatasetMappingError(`Unknown source column: "${mapping.sourceColumn}"`);
      }
      
      if (seenSources.has(mapping.sourceColumn)) {
        throw new DatasetMappingError(`Duplicate source column mapping: "${mapping.sourceColumn}"`);
      }
      seenSources.add(mapping.sourceColumn);

      // Explicitly reject null or undefined semantic fields
      const field = mapping.semanticField;
      if (field === null || field === undefined) {
        throw new DatasetMappingError(`Semantic field cannot be null or missing for column: "${mapping.sourceColumn}"`);
      }

      if (!Object.values(SemanticField).includes(field)) {
        throw new DatasetMappingError(`Invalid semantic field: "${field}"`);
      }

      // 5. Singleton policy: Non-IGNORE fields should not be duplicated
      if (field !== SemanticField.IGNORE) {
        if (seenSemantics.has(field)) {
          throw new DatasetMappingError(`Duplicate mapping for singleton semantic field: "${field}"`);
        }
        seenSemantics.add(field);
      }
    }

    // Check if every source header was mapped
    for (const header of actualHeaders) {
      if (!seenSources.has(header)) {
        throw new DatasetMappingError(`Missing mapping for source column: "${header}"`);
      }
    }

    const mappingDocument: SemanticMappingDocument = {
      version: 1,
      columns: mappings
    };

    // Transition to MAPPED
    return datasetRepository.updateSemanticMapping(datasetId, orgId, mappingDocument, 'MAPPED');
  }

  async generateDatasetIntelligence(datasetId: string, orgId: string): Promise<DatasetIntelligenceGenerationResult> {
    // 1. Pre-claim validation
    const dataset = await datasetRepository.findById(datasetId, orgId);
    if (!dataset) {
      throw new DatasetNotFoundError('Dataset not found');
    }

    if (dataset.status !== 'MAPPED') {
      throw new DatasetStateError(`Cannot generate intelligence for dataset in state: ${dataset.status}. Expected MAPPED.`);
    }

    if (!dataset.semanticMapping) {
      throw new DatasetMappingError('Semantic mapping is missing.');
    }

    let mappingDoc: SemanticMappingDocument;
    try {
      mappingDoc = validateSemanticMappingDocument(dataset.semanticMapping);
    } catch (e: unknown) {
      throw new DatasetMappingError(e instanceof Error ? e.message : 'Semantic mapping is malformed.');
    }

    // 2. Atomic processing claim
    const claimed = await datasetRepository.claimDatasetForProcessing(datasetId, orgId);
    if (!claimed) {
      throw new DatasetStateError(`Dataset state changed concurrently or is not MAPPED. Claim failed.`);
    }

    try {
      // 3. Pipeline After Successful Claim
      // Read and parse
      const parsedDataset = await this.readAndParseDataset(datasetId, orgId);

      // Deterministic Profile
      const profile = generateDeterministicProfile(parsedDataset, mappingDoc);

      // Intelligence Context
      const context = buildIntelligenceContext(parsedDataset, mappingDoc, profile);

      // Generate Intelligence
      const provider = this.getAiProvider();
      const intelligence = await provider.generateInsights(context);

      // Transactional persistence
      try {
        await datasetRepository.persistIntelligenceTransaction(datasetId, orgId, profile, intelligence);
      } catch (txErr: unknown) {
        throw new DatasetPersistenceError('Intelligence persistence transaction failed.');
      }

      return {
        datasetId,
        status: 'READY',
        profile,
        intelligence
      };

    } catch (error: unknown) {
      let failureCode: DatasetFailureCode = DatasetFailureCode.INTERNAL;
      let sanitizedReason = 'Dataset processing failed due to an unknown internal error.';

      if (error instanceof DatasetValidationError) {
        failureCode = DatasetFailureCode.DATASET_VALIDATION;
        sanitizedReason = `Dataset validation failed: ${error.message}`;
      } else if (error instanceof DatasetFormatError) {
        failureCode = DatasetFailureCode.DATASET_FORMAT;
        sanitizedReason = `Unsupported dataset format: ${error.message}`;
      } else if (error instanceof AiConfigurationError) {
        failureCode = DatasetFailureCode.AI_CONFIGURATION;
        sanitizedReason = 'AI configuration is unavailable.';
      } else if (error instanceof AiProviderError) {
        failureCode = DatasetFailureCode.AI_PROVIDER;
        sanitizedReason = 'AI provider is temporarily unavailable.';
      } else if (error instanceof AiResponseValidationError) {
        failureCode = DatasetFailureCode.AI_RESPONSE_VALIDATION;
        sanitizedReason = 'AI response failed structural or grounding validation.';
      } else if (error instanceof DatasetStorageError) {
        failureCode = DatasetFailureCode.STORAGE;
        sanitizedReason = 'Failed to read dataset from storage.';
      } else if (error instanceof DatasetPersistenceError) {
        failureCode = DatasetFailureCode.PERSISTENCE;
        sanitizedReason = 'Intelligence persistence transaction failed.';
      }

      // Fallback transition
      try {
        await datasetRepository.markProcessingAsFailed(datasetId, orgId, sanitizedReason, failureCode);
      } catch (fallbackError) {
        throw new Error('Infrastructure error: Failed to persist intelligence and failed to update dataset status.');
      }

      throw error;
    }
  }

  async retryDatasetProcessing(datasetId: string, orgId: string): Promise<Dataset> {
    const dataset = await datasetRepository.findById(datasetId, orgId);
    if (!dataset) {
      throw new DatasetNotFoundError('Dataset not found');
    }

    if (dataset.status !== 'FAILED') {
      throw new DatasetStateError(`Cannot retry dataset in state: ${dataset.status}. Expected FAILED.`);
    }

    if (!dataset.failureCode || !isRetryableFailureCode(dataset.failureCode)) {
      throw new DatasetStateError('Dataset failure is not retryable.');
    }

    const retried = await datasetRepository.retryDatasetProcessing(datasetId, orgId, RETRYABLE_DATASET_FAILURE_CODES);
    if (!retried) {
      throw new DatasetStateError('Dataset state changed concurrently or retry failed.');
    }

    return this.getDatasetById(datasetId, orgId);
  }

  async getDatasetIntelligence(datasetId: string, orgId: string): Promise<DatasetIntelligenceDto> {
    const dataset = await datasetRepository.findWithIntelligence(datasetId, orgId);
    if (!dataset) {
      throw new DatasetNotFoundError('Dataset not found');
    }

    if (['UPLOADED', 'MAPPING_REQUIRED', 'MAPPED', 'PROCESSING'].includes(dataset.status)) {
      throw new DatasetStateError(`Intelligence not available for dataset in state: ${dataset.status}`);
    }

    if (dataset.status === 'FAILED') {
      return {
        datasetId: dataset.id,
        status: dataset.status,
        failureReason: dataset.failureReason,
        failureCode: dataset.failureCode ?? null,
        profile: null,
        insights: []
      };
    }

    // dataset.status === 'READY'
    if (!dataset.profile) {
      throw new DatasetIntegrityError('Dataset is READY but profile is missing from database.');
    }

    return {
      datasetId: dataset.id,
      status: dataset.status,
      failureReason: dataset.failureReason,
      failureCode: null,
      profile: {
        rowCount: dataset.profile.rowCount,
        columnCount: dataset.profile.columnCount,
        columnMetadata: dataset.profile.columnMetadata,
        summaryStatistics: dataset.profile.summaryStatistics
      },
      insights: dataset.insights.map((insight) => ({
        type: insight.type,
        title: insight.title,
        summary: insight.summary,
        confidence: insight.confidence,
        evidence: insight.evidence
      }))
    };
  }
}

export const datasetService = new DatasetService();
