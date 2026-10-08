"use client";

import dynamic from "next/dynamic";
import { selectSpeaking, useSpeech } from "@/entities/mirror";
import { WaterSpeech } from "./WaterSpeech";

const WaterScene = dynamic(() => import("./WaterScene"), { ssr: false });

/** 화면 전체의 물 + 그 위에 떠오르는 글 */
export function WaterMirror() {
  const speaking = useSpeech(selectSpeaking);
  return (
    <>
      <WaterScene speaking={speaking} />
      <WaterSpeech />
    </>
  );
}
