import { create } from "zustand";
import { tokens } from "@/shared/ui";
import { lines } from "../config/lines";

const { typeMs, typeDelayMs } = tokens.motion;

/** 한 장에 보여줄 최대 줄 수와 글자 수. 넘치면 "다음"을 눌러 넘깁니다 */
const PAGE_LINES = 6;
const PAGE_CHARS = 120;

/** from 에서 시작하는 장이 어디서 끝나는지. 스트리밍으로 글이 늘어나도 한 번 정한 끝은 바뀌지 않습니다 */
export function pageEnd(text: string, from: number): number {
  let end = from;
  for (let n = 0; n < PAGE_LINES && end < text.length; n++) {
    const nl = text.indexOf("\n", end);
    const lineEnd = nl === -1 ? text.length : nl + 1;
    if (lineEnd - from > PAGE_CHARS) {
      if (end > from) return end; // 앞 줄까지만
      const space = text.lastIndexOf(" ", from + PAGE_CHARS);
      return space > from ? space + 1 : from + PAGE_CHARS;
    }
    end = lineEnd;
  }
  return end;
}

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
  /** 지금 보고 있는 장의 시작 위치 */
  pageStart: number;
  /** 말이 끝나면 함께 떠오르는 그림 */
  image: string | null;

  say: (text: string, image?: string) => void;
  /** 스트리밍 중 문장을 이어 붙일 때 (타자기는 이어서 진행) */
  setTarget: (text: string) => void;
  setStreaming: (v: boolean) => void;
  setAsked: (q: string | null) => void;
  /** 다음 장으로 넘깁니다 */
  next: () => void;
  tick: (now: number) => void;
};

export const useSpeech = create<SpeechState>()((set, get) => ({
  target: lines.opening,
  shown: "",
  typedFrom: { time: 0, chars: 0 },
  streaming: false,
  asked: null,
  image: null,
  pageStart: 0,

  say: (text, image) => set({ target: text, image: image ?? null, pageStart: 0, shown: "", typedFrom: { time: performance.now() + typeDelayMs, chars: 0 } }),
  setTarget: (target) => set({ target }),
  setStreaming: (streaming) => set({ streaming }),
  setAsked: (asked) => set({ asked }),
  next: () => {
    if (!selectWaiting(get())) return;
    const pageStart = pageEnd(get().target, get().pageStart);
    set({ pageStart, typedFrom: { time: performance.now(), chars: pageStart } });
  },

  // 경과 시간 기준이라 프레임이 느려도 속도가 일정합니다
  tick: (now) => {
    const { shown, target, typedFrom, pageStart } = get();
    if (shown === target) return;
    if (typedFrom.time === 0) return set({ typedFrom: { time: now + typeDelayMs, chars: 0 } });
    const n = Math.min(typedFrom.chars + Math.floor(Math.max(0, now - typedFrom.time) / typeMs), pageEnd(target, pageStart));
    if (n > shown.length) set({ shown: target.slice(0, n) });
  },
}));

export const selectSpeaking = (s: Pick<SpeechState, "streaming" | "shown" | "target">) =>
  s.streaming || s.shown !== s.target;

/** 이번 장을 다 썼고 뒤에 글이 더 남아 "다음"을 기다리는 중 */
export const selectWaiting = (s: Pick<SpeechState, "shown" | "target" | "pageStart">) => {
  const end = pageEnd(s.target, s.pageStart);
  return s.shown.length >= end && end < s.target.length;
};
