import { FeatureService } from '../../../../backend/modules/features/feature.service';
import { successResponse, errorResponse, parseRequestBody } from '../../../../backend/shared/utils/api-response';

const featureService = new FeatureService();
// TODO: Replace with authenticated orgId checking once authentication is implemented.

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const productId = url.searchParams.get('productId');

    if (!productId || productId.trim() === '') {
      return errorResponse("productId query parameter is required.", 400);
    }

    const data = await featureService.listFeaturesByProduct(productId);
    return successResponse(data, 200);
  } catch (error: any) {
    return errorResponse(error.message, 400);
  }
}

export async function POST(req: Request) {
  try {
    const body = await parseRequestBody(req);
    const data = await featureService.createFeature(body);
    return successResponse(data, 201);
  } catch (error: any) {
    return errorResponse(error.message, 400);
  }
}
