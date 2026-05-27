# CBNU Match — 개발 Task 체크리스트

> **연관 문서**: [prd.md](./prd.md) · [requirement.md](./requirement.md)  
> **기술 스택**: Next.js 15 (App Router) · TypeScript · Supabase · Tailwind CSS · Shadcn/UI · Vercel  
> **마지막 업데이트**: 2026-05-28

---

## 진행 현황

| 마일스톤 | 제목 | 상태 |
|----------|------|------|
| M1 | 프로젝트 기반 세팅 | 🔲 대기 |
| M2 | DB 스키마 · 인증 | 🔲 대기 |
| M3 | 핵심 화면 · 공통 UI | 🔲 대기 |
| M4 | 매칭 시스템 | 🔲 대기 |
| M5 | 사후 평가 · 신고 | 🔲 대기 |
| M6 | 관리자 · 데이터 무결성 | 🔲 대기 |
| M7 | QA · 최적화 · 배포 | 🔲 대기 |

---

## M1 — 프로젝트 기반 세팅 (Foundation)

> 개발 환경, 폴더 구조, 공통 설정을 확립한다.

### 환경 설정

- [ ] Next.js 프로젝트 생성 확인 (App Router, TypeScript)
- [ ] Tailwind CSS v4 설정 확인 (`tailwind.config.ts`, `globals.css`)
- [ ] Shadcn/UI 초기화 (`npx shadcn@latest init`)
  - [ ] 기본 컴포넌트 설치: `button`, `input`, `card`, `badge`, `dialog`, `toast`, `dropdown-menu`, `select`, `form`, `label`
- [ ] `react-query` (`@tanstack/react-query`) 설치 및 Provider 설정
- [ ] `react-hook-form` + `zod` 설치 (폼 검증)

### Supabase 연동

- [ ] Supabase 프로젝트 생성 (Dashboard)
- [ ] `.env.local` 파일 생성 및 환경 변수 설정
  ```
  NEXT_PUBLIC_SUPABASE_URL=
  NEXT_PUBLIC_SUPABASE_ANON_KEY=
  SUPABASE_SERVICE_ROLE_KEY=
  NEXT_PUBLIC_APP_URL=
  ```
- [ ] Supabase 클라이언트 유틸 파일 작성
  - [ ] `lib/supabase/client.ts` — 브라우저용 클라이언트
  - [ ] `lib/supabase/server.ts` — 서버 컴포넌트 / Server Action용
  - [ ] `lib/supabase/middleware.ts` — 미들웨어용 세션 갱신
- [ ] Supabase CLI 설치 및 로컬 연결 (`supabase login`, `supabase link`)

### 프로젝트 구조

- [ ] 폴더 구조 생성
  ```
  app/
    (auth)/           # 인증 관련 라우트 그룹
    (main)/           # 인증 필요 라우트 그룹
    admin/
  components/
    ui/               # Shadcn 기본 컴포넌트
    common/           # 공통 커스텀 컴포넌트
    auth/
    sports/
    matching/
    review/
  lib/
    supabase/
    matching/         # 밸런싱 알고리즘
    utils/
  hooks/              # 커스텀 React Hooks
  types/              # TypeScript 타입 정의
  supabase/
    migrations/
    seed/
  ```
- [ ] TypeScript 경로 별칭 설정 (`@/*` → `./src/*`)

### 코드 품질 도구

- [ ] ESLint 설정 확인 및 규칙 추가 (`eslint.config.mjs`)
- [ ] Prettier 설치 및 `.prettierrc` 설정
- [ ] Husky + lint-staged 설치 (커밋 전 자동 lint)
- [ ] `types/database.ts` — Supabase 자동 생성 타입 파일 위치 지정

### 배포 인프라

- [ ] GitHub 레포지토리 생성
- [ ] 브랜치 전략 수립 (`main`, `staging`, `dev`, `feature/*`)
- [ ] Vercel 프로젝트 생성 및 GitHub 연결
- [ ] Vercel 환경 변수 등록 (Development / Preview / Production 분리)

