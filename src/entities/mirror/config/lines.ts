/** 거울의 고정 대사 */
export const lines = {
  whoAreYou: "잠깐, 그대는 누구인가?",
  opening: "누가 나의 잠을 깨웠느냐…\n무엇이 궁금한가?",
  /** AI를 쓸 수 없을 때(한도 초과·오류) 데이터로 짐작해 답하는 머리말과 맺음말 */
  guessHead: (name: string) => `${name}, 지금은 거울의 기운이 다해 깊이 들여다볼 수 없구나.
데이터에 있는 것으로 최대한 짐작해 보건대…
`,
  guessTail: (email: string) => `
더 궁금하다면 ${email} 로 직접 전갈을 보내거라.`,
};
