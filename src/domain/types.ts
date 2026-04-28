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

export type FeatureKey = 'team_invite' | 'notification_rule' | 'note_share';

export interface FeatureFlags {
  team_invite: number;
  notification_rule: number;
  note_share: number;
}

export interface Recommendation {
  guideId: string;
  userType: UserType;
  featureKey: FeatureKey;
  title: string;
  description: string;
  cta: string;
  reason: string;
}

export interface DashboardMetrics {
  sourceLabel: 'demo_mock';
  totalFocusMinutes: number;
  completionRate: number;
  notificationAdoptionRate: number;
  deliveryRate: number;
  teamFeatureUsageRate: number;
}

export interface CompletedActivity {
  id: string;
  label: string;
  kind: 'content_created' | 'team_invite' | 'notification_rule' | 'note_share';
  createdAt: number;
}

export interface ProjectDriveItem {
  id: string;
  name: string;
  kind: 'file' | 'folder' | 'shared_link';
  createdAt: number;
}

export interface GuideImpression {
  guideId: string;
  outcome: 'accepted' | 'dismissed' | 'hidden';
  createdAt: number;
}

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
