import { prisma } from './src/backend/prisma/client';
import { DashboardAnalyticsService } from './src/backend/modules/analytics/dashboard-analytics.service';
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

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const ORG_A = 'org-dash-analytics-a';
const ORG_B = 'org-dash-analytics-b';

async function createCompetitor(id: string, orgId: string, name: string) {
  return prisma.competitor.create({
    data: { id, orgId, name, logoText: name.slice(0, 2).toUpperCase(), logoColor: '#000', status: 'Active', score: 0 },
  });
}

async function createDataset(id: string, orgId: string, status: 'READY' | 'PROCESSING' | 'FAILED' | 'UPLOADED' = 'READY') {
  return prisma.dataset.create({
    data: { id, orgId, originalFilename: `${id}.csv`, storageKey: `key-${id}`, status },
  });
}

async function createInsight(
  id: string,
  datasetId: string,
  competitorId: string,
  type: string,
  title: string,
  confidence: string,
  productId?: string
) {
  return prisma.datasetInsight.create({
    data: {
      id,
      datasetId,
      competitorId,
      productId: productId ?? null,
      type,
      title,
      summary: `Summary for ${title}`,
      confidence,
    },
  });
}

async function createProduct(id: string, competitorId: string, name: string) {
  return prisma.product.create({
    data: { id, competitorId, name },
  });
}

// ---------------------------------------------------------------------------
// Cleanup helpers
// ---------------------------------------------------------------------------

async function cleanup(orgIds: string[]) {
  await prisma.datasetInsight.deleteMany({ where: { dataset: { orgId: { in: orgIds } } } });
  await prisma.datasetProfile.deleteMany({ where: { dataset: { orgId: { in: orgIds } } } });
  await prisma.dataset.deleteMany({ where: { orgId: { in: orgIds } } });
  await prisma.product.deleteMany({ where: { competitor: { orgId: { in: orgIds } } } });
  await prisma.competitor.deleteMany({ where: { orgId: { in: orgIds } } });
  await prisma.organization.deleteMany({ where: { id: { in: orgIds } } });
}

// ---------------------------------------------------------------------------
// Test runner
// ---------------------------------------------------------------------------

