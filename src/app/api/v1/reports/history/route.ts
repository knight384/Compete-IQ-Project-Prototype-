import { requireAuthenticatedContext, requireRole } from "@/backend/shared/utils/auth-context";
import { successResponse, errorResponse } from "@/backend/shared/utils/api-response";
import { reportService } from "@/backend/modules/reports/report.service";
import { Role } from "@prisma/client";

export async function GET() {
  const authResult = await requireAuthenticatedContext();
  if (!authResult.success) {
    return authResult.response;
  }

  const roleError = requireRole(authResult.context, [Role.ADMIN, Role.ANALYST, Role.VIEWER]);
  if (roleError) {
    return roleError;
  }

  try {
    const history = await reportService.listExecutionHistory(authResult.context.orgId);
    return successResponse(history);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to fetch report history";
    return errorResponse(message, 500);
  }
}
