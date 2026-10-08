"use client";

import dynamic from "next/dynamic";
import { selectSpeaking, useSpeech } from "@/entities/mirror";
import { MirrorSpeech } from "./MirrorSpeech";

const MirrorScene = dynamic(() => import("./MirrorScene"), { ssr: false });

/** 3D 거울 + 유리 위 글씨 */
export function MagicMirror({ className }: { className?: string }) {
  const speaking = useSpeech(selectSpeaking);
  return (
    <>
      <div className={className}>
        <MirrorScene speaking={speaking} />
      </div>
      <MirrorSpeech />
    </>
  );
}
