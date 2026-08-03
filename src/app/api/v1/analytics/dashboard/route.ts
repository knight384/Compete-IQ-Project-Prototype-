import { dashboardAnalyticsService } from '@/backend/modules/analytics/dashboard-analytics.service';
import { successResponse, errorResponse } from '@/backend/shared/utils/api-response';
import { requireAuthenticatedContext } from '@/backend/shared/utils/auth-context';

/**
 * GET /api/v1/analytics/dashboard
 *
 * Returns aggregate dashboard analytics for the authenticated organization.
 */
export async function GET() {
  try {
    const auth = await requireAuthenticatedContext();
    if (!auth.success) {
      return auth.response;
    }

    const data = await dashboardAnalyticsService.getDashboardAnalytics(auth.context.orgId);
    return successResponse(data, 200);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch dashboard analytics';
    return errorResponse(message, 500);
  }
}
