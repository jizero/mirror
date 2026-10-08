# 거울아 거울아 🪞

잔잔한 물(마법의 거울)에게 황지영에 대해 묻는 자기소개 사이트.

Next.js 16 · React 19 · Three.js · Zustand · Vercel AI SDK · Gemini Flash-Lite (무료 티어) · Stylish

## 실행

```bash
npm install
cp .env.example .env.local   # Gemini 키 입력 (없어도 기본 답변은 동작)
npm run dev                  # http://localhost:3000
                             # http://localhost:3000/design-system
```

Gemini API 키는 https://aistudio.google.com/apikey 에서 무료로 발급받을 수 있어요.

## 대화 흐름

화면 전체가 잔잔한 라벤더빛 물이고, 그 위에 떠오르는 글과 입력창만 있어요.

1. 물 위의 글: "무엇이 궁금한가?" → 방문자가 입력창에 질문
2. 처음 물을 때만 팝업: "잠깐, 그대는 누구인가?" → 이름/소개 입력 또는 유형 버튼
3. 소개가 끝나면 거울이 인사와 함께 처음 질문에 답함
4. 답변
   - 키워드가 맞는 질문 → `entities/profile`의 준비된 답 (**API 호출 없음**)
   - 맞는 답이 없을 때만 Gemini 호출 (방문당 5회, IP당 하루 20회, 답변 220토큰 제한)
   - 키가 없거나 한도를 넘으면 이메일로 문의하라는 고정 문구

물을 누르면 그 자리에서 물결이 퍼지고, 누른 채 끌면 물결이 따라와요. 거울이 말하는 동안에는 글 주변에 잔물결이 일어요.

## 내 정보 바꾸기

`src/entities/profile/model/profile.ts` 하나만 고치면 돼요. 주제마다 `keywords`를 넉넉히 넣어두면 그만큼 API를 덜 써요. 추가한 주제는 Gemini가 참고하는 정보에도 자동으로 들어가요.

## 아키텍처 — Feature-Sliced Design

```
app/                         Next.js 라우팅만 (FSD 레이어를 re-export)
pages/README.md              빈 폴더 — src/pages가 Pages Router로 잡히지 않게 막음
src/
├─ app/styles/               전역 스타일 (토큰 import, 배경색)
├─ pages/
│  ├─ home/                  메인 화면 (물 + 글 + 입력창)
│  └─ design-system/         토큰·컴포넌트 미리보기
├─ widgets/
│  ├─ water-mirror/          화면 전체의 Three.js 물 + 물 위의 글
│  │   └─ lib/waterShader.ts 잔잔한 물 · 누른 자리 물결 · 말할 때 잔물결
│  └─ mirror-console/        입력창 + 소개 팝업을 엮는 곳
├─ features/
│  ├─ introduce-visitor/     "그대는 누구인가" 팝업
│  └─ ask-mirror/            입력창 + 질문 → 준비된 답 or Gemini
│      └─ server.ts          /api/chat 핸들러 (서버 전용 공개 API)
├─ entities/
│  ├─ profile/               ← 내 정보, 키워드 매칭
│  ├─ visitor/               방문자 유형, 이름 해석, useVisitor
│  └─ mirror/                대사, useSpeech(타자기)
└─ shared/
   ├─ ui/                    디자인 시스템
   └─ lib/
```

의존 방향은 위에서 아래로만 흐르게 했어요 (`pages → widgets → features → entities → shared`). 각 슬라이스는 `index.ts`로만 외부에 공개해요.

## 상태 관리 — Zustand

| 스토어 | 위치 | 역할 |
|---|---|---|
| `useSpeech` | entities/mirror | 거울이 말하는 문장, 타자기 진행, 스트리밍 여부, 마지막 질문 |
| `useVisitor` | entities/visitor | 현재 방문자 |
| `useIntroduceDialog` | features/introduce-visitor | 소개 팝업 열림 + 대기 중인 질문 |
| `useAiQuota` | features/ask-mirror | 이번 방문에서 쓴 AI 호출 수 |

## 디자인 시스템

- `src/shared/ui/tokens/tokens.css`: 색(라벤더 물·하늘색 물빛·남보라 선·버블검 핑크), 글꼴(Stylish), 크기, 간격, 선, 모션
- `src/shared/ui/tokens/index.ts`: 물 셰이더에서 쓰는 같은 색 값 (`color.water`)
- 컴포넌트: `Button` (`chip` · `primary` · `quiet`), `NoteField`, `Dialog`, `HandTitle`
- `/design-system` 페이지에서 한눈에 볼 수 있어요

## 배포

Vercel에 올린 뒤 환경변수 `GOOGLE_GENERATIVE_AI_API_KEY`만 넣으면 돼요.
