"use client";

import { WaterMirror } from "@/widgets/water-mirror";
import { MirrorConsole } from "@/widgets/mirror-console";
import { askMirror } from "@/features/ask-mirror";
import { IntroduceChoices, useIntroduce } from "@/features/introduce-visitor";
import s from "./HomePage.module.css";

export function HomePage() {
  const choosing = useIntroduce((st) => st.pending !== null);
  return (
    <main className={s.stage}>
      <WaterMirror hold={choosing}>
        <IntroduceChoices onIntroduced={(v, q) => askMirror(q, { prefix: v.greeting })} />
      </WaterMirror>
      <div className={s.dock}>
        <MirrorConsole />
      </div>
    </main>
  );
}
