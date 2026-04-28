import type {
  ClassificationInput,
  ClassificationResult,
  ClassificationUserType,
  ClassifierAdapter,
} from './types';

const keywordRules: Array<{
  userType: Exclude<ClassificationUserType, 'unknown'>;
  keywords: string[];
  confidence: number;
  reasoning: string;
}> = [
  {
    userType: '대학생',
    keywords: ['시험', '과제', '강의', '교수님', '학점', '캡스톤'],
    confidence: 0.86,
    reasoning: '학업 및 과제 관련 키워드가 감지되었습니다.',
  },
  {
    userType: '직장인',
    keywords: ['회의', '보고', '업무', '팀장', '결재', '본사'],
    confidence: 0.87,
    reasoning: '회의 및 업무 관련 키워드가 감지되었습니다.',
  },
  {
    userType: '프리랜서',
    keywords: ['클라이언트', '외주', '납품', '견적', '시안'],
    confidence: 0.86,
    reasoning: '클라이언트 또는 납품 관련 키워드가 감지되었습니다.',
  },
  {
    userType: '팀 사용자',
    keywords: ['우리 팀', '협업', '공동', '스프린트', '개발팀'],
    confidence: 0.88,
    reasoning: '팀 협업 관련 키워드가 감지되었습니다.',
  },
];

function findMatchedKeywords(text: string, keywords: string[]) {
  return keywords.filter((keyword) => text.includes(keyword));
}

export const mockClassifier: ClassifierAdapter = {
  async classify(input: ClassificationInput): Promise<ClassificationResult> {
    const targetText = `${input.title} ${input.content}`;

    for (const rule of keywordRules) {
      const matchedKeywords = findMatchedKeywords(targetText, rule.keywords);

      if (matchedKeywords.length > 0) {
        return {
          user_type: rule.userType,
          confidence: rule.confidence,
          reasoning: rule.reasoning,
          keywords: matchedKeywords,
        };
      }
    }

    return {
      user_type: 'unknown',
      confidence: 0.4,
      reasoning: '명확한 사용자 맥락 키워드가 감지되지 않았습니다.',
      keywords: [],
    };
  },
};