### 전역 레이아웃

- [ ] `app/layout.tsx` — 전역 폰트(Google Fonts: Inter 또는 Pretendard) 적용
- [ ] `app/globals.css` — CSS 변수 기반 색상 토큰 정의
- [ ] `components/common/providers.tsx` — ReactQueryProvider, ToastProvider 래퍼

---

## M2 — DB 스키마 및 인증 (Auth & Schema)

> Supabase DB 마이그레이션, 시드 데이터, 인증 플로우를 완성한다.

### DB 마이그레이션

- [ ] `supabase/migrations/` 디렉토리 구성
- [ ] `001_initial_schema.sql` 작성
  - [ ] `departments` 테이블
  - [ ] `users` 테이블 (auth.users 참조)
  - [ ] `sport_categories` 테이블
  - [ ] `user_sport_tiers` 테이블
- [ ] `002_matching_schema.sql` 작성
  - [ ] `matches` 테이블 (`max_participants % 2 = 0` CHECK 포함)
  - [ ] `match_participants` 테이블
  - [ ] `groups` 테이블
  - [ ] `group_members` 테이블
- [ ] `003_review_schema.sql` 작성
  - [ ] `reviews` 테이블
  - [ ] `fraud_reports` 테이블
  - [ ] `tier_audit_log` 테이블
- [ ] `004_rls_policies.sql` 작성
  - [ ] `users` RLS (전체 SELECT, 본인 UPDATE)
  - [ ] `match_participants` RLS (전체 SELECT, 본인 INSERT)
  - [ ] `fraud_reports` RLS (본인·관리자 SELECT, 참가자 INSERT)
  - [ ] `reviews` RLS (참가자만 INSERT)
  - [ ] `tier_audit_log` RLS (관리자 전체, 본인 본인 것 SELECT)
- [ ] `supabase db push` 실행 및 마이그레이션 검증

### 시드 데이터

- [ ] `supabase/seed/seed_departments.sql` — 충북대 전체 학과 데이터 작성
  - [ ] 인문대학 (7개 학과)
  - [ ] 사회과학대학 (5개 학과)
  - [ ] 경영대학 (4개 학과)
  - [ ] 자연과학대학 (7개 학과)
  - [ ] 공과대학 (9개 학과부)
  - [ ] 농업생명환경대학 (5개 학과)
  - [ ] 의과대학, 약학대학, 수의과대학
  - [ ] 사범대학 (8개 학과)
  - [ ] 생활과학대학 (5개 학과)
  - [ ] 예술대학 (2개 학과)
- [ ] `supabase/seed/seed_sports.sql` — 스포츠 종목 5개 시드 데이터 작성
  ```sql
  -- 축구(22), 풋살(10), 농구(10), 볼링(4), e스포츠(10)
  ```
- [ ] `supabase db seed` 실행 검증

### 인증 화면 구현

#### 회원가입 (`/auth/signup`) — S-02
- [ ] 다단계 폼 컴포넌트 구현 (Step 1~8)
  - [ ] Step 1~3: 이름, 학번(8자리 정규식), 학과 드롭다운 (`departments` 테이블 연동)
  - [ ] Step 4: 이메일 입력 (`@chungbuk.ac.kr` 도메인 강제 검증)
  - [ ] Step 5~6: Supabase `signUp()` 호출 → 인증 이메일 발송
  - [ ] Step 7: 비밀번호 설정 (8자 이상, 영문+숫자+특수문자 검증)
  - [ ] Step 8: 종목별 초기 티어 선택 UI (선택, 건너뛰기 가능)
- [ ] zod 스키마 정의 (`lib/validators/auth.ts`)
- [ ] 서버 사이드 이메일 도메인 이중 검증 (Server Action)

#### 로그인 (`/auth/login`) — S-03
- [ ] 이메일 + 비밀번호 폼 구현
- [ ] Supabase `signInWithPassword()` 연동
- [ ] 로그인 실패 에러 메시지 처리 (잘못된 인증, 계정 정지 등)
- [ ] "이메일 인증을 완료해주세요" 안내 처리

