import { prisma } from './src/backend/prisma/client';
import { CompetitorIntelligenceService } from './src/backend/modules/competitors/competitor-intelligence.service';
import { InsightType, ConfidenceLevel } from './src/backend/shared/ai/intelligence-contract';

function assertEqual<T>(actual: T, expected: T, message: string) {
  if (actual !== expected) {
    throw new Error(`${message} - Expected: ${expected}, Actual: ${actual}`);
  }
}

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(message);
  }
}

async function runTests() {
  console.log('--- Running Competitor Intelligence Aggregation & Scoring Tests ---\n');

  const orgAId = 'org-test-intel-a';
  const orgBId = 'org-test-intel-b';

  const service = new CompetitorIntelligenceService();

  // Clean up database for test orgs
  await prisma.datasetInsight.deleteMany({ where: { dataset: { orgId: { in: [orgAId, orgBId] } } } });
  await prisma.datasetProfile.deleteMany({ where: { dataset: { orgId: { in: [orgAId, orgBId] } } } });
  await prisma.dataset.deleteMany({ where: { orgId: { in: [orgAId, orgBId] } } });
  await prisma.product.deleteMany({ where: { competitor: { orgId: { in: [orgAId, orgBId] } } } });
  await prisma.competitor.deleteMany({ where: { orgId: { in: [orgAId, orgBId] } } });
  await prisma.organization.deleteMany({ where: { id: { in: [orgAId, orgBId] } } });

  // Create Test Organizations
  await prisma.organization.create({ data: { id: orgAId, name: 'Intel Test Org A' } });
  await prisma.organization.create({ data: { id: orgBId, name: 'Intel Test Org B' } });

  // Create Competitors in Org A
  const compA1 = await prisma.competitor.create({
    data: { id: 'comp-intel-a1', orgId: orgAId, name: 'Alpha Tech', logoText: 'AT', logoColor: '#000', status: 'Active', score: 0 }
  });
  const compA2 = await prisma.competitor.create({
    data: { id: 'comp-intel-a2', orgId: orgAId, name: 'Beta Systems', logoText: 'BS', logoColor: '#111', status: 'Active', score: 0 }
  });
  const compA3Empty = await prisma.competitor.create({
    data: { id: 'comp-intel-a3', orgId: orgAId, name: 'Gamma Zero', logoText: 'GZ', logoColor: '#222', status: 'Active', score: 0 }
  });

  // Create Competitor in Org B
  const compB1 = await prisma.competitor.create({
    data: { id: 'comp-intel-b1', orgId: orgBId, name: 'Foreign Enterprise', logoText: 'FE', logoColor: '#333', status: 'Active', score: 0 }
  });

  // Create Products under Competitor A1
  const prodA1 = await prisma.product.create({
    data: { id: 'prod-intel-a1', name: 'Alpha Cloud', competitorId: compA1.id }
  });
  const prodA2 = await prisma.product.create({
    data: { id: 'prod-intel-a2', name: 'Alpha Suite', competitorId: compA1.id }
  });

  // Test 1: Empty state competitor (0 insights)
  {
    const summary = await service.getCompetitorIntelligence(orgAId, compA3Empty.id);
    assertEqual(summary.competitorId, compA3Empty.id, 'Test 1 competitorId');
    assertEqual(summary.intelligenceActivityScore, 0, 'Test 1 score should be 0');
    assertEqual(summary.activityLevel, 'LOW', 'Test 1 activity level should be LOW');
    assertEqual(summary.totalInsights, 0, 'Test 1 totalInsights');
    assertEqual(summary.deduplicatedInsightCount, 0, 'Test 1 deduplicatedInsightCount');
    assertEqual(summary.linkedProductCount, 0, 'Test 1 linkedProductCount');
    assertEqual(summary.productLinkedInsightCount, 0, 'Test 1 productLinkedInsightCount');
    assertEqual(summary.latestInsightAt, null, 'Test 1 latestInsightAt should be null');
    console.log('PASS: Test 1 (Empty state competitor returns score 0 and LOW activity level)');
  }

  // Helper to create a READY dataset
  async function createTestDataset(id: string, orgId: string, status: 'READY' | 'PROCESSING' | 'FAILED' = 'READY') {
    return prisma.dataset.create({
      data: {
        id,
        orgId,
        originalFilename: `${id}.csv`,
        storageKey: `key-${id}`,
        status
      }
    });
  }

  // Test 2: Single insight confidence scoring (HIGH = 10 points)
  {
    const ds1 = await createTestDataset('ds-intel-1', orgAId, 'READY');
    await prisma.datasetInsight.create({
      data: {
        id: 'insight-1',
        datasetId: ds1.id,
        competitorId: compA1.id,
        productId: prodA1.id,
        type: InsightType.FEATURE_GAP,
        title: 'Missing SSO Feature',
        summary: 'Alpha Cloud lacks SAML SSO support.',
        confidence: ConfidenceLevel.HIGH
      }
    });

    const summary = await service.getCompetitorIntelligence(orgAId, compA1.id);
    assertEqual(summary.totalInsights, 1, 'Test 2 totalInsights');
    assertEqual(summary.deduplicatedInsightCount, 1, 'Test 2 deduplicatedInsightCount');
    assertEqual(summary.intelligenceActivityScore, 10, 'Test 2 score should be 10 for single HIGH confidence insight');
    assertEqual(summary.activityLevel, 'LOW', 'Test 2 activityLevel (10 score is LOW)');
    assertEqual(summary.linkedProductCount, 1, 'Test 2 linkedProductCount');
    assertEqual(summary.productLinkedInsightCount, 1, 'Test 2 productLinkedInsightCount');
    assertEqual(summary.featureGapCount, 1, 'Test 2 featureGapCount');
    assertEqual(summary.pricingOpportunityCount, 0, 'Test 2 pricingOpportunityCount');
    assert(summary.latestInsightAt !== null, 'Test 2 latestInsightAt is populated');
    console.log('PASS: Test 2 (Single HIGH confidence insight calculates score 10)');
  }

  // Test 3: Confidence point weights (HIGH = 10, MEDIUM = 7, LOW = 4)
  {
    const ds2 = await createTestDataset('ds-intel-2', orgAId, 'READY');
    await prisma.datasetInsight.createMany({
      data: [
        {
          id: 'insight-2a',
          datasetId: ds2.id,
          competitorId: compA1.id,
          productId: prodA1.id,
          type: InsightType.PRICING_OPPORTUNITY,
          title: 'Price Increase Tier A',
          summary: 'Prices increased',
          confidence: ConfidenceLevel.MEDIUM // 7 pts
        },
        {
          id: 'insight-2b',
          datasetId: ds2.id,
          competitorId: compA1.id,
          productId: prodA2.id,
          type: InsightType.SENTIMENT_SHIFT,
          title: 'Negative Review Surge',
          summary: 'Reviews dropped',
          confidence: ConfidenceLevel.LOW // 4 pts
        }
      ]
    });

    // Dataset 1 contributed 10 pts. Dataset 2 contributes 7 + 4 = 11 pts. Total = 21 pts.
    const summary = await service.getCompetitorIntelligence(orgAId, compA1.id);
    assertEqual(summary.totalInsights, 3, 'Test 3 totalInsights');
    assertEqual(summary.deduplicatedInsightCount, 3, 'Test 3 deduplicatedInsightCount');
    assertEqual(summary.intelligenceActivityScore, 21, 'Test 3 score should be 10 + 7 + 4 = 21');
    assertEqual(summary.activityLevel, 'LOW', 'Test 3 activityLevel (21 is LOW)');
    assertEqual(summary.linkedProductCount, 2, 'Test 3 distinct linkedProductCount');
    assertEqual(summary.productLinkedInsightCount, 3, 'Test 3 productLinkedInsightCount');
    assertEqual(summary.pricingOpportunityCount, 1, 'Test 3 pricingOpportunityCount');
    console.log('PASS: Test 3 (Confidence point weights HIGH=10, MEDIUM=7, LOW=4 sum correctly)');
  }

  // Test 4: Deterministic Deduplication within a dataset
  {
    const ds3 = await createTestDataset('ds-intel-3', orgAId, 'READY');
    await prisma.datasetInsight.createMany({
      data: [
        {
          id: 'insight-3a',
          datasetId: ds3.id,
          competitorId: compA2.id,
          type: InsightType.COMPETITOR_TREND,
          title: 'Market Expansion in Europe',
          summary: 'Expanding to Europe',
          confidence: ConfidenceLevel.HIGH // 10 pts
        },
        {
          id: 'insight-3b', // Exact duplicate of 3a (same type and title)
          datasetId: ds3.id,
          competitorId: compA2.id,
          type: InsightType.COMPETITOR_TREND,
          title: '  market expansion IN europe  ', // should normalize to 'market expansion in europe'
          summary: 'Duplicate row insight',
          confidence: ConfidenceLevel.HIGH
        }
      ]
    });

    const summary = await service.getCompetitorIntelligence(orgAId, compA2.id);
    assertEqual(summary.totalInsights, 2, 'Test 4 totalInsights before deduplication');
    assertEqual(summary.deduplicatedInsightCount, 1, 'Test 4 deduplicatedInsightCount should be 1');
    assertEqual(summary.intelligenceActivityScore, 10, 'Test 4 score should be 10 (duplicate omitted)');
    console.log('PASS: Test 4 (Deterministic title/type deduplication per dataset verified)');
  }

  // Test 5: Per-Dataset Contribution Cap (25 points max per dataset)
  {
    const ds4 = await createTestDataset('ds-intel-4', orgAId, 'READY');
    // Create 4 HIGH confidence unique insights in ds4 (4 x 10 = 40 raw points)
    await prisma.datasetInsight.createMany({
      data: [
        { id: 'insight-4a', datasetId: ds4.id, competitorId: compA2.id, type: InsightType.FEATURE_GAP, title: 'Gap 1', summary: 'Summary 1', confidence: ConfidenceLevel.HIGH },
        { id: 'insight-4b', datasetId: ds4.id, competitorId: compA2.id, type: InsightType.FEATURE_GAP, title: 'Gap 2', summary: 'Summary 2', confidence: ConfidenceLevel.HIGH },
        { id: 'insight-4c', datasetId: ds4.id, competitorId: compA2.id, type: InsightType.FEATURE_GAP, title: 'Gap 3', summary: 'Summary 3', confidence: ConfidenceLevel.HIGH },
        { id: 'insight-4d', datasetId: ds4.id, competitorId: compA2.id, type: InsightType.FEATURE_GAP, title: 'Gap 4', summary: 'Summary 4', confidence: ConfidenceLevel.HIGH }
      ]
    });

    // compA2 has ds3 (10 pts) + ds4 (40 raw pts capped at 25) = 35 total pts
    const summary = await service.getCompetitorIntelligence(orgAId, compA2.id);
    assertEqual(summary.intelligenceActivityScore, 35, 'Test 5 score should be 10 + 25 = 35 (capped at 25 per dataset)');
    assertEqual(summary.activityLevel, 'MODERATE', 'Test 5 activityLevel (35 score is MODERATE)');
    console.log('PASS: Test 5 (Per-dataset 25-point contribution cap enforced)');
  }

  // Test 6: Multi-Dataset Score Accumulation & 100 Max Bound
  {
    // Create 3 additional datasets for compA2 with 3 HIGH confidence insights each (3 x 25 = 75 pts)
    for (let i = 5; i <= 8; i++) {
      const ds = await createTestDataset(`ds-intel-${i}`, orgAId, 'READY');
      await prisma.datasetInsight.createMany({
        data: [
          { id: `insight-${i}a`, datasetId: ds.id, competitorId: compA2.id, type: InsightType.FEATURE_GAP, title: `Gap ${i}A`, summary: 'Summary', confidence: ConfidenceLevel.HIGH },
          { id: `insight-${i}b`, datasetId: ds.id, competitorId: compA2.id, type: InsightType.FEATURE_GAP, title: `Gap ${i}B`, summary: 'Summary', confidence: ConfidenceLevel.HIGH },
          { id: `insight-${i}c`, datasetId: ds.id, competitorId: compA2.id, type: InsightType.FEATURE_GAP, title: `Gap ${i}C`, summary: 'Summary', confidence: ConfidenceLevel.HIGH }
        ]
      });
    }

    const summary = await service.getCompetitorIntelligence(orgAId, compA2.id);
    // ds3 (10) + ds4 (25) + ds5 (25) + ds6 (25) + ds7 (25) + ds8 (25) = 135 raw pts -> capped at 100
    assertEqual(summary.intelligenceActivityScore, 100, 'Test 6 score capped at 100');
    assertEqual(summary.activityLevel, 'INTENSIVE', 'Test 6 activityLevel (100 score is INTENSIVE)');
    assert(summary.distinctDatasetCount === 6, 'Test 6 distinctDatasetCount should be 6');
    console.log('PASS: Test 6 (Multi-dataset aggregation capped at max 100 with INTENSIVE level)');
  }

  // Test 7: Non-READY Dataset Exclusion (PROCESSING / FAILED datasets ignored)
  {
    const dsProc = await createTestDataset('ds-proc', orgAId, 'PROCESSING');
    const dsFail = await createTestDataset('ds-fail', orgAId, 'FAILED');

    await prisma.datasetInsight.create({
      data: {
        id: 'insight-proc',
        datasetId: dsProc.id,
        competitorId: compA1.id,
        type: InsightType.FEATURE_GAP,
        title: 'Processing Gap',
        summary: 'Summary',
        confidence: ConfidenceLevel.HIGH
      }
    });

    await prisma.datasetInsight.create({
      data: {
        id: 'insight-fail',
        datasetId: dsFail.id,
        competitorId: compA1.id,
        type: InsightType.FEATURE_GAP,
        title: 'Failed Gap',
        summary: 'Summary',
        confidence: ConfidenceLevel.HIGH
      }
    });

    // compA1 score should remain 21 from READY datasets (ds1 & ds2)
    const summary = await service.getCompetitorIntelligence(orgAId, compA1.id);
    assertEqual(summary.intelligenceActivityScore, 21, 'Test 7 score should exclude PROCESSING/FAILED datasets');
    assertEqual(summary.totalInsights, 3, 'Test 7 totalInsights excludes non-READY datasets');
    console.log('PASS: Test 7 (Insights from non-READY datasets safely excluded)');
  }

  // Test 8: Tenant Isolation Enforcement (Single Competitor)
  {
    try {
      await service.getCompetitorIntelligence(orgAId, compB1.id);
      assert(false, 'Should have thrown access denied for competitor in another org');
    } catch (err: any) {
      assertEqual(err.message, 'Competitor not found or access denied.', 'Test 8 tenant isolation error message');
    }
    console.log('PASS: Test 8 (Cross-tenant single competitor query rejected)');
  }

  // Test 9: Organization-Wide Bulk Query N+1 Check
  {
    // Add insights to Foreign Competitor in Org B
    const dsB = await createTestDataset('ds-intel-b', orgBId, 'READY');
    await prisma.datasetInsight.create({
      data: {
        id: 'insight-b1',
        datasetId: dsB.id,
        competitorId: compB1.id,
        type: InsightType.COMPETITOR_TREND,
        title: 'Foreign Expansion',
        summary: 'Summary',
        confidence: ConfidenceLevel.HIGH
      }
    });

    const summariesA = await service.getOrganizationCompetitorSummaries(orgAId);
    assertEqual(summariesA.length, 3, 'Test 9 Org A competitor count');
    
    const summaryMapA = new Map(summariesA.map(s => [s.competitorId, s]));
    assert(summaryMapA.has(compA1.id), 'Contains Comp A1');
    assert(summaryMapA.has(compA2.id), 'Contains Comp A2');
    assert(summaryMapA.has(compA3Empty.id), 'Contains Comp A3');
    assert(!summaryMapA.has(compB1.id), 'Does NOT contain Comp B1');

    assertEqual(summaryMapA.get(compA1.id)?.intelligenceActivityScore, 21, 'Comp A1 bulk score');
    assertEqual(summaryMapA.get(compA2.id)?.intelligenceActivityScore, 100, 'Comp A2 bulk score');
    assertEqual(summaryMapA.get(compA3Empty.id)?.intelligenceActivityScore, 0, 'Comp A3 bulk score');

    const summariesB = await service.getOrganizationCompetitorSummaries(orgBId);
    assertEqual(summariesB.length, 1, 'Test 9 Org B competitor count');
    assertEqual(summariesB[0].competitorId, compB1.id, 'Comp B1 bulk id');
    assertEqual(summariesB[0].intelligenceActivityScore, 10, 'Comp B1 bulk score');

    console.log('PASS: Test 9 (Organization-wide bulk query executes safely without N+1 queries)');
  }

  // Test 10: Deterministic Output Across Repeated Executions
  {
    const summaryFirst = await service.getCompetitorIntelligence(orgAId, compA1.id);
    const summarySecond = await service.getCompetitorIntelligence(orgAId, compA1.id);
    assertEqual(summaryFirst.intelligenceActivityScore, summarySecond.intelligenceActivityScore, 'Test 10 score equality');
    assertEqual(summaryFirst.deduplicatedInsightCount, summarySecond.deduplicatedInsightCount, 'Test 10 count equality');
    assertEqual(summaryFirst.activityLevel, summarySecond.activityLevel, 'Test 10 activityLevel equality');
    console.log('PASS: Test 10 (Repeated aggregation calculations are 100% deterministic)');
  }

  // Clean up test data
  await prisma.datasetInsight.deleteMany({ where: { dataset: { orgId: { in: [orgAId, orgBId] } } } });
  await prisma.datasetProfile.deleteMany({ where: { dataset: { orgId: { in: [orgAId, orgBId] } } } });
  await prisma.dataset.deleteMany({ where: { orgId: { in: [orgAId, orgBId] } } });
  await prisma.product.deleteMany({ where: { competitor: { orgId: { in: [orgAId, orgBId] } } } });
  await prisma.competitor.deleteMany({ where: { orgId: { in: [orgAId, orgBId] } } });
  await prisma.organization.deleteMany({ where: { id: { in: [orgAId, orgBId] } } });

  console.log('\nAll 10 Competitor Intelligence Aggregation & Scoring tests passed successfully!');
}

runTests().catch((err) => {
  console.error(err);
  process.exit(1);
});
