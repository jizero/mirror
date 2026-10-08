# 거울아 거울아 🪞

동화 속 마법의 거울에게 황지영에 대해 묻는 자기소개 사이트.

Next.js 16 · React 19 · Three.js · Zustand · Vercel AI SDK · Gemini Flash-Lite (무료 티어) · Stylish

## 실행

```bash
pnpm install
cp .env.example .env.local   # Gemini 키 입력 (없어도 기본 답변은 동작)
pnpm dev                     # http://localhost:3000
                             # http://localhost:3000/design-system
```

Gemini API 키는 https://aistudio.google.com/apikey 에서 무료로 발급받을 수 있어요.

## 대화 흐름

1. 거울: "그대는 누구인가?" → 방문자가 이름이나 소개를 쓰거나 유형 버튼을 누름
2. 거울: "무엇이 궁금한가?" → 주제 버튼을 누르거나 자유롭게 질문
3. 답변
   - 주제 버튼, 또는 키워드가 맞는 질문 → `entities/profile`의 준비된 답 (**API 호출 없음**)
   - 맞는 답이 없을 때만 Gemini 호출 (방문당 5회, IP당 하루 20회, 답변 220토큰 제한)
   - 키가 없거나 한도를 넘으면 이메일로 문의하라는 고정 문구

거울은 드래그해서 360도 돌릴 수 있어요. 손을 놓으면 관성으로 돌다가 정면으로 돌아오고, 뒤를 보는 동안에는 글씨가 사라져요.

## 내 정보 바꾸기

`src/entities/profile/model/profile.ts` 하나만 고치면 돼요. 주제를 추가하면 버튼이 자동으로 생기고, Gemini가 참고하는 정보에도 자동으로 들어가요.

## 아키텍처 — Feature-Sliced Design

```
app/                         Next.js 라우팅만 (FSD 레이어를 re-export)
pages/README.md              빈 폴더 — src/pages가 Pages Router로 잡히지 않게 막음
src/
├─ app/styles/               전역 스타일 (토큰 import, 종이 배경)
├─ pages/
│  ├─ home/                  메인 화면 (PC: 거울 왼쪽 + 대화 오른쪽 / 모바일: 위아래)
│  └─ design-system/         토큰·컴포넌트 미리보기
├─ widgets/
│  ├─ magic-mirror/          Three.js 거울 + 유리 위 글씨
│  │   ├─ lib/shaders.ts     물결 셰이더
│  │   └─ lib/buildMirror.ts 금테·뒷면 지오메트리
│  └─ mirror-console/        단계별 입력 영역
├─ features/
│  ├─ introduce-visitor/     "그대는 누구인가" 답하기
│  ├─ ask-mirror/            질문 → 준비된 답 or Gemini
│  │   └─ server.ts          /api/chat 핸들러 (서버 전용 공개 API)
│  └─ restart-conversation/
├─ entities/
│  ├─ profile/               ← 내 정보, 키워드 매칭
│  ├─ visitor/               방문자 유형, 이름 해석, useVisitor
│  └─ mirror/                대사, useSpeech(타자기), useMirrorView(유리 위치·회전)
└─ shared/
   ├─ ui/                    디자인 시스템
   └─ lib/
```

의존 방향은 위에서 아래로만 흐르게 했어요 (`pages → widgets → features → entities → shared`). 각 슬라이스는 `index.ts`로만 외부에 공개해요.

## 상태 관리 — Zustand

| 스토어 | 위치 | 역할 |
|---|---|---|
| `useSpeech` | entities/mirror | 거울이 말하는 문장, 타자기 진행, 스트리밍 여부, 마지막 질문 |
| `useMirrorView` | entities/mirror | 3D 씬이 알려주는 유리 위치, PC/모바일 레이아웃, 정면 정도 |
| `useVisitor` | entities/visitor | 현재 방문자 |
| `useAiQuota` | features/ask-mirror | 이번 방문에서 쓴 AI 호출 수 |

## 디자인 시스템

- `src/shared/ui/tokens/tokens.css`: 색(종이·잉크·황동), 글꼴(Stylish), 크기, 간격, 선, 모션
- `src/shared/ui/tokens/index.ts`: three.js 재질에서 쓰는 같은 색 값
- 컴포넌트: `Button` (`wavy` · `accent` · `quiet`), `NoteField`, `HandTitle`
- `/design-system` 페이지에서 한눈에 볼 수 있어요

## 배포

Vercel에 올린 뒤 환경변수 `GOOGLE_GENERATIVE_AI_API_KEY`만 넣으면 돼요.
