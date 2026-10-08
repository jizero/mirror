import { create } from "zustand";
import { lines, selectSpeaking, useSpeech } from "@/entities/mirror";
import { answerFor, matchTopic, profile, topics } from "@/entities/profile";
import { useVisitor } from "@/entities/visitor";
import { streamAnswer } from "../api/streamAnswer";

/** 한 번 방문에 Gemini를 부를 수 있는 최대 횟수 */
export const AI_LIMIT_PER_VISIT = 5;

export const useAiQuota = create<{ used: number }>()(() => ({ used: 0 }));

/**
 * 질문 처리 순서
 * 1) 주제 버튼 또는 키워드 일치 → 준비된 답 (API 미사용)
 * 2) 없으면 Gemini (방문당 5회 제한)
 * 3) 실패/한도 초과 → 고정 안내 문구
 */
export function askMirror(question: string, topicId?: string) {
  const visitor = useVisitor.getState().visitor;
  const speech = useSpeech.getState();
  if (!visitor || selectSpeaking(speech)) return;

  speech.setAsked(question);
  const topic = topicId ? topics.find((t) => t.id === topicId) : matchTopic(question);
  if (topic) return speech.say(answerFor(topic, visitor.name));
  void askAI(question, visitor.name);
}

async function askAI(question: string, name: string) {
  const speech = useSpeech.getState();
  const unknown = lines.unknown(name, profile.contact.email);
  const { used } = useAiQuota.getState();
  if (used >= AI_LIMIT_PER_VISIT) return speech.say(unknown);

  useAiQuota.setState({ used: used + 1 });
  speech.setStreaming(true);
  speech.say("");
  try {
    const text = await streamAnswer(question, name, speech.setTarget);
    if (!text.trim()) speech.say(unknown);
  } catch {
    speech.say(unknown);
  } finally {
    speech.setStreaming(false);
  }
}
