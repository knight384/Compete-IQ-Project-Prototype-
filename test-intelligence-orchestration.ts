import { datasetService, DatasetService } from './src/backend/modules/datasets/dataset.service';
import { datasetRepository } from './src/backend/modules/datasets/dataset.repository';
import { DatasetStatus, PrismaClient, Prisma } from '@prisma/client';
import { AiIntelligenceProvider } from './src/backend/shared/ai/ai-provider';
import { IntelligenceContext } from './src/backend/modules/datasets/dataset-intelligence-context';
import { StructuredIntelligenceResult, InsightType, ConfidenceLevel } from './src/backend/shared/ai/intelligence-contract';
import { SemanticMappingDocument, SemanticField } from './src/backend/shared/mapping/semantic-mapping';
import { AiProviderError, AiConfigurationError, AiResponseValidationError } from './src/backend/shared/errors/ai-errors';
import { DatasetStateError } from './src/backend/shared/errors/dataset-errors';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();
const ORG_ID = 'test-org-1';

const MOCK_MAPPING: SemanticMappingDocument = {
  version: 1,
  columns: [
    { sourceColumn: 'Competitor', semanticField: SemanticField.COMPETITOR_NAME },
    { sourceColumn: 'Price', semanticField: SemanticField.PRICE },
    { sourceColumn: 'Rating', semanticField: SemanticField.RATING },
  ]
};

const MOCK_INSIGHTS: StructuredIntelligenceResult = {
  version: 1,
  insights: [
    {
      type: InsightType.PRICING_OPPORTUNITY,
      title: 'Test Insight',
      summary: 'Summary of test insight',
      confidence: ConfidenceLevel.HIGH,
      evidence: {
        sourceColumns: ['Price'],
        sampleRowIndices: [0]
      }
    }
  ]
};

class MockAiProvider implements AiIntelligenceProvider {
  public invocationCount = 0;
  public mockError?: Error;
  public delayMs = 0;

  async generateInsights(context: IntelligenceContext): Promise<StructuredIntelligenceResult> {
    this.invocationCount++;
    if (this.delayMs > 0) {
      await new Promise(resolve => setTimeout(resolve, this.delayMs));
    }
    if (this.mockError) {
      throw this.mockError;
    }
    return MOCK_INSIGHTS;
  }
}

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`ASSERTION FAILED: ${message}`);
  }
}

function assertEqual<T>(actual: T, expected: T, message: string) {
  if (actual !== expected) {
    throw new Error(`ASSERTION FAILED: ${message} | Expected '${expected}' but got '${actual}'`);
  }
}

async function setupTestDataset(status: DatasetStatus, mapping: unknown = MOCK_MAPPING, failureReason: string | null = null): Promise<string> {
  const dataset = await prisma.dataset.create({
    data: {
      orgId: ORG_ID,
      originalFilename: 'test.csv',
      storageKey: 'test-key-' + Date.now(),
      format: 'CSV',
      mimeType: 'text/csv',
      fileSize: 100,
      status,
      semanticMapping: mapping as Prisma.InputJsonValue,
      failureReason
    }
  });

  const tempDir = path.join(process.cwd(), '.uploads');
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }
  const filePath = path.join(tempDir, dataset.storageKey);
  fs.writeFileSync(filePath, 'Competitor,Price,Rating\nA,100,4\nB,90,5');

  return dataset.id;
}

async function cleanupDataset(id: string) {
  const dataset = await prisma.dataset.findUnique({ where: { id } });
  if (dataset) {
    const filePath = path.join(process.cwd(), '.uploads', dataset.storageKey);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    await prisma.dataset.delete({ where: { id } });
  }
}

