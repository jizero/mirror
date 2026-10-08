"use client";

import { useEffect, useRef } from "react";
import { selectSpeaking, useMirrorView, useSpeech } from "@/entities/mirror";
import { tokens } from "@/shared/ui";
import s from "./MirrorSpeech.module.css";

/** 유리 영역에 맞춰 겹쳐 놓은 HTML 글씨 (타자기 효과) */
export function MirrorSpeech() {
  const shown = useSpeech((st) => st.shown);
  const speaking = useSpeech(selectSpeaking);
  const tick = useSpeech((st) => st.tick);
  const rect = useMirrorView((st) => st.glassRect);
  const facing = useMirrorView((st) => st.facing);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!speaking) return;
    const id = setInterval(() => tick(performance.now()), tokens.motion.typeMs);
    return () => clearInterval(id);
  }, [speaking, tick]);

  useEffect(() => {
    ref.current?.scrollTo({ top: ref.current.scrollHeight });
  }, [shown]);

  if (!rect) return null;
  return (
    <div
      ref={ref}
      className={s.speech}
      aria-live="polite"
      style={{
        width: rect.width * 0.74,
        height: rect.height * 0.62,
        left: rect.centerX,
        top: rect.centerY - rect.height * 0.31,
        // 거울을 돌리면 글이 사라지고, 정면으로 오면 다시 보입니다
        opacity: Math.max(0, (facing - 0.75) / 0.25),
      }}
    >
      <p className={s.text}>
        {shown}
        {speaking && <span className={s.caret} />}
      </p>
    </div>
  );
}
