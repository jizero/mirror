import { create } from "zustand";
import { lines, selectSpeaking, useSpeech } from "@/entities/mirror";
import { answerFor, guessTopic, matchTopic, profile, topics } from "@/entities/profile";
import { useVisitor } from "@/entities/visitor";
import { streamAnswer } from "../api/streamAnswer";

/** 연달아 물을 때 다음 질문까지 기다리는 시간 */
export const ASK_COOLDOWN_MS = 3000;

/** 오늘 AI 호출 횟수가 소진됐는지(서버 429). 그러면 입력창 아래에 안내를 띄웁니다 */
export const useAiLimited = create<{ limited: boolean }>()(() => ({ limited: false }));

/** 이 시각 전까지는 묻기 버튼이 잠깁니다 */
export const useAskCooldown = create<{ until: number }>()(() => ({ until: 0 }));

/**
 * 질문 처리 순서
 * 1) 주제 버튼 또는 키워드 일치 → 준비된 답 (API 미사용)
 * 2) 없으면 Gemini (서버에서 IP당 하루 20회, 4초 간격 제한)
 * 3) 실패/한도 초과 → 있는 데이터에서 가장 가까운 주제로 짐작해 답함
 */
export function askMirror(question: string, opts: { topicId?: string; prefix?: string } = {}) {
  const visitor = useVisitor.getState().visitor;
  const speech = useSpeech.getState();
  // 답하는 중이거나 방금 물었다면 무시 (연달아 묻기 방지)
  if (!visitor || selectSpeaking(speech) || Date.now() < useAskCooldown.getState().until) return;
  useAskCooldown.setState({ until: Date.now() + ASK_COOLDOWN_MS });

  const prefix = opts.prefix ? `${opts.prefix}\n` : "";
  speech.setAsked(question);
  const topic = opts.topicId ? topics.find((t) => t.id === opts.topicId) : matchTopic(question);
  if (topic) return speech.say(prefix + answerFor(topic, visitor.name), topic.image);
  void askAI(question, visitor.name, prefix);
}

async function askAI(question: string, name: string, prefix: string) {
  const speech = useSpeech.getState();
  const topic = guessTopic(question);
  const guess = prefix + lines.guessHead(name) + answerFor(topic, name) + lines.guessTail(profile.contact.email);
  speech.setStreaming(true);
  speech.say(prefix);
  try {
    const text = await streamAnswer(question, name, (acc) => speech.setTarget(prefix + acc));
    if (!text.trim()) speech.say(guess, topic.image);
  } catch (e) {
    if ((e as Error).message === "429") useAiLimited.setState({ limited: true });
    speech.say(guess, topic.image);
  } finally {
    speech.setStreaming(false);
  }
}
