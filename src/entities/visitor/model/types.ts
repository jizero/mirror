export type VisitorType = { id: string; label: string; keywords: readonly string[]; greeting: string };

/** 방문자 유형별 인사. 유형은 "그대는 누구인가"에 대한 답으로 판별합니다 */
export const visitorTypes = [
  {
    id: "recruiter",
    label: "채용 담당자",
    keywords: ["채용", "리크루터", "recruit", "hr", "인사", "헤드헌터", "면접"],
    greeting: "인재를 찾아 여기까지 왔구나, {visitor}.",
  },
  {
    id: "colleague",
    label: "함께 일할 동료",
    keywords: ["동료", "개발자", "디자이너", "협업", "팀", "기획", "pm"],
    greeting: "함께 걸을 이를 찾고 있구나, {visitor}.",
  },
  {
    id: "friend",
    label: "지나가던 나그네",
    keywords: ["친구", "지인", "그냥", "나그네", "구경", "궁금"],
    greeting: "발길이 이끄는 대로 왔구나, {visitor}.",
  },
] as const satisfies readonly VisitorType[];


export type Visitor = { name: string; typeId: string | null; greeting: string };
