import type { FeatureFlags, Recommendation, UserType } from '../types';
import { featureFallbackGuides, guideCatalog } from './guideCatalog';

const featurePriority: Array<keyof FeatureFlags> = [
  'team_invite',
  'notification_rule',
  'note_share',
];

interface SelectRecommendationParams {
  userType: UserType;
  usedFeatures: FeatureFlags;
  dismissedGuides: string[];
  sessionDismissedGuides: string[];
}

function isDismissed(
  recommendation: Recommendation,
  dismissedGuides: string[],
  sessionDismissedGuides: string[],
) {
  return (
    dismissedGuides.includes(recommendation.guideId) ||
    sessionDismissedGuides.includes(recommendation.guideId)
  );
}

function canShowRecommendation(
  recommendation: Recommendation,
  params: SelectRecommendationParams,
) {
  return (
    params.usedFeatures[recommendation.featureKey] === 0 &&
    !isDismissed(
      recommendation,
      params.dismissedGuides,
      params.sessionDismissedGuides,
    )
  );
}

export function selectRecommendation(
  params: SelectRecommendationParams,
): Recommendation | null {
  const primaryRecommendation = guideCatalog[params.userType];

  if (canShowRecommendation(primaryRecommendation, params)) {
    return primaryRecommendation;
  }

  const nextFeature = featurePriority.find((featureKey) => {
    const recommendation = featureFallbackGuides[featureKey];

    return canShowRecommendation(recommendation, params);
  });

  if (!nextFeature) {
    return null;
  }

  return featureFallbackGuides[nextFeature];
}