#### 이메일 인증 대기 (`/auth/verify`) — S-04
- [ ] 인증 대기 안내 화면
- [ ] 인증 이메일 재발송 버튼 (1분 쿨다운)
- [ ] Supabase Auth 콜백 처리 (`app/auth/callback/route.ts`)

### 인증 미들웨어

- [ ] `middleware.ts` 구현
  - [ ] 보호된 경로 목록 정의 (`/home`, `/sports`, `/contest` 등)
  - [ ] 비로그인 → `/auth/login` 리다이렉트
  - [ ] 이메일 미인증 → `/auth/verify` 리다이렉트
  - [ ] 계정 정지 상태 → 정지 안내 페이지 리다이렉트
  - [ ] 관리자 전용 경로 `/admin` → role 검증

---

## M3 — 핵심 화면 및 공통 UI (Core UI)

> 홈, 스포츠·공모전 화면, 마이페이지, 공통 컴포넌트를 구현한다.

### 공통 컴포넌트

- [ ] `components/common/PageHeader.tsx` — 페이지 제목 + 뒤로가기 버튼
- [ ] `components/common/NavigationBar.tsx` — 하단 탭 바 (홈·스포츠·공모전·프로필)
- [ ] `components/common/LoadingSkeleton.tsx` — 카드형 스켈레톤
- [ ] `components/common/ErrorBoundary.tsx` — 전역 에러 경계
- [ ] `components/common/EmptyState.tsx` — 빈 목록 안내
- [ ] `components/common/ConfirmDialog.tsx` — 공통 확인 다이얼로그
- [ ] `components/common/TierBadge.tsx` — 티어 배지 (루키~프로 색상 구분)

### 랜딩 페이지 (`/`) — S-01

- [ ] 서비스 소개 섹션 (헤드라인, 핵심 기능 3가지)
- [ ] 로그인 / 회원가입 CTA 버튼
- [ ] 반응형 레이아웃 (모바일 우선)

### 홈 화면 (`/home`) — S-05

- [ ] 스포츠 카드 컴포넌트 (아이콘, 제목, 설명)
- [ ] 공모전 카드 컴포넌트
- [ ] 두 카드만 노출하는 그리드 레이아웃 (자격증·스터디 제외 명시)
- [ ] 사용자 이름 환영 문구 표시

### 스포츠 목록 (`/sports`) — S-06

- [ ] 5개 종목 카드 그리드 (축구·풋살·농구·볼링·e스포츠)
- [ ] 각 카드에 현재 OPEN 매칭 수 뱃지 표시
- [ ] 종목별 아이콘 (SVG 또는 이미지)

### 공모전 허브 (`/contest`) — S-11

- [ ] 요즘것들 iframe 구현 (`https://www.allforyoung.com/`)
- [ ] iframe 로드 실패 감지 → 외부 링크 버튼 fallback
- [ ] "팀원 구하기" 버튼 → 추후 공모전 팀원 모집 게시판 연결 (v1.0 외부 링크)
- [ ] 로딩 스피너 표시 (iframe 로드 전)

### 마이페이지 (`/profile`) — S-15

- [ ] 사용자 기본 정보 표시 (이름, 학번, 학과, 이메일)
- [ ] 매너 온도 시각화 (온도계 또는 게이지 UI)
- [ ] 종목별 티어 표시 및 수정 (`TierSelector` 컴포넌트)
- [ ] 프로필 정보 수정 폼 (이름 변경)
- [ ] 로그아웃 버튼

#### `TierSelector` 컴포넌트

- [ ] 종목 탭 전환 UI
- [ ] 티어 선택 UI (루키 → 프로, 시각적 계층 표현)
- [ ] 선택 저장 → `user_sport_tiers` upsert Server Action

### 유저 프로필 (`/profile/[userId]`) — S-16

- [ ] 공개 프로필 (이름, 학과, 매너 온도, 종목별 티어)
- [ ] 신고/차단 기능 버튼 (v1.0에서 신고는 매칭 후 평가 화면에서만 가능)

