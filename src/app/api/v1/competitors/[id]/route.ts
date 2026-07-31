import { CompetitorService } from '../../../../../backend/modules/competitors/competitor.service';
import { successResponse, errorResponse, parseRequestBody } from '../../../../../backend/shared/utils/api-response';

const competitorService = new CompetitorService();
// TODO: Replace with authenticated orgId checking once authentication is implemented.
const MOCK_ORG_ID = '11111111-1111-1111-1111-111111111111';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!id || id.trim() === '') {
      return errorResponse("Invalid competitor ID.", 400);
    }
    const data = await competitorService.getCompetitorById(id, MOCK_ORG_ID);
    return successResponse(data, 200);
  } catch (error: any) {
    return errorResponse(error.message, 404);
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!id || id.trim() === '') {
      return errorResponse("Invalid competitor ID.", 400);
    }
    const body = await parseRequestBody(req);
    const data = await competitorService.updateCompetitor(id, MOCK_ORG_ID, body);
    return successResponse(data, 200);
  } catch (error: any) {
    return errorResponse(error.message, 400);
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!id || id.trim() === '') {
      return errorResponse("Invalid competitor ID.", 400);
    }
    await competitorService.deleteCompetitor(id, MOCK_ORG_ID);
    return successResponse({ message: "Deleted successfully" }, 200);
  } catch (error: any) {
    return errorResponse(error.message, 400);
  }
}
