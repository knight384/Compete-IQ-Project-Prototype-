import { NextRequest } from "next/server";
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
    const reports = await reportService.listReports(authResult.context.orgId);
    return successResponse(reports);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to fetch reports";
    return errorResponse(message, 500);
  }
}

export async function POST(req: NextRequest) {
  const authResult = await requireAuthenticatedContext();
  if (!authResult.success) {
    return authResult.response;
  }

  const roleError = requireRole(authResult.context, [Role.ADMIN, Role.ANALYST]);
  if (roleError) {
    return roleError;
  }

  try {
    const body = await req.json().catch(() => ({}));
    
    // Explicitly derive orgId and createdById from authenticated session context
    const newReport = await reportService.createReport({
      title: body.title,
      description: body.description,
      schedule: body.schedule,
      orgId: authResult.context.orgId,
      createdById: authResult.context.userId,
    });

    return successResponse(newReport, 201);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to create report";
    return errorResponse(message, 400);
  }
}
