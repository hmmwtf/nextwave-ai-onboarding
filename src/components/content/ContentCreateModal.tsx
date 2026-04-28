import { FormEvent, useState } from 'react';
import type { Content, ContentType } from '../../domain/types';

interface ContentCreateModalProps {
  onClose: () => void;
  onSubmit: (content: Content) => void;
}

export function ContentCreateModal({ onClose, onSubmit }: ContentCreateModalProps) {
  const [type, setType] = useState<ContentType>('memo');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [date, setDate] = useState('');
  const [validationMessage, setValidationMessage] = useState('');

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedTitle = title.trim();

    if (!trimmedTitle) {
      setValidationMessage('제목을 입력하세요.');
      return;
    }

    if (type === 'schedule' && !date) {
      setValidationMessage('일정 날짜를 선택하세요.');
      return;
    }

    const content: Content = {
      id: `content_${Date.now()}`,
      type,
      title: trimmedTitle,
      body: body.trim(),
      ...(type === 'schedule' ? { date } : {}),
      createdAt: Date.now(),
    };

    onSubmit(content);
  };

  return (
    <div className="modal-backdrop" role="presentation">
      <section
        className="modal-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="content-create-title"
      >
        <div className="card-header">
          <div>
            <p className="eyebrow">Create</p>
            <h2 id="content-create-title">메모/일정 작성</h2>
          </div>
          <button className="icon-button" type="button" onClick={onClose} aria-label="닫기">
            ×
          </button>
        </div>

        <form className="content-form" onSubmit={handleSubmit}>
          <div className="tab-list" role="tablist" aria-label="콘텐츠 타입">
            <button
              className={type === 'memo' ? 'tab-button active' : 'tab-button'}
              type="button"
              onClick={() => {
                setType('memo');
                setValidationMessage('');
              }}
            >
              memo
            </button>
            <button
              className={type === 'schedule' ? 'tab-button active' : 'tab-button'}
              type="button"
              onClick={() => {
                setType('schedule');
                setValidationMessage('');
              }}
            >
              schedule
            </button>
          </div>

          <label className="field">
            <span>제목 *</span>
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="회의 준비"
            />
          </label>

          <label className="field">
            <span>내용</span>
            <textarea
              value={body}
              onChange={(event) => setBody(event.target.value)}
              placeholder="팀원들과 공유할 내용 정리"
              rows={5}
            />
          </label>

          {type === 'schedule' ? (
            <label className="field">
              <span>날짜 *</span>
              <input
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
              />
            </label>
          ) : null}

          {validationMessage ? (
            <p className="validation-message" role="alert">
              {validationMessage}
            </p>
          ) : null}

          <div className="modal-actions">
            <button className="secondary-button" type="button" onClick={onClose}>
              취소
            </button>
            <button className="primary-button" type="submit">
              생성 완료
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
