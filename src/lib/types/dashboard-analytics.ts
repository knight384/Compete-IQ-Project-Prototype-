import { RecentInsightDto } from './intelligence-analytics';

/**
 * Frontend mirror of DashboardAnalyticsDto from the backend analytics module.
 * Used by useDashboardAnalytics hook and dashboard page components.
 *
 * avgIntelligenceActivityScore denominator: only competitors with totalInsights > 0.
 * datasetReadinessPercent: integer [0,100], 0 when no datasets exist.
 */
export interface TopCompetitorSummary {
  competitorId: string;
  competitorName: string;
  intelligenceActivityScore: number;
  activityLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'INTENSIVE';
  totalInsights: number;
  featureGapCount: number;
  pricingOpportunityCount: number;
}

export interface DashboardAnalyticsDto {
  competitorCount: number;
  competitorsWithIntelligenceCount: number;
  totalInsights: number;
  totalPricingOpportunities: number;
  totalFeatureGaps: number;
  avgIntelligenceActivityScore: number;
  topCompetitors: TopCompetitorSummary[];
  totalDatasetCount: number;
  readyDatasetCount: number;
  datasetReadinessPercent: number;
  totalProductCount: number;
  recentInsights?: RecentInsightDto[];
  insightsByType?: Record<string, number>;
  insightsByConfidence?: Record<string, number>;
}
