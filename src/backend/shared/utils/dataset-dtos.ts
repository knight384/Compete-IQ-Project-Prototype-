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

export interface BoundedEvidence {
  sourceColumns: string[];
  sampleRowIndices: number[];
}

export interface DatasetProfileDto {
  rowCount: number | null;
  columnCount: number | null;
  columnMetadata: unknown;
  summaryStatistics: unknown;
}

export interface DatasetInsightDto {
  type: string;
  title: string;
  summary: string;
  confidence: string | null;
  evidence: BoundedEvidence | null;
}

export interface DatasetIntelligenceDto {
  datasetId: string;
  status: string;
  failureReason: string | null;
  failureCode: DatasetFailureCode | null;
  profile: DatasetProfileDto | null;
  insights: DatasetInsightDto[];
}

/**
 * Normalizes raw evidence stored in PostgreSQL JSONB with strict fail-closed validation.
 * Returns BoundedEvidence object or null if invalid, empty, or malformed.
 */
export function normalizeEvidence(raw: unknown): BoundedEvidence | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return null;
  }

  const obj = raw as Record<string, unknown>;

  const hasSourceCols = 'sourceColumns' in obj && obj.sourceColumns !== undefined;
  const hasSampleIndices = 'sampleRowIndices' in obj && obj.sampleRowIndices !== undefined;

  let sourceColumns: string[] = [];
  if (hasSourceCols) {
    if (!Array.isArray(obj.sourceColumns)) {
      return null;
    }
    for (const item of obj.sourceColumns) {
      if (typeof item !== 'string' || item.trim() === '') {
        return null;
      }
      sourceColumns.push(item);
    }
  }

  let sampleRowIndices: number[] = [];
  if (hasSampleIndices) {
    if (!Array.isArray(obj.sampleRowIndices)) {
      return null;
    }
    for (const item of obj.sampleRowIndices) {
      if (
        typeof item !== 'number' ||
        !Number.isFinite(item) ||
        !Number.isInteger(item) ||
        item < 0
      ) {
        return null;
      }
      sampleRowIndices.push(item);
    }
  }

  // Deduplicate sourceColumns
  const dedupedCols = Array.from(new Set(sourceColumns));

  // Deduplicate and sort sampleRowIndices ascending
  const dedupedIndices = Array.from(new Set(sampleRowIndices)).sort((a, b) => a - b);

  if (dedupedCols.length === 0 && dedupedIndices.length === 0) {
    return null;
  }

  return {
    sourceColumns: dedupedCols,
    sampleRowIndices: dedupedIndices,
  };
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

/**
 * Converts a database Dataset record with profile and insights into a bounded DatasetIntelligenceDto.
 * Strictly excludes internal fields (storageKey, orgId, semanticMapping, insight.id, competitorId, productId).
 */
export function toDatasetIntelligenceDto(dataset: {
  id: string;
  status: DatasetStatus;
  failureReason: string | null;
  failureCode: DatasetFailureCode | null;
  profile?: {
    rowCount: number | null;
    columnCount: number | null;
    columnMetadata: unknown;
    summaryStatistics: unknown;
  } | null;
  insights?: Array<{
    type: string;
    title: string;
    summary: string;
    confidence: string | null;
    evidence?: unknown;
  }>;
}): DatasetIntelligenceDto {
  if (dataset.status === 'FAILED') {
    return {
      datasetId: dataset.id,
      status: dataset.status,
      failureReason: dataset.failureReason,
      failureCode: dataset.failureCode ?? null,
      profile: null,
      insights: [],
    };
  }

  return {
    datasetId: dataset.id,
    status: dataset.status,
    failureReason: dataset.failureReason,
    failureCode: null,
    profile: dataset.profile
      ? {
          rowCount: dataset.profile.rowCount,
          columnCount: dataset.profile.columnCount,
          columnMetadata: dataset.profile.columnMetadata,
          summaryStatistics: dataset.profile.summaryStatistics,
        }
      : null,
    insights: (dataset.insights || []).map((insight) => ({
      type: insight.type,
      title: insight.title,
      summary: insight.summary,
      confidence: insight.confidence,
      evidence: normalizeEvidence(insight.evidence),
    })),
  };
}
