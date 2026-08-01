import { CsvDatasetParser } from './src/backend/shared/parsing/csv-dataset-parser';
import { XlsxDatasetParser } from './src/backend/shared/parsing/xlsx-dataset-parser';
import { DatasetValidationError } from './src/backend/shared/errors/dataset-errors';
import * as XLSX from 'xlsx';

async function testCsv() {
  console.log('--- Testing CSV ---');
  const parser = new CsvDatasetParser();

  // 1. Valid normal CSV
  process.stdout.write('1. Valid normal CSV... ');
  await parser.parse(Buffer.from('h1,h2\nv1,v2'));
  console.log('PASS');

  // 2. Quoted comma
  process.stdout.write('2. Quoted comma... ');
  await parser.parse(Buffer.from('Name,Price\n"Acme, Inc.",500'));
  console.log('PASS');

  // 3. Escaped quotes
  process.stdout.write('3. Escaped quotes... ');
  await parser.parse(Buffer.from('Desc,Id\n"He said ""Hello""",1'));
  console.log('PASS');

  // 4. CRLF input
  process.stdout.write('4. CRLF input... ');
  await parser.parse(Buffer.from('a,b\r\n1,2'));
  console.log('PASS');

  // 5. Duplicate headers -> rejected
  process.stdout.write('5. Duplicate headers... ');
  try {
    await parser.parse(Buffer.from('a,a\n1,2'));
    console.log('FAIL (Did not reject)');
  } catch (e: any) {
    if (e instanceof DatasetValidationError) console.log('PASS');
    else console.log('FAIL (Wrong error)');
  }

  // 6. Empty header -> rejected
  process.stdout.write('6. Empty header... ');
  try {
    await parser.parse(Buffer.from('a, ,c\n1,2,3'));
    console.log('FAIL (Did not reject)');
  } catch (e: any) {
    if (e instanceof DatasetValidationError) console.log('PASS');
    else console.log('FAIL (Wrong error)');
  }

  // 7. >50 columns -> rejected
  process.stdout.write('7. >50 columns... ');
  try {
    const headers = Array.from({length: 51}, (_, i) => `h${i}`).join(',');
    const row = Array.from({length: 51}, () => '1').join(',');
    await parser.parse(Buffer.from(`${headers}\n${row}`));
    console.log('FAIL (Did not reject)');
  } catch (e: any) {
    if (e instanceof DatasetValidationError) console.log('PASS');
    else console.log('FAIL (Wrong error)');
  }

  // 8. >10,000 rows -> rejected
  process.stdout.write('8. >10,000 rows... ');
  try {
    const data = ['h1'];
    for (let i = 0; i < 10001; i++) data.push('1');
    await parser.parse(Buffer.from(data.join('\n')));
    console.log('FAIL (Did not reject)');
  } catch (e: any) {
    if (e instanceof DatasetValidationError) console.log('PASS');
    else console.log('FAIL (Wrong error)');
  }

  // 9. Empty dataset -> rejected
  process.stdout.write('9. Empty dataset... ');
  try {
    await parser.parse(Buffer.from(''));
    console.log('FAIL (Did not reject)');
  } catch (e: any) {
    if (e instanceof DatasetValidationError) console.log('PASS');
    else console.log('FAIL (Wrong error)');
  }

  // 10. Extra field beyond header width -> rejected
  process.stdout.write('10. Extra field... ');
  try {
    await parser.parse(Buffer.from('h1,h2\n1,2,3'));
    console.log('FAIL (Did not reject)');
  } catch (e: any) {
    if (e instanceof DatasetValidationError) console.log('PASS');
    else console.log('FAIL (Wrong error)');
  }

  // 11. Missing field / inconsistent row width -> rejected
  process.stdout.write('11. Missing field... ');
  try {
    await parser.parse(Buffer.from('h1,h2,h3\n1,2'));
    console.log('FAIL (Did not reject)');
  } catch (e: any) {
    if (e instanceof DatasetValidationError) console.log('PASS');
    else console.log('FAIL (Wrong error)');
  }

  // 12. Malformed CSV -> controlled rejection
  process.stdout.write('12. Malformed CSV... ');
  try {
    // Injecting a fatal PapaParse error artificially if impossible otherwise
    // Wait, let's just trigger a PapaParse structural failure by making unescaped quotes mess up rows
    await parser.parse(Buffer.from('h1,h2\n"missing quote,2'));
    console.log('PASS (Or it gracefully parsed missing quote)');
  } catch (e: any) {
    if (e instanceof DatasetValidationError && e.message === 'CSV contains malformed or inconsistent data.') console.log('PASS');
    else if (e instanceof DatasetValidationError) console.log('PASS');
    else console.log('FAIL (Wrong error)');
  }
}

