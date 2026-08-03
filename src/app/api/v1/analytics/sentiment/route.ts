import { NextRequest } from 'next/server';
import { intelligenceAnalyticsService } from '../../../../../backend/modules/analytics/intelligence-analytics.service';
import { successResponse, errorResponse } from '../../../../../backend/shared/utils/api-response';

const MOCK_ORG_ID = '11111111-1111-1111-1111-111111111111';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const competitorId = searchParams.get('competitorId') ?? undefined;
    const productId = searchParams.get('productId') ?? undefined;
    const daysParam = searchParams.get('days');
    const days = daysParam ? parseInt(daysParam, 10) : 30;

    const data = await intelligenceAnalyticsService.getSentimentAnalytics(MOCK_ORG_ID, {
      competitorId,
      productId,
      days: isNaN(days) ? 30 : days,
    });

    return successResponse(data, 200);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch sentiment analytics';
    return errorResponse(message, 500);
  }
}
