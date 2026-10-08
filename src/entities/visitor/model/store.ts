import { create } from "zustand";
import type { Visitor } from "./types";

type VisitorState = {
  visitor: Visitor | null;
  setVisitor: (v: Visitor) => void;
  reset: () => void;
};

export const useVisitor = create<VisitorState>()((set) => ({
  visitor: null,
  setVisitor: (visitor) => set({ visitor }),
  reset: () => set({ visitor: null }),
}));
