import type { Content } from '../../domain/types';

interface ContentListProps {
  contents: Content[];
}

export function ContentList({ contents }: ContentListProps) {
  return (
    <section className="card" aria-labelledby="content-list-title">
      <div className="card-header">
        <div>
          <p className="eyebrow">Created content</p>
          <h2 id="content-list-title">ContentList</h2>
        </div>
      </div>
      {contents.length === 0 ? (
        <p>아직 작성된 메모나 일정이 없습니다.</p>
      ) : (
        <ul className="content-list">
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
