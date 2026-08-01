export interface ParsedDataset {
  headers: string[];
  rows: Record<string, unknown>[];
  rowCount: number;
  columnCount: number;
}

import { DatasetValidationError } from '../errors/dataset-errors';

export interface DatasetParser {
  parse(buffer: Buffer): Promise<ParsedDataset>;
}

export function normalizeHeaders(rawHeaders: string[]): string[] {
  if (!rawHeaders || rawHeaders.length === 0) {
    throw new DatasetValidationError('Dataset must contain at least one header');
  }

  const seen = new Set<string>();
  const normalized: string[] = [];

  for (let i = 0; i < rawHeaders.length; i++) {
    const raw = rawHeaders[i];
    if (typeof raw !== 'string') {
      throw new DatasetValidationError(`Invalid header at column ${i + 1}`);
    }
    const clean = raw.trim();
    if (!clean) {
      throw new DatasetValidationError(`Header at column ${i + 1} is empty after normalization`);
    }
    if (seen.has(clean)) {
      throw new DatasetValidationError(`Duplicate normalized header detected: "${clean}"`);
    }
    seen.add(clean);
    normalized.push(clean);
  }

  return normalized;
}

export function validateParsedContent(parsed: ParsedDataset): void {
  if (parsed.columnCount > 50) {
    throw new DatasetValidationError(`Maximum 50 columns allowed. Found ${parsed.columnCount}.`);
  }
  if (parsed.rowCount === 0) {
    throw new DatasetValidationError('Dataset must contain at least one data row.');
  }
  if (parsed.rowCount > 10000) {
    throw new DatasetValidationError(`Maximum 10,000 data rows allowed. Found ${parsed.rowCount}.`);
  }
}