---

## M4 — 매칭 시스템 (Matching Core)

> 매칭 방 CRUD, 실시간 대기실, 밸런싱 알고리즘, 그룹 기능을 구현한다.

### 밸런싱 알고리즘 (핵심)

- [ ] `lib/matching/balanceTeams.ts` — Snake Draft 알고리즘 구현
  ```typescript
  // Participant 인터페이스
  // balanceTeams(participants, teamSize) 함수
  // 반환: { teamA, teamB, scoreDiff }
  ```
- [ ] `lib/matching/balanceTeamsWithGroups.ts` — 그룹 우선 배정 로직
  - [ ] 그룹 블록화 (평균 점수 기준 정렬)
  - [ ] 블록 단위 Snake Draft 적용
  - [ ] 그룹 크기 > 50% 예외 처리
- [ ] `__tests__/matching/balanceTeams.test.ts` — Jest 단위 테스트
  - [ ] 요구사항 예시 검증 (12명, 양 팀 225점)
  - [ ] 홀수 인원 예외 테스트
  - [ ] 전원 동일 티어 테스트
  - [ ] 프로 1명 + 루키 다수 테스트
  - [ ] 그룹 포함 밸런싱 테스트

### 매칭 방 생성 (`/sports/create`) — S-08

- [ ] 폼 필드 구현
  - [ ] 종목 선택 (sport_categories 드롭다운)
  - [ ] 매칭 제목 입력
  - [ ] 장소 입력
  - [ ] 일시 선택 (DateTimePicker)
  - [ ] 최대 인원 선택 (짝수만 가능, 종목별 기본값 자동 설정)
- [ ] `matches` INSERT Server Action
- [ ] 생성 완료 후 매칭 목록으로 리다이렉트

### 매칭 방 목록 (`/sports/[sportId]`) — S-07

- [ ] OPEN 상태 매칭 방 목록 조회 (정렬: scheduled_at ASC)
- [ ] 매칭 카드: 제목, 장소, 일시, 현재 참가자 수 / 최대 인원, 상태 뱃지
- [ ] "방 만들기" 버튼 (→ `/sports/create`)
- [ ] 무한 스크롤 또는 페이지네이션

### 매칭 대기실 (`/sports/[sportId]/lobby/[matchId]`) — S-09

- [ ] 현재 참가자 목록 (프로필 사진, 이름, 티어 뱃지)
- [ ] 참가 / 참가 취소 버튼
- [ ] 정원 충족 시 밸런싱 실행 버튼 (방장 전용)
- [ ] **Supabase Realtime 구독** — `match_participants` 변경 사항 실시간 반영
  ```typescript
  // useMatchLobby(matchId) 커스텀 훅
  // supabase.channel('match-lobby').on('postgres_changes', ...)
  ```
- [ ] 참가자 수 진행 바 (현재 N / 최대 M)
- [ ] 매칭 상태 변경 감지 및 자동 화면 전환 (CONFIRMED → 팀 배정 결과)

### 매칭 상태 머신 Server Actions

- [ ] `actions/match/joinMatch.ts` — 참가 (OPEN → 참가자 추가, 정원 시 FULL)
- [ ] `actions/match/leaveMatch.ts` — 참가 취소 (FULL → OPEN 롤백 포함)
- [ ] `actions/match/startBalancing.ts` — 방장 밸런싱 시작 (FULL → BALANCING → CONFIRMED)
  - [ ] `balanceTeamsWithGroups` 호출
  - [ ] `match_participants.team` 업데이트 (A/B 배정)
  - [ ] `matches.status` 업데이트
- [ ] `actions/match/startMatch.ts` — 경기 시작 (CONFIRMED → IN_PROGRESS)
- [ ] `actions/match/endMatch.ts` — 경기 종료 (IN_PROGRESS → COMPLETED, 점수 입력)
- [ ] `actions/match/cancelMatch.ts` — 매칭 취소 (방장 전용 → CANCELLED)

