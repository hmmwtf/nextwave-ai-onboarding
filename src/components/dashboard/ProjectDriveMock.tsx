import type { ProjectDriveItem } from '../../domain/types';

interface ProjectDriveMockProps {
  items: ProjectDriveItem[];
}

export function ProjectDriveMock({ items }: ProjectDriveMockProps) {
  return (
    <section className="card" aria-labelledby="project-drive-title">
      <div className="card-header">
        <div>
          <p className="eyebrow">Mock data</p>
          <h2 id="project-drive-title">ProjectDriveMock</h2>
        </div>
      </div>
      {items.length === 0 ? (
        <p>아직 생성된 공유 링크나 문서 mock 항목이 없습니다.</p>
      ) : (
        <ul className="content-list">
          {items.map((item) => (
            <li key={item.id}>
              <div>
                <strong>{item.name}</strong>
                <span>{item.kind}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
