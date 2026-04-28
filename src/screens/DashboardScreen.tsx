import { useEffect, useRef, useState } from 'react';
import { ContentCreateModal } from '../components/content/ContentCreateModal';
import { ContentList } from '../components/content/ContentList';
import { ProjectDriveMock } from '../components/dashboard/ProjectDriveMock';
import { StatsPanel } from '../components/dashboard/StatsPanel';
import { RecommendationCard } from '../components/guide/RecommendationCard';
import { resolveUserType } from '../domain/classification/resolveUserType';
import { selectRecommendation } from '../domain/recommendation/selectRecommendation';
import type {
  Classification,
  CompletedActivity,
  Content,
  DashboardMetrics,
  FeatureKey,
  FeatureFlags,
  GuideImpression,
  ProjectDriveItem,
  Recommendation,
  UserType,
} from '../domain/types';
import { classifyContent } from '../services/classifiers/classifyContent';
import {
  clearState,
  loadState,
  saveState,
  type PersistedState,
} from '../services/storage';

const initialUsedFeatures: FeatureFlags = {
  team_invite: 0,
  notification_rule: 0,
  note_share: 0,
};

const initialMetrics: DashboardMetrics = {
  sourceLabel: 'demo_mock',
  totalFocusMinutes: 2325,
  completionRate: 75,
  notificationAdoptionRate: 10,
  deliveryRate: 92,
  teamFeatureUsageRate: 60,
};

function clampPercent(value: number) {
  return Math.min(value, 100);
}

function createInitialPersistedState(): PersistedState {
  return {
    contents: [],
    classifications: [],
    usedFeatures: initialUsedFeatures,
    dismissedGuides: [],
    sessionDismissedGuides: [],
    dismissedFeatures: [],
    sessionDismissedFeatures: [],
    dashboard: {
      metrics: initialMetrics,
      completedWorks: [],
      projectDriveItems: [],
    },
  };
}

function getInitialPersistedState() {
  return loadState() ?? createInitialPersistedState();
}

