"use client";

import { useEffect, useId, type ReactNode } from "react";
import { createPortal } from "react-dom";
import s from "./Dialog.module.css";

type Props = {
  open: boolean;
  title: ReactNode;
  description?: ReactNode;
  onClose: () => void;
  children: ReactNode;
};

/** 가운데 뜨는 팝업 (body에 portal). 바깥을 누르거나 Esc로 닫힙니다. */
export function Dialog({ open, title, description, onClose, children }: Props) {
  const id = useId();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open || typeof document === "undefined") return null;
  return createPortal(
    <div className={s.backdrop} onClick={onClose}>
      <div
        className={s.panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${id}-title`}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id={`${id}-title`} className={s.title}>
          {title}
        </h2>
        {description && <p className={s.description}>{description}</p>}
        {children}
        <button className={s.close} onClick={onClose} aria-label="닫기">
          ×
        </button>
      </div>
    </div>,
    document.body,
  );
}
