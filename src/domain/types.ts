export type ContentType = 'memo' | 'schedule';

export type UserType =
  | '대학생'
  | '직장인'
  | '프리랜서'
  | '팀 사용자'
  | '개인 사용자';

export type RawUserType = Exclude<UserType, '개인 사용자'> | 'unknown';

export type ClassificationSource =
  | 'mock_classifier'
  | 'history_fallback'
  | 'default_fallback';

export interface Content {
  id: string;
  type: ContentType;
  title: string;
  body: string;
  date?: string;
  createdAt: number;
}

export interface Classification {
  contentId: string;
  userType: UserType;
  rawUserType: RawUserType;
  confidence: number;
  reasoning: string;
  keywords: string[];
  source: ClassificationSource;
  createdAt: number;
}
