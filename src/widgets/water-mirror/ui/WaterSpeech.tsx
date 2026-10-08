"use client";

import { useEffect, useRef } from "react";
import { selectSpeaking, useSpeech } from "@/entities/mirror";
import { tokens } from "@/shared/ui";
import { SPEECH_CENTER_Y } from "../config";
import s from "./WaterSpeech.module.css";

/** 물 위에 떠오르는 거울의 말 (타자기 효과) */
export function WaterSpeech() {
  const shown = useSpeech((st) => st.shown);
  const speaking = useSpeech(selectSpeaking);
  const tick = useSpeech((st) => st.tick);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!speaking) return;
    const id = setInterval(() => tick(performance.now()), tokens.motion.typeMs);
    return () => clearInterval(id);
  }, [speaking, tick]);

  useEffect(() => {
    ref.current?.scrollTo({ top: ref.current.scrollHeight });
  }, [shown]);

  return (
    <div ref={ref} className={s.speech} style={{ top: `${SPEECH_CENTER_Y * 100}%` }} aria-live="polite">
      <p className={s.text}>
        {shown}
        {speaking && <span className={s.caret} />}
      </p>
    </div>
  );
}
