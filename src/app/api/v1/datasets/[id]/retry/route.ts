import { NextRequest } from 'next/server';
import { datasetService } from '@/backend/modules/datasets/dataset.service';
import { successResponse, errorResponse } from '@/backend/shared/utils/api-response';
import { toDatasetMetadataDto } from '@/backend/shared/utils/dataset-dtos';
import {
  DatasetNotFoundError,
  DatasetStateError,
} from '@/backend/shared/errors/dataset-errors';

// Hardcoded MOCK_ORG_ID as per Milestone 4 specifications
const MOCK_ORG_ID = '11111111-1111-1111-1111-111111111111';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const dataset = await datasetService.retryDatasetProcessing(id, MOCK_ORG_ID);

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
