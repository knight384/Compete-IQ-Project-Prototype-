import { NextResponse } from 'next/server';
import { FeatureService } from '../../../../backend/modules/features/feature.service';

const featureService = new FeatureService();
// TODO: Replace with authenticated orgId checking once authentication is implemented.

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const productId = url.searchParams.get('productId');

    if (!productId) {
      throw new Error("productId query parameter is required.");
    }

    const data = await featureService.listFeaturesByProduct(productId);
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
    const data = await featureService.createFeature(body);
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
