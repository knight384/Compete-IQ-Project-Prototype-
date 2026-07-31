import { NextResponse } from 'next/server';
import { ProductService } from '../../../../../backend/modules/products/product.service';

const productService = new ProductService();
// TODO: Replace with authenticated orgId checking once authentication is implemented.

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const data = await productService.getProduct(id);
    return NextResponse.json({
      success: true,
      data,
      meta: null,
      error: null
    }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      data: null,
      meta: null,
      error: { message: error.message }
    }, { status: 404 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const data = await productService.updateProduct(id, body);
    return NextResponse.json({
      success: true,
      data,
      meta: null,
      error: null
    }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      data: null,
      meta: null,
      error: { message: error.message }
    }, { status: 400 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await productService.deleteProduct(id);
    return NextResponse.json({
      success: true,
      data: { message: "Deleted successfully" },
      meta: null,
      error: null
    }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      data: null,
      meta: null,
      error: { message: error.message }
    }, { status: 400 });
  }
}
