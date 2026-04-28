import { mockClassifier } from './mockClassifier';
import type {
  ClassificationInput,
  ClassificationResult,
  ClassificationUserType,
  ClassifierAdapter,
} from './types';

export const USE_LLM = false;

const GROQ_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.1-8b-instant';

const allowedUserTypes: ClassificationUserType[] = [
  '대학생',
  '직장인',
  '프리랜서',
  '팀 사용자',
  'unknown',
];

function buildPrompt(input: ClassificationInput) {
  return `
당신은 사용자의 생산성 도구 사용 맥락을 분석하는 분류기입니다.

사용자가 작성한 메모 또는 일정의 제목과 내용을 보고 다음 user_type 중 하나를 선택하세요.

[user_type]
- 대학생: 강의, 시험, 과제, 팀플, 동아리, 학점, 수업 등 학업 맥락
- 직장인: 회의, 보고, 미팅, 업무, 결재, 출장 등 조직 내 업무 맥락
- 프리랜서: 클라이언트, 프로젝트 납품, 견적, 외주, 개인 사업 맥락
- 팀 사용자: 우리 팀, 부서, 공동, 협업, 스프린트 등 복수 인원 협업 맥락
- unknown: 사적 메모이거나 맥락이 모호한 경우

[입력]
제목: ${input.title}
내용: ${input.content}
타입: ${input.type}

[출력]
JSON으로만 답변하세요.
{
  "user_type": "대학생|직장인|프리랜서|팀 사용자|unknown",
  "confidence": 0.0,
  "reasoning": "판단 근거 한 문장",
  "keywords": ["감지 키워드"]
}
`.trim();
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function parseJsonContent(content: string): unknown | null {
  const trimmed = content.trim();
  const withoutFence = trimmed
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '');

  try {
    return JSON.parse(withoutFence);
  } catch {
    return null;
  }
}

function normalizeResult(value: unknown): ClassificationResult | null {
  if (!isRecord(value)) {
    return null;
  }

  const rawUserType = value.user_type;
  const userType =
    typeof rawUserType === 'string' &&
    allowedUserTypes.includes(rawUserType as ClassificationUserType)
      ? (rawUserType as ClassificationUserType)
      : 'unknown';

  const confidence =
    typeof value.confidence === 'number'
      ? Math.min(Math.max(value.confidence, 0), 1)
      : 0.4;

  const reasoning =
    typeof value.reasoning === 'string'
      ? value.reasoning
      : 'LLM 응답에서 판단 근거를 확인할 수 없습니다.';

  const keywords = Array.isArray(value.keywords)
    ? value.keywords.filter((keyword): keyword is string => typeof keyword === 'string')
    : [];

  return {
    user_type: userType,
    confidence,
    reasoning,
    keywords,
  };
}

async function fallbackToMock(input: ClassificationInput) {
  return mockClassifier.classify(input);
}

export const llmClassifierAdapter: ClassifierAdapter = {
  async classify(input: ClassificationInput): Promise<ClassificationResult> {
    if (!USE_LLM) {
      return fallbackToMock(input);
    }

    const apiKey = import.meta.env.VITE_GROQ_API_KEY;

    if (!apiKey) {
      return fallbackToMock(input);
    }

    try {
      const response = await fetch(GROQ_ENDPOINT, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: GROQ_MODEL,
          messages: [
            {
              role: 'system',
              content: 'Return JSON only. Do not include markdown.',
            },
            {
              role: 'user',
              content: buildPrompt(input),
            },
          ],
          temperature: 0,
          response_format: { type: 'json_object' },
        }),
      });

      if (!response.ok) {
        return fallbackToMock(input);
      }

      const payload: unknown = await response.json();

      if (!isRecord(payload) || !Array.isArray(payload.choices)) {
        return fallbackToMock(input);
      }

      const firstChoice = payload.choices[0];

      if (!isRecord(firstChoice) || !isRecord(firstChoice.message)) {
        return fallbackToMock(input);
      }

      const content = firstChoice.message.content;

      if (typeof content !== 'string') {
        return fallbackToMock(input);
      }

      const parsedContent = parseJsonContent(content);
      const normalizedResult = normalizeResult(parsedContent);

      return normalizedResult ?? fallbackToMock(input);
    } catch {
      return fallbackToMock(input);
    }
  },
};
