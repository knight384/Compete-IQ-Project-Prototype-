import { FeatureService } from '@/backend/modules/features/feature.service';
import { ProductService } from '@/backend/modules/products/product.service';
import { successResponse, errorResponse, parseRequestBody } from '@/backend/shared/utils/api-response';
import { requireAuthenticatedContext } from '@/backend/shared/utils/auth-context';

const featureService = new FeatureService();
const productService = new ProductService();

export async function GET(req: Request) {
  try {
    const auth = await requireAuthenticatedContext();
    if (!auth.success) {
      return auth.response;
    }

    const url = new URL(req.url);
    const productId = url.searchParams.get('productId');

    if (!productId || productId.trim() === '') {
      return errorResponse("productId query parameter is required.", 400);
    }

    // Verify productId belongs to the authenticated organization (through product.competitor.orgId).
    try {
      await productService.getProduct(productId, auth.context.orgId);
    } catch {
      return errorResponse("Product not found.", 404);
    }

    const data = await featureService.listFeaturesByProduct(productId);
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

    if (!body.productId || body.productId.trim() === '') {
      return errorResponse("productId is required.", 400);
    }

    // Verify productId belongs to the authenticated organization.
    try {
      await productService.getProduct(body.productId, auth.context.orgId);
    } catch {
      return errorResponse("Product not found.", 404);
    }

    const data = await featureService.createFeature(body);
    return successResponse(data, 201);
  } catch (error: any) {
    return errorResponse(error.message, 400);
  }
}
