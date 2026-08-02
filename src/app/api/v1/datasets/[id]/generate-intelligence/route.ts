import { NextRequest } from 'next/server';
import { datasetService } from '../../../../../../backend/modules/datasets/dataset.service';
import { successResponse, errorResponse } from '../../../../../../backend/shared/utils/api-response';
import {
  DatasetNotFoundError,
  DatasetStateError,
  DatasetMappingError,
  DatasetValidationError,
  DatasetFormatError,
} from '../../../../../../backend/shared/errors/dataset-errors';
import {
  AiConfigurationError,
  AiProviderError,
  AiResponseValidationError,
} from '../../../../../../backend/shared/errors/ai-errors';

// Hardcoded MOCK_ORG_ID as per Milestone 4 specifications
const MOCK_ORG_ID = '11111111-1111-1111-1111-111111111111';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const result = await datasetService.generateDatasetIntelligence(id, MOCK_ORG_ID);

    return successResponse(result, 200, { message: 'Dataset intelligence generated safely' });
  } catch (error: unknown) {
    const errorType = error instanceof Error ? error.name : 'UnknownError';
    console.error(`generateDatasetIntelligence API error [${errorType}]`);

    if (error instanceof DatasetNotFoundError) {
      return errorResponse(error.message, 404);
    }

    if (error instanceof DatasetStateError) {
      return errorResponse(error.message, 409);
    }

    if (error instanceof DatasetMappingError || error instanceof DatasetValidationError || error instanceof DatasetFormatError) {
      return errorResponse(error.message, 400);
    }

    if (error instanceof AiProviderError) {
      return errorResponse(error.message, 502);
    }

    if (error instanceof AiConfigurationError || error instanceof AiResponseValidationError) {
      return errorResponse(error.message, 500);
    }

    return errorResponse('Internal server error', 500);
  }
}
