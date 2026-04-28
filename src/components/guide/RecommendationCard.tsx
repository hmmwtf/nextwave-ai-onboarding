import type { Classification, Recommendation, UserType } from '../../domain/types';

interface RecommendationCardProps {
  acceptedMessage: string;
  classification: Classification | null;
  onAcceptRecommendation: (recommendation: Recommendation) => void;
  onDismissLater: (recommendation: Recommendation) => void;
  onNeverShowAgain: (recommendation: Recommendation) => void;
  recommendation: Recommendation | null;
  userType: UserType | null;
}

export function RecommendationCard({
  acceptedMessage,
  classification,
  onAcceptRecommendation,
  onDismissLater,
  onNeverShowAgain,
  recommendation,
  userType,
}: RecommendationCardProps) {
  const handleCtaClick = () => {
    if (!recommendation) {
      return;
    }

    console.log('CTA clicked', recommendation);
    onAcceptRecommendation(recommendation);
  };

  return (
    <section className="card card-highlight" aria-labelledby="recommendation-title">
      <div className="card-header">
        <div>
          <p className="eyebrow">AI recommendation</p>
          <h2 id="recommendation-title">RecommendationCard</h2>
        </div>
        <span className="status-pill">AI guide</span>
      </div>

      {acceptedMessage ? (
        <div className="accepted-panel" role="status">
          {acceptedMessage}
        </div>
      ) : classification && recommendation ? (
        <div className="recommendation-layout">
          <div className="analysis-result">
            <dl>
              <div>
                <dt>사용자 유형</dt>
                <dd>{userType ?? classification.userType}</dd>
              </div>
              <div>
                <dt>신뢰도</dt>
                <dd>{classification.confidence.toFixed(2)}</dd>
              </div>
              <div>
                <dt>AI 분석 근거</dt>
                <dd>{classification.reasoning}</dd>
              </div>
              <div>
                <dt>키워드</dt>
                <dd>
                  {classification.keywords.length > 0
                    ? classification.keywords.join(', ')
                    : '감지된 키워드 없음'}
                </dd>
              </div>
            </dl>
          </div>

          <div className="recommendation-panel">
            <p className="eyebrow">추천 행동</p>
            <h3>{recommendation.title}</h3>
            <p>{recommendation.description}</p>
            <p className="recommendation-reason">{recommendation.reason}</p>
            <div className="guide-actions">
              <button className="primary-button" type="button" onClick={handleCtaClick}>
                {recommendation.cta}
              </button>
              <button
                className="secondary-button"
                type="button"
                onClick={() => onDismissLater(recommendation)}
              >
                나중에 하기
              </button>
              <button
                className="text-button"
                type="button"
                onClick={() => onNeverShowAgain(recommendation)}
              >
                다시 보지 않기
              </button>
            </div>
          </div>
        </div>
      ) : classification ? (
        <p>사용 가능한 추천이 없습니다.</p>
      ) : (
        <p>
          메모 또는 일정을 작성하면 user_type 분석 결과가 이 영역에 표시됩니다.
          추천 로직과 CTA 동작은 이후 단계에서 연결합니다.
        </p>
      )}
    </section>
  );
}
