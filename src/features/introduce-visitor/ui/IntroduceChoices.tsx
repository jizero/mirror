"use client";

import { selectSpeaking, useSpeech } from "@/entities/mirror";
import { visitorTypes, type Visitor } from "@/entities/visitor";
import { Button } from "@/shared/ui";
import { introduce, useIntroduce } from "../model/introduce";
import s from "./IntroduceChoices.module.css";

type Props = {
  /** 고르고 나면 방문자와, 처음에 입력했던 질문을 돌려받습니다 */
  onIntroduced: (visitor: Visitor, question: string) => void;
};

/** 거울 위에 떠오르는 "그대는 누구인가?" 선택지 */
export function IntroduceChoices({ onIntroduced }: Props) {
  const pending = useIntroduce((st) => st.pending);
  const close = useIntroduce((st) => st.close);
  const speaking = useSpeech(selectSpeaking);
  if (pending === null || speaking) return null;

  const pick = (typeId?: string) => {
    const v = introduce("", typeId);
    close();
    onIntroduced(v, pending);
  };

  return (
    <div className={s.choices}>
      {visitorTypes.map((v) => (
        <Button key={v.id} onClick={() => pick(v.id)}>
          {v.label}
        </Button>
      ))}
      <Button variant="quiet" onClick={() => pick()}>
        선택 안 함
      </Button>
    </div>
  );
}
