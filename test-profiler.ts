import { generateDeterministicProfile, DatasetProfileResult, ColumnStatistics } from './src/backend/modules/datasets/dataset-profiler';
import { ParsedDataset } from './src/backend/shared/parsing/dataset-parser';
import { SemanticMappingDocument, SemanticField } from './src/backend/shared/mapping/semantic-mapping';
import { DatasetValidationError } from './src/backend/shared/errors/dataset-errors';

function createMockParsedDataset(rows: Record<string, unknown>[], headers: string[]): ParsedDataset {
  return {
    headers,
    rows,
    rowCount: rows.length,
    columnCount: headers.length
  };
}

let seed = 1;
function deterministicRandom() {
  const x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
}

function runTests() {
  console.log('--- Running Deterministic Profiler Tests ---');

  const headers = [
    'price_col', 'rating_col', 'vendor_col', 'product_col', 'category_col', 'review_col', 'ignore_col', 'mixed_col', 'empty_col'
  ];

  const rows: Record<string, unknown>[] = [
    { price_col: 10.5, rating_col: '4', vendor_col: 'A', product_col: 'P1', category_col: 'C1', review_col: 'Good', ignore_col: 'X', mixed_col: '1', empty_col: null },
    { price_col: -5.0, rating_col: '5', vendor_col: 'B', product_col: 'P2', category_col: 'C2', review_col: 'Great', ignore_col: 'Y', mixed_col: 2, empty_col: undefined },
    { price_col: '100', rating_col: null, vendor_col: 'B', product_col: 'P2', category_col: 'C2', review_col: 'Ok', ignore_col: 'Z', mixed_col: 'text', empty_col: '' },
    { price_col: null, rating_col: undefined, vendor_col: 'C', product_col: 'P3', category_col: 'C1', review_col: 'Bad', ignore_col: 'W', mixed_col: null, empty_col: '   ' },
    { price_col: '', rating_col: ' ', vendor_col: 'A', product_col: 'P1', category_col: 'C3', review_col: 'Terrible', ignore_col: 'V', mixed_col: '', empty_col: null },
    { price_col: ' 50 ', rating_col: 3, vendor_col: 'A', product_col: 'P1', category_col: 'C3', review_col: 'Awesome', ignore_col: 'U', mixed_col: undefined, empty_col: '' },
    { price_col: NaN, rating_col: Infinity, vendor_col: 'D', product_col: 'P4', category_col: 'C4', review_col: 'Nice', ignore_col: 'T', mixed_col: ' ', empty_col: null },
  ];

  const parsed = createMockParsedDataset(rows, headers);

  const mappingDoc: SemanticMappingDocument = {
    version: 1,
    columns: [
      { sourceColumn: 'price_col', semanticField: SemanticField.PRICE },
      { sourceColumn: 'rating_col', semanticField: SemanticField.RATING },
      { sourceColumn: 'vendor_col', semanticField: SemanticField.COMPETITOR_NAME },
      { sourceColumn: 'product_col', semanticField: SemanticField.PRODUCT_NAME },
      { sourceColumn: 'category_col', semanticField: SemanticField.CATEGORY },
      { sourceColumn: 'review_col', semanticField: SemanticField.REVIEW_TEXT },
      { sourceColumn: 'ignore_col', semanticField: SemanticField.IGNORE },
      { sourceColumn: 'mixed_col', semanticField: SemanticField.DESCRIPTION },
      { sourceColumn: 'empty_col', semanticField: SemanticField.URL },
    ]
  };

  const profile = generateDeterministicProfile(parsed, mappingDoc);
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

  // 17. Physical dataset columnCount remains correct even with IGNORE fields.
  assert(profile.physicalColumnCount === 9, 'Physical columnCount remains correct (9)');
  
  // 16. IGNORE mapped column excluded from intelligence profiling. (Requirement 4C)
  assert(profile.intelligenceColumnCount === 8, 'Intelligence columnCount excludes IGNORE (8)');
  assert(profile.columns['ignore_col'] === undefined, 'Explicit IGNORE mapped column is excluded from intelligence profiling');

  // Requirement 4B: Fully empty mapped column
  const emptyProfile = profile.columns['empty_col'];
  assert(emptyProfile.inferredType === 'unknown', 'Fully empty mapped column inferredType is unknown');
  assert(emptyProfile.statistics === null, 'Fully empty mapped column statistics must be null');
  assert(profile.semanticAggregates[SemanticField.URL] === undefined, 'Fully empty mapped column does not pollute semanticAggregates with null');

  // 1, 2, 3, 4. Numeric column, Numeric strings, Negative numeric, Decimal numeric
  const priceProfile = profile.columns['price_col'];
  assert(priceProfile.inferredType === 'numeric', 'price_col inferred as numeric');
  
  // 5, 7, 8. Null values, Empty strings, Whitespace-only strings, NaN (Missing value policy)
  assert(priceProfile.missingCount === 3, 'price_col missingCount is 3');
  
  // 10. Missing percentage calculation.
  assert(priceProfile.missingPercentage === (3/7)*100, 'price_col missingPercentage is correct');
  
  const priceStats = priceProfile.statistics as Extract<ColumnStatistics, { type: 'numeric' }>;
  assert(priceStats.stats.count === 4, 'price_col count is 4');
  assert(priceStats.stats.min === -5.0, 'price_col min is -5.0');
  assert(priceStats.stats.max === 100, 'price_col max is 100');
  assert(priceStats.stats.mean === 38.875, 'price_col mean is 38.875');

  // 6. Undefined values if representable.
  const ratingProfile = profile.columns['rating_col'];
  assert(ratingProfile.missingCount === 4, 'rating_col missingCount is 4 (includes undefined and Infinity)');

  // 9. Mixed numeric/non-numeric values. (Requirement 4D)
  const mixedProfile = profile.columns['mixed_col'];
  assert(mixedProfile.missingCount === 4, 'mixed_col missingCount is 4');
  assert(mixedProfile.inferredType === 'mixed', 'mixed_col inferred as mixed, not numeric');

  // 11. Categorical unique count.
  const vendorProfile = profile.columns['vendor_col'];
  assert(vendorProfile.inferredType === 'string', 'vendor_col inferred as string');
  const vendorStats = vendorProfile.statistics as Extract<ColumnStatistics, { type: 'categorical' }>;
  assert(vendorStats.stats.uniqueCount === 4, 'vendor_col uniqueCount is 4 (A, B, C, D)');
  assert(vendorStats.stats.nonEmptyCount === 7, 'vendor_col nonEmptyCount is 7');

  // 12. Top-5 frequency bounding.
  const largeHeaders = ['cat'];
  const largeRows: Record<string, unknown>[] = [];
  for(let i=0; i<10; i++) largeRows.push({cat: 'A'});
  for(let i=0; i<9; i++) largeRows.push({cat: 'B'});
  for(let i=0; i<8; i++) largeRows.push({cat: 'C'});
  for(let i=0; i<7; i++) largeRows.push({cat: 'D'});
  for(let i=0; i<6; i++) largeRows.push({cat: 'E'});
  for(let i=0; i<5; i++) largeRows.push({cat: 'F'});
  const largeParsed = createMockParsedDataset(largeRows, largeHeaders);
  const largeMapping = { version: 1, columns: [{ sourceColumn: 'cat', semanticField: SemanticField.CATEGORY }] };
  const largeProfile = generateDeterministicProfile(largeParsed, largeMapping);
  
  const catStats = largeProfile.columns['cat'].statistics as Extract<ColumnStatistics, { type: 'categorical' }>;
  assert(catStats.stats.topFrequencies.length === 5, 'Categorical frequencies are bounded to top 5');

  // 13. Deterministic tie handling in top frequencies.
  const tieRows: Record<string, unknown>[] = [{cat: 'Z'}, {cat: 'Z'}, {cat: 'Y'}, {cat: 'Y'}];
  const tieParsed = createMockParsedDataset(tieRows, largeHeaders);
  const tieProfile = generateDeterministicProfile(tieParsed, largeMapping);
  const tieStats = tieProfile.columns['cat'].statistics as Extract<ColumnStatistics, { type: 'categorical' }>;
  assert(tieStats.stats.topFrequencies[0].value === 'Y' && tieStats.stats.topFrequencies[1].value === 'Z', 'Deterministic tie handling (alphabetical)');

  // 14. High-cardinality text column.
  // 15. REVIEW_TEXT does not cause unbounded raw text persistence.
  const reviewProfile = profile.columns['review_col'];
  assert(reviewProfile.statistics!.type === 'text', 'REVIEW_TEXT is treated as pure text, no frequency dictionary');
  
  // 18. COMPETITOR_NAME aggregation.
  // 19. PRODUCT_NAME aggregation.
  // 20. CATEGORY aggregation.
  // 21. PRICE statistics.
  // 22. RATING statistics.
  assert(profile.semanticAggregates[SemanticField.PRICE] !== undefined, 'PRICE semantic aggregate populated');
  assert(profile.semanticAggregates[SemanticField.RATING] !== undefined, 'RATING semantic aggregate populated');
  assert(profile.semanticAggregates[SemanticField.COMPETITOR_NAME] !== undefined, 'COMPETITOR_NAME semantic aggregate populated');
  assert(profile.semanticAggregates[SemanticField.PRODUCT_NAME] !== undefined, 'PRODUCT_NAME semantic aggregate populated');
  assert(profile.semanticAggregates[SemanticField.CATEGORY] !== undefined, 'CATEGORY semantic aggregate populated');

  // 23. Empty dataset behavior.
  const emptyParsed = createMockParsedDataset([], headers);
  const emptyDatasetProfile = generateDeterministicProfile(emptyParsed, mappingDoc);
  assert(emptyDatasetProfile.physicalRowCount === 0, 'Empty dataset rowCount is 0');
  assert(emptyDatasetProfile.columns['price_col'].missingPercentage === 0, 'Empty dataset missing percentage is 0, not NaN');

  // 24. Single-row dataset.
  const singleParsed = createMockParsedDataset([rows[0]], headers);
  const singleProfile = generateDeterministicProfile(singleParsed, mappingDoc);
  assert(singleProfile.physicalRowCount === 1, 'Single-row dataset profiled successfully');

  // 26. No NaN/Infinity appears in the resulting JSON-compatible profile.
  const jsonProfile = JSON.stringify(profile);
  assert(!jsonProfile.includes('NaN') && !jsonProfile.includes('Infinity'), 'No NaN or Infinity in JSON string');

  // 27. Running the profiler twice on identical input produces equivalent output.
  const profile2 = generateDeterministicProfile(parsed, mappingDoc);
  assert(JSON.stringify(profile) === JSON.stringify(profile2), 'Running profiler twice produces equivalent JSON output');

  // Requirement 4A: Incomplete SemanticMappingDocument
  let caughtIncompleteMapping = false;
  try {
    const missingHeaders = ['mapped_col', 'unmapped_col'];
    const missingRows: Record<string, unknown>[] = [{ mapped_col: 1, unmapped_col: 2 }];
    const missingParsed = createMockParsedDataset(missingRows, missingHeaders);
    const incompleteMapping = { version: 1, columns: [{ sourceColumn: 'mapped_col', semanticField: SemanticField.PRICE }] };
    generateDeterministicProfile(missingParsed, incompleteMapping);
  } catch (e) {
    if (e instanceof DatasetValidationError) {
      caughtIncompleteMapping = true;
    }
  }
  assert(caughtIncompleteMapping, 'Profiler rejects parsed dataset with headers missing from SemanticMappingDocument');

  // 25. Maximum/large realistic dataset performance sanity test.
  const maxRows: Record<string, unknown>[] = [];
  seed = 12345;
  for(let i=0; i<10000; i++) {
    maxRows.push({
      price_col: deterministicRandom() * 100,
      rating_col: Math.floor(deterministicRandom() * 5) + 1,
      vendor_col: 'Vendor' + (i % 10),
      product_col: 'Product' + (i % 20),
      category_col: 'Cat' + (i % 5),
      review_col: 'This is a long review text that should not be tracked by frequencies ' + i,
      ignore_col: 'Ignore',
      mixed_col: i % 2 === 0 ? i : 'text' + i,
      empty_col: null
    });
  }
  const maxParsed = createMockParsedDataset(maxRows, headers);
  const t0 = performance.now();
  const maxProfile = generateDeterministicProfile(maxParsed, mappingDoc);
  const t1 = performance.now();
  assert(maxProfile.physicalRowCount === 10000, 'Max dataset profiled successfully');
  assert(t1 - t0 < 500, `Max dataset profiled efficiently (${(t1 - t0).toFixed(2)}ms)`);

  console.log(`\nTests completed: ${passed} passed, ${failed} failed.`);
}

runTests();
