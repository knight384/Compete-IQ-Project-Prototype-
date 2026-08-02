import { dashboardAnalyticsService } from '../../../../../backend/modules/analytics/dashboard-analytics.service';
import { successResponse, errorResponse } from '../../../../../backend/shared/utils/api-response';

/**
 * GET /api/v1/analytics/dashboard
 *
 * Returns aggregate dashboard analytics for the current organization.
 *
 * TECHNICAL DEBT: MOCK_ORG_ID is a temporary placeholder for the authenticated tenant context.
 * Only this HTTP boundary uses MOCK_ORG_ID. DashboardAnalyticsService itself never imports
 * or references MOCK_ORG_ID — it accepts orgId as a parameter — so replacing this with
 * real authentication requires changes to this file only.
 */

// TODO: Replace with authenticated orgId from session once authentication is implemented.
const MOCK_ORG_ID = '11111111-1111-1111-1111-111111111111';

export async function GET() {
  try {
    const data = await dashboardAnalyticsService.getDashboardAnalytics(MOCK_ORG_ID);
    return successResponse(data, 200);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch dashboard analytics';
    return errorResponse(message, 500);
  }
}
