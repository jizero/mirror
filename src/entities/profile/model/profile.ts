/**
 * 거울이 알고 있는 "나"에 대한 모든 정보.
 * 이 파일만 수정하면 사이트 내용이 바뀝니다.
 *
 * - topics: 버튼/키워드로 API 없이 즉시 답하는 내용
 * - 준비된 답이 없는 질문만 Gemini가 이 파일 전체를 참고해 답합니다.
 *
 * TODO: 이력서를 받으면 아래 예시 값을 실제 정보로 바꿔주세요.
 */

export type Topic = {
  id: string;
  /** 버튼에 표시될 이름 */
  label: string;
  /** 버튼을 눌렀을 때 방문자가 묻는 말 */
  question: string;
  /** 질문에 이 단어들이 들어 있으면 이 주제로 답합니다 (API 미사용) */
  keywords: string[];
  /** 거울의 답변. {visitor} 는 방문자 이름으로 바뀝니다 */
  answer: string;
};

export const profile = {
  name: "황지영",
  title: "DRIMAGE",
  oneLiner: "아이디어를 화면 위의 경험으로 옮기는 사람",
  contact: {
    email: "jizero@hybecorp.com",
    github: "",
    linkedin: "",
  },
};

export const topics: Topic[] = [
  {
    id: "intro",
    label: "누구인가",
    question: "그는 어떤 사람이야?",
    keywords: ["누구", "소개", "이름", "어떤 사람", "자기소개", "who"],
    answer:
      "{visitor}여, 그대가 찾는 이는 황지영이니라.\nDRIMAGE에서 아이디어를 화면 위의 경험으로 옮기는 일을 하고 있지.",
  },
  {
    id: "career",
    label: "경력",
    question: "어떤 길을 걸어왔어?",
    keywords: ["경력", "회사", "직장", "커리어", "일했", "근무", "이력", "경험"],
    answer:
      "지금은 DRIMAGE에 몸담고 있느니라.\n(이력서를 받으면 이 자리에 지나온 길을 새겨두겠노라.)",
  },
  {
    id: "skills",
    label: "기술",
    question: "무엇을 잘해?",
    keywords: ["기술", "스택", "언어", "프레임워크", "잘하", "능력", "skill", "react", "three"],
    answer:
      "그의 손에 들린 도구들을 비추어 보마.\n(예시) TypeScript · React · Next.js · Three.js · AI SDK",
  },
  {
    id: "projects",
    label: "프로젝트",
    question: "어떤 것을 만들었어?",
    keywords: ["프로젝트", "작업", "만든", "포트폴리오", "작품", "결과물"],
    answer:
      "그대가 지금 들여다보는 이 거울 또한 그의 작품이니라.\n(이력서를 받으면 다른 작품들도 비추어 주겠노라.)",
  },
  {
    id: "interests",
    label: "관심사",
    question: "요즘 무엇에 관심 있어?",
    keywords: ["관심", "취미", "좋아", "요즘", "흥미"],
    answer: "그는 사람과 기술이 만나는 지점에 마음이 끌린다 하더구나.\n(예시 문구 — 직접 바꿔주세요)",
  },
  {
    id: "contact",
    label: "연락처",
    question: "어떻게 연락할 수 있어?",
    keywords: ["연락", "이메일", "메일", "email", "만나", "컨택", "깃허브", "github", "링크드인"],
    answer: "그에게 닿고 싶다면 이 주소로 전갈을 보내거라.\n✉ jizero@hybecorp.com",
  },
];
