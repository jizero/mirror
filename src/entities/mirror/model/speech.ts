import { create } from "zustand";
import { tokens } from "@/shared/ui";
import { lines } from "../config/lines";

const { typeMs, typeDelayMs } = tokens.motion;

type SpeechState = {
  /** 거울이 말할 전체 문장 */
  target: string;
  /** 타자기처럼 드러난 부분 */
  shown: string;
  typedFrom: { time: number; chars: number };
  /** AI 답변을 받아오는 중 */
  streaming: boolean;
  /** 방문자가 마지막으로 물은 말 */
  asked: string | null;

  say: (text: string) => void;
  /** 스트리밍 중 문장을 이어 붙일 때 (타자기는 이어서 진행) */
  setTarget: (text: string) => void;
  setStreaming: (v: boolean) => void;
  setAsked: (q: string | null) => void;
  tick: (now: number) => void;
};

export const useSpeech = create<SpeechState>()((set, get) => ({
  target: lines.opening,
  shown: "",
  typedFrom: { time: 0, chars: 0 },
  streaming: false,
  asked: null,

  say: (text) => set({ target: text, shown: "", typedFrom: { time: performance.now() + typeDelayMs, chars: 0 } }),
  setTarget: (target) => set({ target }),
  setStreaming: (streaming) => set({ streaming }),
  setAsked: (asked) => set({ asked }),

  // 경과 시간 기준이라 프레임이 느려도 속도가 일정합니다
  tick: (now) => {
    const { shown, target, typedFrom } = get();
    if (shown === target) return;
    if (typedFrom.time === 0) return set({ typedFrom: { time: now + typeDelayMs, chars: 0 } });
    const n = Math.min(typedFrom.chars + Math.floor(Math.max(0, now - typedFrom.time) / typeMs), target.length);
    if (n > shown.length) set({ shown: target.slice(0, n) });
  },
}));

export const selectSpeaking = (s: Pick<SpeechState, "streaming" | "shown" | "target">) =>
  s.streaming || s.shown !== s.target;
