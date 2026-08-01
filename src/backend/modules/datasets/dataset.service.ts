import { Dataset } from '@prisma/client';
import { datasetRepository } from './dataset.repository';
import { LocalStorageProvider } from '../../shared/storage/local-storage-provider';
import { StorageProvider } from '../../shared/storage/storage-provider';
import { ParsedDataset } from '../../shared/parsing/dataset-parser';
import { CsvDatasetParser } from '../../shared/parsing/csv-dataset-parser';
import { XlsxDatasetParser } from '../../shared/parsing/xlsx-dataset-parser';
import { DatasetParser } from '../../shared/parsing/dataset-parser';
import { DatasetNotFoundError, DatasetValidationError, DatasetFormatError } from '../../shared/errors/dataset-errors';

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

  constructor() {
    // Injecting the local storage provider for development
    this.storage = new LocalStorageProvider();
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

  async parseDataset(datasetId: string, orgId: string): Promise<ParsedDataset> {
    // 1. Fetch Dataset through DatasetRepository using id + orgId.
    const dataset = await datasetRepository.findById(datasetId, orgId);
    if (!dataset) {
      throw new DatasetNotFoundError('Dataset not found');
    }

    // 2. Read file through StorageProvider.
    let buffer: Buffer;
    try {
      buffer = await this.storage.read(dataset.storageKey);
    } catch (error: unknown) {
      console.error('Failed to read dataset from storage:', error);
      // Propagate as infrastructure error, don't fail the dataset state.
      throw new Error('Failed to read dataset from storage.');
    }

    // 3. Select parser explicitly based on the validated stored dataset format
    let parser: DatasetParser;
    if (dataset.format === 'CSV') {
      parser = new CsvDatasetParser();
    } else if (dataset.format === 'XLSX') {
      parser = new XlsxDatasetParser();
    } else {
      // Transition dataset to FAILED with static failureReason
      await datasetRepository.updateStatusAndFailureReason(datasetId, orgId, 'FAILED', 'Unsupported dataset format.');
      throw new DatasetFormatError('Unsupported dataset format.');
    }

    // 4. Parse & Validate normalized structure.
    let parsedDataset: ParsedDataset;
    try {
      parsedDataset = await parser.parse(buffer);
    } catch (error: unknown) {
      const failureReason = error instanceof DatasetValidationError 
        ? error.message 
        : 'Unknown validation error occurred during parsing.';
        
      console.error('Dataset parsing validation failed:', failureReason);
      
      // Attempt to update status to FAILED safely. 
      // If this fails, we let the infrastructure error bubble up.
      await datasetRepository.updateStatusAndFailureReason(datasetId, orgId, 'FAILED', failureReason);
      
      // Propagate the controlled validation error
      if (error instanceof DatasetValidationError) {
        throw error;
      } else {
        throw new DatasetValidationError(failureReason);
      }
    }

    // 5. Success -> Transition status
    // If DB fails here, it propagates as an infrastructure error. 
    // We do not mark the dataset FAILED just because Prisma failed to update to MAPPING_REQUIRED.
    await datasetRepository.updateStatusAndFailureReason(datasetId, orgId, 'MAPPING_REQUIRED', null);
    
    return parsedDataset;
  }
}

export const datasetService = new DatasetService();
