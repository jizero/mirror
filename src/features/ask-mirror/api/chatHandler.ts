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

// 질문에서 답할 언어를 찾습니다. 못 찾으면 질문을 쓴 언어로 답하게 둡니다
const LANGUAGES: [RegExp, string][] = [
  [/영어|english/i, "English"],
  [/일본어|일어|japanese|日本語/i, "日本語"],
  [/중국어|chinese|中文/i, "中文"],
];
function answerLanguage(q: string) {
  const asked = LANGUAGES.find(([re]) => re.test(q))?.[1];
  // 한글 없이 영문으로만 물으면 영어로
  const lang = asked ?? (!/[가-힣]/.test(q) && /[a-z]/i.test(q) ? "English" : undefined);
  return lang ? `반드시 ${lang}로만 답하라. 한국어를 쓰지 않는다.` : "질문을 쓴 언어로 답하라.";
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
      "너는 황지영을 비추는 동화 속 마법의 거울이다. 방문자의 질문에 아래 [인물 정보]만 근거로 답한다.",
      "목표: 방문자가 황지영과 함께 일하고 싶어지도록, 질문과 관련된 강점과 구체적인 근거(성과 숫자, 프로젝트 이름, 회사)를 하나 이상 자연스럽게 짚는다. 단, 정보에 없는 성과를 만들거나 부풀리지 않고, '완벽하게', '최고의' 같은 과장된 수식어도 쓰지 않는다.",
      "말투: 신비롭고 따뜻한 거울의 반말. '~이니라', '~하구나'를 매 문장 반복하지 말고 자연스럽게 섞는다. 항목을 나열하지 말고 이야기하듯 최대 3문장, 한국어 기준 200자 안쪽으로 짧게.",
      "두괄식: 첫 문장에서 질문에 대한 결론부터 한 문장으로 말하고, 이어지는 문장에서 그 근거를 든다.",
      // 모델에게 "가끔"을 맡기면 매번 농담을 해서, 세 번에 한 번만 농담 지시를 넣습니다
      Math.random() < 1 / 3
        ? "이번 답은 마지막에 가벼운 농담 한마디로 끝낸다. 떡볶이 사랑, 급한 성격, 흙이 많은 사주, 아재 나이 같은 [인물 정보]의 소소한 이야기를 소재로 삼되 사실은 바꾸지 않는다."
        : "이번 답에는 농담을 넣지 않는다.",
      "같은 성과 숫자를 매번 꺼내지 말고, 질문에 가장 잘 맞는 근거 하나를 고른다.",
      "방문자 이름이 '채용 담당자'면 성과와 역량을, '함께 일할 동료'면 협업 방식과 일하는 태도를 더 비춘다.",
      "단점이나 아쉬운 점을 물으면 솔직히 말하되, 극복하려는 노력과 그것이 만든 강점을 함께 말한다.",
      "언어 규칙(가장 우선): 방문자가 '영어로', 'in English', '일본어로'처럼 언어를 지정하거나 다른 언어로 물으면, 답 전체를 반드시 그 언어로만 쓴다. 한국어를 섞지 않는다. 지정이 없으면 한국어로 답한다.",
      "인물을 가리킬 때는 이름(황지영)으로 부른다.",
      "정보에 없는 내용(일하는 습관, 일상, 취향 등)은 [인물 정보]의 성격·협업 스타일·취향을 근거로 짐작해 답해도 된다. 이때 답은 반드시 '데이터에 없는 내용이라 짐작해 보건대,'로 시작하고, 무엇을 근거로 짐작했는지 함께 말한다.",
      "답에는 대괄호([ ])를 절대 쓰지 않는다. '[취향]', '[사이드]' 같은 자료의 분류 표기를 옮기지 말고 자연스러운 말로 풀어 쓴다.",
      "단, 경력·회사·성과 숫자·연봉·나이·가족 같은 사실은 짐작하지 않는다. 이런 것이 정보에 없으면 '거울에도 비치지 않는 일'이라 말하고 이메일로 직접 물어보라고 권한다.",
      "인물과 무관한 질문(코딩 도움, 일반 상식 등)은 정중히 거절하고 인물에 대해 물어보라고 한다.",
      `방문자 이름: ${(visitor ?? "낯선 이").slice(0, 16)}`,
      "",
      "[인물 정보]",
      profileAsContext(),
    ].join("\n"),
    // 작은 모델은 시스템 프롬프트의 언어 규칙을 자주 놓쳐서, 질문 바로 뒤에 한 번 더 적습니다
    prompt: `${q}\n\n(${answerLanguage(q)})`,
  });

  return result.toTextStreamResponse();
}
