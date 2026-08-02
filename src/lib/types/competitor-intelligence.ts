export interface FrontendCompetitorIntelligenceSummary {
  competitorId: string;
  competitorName: string;
  intelligenceActivityScore: number;
  activityLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'INTENSIVE';
  totalInsights: number;
  deduplicatedInsightCount: number;
  linkedProductCount: number;
  productLinkedInsightCount: number;
  distinctDatasetCount: number;
  insightsByType: Record<string, number>;
  insightsByConfidence: Record<string, number>;
  featureGapCount: number;
  pricingOpportunityCount: number;
  latestInsightAt: string | null;
}
