"use client";

import { lines, useSpeech } from "@/entities/mirror";
import { useVisitor } from "@/entities/visitor";
import { AskField, askMirror, useAiLimited } from "@/features/ask-mirror";
import { useIntroduce } from "@/features/introduce-visitor";
import s from "./MirrorConsole.module.css";

/**
 * 입력창 하나.
 * 처음 물으면 거울이 "그대는 누구인가?"를 묻고, 거울 위 선택지를 고르면 그 질문에 답합니다.
 */
export function MirrorConsole() {
  const choosing = useIntroduce((st) => st.pending !== null);
  const aiLimited = useAiLimited((st) => st.limited);

  const onAsk = (question: string) => {
    if (useVisitor.getState().visitor) return askMirror(question);
    useIntroduce.getState().open(question);
    useSpeech.getState().say(lines.whoAreYou);
  };

  return (
    <section className={s.console}>
      <AskField onAsk={onAsk} disabled={choosing} />
      {aiLimited && <p className={s.limit}>금일 AI 호출 횟수가 소진되어, 있는 데이터를 통해 답변합니다.</p>}
      <p className={s.note}>
        Vercel AI SDK와 Gemini로 만든 생성형 AI 거울이에요.
        <br />
        준비된 질문은 바로 답하고, 그 밖의 질문은 AI가 프로필을 읽고 답해요.
      </p>
    </section>
  );
}
