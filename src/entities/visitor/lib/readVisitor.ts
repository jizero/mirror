import { visitorTypes, type Visitor } from "../model/types";

const normalize = (s: string) => s.toLowerCase().replace(/\s+/g, " ").trim();

/** "그대는 누구인가?"에 대한 답을 해석합니다 (API 미사용) */
export function readVisitor(input: string, presetTypeId?: string): Visitor {
  const raw = input.trim();
  const preset = visitorTypes.find((v) => v.id === presetTypeId);
  const detected = preset ?? visitorTypes.find((v) => v.keywords.some((k) => normalize(raw).includes(k)));

  // "저는 김민수입니다", "김민수예요" 같은 문장에서 이름만 추려냅니다
  let name = raw
    .replace(/^(저는|나는|난|전|제 이름은|내 이름은)\s*/, "")
    .replace(/(입니다|이에요|예요|이야|야|이요|요|임)[.!~]*$/, "")
    .trim();
  if (preset || !name) name = preset?.label ?? "낯선 이";
  if (name.length > 16) name = name.slice(0, 16);

  const greeting = (detected?.greeting ?? "어서 오너라, {visitor}.").replaceAll("{visitor}", name);
  return { name, typeId: detected?.id ?? null, greeting };
}
