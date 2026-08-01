import { ParsedDataset } from '../../shared/parsing/dataset-parser';
import { SemanticMappingDocument, SemanticField } from '../../shared/mapping/semantic-mapping';
import { DatasetValidationError } from '../../shared/errors/dataset-errors';

export interface NumericStatistics {
  count: number;
  min: number | null;
  max: number | null;
  mean: number | null;
}

export interface CategoricalFrequency {
  value: string;
  count: number;
}

export interface CategoricalStatistics {
  uniqueCount: number;
  nonEmptyCount: number;
  topFrequencies: CategoricalFrequency[];
}

export interface TextStatistics {
  nonEmptyCount: number;
}

export type ColumnStatistics = 
  | { type: 'numeric'; stats: NumericStatistics }
  | { type: 'categorical'; stats: CategoricalStatistics }
  | { type: 'text'; stats: TextStatistics };

export interface ColumnProfile {
  sourceColumn: string;
  semanticField: SemanticField;
  inferredType: 'numeric' | 'string' | 'mixed' | 'unknown';
  missingCount: number;
  missingPercentage: number;
  statistics: ColumnStatistics | null;
}

export interface DatasetProfileResult {
  physicalRowCount: number;
  physicalColumnCount: number;
  intelligenceColumnCount: number;
  columns: Record<string, ColumnProfile>;
  semanticAggregates: Partial<Record<SemanticField, ColumnStatistics>>;
}

/**
 * Numeric coercion policy:
 * - null, undefined, empty string, whitespace-only string are MISSING (not zero).
 * - string values are trimmed and converted via Number().
 * - If Number() returns NaN or Infinity/-Infinity, it is NOT numeric.
 */
function coerceToNumeric(value: unknown): number | null {
  if (value === null || value === undefined) return null;
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null;
  }
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (trimmed === '') return null;
    const num = Number(trimmed);
    return Number.isFinite(num) ? num : null;
  }
  return null;
}

function isMissing(value: unknown): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === 'number' && !Number.isFinite(value)) return true;
  if (typeof value === 'string' && value.trim() === '') return true;
  return false;
}

export function generateDeterministicProfile(
  parsed: ParsedDataset,
  mappingDoc: SemanticMappingDocument
): DatasetProfileResult {
  const physicalRowCount = parsed.rowCount;
  const physicalColumnCount = parsed.columnCount;
  
  const mappingMap = new Map<string, SemanticField>();
  for (const col of mappingDoc.columns) {
    mappingMap.set(col.sourceColumn, col.semanticField);
  }

  const columns: Record<string, ColumnProfile> = {};
  let intelligenceColumnCount = 0;

  for (const header of parsed.headers) {
    const semanticField = mappingMap.get(header);
    if (!semanticField) {
      throw new DatasetValidationError(`Parsed header "${header}" is missing from SemanticMappingDocument.`);
    }
    if (semanticField === SemanticField.IGNORE) {
      continue;
    }
    intelligenceColumnCount++;

    let missingCount = 0;
    let numericCount = 0;
    let stringCount = 0;

    const numericValues: number[] = [];
    const stringFrequencies = new Map<string, number>();

    for (const row of parsed.rows) {
      const val = row[header];
      if (isMissing(val)) {
        missingCount++;
        continue;
      }

      const numVal = coerceToNumeric(val);
      if (numVal !== null) {
        numericCount++;
        numericValues.push(numVal);
        // We still track it in frequencies just in case we fall back to string/categorical
        const strVal = String(val).trim();
        stringFrequencies.set(strVal, (stringFrequencies.get(strVal) || 0) + 1);
      } else {
        stringCount++;
        const strVal = String(val).trim();
        stringFrequencies.set(strVal, (stringFrequencies.get(strVal) || 0) + 1);
      }
    }

    const nonEmptyCount = physicalRowCount - missingCount;
    const missingPercentage = physicalRowCount > 0 ? (missingCount / physicalRowCount) * 100 : 0;

    let inferredType: 'numeric' | 'string' | 'mixed' | 'unknown' = 'unknown';
    let statistics: ColumnStatistics | null = null;

    if (nonEmptyCount === 0) {
      inferredType = 'unknown';
    } else if (numericCount > 0 && stringCount === 0) {
      inferredType = 'numeric';
      let min = numericValues[0];
      let max = numericValues[0];
      let sum = 0;
      for (const n of numericValues) {
        if (n < min) min = n;
        if (n > max) max = n;
        sum += n;
      }
      statistics = {
        type: 'numeric',
        stats: {
          count: numericCount,
          min,
          max,
          mean: numericCount > 0 ? sum / numericCount : null
        }
      };
    } else if (stringCount > 0 && numericCount === 0) {
      inferredType = 'string';
    } else if (stringCount > 0 && numericCount > 0) {
      inferredType = 'mixed';
    }

    // High cardinality / text vs Categorical logic
    // For string or mixed fields, if the number of unique values is relatively low compared to total,
    // or if the semantic field is explicitly known as categorical, treat as categorical.
    // REVIEW_TEXT and DESCRIPTION are inherently text and usually high cardinality.
    if (inferredType !== 'numeric' && inferredType !== 'unknown') {
      const uniqueCount = stringFrequencies.size;
      
      if (
        semanticField === SemanticField.REVIEW_TEXT || 
        semanticField === SemanticField.DESCRIPTION
      ) {
        statistics = {
          type: 'text',
          stats: { nonEmptyCount }
        };
      } else {
        // Treat as categorical
        const sortedFreq = Array.from(stringFrequencies.entries()).sort((a, b) => {
          if (b[1] !== a[1]) return b[1] - a[1]; // sort by count descending
          return a[0].localeCompare(b[0]); // deterministic tie breaker (alphabetical)
        });

        const topFrequencies = sortedFreq.slice(0, 5).map(f => ({
          value: f[0],
          count: f[1]
        }));

        statistics = {
          type: 'categorical',
          stats: {
            uniqueCount,
            nonEmptyCount,
            topFrequencies
          }
        };
      }
    }

    columns[header] = {
      sourceColumn: header,
      semanticField,
      inferredType,
      missingCount,
      missingPercentage,
      statistics
    };
  }

  // Populate semantic aggregates
  const semanticAggregates: Partial<Record<SemanticField, ColumnStatistics>> = {};
  for (const header in columns) {
    const colProfile = columns[header];
    if (colProfile.statistics !== null) {
      semanticAggregates[colProfile.semanticField] = colProfile.statistics;
    }
  }

  return {
    physicalRowCount,
    physicalColumnCount,
    intelligenceColumnCount,
    columns,
    semanticAggregates
  };
}
