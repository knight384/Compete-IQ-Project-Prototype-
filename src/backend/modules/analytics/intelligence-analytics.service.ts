import { prisma } from '../../prisma/client';
import {
  RecentInsightDto,
  RecentInsightsResponseDto,
  TimeSeriesPointDto,
  FeatureGapAnalyticsDto,
  PricingOpportunityAnalyticsDto,
  SentimentAnalyticsDto,
  InsightDistributionDto,
} from './intelligence-analytics.dto';

export class IntelligenceAnalyticsService {
  /**
   * Encodes a cursor from createdAt Date and id String.
   */
  private encodeCursor(createdAt: Date, id: string): string {
    const raw = `${createdAt.toISOString()}::${id}`;
    return Buffer.from(raw, 'utf-8').toString('base64url');
  }

  /**
   * Decodes a cursor string into createdAt Date and id String.
   */
  private decodeCursor(cursor: string): { createdAt: Date; id: string } | null {
    try {
      const decoded = Buffer.from(cursor, 'base64url').toString('utf-8');
      const parts = decoded.split('::');
      if (parts.length !== 2) return null;
      const createdAt = new Date(parts[0]);
      if (isNaN(createdAt.getTime())) return null;
      return { createdAt, id: parts[1] };
    } catch {
      return null;
    }
  }

  /**
   * Helper to construct tenant-isolated where condition for DatasetInsight queries.
   */
  private buildWhereClause(
    orgId: string,
    options?: {
      competitorId?: string;
      productId?: string;
      type?: string;
      startDate?: Date;
      endDate?: Date;
    }
  ) {
    if (!orgId || orgId.trim() === '') {
      throw new Error('Organization ID is required.');
    }

    const where: any = {
      dataset: {
        orgId: orgId,
        status: 'READY',
      },
    };

    if (options?.competitorId) {
      where.competitorId = options.competitorId;
      where.competitor = { orgId: orgId };
    }

    if (options?.productId) {
      where.productId = options.productId;
      where.product = { competitor: { orgId: orgId } };
    }

    if (options?.type) {
      where.type = options.type;
    }

    if (options?.startDate || options?.endDate) {
      where.createdAt = {};
      if (options.startDate) where.createdAt.gte = options.startDate;
      if (options.endDate) where.createdAt.lte = options.endDate;
    }

    return where;
  }

  /**
   * Helper to format DatasetInsight records to RecentInsightDto.
   */
  private mapToInsightDto(insight: any): RecentInsightDto {
    return {
      id: insight.id,
      type: insight.type,
      title: insight.title,
      summary: insight.summary,
      confidence: insight.confidence ?? null,
      createdAt: insight.createdAt.toISOString(),
      competitorId: insight.competitorId ?? null,
      competitorName: insight.competitor?.name ?? null,
      productId: insight.productId ?? null,
      productName: insight.product?.name ?? null,
      datasetId: insight.datasetId,
      datasetFilename: insight.dataset?.originalFilename ?? 'dataset.csv',
    };
  }

