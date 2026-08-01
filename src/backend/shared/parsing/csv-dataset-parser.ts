import Papa from 'papaparse';
import { DatasetParser, ParsedDataset, normalizeHeaders, validateParsedContent } from './dataset-parser';
import { DatasetValidationError } from '../errors/dataset-errors';


export class CsvDatasetParser implements DatasetParser {
  async parse(buffer: Buffer): Promise<ParsedDataset> {
    const csvString = buffer.toString('utf-8');
    
    return new Promise((resolve, reject) => {
      Papa.parse(csvString, {
        header: false,
        skipEmptyLines: 'greedy',
        complete: (results) => {
          try {
            if (results.errors && results.errors.length > 0) {
              const hasStructuralError = results.errors.some(e => e.code === 'TooManyFields' || e.code === 'TooFewFields');
              if (hasStructuralError) {
                throw new DatasetValidationError('CSV contains inconsistent row structure.');
              }
              
              // Do not continue if there are any other genuine parser errors
              console.error('PapaParse underlying errors:', results.errors);
              throw new DatasetValidationError('CSV contains malformed or inconsistent data.');
            }

            const rawData = results.data as unknown[][];
            if (rawData.length === 0) {
              throw new DatasetValidationError('Dataset must contain at least one data row.');
            }

            // First row is headers
            const rawHeaders = rawData[0].map(h => String(h || ''));
            const headers = normalizeHeaders(rawHeaders);
            
            const rows: Record<string, unknown>[] = [];
            for (let i = 1; i < rawData.length; i++) {
              const rowArray = rawData[i];
              
              if (rowArray.length > headers.length || rowArray.length < headers.length) {
                throw new DatasetValidationError('CSV contains inconsistent row structure.');
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
            resolve(parsed);
          } catch (error) {
            reject(error);
          }
        },
        error: (error: Error) => {
          console.error(`Underlying PapaParse error: ${error.message}`);
          reject(new DatasetValidationError('CSV contains malformed or inconsistent data.'));
        }
      });
    });
  }
}
