import { profile, topics } from "../model/profile";

/** Gemini에 넘길 프로필 전문 (API를 쓸 때만 사용) */
export function profileAsContext(): string {
  const lines = [
    `이름: ${profile.name}`,
    `소속: ${profile.title}`,
    `한 줄 소개: ${profile.oneLiner}`,
    `이메일: ${profile.contact.email}`,
    profile.contact.github && `GitHub: ${profile.contact.github}`,
    profile.contact.linkedin && `LinkedIn: ${profile.contact.linkedin}`,
    "",
    ...topics.map((t) => `[${t.label}] ${t.answer.replaceAll("{visitor}", "그대")}`),
  ];
  return lines.filter(Boolean).join("\n");
}
