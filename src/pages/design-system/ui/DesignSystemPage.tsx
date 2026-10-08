"use client";

import { Button, HandTitle, NoteField, tokens } from "@/shared/ui";
import s from "./DesignSystemPage.module.css";

/** /design-system — 토큰과 공용 컴포넌트를 한눈에 보는 페이지 */
export function DesignSystemPage() {
  return (
    <main className={s.page}>
      <HandTitle sub="거울아 거울아 · 디자인 시스템">Design System</HandTitle>

      <section className={s.section}>
        <h2 className={s.h2}>색</h2>
        <div className={s.grid}>
          {tokens.colorTokens.map(([v, name]) => (
            <div key={v} className={s.swatch}>
              <div className={s.chip} style={{ background: `var(${v})` }} />
              {name}
              <span className={s.code}>{v}</span>
            </div>
          ))}
        </div>
      </section>

      <section className={s.section}>
        <h2 className={s.h2}>글자 · Stylish</h2>
        {tokens.textTokens.map((v) => (
          <div key={v} className={s.row}>
            <span style={{ fontSize: `var(${v})` }}>거울아 거울아, 그대는 누구인가</span>
            <span className={s.code}>{v}</span>
          </div>
        ))}
        <div className={s.glass}>유리 위 글씨 (--text-glass, --color-on-glass)</div>
      </section>

      <section className={s.section}>
        <h2 className={s.h2}>간격</h2>
        {tokens.spaceTokens.map((v) => (
          <div key={v} className={s.row}>
            <div className={s.spaceBar} style={{ width: `var(${v})` }} />
            <span className={s.code}>{v}</span>
          </div>
        ))}
      </section>

      <section className={s.section}>
        <h2 className={s.h2}>Button</h2>
        <div className={s.row}>
          <Button variant="wavy">경력</Button>
          <Button variant="wavy">기술</Button>
          <Button variant="wavy" disabled>
            비활성
          </Button>
          <Button variant="accent">묻기 →</Button>
          <Button variant="quiet">처음부터 다시</Button>
        </div>
        <span className={s.code}>{'<Button variant="wavy" | "accent" | "quiet" />'}</span>
      </section>

      <section className={s.section}>
        <h2 className={s.h2}>NoteField</h2>
        <div className={s.demo}>
          <NoteField label="예시" placeholder="거울에게 무엇이든 물어보세요" submitLabel="묻기" onSubmit={() => {}} />
        </div>
      </section>

      <section className={s.section}>
        <h2 className={s.h2}>HandTitle</h2>
        <HandTitle sub="부제목은 흐린 잉크로">손글씨 제목</HandTitle>
      </section>
    </main>
  );
}
