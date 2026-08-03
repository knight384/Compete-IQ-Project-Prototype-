import { FeatureService } from '@/backend/modules/features/feature.service';
import { successResponse, errorResponse, parseRequestBody } from '@/backend/shared/utils/api-response';
import { requireAuthenticatedContext } from '@/backend/shared/utils/auth-context';

const featureService = new FeatureService();

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAuthenticatedContext();
    if (!auth.success) {
      return auth.response;
    }

    const { id } = await params;
    if (!id || id.trim() === '') {
      return errorResponse("Invalid feature ID.", 400);
    }

    const data = await featureService.getFeature(id, auth.context.orgId);
    return successResponse(data, 200);
  } catch (error: any) {
    const isNotFound = error.message?.includes('not found') || error.message?.includes('access denied');
    return errorResponse(error.message, isNotFound ? 404 : 500);
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAuthenticatedContext();
    if (!auth.success) {
      return auth.response;
    }

    const { id } = await params;
    if (!id || id.trim() === '') {
      return errorResponse("Invalid feature ID.", 400);
    }

    const body = await parseRequestBody(req);
    const data = await featureService.updateFeature(id, auth.context.orgId, body);
    return successResponse(data, 200);
  } catch (error: any) {
    const isNotFound = error.message?.includes('not found') || error.message?.includes('access denied');
    return errorResponse(error.message, isNotFound ? 404 : 400);
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAuthenticatedContext();
    if (!auth.success) {
      return auth.response;
    }

    const { id } = await params;
    if (!id || id.trim() === '') {
      return errorResponse("Invalid feature ID.", 400);
    }

    await featureService.deleteFeature(id, auth.context.orgId);
    return successResponse({ message: "Deleted successfully" }, 200);
  } catch (error: any) {
    const isNotFound = error.message?.includes('not found') || error.message?.includes('access denied');
    return errorResponse(error.message, isNotFound ? 404 : 400);
  }
}
