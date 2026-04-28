import type {
  Classification,
  CompletedActivity,
  Content,
  DashboardMetrics,
  FeatureKey,
  FeatureFlags,
  ProjectDriveItem,
} from '../domain/types';

const STORAGE_KEY = 'nextwave-ai-onboarding-state';

export interface PersistedState {
  contents: Content[];
  classifications: Classification[];
  usedFeatures: FeatureFlags;
  dismissedGuides: string[];
  sessionDismissedGuides: string[];
  dismissedFeatures: FeatureKey[];
  sessionDismissedFeatures: FeatureKey[];
  dashboard: {
    metrics: DashboardMetrics;
    completedWorks: CompletedActivity[];
    projectDriveItems: ProjectDriveItem[];
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isValidState(value: unknown): value is PersistedState {
  if (!isRecord(value)) {
    return false;
  }

  if (!isRecord(value.usedFeatures) || !isRecord(value.dashboard)) {
    return false;
  }

  const dashboard = value.dashboard;

  return (
    Array.isArray(value.contents) &&
    Array.isArray(value.classifications) &&
    Array.isArray(value.dismissedGuides) &&
    Array.isArray(value.sessionDismissedGuides) &&
    Array.isArray(value.dismissedFeatures) &&
    Array.isArray(value.sessionDismissedFeatures) &&
    isRecord(dashboard.metrics) &&
    Array.isArray(dashboard.completedWorks) &&
    Array.isArray(dashboard.projectDriveItems)
  );
}

export function loadState(): PersistedState | null {
  try {
    const rawState = window.localStorage.getItem(STORAGE_KEY);

    if (!rawState) {
      return null;
    }

    const parsedState: unknown = JSON.parse(rawState);

    if (!isValidState(parsedState)) {
      return null;
    }

    return parsedState;
  } catch {
    return null;
  }
}

export function saveState(state: PersistedState) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Persistence is best-effort for the MVP demo.
  }
}

export function clearState() {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Reset should never crash the app.
  }
}
