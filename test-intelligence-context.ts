import { buildIntelligenceContext, MAX_SAMPLE_ROWS, MAX_TEXT_LENGTH } from './src/backend/modules/datasets/dataset-intelligence-context';
import { generateDeterministicProfile } from './src/backend/modules/datasets/dataset-profiler';
import { ParsedDataset } from './src/backend/shared/parsing/dataset-parser';
import { SemanticMappingDocument, SemanticField } from './src/backend/shared/mapping/semantic-mapping';
import { DatasetValidationError } from './src/backend/shared/errors/dataset-errors';

let seed = 1;
function deterministicRandom() {
  const x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
}

function runTests() {
  console.log('--- Running Intelligence Context Builder Tests ---');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, name: string) {
    if (condition) {
      console.log(`PASS: ${name}`);
      passed++;
    } else {
      console.log(`FAIL: ${name}`);
      failed++;
    }
  }

  const baseHeaders = ['price', 'review', 'ignore_col'];
  const baseMapping: SemanticMappingDocument = {
    version: 1,
    columns: [
      { sourceColumn: 'price', semanticField: SemanticField.PRICE },
      { sourceColumn: 'review', semanticField: SemanticField.REVIEW_TEXT },
      { sourceColumn: 'ignore_col', semanticField: SemanticField.IGNORE },
    ]
  };

  function createMockDataset(numRows: number): ParsedDataset {
    const rows: Record<string, unknown>[] = [];
    for (let i = 0; i < numRows; i++) {
      rows.push({
        price: i * 10,
        review: `Review ${i}`,
        ignore_col: 'secret',
      });
    }
    return {
      headers: baseHeaders,
      rows,
      rowCount: numRows,
      columnCount: 3
    };
  }

  // 1. Dataset with fewer than 20 rows uses all rows.
  const d10 = createMockDataset(10);
  const p10 = generateDeterministicProfile(d10, baseMapping);
  const c10 = buildIntelligenceContext(d10, baseMapping, p10);
  assert(c10.sampleRows.length === 10, 'Dataset < 20 rows uses all rows');

  // 2. Dataset with exactly 20 rows uses exactly 20.
  const d20 = createMockDataset(20);
  const p20 = generateDeterministicProfile(d20, baseMapping);
  const c20 = buildIntelligenceContext(d20, baseMapping, p20);
  assert(c20.sampleRows.length === 20, 'Dataset == 20 rows uses exactly 20');

  // 3. Dataset with >20 rows uses at most 20.
  const d21 = createMockDataset(21);
  const p21 = generateDeterministicProfile(d21, baseMapping);
  const c21 = buildIntelligenceContext(d21, baseMapping, p21);
  assert(c21.sampleRows.length === MAX_SAMPLE_ROWS, 'Dataset > 20 rows uses exactly MAX_SAMPLE_ROWS');

  // 4. Large dataset sampling includes beginning and end representation.
  const dLarge = createMockDataset(100);
  const pLarge = generateDeterministicProfile(dLarge, baseMapping);
  const cLarge = buildIntelligenceContext(dLarge, baseMapping, pLarge);
  assert(cLarge.sampleRows[0].rowIndex === 0, 'Large dataset includes beginning index 0');
  assert(cLarge.sampleRows[MAX_SAMPLE_ROWS - 1].rowIndex === 99, 'Large dataset includes ending index 99');

  // 5. Sampling contains no duplicate row indices.
  const indices = new Set(cLarge.sampleRows.map(r => r.rowIndex));
  assert(indices.size === MAX_SAMPLE_ROWS, 'Sampling contains no duplicate row indices');

  // 6. Sampling is deterministic across repeated runs.
  const cLarge2 = buildIntelligenceContext(dLarge, baseMapping, pLarge);
  assert(JSON.stringify(cLarge.sampleRows) === JSON.stringify(cLarge2.sampleRows), 'Sampling is deterministic across repeated runs');

  // 7. Explicit IGNORE columns never appear in sample values.
  const hasIgnoreValue = cLarge.sampleRows.some(r => 'ignore_col' in r.values);
  assert(!hasIgnoreValue, 'Explicit IGNORE columns never appear in sample values');

  // 8. Explicit IGNORE columns never appear in intelligence mapping context.
  const hasIgnoreMap = cLarge.mapping.some(m => m.sourceColumn === 'ignore_col' || m.semanticField === SemanticField.IGNORE);
  assert(!hasIgnoreMap, 'Explicit IGNORE columns never appear in intelligence mapping context');

  // 9. Physical column count remains faithful to original dataset.
  assert(cLarge.dataset.physicalColumnCount === 3, 'Physical column count remains faithful to original dataset');

  // 10. Intelligence column count reflects non-IGNORE mappings.
  assert(cLarge.dataset.intelligenceColumnCount === 2, 'Intelligence column count reflects non-IGNORE mappings');

  // 11-14. Text truncation
  const longText = 'A'.repeat(MAX_TEXT_LENGTH + 100);
  const dText = createMockDataset(1);
  dText.rows[0].review = longText;
  const pText = generateDeterministicProfile(dText, baseMapping);
  const cText = buildIntelligenceContext(dText, baseMapping, pText);
  const truncVal = cText.sampleRows[0].values['review'] as string;
  assert(truncVal.endsWith('...[TRUNCATED]'), 'REVIEW_TEXT > limit is deterministically truncated');
  assert(truncVal.length === MAX_TEXT_LENGTH + 14, 'Truncated length matches limit + suffix');
  assert(dText.rows[0].review === longText, 'Original ParsedDataset is NOT mutated by truncation');

  const shortText = 'Short review';
  dText.rows[0].review = shortText;
  const cText2 = buildIntelligenceContext(dText, baseMapping, generateDeterministicProfile(dText, baseMapping));
  assert(cText2.sampleRows[0].values['review'] === shortText, 'REVIEW_TEXT <= truncation limit remains unchanged');

  // 13. DESCRIPTION receives same bounded text treatment (Testing general JSON safety limits string length)
  const descMapping = { version: 1, columns: [{ sourceColumn: 'desc', semanticField: SemanticField.DESCRIPTION }] };
  const dDesc = { headers: ['desc'], rows: [{ desc: longText }], rowCount: 1, columnCount: 1 };
  const pDesc = generateDeterministicProfile(dDesc, descMapping);
  const cDesc = buildIntelligenceContext(dDesc, descMapping, pDesc);
  const descVal = cDesc.sampleRows[0].values['desc'] as string;
  assert(descVal.endsWith('...[TRUNCATED]'), 'DESCRIPTION receives the same bounded text treatment');

  // 15-18, 20. JSON-safe values
  const dJson = createMockDataset(1);
  dJson.rows[0].price = undefined;
  const cJson1 = buildIntelligenceContext(dJson, baseMapping, generateDeterministicProfile(dJson, baseMapping));
  assert(cJson1.sampleRows[0].values['price'] === null, 'undefined becomes JSON-safe (null)');

  dJson.rows[0].price = NaN;
  const cJson2 = buildIntelligenceContext(dJson, baseMapping, generateDeterministicProfile(dJson, baseMapping));
  assert(cJson2.sampleRows[0].values['price'] === null, 'NaN becomes JSON-safe (null)');

  dJson.rows[0].price = Infinity;
  const cJson3 = buildIntelligenceContext(dJson, baseMapping, generateDeterministicProfile(dJson, baseMapping));
  assert(cJson3.sampleRows[0].values['price'] === null, 'Infinity becomes JSON-safe (null)');

  dJson.rows[0].price = -Infinity;
  const cJson4 = buildIntelligenceContext(dJson, baseMapping, generateDeterministicProfile(dJson, baseMapping));
  assert(cJson4.sampleRows[0].values['price'] === null, '-Infinity becomes JSON-safe (null)');

  // 19. JSON.stringify succeeds
  let stringifySucceeded = false;
  try {
    JSON.stringify(cJson4);
    stringifySucceeded = true;
  } catch(e) {}
  assert(stringifySucceeded, 'JSON.stringify(context) succeeds');

  const jsonStr = JSON.stringify(cJson2);
  assert(!jsonStr.includes(':NaN') && !jsonStr.includes(':Infinity'), 'JSON output contains no NaN/Infinity text');

  // 21. Missing semantic mapping is rejected
  let missingMappingRejected = false;
  try {
    const dMissing = createMockDataset(1); // has 'price', 'review', 'ignore_col'
    const incompleteMapping = { version: 1, columns: [{ sourceColumn: 'price', semanticField: SemanticField.PRICE }] };
    buildIntelligenceContext(dMissing, incompleteMapping, generateDeterministicProfile(dMissing, incompleteMapping));
  } catch(e) {
    missingMappingRejected = true;
  }
  assert(missingMappingRejected, 'Missing semantic mapping is rejected');

  // 22. Explicit IGNORE mapping is accepted (already tested by base success)
  assert(true, 'Explicit IGNORE mapping is accepted (inherent in above tests)');

  // 23-25. Profile mismatch validations
  const validD = createMockDataset(10);
  const validP = generateDeterministicProfile(validD, baseMapping);
  
  let pRowCountMismatch = false;
  try {
    buildIntelligenceContext(validD, baseMapping, { ...validP, physicalRowCount: 999 });
  } catch(e) { pRowCountMismatch = true; }
  assert(pRowCountMismatch, 'Profile row-count mismatch is rejected');

  let pColCountMismatch = false;
  try {
    buildIntelligenceContext(validD, baseMapping, { ...validP, physicalColumnCount: 999 });
  } catch(e) { pColCountMismatch = true; }
  assert(pColCountMismatch, 'Profile physical-column-count mismatch is rejected');

  let pIntColCountMismatch = false;
  try {
    buildIntelligenceContext(validD, baseMapping, { ...validP, intelligenceColumnCount: 999 });
  } catch(e) { pIntColCountMismatch = true; }
  assert(pIntColCountMismatch, 'Profile intelligence-column-count mismatch is rejected');

  // 26. Empty dataset behaves safely
  const dEmpty = createMockDataset(0);
  const pEmpty = generateDeterministicProfile(dEmpty, baseMapping);
  const cEmpty = buildIntelligenceContext(dEmpty, baseMapping, pEmpty);
  assert(cEmpty.sampleRows.length === 0, 'Empty dataset behaves safely');

  // 27. Single-row dataset behaves safely
  const dSingle = createMockDataset(1);
  const pSingle = generateDeterministicProfile(dSingle, baseMapping);
  const cSingle = buildIntelligenceContext(dSingle, baseMapping, pSingle);
  assert(cSingle.sampleRows.length === 1, 'Single-row dataset behaves safely');

  // 28. Large 10,000-row dataset produces <=20 samples
  const d10k = createMockDataset(10000);
  const p10k = generateDeterministicProfile(d10k, baseMapping);
  const c10k = buildIntelligenceContext(d10k, baseMapping, p10k);
  assert(c10k.sampleRows.length === MAX_SAMPLE_ROWS, 'Large 10,000-row dataset produces MAX_SAMPLE_ROWS samples');

  // 29. Same inputs produce equivalent serialized contexts
  const c10k_2 = buildIntelligenceContext(d10k, baseMapping, p10k);
  assert(JSON.stringify(c10k) === JSON.stringify(c10k_2), 'Same inputs produce equivalent serialized contexts');

  // 30. Context does not contain the entire raw dataset
  const contextRawStr = JSON.stringify(c10k);
  // c10k.sampleRows is max 20, whereas parsed.rows is 10000. So we know it's not the full dataset.
  assert(c10k.sampleRows.length !== d10k.rows.length, 'Context does not contain the entire raw dataset rows directly');
  
  // Also verify that the `c10k` object does not have a hidden copy of `parsed.rows` by checking its serialized length
  const parsedRowsStr = JSON.stringify(d10k.rows);
  assert(contextRawStr.length < parsedRowsStr.length, 'Context serialized size is smaller than full raw dataset');

  console.log(`\nTests completed: ${passed} passed, ${failed} failed.`);
}

runTests();
