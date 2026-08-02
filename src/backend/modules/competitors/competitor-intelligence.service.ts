import { prisma } from '../../prisma/client';
import { normalizeEntityName } from '../../shared/utils/normalize-entity';
import { CompetitorIntelligenceSummaryDto, determineActivityLevel } from './competitor-intelligence.dto';

const CONFIDENCE_POINTS: Record<string, number> = {
  HIGH: 10,
  MEDIUM: 7,
  LOW: 4,
};

interface InsightRecord {
  id: string;
  datasetId: string;
  type: string;
  title: string;
  confidence: string | null;
  competitorId: string | null;
  productId: string | null;
  createdAt: Date;
}

export class CompetitorIntelligenceService {
  /**
   * Calculates dynamic intelligence summary and score for a single competitor.
   * Enforces dual tenant isolation: competitor.orgId === orgId AND dataset.orgId === orgId.
   */
  async getCompetitorIntelligence(orgId: string, competitorId: string): Promise<CompetitorIntelligenceSummaryDto> {
    if (!orgId) {
      throw new Error('Organization ID is required.');
    }
    if (!competitorId) {
      throw new Error('Competitor ID is required.');
    }

    // 1. Verify competitor exists and belongs to the requesting organization
    const competitor = await prisma.competitor.findFirst({
      where: {
        id: competitorId,
        orgId: orgId,
      },
      select: {
        id: true,
        name: true,
      },
    });

    if (!competitor) {
      throw new Error('Competitor not found or access denied.');
    }

    // 2. Fetch all qualifying insights belonging to READY datasets owned by orgId
    const insights: InsightRecord[] = await prisma.datasetInsight.findMany({
      where: {
        competitorId: competitorId,
        competitor: {
          orgId: orgId,
        },
        dataset: {
          orgId: orgId,
          status: 'READY',
        },
      },
      select: {
        id: true,
        datasetId: true,
        type: true,
        title: true,
        confidence: true,
        competitorId: true,
        productId: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return this.aggregateCompetitorInsights(competitor.id, competitor.name, insights);
  }

  /**
   * Bulk aggregates intelligence summaries for all competitors in an organization.
   * Prevents N+1 queries by executing exactly 2 database queries:
   * Query 1: Fetch all organization competitors.
   * Query 2: Fetch all qualifying insights for READY datasets in orgId.
   */
  async getOrganizationCompetitorSummaries(orgId: string): Promise<CompetitorIntelligenceSummaryDto[]> {
    if (!orgId) {
      throw new Error('Organization ID is required.');
    }

    // Query 1: Fetch all competitors owned by orgId
    const competitors = await prisma.competitor.findMany({
      where: {
        orgId: orgId,
      },
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    if (competitors.length === 0) {
      return [];
    }

    // Query 2: Fetch all qualifying insights for competitors in orgId from READY datasets owned by orgId
    const allInsights: InsightRecord[] = await prisma.datasetInsight.findMany({
      where: {
        competitorId: {
          in: competitors.map((c) => c.id),
        },
        competitor: {
          orgId: orgId,
        },
        dataset: {
          orgId: orgId,
          status: 'READY',
        },
      },
      select: {
        id: true,
        datasetId: true,
        type: true,
        title: true,
        confidence: true,
        competitorId: true,
        productId: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // In-memory grouping by competitorId
    const insightsByCompetitor = new Map<string, InsightRecord[]>();
    for (const insight of allInsights) {
      if (insight.competitorId) {
        const list = insightsByCompetitor.get(insight.competitorId) || [];
        list.push(insight);
        insightsByCompetitor.set(insight.competitorId, list);
      }
    }

    return competitors.map((comp) => {
      const compInsights = insightsByCompetitor.get(comp.id) || [];
      return this.aggregateCompetitorInsights(comp.id, comp.name, compInsights);
    });
  }

  /**
   * Helper function that processes a list of qualifying insights for a competitor
   * and computes deterministic scores, deduplication, product metrics, and distributions.
   */
  private aggregateCompetitorInsights(
    competitorId: string,
    competitorName: string,
    insights: InsightRecord[]
  ): CompetitorIntelligenceSummaryDto {
    const totalInsights = insights.length;

    if (totalInsights === 0) {
      return {
        competitorId,
        competitorName,
        intelligenceActivityScore: 0,
        activityLevel: 'LOW',
        totalInsights: 0,
        deduplicatedInsightCount: 0,
        linkedProductCount: 0,
        productLinkedInsightCount: 0,
        distinctDatasetCount: 0,
        insightsByType: {},
        insightsByConfidence: {},
        featureGapCount: 0,
        pricingOpportunityCount: 0,
        latestInsightAt: null,
      };
    }

    // Recency: insights are ordered createdAt desc
    const latestInsightAt = insights[0].createdAt.toISOString();

    // Grouping by dataset for per-dataset cap and deduplication
    const insightsByDataset = new Map<string, InsightRecord[]>();
    const distinctProductIds = new Set<string>();
    const distinctDatasetIds = new Set<string>();
    let productLinkedInsightCount = 0;
    let featureGapCount = 0;
    let pricingOpportunityCount = 0;

    const insightsByType: Record<string, number> = {};
    const insightsByConfidence: Record<string, number> = {};

    for (const insight of insights) {
      distinctDatasetIds.add(insight.datasetId);

      const datasetList = insightsByDataset.get(insight.datasetId) || [];
      datasetList.push(insight);
      insightsByDataset.set(insight.datasetId, datasetList);

      // Track product linkages
      if (insight.productId) {
        productLinkedInsightCount++;
        distinctProductIds.add(insight.productId);
      }

      // Track distributions
      insightsByType[insight.type] = (insightsByType[insight.type] || 0) + 1;
      const confKey = insight.confidence ? insight.confidence.toUpperCase() : 'UNKNOWN';
      insightsByConfidence[confKey] = (insightsByConfidence[confKey] || 0) + 1;

      if (insight.type === 'FEATURE_GAP') {
        featureGapCount++;
      } else if (insight.type === 'PRICING_OPPORTUNITY') {
        pricingOpportunityCount++;
      }
    }

    // Deterministic deduplication & scoring per dataset
    let totalRawScore = 0;
    let totalDeduplicatedCount = 0;

    for (const [datasetId, datasetInsights] of insightsByDataset.entries()) {
      const seenDeduplicationKeys = new Set<string>();
      let datasetScore = 0;

      for (const insight of datasetInsights) {
        const normTitle = normalizeEntityName(insight.title);
        const dedupKey = `${datasetId}::${insight.type}::${normTitle}`;

        if (!seenDeduplicationKeys.has(dedupKey)) {
          seenDeduplicationKeys.add(dedupKey);
          totalDeduplicatedCount++;

          const conf = insight.confidence ? insight.confidence.toUpperCase() : 'MEDIUM';
          const points = CONFIDENCE_POINTS[conf] ?? CONFIDENCE_POINTS['MEDIUM'];
          datasetScore += points;
        }
      }

      // 25-point cap per dataset per competitor
      const cappedDatasetScore = Math.min(25, datasetScore);
      totalRawScore += cappedDatasetScore;
    }

    // Final score integer in [0, 100]
    const intelligenceActivityScore = Math.min(100, Math.round(totalRawScore));
    const activityLevel = determineActivityLevel(intelligenceActivityScore);

    return {
      competitorId,
      competitorName,
      intelligenceActivityScore,
      activityLevel,
      totalInsights,
      deduplicatedInsightCount: totalDeduplicatedCount,
      linkedProductCount: distinctProductIds.size,
      productLinkedInsightCount,
      distinctDatasetCount: distinctDatasetIds.size,
      insightsByType,
      insightsByConfidence,
      featureGapCount,
      pricingOpportunityCount,
      latestInsightAt,
    };
  }
}

export const competitorIntelligenceService = new CompetitorIntelligenceService();
