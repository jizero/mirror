"use client";

import { WaterMirror } from "@/widgets/water-mirror";
import { MirrorConsole } from "@/widgets/mirror-console";
import { askMirror } from "@/features/ask-mirror";
import { IntroduceChoices } from "@/features/introduce-visitor";
import s from "./HomePage.module.css";

export function HomePage() {
  return (
    <main className={s.stage}>
      <WaterMirror>
        <IntroduceChoices onIntroduced={(v, q) => askMirror(q, { prefix: v.greeting })} />
      </WaterMirror>
      <div className={s.dock}>
        <MirrorConsole />
      </div>
    </main>
  );
}
