/**
 * TS에서 쓰는 토큰 (three.js 재질 등). 값은 tokens.css와 같게 유지하세요.
 */
export const color = {
  paper: "#f6ecef",
  ink: "#4a2c4f",
  accent: "#c2557a",
  onGlass: "#fff6fb",
  brass: "#b58e55",
  brassDark: "#6e5532",
  brassBack: "#5a4329",
  gilt: "#c99a4b",
  garnet: "#e0628f",
  garnetGlow: "#7a1a44",
  ribbon: "#e98aa8",
  pearl: "#f2ebdd",
  velvet: "#4a2350",
  velvetSheen: "#d9a0d0",
  warmLight: "#fff0d0",
} as const;

export const motion = {
  /** 타자기 속도 (ms / 글자) */
  typeMs: 32,
  typeDelayMs: 350,
} as const;

/** 디자인 시스템 페이지에서 보여줄 CSS 토큰 목록 */
export const colorTokens = [
  ["--color-paper", "종이"],
  ["--color-dusk", "노을 하늘"],
  ["--color-paper-shade", "종이 그늘"],
  ["--color-ink", "잉크"],
  ["--color-ink-soft", "흐린 잉크"],
  ["--color-accent", "로즈"],
  ["--color-star", "금색 별"],
  ["--color-on-glass", "유리 위 글씨"],
  ["--color-brass", "황동"],
  ["--color-brass-dark", "어두운 황동"],
  ["--color-gilt", "금박"],
  ["--color-garnet", "로즈 보석"],
  ["--color-ribbon", "리본"],
  ["--color-pearl", "진주"],
  ["--color-velvet", "벨벳"],
] as const;

export const textTokens = ["--text-xs", "--text-sm", "--text-md", "--text-lg", "--text-xl"] as const;
export const spaceTokens = ["--space-1", "--space-2", "--space-3", "--space-4", "--space-5", "--space-6"] as const;
