import { topics, type Topic } from "../model/profile";

const normalize = (s: string) => s.toLowerCase().replace(/\s+/g, " ").trim();

/** 질문에서 키워드가 가장 많이 걸리는 주제를 찾습니다. 없으면 null → AI로 넘어감 */
export function matchTopic(question: string): Topic | null {
  const q = normalize(question);
  let best: Topic | null = null;
  let bestScore = 0;
  for (const t of topics) {
    const score = t.keywords.reduce((n, k) => (q.includes(k.toLowerCase()) ? n + 1 : n), 0);
    if (score > bestScore) {
      best = t;
      bestScore = score;
    }
  }
  return best;
}

/** 답변 문구의 {visitor} 를 방문자 이름으로 바꿉니다 */
export const answerFor = (topic: Topic, visitorName: string) => topic.answer.replaceAll("{visitor}", visitorName);
