import { datasetService } from '@/backend/modules/datasets/dataset.service';
import { successResponse, errorResponse } from '@/backend/shared/utils/api-response';
import { DatasetNotFoundError, DatasetStateError } from '@/backend/shared/errors/dataset-errors';

// MOCK_ORG_ID until auth is integrated
const MOCK_ORG_ID = '11111111-1111-1111-1111-111111111111';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const suggestions = await datasetService.getMappingSuggestions(id, MOCK_ORG_ID);

    return successResponse({
      datasetId: id,
      suggestions
    });
  } catch (error: unknown) {
    if (error instanceof DatasetNotFoundError) {
      return errorResponse(error.message, 404);
    }
    if (error instanceof DatasetStateError) {
      return errorResponse(error.message, 400);
    }

    console.error('Mapping suggestions failed:', error);
    return errorResponse('Internal server error during mapping suggestions.', 500);
  }
}
