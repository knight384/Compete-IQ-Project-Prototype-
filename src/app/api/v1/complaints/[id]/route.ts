import { NextRequest } from "next/server";
import { requireAuthenticatedContext, requireRole } from "@/backend/shared/utils/auth-context";
import { successResponse, errorResponse } from "@/backend/shared/utils/api-response";
import { complaintService } from "@/backend/modules/complaints/complaint.service";
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
    const complaint = await complaintService.getComplaint(id, authResult.context.orgId);
    if (!complaint) {
      return errorResponse("Complaint not found", 404);
    }
    return successResponse(complaint);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to fetch complaint";
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
    const updated = await complaintService.updateComplaint(id, authResult.context.orgId, {
      text: body.text,
      severity: body.severity,
      frequency: body.frequency,
      trend: body.trend,
      competitorId: body.competitorId,
      productId: body.productId,
    });

    if (!updated) {
      return errorResponse("Complaint not found", 404);
    }

    return successResponse(updated);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update complaint";
    if (message.startsWith("NOT_FOUND")) {
      return errorResponse(message, 404);
    }
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
    const deleted = await complaintService.deleteComplaint(id, authResult.context.orgId);
    if (!deleted) {
      return errorResponse("Complaint not found", 404);
    }
    return successResponse({ deleted: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to delete complaint";
    return errorResponse(message, 500);
  }
}
