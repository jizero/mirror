/** 거울의 고정 대사 */
export const lines = {
  whoAreYou: "잠깐, 그대는 누구인가?",
  opening: "누가 나의 잠을 깨웠느냐…\n무엇이 궁금한가?",
  unknown: (name: string, email: string) =>
    `${name}, 그 물음은 거울에도 비치지 않는구나.\n그의 경력이나 기술, 프로젝트를 물어보거나\n${email} 로 직접 전갈을 보내거라.`,
};
