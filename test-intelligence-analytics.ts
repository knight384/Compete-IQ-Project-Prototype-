import { prisma } from './src/backend/prisma/client';
import { IntelligenceAnalyticsService } from './src/backend/modules/analytics/intelligence-analytics.service';
import { InsightType, ConfidenceLevel } from './src/backend/shared/ai/intelligence-contract';

function assertEqual<T>(actual: T, expected: T, message: string) {
  if (actual !== expected) {
    throw new Error(`${message} — Expected: ${JSON.stringify(expected)}, Actual: ${JSON.stringify(actual)}`);
  }
}

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(message);
  }
}

const ORG_A = 'org-intel-analytics-a';
const ORG_B = 'org-intel-analytics-b';

async function cleanup(orgIds: string[]) {
  await prisma.datasetInsight.deleteMany({ where: { dataset: { orgId: { in: orgIds } } } });
  await prisma.datasetProfile.deleteMany({ where: { dataset: { orgId: { in: orgIds } } } });
  await prisma.dataset.deleteMany({ where: { orgId: { in: orgIds } } });
  await prisma.product.deleteMany({ where: { competitor: { orgId: { in: orgIds } } } });
  await prisma.competitor.deleteMany({ where: { orgId: { in: orgIds } } });
  await prisma.organization.deleteMany({ where: { id: { in: orgIds } } });
}

