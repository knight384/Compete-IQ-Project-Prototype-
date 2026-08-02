/**
 * Top competitor entry within the dashboard analytics response.
 * Sorted deterministically: intelligenceActivityScore DESC, totalInsights DESC, competitorName ASC.
 * Maximum 5 entries returned.
 */
export interface TopCompetitorDto {
  competitorId: string;
  competitorName: string;
  intelligenceActivityScore: number; // integer [0, 100]
  activityLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'INTENSIVE';
  totalInsights: number;
  featureGapCount: number;
  pricingOpportunityCount: number;
}

/**
 * Aggregate dashboard analytics for a single organization.
 *
 * Denominator for avgIntelligenceActivityScore:
 *   Only competitors where totalInsights > 0 are included.
 *   competitorsWithIntelligenceCount is the explicit denominator, always exposed.
 *   If competitorsWithIntelligenceCount === 0, avgIntelligenceActivityScore = 0.
 *
 * datasetReadinessPercent formula:
 *   totalDatasetCount === 0 ? 0 : Math.round((readyDatasetCount / totalDatasetCount) * 100)
 *   Returns integer in [0, 100].
 *
 * No internal fields (orgId, storageKey, semanticMapping, raw insight rows, etc.) are exposed.
 */
export interface DashboardAnalyticsDto {
  // --- Competitor metrics ---
  /** Total number of competitors tracked for this organization. */
  competitorCount: number;
  /**
   * Number of competitors that have at least one linked insight in a READY dataset.
   * This is the denominator for avgIntelligenceActivityScore.
   */
  competitorsWithIntelligenceCount: number;

  // --- Insight metrics ---
  /** Raw total insight count across all competitors (pre-deduplication sum of CompetitorIntelligenceSummaryDto.totalInsights). */
  totalInsights: number;
  /** Sum of pricingOpportunityCount across all competitors. */
  totalPricingOpportunities: number;
  /** Sum of featureGapCount across all competitors. */
  totalFeatureGaps: number;

  // --- Scoring ---
  /**
   * Average intelligenceActivityScore, integer in [0, 100].
   * Denominator: competitorsWithIntelligenceCount (zero-insight competitors excluded).
   * Returns 0 if no competitors have intelligence.
   */
  avgIntelligenceActivityScore: number;

  // --- Top competitors ---
  /**
   * Up to 5 competitors sorted by: intelligenceActivityScore DESC, totalInsights DESC, competitorName ASC.
   */
  topCompetitors: TopCompetitorDto[];

  // --- Dataset metrics ---
  /** Total number of datasets belonging to this organization (all statuses). */
  totalDatasetCount: number;
  /** Number of datasets in READY status. */
  readyDatasetCount: number;
  /** Integer percentage [0, 100]. 0 if totalDatasetCount === 0. */
  datasetReadinessPercent: number;

  // --- Product metrics ---
  /** Total number of products across all competitors in this organization. */
  totalProductCount: number;
}
