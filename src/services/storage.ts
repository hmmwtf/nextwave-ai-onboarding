import type {
  Classification,
  CompletedActivity,
  Content,
  DashboardMetrics,
  FeatureFlags,
  GuideImpression,
  ProjectDriveItem,
  Recommendation,
  UserType,
} from '../domain/types';

const STORAGE_KEY = 'nextwave-ai-onboarding-state';

export interface PersistedAppState {
  user: {
    userType: UserType | null;
  };
  contents: Content[];
  classifications: Classification[];
  activeClassification: Classification | null;
  activeRecommendation: Recommendation | null;
  guideImpressions: GuideImpression[];
  usedFeatures: FeatureFlags;
  metrics: DashboardMetrics;
  activities: CompletedActivity[];
  projectDriveItems: ProjectDriveItem[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isValidPersistedAppState(value: unknown): value is PersistedAppState {
  if (!isRecord(value)) {
    return false;
  }

  if (!isRecord(value.user) || !isRecord(value.usedFeatures)) {
    return false;
  }

  if (!isRecord(value.metrics)) {
    return false;
  }

  return (
    Array.isArray(value.contents) &&
    Array.isArray(value.classifications) &&
    Array.isArray(value.guideImpressions) &&
    Array.isArray(value.activities) &&
    Array.isArray(value.projectDriveItems)
  );
}

export function loadAppState(): PersistedAppState | null {
  try {
    const rawState = window.localStorage.getItem(STORAGE_KEY);

    if (!rawState) {
      return null;
    }

    const parsedState: unknown = JSON.parse(rawState);

    if (!isValidPersistedAppState(parsedState)) {
      return null;
    }

    return parsedState;
  } catch {
    return null;
  }
}

export function saveAppState(state: PersistedAppState) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Persistence is best-effort for the demo.
  }
}

export function clearAppState() {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore localStorage failures so reset never crashes the app.
  }
}