async function runTests() {
  console.log('--- Running Dashboard Analytics Service Tests ---\n');

  const service = new DashboardAnalyticsService();

  // Initial cleanup
  await cleanup([ORG_A, ORG_B]);

  // Setup organizations
  await prisma.organization.create({ data: { id: ORG_A, name: 'Dashboard Test Org A' } });
  await prisma.organization.create({ data: { id: ORG_B, name: 'Dashboard Test Org B' } });

  // ---------------------------------------------------------------------------
  // Test 1: Empty organization — all fields are zero, arrays empty
  // ---------------------------------------------------------------------------
  {
    const result = await service.getDashboardAnalytics(ORG_A);

    assertEqual(result.competitorCount, 0, 'T1 competitorCount');
    assertEqual(result.competitorsWithIntelligenceCount, 0, 'T1 competitorsWithIntelligenceCount');
    assertEqual(result.totalInsights, 0, 'T1 totalInsights');
    assertEqual(result.totalPricingOpportunities, 0, 'T1 totalPricingOpportunities');
    assertEqual(result.totalFeatureGaps, 0, 'T1 totalFeatureGaps');
    assertEqual(result.avgIntelligenceActivityScore, 0, 'T1 avgIntelligenceActivityScore');
    assertEqual(result.topCompetitors.length, 0, 'T1 topCompetitors empty');
    assertEqual(result.totalDatasetCount, 0, 'T1 totalDatasetCount');
    assertEqual(result.readyDatasetCount, 0, 'T1 readyDatasetCount');
    assertEqual(result.datasetReadinessPercent, 0, 'T1 datasetReadinessPercent zero when no datasets');
    assertEqual(result.totalProductCount, 0, 'T1 totalProductCount');

    console.log('PASS: Test 1  (Empty organization — all fields zero, topCompetitors empty)');
  }

  // ---------------------------------------------------------------------------
  // Test 2: Single competitor, zero insights — competitorsWithIntelligenceCount = 0
  // ---------------------------------------------------------------------------
  {
    const comp1 = await createCompetitor('dash-comp-1', ORG_A, 'Alpha Corp');

    const result = await service.getDashboardAnalytics(ORG_A);

    assertEqual(result.competitorCount, 1, 'T2 competitorCount');
    assertEqual(result.competitorsWithIntelligenceCount, 0, 'T2 competitorsWithIntelligenceCount excludes zero-insight competitor');
    assertEqual(result.avgIntelligenceActivityScore, 0, 'T2 avg 0 when no intelligence');
    assertEqual(result.topCompetitors.length, 1, 'T2 topCompetitors contains zero-insight competitor');
    assertEqual(result.topCompetitors[0].competitorId, comp1.id, 'T2 topCompetitors[0] id');
    assertEqual(result.topCompetitors[0].intelligenceActivityScore, 0, 'T2 topCompetitors[0] score 0');

    console.log('PASS: Test 2  (Single competitor with zero insights — avg excludes zero-insight competitor)');
  }

  // ---------------------------------------------------------------------------
  // Test 3: avgIntelligenceActivityScore denominator = only competitors with intelligence
  // ---------------------------------------------------------------------------
  {
    const comp2 = await createCompetitor('dash-comp-2', ORG_A, 'Beta Systems');
    const comp3 = await createCompetitor('dash-comp-3', ORG_A, 'Gamma Zero');

    // Give comp2 insights (score will be 10), comp1 and comp3 remain at 0
    const ds1 = await createDataset('dash-ds-1', ORG_A, 'READY');
    await createInsight('dash-i-1', ds1.id, comp2.id, InsightType.FEATURE_GAP, 'Gap One', ConfidenceLevel.HIGH);

    const result = await service.getDashboardAnalytics(ORG_A);

    // 3 competitors total, only 1 has intelligence
    assertEqual(result.competitorCount, 3, 'T3 competitorCount');
    assertEqual(result.competitorsWithIntelligenceCount, 1, 'T3 denominator is 1 (only comp2)');
    // avg = comp2.score / 1 = 10
    assertEqual(result.avgIntelligenceActivityScore, 10, 'T3 avgScore uses denominator of 1, not 3');

    console.log('PASS: Test 3  (avgIntelligenceActivityScore excludes zero-insight competitors from denominator)');
  }

  // ---------------------------------------------------------------------------
  // Test 4: Multiple competitors — correct sum + round integer
  // ---------------------------------------------------------------------------
  {
    // Add insight to comp3 (score = 7 via MEDIUM)
    const ds2 = await createDataset('dash-ds-2', ORG_A, 'READY');
    await createInsight('dash-i-2', ds2.id, 'dash-comp-3', InsightType.PRICING_OPPORTUNITY, 'Pricing Gap', ConfidenceLevel.MEDIUM);

    const result = await service.getDashboardAnalytics(ORG_A);

    // comp2 = 10, comp3 = 7 → avg = Math.round(17/2) = 9 (integer)
    assertEqual(result.competitorsWithIntelligenceCount, 2, 'T4 denominator 2');
    assertEqual(result.avgIntelligenceActivityScore, 9, 'T4 avg = round(17/2) = 9');
    assert(Number.isInteger(result.avgIntelligenceActivityScore), 'T4 avg is integer');
    assert(result.avgIntelligenceActivityScore >= 0 && result.avgIntelligenceActivityScore <= 100, 'T4 avg in [0,100]');

    console.log('PASS: Test 4  (Multiple competitors — avg is rounded integer in [0,100])');
  }

  // ---------------------------------------------------------------------------
  // Test 5: totalPricingOpportunities and totalFeatureGaps sum correctly
  // ---------------------------------------------------------------------------
  {
    const result = await service.getDashboardAnalytics(ORG_A);

    // comp2 has 1 FEATURE_GAP insight. comp3 has 1 PRICING_OPPORTUNITY insight.
    assertEqual(result.totalFeatureGaps, 1, 'T5 totalFeatureGaps');
    assertEqual(result.totalPricingOpportunities, 1, 'T5 totalPricingOpportunities');
    assertEqual(result.totalInsights, 2, 'T5 totalInsights');

    console.log('PASS: Test 5  (totalFeatureGaps and totalPricingOpportunities sum correctly)');
  }

  // ---------------------------------------------------------------------------
  // Test 6: Dataset readiness — zero datasets → 0%
  // ---------------------------------------------------------------------------
  {
    const result = await service.getDashboardAnalytics(ORG_A);
    // ds1 and ds2 are READY; we have 2 READY, 2 total
    assertEqual(result.totalDatasetCount, 2, 'T6 totalDatasetCount');
    assertEqual(result.readyDatasetCount, 2, 'T6 readyDatasetCount');
    assertEqual(result.datasetReadinessPercent, 100, 'T6 100% when all READY');

    console.log('PASS: Test 6  (Dataset readiness 100% when all datasets are READY)');
  }

  // ---------------------------------------------------------------------------
  // Test 7: Mixed dataset statuses — readiness percentage correct
  // ---------------------------------------------------------------------------
  {
    await createDataset('dash-ds-proc', ORG_A, 'PROCESSING');
    await createDataset('dash-ds-failed', ORG_A, 'FAILED');

    const result = await service.getDashboardAnalytics(ORG_A);

    // 2 READY, 4 total → Math.round(2/4 * 100) = 50
    assertEqual(result.totalDatasetCount, 4, 'T7 totalDatasetCount');
    assertEqual(result.readyDatasetCount, 2, 'T7 readyDatasetCount');
    assertEqual(result.datasetReadinessPercent, 50, 'T7 readiness 50% for 2/4 READY');
    assert(Number.isInteger(result.datasetReadinessPercent), 'T7 datasetReadinessPercent is integer');

    console.log('PASS: Test 7  (Mixed dataset statuses — datasetReadinessPercent correct at 50%)');
  }

  // ---------------------------------------------------------------------------
  // Test 8: topCompetitors capped at 5
  // ---------------------------------------------------------------------------
  {
    // Create 5 more competitors (total 8 in ORG_A)
    for (let i = 4; i <= 8; i++) {
      await createCompetitor(`dash-comp-${i}`, ORG_A, `Competitor ${i}`);
    }

    const result = await service.getDashboardAnalytics(ORG_A);

    assertEqual(result.competitorCount, 8, 'T8 competitorCount');
    assert(result.topCompetitors.length <= 5, 'T8 topCompetitors capped at 5');
    assertEqual(result.topCompetitors.length, 5, 'T8 topCompetitors exactly 5');

    console.log('PASS: Test 8  (topCompetitors capped at maximum 5 entries)');
  }

  // ---------------------------------------------------------------------------
  // Test 9: topCompetitors tie-break — score DESC first
  // ---------------------------------------------------------------------------
  {
    // Add more insights to comp2 and comp3 so scores differ from extras
    const result = await service.getDashboardAnalytics(ORG_A);

    // Verify sorted by score DESC
    for (let i = 1; i < result.topCompetitors.length; i++) {
      assert(
        result.topCompetitors[i].intelligenceActivityScore <= result.topCompetitors[i - 1].intelligenceActivityScore,
        `T9 topCompetitors[${i}].score (${result.topCompetitors[i].intelligenceActivityScore}) <= [${i - 1}].score (${result.topCompetitors[i - 1].intelligenceActivityScore})`
      );
    }

    console.log('PASS: Test 9  (topCompetitors sorted by intelligenceActivityScore DESC)');
  }

  // ---------------------------------------------------------------------------
  // Test 10: topCompetitors tie-break — equal score, totalInsights DESC
  // ---------------------------------------------------------------------------
  {
    // Create fresh org to control tie scenario precisely
    const TIE_ORG = 'org-dash-tie';
    await cleanup([TIE_ORG]);
    await prisma.organization.create({ data: { id: TIE_ORG, name: 'Tie Test Org' } });

    const tieCompA = await createCompetitor('tie-comp-a', TIE_ORG, 'Zeta Corp');
    const tieCompB = await createCompetitor('tie-comp-b', TIE_ORG, 'Alpha Corp');

    const tieDs1 = await createDataset('tie-ds-1', TIE_ORG, 'READY');
    const tieDs2 = await createDataset('tie-ds-2', TIE_ORG, 'READY');

    // tieCompA: 1 insight (HIGH = 10pts)
    await createInsight('tie-i-a1', tieDs1.id, tieCompA.id, InsightType.FEATURE_GAP, 'Gap A1', ConfidenceLevel.HIGH);

    // tieCompB: 2 insights summing to 10pts (two MEDIUM insights = 7+4=11pts... too much)
    // Instead: 1 HIGH insight = 10pts for both, but tieCompB has 2 total raw insights
    // We need same score, more insights → tieCompB should appear first by totalInsights DESC
    await createInsight('tie-i-b1', tieDs2.id, tieCompB.id, InsightType.FEATURE_GAP, 'Gap B1 Unique', ConfidenceLevel.HIGH);
    // Add a duplicate to inflate totalInsights without changing score
    await createInsight('tie-i-b2', tieDs2.id, tieCompB.id, InsightType.FEATURE_GAP, 'Gap B1 Unique', ConfidenceLevel.HIGH);
    // Both have score 10; tieCompB has totalInsights=2, tieCompA has totalInsights=1

    const tieService = new DashboardAnalyticsService();
    const tieResult = await tieService.getDashboardAnalytics(TIE_ORG);

    assertEqual(tieResult.topCompetitors.length, 2, 'T10 two competitors');
    assertEqual(tieResult.topCompetitors[0].intelligenceActivityScore, tieResult.topCompetitors[1].intelligenceActivityScore, 'T10 tied scores');
    // tieCompB (2 insights) should precede tieCompA (1 insight)
    assertEqual(tieResult.topCompetitors[0].competitorId, tieCompB.id, 'T10 higher totalInsights wins tie');
    assertEqual(tieResult.topCompetitors[1].competitorId, tieCompA.id, 'T10 lower totalInsights is second');

    await cleanup([TIE_ORG]);
    console.log('PASS: Test 10 (topCompetitors tie-break: equal score → more totalInsights first)');
  }

  // ---------------------------------------------------------------------------
  // Test 11: topCompetitors tie-break — equal score + equal insights → name ASC
  // ---------------------------------------------------------------------------
  {
    const ALPHA_ORG = 'org-dash-alpha';
    await cleanup([ALPHA_ORG]);
    await prisma.organization.create({ data: { id: ALPHA_ORG, name: 'Alpha Sort Org' } });

    const alphaCompZ = await createCompetitor('alpha-comp-z', ALPHA_ORG, 'Zeta Ltd');
    const alphaCompA = await createCompetitor('alpha-comp-a', ALPHA_ORG, 'Alpha Ltd');

    const alphaDs = await createDataset('alpha-ds-1', ALPHA_ORG, 'READY');
    // Both get exactly 1 HIGH insight (score=10, totalInsights=1)
    await createInsight('alpha-i-z', alphaDs.id, alphaCompZ.id, InsightType.FEATURE_GAP, 'Unique Gap Z', ConfidenceLevel.HIGH);
    await createInsight('alpha-i-a', alphaDs.id, alphaCompA.id, InsightType.FEATURE_GAP, 'Unique Gap A', ConfidenceLevel.HIGH);

    const alphaService = new DashboardAnalyticsService();
    const alphaResult = await alphaService.getDashboardAnalytics(ALPHA_ORG);

    assertEqual(alphaResult.topCompetitors.length, 2, 'T11 two competitors');
    // Equal score, equal totalInsights → name ASC: 'Alpha Ltd' < 'Zeta Ltd'
    assertEqual(alphaResult.topCompetitors[0].competitorName, 'Alpha Ltd', 'T11 Alpha before Zeta (name ASC)');
    assertEqual(alphaResult.topCompetitors[1].competitorName, 'Zeta Ltd', 'T11 Zeta second');

    await cleanup([ALPHA_ORG]);
    console.log('PASS: Test 11 (topCompetitors tie-break: equal score + insights → competitorName ASC)');
  }

  // ---------------------------------------------------------------------------
  // Test 12: Cross-tenant products excluded from totalProductCount
  // ---------------------------------------------------------------------------
  {
    // Create product for ORG_A competitor
    await createProduct('dash-prod-a', 'dash-comp-1', 'Alpha Product');

    // Create competitor and product in ORG_B
    const compB = await createCompetitor('dash-comp-b1', ORG_B, 'Foreign Competitor');
    await createProduct('dash-prod-b', compB.id, 'Foreign Product');

    const resultA = await service.getDashboardAnalytics(ORG_A);
    const resultB = await service.getDashboardAnalytics(ORG_B);

    assertEqual(resultA.totalProductCount, 1, 'T12 ORG_A only sees its own products');
    assertEqual(resultB.totalProductCount, 1, 'T12 ORG_B only sees its own products');

    console.log('PASS: Test 12 (Cross-tenant products excluded — each org sees its own products only)');
  }

  // ---------------------------------------------------------------------------
  // Test 13: Cross-tenant datasets excluded from dataset counts
  // ---------------------------------------------------------------------------
  {
    await createDataset('dash-ds-b1', ORG_B, 'READY');

    const resultA = await service.getDashboardAnalytics(ORG_A);
    const resultB = await service.getDashboardAnalytics(ORG_B);

    // ORG_A: 4 datasets (dash-ds-1, dash-ds-2, dash-ds-proc, dash-ds-failed)
    assertEqual(resultA.totalDatasetCount, 4, 'T13 ORG_A sees only its 4 datasets');
    // ORG_B: 1 dataset (dash-ds-b1)
    assertEqual(resultB.totalDatasetCount, 1, 'T13 ORG_B sees only its 1 dataset');

    console.log('PASS: Test 13 (Cross-tenant datasets excluded — each org sees its own datasets only)');
  }

  // ---------------------------------------------------------------------------
  // Test 14: Cross-tenant insights excluded from competitor intelligence
  // ---------------------------------------------------------------------------
  {
    // Verify ORG_B competitors contain no ORG_A insights
    const resultB = await service.getDashboardAnalytics(ORG_B);
    assertEqual(resultB.totalInsights, 0, 'T14 ORG_B has no insights from ORG_A');
    assertEqual(resultB.avgIntelligenceActivityScore, 0, 'T14 ORG_B avg is 0 (no intelligence)');

    console.log('PASS: Test 14 (Cross-tenant insights excluded — ORG_B competitor has no ORG_A insights)');
  }

  // ---------------------------------------------------------------------------
  // Test 15: All score/percentage values are integers and bounded
  // ---------------------------------------------------------------------------
  {
    const result = await service.getDashboardAnalytics(ORG_A);

    assert(Number.isInteger(result.avgIntelligenceActivityScore), 'T15 avgIntelligenceActivityScore is integer');
    assert(result.avgIntelligenceActivityScore >= 0 && result.avgIntelligenceActivityScore <= 100, 'T15 avg in [0,100]');
    assert(Number.isInteger(result.datasetReadinessPercent), 'T15 datasetReadinessPercent is integer');
    assert(result.datasetReadinessPercent >= 0 && result.datasetReadinessPercent <= 100, 'T15 readiness in [0,100]');

    for (const comp of result.topCompetitors) {
      assert(Number.isInteger(comp.intelligenceActivityScore), `T15 ${comp.competitorName} score is integer`);
      assert(comp.intelligenceActivityScore >= 0 && comp.intelligenceActivityScore <= 100, `T15 ${comp.competitorName} score in [0,100]`);
    }

    console.log('PASS: Test 15 (All score and percentage values are integers bounded in [0,100])');
  }

  // ---------------------------------------------------------------------------
  // Test 16: DTO contains no sensitive internal fields
  // ---------------------------------------------------------------------------
  {
    const result = await service.getDashboardAnalytics(ORG_A);
    const keys = Object.keys(result);

    const forbidden = ['orgId', 'storageKey', 'semanticMapping', 'passwordHash', 'failureReason', 'failureCode'];
    for (const forbiddenKey of forbidden) {
      assert(!keys.includes(forbiddenKey), `T16 DTO must not contain '${forbiddenKey}'`);
    }

    for (const comp of result.topCompetitors) {
      const compKeys = Object.keys(comp);
      for (const forbiddenKey of forbidden) {
        assert(!compKeys.includes(forbiddenKey), `T16 topCompetitor must not contain '${forbiddenKey}'`);
      }
    }

    console.log('PASS: Test 16 (DTO does not expose any sensitive internal fields)');
  }

  // ---------------------------------------------------------------------------
  // Test 17: datasetReadinessPercent = 0 when totalDatasetCount = 0 (fresh empty org)
  // ---------------------------------------------------------------------------
  {
    const FRESH_ORG = 'org-dash-fresh';
    await cleanup([FRESH_ORG]);
    await prisma.organization.create({ data: { id: FRESH_ORG, name: 'Fresh Org' } });

    const freshService = new DashboardAnalyticsService();
    const freshResult = await freshService.getDashboardAnalytics(FRESH_ORG);

    assertEqual(freshResult.totalDatasetCount, 0, 'T17 totalDatasetCount 0');
    assertEqual(freshResult.readyDatasetCount, 0, 'T17 readyDatasetCount 0');
    assertEqual(freshResult.datasetReadinessPercent, 0, 'T17 datasetReadinessPercent 0 (no divide-by-zero)');

    await cleanup([FRESH_ORG]);
    console.log('PASS: Test 17 (datasetReadinessPercent = 0 when no datasets exist — no divide-by-zero)');
  }

  // ---------------------------------------------------------------------------
  // Test 18: datasetReadinessPercent = 0 when all datasets are non-READY
  // ---------------------------------------------------------------------------
  {
    const NOREADY_ORG = 'org-dash-noready';
    await cleanup([NOREADY_ORG]);
    await prisma.organization.create({ data: { id: NOREADY_ORG, name: 'No Ready Org' } });
    await createDataset('noready-ds-1', NOREADY_ORG, 'PROCESSING');
    await createDataset('noready-ds-2', NOREADY_ORG, 'FAILED');

    const noReadyService = new DashboardAnalyticsService();
    const noReadyResult = await noReadyService.getDashboardAnalytics(NOREADY_ORG);

    assertEqual(noReadyResult.totalDatasetCount, 2, 'T18 totalDatasetCount 2');
    assertEqual(noReadyResult.readyDatasetCount, 0, 'T18 readyDatasetCount 0');
    assertEqual(noReadyResult.datasetReadinessPercent, 0, 'T18 datasetReadinessPercent 0 (no READY datasets)');

    await cleanup([NOREADY_ORG]);
    console.log('PASS: Test 18 (datasetReadinessPercent = 0 when all datasets are non-READY)');
  }

  // ---------------------------------------------------------------------------
  // Test 19: Service throws on empty orgId
  // ---------------------------------------------------------------------------
  {
    try {
      await service.getDashboardAnalytics('');
      assert(false, 'T19 should have thrown on empty orgId');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      assertEqual(message, 'Organization ID is required.', 'T19 error message');
    }
    console.log('PASS: Test 19 (Service throws on empty orgId — fail-closed)');
  }

  // ---------------------------------------------------------------------------
  // Test 20: Deterministic output across repeated calls
  // ---------------------------------------------------------------------------
  {
    const first  = await service.getDashboardAnalytics(ORG_A);
    const second = await service.getDashboardAnalytics(ORG_A);

    assertEqual(first.avgIntelligenceActivityScore, second.avgIntelligenceActivityScore, 'T20 avg deterministic');
    assertEqual(first.competitorCount, second.competitorCount, 'T20 competitorCount deterministic');
    assertEqual(first.datasetReadinessPercent, second.datasetReadinessPercent, 'T20 readiness deterministic');
    assertEqual(first.topCompetitors.length, second.topCompetitors.length, 'T20 topCompetitors length deterministic');

    if (first.topCompetitors.length > 0) {
      assertEqual(first.topCompetitors[0].competitorId, second.topCompetitors[0].competitorId, 'T20 top competitor order deterministic');
    }

    console.log('PASS: Test 20 (All DashboardAnalyticsService outputs are fully deterministic)');
  }

  // ---------------------------------------------------------------------------
  // Final cleanup
  // ---------------------------------------------------------------------------
  await cleanup([ORG_A, ORG_B]);

  console.log('\nAll 20 Dashboard Analytics tests passed successfully!');
}

runTests().catch((err) => {
  console.error(err);
  process.exit(1);
});
