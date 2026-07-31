import { ProductService } from '../../../../backend/modules/products/product.service';
import { successResponse, errorResponse, parseRequestBody } from '../../../../backend/shared/utils/api-response';

const productService = new ProductService();
// TODO: Replace with authenticated orgId checking once authentication is implemented.

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const competitorId = url.searchParams.get('competitorId');

    if (!competitorId || competitorId.trim() === '') {
      return errorResponse("competitorId query parameter is required.", 400);
    }

    const data = await productService.listProductsByCompetitor(competitorId);
    return successResponse(data, 200);
  } catch (error: any) {
    return errorResponse(error.message, 400);
  }
}

export async function POST(req: Request) {
  try {
    const body = await parseRequestBody(req);
    const data = await productService.createProduct(body);
    return successResponse(data, 201);
  } catch (error: any) {
    return errorResponse(error.message, 400);
  }
}
