import { datasetService } from '@/backend/modules/datasets/dataset.service';
import { successResponse, errorResponse } from '@/backend/shared/utils/api-response';
import { DatasetNotFoundError, DatasetValidationError, DatasetFormatError } from '@/backend/shared/errors/dataset-errors';

const MOCK_ORG_ID = '11111111-1111-1111-1111-111111111111';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Parse the dataset using the service layer
    const parsedDataset = await datasetService.parseDataset(id, MOCK_ORG_ID);

    // Return safe metadata (no raw rows to avoid giant payload)
    const metadata = {
      datasetId: id,
      status: 'MAPPING_REQUIRED',
      rowCount: parsedDataset.rowCount,
      columnCount: parsedDataset.columnCount,
      headers: parsedDataset.headers,
    };

    return successResponse(metadata);
  } catch (error: unknown) {
    if (error instanceof DatasetNotFoundError) {
      return errorResponse(error.message, 404);
    }
    
    if (error instanceof DatasetValidationError || error instanceof DatasetFormatError) {
      return errorResponse(error.message, 400);
    }
    
    console.error('Unexpected parse infrastructure failure:', error);
    return errorResponse('Failed to parse dataset', 500);
  }
}
