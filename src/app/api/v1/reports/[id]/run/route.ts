import { NextRequest } from "next/server";
import { requireAuthenticatedContext, requireRole } from "@/backend/shared/utils/auth-context";
import { successResponse, errorResponse } from "@/backend/shared/utils/api-response";
import { reportService } from "@/backend/modules/reports/report.service";
import { Role } from "@prisma/client";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAuthenticatedContext();
  if (!authResult.success) {
    return authResult.response;
  }

  const roleError = requireRole(authResult.context, [Role.ADMIN, Role.ANALYST]);
  if (roleError) {
    return roleError;
  }

  const { id } = await params;

  try {
    const execution = await reportService.executeReport(id, authResult.context.orgId);
    if (!execution) {
      return errorResponse("Report not found", 404);
    }

    return successResponse(execution, 201);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to execute report";
    return errorResponse(message, 500);
  }
}
