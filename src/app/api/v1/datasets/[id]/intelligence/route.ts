import { NextRequest } from 'next/server';
import { datasetService } from '@/backend/modules/datasets/dataset.service';
import { successResponse, errorResponse } from '@/backend/shared/utils/api-response';
import { requireAuthenticatedContext, requireRole } from '@/backend/shared/utils/auth-context';
import { Role } from '@prisma/client';
import {
  DatasetNotFoundError,
  DatasetStateError,
  DatasetIntegrityError,
} from '@/backend/shared/errors/dataset-errors';

export async function GET(
  request: NextRequest,
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

    const intelligence = await datasetService.getDatasetIntelligence(id, auth.context.orgId);

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
