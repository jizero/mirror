"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { selectSpeaking, selectWaiting, useSpeech } from "@/entities/mirror";
import { Button, tokens } from "@/shared/ui";
import { SPEECH_CENTER_Y } from "../config";
import s from "./WaterSpeech.module.css";

/** 물 위에 떠오르는 거울의 말 (타자기 효과) */
export function WaterSpeech({ children }: { children?: ReactNode }) {
  const shown = useSpeech((st) => st.shown.slice(st.pageStart).replace(/^\s+/, ""));
  const speaking = useSpeech(selectSpeaking);
  const waiting = useSpeech(selectWaiting);
  const next = useSpeech((st) => st.next);
  const tick = useSpeech((st) => st.tick);
  const image = useSpeech((st) => st.image);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!speaking || waiting) return;
    const id = setInterval(() => tick(performance.now()), tokens.motion.typeMs);
    return () => clearInterval(id);
  }, [speaking, waiting, tick]);

  useEffect(() => {
    ref.current?.scrollTo({ top: ref.current.scrollHeight });
  }, [shown, speaking]);

  return (
    <div ref={ref} className={s.speech} style={{ top: `${SPEECH_CENTER_Y * 100}%` }} aria-live="polite">
      <p className={s.text}>
        {shown}
        {speaking && !waiting && <span className={s.caret} />}
      </p>
      {waiting && (
        <Button variant="quiet" className={s.next} onClick={next}>
          다음 ▸
        </Button>
      )}
      {image && !speaking && <img className={s.image} src={image} alt="미래소년 코난의 포비" />}
      {children}
    </div>
  );
}
