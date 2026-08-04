import { NextRequest } from "next/server";
import { requireAuthenticatedContext, requireRole } from "@/backend/shared/utils/auth-context";
import { successResponse, errorResponse } from "@/backend/shared/utils/api-response";
import { complaintService } from "@/backend/modules/complaints/complaint.service";
import { Role, ComplaintSeverity, ComplaintTrend } from "@prisma/client";

export async function GET(req: NextRequest) {
  const authResult = await requireAuthenticatedContext();
  if (!authResult.success) {
    return authResult.response;
  }

  const roleError = requireRole(authResult.context, [Role.ADMIN, Role.ANALYST, Role.VIEWER]);
  if (roleError) {
    return roleError;
  }

  const { searchParams } = new URL(req.url);
  const severityStr = searchParams.get("severity");
  const trendStr = searchParams.get("trend");
  const competitorId = searchParams.get("competitorId") || undefined;
  const productId = searchParams.get("productId") || undefined;

  const severity = severityStr && Object.values(ComplaintSeverity).includes(severityStr as ComplaintSeverity)
    ? (severityStr as ComplaintSeverity)
    : undefined;

  const trend = trendStr && Object.values(ComplaintTrend).includes(trendStr as ComplaintTrend)
    ? (trendStr as ComplaintTrend)
    : undefined;

  try {
    const complaints = await complaintService.listComplaints(authResult.context.orgId, {
      severity,
      trend,
      competitorId,
      productId,
    });
    return successResponse(complaints);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to fetch complaints";
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
    
    // Explicitly derive orgId from authenticated context (ignoring body.orgId)
    const newComplaint = await complaintService.createComplaint({
      text: body.text,
      severity: body.severity,
      frequency: body.frequency,
      trend: body.trend,
      orgId: authResult.context.orgId,
      competitorId: body.competitorId,
      productId: body.productId,
    });

    return successResponse(newComplaint, 201);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to create complaint";
    if (message.startsWith("NOT_FOUND")) {
      return errorResponse(message, 404);
    }
    return errorResponse(message, 400);
  }
}
