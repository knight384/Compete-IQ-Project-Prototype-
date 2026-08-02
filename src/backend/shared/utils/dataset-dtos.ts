import { Dataset, DatasetStatus, DatasetFailureCode } from '@prisma/client';

export interface DatasetMetadataDto {
  id: string;
  originalFilename: string;
  format: string | null;
  fileSize: number | null;
  status: DatasetStatus;
  failureReason: string | null;
  failureCode: DatasetFailureCode | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Converts a raw Prisma Dataset object into a bounded DatasetMetadataDto.
 * Strictly excludes sensitive internal fields like storageKey, orgId, and semanticMapping.
 */
export function toDatasetMetadataDto(dataset: Dataset): DatasetMetadataDto {
  return {
    id: dataset.id,
    originalFilename: dataset.originalFilename,
    format: dataset.format,
    fileSize: dataset.fileSize !== null ? Number(dataset.fileSize) : null,
    status: dataset.status,
    failureReason: dataset.failureReason,
    failureCode: dataset.failureCode ?? null,
    createdAt: dataset.createdAt.toISOString(),
    updatedAt: dataset.updatedAt.toISOString(),
  };
}
