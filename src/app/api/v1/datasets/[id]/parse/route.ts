import { datasetService } from '@/backend/modules/datasets/dataset.service';
import { successResponse, errorResponse } from '@/backend/shared/utils/api-response';
import { requireAuthenticatedContext, requireRole } from '@/backend/shared/utils/auth-context';
import { Role } from '@prisma/client';
import { DatasetNotFoundError, DatasetValidationError, DatasetFormatError } from '@/backend/shared/errors/dataset-errors';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuthenticatedContext();
    if (!auth.success) {
      return auth.response;
    }

    const forbidden = requireRole(auth.context, [Role.ADMIN, Role.ANALYST]);
    if (forbidden) {
      return forbidden;
    }

    const { id } = await params;

    const parsedDataset = await datasetService.parseDataset(id, auth.context.orgId);

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
