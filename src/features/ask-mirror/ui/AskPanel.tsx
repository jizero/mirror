"use client";

import { selectSpeaking, useSpeech } from "@/entities/mirror";
import { topics } from "@/entities/profile";
import { Button, NoteField } from "@/shared/ui";
import { askMirror } from "../model/ask";

/** 주제 버튼 + 자유 질문 */
export function AskPanel({ chipsClassName }: { chipsClassName?: string }) {
  const speaking = useSpeech(selectSpeaking);
  return (
    <>
      <div className={chipsClassName}>
        {topics.map((t) => (
          <Button key={t.id} disabled={speaking} onClick={() => askMirror(t.question, t.id)}>
            {t.label}
          </Button>
        ))}
      </div>
      <NoteField
        label="질문"
        placeholder="거울에게 무엇이든 물어보세요"
        submitLabel="묻기"
        disabled={speaking}
        onSubmit={(q) => askMirror(q)}
      />
    </>
  );
}
