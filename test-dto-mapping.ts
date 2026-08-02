import { toDatasetMetadataDto } from './src/backend/shared/utils/dataset-dtos';
import { Dataset, DatasetStatus } from '@prisma/client';

async function runDtoTest() {
  const mockDataset: Dataset = {
    id: '123-abc',
    orgId: 'org-456',
    originalFilename: 'test.csv',
    storageKey: 'datasets/org-456/123-abc.csv',
    mimeType: 'text/csv',
    format: 'text/csv',
    fileSize: 1024,
    status: DatasetStatus.READY,
    failureReason: null,
    semanticMapping: { version: 1, columns: [{ sourceColumn: 'Name', semanticField: 'PRODUCT_NAME' }] },
    createdAt: new Date('2026-08-01T10:00:00Z'),
    updatedAt: new Date('2026-08-01T11:00:00Z'),
  };

  const dto = toDatasetMetadataDto(mockDataset);

  const dtoKeys = Object.keys(dto);
  
  if (dtoKeys.includes('storageKey')) throw new Error('storageKey leaked');
  if (dtoKeys.includes('orgId')) throw new Error('orgId leaked');
  if (dtoKeys.includes('semanticMapping')) throw new Error('semanticMapping leaked');

  if (dto.id !== '123-abc') throw new Error('id missing or incorrect');
  if (dto.originalFilename !== 'test.csv') throw new Error('originalFilename missing or incorrect');
  if (dto.format !== 'text/csv') throw new Error('format missing or incorrect');
  if (dto.fileSize !== 1024) throw new Error('fileSize missing or incorrect');
  if (dto.status !== 'READY') throw new Error('status missing or incorrect');
  if (dto.createdAt !== '2026-08-01T10:00:00.000Z') throw new Error('createdAt missing or incorrect');
  if (dto.updatedAt !== '2026-08-01T11:00:00.000Z') throw new Error('updatedAt missing or incorrect');

  console.log('test-dto-mapping.ts passed. Sensitive fields successfully stripped.');
}

runDtoTest().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
