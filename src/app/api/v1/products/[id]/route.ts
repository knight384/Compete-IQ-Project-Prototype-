import { ProductService } from '../../../../../backend/modules/products/product.service';
import { successResponse, errorResponse, parseRequestBody } from '../../../../../backend/shared/utils/api-response';

const productService = new ProductService();
// TODO: Replace with authenticated orgId checking once authentication is implemented.

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!id || id.trim() === '') {
      return errorResponse("Invalid product ID.", 400);
    }
    const data = await productService.getProduct(id);
    return successResponse(data, 200);
  } catch (error: any) {
    return errorResponse(error.message, 404);
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!id || id.trim() === '') {
      return errorResponse("Invalid product ID.", 400);
    }
    const body = await parseRequestBody(req);
    const data = await productService.updateProduct(id, body);
    return successResponse(data, 200);
  } catch (error: any) {
    return errorResponse(error.message, 400);
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!id || id.trim() === '') {
      return errorResponse("Invalid product ID.", 400);
    }
    await productService.deleteProduct(id);
    return successResponse({ message: "Deleted successfully" }, 200);
  } catch (error: any) {
    return errorResponse(error.message, 400);
  }
}
