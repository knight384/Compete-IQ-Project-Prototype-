import { CompetitorService } from '@/backend/modules/competitors/competitor.service';
import { successResponse, errorResponse, parseRequestBody } from '@/backend/shared/utils/api-response';
import { requireAuthenticatedContext, requireRole } from '@/backend/shared/utils/auth-context';
import { Role } from '@prisma/client';

const competitorService = new CompetitorService();

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAuthenticatedContext();
    if (!auth.success) {
      return auth.response;
    }

    const forbidden = requireRole(auth.context, [Role.ADMIN, Role.ANALYST, Role.VIEWER]);
    if (forbidden) {
      return forbidden;
    }

    const { id } = await params;
    if (!id || id.trim() === '') {
      return errorResponse("Invalid competitor ID.", 400);
    }
    const data = await competitorService.getCompetitorById(id, auth.context.orgId);
    return successResponse(data, 200);
  } catch (error: any) {
    return errorResponse(error.message, 404);
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAuthenticatedContext();
    if (!auth.success) {
      return auth.response;
    }

    const forbidden = requireRole(auth.context, [Role.ADMIN, Role.ANALYST]);
    if (forbidden) {
      return forbidden;
    }

    const { id } = await params;
    if (!id || id.trim() === '') {
      return errorResponse("Invalid competitor ID.", 400);
    }
    const body = await parseRequestBody(req);
    const data = await competitorService.updateCompetitor(id, auth.context.orgId, body);
    return successResponse(data, 200);
  } catch (error: any) {
    const status = error.message?.includes('not found') || error.message?.includes('access denied') ? 404 : 400;
    return errorResponse(error.message, status);
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAuthenticatedContext();
    if (!auth.success) {
      return auth.response;
    }

    const forbidden = requireRole(auth.context, [Role.ADMIN]);
    if (forbidden) {
      return forbidden;
    }

    const { id } = await params;
    if (!id || id.trim() === '') {
      return errorResponse("Invalid competitor ID.", 400);
    }
    await competitorService.deleteCompetitor(id, auth.context.orgId);
    return successResponse({ message: "Deleted successfully" }, 200);
  } catch (error: any) {
    const status = error.message?.includes('not found') || error.message?.includes('access denied') ? 404 : 400;
    return errorResponse(error.message, status);
  }
}
