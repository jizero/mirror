"use client";

import { useVisitor } from "@/entities/visitor";
import { AskField, askMirror } from "@/features/ask-mirror";
import { IntroduceDialog, useIntroduceDialog } from "@/features/introduce-visitor";
import s from "./MirrorConsole.module.css";

/**
 * 입력창 하나.
 * 처음 물으면 "그대는 누구인가?" 팝업 → 소개가 끝나면 인사와 함께 그 질문에 답합니다.
 */
export function MirrorConsole() {
  const openIntroduce = useIntroduceDialog((st) => st.open);

  const onAsk = (question: string) => {
    if (useVisitor.getState().visitor) askMirror(question);
    else openIntroduce(question);
  };

  return (
    <section className={s.console}>
      <AskField onAsk={onAsk} />
      <IntroduceDialog onIntroduced={(v, q) => askMirror(q, { prefix: v.greeting })} />
    </section>
  );
}
