"use client";

import { useCallback } from "react";
import { visitorTypes, type Visitor } from "@/entities/visitor";
import { Button, Dialog, NoteField } from "@/shared/ui";
import { introduce, useIntroduceDialog } from "../model/introduce";
import s from "./IntroduceDialog.module.css";

type Props = {
  /** 소개가 끝나면 방문자와, 처음에 입력했던 질문을 돌려받습니다 */
  onIntroduced: (visitor: Visitor, question: string) => void;
};

export function IntroduceDialog({ onIntroduced }: Props) {
  const pending = useIntroduceDialog((st) => st.pending);
  const close = useIntroduceDialog((st) => st.close);

  const done = (text: string, presetTypeId?: string) => {
    if (pending === null) return;
    const v = introduce(text, presetTypeId);
    close();
    onIntroduced(v, pending);
  };
  const onClose = useCallback(() => close(), [close]);

  return (
    <Dialog
      open={pending !== null}
      onClose={onClose}
      title="잠깐, 그대는 누구인가?"
      description="이름이나 하는 일을 알려주면 거울이 그대에게 맞춰 답해줄 거야."
    >
      <div className={s.chips}>
        {visitorTypes.map((v) => (
          <Button key={v.id} onClick={() => done("", v.id)}>
            {v.label}
          </Button>
        ))}
      </div>
      <NoteField
        label="자기소개"
        placeholder="예) 김민수, 프론트엔드 개발자"
        submitLabel="알려주기"
        maxLength={40}
        autoFocus
        onSubmit={(t) => done(t)}
      />
    </Dialog>
  );
}
