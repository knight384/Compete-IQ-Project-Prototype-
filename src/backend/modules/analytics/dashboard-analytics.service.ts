import { prisma } from '../../prisma/client';
import { CompetitorIntelligenceService } from '../competitors/competitor-intelligence.service';
import { IntelligenceAnalyticsService } from './intelligence-analytics.service';
import { DashboardAnalyticsDto, TopCompetitorDto } from './dashboard-analytics.dto';

/**
 * DashboardAnalyticsService
 *
 * Aggregates organization-level analytics for the primary dashboard and enterprise overview
 * surfaces. Composes CompetitorIntelligenceService (for intelligence scoring) with direct
 * Prisma count queries and IntelligenceAnalyticsService for recent signals & distributions.
 */
export class DashboardAnalyticsService {
  private readonly intelligenceService: CompetitorIntelligenceService;
  private readonly analyticsService: IntelligenceAnalyticsService;

  constructor() {
    this.intelligenceService = new CompetitorIntelligenceService();
    this.analyticsService = new IntelligenceAnalyticsService();
  }

  async getDashboardAnalytics(orgId: string): Promise<DashboardAnalyticsDto> {
    if (!orgId || orgId.trim() === '') {
      throw new Error('Organization ID is required.');
    }

    // Step 1: Get competitor intelligence summaries
    const summaries = await this.intelligenceService.getOrganizationCompetitorSummaries(orgId);

    // Step 2: Fetch dataset/product counts, recent signals, and distributions safely
    const totalDatasetCount = await prisma.dataset.count({ where: { orgId } });
    const readyDatasetCount = await prisma.dataset.count({ where: { orgId, status: 'READY' } });
    const totalProductCount = await prisma.product.count({ where: { competitor: { orgId } } });
    const recentInsightsRes = await this.analyticsService.getRecentInsights(orgId, { limit: 5 });
    const distributions = await this.analyticsService.getInsightDistributions(orgId);

    // --- Derive aggregate metrics ---

    const competitorCount = summaries.length;
    const summariesWithIntelligence = summaries.filter((s) => s.totalInsights > 0);
    const competitorsWithIntelligenceCount = summariesWithIntelligence.length;

    const totalInsights = summaries.reduce((sum, s) => sum + s.totalInsights, 0);
    const totalPricingOpportunities = summaries.reduce((sum, s) => sum + s.pricingOpportunityCount, 0);
    const totalFeatureGaps = summaries.reduce((sum, s) => sum + s.featureGapCount, 0);

    const avgIntelligenceActivityScore =
      competitorsWithIntelligenceCount === 0
        ? 0
        : Math.round(
            summariesWithIntelligence.reduce((sum, s) => sum + s.intelligenceActivityScore, 0) /
              competitorsWithIntelligenceCount
          );

    const datasetReadinessPercent =
      totalDatasetCount === 0 ? 0 : Math.round((readyDatasetCount / totalDatasetCount) * 100);

    const topCompetitors: TopCompetitorDto[] = summaries
      .slice()
      .sort((a, b) => {
        if (b.intelligenceActivityScore !== a.intelligenceActivityScore) {
          return b.intelligenceActivityScore - a.intelligenceActivityScore;
        }
        if (b.totalInsights !== a.totalInsights) {
          return b.totalInsights - a.totalInsights;
        }
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
      recentInsights: recentInsightsRes.items,
      insightsByType: distributions.insightsByType,
      insightsByConfidence: distributions.insightsByConfidence,
    };
  }
}

export const dashboardAnalyticsService = new DashboardAnalyticsService();
