import type { ContentType } from '../../domain/types';

export interface ClassificationInput {
  title: string;
  content: string;
  type: ContentType;
}

export type ClassificationUserType =
  | '대학생'
  | '직장인'
  | '프리랜서'
  | '팀 사용자'
  | 'unknown';

export interface ClassificationResult {
  user_type: ClassificationUserType;
  confidence: number;
  reasoning: string;
  keywords: string[];
}

export interface ClassifierAdapter {
  classify(input: ClassificationInput): Promise<ClassificationResult>;
}
