import type { ReactNode } from "react";
import s from "./HandTitle.module.css";

/** 살짝 기울어진 손글씨 제목 */
export function HandTitle({ children, sub, className }: { children: ReactNode; sub?: ReactNode; className?: string }) {
  return (
    <h1 className={[s.title, className].filter(Boolean).join(" ")}>
      {children}
      {sub && <small className={s.sub}>{sub}</small>}
    </h1>
  );
}
