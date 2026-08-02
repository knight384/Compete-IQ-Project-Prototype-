import { DatasetFailureCode } from '@prisma/client';

export const RETRYABLE_DATASET_FAILURE_CODES: DatasetFailureCode[] = [
  DatasetFailureCode.AI_CONFIGURATION,
  DatasetFailureCode.AI_PROVIDER,
  DatasetFailureCode.AI_RESPONSE_VALIDATION,
  DatasetFailureCode.STORAGE,
  DatasetFailureCode.PERSISTENCE,
];

export function isRetryableFailureCode(code: DatasetFailureCode | null | undefined): boolean {
  if (!code) return false;
  return RETRYABLE_DATASET_FAILURE_CODES.includes(code);
}
