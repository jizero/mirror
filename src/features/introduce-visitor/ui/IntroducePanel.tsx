"use client";

import { selectSpeaking, useSpeech } from "@/entities/mirror";
import { visitorTypes } from "@/entities/visitor";
import { Button, NoteField } from "@/shared/ui";
import { introduce } from "../model/introduce";

/** "그대는 누구인가?"에 답하는 영역 */
export function IntroducePanel({ chipsClassName }: { chipsClassName?: string }) {
  const speaking = useSpeech(selectSpeaking);
  return (
    <>
      <div className={chipsClassName}>
        {visitorTypes.map((v) => (
          <Button key={v.id} disabled={speaking} onClick={() => introduce("", v.id)}>
            {v.label}
          </Button>
        ))}
      </div>
      <NoteField
        label="자기소개"
        placeholder="거울에게 그대를 소개하세요"
        submitLabel="답하기"
        maxLength={40}
        disabled={speaking}
        onSubmit={(v) => introduce(v)}
      />
    </>
  );
}
