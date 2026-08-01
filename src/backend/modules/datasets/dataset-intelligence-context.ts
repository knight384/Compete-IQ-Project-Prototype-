import { ParsedDataset } from '../../shared/parsing/dataset-parser';
import { SemanticMappingDocument, SemanticField } from '../../shared/mapping/semantic-mapping';
import { DatasetProfileResult } from './dataset-profiler';
import { DatasetValidationError } from '../../shared/errors/dataset-errors';

export const MAX_SAMPLE_ROWS = 20;
export const MAX_TEXT_LENGTH = 500;

export interface IntelligenceSampleRow {
  rowIndex: number;
  values: Record<string, unknown>;
}

export interface IntelligenceMapping {
  sourceColumn: string;
  semanticField: SemanticField;
}

export interface IntelligenceContext {
  version: 1;
  dataset: {
    rowCount: number;
    physicalColumnCount: number;
    intelligenceColumnCount: number;
  };
  mapping: IntelligenceMapping[];
  profile: DatasetProfileResult;
  sampleRows: IntelligenceSampleRow[];
}

function toJSONSafeValue(val: unknown): unknown {
  if (val === undefined || val === null) {
    return null;
  }
  if (typeof val === 'number') {
    return Number.isFinite(val) ? val : null;
  }
  if (typeof val === 'string') {
    if (val.length > MAX_TEXT_LENGTH) {
      return val.substring(0, MAX_TEXT_LENGTH) + '...[TRUNCATED]';
    }
    return val;
  }
  // Other primitives like boolean, or object structures.
  return val;
}

function buildSampleRow(
  rowIndex: number,
  rawRow: Record<string, unknown>,
  intelligenceMapping: IntelligenceMapping[]
): IntelligenceSampleRow {
  const values: Record<string, unknown> = {};
  for (const mapping of intelligenceMapping) {
    const rawVal = rawRow[mapping.sourceColumn];
    values[mapping.sourceColumn] = toJSONSafeValue(rawVal);
  }
  return { rowIndex, values };
}

export function buildIntelligenceContext(
  parsed: ParsedDataset,
  mappingDoc: SemanticMappingDocument,
  profile: DatasetProfileResult
): IntelligenceContext {
  // Profile handling validation
  if (profile.physicalRowCount !== parsed.rowCount) {
    throw new DatasetValidationError('DatasetProfile row count does not match ParsedDataset');
  }
  if (profile.physicalColumnCount !== parsed.columnCount) {
    throw new DatasetValidationError('DatasetProfile physical column count does not match ParsedDataset');
  }

  // Mapping contract validation
  const mappingMap = new Map<string, SemanticField>();
  for (const col of mappingDoc.columns) {
    mappingMap.set(col.sourceColumn, col.semanticField);
  }

  const intelligenceMapping: IntelligenceMapping[] = [];
  let intelligenceColumnCount = 0;

  for (const header of parsed.headers) {
    const semanticField = mappingMap.get(header);
    if (!semanticField) {
      throw new DatasetValidationError(`Parsed header "${header}" is missing from SemanticMappingDocument.`);
    }
    if (semanticField !== SemanticField.IGNORE) {
      intelligenceMapping.push({ sourceColumn: header, semanticField });
      intelligenceColumnCount++;
    }
  }

  if (profile.intelligenceColumnCount !== intelligenceColumnCount) {
    throw new DatasetValidationError('DatasetProfile intelligence column count does not match mapped columns');
  }

  // Sampling
  const sampleRows: IntelligenceSampleRow[] = [];
  const N = parsed.rowCount;

  if (N <= MAX_SAMPLE_ROWS) {
    for (let i = 0; i < N; i++) {
      sampleRows.push(buildSampleRow(i, parsed.rows[i], intelligenceMapping));
    }
  } else {
    for (let i = 0; i < MAX_SAMPLE_ROWS; i++) {
      const idx = Math.round((i / (MAX_SAMPLE_ROWS - 1)) * (N - 1));
      sampleRows.push(buildSampleRow(idx, parsed.rows[idx], intelligenceMapping));
    }
  }

  return {
    version: 1,
    dataset: {
      rowCount: N,
      physicalColumnCount: parsed.columnCount,
      intelligenceColumnCount
    },
    mapping: intelligenceMapping,
    profile,
    sampleRows
  };
}
