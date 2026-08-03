import { CompetitorService } from '@/backend/modules/competitors/competitor.service';
import { successResponse, errorResponse, parseRequestBody } from '@/backend/shared/utils/api-response';
import { requireAuthenticatedContext, requireRole } from '@/backend/shared/utils/auth-context';
import { Role } from '@prisma/client';

const competitorService = new CompetitorService();

export async function GET() {
  try {
    const auth = await requireAuthenticatedContext();
    if (!auth.success) {
      return auth.response;
    }

    const forbidden = requireRole(auth.context, [Role.ADMIN, Role.ANALYST, Role.VIEWER]);
    if (forbidden) {
      return forbidden;
    }

    const data = await competitorService.listCompetitorsByOrganization(auth.context.orgId);
    return successResponse(data, 200);
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}

export async function POST(req: Request) {
  try {
    const auth = await requireAuthenticatedContext();
    if (!auth.success) {
      return auth.response;
    }

    const forbidden = requireRole(auth.context, [Role.ADMIN, Role.ANALYST]);
    if (forbidden) {
      return forbidden;
    }

    const body = await parseRequestBody(req);
    // Ensure orgId comes exclusively from authenticated session context
    const data = await competitorService.createCompetitor({ ...body, orgId: auth.context.orgId });
    return successResponse(data, 201);
  } catch (error: any) {
    return errorResponse(error.message, 400);
  }
}
