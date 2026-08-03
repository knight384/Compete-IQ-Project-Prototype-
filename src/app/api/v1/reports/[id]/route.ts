import { NextRequest } from "next/server";
import { requireAuthenticatedContext, requireRole } from "@/backend/shared/utils/auth-context";
import { successResponse, errorResponse } from "@/backend/shared/utils/api-response";
import { reportService } from "@/backend/modules/reports/report.service";
import { Role } from "@prisma/client";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAuthenticatedContext();
  if (!authResult.success) {
    return authResult.response;
  }

  const roleError = requireRole(authResult.context, [Role.ADMIN, Role.ANALYST, Role.VIEWER]);
  if (roleError) {
    return roleError;
  }

  const { id } = await params;

  try {
    const report = await reportService.getReport(id, authResult.context.orgId);
    if (!report) {
      return errorResponse("Report not found", 404);
    }
    return successResponse(report);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to fetch report";
    return errorResponse(message, 500);
  }
}

export async function PUT(
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
    const body = await req.json().catch(() => ({}));
    const updated = await reportService.updateReport(id, authResult.context.orgId, {
      title: body.title,
      description: body.description,
      schedule: body.schedule,
    });

    if (!updated) {
      return errorResponse("Report not found", 404);
    }

    return successResponse(updated);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update report";
    return errorResponse(message, 400);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAuthenticatedContext();
  if (!authResult.success) {
    return authResult.response;
  }

  const roleError = requireRole(authResult.context, [Role.ADMIN]);
  if (roleError) {
    return roleError;
  }

  const { id } = await params;

  try {
    const deleted = await reportService.deleteReport(id, authResult.context.orgId);
    if (!deleted) {
      return errorResponse("Report not found", 404);
    }
    return successResponse({ deleted: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to delete report";
    return errorResponse(message, 500);
  }
}
