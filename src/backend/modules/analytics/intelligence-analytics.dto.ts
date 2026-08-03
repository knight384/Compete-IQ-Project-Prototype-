/**
 * DTO contracts for Milestone 5.5 Intelligence Analytics APIs.
 * Enforces bounded presentation schemas without internal fields.
 */

export interface RecentInsightDto {
  id: string;
  type: string;
  title: string;
  summary: string;
  confidence: string | null;
  createdAt: string; // ISO string UTC
  competitorId: string | null;
  competitorName: string | null;
  productId: string | null;
  productName: string | null;
  datasetId: string;
  datasetFilename: string;
}

export interface RecentInsightsResponseDto {
  items: RecentInsightDto[];
  nextCursor: string | null;
  hasMore: boolean;
}

export interface TimeSeriesPointDto {
  date: string; // YYYY-MM-DD UTC
  count: number;
}

export interface FeatureGapAnalyticsDto {
  totalFeatureGapInsights: number;
  featureGapInsightsByCompetitor: Array<{
    competitorId: string;
    competitorName: string;
    count: number;
  }>;
  trend: TimeSeriesPointDto[];
  recentInsights: RecentInsightDto[];
}

export interface PricingOpportunityAnalyticsDto {
  totalPricingOpportunityInsights: number;
  pricingOpportunityInsightsByCompetitor: Array<{
    competitorId: string;
    competitorName: string;
    count: number;
  }>;
  trend: TimeSeriesPointDto[];
  recentInsights: RecentInsightDto[];
}

export interface SentimentAnalyticsDto {
  totalSentimentShiftSignals: number;
  sentimentShiftSignalsByCompetitor: Array<{
    competitorId: string;
    competitorName: string;
    count: number;
  }>;
  trend: TimeSeriesPointDto[];
  recentInsights: RecentInsightDto[];
}

export interface InsightDistributionDto {
  insightsByType: Record<string, number>;
  insightsByConfidence: Record<string, number>;
}
