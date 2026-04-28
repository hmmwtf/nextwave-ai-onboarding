import type { Classification, ClassificationSource, UserType } from '../types';
import type { ClassificationResult } from '../../services/classifiers/types';

const THETA = 0.75;

interface ResolveUserTypeParams {
  result: ClassificationResult;
  previousClassifications: Classification[];
}

interface ResolveUserTypeResult {
  userType: UserType;
  source: ClassificationSource;
}

function getMostFrequentUserType(classifications: Classification[]): UserType {
  const counts = new Map<UserType, number>();

  for (const classification of classifications) {
    counts.set(
      classification.userType,
      (counts.get(classification.userType) ?? 0) + 1,
    );
  }

  let selected = classifications[0].userType;
  let selectedCount = counts.get(selected) ?? 0;

  for (const classification of classifications) {
    const count = counts.get(classification.userType) ?? 0;

    if (count > selectedCount) {
      selected = classification.userType;
      selectedCount = count;
    }
  }

  return selected;
}

export function resolveUserType({
  result,
  previousClassifications,
}: ResolveUserTypeParams): ResolveUserTypeResult {
  if (result.confidence >= THETA && result.user_type !== 'unknown') {
    return {
      userType: result.user_type,
      source: 'mock_classifier',
    };
  }

  if (previousClassifications.length > 0) {
    return {
      userType: getMostFrequentUserType(previousClassifications),
      source: 'history_fallback',
    };
  }

  return {
    userType: '개인 사용자',
    source: 'default_fallback',
  };
}
