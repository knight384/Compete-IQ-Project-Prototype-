import { prisma } from '../../prisma/client';
import { CompetitorIntelligenceService } from '../competitors/competitor-intelligence.service';
import { DashboardAnalyticsDto, TopCompetitorDto } from './dashboard-analytics.dto';

/**
 * DashboardAnalyticsService
 *
 * Aggregates organization-level analytics for the primary dashboard and enterprise overview
 * surfaces. Composes CompetitorIntelligenceService (for intelligence scoring) with direct
 * Prisma count queries for datasets and products.
 *
 * IMPORTANT: This service accepts orgId as a parameter and never imports or hardcodes
 * MOCK_ORG_ID. Only the HTTP boundary (route.ts) is responsible for resolving the current
 * tenant context. This ensures the analytics business logic remains auth-agnostic and
 * replaceable when real authentication is introduced.
 *
 * Query strategy (5 queries total, N+1 safe):
 *   Query 1-2: getOrganizationCompetitorSummaries(orgId) [competitor list + bulk insights]
 *   Query 3:   prisma.dataset.count({ where: { orgId } })
 *   Query 4:   prisma.dataset.count({ where: { orgId, status: 'READY' } })
 *   Query 5:   prisma.product.count({ where: { competitor: { orgId } } })
 * Queries 3, 4, 5 run in parallel via Promise.all.
 */
export class DashboardAnalyticsService {
  private readonly intelligenceService: CompetitorIntelligenceService;

  constructor() {
    this.intelligenceService = new CompetitorIntelligenceService();
  }

  /**
   * Returns a DashboardAnalyticsDto for the given organization.
   *
   * Tenant isolation guarantees:
   *   - getOrganizationCompetitorSummaries enforces competitor.orgId === orgId AND
   *     dataset.orgId === orgId AND dataset.status === 'READY'.
   *   - Dataset counts are filtered by orgId.
   *   - Product count is filtered via competitor.orgId === orgId (Product has no direct orgId).
   *     Cross-tenant products are excluded.
   */
  async getDashboardAnalytics(orgId: string): Promise<DashboardAnalyticsDto> {
    if (!orgId || orgId.trim() === '') {
      throw new Error('Organization ID is required.');
    }

    // Step 1: Get all competitor intelligence summaries (2 queries internally)
    const summaries = await this.intelligenceService.getOrganizationCompetitorSummaries(orgId);

    // Step 2: Run dataset and product counts in parallel (3 queries)
    const [totalDatasetCount, readyDatasetCount, totalProductCount] = await Promise.all([
      prisma.dataset.count({ where: { orgId } }),
      prisma.dataset.count({ where: { orgId, status: 'READY' } }),
      prisma.product.count({ where: { competitor: { orgId } } }),
    ]);

    // --- Derive aggregate metrics ---

    const competitorCount = summaries.length;

    // Only competitors with at least one linked insight contribute to the average
    const summariesWithIntelligence = summaries.filter((s) => s.totalInsights > 0);
    const competitorsWithIntelligenceCount = summariesWithIntelligence.length;

    const totalInsights = summaries.reduce((sum, s) => sum + s.totalInsights, 0);
    const totalPricingOpportunities = summaries.reduce((sum, s) => sum + s.pricingOpportunityCount, 0);
    const totalFeatureGaps = summaries.reduce((sum, s) => sum + s.featureGapCount, 0);

    // avgIntelligenceActivityScore: denominator is competitorsWithIntelligenceCount only
    const avgIntelligenceActivityScore =
      competitorsWithIntelligenceCount === 0
        ? 0
        : Math.round(
            summariesWithIntelligence.reduce((sum, s) => sum + s.intelligenceActivityScore, 0) /
              competitorsWithIntelligenceCount
          );

    // Dataset Readiness: READY / total, 0 if no datasets exist
    const datasetReadinessPercent =
      totalDatasetCount === 0
        ? 0
        : Math.round((readyDatasetCount / totalDatasetCount) * 100);

    // topCompetitors: sorted deterministically, capped at 5
    const topCompetitors: TopCompetitorDto[] = summaries
      .slice() // avoid mutating original array
      .sort((a, b) => {
        // 1. intelligenceActivityScore DESC
        if (b.intelligenceActivityScore !== a.intelligenceActivityScore) {
          return b.intelligenceActivityScore - a.intelligenceActivityScore;
        }
        // 2. totalInsights DESC
        if (b.totalInsights !== a.totalInsights) {
          return b.totalInsights - a.totalInsights;
        }
        // 3. competitorName ASC (alphabetical tie-break)
        return a.competitorName.localeCompare(b.competitorName);
      })
      .slice(0, 5)
      .map((s) => ({
        competitorId: s.competitorId,
        competitorName: s.competitorName,
        intelligenceActivityScore: s.intelligenceActivityScore,
        activityLevel: s.activityLevel,
        totalInsights: s.totalInsights,
        featureGapCount: s.featureGapCount,
        pricingOpportunityCount: s.pricingOpportunityCount,
      }));

    return {
      competitorCount,
      competitorsWithIntelligenceCount,
      totalInsights,
      totalPricingOpportunities,
      totalFeatureGaps,
      avgIntelligenceActivityScore,
      topCompetitors,
      totalDatasetCount,
      readyDatasetCount,
      datasetReadinessPercent,
      totalProductCount,
    };
  }
}

export const dashboardAnalyticsService = new DashboardAnalyticsService();
