import { useState } from 'react';
import { ContentCreateModal } from '../components/content/ContentCreateModal';
import { ContentList } from '../components/content/ContentList';
import { ProjectDriveMock } from '../components/dashboard/ProjectDriveMock';
import { StatsPanel } from '../components/dashboard/StatsPanel';
import { RecommendationCard } from '../components/guide/RecommendationCard';
import { resolveUserType } from '../domain/classification/resolveUserType';
import { selectRecommendation } from '../domain/recommendation/selectRecommendation';
import type {
  Classification,
  Content,
  FeatureFlags,
  Recommendation,
  UserType,
} from '../domain/types';
import { classifyContent } from '../services/classifiers/classifyContent';

const initialUsedFeatures: FeatureFlags = {
  team_invite: 0,
  notification_rule: 0,
  note_share: 0,
};

export function DashboardScreen() {
  const [contents, setContents] = useState<Content[]>([]);
  const [classifications, setClassifications] = useState<Classification[]>([]);
  const [activeClassification, setActiveClassification] =
    useState<Classification | null>(null);
  const [activeRecommendation, setActiveRecommendation] =
    useState<Recommendation | null>(null);
  const [usedFeatures] = useState<FeatureFlags>(initialUsedFeatures);
  const [dismissedGuides] = useState<string[]>([]);
  const [sessionDismissedGuides] = useState<string[]>([]);
  const [user, setUser] = useState<{ userType: UserType | null }>({
    userType: null,
  });
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleCreateContent = async (content: Content) => {
    setContents((currentContents) => [content, ...currentContents]);
    setIsCreateModalOpen(false);
    setIsAnalyzing(true);

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
        sessionDismissedGuides,
      }),
    );
    setClassifications((currentClassifications) => [
      classification,
      ...currentClassifications,
    ]);
    setActiveClassification(classification);
    setIsAnalyzing(false);
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
      </header>

      {isAnalyzing ? (
        <section className="analysis-banner" aria-live="polite">
          AI 분석 중...
        </section>
      ) : null}

      <section className="dashboard-grid" aria-label="MVP dashboard sections">
        <RecommendationCard
          classification={activeClassification}
          recommendation={activeRecommendation}
          userType={user.userType}
        />
        <StatsPanel />
        <ContentList contents={contents} />
        <ProjectDriveMock />
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
