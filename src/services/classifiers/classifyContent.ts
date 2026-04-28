import { mockClassifier } from './mockClassifier';
import type {
  ClassificationInput,
  ClassificationResult,
  ClassifierAdapter,
} from './types';

export async function classifyContent(
  input: ClassificationInput,
  adapter: ClassifierAdapter = mockClassifier,
): Promise<ClassificationResult> {
  return adapter.classify(input);
}
