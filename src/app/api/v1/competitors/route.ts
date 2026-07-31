import { CompetitorService } from '../../../../backend/modules/competitors/competitor.service';
import { successResponse, errorResponse, parseRequestBody } from '../../../../backend/shared/utils/api-response';

const competitorService = new CompetitorService();
// TODO: Replace with authenticated orgId checking once authentication is implemented.
const MOCK_ORG_ID = '11111111-1111-1111-1111-111111111111';

export async function GET() {
  try {
    const data = await competitorService.listCompetitorsByOrganization(MOCK_ORG_ID);
    return successResponse(data, 200);
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}

export async function POST(req: Request) {
  try {
    const body = await parseRequestBody(req);
    const data = await competitorService.createCompetitor({ ...body, orgId: MOCK_ORG_ID });
    return successResponse(data, 201);
  } catch (error: any) {
    return errorResponse(error.message, 400);
  }
}
