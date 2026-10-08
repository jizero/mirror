"use client";

import { useEffect, useState } from "react";
import { selectSpeaking, useSpeech } from "@/entities/mirror";
import { NoteField } from "@/shared/ui";
import { useAskCooldown } from "../model/ask";

/**
 * 거울에게 묻는 입력창. 무엇을 할지는 onAsk 를 넘기는 쪽이 정합니다.
 * 거울이 답하는 동안("다음" 장 포함)과 방금 물은 뒤 잠깐(쿨다운)은 잠깁니다.
 */
export function AskField({ onAsk, disabled }: { onAsk: (question: string) => void; disabled?: boolean }) {
  const speaking = useSpeech(selectSpeaking);
  const until = useAskCooldown((st) => st.until);
  const [cooling, setCooling] = useState(false);
  useEffect(() => {
    const left = until - Date.now();
    setCooling(left > 0);
    if (left <= 0) return;
    const id = setTimeout(() => setCooling(false), left);
    return () => clearTimeout(id);
  }, [until]);
  return (
    <NoteField
      label="거울에게 질문"
      placeholder={speaking ? "답변을 하는 중입니다" : "거울에게 무엇이든 물어보세요"}
      submitLabel="묻기"
      disabled={speaking || cooling || disabled}
      onSubmit={onAsk}
    />
  );
}
