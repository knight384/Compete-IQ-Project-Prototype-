import { datasetService } from '@/backend/modules/datasets/dataset.service';
import { successResponse, errorResponse } from '@/backend/shared/utils/api-response';
import { toDatasetMetadataDto } from '@/backend/shared/utils/dataset-dtos';
import { requireAuthenticatedContext, requireRole } from '@/backend/shared/utils/auth-context';
import { Role } from '@prisma/client';

export async function POST(req: Request) {
  try {
    const auth = await requireAuthenticatedContext();
    if (!auth.success) {
      return auth.response;
    }

    const forbidden = requireRole(auth.context, [Role.ADMIN, Role.ANALYST]);
    if (forbidden) {
      return forbidden;
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return errorResponse('Missing file in multipart/form-data payload.', 400);
    }

    const originalFilename = file.name;
    const mimeType = file.type;

    // Convert Web File to Buffer for processing/storage
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // orgId is bound exclusively from the authenticated session context
    const dataset = await datasetService.uploadDataset(
      auth.context.orgId,
      originalFilename,
      mimeType,
      buffer
    );

    return successResponse(toDatasetMetadataDto(dataset), 201);
  } catch (error: unknown) {
    console.error('Dataset upload error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error during upload';
    if (message.includes('Unsupported') || message.includes('File is empty') || message.includes('exceeds') || message.includes('extension')) {
      return errorResponse(message, 400);
    }
    return errorResponse(message, 500);
  }
}

export async function GET(req: Request) {
  try {
    const auth = await requireAuthenticatedContext();
    if (!auth.success) {
      return auth.response;
    }

    const forbidden = requireRole(auth.context, [Role.ADMIN, Role.ANALYST, Role.VIEWER]);
    if (forbidden) {
      return forbidden;
    }

    const datasets = await datasetService.getDatasets(auth.context.orgId);
    return successResponse(datasets.map(toDatasetMetadataDto));
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch datasets';
    return errorResponse(message, 500);
  }
}
