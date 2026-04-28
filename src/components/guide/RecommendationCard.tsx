import type { Classification, UserType } from '../../domain/types';

interface RecommendationCardProps {
  classification: Classification | null;
  userType: UserType | null;
}

export function RecommendationCard({
  classification,
  userType,
}: RecommendationCardProps) {
  return (
    <section className="card card-highlight" aria-labelledby="recommendation-title">
      <div className="card-header">
        <div>
          <p className="eyebrow">AI analysis</p>
          <h2 id="recommendation-title">RecommendationCard</h2>
        </div>
        <span className="status-pill">AI guide</span>
      </div>
      {classification ? (
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
      ) : (
        <p>
          메모 또는 일정을 작성하면 user_type 분석 결과가 이 영역에 표시됩니다.
          추천 로직과 CTA 동작은 이후 단계에서 연결합니다.
        </p>
      )}
    </section>
  );
}
