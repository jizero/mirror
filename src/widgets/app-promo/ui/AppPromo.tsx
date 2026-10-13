"use client";

import { useEffect, useState } from "react";
import s from "./AppPromo.module.css";

/** 토스 앱 안에서 열리는 '쪼르륵' 링크. 비어 있으면 배너가 링크 없이 보입니다 */
const APP_URL = process.env.NEXT_PUBLIC_JJOREUK_URL ?? "";
const CLOSED_KEY = "jjoreuk-promo-closed";

/** 화면 오른쪽에 떠 있는 앱 홍보 배너. 닫으면 이 탭에서는 다시 뜨지 않습니다 */
export function AppPromo() {
  const [closed, setClosed] = useState(true); // 저장된 값을 읽기 전 깜빡임 방지
  useEffect(() => {
    try {
      setClosed(sessionStorage.getItem(CLOSED_KEY) === "1");
    } catch {
      setClosed(false);
    }
  }, []);
  if (closed) return null;

  const close = () => {
    setClosed(true);
    try {
      sessionStorage.setItem(CLOSED_KEY, "1");
    } catch {}
  };

  const body = (
    <>
      <img className={s.icon} src="/jjoreuk-icon.png" alt="" width={56} height={56} />
      <span className={s.text}>
        <strong className={s.name}>쪼르륵</strong>
        <span className={s.desc}>물소리에 머리를 비우는 시간</span>
        <span className={s.cta}>토스에서 열기 ›</span>
      </span>
    </>
  );

  return (
    <aside className={s.promo} aria-label="앱 소개: 쪼르륵">
      {APP_URL ? (
        <a className={s.card} href={APP_URL} target="_blank" rel="noopener noreferrer">
          {body}
        </a>
      ) : (
        <div className={s.card}>{body}</div>
      )}
      <button type="button" className={s.close} onClick={close} aria-label="배너 닫기">
        ×
      </button>
    </aside>
  );
}
