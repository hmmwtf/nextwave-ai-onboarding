import type { DashboardMetrics } from '../../domain/types';

interface StatsPanelProps {
  metrics: DashboardMetrics;
}

function formatMinutes(totalMinutes: number) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return `${hours}h ${minutes}m`;
}

export function StatsPanel({ metrics }: StatsPanelProps) {
  return (
    <section className="card" aria-labelledby="stats-title">
      <div className="card-header">
        <div>
          <p className="eyebrow">데모 지표 · Mock data</p>
          <h2 id="stats-title">StatsPanel</h2>
        </div>
      </div>
      <div className="stat-list">
        <div>
          <span>총 투입 시간</span>
          <strong>{formatMinutes(metrics.totalFocusMinutes)}</strong>
        </div>
        <div>
          <span>완료율</span>
          <strong>{metrics.completionRate}%</strong>
        </div>
        <div>
          <span>알림 인가율</span>
          <strong>{metrics.notificationAdoptionRate}%</strong>
        </div>
        <div>
          <span>전송률</span>
          <strong>{metrics.deliveryRate}%</strong>
        </div>
        <div>
          <span>팀 기능 사용률</span>
          <strong>{metrics.teamFeatureUsageRate}%</strong>
        </div>
      </div>
      <p className="mock-note">표시 수치는 실제 성과가 아닌 데모용 mock 값입니다.</p>
    </section>
  );
}
