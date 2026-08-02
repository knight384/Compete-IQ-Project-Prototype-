export type DatasetStatus =
  | 'UPLOADED'
  | 'MAPPING_REQUIRED'
  | 'MAPPED'
  | 'PROCESSING'
  | 'READY'
  | 'FAILED';

export type DatasetFailureCode =
  | 'DATASET_VALIDATION'
  | 'DATASET_FORMAT'
  | 'AI_CONFIGURATION'
  | 'AI_PROVIDER'
  | 'AI_RESPONSE_VALIDATION'
  | 'STORAGE'
  | 'PERSISTENCE'
  | 'INTERNAL';

export interface FrontendDatasetMetadata {
  id: string;
  status: DatasetStatus;
  originalFilename: string;
  format: string | null;
  fileSize: number | null;
  failureReason: string | null;
  failureCode: DatasetFailureCode | null;
  createdAt: string;
  updatedAt: string;
}

export interface FrontendDatasetProfile {
  rowCount: number | null;
  columnCount: number | null;
  columnMetadata: unknown;
  summaryStatistics: unknown;
}

export interface FrontendDatasetEvidence {
  sourceColumns: string[];
  sampleRowIndices: number[];
}

export interface FrontendDatasetInsight {
  type: string;
  title: string;
  summary: string;
  confidence: string | null;
  evidence: FrontendDatasetEvidence | null;
  competitorId: string | null;
  productId: string | null;
}

export interface FrontendDatasetIntelligence {
  datasetId: string;
  status: 'READY' | 'FAILED';
  failureReason: string | null;
  failureCode: DatasetFailureCode | null;
  profile: FrontendDatasetProfile | null;
  insights: FrontendDatasetInsight[];
}
