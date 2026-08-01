import { z } from 'zod';
import { IntelligenceContext } from '../../modules/datasets/dataset-intelligence-context';
import { AiResponseValidationError } from '../errors/ai-errors';

export enum InsightType {
  FEATURE_GAP = 'FEATURE_GAP',
  PRICING_OPPORTUNITY = 'PRICING_OPPORTUNITY',
  SENTIMENT_SHIFT = 'SENTIMENT_SHIFT',
  COMPETITOR_TREND = 'COMPETITOR_TREND',
  PRODUCT_OBSERVATION = 'PRODUCT_OBSERVATION',
  MARKET_SIGNAL = 'MARKET_SIGNAL',
  GENERAL = 'GENERAL'
}

export enum ConfidenceLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH'
}

export const EvidenceSchema = z.object({
  sourceColumns: z.array(z.string()).min(1).max(50),
  sampleRowIndices: z.array(z.number().int().min(0)).min(1).max(20)
});

export const InsightSchema = z.object({
  type: z.nativeEnum(InsightType),
  title: z.string().min(1).max(100),
  summary: z.string().min(1).max(500),
  confidence: z.nativeEnum(ConfidenceLevel),
  evidence: EvidenceSchema
});

export const StructuredIntelligenceResultSchema = z.object({
  version: z.literal(1),
  insights: z.array(InsightSchema).max(10)
});

export type Evidence = z.infer<typeof EvidenceSchema>;
export type Insight = z.infer<typeof InsightSchema>;
export type StructuredIntelligenceResult = z.infer<typeof StructuredIntelligenceResultSchema>;

/**
 * Validates that the returned AI evidence actually exists in the provided IntelligenceContext.
 * Throws AiResponseValidationError if hallucinated/fabricated evidence is detected.
 */
export function validateEvidenceGrounding(
  result: StructuredIntelligenceResult,
  context: IntelligenceContext
): void {
  // Collect valid columns (non-IGNORE mapping columns provided in the context)
  const validColumns = new Set(context.mapping.map(m => m.sourceColumn));
  
  // Collect valid row indices (sampled rows)
  const validRowIndices = new Set(context.sampleRows.map(r => r.rowIndex));

  for (const insight of result.insights) {
    for (const col of insight.evidence.sourceColumns) {
      if (!validColumns.has(col)) {
        throw new AiResponseValidationError(`Fabricated source column evidence detected: "${col}"`);
      }
    }

    for (const idx of insight.evidence.sampleRowIndices) {
      if (!validRowIndices.has(idx)) {
        throw new AiResponseValidationError(`Fabricated sample row index evidence detected: ${idx}`);
      }
    }
  }
}