### 팀 밸런싱 결과 (`/sports/[sportId]/teams/[matchId]`) — S-10

- [ ] A팀 / B팀 카드 레이아웃
- [ ] 팀별 참가자 목록 (이름, 티어 뱃지)
- [ ] 팀별 총 점수 합계 표시
- [ ] 점수 차 표시 (`scoreDiff`)
- [ ] 경기 시작 버튼 (방장 전용)

### 그룹 기능

#### 그룹 생성 (`/group/create`) — S-12
- [ ] 그룹 이름 입력 폼
- [ ] `groups` INSERT Server Action (초대 토큰 자동 발급)
- [ ] 생성 완료 후 초대 링크 공유 UI (클립보드 복사)

#### 그룹 초대 수락 (`/group/join/[token]`) — S-13
- [ ] 토큰으로 `groups` 조회
- [ ] 유효하지 않은 토큰 → 에러 페이지
- [ ] 이미 가입된 그룹 → 안내 후 그룹 페이지로 이동
- [ ] `group_members` INSERT Server Action
- [ ] 로그인 안 된 경우 → 로그인 후 해당 URL로 복귀 (`callbackUrl` 처리)

#### 그룹 단위 매칭 참가
- [ ] 대기실에서 "그룹으로 참가" 버튼 (그룹 멤버 전원 일괄 `match_participants` 등록)
- [ ] 그룹 인원 > 팀 정원 50% 경고 토스트 + 분리 동의 체크박스

---

## M5 — 사후 평가 및 신고 시스템 (Review & Report)

> 경기 후 평가 UI, 부정 실력자 신고, 신고 누적 자동화 로직을 구현한다.

### 경기 후 평가 화면 (`/match/[matchId]/review`) — S-14

- [ ] 같은 매칭 참가자 목록 렌더링
- [ ] 매너 평가 섹션 (`[❤️ 매너]` 버튼)
  - [ ] 스포츠맨십 👍/👎 토글
  - [ ] 시간 약속 준수 👍/👎 토글
  - [ ] 재매칭 의사 ⭐ 1~5점 선택
  - [ ] `reviews` INSERT Server Action
- [ ] 부정 실력자 신고 섹션 (`[!]` 버튼)
  - [ ] 본인 행에는 [!] 버튼 미표시
  - [ ] 이미 신고한 유저 행에는 [!] 버튼 비활성화
  - [ ] 신고 바텀시트 (fraud_type 선택: `tier_too_high` / `tier_too_low`)
  - [ ] 익명 처리 안내 문구
  - [ ] `fraud_reports` INSERT Server Action (trust_weight 즉시 계산 후 저장)
- [ ] 24시간 평가 기간 만료 감지
  - [ ] Server Action에서 `match.completed_at + 24h` 검증
  - [ ] 만료 시 UI에서 평가 버튼 비활성화 + 안내 문구

### 매너 온도 업데이트 로직

- [ ] `actions/review/submitReview.ts` — 리뷰 저장 후 매너 온도 재계산
  ```typescript
  // 신규 평균 = (기존 온도 × 평가 횟수 + 새 점수) / (평가 횟수 + 1)
  // users.manner_temperature UPDATE
  ```
- [ ] 매너 온도 최소 0, 최대 100 범위 클램핑

### 신고 누적 집계 로직

- [ ] `lib/fraud/calculateTrustWeight.ts` — 신고자 신뢰도 가중치 계산 함수
  ```typescript
  // manner_temperature > 80 → 1.5
  // 50~80 → 1.0
  // < 50 → 0.3
  ```
- [ ] Supabase Edge Function 또는 Server Action: `processFraudReports`
  - [ ] 30일 내 누적 신뢰도 점수 집계
  - [ ] 점수 ≥ 10 → 경고 이메일 발송
  - [ ] 점수 ≥ 20 → 티어 1단계 자동 강등 + `tier_audit_log` 기록
  - [ ] 강등 후 60일 내 재발 → 티어 재등록 잠금 7일

### 집단 테러 방지 로직