export function DashboardScreen() {
  const [initialPersistedState] = useState<PersistedState>(
    getInitialPersistedState,
  );
  const shouldSkipNextSave = useRef(false);
  const [contents, setContents] = useState<Content[]>(
    initialPersistedState.contents,
  );
  const [activities, setActivities] = useState<CompletedActivity[]>(
    initialPersistedState.dashboard.completedWorks,
  );
  const [projectDriveItems, setProjectDriveItems] = useState<ProjectDriveItem[]>(
    initialPersistedState.dashboard.projectDriveItems,
  );
  const [metrics, setMetrics] = useState<DashboardMetrics>(
    initialPersistedState.dashboard.metrics,
  );
  const [classifications, setClassifications] = useState<Classification[]>(
    initialPersistedState.classifications,
  );
  const [activeClassification, setActiveClassification] =
    useState<Classification | null>(null);
  const [activeRecommendation, setActiveRecommendation] =
    useState<Recommendation | null>(null);
  const [usedFeatures, setUsedFeatures] =
    useState<FeatureFlags>(initialPersistedState.usedFeatures);
  const [dismissedGuides, setDismissedGuides] = useState<string[]>(
    initialPersistedState.dismissedGuides,
  );
  const [dismissedFeatures, setDismissedFeatures] = useState<FeatureKey[]>(
    initialPersistedState.dismissedFeatures,
  );
  const [sessionDismissedGuides, setSessionDismissedGuides] = useState<string[]>(
    initialPersistedState.sessionDismissedGuides,
  );
  const [sessionDismissedFeatures, setSessionDismissedFeatures] = useState<
    FeatureKey[]
  >(initialPersistedState.sessionDismissedFeatures);
  const [guideImpressions, setGuideImpressions] = useState<GuideImpression[]>(
    [],
  );
  const [acceptedMessage, setAcceptedMessage] = useState('');
  const [user, setUser] = useState<{ userType: UserType | null }>({
    userType: null,
  });
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    if (shouldSkipNextSave.current) {
      shouldSkipNextSave.current = false;
      return;
    }

    saveState({
      contents,
      classifications,
      usedFeatures,
      dismissedGuides,
      sessionDismissedGuides,
      dismissedFeatures,
      sessionDismissedFeatures,
      dashboard: {
        metrics,
        completedWorks: activities,
        projectDriveItems,
      },
    });
  }, [
    contents,
    classifications,
    usedFeatures,
    dismissedGuides,
    sessionDismissedGuides,
    dismissedFeatures,
    sessionDismissedFeatures,
    metrics,
    activities,
    projectDriveItems,
  ]);

  const handleResetDemo = () => {
    const nextState = createInitialPersistedState();

    shouldSkipNextSave.current = true;
    clearState();
    setUser({ userType: null });
    setContents(nextState.contents);
    setClassifications(nextState.classifications);
    setActiveClassification(null);
    setActiveRecommendation(null);
    setGuideImpressions([]);
    setUsedFeatures(nextState.usedFeatures);
    setMetrics(nextState.dashboard.metrics);
    setActivities(nextState.dashboard.completedWorks);
    setProjectDriveItems(nextState.dashboard.projectDriveItems);
    setDismissedGuides(nextState.dismissedGuides);
    setDismissedFeatures(nextState.dismissedFeatures);
    setSessionDismissedGuides(nextState.sessionDismissedGuides);
    setSessionDismissedFeatures(nextState.sessionDismissedFeatures);
    setAcceptedMessage('');
    setIsAnalyzing(false);
    setIsCreateModalOpen(false);
  };

  const handleCreateContent = async (content: Content) => {
    setContents((currentContents) => [content, ...currentContents]);
    setIsCreateModalOpen(false);
    setIsAnalyzing(true);
    setAcceptedMessage('');

    const result = await classifyContent({
      title: content.title,
      content: content.body,
      type: content.type,
    });

    const resolved = resolveUserType({
      result,
      previousClassifications: classifications,
    });

    const classification: Classification = {
      contentId: content.id,
      userType: resolved.userType,
      rawUserType: result.user_type,
      confidence: result.confidence,
      reasoning: result.reasoning,
      keywords: result.keywords,
      source: resolved.source,
      createdAt: Date.now(),
    };

    setUser({ userType: resolved.userType });
    setActiveRecommendation(
      selectRecommendation({
        userType: resolved.userType,
        usedFeatures,
        dismissedGuides,
        dismissedFeatures,
        sessionDismissedGuides,
        sessionDismissedFeatures,
      }),
    );
    setClassifications((currentClassifications) => [
      classification,
      ...currentClassifications,
    ]);
    setActiveClassification(classification);
    setIsAnalyzing(false);
  };

  const handleAcceptRecommendation = (recommendation: Recommendation) => {
    const now = Date.now();

    setGuideImpressions((currentImpressions) => [
      {
        guideId: recommendation.guideId,
        outcome: 'accepted',
        createdAt: now,
      },
      ...currentImpressions,
    ]);

    setUsedFeatures((currentUsedFeatures) => ({
      ...currentUsedFeatures,
      [recommendation.featureKey]:
        currentUsedFeatures[recommendation.featureKey] + 1,
    }));

    if (recommendation.featureKey === 'team_invite') {
      setActivities((currentActivities) => [
        {
          id: `activity_${now}`,
          label: '[팀 초대 완료]',
          kind: 'team_invite',
          createdAt: now,
        },
        ...currentActivities,
      ]);
      setMetrics((currentMetrics) => ({
        ...currentMetrics,
        teamFeatureUsageRate: clampPercent(
          currentMetrics.teamFeatureUsageRate + 15,
        ),
        deliveryRate: clampPercent(currentMetrics.deliveryRate + 5),
      }));
    }

    if (recommendation.featureKey === 'notification_rule') {
      setActivities((currentActivities) => [
        {
          id: `activity_${now}`,
          label: '[알림 규칙 생성]',
          kind: 'notification_rule',
          createdAt: now,
        },
        ...currentActivities,
      ]);
      setMetrics((currentMetrics) => ({
        ...currentMetrics,
        notificationAdoptionRate: clampPercent(
          currentMetrics.notificationAdoptionRate + 10,
        ),
        completionRate: clampPercent(currentMetrics.completionRate + 5),
      }));
    }

    if (recommendation.featureKey === 'note_share') {
      setActivities((currentActivities) => [
        {
          id: `activity_${now}`,
          label: '[메모 공유 완료]',
          kind: 'note_share',
          createdAt: now,
        },
        ...currentActivities,
      ]);
      setProjectDriveItems((currentItems) => [
        {
          id: `drive_${now}`,
          name: '공유 링크 생성',
          kind: 'shared_link',
          createdAt: now,
        },
        ...currentItems,
      ]);
      setMetrics((currentMetrics) => ({
        ...currentMetrics,
        deliveryRate: clampPercent(currentMetrics.deliveryRate + 8),
      }));
    }

    setActiveRecommendation(null);
    setAcceptedMessage(`${recommendation.cta} 완료`);
  };

  const handleDismissLater = (recommendation: Recommendation) => {
    const nextSessionDismissedGuides = [
      ...sessionDismissedGuides,
      recommendation.guideId,
    ];
    const nextSessionDismissedFeatures = [
      ...sessionDismissedFeatures,
      recommendation.featureKey,
    ];

    setSessionDismissedGuides(nextSessionDismissedGuides);
    setSessionDismissedFeatures(nextSessionDismissedFeatures);
    setActiveRecommendation(
      user.userType
        ? selectRecommendation({
            userType: user.userType,
            usedFeatures,
            dismissedGuides,
            dismissedFeatures,
            sessionDismissedGuides: nextSessionDismissedGuides,
            sessionDismissedFeatures: nextSessionDismissedFeatures,
          })
        : null,
    );
    setAcceptedMessage('');
  };

  const handleNeverShowAgain = (recommendation: Recommendation) => {
    const nextDismissedGuides = [...dismissedGuides, recommendation.guideId];
    const nextDismissedFeatures = [
      ...dismissedFeatures,
      recommendation.featureKey,
    ];

    setDismissedGuides(nextDismissedGuides);
    setDismissedFeatures(nextDismissedFeatures);
    setActiveRecommendation(
      user.userType
        ? selectRecommendation({
            userType: user.userType,
            usedFeatures,
            dismissedGuides: nextDismissedGuides,
            dismissedFeatures: nextDismissedFeatures,
            sessionDismissedGuides,
            sessionDismissedFeatures,
          })
        : null,
    );
    setAcceptedMessage('');
  };

  return (
    <main className="dashboard-shell">
      <header className="dashboard-header">
        <div>
          <p className="eyebrow">NextWave AI Onboarding</p>
          <h1>Dashboard</h1>
        </div>
        <button
          className="primary-button"
          type="button"
          onClick={() => setIsCreateModalOpen(true)}
        >
          새로 만들기
        </button>
        <button className="secondary-button" type="button" onClick={handleResetDemo}>
          데모 초기화
        </button>
      </header>

      {isAnalyzing ? (
        <section className="analysis-banner" aria-live="polite">
          AI 분석 중...
        </section>
      ) : null}

      <section className="dashboard-grid" aria-label="MVP dashboard sections">
        <RecommendationCard
          acceptedMessage={acceptedMessage}
          classification={activeClassification}
          onAcceptRecommendation={handleAcceptRecommendation}
          onDismissLater={handleDismissLater}
          onNeverShowAgain={handleNeverShowAgain}
          recommendation={activeRecommendation}
          userType={user.userType}
        />
        <StatsPanel metrics={metrics} />
        <ContentList contents={contents} activities={activities} />
        <ProjectDriveMock items={projectDriveItems} />
      </section>

      {isCreateModalOpen ? (
        <ContentCreateModal
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={handleCreateContent}
        />
      ) : null}
    </main>
  );
}
