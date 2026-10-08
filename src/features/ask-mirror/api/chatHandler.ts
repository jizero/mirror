import { google } from "@ai-sdk/google";
import { streamText } from "ai";
import { profileAsContext } from "@/entities/profile";

// IP별 일일 호출 제한 (무료 티어 보호용)
const DAILY_LIMIT = 20;
const hits = new Map<string, { day: string; count: number }>();

function allow(ip: string) {
  const day = new Date().toISOString().slice(0, 10);
  const rec = hits.get(ip);
  if (!rec || rec.day !== day) {
    hits.set(ip, { day, count: 1 });
    return true;
  }
  if (rec.count >= DAILY_LIMIT) return false;
  rec.count += 1;
  return true;
}

/** POST /api/chat — 준비된 답이 없는 질문만 여기로 옵니다 */
export async function POST(req: Request) {
  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) return new Response("no-key", { status: 503 });

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  if (!allow(ip)) return new Response("limit", { status: 429 });

  const { question, visitor } = (await req.json()) as { question?: string; visitor?: string };
  const q = (question ?? "").slice(0, 300);
  if (!q) return new Response("empty", { status: 400 });

  const result = streamText({
    model: google(process.env.GEMINI_MODEL ?? "gemini-3.5-flash-lite"),
    maxOutputTokens: 220,
    temperature: 0.6,
    system: [
      "너는 동화 속 마법의 거울이다. 방문자의 질문에 아래 [인물 정보]만 근거로 답한다.",
      "말투: 고풍스럽고 신비로운 반말 (~이니라, ~하구나). 한국어로 2~4문장, 짧게.",
      "정보에 없는 내용은 지어내지 말고 '거울에도 비치지 않는 일'이라고 말한 뒤, 이메일로 직접 물어보라고 권한다.",
      "인물과 무관한 질문(코딩 도움, 일반 상식 등)은 정중히 거절하고 인물에 대해 물어보라고 한다.",
      `방문자 이름: ${(visitor ?? "낯선 이").slice(0, 16)}`,
      "",
      "[인물 정보]",
      profileAsContext(),
    ].join("\n"),
    prompt: q,
  });

  return result.toTextStreamResponse();
}
