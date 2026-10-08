import { create } from "zustand";
import { readVisitor, useVisitor, type Visitor } from "@/entities/visitor";

/** 방문자의 자기소개를 해석해 저장합니다 (API 미사용) */
export function introduce(text: string, presetTypeId?: string): Visitor {
  const v = readVisitor(text, presetTypeId);
  useVisitor.getState().setVisitor(v);
  return v;
}

/** "그대는 누구인가?" — 먼저 입력한 질문을 들고 있다가 고르고 나면 돌려줍니다 */
type IntroduceState = {
  pending: string | null;
  open: (question: string) => void;
  close: () => void;
};

export const useIntroduce = create<IntroduceState>()((set) => ({
  pending: null,
  open: (pending) => set({ pending }),
  close: () => set({ pending: null }),
}));
