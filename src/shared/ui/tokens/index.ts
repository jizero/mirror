/**
 * TS에서 쓰는 토큰 (three.js 재질 등). 값은 tokens.css와 같게 유지하세요.
 */
export const color = {
  bg: "#d4cbf7",
  ink: "#3b2d6b",
  accent: "#ff6fa8",
  /** 화면 전체의 물 (three.js 셰이더) */
  water: {
    base: "#d4cbf7", // 라벤더
    deep: "#b9acef", // 물결 골
    light: "#bfe8fb", // 하늘색 물빛
  },
} as const;

export const motion = {
  /** 타자기 속도 (ms / 글자) */
  typeMs: 32,
  typeDelayMs: 350,
} as const;

/** 디자인 시스템 페이지에서 보여줄 CSS 토큰 목록 */
export const colorTokens = [
  ["--color-bg", "라벤더 물"],
  ["--color-surface", "바탕"],
  ["--color-line", "선"],
  ["--color-ink", "잉크"],
  ["--color-ink-soft", "흐린 잉크"],
  ["--color-accent", "버블검 핑크"],
  ["--color-accent-soft", "연한 핑크"],
  ["--color-mint", "민트"],
  ["--color-sky-blue", "하늘색"],
  ["--color-star", "레몬 별"],
  ["--color-water-deep", "물결 골"],
  ["--color-water-light", "하늘색 물빛"],
] as const;

export const textTokens = ["--text-xs", "--text-sm", "--text-md", "--text-lg", "--text-xl"] as const;
export const spaceTokens = ["--space-1", "--space-2", "--space-3", "--space-4", "--space-5", "--space-6"] as const;
