import { suggestSemanticMappings, SemanticField } from './src/backend/shared/mapping/semantic-mapping';
import { datasetService } from './src/backend/modules/datasets/dataset.service';
import { datasetRepository } from './src/backend/modules/datasets/dataset.repository';
import { DatasetMappingError, DatasetStateError } from './src/backend/shared/errors/dataset-errors';

const MOCK_ORG_ID = '11111111-1111-1111-1111-111111111111';

async function testSuggestions() {
  console.log('--- Testing Suggestions ---');
  const headers = ['competitor_name', 'random_col'];
  const suggestions = suggestSemanticMappings(headers);
  
  // 1. Known deterministic suggestion.
  if (suggestions[0].suggestedField === SemanticField.COMPETITOR_NAME && suggestions[0].confidence === 'HIGH') 
    console.log('1. Known deterministic suggestion... PASS'); 
  else console.log('1. Known deterministic suggestion... FAIL');

  // 2. Unknown suggestion -> null/NONE.
  if (suggestions[1].suggestedField === null && suggestions[1].confidence === 'NONE') 
    console.log('2. Unknown suggestion -> null/NONE... PASS'); 
  else console.log('2. Unknown suggestion -> null/NONE... FAIL');
}

async function run() {
  await testSuggestions();
  
  console.log('--- Testing Confirmations ---');
  const csvContent = Buffer.from('vendor,product,price,extra1,extra2\nAcme,Widget,10,a,b');
  const ds = await datasetService.uploadDataset(MOCK_ORG_ID, 'test_mapping.csv', 'text/csv', csvContent);
  await datasetService.parseDataset(ds.id, MOCK_ORG_ID); // MAPPING_REQUIRED

  // 14. mapping suggestions do not change Dataset status.
  process.stdout.write('14. mapping suggestions do not change Dataset status... ');
  await datasetService.getMappingSuggestions(ds.id, MOCK_ORG_ID);
  let currentDs = await datasetRepository.findById(ds.id, MOCK_ORG_ID);
  if (currentDs?.status === 'MAPPING_REQUIRED') console.log('PASS');
  else console.log('FAIL:', currentDs?.status);

  // 5. null semanticField rejected.
  process.stdout.write('5. null semanticField rejected... ');
  try {
    await datasetService.confirmColumnMapping(ds.id, MOCK_ORG_ID, [
      { sourceColumn: 'vendor', semanticField: SemanticField.COMPETITOR_NAME },
      { sourceColumn: 'product', semanticField: SemanticField.PRODUCT_NAME },
      { sourceColumn: 'price', semanticField: SemanticField.PRICE },
      { sourceColumn: 'extra1', semanticField: null as any },
      { sourceColumn: 'extra2', semanticField: SemanticField.IGNORE },
    ]);
    console.log('FAIL');
  } catch (e: any) {
    if (e.message.includes('cannot be null or missing')) console.log('PASS'); else console.log('FAIL', e.message);
  }

  // 6. missing semanticField rejected.
  process.stdout.write('6. missing semanticField rejected... ');
  try {
    await datasetService.confirmColumnMapping(ds.id, MOCK_ORG_ID, [
      { sourceColumn: 'vendor', semanticField: SemanticField.COMPETITOR_NAME },
      { sourceColumn: 'product', semanticField: SemanticField.PRODUCT_NAME },
      { sourceColumn: 'price', semanticField: SemanticField.PRICE },
      { sourceColumn: 'extra1' } as any,
      { sourceColumn: 'extra2', semanticField: SemanticField.IGNORE },
    ]);
    console.log('FAIL');
  } catch (e: any) {
    if (e.message.includes('cannot be null or missing')) console.log('PASS'); else console.log('FAIL', e.message);
  }

  // 7. arbitrary semantic string rejected.
  process.stdout.write('7. arbitrary semantic string rejected... ');
  try {
    await datasetService.confirmColumnMapping(ds.id, MOCK_ORG_ID, [
      { sourceColumn: 'vendor', semanticField: SemanticField.COMPETITOR_NAME },
      { sourceColumn: 'product', semanticField: SemanticField.PRODUCT_NAME },
      { sourceColumn: 'price', semanticField: SemanticField.PRICE },
      { sourceColumn: 'extra1', semanticField: 'FAKE' as any },
      { sourceColumn: 'extra2', semanticField: SemanticField.IGNORE },
    ]);
    console.log('FAIL');
  } catch (e: any) {
    if (e.message.includes('Invalid semantic field')) console.log('PASS'); else console.log('FAIL', e.message);
  }

  // 8. unknown source column rejected.
  process.stdout.write('8. unknown source column rejected... ');
  try {
    await datasetService.confirmColumnMapping(ds.id, MOCK_ORG_ID, [
      { sourceColumn: 'vendor', semanticField: SemanticField.COMPETITOR_NAME },
      { sourceColumn: 'product', semanticField: SemanticField.PRODUCT_NAME },
      { sourceColumn: 'price', semanticField: SemanticField.PRICE },
      { sourceColumn: 'extra1', semanticField: SemanticField.IGNORE },
      { sourceColumn: 'extra3', semanticField: SemanticField.IGNORE }, // FAKE
    ]);
    console.log('FAIL');
  } catch (e: any) {
    if (e.message.includes('Unknown source column')) console.log('PASS'); else console.log('FAIL', e.message);
  }

  // 9. missing source column rejected.
  process.stdout.write('9. missing source column rejected... ');
  try {
    await datasetService.confirmColumnMapping(ds.id, MOCK_ORG_ID, [
      { sourceColumn: 'vendor', semanticField: SemanticField.COMPETITOR_NAME },
      { sourceColumn: 'product', semanticField: SemanticField.PRODUCT_NAME },
      { sourceColumn: 'price', semanticField: SemanticField.PRICE },
      { sourceColumn: 'extra1', semanticField: SemanticField.IGNORE },
    ]);
    console.log('FAIL');
  } catch (e: any) {
    if (e.message.includes('Mapping must cover exactly 5 source columns')) console.log('PASS'); else console.log('FAIL', e.message);
  }

  // 10. duplicate source column rejected.
  process.stdout.write('10. duplicate source column rejected... ');
  try {
    await datasetService.confirmColumnMapping(ds.id, MOCK_ORG_ID, [
      { sourceColumn: 'vendor', semanticField: SemanticField.COMPETITOR_NAME },
      { sourceColumn: 'vendor', semanticField: SemanticField.PRODUCT_NAME },
      { sourceColumn: 'price', semanticField: SemanticField.PRICE },
      { sourceColumn: 'extra1', semanticField: SemanticField.IGNORE },
      { sourceColumn: 'extra2', semanticField: SemanticField.IGNORE },
    ]);
    console.log('FAIL');
  } catch (e: any) {
    if (e.message.includes('Duplicate source column mapping')) console.log('PASS'); else console.log('FAIL', e.message);
  }

  // 11. duplicate non-IGNORE semantic field rejected.
  process.stdout.write('11. duplicate non-IGNORE semantic field rejected... ');
  try {
    await datasetService.confirmColumnMapping(ds.id, MOCK_ORG_ID, [
      { sourceColumn: 'vendor', semanticField: SemanticField.COMPETITOR_NAME },
      { sourceColumn: 'product', semanticField: SemanticField.PRODUCT_NAME },
      { sourceColumn: 'price', semanticField: SemanticField.COMPETITOR_NAME },
      { sourceColumn: 'extra1', semanticField: SemanticField.IGNORE },
      { sourceColumn: 'extra2', semanticField: SemanticField.IGNORE },
    ]);
    console.log('FAIL');
  } catch (e: any) {
    if (e.message.includes('Duplicate mapping for singleton')) console.log('PASS'); else console.log('FAIL', e.message);
  }

  // 3, 4, 12, 15. Valid complete mapping with explicit multiple IGNOREs and no nulls
  process.stdout.write('3, 4, 12. Valid complete mapping with explicit multiple IGNOREs... ');
  try {
    const finalDs = await datasetService.confirmColumnMapping(ds.id, MOCK_ORG_ID, [
      { sourceColumn: 'vendor', semanticField: SemanticField.COMPETITOR_NAME },
      { sourceColumn: 'product', semanticField: SemanticField.PRODUCT_NAME },
      { sourceColumn: 'price', semanticField: SemanticField.PRICE },
      { sourceColumn: 'extra1', semanticField: SemanticField.IGNORE },
      { sourceColumn: 'extra2', semanticField: SemanticField.IGNORE },
    ]);
    console.log('PASS');
    
    process.stdout.write('15. Confirmed mapping contains no nulls... ');
    const mappingDoc: any = finalDs.semanticMapping;
    const hasNulls = mappingDoc.columns.some((c: any) => c.semanticField === null);
    if (!hasNulls) console.log('PASS'); else console.log('FAIL');
  } catch (e: any) {
    console.log('FAIL:', e.message);
  }

  // 13. wrong dataset state rejected.
  process.stdout.write('13. wrong dataset state rejected... ');
  try {
    // dataset is now MAPPED
    await datasetService.confirmColumnMapping(ds.id, MOCK_ORG_ID, [
      { sourceColumn: 'vendor', semanticField: SemanticField.COMPETITOR_NAME },
      { sourceColumn: 'product', semanticField: SemanticField.PRODUCT_NAME },
      { sourceColumn: 'price', semanticField: SemanticField.PRICE },
      { sourceColumn: 'extra1', semanticField: SemanticField.IGNORE },
      { sourceColumn: 'extra2', semanticField: SemanticField.IGNORE },
    ]);
    console.log('FAIL');
  } catch (e: any) {
    if (e instanceof DatasetStateError) console.log('PASS'); else console.log('FAIL', e.message);
  }
}

run().catch(console.error);
