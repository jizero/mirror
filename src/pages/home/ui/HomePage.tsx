"use client";

import { WaterMirror } from "@/widgets/water-mirror";
import { MirrorConsole } from "@/widgets/mirror-console";
import s from "./HomePage.module.css";

export function HomePage() {
  return (
    <main className={s.stage}>
      <WaterMirror />
      <div className={s.dock}>
        <MirrorConsole />
      </div>
    </main>
  );
}
