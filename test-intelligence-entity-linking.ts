import { prisma } from './src/backend/prisma/client';
import { datasetService } from './src/backend/modules/datasets/dataset.service';
import { AiIntelligenceProvider } from './src/backend/shared/ai/ai-provider';
import { StructuredIntelligenceResult, InsightType, ConfidenceLevel } from './src/backend/shared/ai/intelligence-contract';
import { IntelligenceContext } from './src/backend/modules/datasets/dataset-intelligence-context';
import fs from 'fs';
import path from 'path';

function assertEqual<T>(actual: T, expected: T, message: string) {
  if (actual !== expected) {
    throw new Error(`${message} - Expected: ${expected}, Actual: ${actual}`);
  }
}

class MockAiProvider implements AiIntelligenceProvider {
  constructor(private resultToReturn: StructuredIntelligenceResult) {}

  async generateInsights(_context: IntelligenceContext): Promise<StructuredIntelligenceResult> {
    return this.resultToReturn;
  }
}

async function runTests() {
  console.log('--- Running Automatic Insight Entity Linking Tests ---\n');

  const orgAId = 'org-test-linking-a';
  const orgBId = 'org-test-linking-b';

  // Clean up database & temp upload files for test orgs
  const uploadsDir = path.join(process.cwd(), '.uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const existingDatasets = await prisma.dataset.findMany({
    where: { orgId: { in: [orgAId, orgBId] } },
    select: { storageKey: true }
  });
  for (const ds of existingDatasets) {
    const fPath = path.join(uploadsDir, ds.storageKey);
    if (fs.existsSync(fPath)) {
      try { fs.unlinkSync(fPath); } catch {}
    }
  }

  await prisma.datasetInsight.deleteMany({ where: { dataset: { orgId: { in: [orgAId, orgBId] } } } });
  await prisma.datasetProfile.deleteMany({ where: { dataset: { orgId: { in: [orgAId, orgBId] } } } });
  await prisma.dataset.deleteMany({ where: { orgId: { in: [orgAId, orgBId] } } });
  await prisma.product.deleteMany({ where: { competitor: { orgId: { in: [orgAId, orgBId] } } } });
  await prisma.competitor.deleteMany({ where: { orgId: { in: [orgAId, orgBId] } } });
  await prisma.organization.deleteMany({ where: { id: { in: [orgAId, orgBId] } } });

  // Create Organizations
  await prisma.organization.create({ data: { id: orgAId, name: 'Linking Test Org A' } });
  await prisma.organization.create({ data: { id: orgBId, name: 'Linking Test Org B' } });

  // Create Competitors in Org A
  const compA1 = await prisma.competitor.create({
    data: { id: 'comp-a1', orgId: orgAId, name: 'Acme Corp', domain: 'acme.com', logoText: 'A1', logoColor: '#000', status: 'Active' }
  });

  const compA2 = await prisma.competitor.create({
    data: { id: 'comp-a2', orgId: orgAId, name: 'Beta Inc', domain: 'beta.com', logoText: 'A2', logoColor: '#111', status: 'Active' }
  });

  const compADup1 = await prisma.competitor.create({
    data: { id: 'comp-adup1', orgId: orgAId, name: 'Ambiguous Corp', domain: 'amb1.com', logoText: 'AD1', logoColor: '#222', status: 'Active' }
  });
  await prisma.competitor.create({
    data: { id: 'comp-adup2', orgId: orgAId, name: 'Ambiguous Corp', domain: 'amb2.com', logoText: 'AD2', logoColor: '#333', status: 'Active' }
  });

  // Create Competitor in Org B
  const compB1 = await prisma.competitor.create({
    data: { id: 'comp-b1', orgId: orgBId, name: 'Foreign Corp', domain: 'foreign.com', logoText: 'B1', logoColor: '#444', status: 'Active' }
  });

  // Create Products
  const prodA1 = await prisma.product.create({
    data: { id: 'prod-a1', name: 'CloudPro', competitorId: compA1.id }
  });

  const prodA2 = await prisma.product.create({
    data: { id: 'prod-a2', name: 'BetaPro', competitorId: compA2.id }
  });

  const prodADup1 = await prisma.product.create({
    data: { id: 'prod-adup1', name: 'SharedApp', competitorId: compA1.id }
  });
  await prisma.product.create({
    data: { id: 'prod-adup2', name: 'SharedApp', competitorId: compA2.id }
  });

  const prodB1 = await prisma.product.create({
    data: { id: 'prod-b1', name: 'ForeignPro', competitorId: compB1.id }
  });

  // Helper to create a mapped dataset with physical file on disk
  async function createMappedDataset(datasetId: string, orgId: string) {
    const storageKey = `test-linking-key-${datasetId}`;
    const filePath = path.join(uploadsDir, storageKey);
    fs.writeFileSync(filePath, 'Competitor,Product\nAcme Corp,CloudPro');

    return prisma.dataset.create({
      data: {
        id: datasetId,
        orgId,
        originalFilename: 'test.csv',
        storageKey,
        format: 'CSV',
        mimeType: 'text/csv',
        fileSize: 100,
        status: 'MAPPED',
        semanticMapping: {
          version: 1,
          columns: [
            { sourceColumn: 'Competitor', semanticField: 'COMPETITOR_NAME' },
            { sourceColumn: 'Product', semanticField: 'PRODUCT_NAME' }
          ]
        } as any
      }
    });
  }

  // Test 1: Resolved competitor + product under same competitor
  {
    const datasetId = 'ds-test-1';
    await createMappedDataset(datasetId, orgAId);

    const mockAiResult: StructuredIntelligenceResult = {
      version: 1,
      insights: [
        {
          type: InsightType.FEATURE_GAP,
          title: 'Acme CloudPro Gap',
          summary: 'CloudPro lacks feature X',
          confidence: ConfidenceLevel.HIGH,
          evidence: { sourceColumns: ['Competitor'], sampleRowIndices: [0] },
          targetCompetitorName: 'Acme Corp',
          targetProductName: 'CloudPro'
        }
      ]
    };

    (datasetService as any).getAiProvider = () => new MockAiProvider(mockAiResult);

    await datasetService.generateDatasetIntelligence(datasetId, orgAId);

    const intelDto = await datasetService.getDatasetIntelligence(datasetId, orgAId);
    assertEqual(intelDto.insights.length, 1, 'Test 1 insight count');
    assertEqual(intelDto.insights[0].competitorId, compA1.id, 'Test 1 competitorId');
    assertEqual(intelDto.insights[0].productId, prodA1.id, 'Test 1 productId');
    console.log('PASS: Test 1 (Resolved competitor + product under same competitor)');
  }

  // Test 2: Resolved competitor + product belonging to another competitor -> productId null
  {
    const datasetId = 'ds-test-2';
    await createMappedDataset(datasetId, orgAId);

    const mockAiResult: StructuredIntelligenceResult = {
      version: 1,
      insights: [
        {
          type: InsightType.COMPETITOR_TREND,
          title: 'Acme BetaPro Mismatch',
          summary: 'Acme does not own BetaPro',
          confidence: ConfidenceLevel.MEDIUM,
          evidence: { sourceColumns: ['Competitor'], sampleRowIndices: [0] },
          targetCompetitorName: 'Acme Corp',
          targetProductName: 'BetaPro'
        }
      ]
    };

    (datasetService as any).getAiProvider = () => new MockAiProvider(mockAiResult);

    await datasetService.generateDatasetIntelligence(datasetId, orgAId);

    const intelDto = await datasetService.getDatasetIntelligence(datasetId, orgAId);
    assertEqual(intelDto.insights[0].competitorId, compA1.id, 'Test 2 competitorId');
    assertEqual(intelDto.insights[0].productId, null, 'Test 2 productId should be null when product belongs to another competitor');
    console.log('PASS: Test 2 (Resolved competitor + product under another competitor)');
  }

  // Test 3: Unresolved competitor + otherwise globally resolvable product -> both null (NO org-wide fallback!)
  {
    const datasetId = 'ds-test-3';
    await createMappedDataset(datasetId, orgAId);

    const mockAiResult: StructuredIntelligenceResult = {
      version: 1,
      insights: [
        {
          type: InsightType.PRODUCT_OBSERVATION,
          title: 'Unknown Comp CloudPro',
          summary: 'Unknown competitor mentioned',
          confidence: ConfidenceLevel.LOW,
          evidence: { sourceColumns: ['Competitor'], sampleRowIndices: [0] },
          targetCompetitorName: 'Unknown Corp Nonexistent',
          targetProductName: 'CloudPro'
        }
      ]
    };

    (datasetService as any).getAiProvider = () => new MockAiProvider(mockAiResult);

    await datasetService.generateDatasetIntelligence(datasetId, orgAId);

    const intelDto = await datasetService.getDatasetIntelligence(datasetId, orgAId);
    assertEqual(intelDto.insights[0].competitorId, null, 'Test 3 competitorId should be null');
    assertEqual(intelDto.insights[0].productId, null, 'Test 3 productId should be null (no fallback when competitor mention is present)');
    console.log('PASS: Test 3 (Unresolved competitor prevents product fallback)');
  }

  // Test 4: Ambiguous competitor + product -> both null
  {
    const datasetId = 'ds-test-4';
    await createMappedDataset(datasetId, orgAId);

    const mockAiResult: StructuredIntelligenceResult = {
      version: 1,
      insights: [
        {
          type: InsightType.GENERAL,
          title: 'Ambiguous Competitor Insight',
          summary: 'Multiple competitors named Ambiguous Corp',
          confidence: ConfidenceLevel.MEDIUM,
          evidence: { sourceColumns: ['Competitor'], sampleRowIndices: [0] },
          targetCompetitorName: 'Ambiguous Corp',
          targetProductName: 'SharedApp'
        }
      ]
    };

    (datasetService as any).getAiProvider = () => new MockAiProvider(mockAiResult);

    await datasetService.generateDatasetIntelligence(datasetId, orgAId);

    const intelDto = await datasetService.getDatasetIntelligence(datasetId, orgAId);
    assertEqual(intelDto.insights[0].competitorId, null, 'Test 4 competitorId should be null due to ambiguity');
    assertEqual(intelDto.insights[0].productId, null, 'Test 4 productId should be null');
    console.log('PASS: Test 4 (Ambiguous competitor prevents product resolution)');
  }

  // Test 5: Product-only mention uniquely resolves -> both productId AND parent competitorId populated
  {
    const datasetId = 'ds-test-5';
    await createMappedDataset(datasetId, orgAId);

    const mockAiResult: StructuredIntelligenceResult = {
      version: 1,
      insights: [
        {
          type: InsightType.PRICING_OPPORTUNITY,
          title: 'BetaPro Pricing',
          summary: 'BetaPro has competitive pricing',
          confidence: ConfidenceLevel.HIGH,
          evidence: { sourceColumns: ['Product'], sampleRowIndices: [0] },
          targetCompetitorName: undefined,
          targetProductName: 'BetaPro'
        }
      ]
    };

    (datasetService as any).getAiProvider = () => new MockAiProvider(mockAiResult);

    await datasetService.generateDatasetIntelligence(datasetId, orgAId);

    const intelDto = await datasetService.getDatasetIntelligence(datasetId, orgAId);
    assertEqual(intelDto.insights[0].productId, prodA2.id, 'Test 5 productId resolved');
    assertEqual(intelDto.insights[0].competitorId, compA2.id, 'Test 5 competitorId inherited from product parent');
    console.log('PASS: Test 5 (Product-only mention uniquely resolves and inherits parent competitorId)');
  }

  // Test 6: Product-only ambiguous mention -> both null
  {
    const datasetId = 'ds-test-6';
    await createMappedDataset(datasetId, orgAId);

    const mockAiResult: StructuredIntelligenceResult = {
      version: 1,
      insights: [
        {
          type: InsightType.SENTIMENT_SHIFT,
          title: 'SharedApp Sentiment',
          summary: 'SharedApp is under compA1 and compA2',
          confidence: ConfidenceLevel.MEDIUM,
          evidence: { sourceColumns: ['Product'], sampleRowIndices: [0] },
          targetProductName: 'SharedApp'
        }
      ]
    };

    (datasetService as any).getAiProvider = () => new MockAiProvider(mockAiResult);

    await datasetService.generateDatasetIntelligence(datasetId, orgAId);

    const intelDto = await datasetService.getDatasetIntelligence(datasetId, orgAId);
    assertEqual(intelDto.insights[0].productId, null, 'Test 6 productId null due to product ambiguity in org');
    assertEqual(intelDto.insights[0].competitorId, null, 'Test 6 competitorId null');
    console.log('PASS: Test 6 (Product-only ambiguous mention remains unlinked)');
  }

  // Test 7: Cross-tenant product-only mention -> both null
  {
    const datasetId = 'ds-test-7';
    await createMappedDataset(datasetId, orgAId);

    const mockAiResult: StructuredIntelligenceResult = {
      version: 1,
      insights: [
        {
          type: InsightType.MARKET_SIGNAL,
          title: 'ForeignPro Signal',
          summary: 'ForeignPro belongs to Org B',
          confidence: ConfidenceLevel.HIGH,
          evidence: { sourceColumns: ['Product'], sampleRowIndices: [0] },
          targetProductName: 'ForeignPro'
        }
      ]
    };

    (datasetService as any).getAiProvider = () => new MockAiProvider(mockAiResult);

    await datasetService.generateDatasetIntelligence(datasetId, orgAId);

    const intelDto = await datasetService.getDatasetIntelligence(datasetId, orgAId);
    assertEqual(intelDto.insights[0].productId, null, 'Test 7 productId null due to tenant isolation');
    assertEqual(intelDto.insights[0].competitorId, null, 'Test 7 competitorId null due to tenant isolation');
    console.log('PASS: Test 7 (Cross-tenant product-only mention remains unlinked)');
  }

  // Test 8: AI insight with no target entity mentions -> both null
  {
    const datasetId = 'ds-test-8';
    await createMappedDataset(datasetId, orgAId);

    const mockAiResult: StructuredIntelligenceResult = {
      version: 1,
      insights: [
        {
          type: InsightType.GENERAL,
          title: 'General Industry Trend',
          summary: 'Market adoption is increasing',
          confidence: ConfidenceLevel.HIGH,
          evidence: { sourceColumns: ['Competitor'], sampleRowIndices: [0] }
        }
      ]
    };

    (datasetService as any).getAiProvider = () => new MockAiProvider(mockAiResult);

    await datasetService.generateDatasetIntelligence(datasetId, orgAId);

    const intelDto = await datasetService.getDatasetIntelligence(datasetId, orgAId);
    assertEqual(intelDto.insights[0].competitorId, null, 'Test 8 competitorId null for general insight');
    assertEqual(intelDto.insights[0].productId, null, 'Test 8 productId null for general insight');
    console.log('PASS: Test 8 (AI insight with no target entity mentions remains unlinked)');
  }

  // Test 9: Malformed / ultra-long target entity mentions -> both null (fails closed)
  {
    const datasetId = 'ds-test-9';
    await createMappedDataset(datasetId, orgAId);

    const mockAiResult: StructuredIntelligenceResult = {
      version: 1,
      insights: [
        {
          type: InsightType.GENERAL,
          title: 'Malformed Mention Insight',
          summary: 'Malformed mention string',
          confidence: ConfidenceLevel.LOW,
          evidence: { sourceColumns: ['Competitor'], sampleRowIndices: [0] },
          targetCompetitorName: '   '
        }
      ]
    };

    (datasetService as any).getAiProvider = () => new MockAiProvider(mockAiResult);

    await datasetService.generateDatasetIntelligence(datasetId, orgAId);

    const intelDto = await datasetService.getDatasetIntelligence(datasetId, orgAId);
    assertEqual(intelDto.insights[0].competitorId, null, 'Test 9 competitorId null for whitespace mention');
    assertEqual(intelDto.insights[0].productId, null, 'Test 9 productId null');
    console.log('PASS: Test 9 (Malformed target entity mentions fail closed)');
  }

  // Test 10: Verify PostgreSQL Database Persistence of Foreign Keys
  {
    const dbInsight = await prisma.datasetInsight.findFirst({
      where: { datasetId: 'ds-test-1' }
    });
    assertEqual(dbInsight?.competitorId, compA1.id, 'DB Persistence competitorId');
    assertEqual(dbInsight?.productId, prodA1.id, 'DB Persistence productId');
    console.log('PASS: Test 10 (Database persistence of competitorId and productId verified)');
  }

  // Clean up database & temp upload files
  const cleanupDatasets = await prisma.dataset.findMany({
    where: { orgId: { in: [orgAId, orgBId] } },
    select: { storageKey: true }
  });
  for (const ds of cleanupDatasets) {
    const fPath = path.join(uploadsDir, ds.storageKey);
    if (fs.existsSync(fPath)) {
      try { fs.unlinkSync(fPath); } catch {}
    }
  }

  await prisma.datasetInsight.deleteMany({ where: { dataset: { orgId: { in: [orgAId, orgBId] } } } });
  await prisma.datasetProfile.deleteMany({ where: { dataset: { orgId: { in: [orgAId, orgBId] } } } });
  await prisma.dataset.deleteMany({ where: { orgId: { in: [orgAId, orgBId] } } });
  await prisma.product.deleteMany({ where: { competitor: { orgId: { in: [orgAId, orgBId] } } } });
  await prisma.competitor.deleteMany({ where: { orgId: { in: [orgAId, orgBId] } } });
  await prisma.organization.deleteMany({ where: { id: { in: [orgAId, orgBId] } } });

  console.log('\nAll 10 Automatic Insight Entity Linking test scenarios passed successfully!');
  await prisma.$disconnect();
  process.exit(0);
}

runTests().catch(async (err) => {
  console.error(err);
  await prisma.$disconnect();
  process.exit(1);
});
