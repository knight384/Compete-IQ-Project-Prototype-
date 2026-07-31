import { NextResponse } from 'next/server';
import { ProductService } from '../../../../backend/modules/products/product.service';

const productService = new ProductService();
// TODO: Replace with authenticated orgId checking once authentication is implemented.

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const competitorId = url.searchParams.get('competitorId');

    if (!competitorId) {
      throw new Error("competitorId query parameter is required.");
    }

    const data = await productService.listProductsByCompetitor(competitorId);
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

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = await productService.createProduct(body);
    return NextResponse.json({
      success: true,
      data,
      meta: null,
      error: null
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      data: null,
      meta: null,
      error: { message: error.message }
    }, { status: 400 });
  }
}
