import { prisma } from './src/backend/prisma/client';
import { GET as getFeatureGaps } from './src/app/api/v1/analytics/feature-gaps/route';
import { GET as getOpportunities } from './src/app/api/v1/analytics/opportunities/route';
import { GET as getSentiment } from './src/app/api/v1/analytics/sentiment/route';
import { GET as getInsights } from './src/app/api/v1/analytics/insights/route';
import { NextRequest } from 'next/server';

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

const MOCK_ORG_ID = '11111111-1111-1111-1111-111111111111';

async function cleanup() {
  await prisma.datasetInsight.deleteMany({ where: { dataset: { orgId: MOCK_ORG_ID } } });
  await prisma.datasetProfile.deleteMany({ where: { dataset: { orgId: MOCK_ORG_ID } } });
  await prisma.dataset.deleteMany({ where: { orgId: MOCK_ORG_ID } });
  await prisma.product.deleteMany({ where: { competitor: { orgId: MOCK_ORG_ID } } });
  await prisma.competitor.deleteMany({ where: { orgId: MOCK_ORG_ID } });
  await prisma.organization.deleteMany({ where: { id: MOCK_ORG_ID } });
}

async function runTests() {
  console.log('--- Running Intelligence Analytics API Integration Tests ---\n');

  await cleanup();
  await prisma.organization.create({ data: { id: MOCK_ORG_ID, name: 'Mock Org' } });

  // ---------------------------------------------------------------------------
  // Test 1: Feature Gaps Route Returns 200 OK
  // ---------------------------------------------------------------------------
  {
    const req = new NextRequest('http://localhost/api/v1/analytics/feature-gaps');
    const res = await getFeatureGaps(req);
    assertEqual(res.status, 200, 'T1 status 200');
    const json = await res.json();
    assertEqual(json.success, true, 'T1 success true');
    assertEqual(json.data.totalFeatureGapInsights, 0, 'T1 totalFeatureGapInsights 0');

    console.log('PASS: Test 1  (GET /api/v1/analytics/feature-gaps returns 200 with FeatureGapAnalyticsDto)');
  }

  // ---------------------------------------------------------------------------
  // Test 2: Pricing Opportunities Route Returns 200 OK
  // ---------------------------------------------------------------------------
  {
    const req = new NextRequest('http://localhost/api/v1/analytics/opportunities');
    const res = await getOpportunities(req);
    assertEqual(res.status, 200, 'T2 status 200');
    const json = await res.json();
    assertEqual(json.success, true, 'T2 success true');
    assertEqual(json.data.totalPricingOpportunityInsights, 0, 'T2 totalPricingOpportunityInsights 0');

    console.log('PASS: Test 2  (GET /api/v1/analytics/opportunities returns 200 with PricingOpportunityAnalyticsDto)');
  }

  // ---------------------------------------------------------------------------
  // Test 3: Sentiment Route Returns 200 OK
  // ---------------------------------------------------------------------------
  {
    const req = new NextRequest('http://localhost/api/v1/analytics/sentiment');
    const res = await getSentiment(req);
    assertEqual(res.status, 200, 'T3 status 200');
    const json = await res.json();
    assertEqual(json.success, true, 'T3 success true');
    assertEqual(json.data.totalSentimentShiftSignals, 0, 'T3 totalSentimentShiftSignals 0');

    console.log('PASS: Test 3  (GET /api/v1/analytics/sentiment returns 200 with SentimentAnalyticsDto)');
  }

  // ---------------------------------------------------------------------------
  // Test 4: Insights Feed Route Returns 200 OK with pagination params
  // ---------------------------------------------------------------------------
  {
    const req = new NextRequest('http://localhost/api/v1/analytics/insights?limit=10');
    const res = await getInsights(req);
    assertEqual(res.status, 200, 'T4 status 200');
    const json = await res.json();
    assertEqual(json.success, true, 'T4 success true');
    assertEqual(json.data.items.length, 0, 'T4 items empty');
    assertEqual(json.data.hasMore, false, 'T4 hasMore false');

    console.log('PASS: Test 4  (GET /api/v1/analytics/insights returns 200 with RecentInsightsResponseDto)');
  }

  await cleanup();
  console.log('\n--- All Intelligence Analytics API Tests Passed! ---');
}

runTests()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('API Test failed:', err);
    process.exit(1);
  });
