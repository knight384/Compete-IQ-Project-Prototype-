import { NextRequest } from 'next/server';
import { intelligenceAnalyticsService } from '../../../../../backend/modules/analytics/intelligence-analytics.service';
import { successResponse, errorResponse } from '../../../../../backend/shared/utils/api-response';

const MOCK_ORG_ID = '11111111-1111-1111-1111-111111111111';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const competitorId = searchParams.get('competitorId') ?? undefined;
    const productId = searchParams.get('productId') ?? undefined;
    const type = searchParams.get('type') ?? undefined;
    const cursor = searchParams.get('cursor') ?? undefined;

    const limitParam = searchParams.get('limit');
    const limit = limitParam ? parseInt(limitParam, 10) : 20;

    const data = await intelligenceAnalyticsService.getRecentInsights(MOCK_ORG_ID, {
      limit: isNaN(limit) ? 20 : limit,
      cursor,
      competitorId,
      productId,
      type,
    });

    return successResponse(data, 200);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch recent insights';
    return errorResponse(message, 500);
  }
}
