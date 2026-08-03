import { NextRequest } from 'next/server';
import { datasetService } from '@/backend/modules/datasets/dataset.service';
import { successResponse, errorResponse } from '@/backend/shared/utils/api-response';
import { requireAuthenticatedContext } from '@/backend/shared/utils/auth-context';
import {
  DatasetNotFoundError,
  DatasetStateError,
  DatasetMappingError,
  DatasetValidationError,
  DatasetFormatError,
} from '@/backend/shared/errors/dataset-errors';
import {
  AiConfigurationError,
  AiProviderError,
  AiResponseValidationError,
} from '@/backend/shared/errors/ai-errors';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuthenticatedContext();
    if (!auth.success) {
      return auth.response;
    }

    const { id } = await params;

    const result = await datasetService.generateDatasetIntelligence(id, auth.context.orgId);

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