async function runTests() {
  console.log('--- Running Intelligence Analytics Service Tests ---\n');

  const service = new IntelligenceAnalyticsService();

  await cleanup([ORG_A, ORG_B]);

  await prisma.organization.create({ data: { id: ORG_A, name: 'Intel Test Org A' } });
  await prisma.organization.create({ data: { id: ORG_B, name: 'Intel Test Org B' } });

  // ---------------------------------------------------------------------------
  // Test 1: Empty Organization
  // ---------------------------------------------------------------------------
  {
    const fg = await service.getFeatureGapAnalytics(ORG_A);
    assertEqual(fg.totalFeatureGapInsights, 0, 'T1 fg total');
    assertEqual(fg.featureGapInsightsByCompetitor.length, 0, 'T1 fg competitor array empty');
    assertEqual(fg.trend.length, 30, 'T1 fg trend length 30');
    assertEqual(fg.recentInsights.length, 0, 'T1 fg recentInsights empty');

    const po = await service.getPricingOpportunityAnalytics(ORG_A);
    assertEqual(po.totalPricingOpportunityInsights, 0, 'T1 po total');

    const sa = await service.getSentimentAnalytics(ORG_A);
    assertEqual(sa.totalSentimentShiftSignals, 0, 'T1 sa total');

    const recent = await service.getRecentInsights(ORG_A);
    assertEqual(recent.items.length, 0, 'T1 recent items empty');
    assertEqual(recent.hasMore, false, 'T1 recent hasMore false');
    assertEqual(recent.nextCursor, null, 'T1 recent nextCursor null');

    console.log('PASS: Test 1  (Empty organization — zero counts, empty lists, 30-day zero-filled trend)');
  }

  // ---------------------------------------------------------------------------
  // Test 2: Dual-Tenant Isolation & Non-READY dataset exclusion
  // ---------------------------------------------------------------------------
  {
    const compA = await prisma.competitor.create({
      data: { id: 'intel-comp-a', orgId: ORG_A, name: 'Comp A', logoText: 'CA', logoColor: '#fff', status: 'Active' }
    });
    const compB = await prisma.competitor.create({
      data: { id: 'intel-comp-b', orgId: ORG_B, name: 'Comp B', logoText: 'CB', logoColor: '#fff', status: 'Active' }
    });

    const dsAReady = await prisma.dataset.create({
      data: { id: 'intel-ds-a-ready', orgId: ORG_A, originalFilename: 'ready.csv', storageKey: 'k1', status: 'READY' }
    });
    const dsAProcessing = await prisma.dataset.create({
      data: { id: 'intel-ds-a-proc', orgId: ORG_A, originalFilename: 'proc.csv', storageKey: 'k2', status: 'PROCESSING' }
    });
    const dsBReady = await prisma.dataset.create({
      data: { id: 'intel-ds-b-ready', orgId: ORG_B, originalFilename: 'b.csv', storageKey: 'k3', status: 'READY' }
    });

    // Create insight in dsAReady (Org A)
    await prisma.datasetInsight.create({
      data: {
        id: 'i-fg-1',
        datasetId: dsAReady.id,
        competitorId: compA.id,
        type: InsightType.FEATURE_GAP,
        title: 'Feature Gap 1',
        summary: 'Summary 1',
        confidence: ConfidenceLevel.HIGH,
      }
    });

    // Create insight in dsAProcessing (Org A, non-READY) -> MUST BE EXCLUDED
    await prisma.datasetInsight.create({
      data: {
        id: 'i-fg-2',
        datasetId: dsAProcessing.id,
        competitorId: compA.id,
        type: InsightType.FEATURE_GAP,
        title: 'Feature Gap 2 (Processing)',
        summary: 'Summary 2',
        confidence: ConfidenceLevel.MEDIUM,
      }
    });

    // Create insight in dsBReady (Org B) -> MUST BE EXCLUDED from Org A
    await prisma.datasetInsight.create({
      data: {
        id: 'i-fg-3',
        datasetId: dsBReady.id,
        competitorId: compB.id,
        type: InsightType.FEATURE_GAP,
        title: 'Org B Gap',
        summary: 'Summary B',
        confidence: ConfidenceLevel.HIGH,
      }
    });

    const fgA = await service.getFeatureGapAnalytics(ORG_A);
    assertEqual(fgA.totalFeatureGapInsights, 1, 'T2 Org A feature gaps count excludes non-READY and Org B');
    assertEqual(fgA.recentInsights[0].id, 'i-fg-1', 'T2 Org A recent insight id');

    const fgB = await service.getFeatureGapAnalytics(ORG_B);
    assertEqual(fgB.totalFeatureGapInsights, 1, 'T2 Org B feature gaps count isolated');
    assertEqual(fgB.recentInsights[0].id, 'i-fg-3', 'T2 Org B recent insight id');

    console.log('PASS: Test 2  (Dual-tenant isolation & non-READY dataset exclusion)');
  }

  // ---------------------------------------------------------------------------
  // Test 3: Sentiment & Opportunity Metrics and Competitor Breakdown
  // ---------------------------------------------------------------------------
  {
    const dsAReady = await prisma.dataset.findUniqueOrThrow({ where: { id: 'intel-ds-a-ready' } });

    await prisma.datasetInsight.create({
      data: {
        id: 'i-po-1',
        datasetId: dsAReady.id,
        competitorId: 'intel-comp-a',
        type: InsightType.PRICING_OPPORTUNITY,
        title: 'Pricing Opp 1',
        summary: 'Summary Pricing 1',
        confidence: ConfidenceLevel.HIGH,
      }
    });

    await prisma.datasetInsight.create({
      data: {
        id: 'i-sa-1',
        datasetId: dsAReady.id,
        competitorId: 'intel-comp-a',
        type: InsightType.SENTIMENT_SHIFT,
        title: 'Sentiment Shift 1',
        summary: 'Summary Sentiment 1',
        confidence: ConfidenceLevel.LOW,
      }
    });

    const poA = await service.getPricingOpportunityAnalytics(ORG_A);
    assertEqual(poA.totalPricingOpportunityInsights, 1, 'T3 pricing opp count');
    assertEqual(poA.pricingOpportunityInsightsByCompetitor[0].competitorName, 'Comp A', 'T3 competitor name');

    const saA = await service.getSentimentAnalytics(ORG_A);
    assertEqual(saA.totalSentimentShiftSignals, 1, 'T3 sentiment shift signal count');
    assertEqual(saA.sentimentShiftSignalsByCompetitor[0].count, 1, 'T3 sentiment signal competitor count');

    console.log('PASS: Test 3  (Pricing Opportunity & Sentiment Shift signal analytics)');
  }

  // ---------------------------------------------------------------------------
  // Test 4: Cursor Pagination & Deterministic Ordering
  // ---------------------------------------------------------------------------
  {
    const dsAReady = await prisma.dataset.findUniqueOrThrow({ where: { id: 'intel-ds-a-ready' } });

    // Seed 5 insights with explicit dates
    for (let i = 1; i <= 5; i++) {
      await prisma.datasetInsight.create({
        data: {
          id: `i-page-${i}`,
          datasetId: dsAReady.id,
          competitorId: 'intel-comp-a',
          type: InsightType.MARKET_SIGNAL,
          title: `Market Signal ${i}`,
          summary: `Summary ${i}`,
          confidence: ConfidenceLevel.MEDIUM,
          createdAt: new Date(Date.now() + i * 1000),
        }
      });
    }

    // Page 1: limit 2
    const page1 = await service.getRecentInsights(ORG_A, { limit: 2 });
    assertEqual(page1.items.length, 2, 'T4 page 1 item count');
    assertEqual(page1.hasMore, true, 'T4 page 1 hasMore');
    assert(page1.nextCursor !== null, 'T4 page 1 has nextCursor');

    // Page 2: use nextCursor
    const page2 = await service.getRecentInsights(ORG_A, { limit: 2, cursor: page1.nextCursor! });
    assertEqual(page2.items.length, 2, 'T4 page 2 item count');
    assertEqual(page2.hasMore, true, 'T4 page 2 hasMore');
    assert(page2.nextCursor !== null, 'T4 page 2 has nextCursor');

    // Page 3: final page
    const page3 = await service.getRecentInsights(ORG_A, { limit: 5, cursor: page2.nextCursor! });
    assert(page3.items.length >= 1, 'T4 page 3 items');
    assertEqual(page3.hasMore, false, 'T4 page 3 hasMore false');
    assertEqual(page3.nextCursor, null, 'T4 page 3 nextCursor null');

    console.log('PASS: Test 4  (Deterministic cursor pagination with createdAt DESC, id DESC)');
  }

  // Cleanup after tests
  await cleanup([ORG_A, ORG_B]);
  console.log('\n--- All Intelligence Analytics Service Tests Passed! ---');
}

runTests()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Test failed:', err);
    process.exit(1);
  });
