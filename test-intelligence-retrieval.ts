import { datasetService } from './src/backend/modules/datasets/dataset.service';
import { datasetRepository } from './src/backend/modules/datasets/dataset.repository';
import { PrismaClient, DatasetStatus, Prisma } from '@prisma/client';
import { DatasetNotFoundError, DatasetStateError, DatasetIntegrityError } from './src/backend/shared/errors/dataset-errors';

const prisma = new PrismaClient();
const ORG_ID = '11111111-1111-1111-1111-111111111111';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`ASSERTION FAILED: ${message}`);
  }
}

async function setupDataset(status: DatasetStatus, withProfile = true, withInsights = 1): Promise<string> {
  const dataset = await prisma.dataset.create({
    data: {
      orgId: ORG_ID,
      originalFilename: 'test.csv',
      storageKey: `mock-key-${Date.now()}-${Math.random()}`,
      status,
      failureReason: status === 'FAILED' ? 'Test failure' : null
    }
  });

  if (withProfile) {
    await prisma.datasetProfile.create({
      data: {
        datasetId: dataset.id,
        rowCount: 10,
        columnCount: 5,
        columnMetadata: { test: true } as Prisma.InputJsonValue,
        summaryStatistics: { test: true } as Prisma.InputJsonValue
      }
    });
  }

  for (let i = 0; i < withInsights; i++) {
    await prisma.datasetInsight.create({
      data: {
        datasetId: dataset.id,
        type: 'PRICING',
        title: `Test Insight ${i}`,
        summary: 'Summary',
        confidence: 'HIGH',
        evidence: { test: true } as Prisma.InputJsonValue
      }
    });
  }

  return dataset.id;
}

async function runTests() {
  console.log('--- Running Intelligence Retrieval API Tests ---');

  // Test 1-15: READY returns exactly the bounded DTO
  {
    console.log('Test 1-15: READY bounded DTO...');
    const id = await setupDataset('READY', true, 2);
    try {
      // Ensure no Gemini key is needed
      const oldKey = process.env.GEMINI_API_KEY;
      const hasKey = 'GEMINI_API_KEY' in process.env;
      delete process.env.GEMINI_API_KEY;

      try {
        const result = await datasetService.getDatasetIntelligence(id, ORG_ID);
        
        assert(result.datasetId === id, 'Dataset ID matches');
        assert(result.status === 'READY', 'Status is READY');
        assert(result.failureReason === null, 'No failure reason');

        const resAny = result as unknown as Record<string, unknown>;
        assert(resAny.storageKey === undefined, 'No storageKey');
        assert(resAny.orgId === undefined, 'No orgId');
        assert(resAny.semanticMapping === undefined, 'No semanticMapping');

        assert(result.profile !== null, 'Profile exists');
        assert((result.profile as unknown as Record<string, unknown>).id === undefined, 'Profile ID hidden');
        assert((result.profile as unknown as Record<string, unknown>).datasetId === undefined, 'Profile datasetId hidden');
        assert(result.profile?.rowCount === 10, 'Profile rowCount mapped');

        assert(result.insights.length === 2, 'Insights exist');
        const firstInsight = result.insights[0] as unknown as Record<string, unknown>;
        assert(firstInsight.id === undefined, 'Insight ID hidden');
        assert(firstInsight.datasetId === undefined, 'Insight datasetId hidden');
        assert(firstInsight.createdAt === undefined, 'Insight createdAt hidden');
        assert(firstInsight.competitorId === undefined, 'Insight competitorId hidden');
        assert(firstInsight.productId === undefined, 'Insight productId hidden');
        
        // Test 32: Repeated retrieval produces equivalent DTO output
        const result2 = await datasetService.getDatasetIntelligence(id, ORG_ID);
        assert(JSON.stringify(result) === JSON.stringify(result2), 'Repeated retrieval identical');
      } finally {
        if (hasKey) {
          process.env.GEMINI_API_KEY = oldKey;
        } else {
          delete process.env.GEMINI_API_KEY;
        }
      }
    } finally {
      await prisma.dataset.delete({ where: { id } });
    }
  }

  // Test 16: READY with zero insights
  {
    console.log('Test 16: READY with zero insights...');
    const id = await setupDataset('READY', true, 0);
    try {
      const result = await datasetService.getDatasetIntelligence(id, ORG_ID);
      assert(result.insights.length === 0, 'Zero insights returned safely');
    } finally {
      await prisma.dataset.delete({ where: { id } });
    }
  }

  // Test 17: READY with missing profile
  {
    console.log('Test 17: READY with missing profile...');
    const id = await setupDataset('READY', false, 0);
    try {
      let threw = false;
      try {
        await datasetService.getDatasetIntelligence(id, ORG_ID);
      } catch (e) {
        if (e instanceof DatasetIntegrityError) threw = true;
      }
      assert(threw, 'Throws DatasetIntegrityError when profile missing on READY');
    } finally {
      await prisma.dataset.delete({ where: { id } });
    }
  }

  // Test 18-21: FAILED returns contract and hides stale data
  {
    console.log('Test 18-21: FAILED behavior...');
    const id = await setupDataset('FAILED', true, 1); // Has stale profile and insight
    try {
      const result = await datasetService.getDatasetIntelligence(id, ORG_ID);
      assert(result.status === 'FAILED', 'Status is FAILED');
      assert(result.failureReason === 'Test failure', 'failureReason present');
      assert(result.profile === null, 'Profile is forced null on FAILED');
      assert(result.insights.length === 0, 'Insights are forced empty on FAILED');
    } finally {
      await prisma.dataset.delete({ where: { id } });
    }
  }

  // Test 22-25: In-progress statuses
  {
    console.log('Test 22-25: In-progress state rejections...');
    const statuses: DatasetStatus[] = ['UPLOADED', 'MAPPING_REQUIRED', 'MAPPED', 'PROCESSING'];
    for (const st of statuses) {
      const id = await setupDataset(st, false, 0);
      try {
        let threw = false;
        try {
          await datasetService.getDatasetIntelligence(id, ORG_ID);
        } catch (e) {
          if (e instanceof DatasetStateError) threw = true;
        }
        assert(threw, `Throws DatasetStateError for ${st}`);
      } finally {
        await prisma.dataset.delete({ where: { id } });
      }
    }
  }

  // Test 26-27: Nonexistent or wrong tenant
  {
    console.log('Test 26-27: Tenant isolation...');
    const id = await setupDataset('READY', true, 0);
    
    try {
      let threwWrongOrg = false;
      try {
        await datasetService.getDatasetIntelligence(id, 'wrong-org');
      } catch (e) {
        if (e instanceof DatasetNotFoundError) threwWrongOrg = true;
      }
      assert(threwWrongOrg, 'Throws DatasetNotFoundError for wrong org');

      let threwMissing = false;
      try {
        await datasetService.getDatasetIntelligence('missing-id', ORG_ID);
      } catch (e) {
        if (e instanceof DatasetNotFoundError) threwMissing = true;
      }
      assert(threwMissing, 'Throws DatasetNotFoundError for missing id');
    } finally {
      await prisma.dataset.delete({ where: { id } });
    }
  }

  console.log('All Intelligence Retrieval tests passed!');
}

runTests()
  .catch(e => {
    console.error('Test suite failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
