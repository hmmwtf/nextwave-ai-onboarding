import type { CompletedActivity, Content } from '../../domain/types';

interface ContentListProps {
  contents: Content[];
  activities: CompletedActivity[];
}

export function ContentList({ contents, activities }: ContentListProps) {
  const hasItems = contents.length > 0 || activities.length > 0;

  return (
    <section className="card" aria-labelledby="content-list-title">
      <div className="card-header">
        <div>
          <p className="eyebrow">Created content & activity</p>
          <h2 id="content-list-title">ContentList</h2>
        </div>
      </div>
      {!hasItems ? (
        <p>아직 작성된 메모, 일정, 완료 활동이 없습니다.</p>
      ) : (
        <ul className="content-list">
          {activities.map((activity) => (
            <li key={activity.id}>
              <div>
                <strong>{activity.label}</strong>
                <span>{activity.kind}</span>
              </div>
            </li>
          ))}
          {contents.map((content) => (
            <li key={content.id}>
              <div>
                <strong>{content.title}</strong>
                <span>
                  {content.type}
                  {content.date ? ` · ${content.date}` : ''}
                </span>
              </div>
              {content.body ? <p>{content.body}</p> : null}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
