"use client";

import dynamic from "next/dynamic";
import { useEffect, useState, type ReactNode } from "react";
import { selectSpeaking, selectWaiting, useSpeech } from "@/entities/mirror";
import { WaterSpeech } from "./WaterSpeech";

const WaterScene = dynamic(() => import("./WaterScene"), { ssr: false });
const MirrorMask = dynamic(() => import("./MirrorMask"), { ssr: false });

type Props = {
  /** 글 아래에 함께 떠오르는 것 (선택지 등) */
  children?: ReactNode;
  /** true 면 말이 끝나도 글을 거두지 않습니다 (선택지를 고르는 중 등) */
  hold?: boolean;
};

/**
 * 화면 전체의 물 + 금테 거울.
 * 거울이 말하면 가면이 스러지고 그 자리에 글이 떠오르며,
 * 다 말하고 읽을 시간이 지나면 글이 걷히고 가면이 돌아옵니다.
 */
export function WaterMirror({ children, hold = false }: Props) {
  const speaking = useSpeech((st) => selectSpeaking(st) && !selectWaiting(st));
  const busy = useSpeech(selectSpeaking); // "다음"을 기다리는 중까지 포함
  const length = useSpeech((st) => st.target.length);
  const [showText, setShowText] = useState(true);

  useEffect(() => {
    if (busy || hold) return setShowText(true);
    // 읽을 시간: 글자당 40ms, 4~12초
    const id = setTimeout(() => setShowText(false), Math.min(Math.max(length * 40, 4000), 12000));
    return () => clearTimeout(id);
  }, [busy, hold, length]);

  return (
    <>
      <WaterScene speaking={speaking} />
      <MirrorMask speaking={speaking} faceHidden={showText}>
        <WaterSpeech visible={showText}>{children}</WaterSpeech>
      </MirrorMask>
    </>
  );
}
