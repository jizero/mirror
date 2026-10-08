import { create } from "zustand";

export type MirrorLayout = "wide" | "tall";
/** 거울 유리가 화면에서 차지하는 픽셀 영역 */
export type GlassRect = { width: number; height: number; centerX: number; centerY: number };

type ViewState = {
  glassRect: GlassRect | null;
  layout: MirrorLayout;
  /** 1 = 정면, 0 = 옆/뒤를 보고 있음 */
  facing: number;
  setGlass: (rect: GlassRect, layout: MirrorLayout) => void;
  setFacing: (f: number) => void;
};

export const useMirrorView = create<ViewState>()((set, get) => ({
  glassRect: null,
  layout: "tall",
  facing: 1,
  setGlass: (glassRect, layout) => set({ glassRect, layout }),
  setFacing: (facing) => {
    if (Math.abs(get().facing - facing) > 0.01) set({ facing });
  },
}));
