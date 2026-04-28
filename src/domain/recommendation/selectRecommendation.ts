import type { FeatureFlags, FeatureKey, Recommendation, UserType } from '../types';
import { featureFallbackGuides, guideCatalog } from './guideCatalog';

const featurePriority: FeatureKey[] = [
  'team_invite',
  'notification_rule',
  'note_share',
];

interface SelectRecommendationParams {
  userType: UserType;
  usedFeatures: FeatureFlags;
  dismissedGuides: string[];
  dismissedFeatures: FeatureKey[];
  sessionDismissedGuides: string[];
  sessionDismissedFeatures: FeatureKey[];
}

function isDismissed(
  recommendation: Recommendation,
  params: SelectRecommendationParams,
) {
  return (
    params.dismissedGuides.includes(recommendation.guideId) ||
    params.sessionDismissedGuides.includes(recommendation.guideId) ||
    params.dismissedFeatures.includes(recommendation.featureKey) ||
    params.sessionDismissedFeatures.includes(recommendation.featureKey)
  );
}

function canShowRecommendation(
  recommendation: Recommendation,
  params: SelectRecommendationParams,
) {
  return (
    params.usedFeatures[recommendation.featureKey] === 0 &&
    !isDismissed(recommendation, params)
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
