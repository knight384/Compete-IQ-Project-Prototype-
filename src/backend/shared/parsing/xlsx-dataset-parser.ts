import * as XLSX from 'xlsx';
import { DatasetParser, ParsedDataset, normalizeHeaders, validateParsedContent } from './dataset-parser';
import { DatasetValidationError } from '../errors/dataset-errors';


export class XlsxDatasetParser implements DatasetParser {
  async parse(buffer: Buffer): Promise<ParsedDataset> {
    try {
      // cellFormula: false explicitly instructs the parser to ignore formulas entirely,
      // discarding the executable expressions and retrieving only the cached, inert string/number cell values.
      // cellHTML: false instructs the parser to ignore any HTML encodings/representations.
      const workbook = XLSX.read(buffer, { type: 'buffer', cellFormula: false, cellHTML: false });

      if (workbook.SheetNames.length === 0) {
        throw new DatasetValidationError('Workbook contains no sheets');
      }

      // Parse only the first worksheet
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];

      // Convert to JSON with headers. We pass header: 1 to get a 2D array back, 
      // which allows us to robustly extract headers from the first non-empty row.
      const rawData: unknown[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1, blankrows: false });

      if (rawData.length === 0) {
        throw new DatasetValidationError('Worksheet is empty');
      }

      // First row is headers. 
      const rawHeaders = rawData[0].map(h => String(h || ''));
      const headers = normalizeHeaders(rawHeaders);

      const rows: Record<string, unknown>[] = [];
      // Subsequent rows are data
      for (let i = 1; i < rawData.length; i++) {
        const rowArray = rawData[i];
        
        // Skip fully empty rows
        if (!rowArray || rowArray.length === 0) continue;
        const isFullyEmpty = rowArray.every(cell => cell === null || cell === undefined || cell === '');
        if (isFullyEmpty) continue;

        // Strict validation: every non-empty data row must correspond exactly to the normalized header width.
        // We reject rather than silently manufacture a dataset.
        if (rowArray.length > headers.length || rowArray.length < headers.length) {
          throw new DatasetValidationError('Workbook contains inconsistent row structure.');
        }

        const cleanRow: Record<string, unknown> = {};
        for (let j = 0; j < headers.length; j++) {
          cleanRow[headers[j]] = rowArray[j];
        }
        rows.push(cleanRow);
      }

      const parsed: ParsedDataset = {
        headers,
        rows,
        rowCount: rows.length,
        columnCount: headers.length,
      };

      validateParsedContent(parsed);
      return parsed;

    } catch (error: unknown) {
      if (error instanceof DatasetValidationError) {
        throw error;
      }
      if (error instanceof Error) {
        console.error(`Underlying XLSX Parsing error: ${error.message}`);
      }
      throw new DatasetValidationError('Workbook could not be parsed safely.');
    }
  }
}
