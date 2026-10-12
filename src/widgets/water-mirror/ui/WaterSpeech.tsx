"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { selectSpeaking, selectWaiting, useSpeech } from "@/entities/mirror";
import { Button, tokens } from "@/shared/ui";
import s from "./WaterSpeech.module.css";

/** 가면이 스러진 거울 유리 위에 떠오르는 거울의 말 (타자기 효과) */
export function WaterSpeech({ children, visible = true }: { children?: ReactNode; visible?: boolean }) {
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

  // "다음"을 누르지 않아도 읽을 시간만큼 기다렸다가 저절로 넘깁니다 (글자당 60ms, 2.5~9초)
  useEffect(() => {
    if (!waiting) return;
    const id = setTimeout(next, Math.min(Math.max(shown.length * 60, 2500), 9000));
    return () => clearTimeout(id);
  }, [waiting, next, shown.length]);

  useEffect(() => {
    ref.current?.scrollTo({ top: ref.current.scrollHeight });
  }, [shown, speaking]);

  return (
    <div ref={ref} className={`${s.speech} ${visible ? "" : s.gone}`} aria-live="polite" data-speech>
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
