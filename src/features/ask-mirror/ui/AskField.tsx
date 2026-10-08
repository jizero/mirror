"use client";

import { selectSpeaking, useSpeech } from "@/entities/mirror";
import { NoteField } from "@/shared/ui";

/** 거울에게 묻는 입력창. 무엇을 할지는 onAsk 를 넘기는 쪽이 정합니다. */
export function AskField({ onAsk }: { onAsk: (question: string) => void }) {
  const speaking = useSpeech(selectSpeaking);
  return (
    <NoteField
      label="거울에게 질문"
      placeholder="거울에게 무엇이든 물어보세요"
      submitLabel="묻기"
      disabled={speaking}
      onSubmit={onAsk}
    />
  );
}
