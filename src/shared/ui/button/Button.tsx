import type { ButtonHTMLAttributes } from "react";
import s from "./Button.module.css";

export type ButtonVariant = "chip" | "primary" | "quiet";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant };

export function Button({ variant = "chip", className, type = "button", ...rest }: Props) {
  return <button type={type} className={[s.button, s[variant], className].filter(Boolean).join(" ")} {...rest} />;
}
