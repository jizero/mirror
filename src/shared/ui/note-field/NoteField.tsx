"use client";

import { useState, type FormEvent } from "react";
import { Button } from "../button";
import s from "./NoteField.module.css";

type Props = {
  placeholder: string;
  submitLabel: string;
  label: string;
  maxLength?: number;
  disabled?: boolean;
  autoFocus?: boolean;
  onSubmit: (value: string) => void;
};

/** 한 줄 입력 + 제출. 제출하면 비워집니다. */
export function NoteField({ placeholder, submitLabel, label, maxLength = 300, disabled, autoFocus, onSubmit }: Props) {
  const [value, setValue] = useState("");

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const v = value.trim();
    if (!v || disabled) return;
    setValue("");
    onSubmit(v);
  };

  return (
    <form className={s.field} onSubmit={submit}>
      <input
        className={s.input}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        aria-label={label}
        autoFocus={autoFocus}
      />
      <Button type="submit" variant="primary" disabled={disabled || !value.trim()}>
        {submitLabel}
      </Button>
    </form>
  );
}
