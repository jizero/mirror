"use client";

import { useSpeech } from "@/entities/mirror";
import { useVisitor } from "@/entities/visitor";
import { AskPanel } from "@/features/ask-mirror";
import { IntroducePanel } from "@/features/introduce-visitor";
import { RestartButton } from "@/features/restart-conversation";
import { cx } from "@/shared/lib";
import s from "./MirrorConsole.module.css";

/** 대화 단계에 따라 "누구인가" → "무엇이 궁금한가" 입력을 보여줍니다 */
export function MirrorConsole({ align = "center" }: { align?: "center" | "start" }) {
  const visitor = useVisitor((st) => st.visitor);
  const asked = useSpeech((st) => st.asked);

  return (
    <section className={cx(s.console, align === "start" && s.alignStart)}>
      {asked && <p className={s.asked}>{asked}</p>}
      {visitor ? <AskPanel chipsClassName={s.chips} /> : <IntroducePanel chipsClassName={s.chips} />}
      {visitor && <RestartButton />}
    </section>
  );
}
