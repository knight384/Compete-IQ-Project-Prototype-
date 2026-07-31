import { NextResponse } from 'next/server';
import { CompetitorService } from '../../../../../backend/modules/competitors/competitor.service';

const competitorService = new CompetitorService();
// Hardcoded Mock Org ID to bypass authentication as per Milestone 2.4.2 scope rules
const MOCK_ORG_ID = '11111111-1111-1111-1111-111111111111';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const data = await competitorService.getCompetitorById(id, MOCK_ORG_ID);
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
    const data = await competitorService.updateCompetitor(id, MOCK_ORG_ID, body);
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
    await competitorService.deleteCompetitor(id, MOCK_ORG_ID);
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
