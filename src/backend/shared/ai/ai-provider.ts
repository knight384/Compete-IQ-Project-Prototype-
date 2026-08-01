import { IntelligenceContext } from '../../modules/datasets/dataset-intelligence-context';
import { StructuredIntelligenceResult } from './intelligence-contract';

export interface AiIntelligenceProvider {
  generateInsights(context: IntelligenceContext): Promise<StructuredIntelligenceResult>;
}
