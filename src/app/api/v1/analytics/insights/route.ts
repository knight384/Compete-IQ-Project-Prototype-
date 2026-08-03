import { NextRequest } from 'next/server';
import { intelligenceAnalyticsService } from '@/backend/modules/analytics/intelligence-analytics.service';
import { successResponse, errorResponse } from '@/backend/shared/utils/api-response';
import { requireAuthenticatedContext } from '@/backend/shared/utils/auth-context';

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuthenticatedContext();
    if (!auth.success) {
      return auth.response;
    }

    const { searchParams } = new URL(request.url);
    const competitorId = searchParams.get('competitorId') ?? undefined;
    const productId = searchParams.get('productId') ?? undefined;
    const type = searchParams.get('type') ?? undefined;
    const cursor = searchParams.get('cursor') ?? undefined;

    const limitParam = searchParams.get('limit');
    const limit = limitParam ? parseInt(limitParam, 10) : 20;

    const data = await intelligenceAnalyticsService.getRecentInsights(auth.context.orgId, {
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
