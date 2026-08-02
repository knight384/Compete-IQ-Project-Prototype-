export type DatasetStatus =
  | 'UPLOADED'
  | 'MAPPING_REQUIRED'
  | 'MAPPED'
  | 'PROCESSING'
  | 'READY'
  | 'FAILED';

export interface FrontendDatasetMetadata {
  id: string;
  status: DatasetStatus;
  originalFilename: string;
  failureReason: string | null;
}

export interface FrontendDatasetProfile {
  rowCount: number | null;
  columnCount: number | null;
  columnMetadata: unknown;
  summaryStatistics: unknown;
}

export interface FrontendDatasetInsight {
  type: string;
  title: string;
  summary: string;
  confidence: string | null;
}

export interface FrontendDatasetIntelligence {
  datasetId: string;
  status: 'READY' | 'FAILED';
  failureReason: string | null;
  profile: FrontendDatasetProfile | null;
  insights: FrontendDatasetInsight[];
}
