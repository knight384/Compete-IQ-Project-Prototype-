import { ProductService } from '@/backend/modules/products/product.service';
import { CompetitorService } from '@/backend/modules/competitors/competitor.service';
import { successResponse, errorResponse, parseRequestBody } from '@/backend/shared/utils/api-response';
import { requireAuthenticatedContext } from '@/backend/shared/utils/auth-context';

const productService = new ProductService();
const competitorService = new CompetitorService();

export async function GET(req: Request) {
  try {
    const auth = await requireAuthenticatedContext();
    if (!auth.success) {
      return auth.response;
    }

    const url = new URL(req.url);
    const competitorId = url.searchParams.get('competitorId');

    if (!competitorId || competitorId.trim() === '') {
      return errorResponse("competitorId query parameter is required.", 400);
    }

    // Verify competitorId belongs to the authenticated organization.
    // getCompetitorById throws if not found or owned by another tenant.
    try {
      await competitorService.getCompetitorById(competitorId, auth.context.orgId);
    } catch {
      return errorResponse("Competitor not found.", 404);
    }

    const data = await productService.listProductsByCompetitor(competitorId);
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

    const body = await parseRequestBody(req);

    if (!body.competitorId || body.competitorId.trim() === '') {
      return errorResponse("competitorId is required.", 400);
    }

    // Verify competitorId belongs to the authenticated organization.
    try {
      await competitorService.getCompetitorById(body.competitorId, auth.context.orgId);
    } catch {
      return errorResponse("Competitor not found.", 404);
    }

    const data = await productService.createProduct(body);
    return successResponse(data, 201);
  } catch (error: any) {
    return errorResponse(error.message, 400);
  }
}
