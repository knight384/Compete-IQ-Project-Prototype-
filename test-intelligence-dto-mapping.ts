import {
  toDatasetIntelligenceDto,
  normalizeEvidence,
} from './src/backend/shared/utils/dataset-dtos';
import { DatasetStatus, DatasetFailureCode } from '@prisma/client';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

function assertEqual<T>(actual: T, expected: T, message: string) {
  if (actual !== expected) {
    throw new Error(`${message} - Expected: ${expected}, Actual: ${actual}`);
  }
}

function runTests() {
  console.log('--- Running Intelligence DTO Security & Bounding Tests ---\n');

  // 1. Valid evidence normalization & sorting/deduplication
  const validNorm = normalizeEvidence({
    sourceColumns: ['Price', 'Rating', 'Price'],
    sampleRowIndices: [5, 2, 2, 0],
    extraProp: 'unexposed',
  });
  assert(validNorm !== null, 'Valid evidence should normalize');
  assertEqual(validNorm?.sourceColumns.length, 2, 'Deduplicated sourceColumns length');
  assertEqual(validNorm?.sourceColumns[0], 'Price', 'Source column 1');
  assertEqual(validNorm?.sourceColumns[1], 'Rating', 'Source column 2');
  assertEqual(validNorm?.sampleRowIndices.length, 3, 'Deduplicated sampleRowIndices length');
  assertEqual(validNorm?.sampleRowIndices[0], 0, 'Sorted index 0');
  assertEqual(validNorm?.sampleRowIndices[1], 2, 'Sorted index 2');
  assertEqual(validNorm?.sampleRowIndices[2], 5, 'Sorted index 5');
  assert(!('extraProp' in (validNorm || {})), 'Extra evidence property not exposed');

  // Strict malformed-evidence fail-closed checks
  assertEqual(normalizeEvidence(null), null, 'null evidence -> null');
  assertEqual(normalizeEvidence(undefined), null, 'undefined evidence -> null');
  assertEqual(normalizeEvidence({}), null, '{} evidence -> null');
  assertEqual(normalizeEvidence('string'), null, 'string evidence -> null');
  assertEqual(normalizeEvidence(123), null, 'number evidence -> null');
  assertEqual(normalizeEvidence(true), null, 'boolean evidence -> null');
  assertEqual(normalizeEvidence([]), null, 'array evidence -> null');

  assertEqual(
    normalizeEvidence({ sourceColumns: 'not-an-array', sampleRowIndices: [0] }),
    null,
    'sourceColumns not array -> null'
  );
  assertEqual(
    normalizeEvidence({ sourceColumns: ['Price'], sampleRowIndices: 'not-an-array' }),
    null,
    'sampleRowIndices not array -> null'
  );
  assertEqual(
    normalizeEvidence({ sourceColumns: ['Price', 123], sampleRowIndices: [0] }),
    null,
    'sourceColumns containing non-string -> null'
  );
  assertEqual(
    normalizeEvidence({ sourceColumns: ['Price', '   '], sampleRowIndices: [0] }),
    null,
    'whitespace-only source column -> null'
  );
  assertEqual(
    normalizeEvidence({ sourceColumns: ['Price'], sampleRowIndices: [0, '1'] }),
    null,
    'sampleRowIndices containing string -> null'
  );
  assertEqual(
    normalizeEvidence({ sourceColumns: ['Price'], sampleRowIndices: [-1] }),
    null,
    'negative sampleRowIndex -> null'
  );
  assertEqual(
    normalizeEvidence({ sourceColumns: ['Price'], sampleRowIndices: [1.5] }),
    null,
    'decimal sampleRowIndex -> null'
  );
  assertEqual(
    normalizeEvidence({ sourceColumns: ['Price'], sampleRowIndices: [NaN] }),
    null,
    'NaN sampleRowIndex -> null'
  );
  assertEqual(
    normalizeEvidence({ sourceColumns: ['Price'], sampleRowIndices: [Infinity] }),
    null,
    'Infinity sampleRowIndex -> null'
  );
  assertEqual(
    normalizeEvidence({ sourceColumns: [], sampleRowIndices: [] }),
    null,
    'both arrays empty -> null'
  );

  console.log('PASS: normalizeEvidence strict validation & deduplication verified');

  // 2. Production toDatasetIntelligenceDto Privacy & Field Bounding Tests
  const mockDatasetObj = {
    id: 'ds-123',
    status: DatasetStatus.READY,
    failureReason: null,
    failureCode: null,
    storageKey: 'secret-s3-key.csv',
    orgId: 'org-999',
    semanticMapping: { version: 1, columns: [] },
    createdAt: new Date(),
    updatedAt: new Date(),
    originalFilename: 'secret.csv',
    format: 'CSV',
    mimeType: 'text/csv',
    fileSize: 500,
    profile: {
      rowCount: 100,
      columnCount: 5,
      columnMetadata: { col1: 'text' },
      summaryStatistics: { count: 100 },
      id: 'profile-id-secret',
      datasetId: 'ds-123',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    insights: [
      {
        id: 'insight-secret-1',
        datasetId: 'ds-123',
        competitorId: 'comp-secret-456',
        productId: 'prod-secret-789',
        type: 'FEATURE_GAP',
        title: 'Feature Gap Observed',
        summary: 'Competitor has advanced search feature.',
        confidence: 'HIGH',
        evidence: {
          sourceColumns: ['Search', 'Features'],
          sampleRowIndices: [0, 2],
          rawRowData: 'sensitive cell data',
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ],
  };

  const dto = toDatasetIntelligenceDto(mockDatasetObj);

  const dtoKeys = Object.keys(dto);
  assert(!dtoKeys.includes('storageKey'), 'storageKey absent');
  assert(!dtoKeys.includes('orgId'), 'orgId absent');
  assert(!dtoKeys.includes('semanticMapping'), 'semanticMapping absent');
  assert(!dtoKeys.includes('originalFilename'), 'originalFilename absent');
  assert(!dtoKeys.includes('createdAt'), 'createdAt absent');
  assert(!dtoKeys.includes('updatedAt'), 'updatedAt absent');
  assert(!dtoKeys.includes('fileSize'), 'fileSize absent');

  assertEqual(dto.datasetId, 'ds-123', 'datasetId correctly mapped');
  assertEqual(dto.status, 'READY', 'status correctly mapped');
  assertEqual(dto.profile?.rowCount, 100, 'profile.rowCount mapped');
  assertEqual(dto.insights.length, 1, 'insights array length mapped');

  const insightDto = dto.insights[0];
  const insightKeys = Object.keys(insightDto);

  assert(!insightKeys.includes('id'), 'insight.id absent');
  assert(!insightKeys.includes('datasetId'), 'insight.datasetId absent');
  assert(!insightKeys.includes('competitorId'), 'insight.competitorId absent');
  assert(!insightKeys.includes('productId'), 'insight.productId absent');
  assert(!insightKeys.includes('createdAt'), 'insight.createdAt absent');
  assert(!insightKeys.includes('updatedAt'), 'insight.updatedAt absent');

  assertEqual(insightDto.type, 'FEATURE_GAP', 'insight.type mapped');
  assertEqual(insightDto.title, 'Feature Gap Observed', 'insight.title mapped');
  assertEqual(insightDto.summary, 'Competitor has advanced search feature.', 'insight.summary mapped');
  assertEqual(insightDto.confidence, 'HIGH', 'insight.confidence mapped');
  assert(insightDto.evidence !== null, 'insight.evidence present');
  assertEqual(insightDto.evidence?.sourceColumns.length, 2, 'evidence sourceColumns length');
  assertEqual(insightDto.evidence?.sampleRowIndices.length, 2, 'evidence sampleRowIndices length');

  assert(!('rawRowData' in (insightDto.evidence || {})), 'rawRowData absent from evidence');

  console.log('PASS: READY toDatasetIntelligenceDto field bounding verified');

  // 3. FAILED DTO Behavior
  const mockFailedDataset = {
    id: 'ds-failed-123',
    status: DatasetStatus.FAILED,
    failureReason: 'AI provider is temporarily unavailable.',
    failureCode: DatasetFailureCode.AI_PROVIDER,
    profile: null,
    insights: [],
  };

  const failedDto = toDatasetIntelligenceDto(mockFailedDataset);
  assertEqual(failedDto.datasetId, 'ds-failed-123', 'FAILED datasetId');
  assertEqual(failedDto.status, 'FAILED', 'FAILED status');
  assertEqual(failedDto.failureReason, 'AI provider is temporarily unavailable.', 'FAILED failureReason');
  assertEqual(failedDto.failureCode, 'AI_PROVIDER', 'FAILED failureCode');
  assertEqual(failedDto.profile, null, 'FAILED profile must be null');
  assertEqual(failedDto.insights.length, 0, 'FAILED insights must be empty array');

  console.log('PASS: FAILED toDatasetIntelligenceDto behavior verified');

  console.log('\nAll 34 DTO Security & Bounding assertions passed successfully!');
}

try {
  runTests();
} catch (e) {
  console.error(e);
  process.exit(1);
}
