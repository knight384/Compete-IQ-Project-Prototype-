import { ProductService } from '@/backend/modules/products/product.service';
import { successResponse, errorResponse, parseRequestBody } from '@/backend/shared/utils/api-response';
import { requireAuthenticatedContext, requireRole } from '@/backend/shared/utils/auth-context';
import { Role } from '@prisma/client';

const productService = new ProductService();

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
      return errorResponse("Invalid product ID.", 400);
    }

    const data = await productService.getProduct(id, auth.context.orgId);
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

    const forbidden = requireRole(auth.context, [Role.ADMIN, Role.ANALYST]);
    if (forbidden) {
      return forbidden;
    }

    const { id } = await params;
    if (!id || id.trim() === '') {
      return errorResponse("Invalid product ID.", 400);
    }

    const body = await parseRequestBody(req);
    const data = await productService.updateProduct(id, auth.context.orgId, body);
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

    const forbidden = requireRole(auth.context, [Role.ADMIN]);
    if (forbidden) {
      return forbidden;
    }

    const { id } = await params;
    if (!id || id.trim() === '') {
      return errorResponse("Invalid product ID.", 400);
    }

    await productService.deleteProduct(id, auth.context.orgId);
    return successResponse({ message: "Deleted successfully" }, 200);
  } catch (error: any) {
    const isNotFound = error.message?.includes('not found') || error.message?.includes('access denied');
    return errorResponse(error.message, isNotFound ? 404 : 400);
  }
}
