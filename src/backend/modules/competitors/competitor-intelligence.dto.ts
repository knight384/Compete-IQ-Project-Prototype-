export interface CompetitorIntelligenceSummaryDto {
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

export function determineActivityLevel(score: number): 'LOW' | 'MODERATE' | 'HIGH' | 'INTENSIVE' {
  if (score >= 75) return 'INTENSIVE';
  if (score >= 50) return 'HIGH';
  if (score >= 25) return 'MODERATE';
  return 'LOW';
}
