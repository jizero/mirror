"use client";

import { lines, selectSpeaking, useSpeech } from "@/entities/mirror";
import { useVisitor } from "@/entities/visitor";
import { Button } from "@/shared/ui";

export function RestartButton() {
  const speaking = useSpeech(selectSpeaking);
  const restart = () => {
    useVisitor.getState().reset();
    const speech = useSpeech.getState();
    speech.setAsked(null);
    speech.say(lines.opening);
  };
  return (
    <Button variant="quiet" onClick={restart} disabled={speaking}>
      처음부터 다시
    </Button>
  );
}
