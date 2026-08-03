import { datasetService } from '@/backend/modules/datasets/dataset.service';
import { successResponse, errorResponse } from '@/backend/shared/utils/api-response';
import { toDatasetMetadataDto } from '@/backend/shared/utils/dataset-dtos';
import { requireAuthenticatedContext, requireRole } from '@/backend/shared/utils/auth-context';
import { Role } from '@prisma/client';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuthenticatedContext();
    if (!auth.success) {
      return auth.response;
    }

    const forbidden = requireRole(auth.context, [Role.ADMIN, Role.ANALYST, Role.VIEWER]);
    if (forbidden) {
      return forbidden;
    }

    const { id } = await params;
    const dataset = await datasetService.getDatasetById(id, auth.context.orgId);
    return successResponse(toDatasetMetadataDto(dataset));
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
    const auth = await requireAuthenticatedContext();
    if (!auth.success) {
      return auth.response;
    }

    const forbidden = requireRole(auth.context, [Role.ADMIN]);
    if (forbidden) {
      return forbidden;
    }

    const { id } = await params;
    await datasetService.deleteDataset(id, auth.context.orgId);
    return successResponse(null, 204);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    if (message === 'Dataset not found') {
      return errorResponse(message, 404);
    }
    return errorResponse('Failed to delete dataset', 500);
  }
}
