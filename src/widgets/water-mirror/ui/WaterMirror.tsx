"use client";

import dynamic from "next/dynamic";
import type { ReactNode } from "react";
import { selectSpeaking, selectWaiting, useSpeech } from "@/entities/mirror";
import { WaterSpeech } from "./WaterSpeech";

const WaterScene = dynamic(() => import("./WaterScene"), { ssr: false });
const MirrorMask = dynamic(() => import("./MirrorMask"), { ssr: false });

/** 화면 전체의 물 + 그 위에 떠오르는 글. children 은 글 아래에 함께 떠오릅니다 */
export function WaterMirror({ children }: { children?: ReactNode }) {
  const speaking = useSpeech((st) => selectSpeaking(st) && !selectWaiting(st));
  return (
    <>
      <WaterScene speaking={speaking} />
      <MirrorMask speaking={speaking} />
      <WaterSpeech>{children}</WaterSpeech>
    </>
  );
}
