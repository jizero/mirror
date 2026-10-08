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

// 짐작에 쓰지 않을 주제 (사실을 지어내거나 엉뚱하게 들릴 수 있는 것)
const NO_GUESS = new Set(["marriage", "age", "face", "saju", "oliveyoung", "coupang", "toss", "contact"]);
const bigrams = (s: string) => {
  const t = normalize(s).replace(/[^\p{L}\p{N}]/gu, "");
  return new Set(Array.from({ length: Math.max(t.length - 1, 0) }, (_, i) => t.slice(i, i + 2)));
};

/**
 * AI를 쓸 수 없을 때, 질문과 글자가 가장 많이 겹치는 주제로 짐작합니다.
 * 두 글자 이상 겹치는 게 없으면 자기소개로 답합니다.
 */
export function guessTopic(question: string): Topic {
  const q = bigrams(question);
  let best = topics.find((t) => t.id === "intro")!;
  let bestScore = 1; // 한 글자쌍만 겹치는 건 우연일 때가 많아서 무시
  for (const t of topics) {
    if (NO_GUESS.has(t.id)) continue;
    const text = bigrams([t.label, ...t.keywords, t.answer].join(" "));
    let score = 0;
    for (const b of q) if (text.has(b)) score++;
    if (score > bestScore) {
      best = t;
      bestScore = score;
    }
  }
  return best;
}

/** 답변 문구의 {visitor} 를 방문자 이름으로 바꿉니다 */
export const answerFor = (topic: Topic, visitorName: string) => topic.answer.replaceAll("{visitor}", visitorName);