async function runTests() {
  console.log('--- Running Intelligence Orchestration Tests ---');

  await prisma.organization.upsert({
    where: { id: ORG_ID },
    update: {},
    create: { id: ORG_ID, name: 'Test Org' }
  });

  let passed = 0;
  let failed = 0;

  async function test(name: string, fn: () => Promise<void>) {
    try {
      await fn();
      console.log(`PASS: ${name}`);
      passed++;
    } catch (e: unknown) {
      console.error(`FAIL: ${name}\n${e instanceof Error ? e.stack : e}`);
      failed++;
    }
  }

  await test('MAPPED dataset can be claimed, transitions to READY, and provider invoked exactly once', async () => {
    const mockProvider = new MockAiProvider();
    const service = new DatasetService(mockProvider);
    const dsId = await setupTestDataset('MAPPED');
    try {
      const result = await service.generateDatasetIntelligence(dsId, ORG_ID);
      assertEqual(result.status, 'READY', 'Result status should be READY');
      assertEqual(mockProvider.invocationCount, 1, 'Provider invoked exactly once');

      const ds = await prisma.dataset.findUnique({ where: { id: dsId } });
      assertEqual(ds?.status, 'READY', 'Database status should be READY');
    } finally {
      await cleanupDataset(dsId);
    }
  });

  await test('Concurrent generateDatasetIntelligence calls race safely', async () => {
    const mockProvider = new MockAiProvider();
    mockProvider.delayMs = 100; // Force delay to ensure race
    const service = new DatasetService(mockProvider);
    const dsId = await setupTestDataset('MAPPED');
    try {
      const p1 = service.generateDatasetIntelligence(dsId, ORG_ID);
      const p2 = service.generateDatasetIntelligence(dsId, ORG_ID);
      
      const results = await Promise.allSettled([p1, p2]);
      
      const fulfilled = results.filter(r => r.status === 'fulfilled');
      const rejected = results.filter(r => r.status === 'rejected');
      
      assertEqual(fulfilled.length, 1, 'Exactly one request should succeed');
      assertEqual(rejected.length, 1, 'Exactly one request should fail due to conflict');
      
      const rejectedResult = results.find(r => r.status === 'rejected');

      assert(
        rejectedResult?.status === 'rejected' &&
        rejectedResult.reason instanceof DatasetStateError,
        'Concurrent loser must reject with DatasetStateError'
      );
      
      assertEqual(mockProvider.invocationCount, 1, 'Provider invoked exactly once');

      const ds = await prisma.dataset.findUnique({ where: { id: dsId } });
      assertEqual(ds?.status, 'READY', 'Database status should be READY');
    } finally {
      await cleanupDataset(dsId);
    }
  });

  await test('Concurrent/second claim fails (starting PROCESSING)', async () => {
    const mockProvider = new MockAiProvider();
    const service = new DatasetService(mockProvider);
    const dsId = await setupTestDataset('PROCESSING');
    try {
      await service.generateDatasetIntelligence(dsId, ORG_ID);
      assert(false, 'Should have thrown error for wrong state');
    } catch (e: unknown) {
      assert(e instanceof Error && e.message.includes('Expected MAPPED'), 'Correct error thrown');
      assertEqual(mockProvider.invocationCount, 0, 'Provider NOT invoked');
    } finally {
      await cleanupDataset(dsId);
    }
  });

  const wrongStates: DatasetStatus[] = ['UPLOADED', 'MAPPING_REQUIRED', 'PROCESSING', 'READY', 'FAILED'];
  for (const st of wrongStates) {
    await test(`${st} request does not invoke provider`, async () => {
      const mockProvider = new MockAiProvider();
      const service = new DatasetService(mockProvider);
      const dsId = await setupTestDataset(st);
      try {
        await service.generateDatasetIntelligence(dsId, ORG_ID);
        assert(false, 'Should have thrown error');
      } catch (e: unknown) {
        assertEqual(mockProvider.invocationCount, 0, 'Provider NOT invoked');
      } finally {
        await cleanupDataset(dsId);
      }
    });
  }

  await test('Missing semanticMapping rejected before claim, does not set FAILED', async () => {
    const mockProvider = new MockAiProvider();
    const service = new DatasetService(mockProvider);
    const dsId = await setupTestDataset('MAPPED', null);
    try {
      await service.generateDatasetIntelligence(dsId, ORG_ID);
      assert(false, 'Should have thrown');
    } catch (e: unknown) {
      assert(e instanceof Error && e.message.includes('Semantic mapping is missing'), 'Correct error');
      const ds = await prisma.dataset.findUnique({ where: { id: dsId } });
      assertEqual(ds?.status, 'MAPPED', 'Dataset should still be MAPPED');
      assertEqual(mockProvider.invocationCount, 0, 'Provider NOT invoked');
    } finally {
      await cleanupDataset(dsId);
    }
  });

  await test('Malformed semanticMapping rejected before claim, does not set FAILED', async () => {
    const mockProvider = new MockAiProvider();
    const service = new DatasetService(mockProvider);
    const dsId = await setupTestDataset('MAPPED', { invalid: 'doc' });
    try {
      await service.generateDatasetIntelligence(dsId, ORG_ID);
      assert(false, 'Should have thrown');
    } catch (e: unknown) {
      assert(e instanceof Error && e.message.includes('Mapping document'), 'Correct error');
      const ds = await prisma.dataset.findUnique({ where: { id: dsId } });
      assertEqual(ds?.status, 'MAPPED', 'Dataset should still be MAPPED');
      assertEqual(mockProvider.invocationCount, 0, 'Provider NOT invoked');
    } finally {
      await cleanupDataset(dsId);
    }
  });

  await test('Provider failure after retry sets FAILED and failureCode AI_PROVIDER', async () => {
    const mockProvider = new MockAiProvider();
    mockProvider.mockError = new AiProviderError('Provider went down');
    const service = new DatasetService(mockProvider);
    const dsId = await setupTestDataset('MAPPED');
    try {
      await service.generateDatasetIntelligence(dsId, ORG_ID);
      assert(false, 'Should have thrown');
    } catch (e: unknown) {
      const ds = await prisma.dataset.findUnique({ where: { id: dsId } });
      assertEqual(ds?.status, 'FAILED', 'Dataset should be FAILED');
      assertEqual(ds?.failureCode, 'AI_PROVIDER', 'Dataset failureCode should be AI_PROVIDER');
      assertEqual(ds?.failureReason, 'AI provider is temporarily unavailable.', 'Correct sanitized reason');
    } finally {
      await cleanupDataset(dsId);
    }
  });

  await test('AiConfigurationError sets FAILED and failureCode AI_CONFIGURATION', async () => {
    const mockProvider = new MockAiProvider();
    mockProvider.mockError = new AiConfigurationError('Missing API Key');
    const service = new DatasetService(mockProvider);
    const dsId = await setupTestDataset('MAPPED');
    try {
      await service.generateDatasetIntelligence(dsId, ORG_ID);
      assert(false, 'Should have thrown');
    } catch (e: unknown) {
      const ds = await prisma.dataset.findUnique({ where: { id: dsId } });
      assertEqual(ds?.status, 'FAILED', 'Dataset should be FAILED');
      assertEqual(ds?.failureCode, 'AI_CONFIGURATION', 'Dataset failureCode should be AI_CONFIGURATION');
      assertEqual(ds?.failureReason, 'AI configuration is unavailable.', 'Correct sanitized reason');
    } finally {
      await cleanupDataset(dsId);
    }
  });

  await test('AiResponseValidationError sets FAILED and failureCode AI_RESPONSE_VALIDATION', async () => {
    const mockProvider = new MockAiProvider();
    mockProvider.mockError = new AiResponseValidationError('Bad JSON from Gemini');
    const service = new DatasetService(mockProvider);
    const dsId = await setupTestDataset('MAPPED');
    try {
      await service.generateDatasetIntelligence(dsId, ORG_ID);
      assert(false, 'Should have thrown');
    } catch (e: unknown) {
      const ds = await prisma.dataset.findUnique({ where: { id: dsId } });
      assertEqual(ds?.status, 'FAILED', 'Dataset should be FAILED');
      assertEqual(ds?.failureCode, 'AI_RESPONSE_VALIDATION', 'Dataset failureCode should be AI_RESPONSE_VALIDATION');
      assertEqual(ds?.failureReason, 'AI response failed structural or grounding validation.', 'Correct sanitized reason');
    } finally {
      await cleanupDataset(dsId);
    }
  });

  await test('Explicit final persistence failure sets FAILED and failureCode PERSISTENCE', async () => {
    const mockProvider = new MockAiProvider();
    const service = new DatasetService(mockProvider);
    const dsId = await setupTestDataset('MAPPED');
    
    const originalPersist = datasetRepository.persistIntelligenceTransaction;
    datasetRepository.persistIntelligenceTransaction = async () => {
      throw new Error('Transaction aborted explicitly by mock');
    };

    try {
      await service.generateDatasetIntelligence(dsId, ORG_ID);
      assert(false, 'Should have thrown');
    } catch (e: unknown) {
      const ds = await prisma.dataset.findUnique({ where: { id: dsId } });
      assertEqual(ds?.status, 'FAILED', 'Dataset should be FAILED');
      assertEqual(ds?.failureCode, 'PERSISTENCE', 'Dataset failureCode should be PERSISTENCE');
      assertEqual(ds?.failureReason, 'Intelligence persistence transaction failed.', 'Correct sanitized reason');
    } finally {
      datasetRepository.persistIntelligenceTransaction = originalPersist;
      await cleanupDataset(dsId);
    }
  });

  await test('Retryable FAILED dataset can be retried to MAPPED, clearing failure fields', async () => {
    const mockProvider = new MockAiProvider();
    const service = new DatasetService(mockProvider);
    
    // Create dataset in FAILED state with retryable code
    const dsId = await setupTestDataset('FAILED', MOCK_MAPPING, 'AI provider unavailable');
    await prisma.dataset.update({
      where: { id: dsId },
      data: { failureCode: 'AI_PROVIDER' }
    });

    try {
      const updated = await service.retryDatasetProcessing(dsId, ORG_ID);
      assertEqual(updated.status, 'MAPPED', 'Status should be MAPPED after retry');
      assertEqual(updated.failureReason, null, 'failureReason should be null after retry');
      assertEqual(updated.failureCode, null, 'failureCode should be null after retry');
      assertEqual(mockProvider.invocationCount, 0, 'Retry MUST NOT invoke AI provider');
    } finally {
      await cleanupDataset(dsId);
    }
  });

  await test('Non-retryable FAILED dataset (DATASET_VALIDATION) rejects retry with DatasetStateError', async () => {
    const mockProvider = new MockAiProvider();
    const service = new DatasetService(mockProvider);
    
    const dsId = await setupTestDataset('FAILED', MOCK_MAPPING, 'Validation failed');
    await prisma.dataset.update({
      where: { id: dsId },
      data: { failureCode: 'DATASET_VALIDATION' }
    });

    try {
      await service.retryDatasetProcessing(dsId, ORG_ID);
      assert(false, 'Should have thrown DatasetStateError');
    } catch (e: unknown) {
      assert(e instanceof DatasetStateError, 'Should throw DatasetStateError');
      assertEqual(mockProvider.invocationCount, 0, 'Retry MUST NOT invoke AI provider');
    } finally {
      await cleanupDataset(dsId);
    }
  });

  await test('Legacy FAILED dataset with null failureCode rejects retry with DatasetStateError', async () => {
    const mockProvider = new MockAiProvider();
    const service = new DatasetService(mockProvider);
    
    const dsId = await setupTestDataset('FAILED', MOCK_MAPPING, 'Legacy error without code');
    // Ensure failureCode remains null

    try {
      await service.retryDatasetProcessing(dsId, ORG_ID);
      assert(false, 'Should have thrown DatasetStateError');
    } catch (e: unknown) {
      assert(e instanceof DatasetStateError, 'Should throw DatasetStateError for null failureCode');
    } finally {
      await cleanupDataset(dsId);
    }
  });

  await test('Non-FAILED dataset (MAPPED/READY/PROCESSING) rejects retry with DatasetStateError', async () => {
    const mockProvider = new MockAiProvider();
    const service = new DatasetService(mockProvider);
    
    const dsId = await setupTestDataset('MAPPED');

    try {
      await service.retryDatasetProcessing(dsId, ORG_ID);
      assert(false, 'Should have thrown DatasetStateError');
    } catch (e: unknown) {
      assert(e instanceof DatasetStateError, 'Should throw DatasetStateError');
    } finally {
      await cleanupDataset(dsId);
    }
  });

  await test('Concurrent retry calls race safely (only 1 succeeds)', async () => {
    const mockProvider = new MockAiProvider();
    const service = new DatasetService(mockProvider);
    
    const dsId = await setupTestDataset('FAILED', MOCK_MAPPING, 'AI provider unavailable');
    await prisma.dataset.update({
      where: { id: dsId },
      data: { failureCode: 'AI_PROVIDER' }
    });

    try {
      const p1 = service.retryDatasetProcessing(dsId, ORG_ID);
      const p2 = service.retryDatasetProcessing(dsId, ORG_ID);

      const results = await Promise.allSettled([p1, p2]);
      const fulfilled = results.filter(r => r.status === 'fulfilled');
      const rejected = results.filter(r => r.status === 'rejected');

      assertEqual(fulfilled.length, 1, 'Exactly one retry should succeed');
      assertEqual(rejected.length, 1, 'Exactly one retry should fail');
    } finally {
      await cleanupDataset(dsId);
    }
  });

  console.log(`\nTests completed: ${passed} passed, ${failed} failed.\n`);
  if (failed > 0) process.exit(1);
}

runTests();
