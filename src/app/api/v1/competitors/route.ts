import { NextResponse } from 'next/server';
import { CompetitorService } from '../../../../backend/modules/competitors/competitor.service';

const competitorService = new CompetitorService();
// Hardcoded Mock Org ID to bypass authentication as per Milestone 2.4.2 scope rules
const MOCK_ORG_ID = '11111111-1111-1111-1111-111111111111';

export async function GET() {
  try {
    const data = await competitorService.listCompetitorsByOrganization(MOCK_ORG_ID);
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
    }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = await competitorService.createCompetitor({ ...body, orgId: MOCK_ORG_ID });
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