- [ ] 동일 매칭 내 피신고율 > 50% 감지 → 자동 강등 HOLD 플래그
- [ ] 신고자 7일 내 3명 이상 신고 감지 → 가중치 × 0.1 패널티 적용
- [ ] 신고자 피신고 비율 > 80% 감지 → 가중치 0 설정

### 알림 이메일

- [ ] Resend 또는 Supabase Edge Function + SMTP 연동
- [ ] 경고 이메일 템플릿 작성 (한국어)
- [ ] 관리자 알림 이메일 템플릿 작성

---

## M6 — 관리자 및 데이터 무결성 (Admin & Integrity)

> 관리자 대시보드, 신고 케이스 처리, 티어 조정 기능을 구현한다.

### 관리자 미들웨어

- [ ] `middleware.ts`에 `/admin` 경로 role = 'admin' 검증 추가
- [ ] 비관리자 접근 → 403 또는 홈으로 리다이렉트

### 관리자 대시보드 (`/admin`) — S-17

#### 신고 케이스 관리
- [ ] 신고 목록 테이블 (상태별 탭: pending / under_review / upheld / dismissed)
- [ ] 신고 상세 페이지
  - [ ] 신고자 / 피신고자 프로필 요약
  - [ ] 해당 매칭 참가자 목록 및 티어 스냅샷
  - [ ] 과거 티어 변경 이력 타임라인 (`tier_audit_log`)
  - [ ] 신고 패턴 차트 (신고자의 최근 30일 신고 이력)
- [ ] 관리자 액션 버튼
  - [ ] 티어 강제 조정 (상향/하향 + 이유 입력)
  - [ ] 계정 정지 (7일 / 30일 선택)
  - [ ] 신고 인정 (`status = 'upheld'`)
  - [ ] 신고 무효화 (`status = 'dismissed'`)
  - [ ] 관리자 메모 입력 (`admin_note`)

#### 통계 대시보드
- [ ] 매칭 현황 요약 (오늘 생성, 진행 중, 완료)
- [ ] 신고 현황 요약 (처리 대기 건수)
- [ ] 신고 패턴 시각화 차트 (Recharts)
  - [ ] 일별 신고 건수 추이
  - [ ] 종목별 신고 분포

#### 사용자 관리
- [ ] 사용자 목록 검색 (학번, 이름, 이메일)
- [ ] 사용자 상세 페이지 (티어 이력, 신고 이력, 계정 상태)
- [ ] 계정 활성화/비활성화 토글

### 티어 변경 이력 (`tier_audit_log`) 뷰

- [ ] 관리자: 전체 유저 티어 변경 이력 조회
- [ ] 일반 유저: 마이페이지에서 본인 이력만 조회

---

## M7 — QA · 최적화 · 배포 (Polish & Deploy)

> 전체 품질 보증, 성능 최적화, 프로덕션 배포를 완료한다.

### 테스트

- [ ] **단위 테스트** (Jest)
  - [ ] `balanceTeams` 알고리즘 전체 케이스 통과
  - [ ] `calculateTrustWeight` 함수 테스트
  - [ ] zod 스키마 검증 테스트
- [ ] **E2E 테스트** (Playwright)
  - [ ] 회원가입 → 이메일 인증 → 로그인 플로우
  - [ ] 스포츠 종목 선택 → 매칭 방 생성 → 참가 → 밸런싱 플로우
  - [ ] 경기 종료 후 평가 → 신고 플로우
  - [ ] 관리자 로그인 → 신고 케이스 처리 플로우
- [ ] **보안 테스트**
  - [ ] RLS 비인가 접근 차단 확인 (다른 유저의 데이터 수정 시도)
  - [ ] `SUPABASE_SERVICE_ROLE_KEY` 클라이언트 노출 여부 점검
  - [ ] API Route에서 인증 토큰 누락 시 차단 확인

### 성능 최적화

- [ ] Lighthouse 성능 점수 90+ 달성
  - [ ] LCP < 2.5초
  - [ ] CLS < 0.1
