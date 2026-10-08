import { lines, useSpeech } from "@/entities/mirror";
import { readVisitor, useVisitor } from "@/entities/visitor";

/** 방문자의 자기소개를 듣고 인사합니다 (API 미사용) */
export function introduce(text: string, presetTypeId?: string) {
  const v = readVisitor(text, presetTypeId);
  useVisitor.getState().setVisitor(v);
  const speech = useSpeech.getState();
  speech.setAsked(null);
  speech.say(lines.invite(v.greeting));
}
