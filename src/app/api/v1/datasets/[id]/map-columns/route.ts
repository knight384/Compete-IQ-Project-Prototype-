import { datasetService } from '@/backend/modules/datasets/dataset.service';
import { successResponse, errorResponse } from '@/backend/shared/utils/api-response';
import { toDatasetMetadataDto } from '@/backend/shared/utils/dataset-dtos';
import { requireAuthenticatedContext, requireRole } from '@/backend/shared/utils/auth-context';
import { Role } from '@prisma/client';
import { DatasetNotFoundError, DatasetStateError, DatasetMappingError } from '@/backend/shared/errors/dataset-errors';

export async function POST(
  request: Request,
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
    const body = await request.json();
    if (!body || !Array.isArray(body.mappings)) {
      return errorResponse('Invalid payload: "mappings" array is required.', 400);
    }

    const dataset = await datasetService.confirmColumnMapping(id, auth.context.orgId, body.mappings);

    return successResponse(toDatasetMetadataDto(dataset));
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