  /**
   * Generates deterministic UTC YYYY-MM-DD time-series buckets zero-filled over specified days.
   */
  private generateUtcTimeSeries(insights: { createdAt: Date }[], days: number = 30): TimeSeriesPointDto[] {
    const end = new Date();
    const start = new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), end.getUTCDate() - days + 1, 0, 0, 0, 0));

    // Map counts by YYYY-MM-DD UTC string
    const countsByDate = new Map<string, number>();
    for (const item of insights) {
      const dateStr = item.createdAt.toISOString().slice(0, 10);
      countsByDate.set(dateStr, (countsByDate.get(dateStr) || 0) + 1);
    }

    const series: TimeSeriesPointDto[] = [];
    const current = new Date(start);

    for (let i = 0; i < days; i++) {
      const dateStr = current.toISOString().slice(0, 10);
      series.push({
        date: dateStr,
        count: countsByDate.get(dateStr) || 0,
      });
      current.setUTCDate(current.getUTCDate() + 1);
    }

    return series;
  }

  /**
   * Paginated query for recent insights with deterministic cursor ordering (createdAt DESC, id DESC).
   */
  async getRecentInsights(
    orgId: string,
    options?: {
      limit?: number;
      cursor?: string;
      competitorId?: string;
      productId?: string;
      type?: string;
    }
  ): Promise<RecentInsightsResponseDto> {
    const rawLimit = options?.limit ?? 20;
    const limit = Math.min(100, Math.max(1, rawLimit));

    const baseWhere = this.buildWhereClause(orgId, options);

    if (options?.cursor) {
      const decoded = this.decodeCursor(options.cursor);
      if (decoded) {
        baseWhere.AND = [
          {
            OR: [
              { createdAt: { lt: decoded.createdAt } },
              {
                createdAt: decoded.createdAt,
                id: { lt: decoded.id },
              },
            ],
          },
        ];
      }
    }

    const insights = await prisma.datasetInsight.findMany({
      where: baseWhere,
      select: {
        id: true,
        type: true,
        title: true,
        summary: true,
        confidence: true,
        createdAt: true,
        competitorId: true,
        productId: true,
        datasetId: true,
        competitor: { select: { name: true } },
        product: { select: { name: true } },
        dataset: { select: { originalFilename: true } },
      },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      take: limit + 1,
    });

    const hasMore = insights.length > limit;
    const resultItems = hasMore ? insights.slice(0, limit) : insights;

    let nextCursor: string | null = null;
    if (hasMore && resultItems.length > 0) {
      const lastItem = resultItems[resultItems.length - 1];
      nextCursor = this.encodeCursor(lastItem.createdAt, lastItem.id);
    }

    return {
      items: resultItems.map((item) => this.mapToInsightDto(item)),
      nextCursor,
      hasMore,
    };
  }

  /**
   * Feature Gap Analytics (type = 'FEATURE_GAP').
   */
  async getFeatureGapAnalytics(
    orgId: string,
    options?: { competitorId?: string; productId?: string; days?: number }
  ): Promise<FeatureGapAnalyticsDto> {
    const days = options?.days ?? 30;
    const where = this.buildWhereClause(orgId, {
      ...options,
      type: 'FEATURE_GAP',
    });

    const insights = await prisma.datasetInsight.findMany({
      where,
      select: {
        id: true,
        type: true,
        title: true,
        summary: true,
        confidence: true,
        createdAt: true,
        competitorId: true,
        productId: true,
        datasetId: true,
        competitor: { select: { name: true } },
        product: { select: { name: true } },
        dataset: { select: { originalFilename: true } },
      },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    });

    const totalFeatureGapInsights = insights.length;

    // Breakdown by competitor
    const competitorMap = new Map<string, { competitorName: string; count: number }>();
    for (const insight of insights) {
      if (insight.competitorId) {
        const compName = insight.competitor?.name ?? 'Unknown Competitor';
        const existing = competitorMap.get(insight.competitorId) || { competitorName: compName, count: 0 };
        existing.count++;
        competitorMap.set(insight.competitorId, existing);
      }
    }

    const featureGapInsightsByCompetitor = Array.from(competitorMap.entries()).map(([competitorId, val]) => ({
      competitorId,
      competitorName: val.competitorName,
      count: val.count,
    })).sort((a, b) => b.count - a.count);

    const trend = this.generateUtcTimeSeries(insights, days);
    const recentInsights = insights.slice(0, 5).map((item) => this.mapToInsightDto(item));

    return {
      totalFeatureGapInsights,
      featureGapInsightsByCompetitor,
      trend,
      recentInsights,
    };
  }

  /**
   * Pricing Opportunity Analytics (type = 'PRICING_OPPORTUNITY').
   */
  async getPricingOpportunityAnalytics(
    orgId: string,
    options?: { competitorId?: string; productId?: string; days?: number }
  ): Promise<PricingOpportunityAnalyticsDto> {
    const days = options?.days ?? 30;
    const where = this.buildWhereClause(orgId, {
      ...options,
      type: 'PRICING_OPPORTUNITY',
    });

    const insights = await prisma.datasetInsight.findMany({
      where,
      select: {
        id: true,
        type: true,
        title: true,
        summary: true,
        confidence: true,
        createdAt: true,
        competitorId: true,
        productId: true,
        datasetId: true,
        competitor: { select: { name: true } },
        product: { select: { name: true } },
        dataset: { select: { originalFilename: true } },
      },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    });

    const totalPricingOpportunityInsights = insights.length;

    const competitorMap = new Map<string, { competitorName: string; count: number }>();
    for (const insight of insights) {
      if (insight.competitorId) {
        const compName = insight.competitor?.name ?? 'Unknown Competitor';
        const existing = competitorMap.get(insight.competitorId) || { competitorName: compName, count: 0 };
        existing.count++;
        competitorMap.set(insight.competitorId, existing);
      }
    }

    const pricingOpportunityInsightsByCompetitor = Array.from(competitorMap.entries()).map(
      ([competitorId, val]) => ({
        competitorId,
        competitorName: val.competitorName,
        count: val.count,
      })
    ).sort((a, b) => b.count - a.count);

    const trend = this.generateUtcTimeSeries(insights, days);
    const recentInsights = insights.slice(0, 5).map((item) => this.mapToInsightDto(item));

    return {
      totalPricingOpportunityInsights,
      pricingOpportunityInsightsByCompetitor,
      trend,
      recentInsights,
    };
  }

  /**
   * Sentiment Shift Signal Analytics (type = 'SENTIMENT_SHIFT').
   */
  async getSentimentAnalytics(
    orgId: string,
    options?: { competitorId?: string; productId?: string; days?: number }
  ): Promise<SentimentAnalyticsDto> {
    const days = options?.days ?? 30;
    const where = this.buildWhereClause(orgId, {
      ...options,
      type: 'SENTIMENT_SHIFT',
    });

    const insights = await prisma.datasetInsight.findMany({
      where,
      select: {
        id: true,
        type: true,
        title: true,
        summary: true,
        confidence: true,
        createdAt: true,
        competitorId: true,
        productId: true,
        datasetId: true,
        competitor: { select: { name: true } },
        product: { select: { name: true } },
        dataset: { select: { originalFilename: true } },
      },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    });

    const totalSentimentShiftSignals = insights.length;

    const competitorMap = new Map<string, { competitorName: string; count: number }>();
    for (const insight of insights) {
      if (insight.competitorId) {
        const compName = insight.competitor?.name ?? 'Unknown Competitor';
        const existing = competitorMap.get(insight.competitorId) || { competitorName: compName, count: 0 };
        existing.count++;
        competitorMap.set(insight.competitorId, existing);
      }
    }

    const sentimentShiftSignalsByCompetitor = Array.from(competitorMap.entries()).map(
      ([competitorId, val]) => ({
        competitorId,
        competitorName: val.competitorName,
        count: val.count,
      })
    ).sort((a, b) => b.count - a.count);

    const trend = this.generateUtcTimeSeries(insights, days);
    const recentInsights = insights.slice(0, 5).map((item) => this.mapToInsightDto(item));

    return {
      totalSentimentShiftSignals,
      sentimentShiftSignalsByCompetitor,
      trend,
      recentInsights,
    };
  }

  /**
   * Returns distributions of insights by type and confidence for the organization.
   */
  async getInsightDistributions(orgId: string): Promise<InsightDistributionDto> {
    const where = this.buildWhereClause(orgId);

    const insights = await prisma.datasetInsight.findMany({
      where,
      select: {
        type: true,
        confidence: true,
      },
    });

    const insightsByType: Record<string, number> = {};
    const insightsByConfidence: Record<string, number> = {};

    for (const item of insights) {
      insightsByType[item.type] = (insightsByType[item.type] || 0) + 1;
      const confKey = item.confidence ? item.confidence.toUpperCase() : 'UNKNOWN';
      insightsByConfidence[confKey] = (insightsByConfidence[confKey] || 0) + 1;
    }

    return {
      insightsByType,
      insightsByConfidence,
    };
  }
}

export const intelligenceAnalyticsService = new IntelligenceAnalyticsService();
