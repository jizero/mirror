"use client";

import { useMirrorView } from "@/entities/mirror";
import { profile } from "@/entities/profile";
import { cx } from "@/shared/lib";
import { HandTitle } from "@/shared/ui";
import { MagicMirror } from "@/widgets/magic-mirror";
import { MirrorConsole } from "@/widgets/mirror-console";
import s from "./HomePage.module.css";

export function HomePage() {
  const wide = useMirrorView((st) => st.layout === "wide");

  return (
    <main className={cx(s.stage, wide && s.wide)}>
      <MagicMirror className={s.scene} />

      <div className={s.title}>
        <HandTitle sub={`${profile.name}에 대해 물어보렴`}>거울아, 거울아</HandTitle>
      </div>

      <aside className={s.side}>
        <p className={s.hint}>거울을 잡고 빙글 돌려볼 수도 있어</p>
        <MirrorConsole align={wide ? "start" : "center"} />
      </aside>
    </main>
  );
}
