import { NextResponse } from 'next/server';
import { datasetService } from '@/backend/modules/datasets/dataset.service';
import { successResponse, errorResponse } from '@/backend/shared/utils/api-response';

const MOCK_ORG_ID = '11111111-1111-1111-1111-111111111111';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const dataset = await datasetService.getDatasetById(id, MOCK_ORG_ID);
    return successResponse(dataset);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    if (message === 'Dataset not found') {
      return errorResponse(message, 404);
    }
    return errorResponse('Failed to fetch dataset', 500);
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await datasetService.deleteDataset(id, MOCK_ORG_ID);
    return successResponse(null, 204);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    if (message === 'Dataset not found') {
      return errorResponse(message, 404);
    }
    return errorResponse('Failed to delete dataset', 500);
  }
}
