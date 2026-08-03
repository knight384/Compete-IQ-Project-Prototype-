import { NextRequest } from 'next/server';
import { datasetService } from '@/backend/modules/datasets/dataset.service';
import { successResponse, errorResponse } from '@/backend/shared/utils/api-response';
import { toDatasetMetadataDto } from '@/backend/shared/utils/dataset-dtos';
import { requireAuthenticatedContext } from '@/backend/shared/utils/auth-context';
import {
  DatasetNotFoundError,
  DatasetStateError,
} from '@/backend/shared/errors/dataset-errors';

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

    const dataset = await datasetService.retryDatasetProcessing(id, auth.context.orgId);

    return successResponse(toDatasetMetadataDto(dataset), 200, {
      message: 'Dataset status reset to MAPPED for retry.',
    });
  } catch (error: unknown) {
    if (error instanceof DatasetNotFoundError) {
      return errorResponse(error.message, 404);
    }

    if (error instanceof DatasetStateError) {
      return errorResponse(error.message, 409);
    }

    console.error('Retry dataset error:', error);
    return errorResponse('Failed to retry dataset due to an internal error.', 500);
  }
}