- [ ] Next.js Image 컴포넌트로 이미지 최적화
- [ ] Server Components 최대 활용 (불필요한 'use client' 제거)
- [ ] DB 인덱스 추가 마이그레이션
  ```sql
  CREATE INDEX idx_matches_status ON matches(status);
  CREATE INDEX idx_matches_scheduled_at ON matches(scheduled_at);
  CREATE INDEX idx_match_participants_match_id ON match_participants(match_id);
  CREATE INDEX idx_fraud_reports_reported_id ON fraud_reports(reported_id);
  CREATE INDEX idx_fraud_reports_created_at ON fraud_reports(created_at);
  ```

### UX 품질

- [ ] 반응형 UI 전체 검증 (모바일 375px / 태블릿 768px / 데스크톱 1280px)
- [ ] 에러 바운더리 전체 화면 적용
- [ ] 로딩 스켈레톤 전체 화면 적용
- [ ] 빈 상태(Empty State) 전체 화면 처리
- [ ] 토스트 알림 일관성 검토 (성공·실패·경고)
- [ ] 접근성 검토 (키보드 네비게이션, aria-label)

### Staging 검증

- [ ] `staging` 브랜치 배포 및 전체 시나리오 QA
- [ ] 실제 충북대 이메일로 회원가입 테스트
- [ ] 다중 유저 동시 매칭 시뮬레이션
- [ ] Supabase Realtime 대기실 실시간 동기화 확인

### 프로덕션 배포

- [ ] `main` 브랜치 머지 → Vercel Production 자동 배포
- [ ] 배포 후 Vercel Analytics 활성화 확인
- [ ] Sentry 프로젝트 연결 및 에러 알림 설정
- [ ] Supabase Dashboard 쿼리 성능 모니터링 설정
- [ ] 커스텀 도메인 연결 (선택)

### 런칭 준비

- [ ] 서비스 소개 페이지 최종 검토
- [ ] 개인정보처리방침 페이지 작성 (`/privacy`)
- [ ] 이용약관 페이지 작성 (`/terms`)
- [ ] 충북대 커뮤니티(에브리타임, 학과 카카오톡) 홍보 자료 준비

---

## 부록 — 화면별 개발 완료 체크리스트

| 화면 ID | 화면명 | 라우트 | 마일스톤 | 완료 |
|---------|--------|--------|----------|------|
| S-01 | 랜딩 페이지 | `/` | M3 | `[ ]` |
| S-02 | 회원가입 | `/auth/signup` | M2 | `[ ]` |
| S-03 | 로그인 | `/auth/login` | M2 | `[ ]` |
| S-04 | 이메일 인증 대기 | `/auth/verify` | M2 | `[ ]` |
| S-05 | 홈 | `/home` | M3 | `[ ]` |
| S-06 | 스포츠 목록 | `/sports` | M3 | `[ ]` |
| S-07 | 매칭 방 목록 | `/sports/[sportId]` | M4 | `[ ]` |
| S-08 | 매칭 방 생성 | `/sports/create` | M4 | `[ ]` |
| S-09 | 매칭 대기실 | `/sports/[sportId]/lobby/[matchId]` | M4 | `[ ]` |
| S-10 | 팀 밸런싱 결과 | `/sports/[sportId]/teams/[matchId]` | M4 | `[ ]` |
| S-11 | 공모전 허브 | `/contest` | M3 | `[ ]` |
| S-12 | 그룹 생성 | `/group/create` | M4 | `[ ]` |
| S-13 | 그룹 초대 수락 | `/group/join/[token]` | M4 | `[ ]` |
| S-14 | 경기 후 평가 | `/match/[matchId]/review` | M5 | `[ ]` |
| S-15 | 마이페이지 | `/profile` | M3 | `[ ]` |
| S-16 | 유저 프로필 | `/profile/[userId]` | M3 | `[ ]` |
| S-17 | 관리자 대시보드 | `/admin` | M6 | `[ ]` |

---

*관련 문서: [prd.md](./prd.md) · [requirement.md](./requirement.md)*