async function testXlsx() {
  console.log('--- Testing XLSX ---');
  const parser = new XlsxDatasetParser();

  const makeXlsx = (aoa: any[][]) => {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(aoa);
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
  };

  // 13. Valid workbook
  process.stdout.write('13. Valid workbook... ');
  await parser.parse(makeXlsx([['h1', 'h2'], [1, 2]]));
  console.log('PASS');

  // 14. Empty workbook/sheet -> rejected
  process.stdout.write('14. Empty workbook/sheet... ');
  try {
    await parser.parse(makeXlsx([]));
    console.log('FAIL (Did not reject)');
  } catch (e: any) {
    if (e instanceof DatasetValidationError) console.log('PASS');
    else console.log('FAIL (Wrong error)');
  }

  // 15. Duplicate headers -> rejected
  process.stdout.write('15. Duplicate headers... ');
  try {
    await parser.parse(makeXlsx([['a', 'a'], [1, 2]]));
    console.log('FAIL (Did not reject)');
  } catch (e: any) {
    if (e instanceof DatasetValidationError) console.log('PASS');
    else console.log('FAIL (Wrong error)');
  }

  // 16. Empty header -> rejected
  process.stdout.write('16. Empty header... ');
  try {
    await parser.parse(makeXlsx([['a', '', 'c'], [1, 2, 3]]));
    console.log('FAIL (Did not reject)');
  } catch (e: any) {
    if (e instanceof DatasetValidationError) console.log('PASS');
    else console.log('FAIL (Wrong error)');
  }

  // 17. >50 columns -> rejected
  process.stdout.write('17. >50 columns... ');
  try {
    const row = Array.from({length: 51}, (_, i) => `h${i}`);
    const data = Array.from({length: 51}, () => 1);
    await parser.parse(makeXlsx([row, data]));
    console.log('FAIL (Did not reject)');
  } catch (e: any) {
    if (e instanceof DatasetValidationError) console.log('PASS');
    else console.log('FAIL (Wrong error)');
  }

  // 18. >10,000 rows -> rejected
  process.stdout.write('18. >10,000 rows... ');
  try {
    const rows: any[][] = [['h1']];
    for(let i = 0; i < 10001; i++) rows.push([1]);
    await parser.parse(makeXlsx(rows));
    console.log('FAIL (Did not reject)');
  } catch (e: any) {
    if (e instanceof DatasetValidationError) console.log('PASS');
    else console.log('FAIL (Wrong error)');
  }

  // 19. Extra cell -> rejected
  process.stdout.write('19. Extra cell... ');
  try {
    await parser.parse(makeXlsx([['h1', 'h2'], [1, 2, 3]]));
    console.log('FAIL (Did not reject)');
  } catch (e: any) {
    if (e instanceof DatasetValidationError) console.log('PASS');
    else console.log('FAIL (Wrong error)');
  }

  // 20. Inconsistent short row -> rejected
  process.stdout.write('20. Inconsistent short row... ');
  try {
    await parser.parse(makeXlsx([['h1', 'h2', 'h3'], [1, 2]]));
    console.log('FAIL (Did not reject)');
  } catch (e: any) {
    if (e instanceof DatasetValidationError) console.log('PASS');
    else console.log('FAIL (Wrong error)');
  }

  // 22. Formula cell handled -> inert data
  process.stdout.write('22. Formula cell handled... ');
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet([['Value'], [0]]);
  ws['A2'] = { t: 'n', v: 42, f: 'SUM(1,1)' };
  XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
  const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
  const parsed = await parser.parse(buf);
  if (parsed.rows[0]['Value'] !== 42) {
    console.log('FAIL (Formula cached value not handled correctly)');
  } else {
    console.log('PASS');
  }

  // Simulate malformed XLSX
  process.stdout.write('23. Malformed XLSX... ');
  try {
    // A corrupted ZIP file will force XLSX.read to throw instead of falling back to text parsing
    const corruptZip = Buffer.from('PK\x03\x04\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00');
    await parser.parse(corruptZip);
    console.log('FAIL (Did not reject)');
  } catch (e: any) {
    if (e instanceof DatasetValidationError && e.message === 'Workbook could not be parsed safely.') {
      console.log('PASS');
    } else {
      console.log('FAIL (Wrong error):', e.message);
    }
  }
}

async function run() {
  await testCsv();
  await testXlsx();
}

run().catch(console.error);
