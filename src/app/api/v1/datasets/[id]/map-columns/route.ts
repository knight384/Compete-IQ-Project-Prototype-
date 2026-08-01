import { datasetService } from '@/backend/modules/datasets/dataset.service';
import { successResponse, errorResponse } from '@/backend/shared/utils/api-response';
import { DatasetNotFoundError, DatasetStateError, DatasetMappingError } from '@/backend/shared/errors/dataset-errors';

// MOCK_ORG_ID until auth is integrated
const MOCK_ORG_ID = '11111111-1111-1111-1111-111111111111';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    if (!body || !Array.isArray(body.mappings)) {
      return errorResponse('Invalid payload: "mappings" array is required.', 400);
    }

    const dataset = await datasetService.confirmColumnMapping(id, MOCK_ORG_ID, body.mappings);

    return successResponse(dataset);
  } catch (error: unknown) {
    if (error instanceof DatasetNotFoundError) {
      return errorResponse(error.message, 404);
    }
    if (error instanceof DatasetStateError || error instanceof DatasetMappingError) {
      return errorResponse(error.message, 400);
    }

    console.error('Mapping confirmation failed:', error);
    return errorResponse('Internal server error during mapping confirmation.', 500);
  }
}
