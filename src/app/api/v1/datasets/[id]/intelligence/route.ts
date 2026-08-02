import { NextRequest } from 'next/server';
import { datasetService } from '../../../../../../backend/modules/datasets/dataset.service';
import { successResponse, errorResponse } from '../../../../../../backend/shared/utils/api-response';
import {
  DatasetNotFoundError,
  DatasetStateError,
  DatasetIntegrityError,
} from '../../../../../../backend/shared/errors/dataset-errors';

// Hardcoded MOCK_ORG_ID as per Milestone 4 specifications
const MOCK_ORG_ID = '11111111-1111-1111-1111-111111111111';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const intelligence = await datasetService.getDatasetIntelligence(id, MOCK_ORG_ID);

    return successResponse(intelligence);
  } catch (error: unknown) {
    if (error instanceof DatasetNotFoundError) {
      return errorResponse(error.message, 404);
    }
    
    if (error instanceof DatasetStateError) {
      return errorResponse(error.message, 409);
    }

    if (error instanceof DatasetIntegrityError) {
      return errorResponse(error.message, 500);
    }

    return errorResponse('Failed to retrieve dataset intelligence due to an internal error.', 500);
  }
}
