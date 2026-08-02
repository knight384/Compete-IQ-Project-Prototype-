import { NextResponse } from 'next/server';
import { datasetService } from '@/backend/modules/datasets/dataset.service';
import { successResponse, errorResponse } from '@/backend/shared/utils/api-response';
import { toDatasetMetadataDto } from '@/backend/shared/utils/dataset-dtos';

// Temporary mock organization ID as defined by conventions
const MOCK_ORG_ID = '11111111-1111-1111-1111-111111111111';

export async function POST(req: Request) {
  try {
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

    // TODO: Replace MOCK_ORG_ID with real auth tenant context
    const dataset = await datasetService.uploadDataset(
      MOCK_ORG_ID,
      originalFilename,
      mimeType,
      buffer
    );

    // Return the created dataset metadata using standard envelope
    return successResponse(toDatasetMetadataDto(dataset), 201);
  } catch (error: unknown) {
    console.error('Dataset upload error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error during upload';
    // Mapping safe service errors to 400 Bad Request, others to 500
    if (message.includes('Unsupported') || message.includes('File is empty') || message.includes('exceeds') || message.includes('extension')) {
       return errorResponse(message, 400);
    }
    return errorResponse(message, 500);
  }
}

export async function GET(req: Request) {
  try {
    // TODO: Replace MOCK_ORG_ID with real auth tenant context
    const datasets = await datasetService.getDatasets(MOCK_ORG_ID);
    return successResponse(datasets.map(toDatasetMetadataDto));
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch datasets';
    return errorResponse(message, 500);
  }
}
