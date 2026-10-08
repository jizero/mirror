/** /api/chat 에서 답변을 스트리밍으로 받아옵니다 */
export async function streamAnswer(question: string, visitor: string, onText: (acc: string) => void) {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question, visitor }),
  });
  if (!res.ok || !res.body) throw new Error(String(res.status));
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let acc = "";
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    acc += decoder.decode(value, { stream: true });
    onText(acc);
  }
  return acc;
}
