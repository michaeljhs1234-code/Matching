# 충북대학교 커뮤니티 기반 매칭 시스템 — Product Requirements Document (PRD) & Task.md

> **버전**: v1.0.0  
> **작성일**: 2026-05-28  
> **기술 스택**: Next.js (App Router) + TypeScript · Supabase (Postgres + Auth) · Tailwind CSS · Shadcn/UI · React Query / Server Actions · Vercel

---

## 목차

1. [개요 및 문제 정의](#1-개요-및-문제-정의)
2. [사용자 페르소나 및 스토리](#2-사용자-페르소나-및-사용자-스토리)
3. [화면 목록 (Screen Inventory)](#3-화면-목록-screen-inventory)
4. [핵심 기능 명세](#4-핵심-기능-명세)
   - 4.1 인증 및 계정 관리
   - 4.2 카테고리 분류 및 첫 화면
   - 4.3 티어(실력) 시스템
   - 4.4 전력 밸런싱 매칭 알고리즘
   - 4.5 팀 기능
   - 4.6 사후 평가 시스템
5. [데이터 무결성 및 제재 로직](#5-데이터-무결성-및-제재-로직)
6. [DB 스키마 초안](#6-db-스키마-초안)
7. [엣지 케이스](#7-엣지-케이스)
8. [배포 전략](#8-배포-전략)
9. [Task.md — 개발 마일스톤 체크리스트](#9-taskmd--개발-마일스톤-체크리스트)

---

## 1. 개요 및 문제 정의

### 배경

충북대학교 학생들은 교내 스포츠 활동(축구, 농구 등)이나 공모전 팀원을 구할 때 에브리타임 자유게시판, 카카오톡 단체채팅방, 혹은 지인 네트워크에 전적으로 의존한다. 이 방식은 다음 문제를 야기한다.

| 문제 | 영향 |
|------|------|
| 실력 불균형 팀 구성 | 일방적 경기 → 재미 저하 → 참여율 감소 |
| 팀원 신뢰도 부재 | 노쇼(No-show), 실력 허위 기재 |
| 공모전 정보 분산 | 접수 마감일 놓침, 팀 구성 지연 |
| 체계적 매칭 시스템 부재 | 매칭 과정이 반복적으로 개인 역량에 의존 |

### 솔루션

**충북대 재학생 전용 인증(학교 이메일)** 기반의 스포츠·공모전 매칭 플랫폼을 구축한다.  
핵심 차별점은 **전력 밸런싱 알고리즘**으로, 참여자들의 티어를 양 팀에 균등 분배하여 공정하고 재미있는 경기를 보장한다.

### 목표 지표 (Success Metrics)

- 월간 활성 사용자(MAU): 런칭 3개월 내 300명
- 매칭 완료율: 생성된 매칭의 80% 이상 실제 경기 진행
- 부정 실력자 신고 → 티어 조정 정확도: 90% 이상 (운영진 최종 검토 기준)

---

## 2. 사용자 페르소나 및 사용자 스토리

### 페르소나

| 구분 | 이름 | 학년/학과 | 목표 | 불편 |
|------|------|-----------|------|------|
| P1 캐주얼 스포츠인 | 이민준 | 3학년 / 컴퓨터공학과 | 수업 후 가볍게 풋살 | 인원 모으기 귀찮음 |
| P2 공모전 팀장 | 김수아 | 2학년 / 경영학과 | 디자인 전공 팀원 필요 | 적합한 사람 찾기 어려움 |
| P3 스포츠 고수 | 박현우 | 4학년 / 체육교육과 | 수준 맞는 경기 원함 | 초보와 섞이는 불만 |

### 사용자 스토리

```
[US-01] 회원가입
  As a 충북대 재학생,
  I want to 학번과 학교 이메일로 가입하고 싶다.
  So that 재학생만 이용 가능한 신뢰도 높은 커뮤니티에 접근할 수 있다.

[US-02] 스포츠 매칭 참가
  As a 스포츠 활동을 원하는 학생,
  I want to 내 티어를 설정하고 매칭에 참가하고 싶다.
  So that 비슷한 실력의 사람들과 균형 잡힌 팀으로 경기할 수 있다.

[US-03] 팀 구성
  As a 친구와 함께 참가하려는 학생,
  I want to 그룹을 만들어 친구를 초대한 후 함께 매칭에 등록하고 싶다.
  So that 친구와 같은 팀에 배정될 가능성을 높일 수 있다.

[US-04] 공모전 정보 확인
  As a 공모전에 관심 있는 학생,
  I want to 현재 접수 중인 공모전 목록을 한 곳에서 보고 싶다.
  So that 마감 기한을 놓치지 않고 팀원을 구할 수 있다.

[US-05] 사후 평가
  As a 경기를 마친 참가자,
  I want to 함께 플레이한 사람에 대해 선택적으로 신고/평가하고 싶다.
  So that 플랫폼의 데이터 신뢰도가 유지된다.

[US-06] 부정 실력자 신고
  As a 티어를 속인 유저를 만난 학생,
  I want to 강제 팝업 없이 유저 목록에서 해당 사람만 선택해 신고하고 싶다.
  So that 불필요한 UI 없이 빠르게 신고할 수 있다.
```

---

## 3. 화면 목록 (Screen Inventory)

| # | 화면명 | 경로 | 인증 필요 |
|---|--------|------|-----------|
| S-01 | 랜딩/첫 화면 | `/` | ❌ |
| S-02 | 회원가입 | `/auth/signup` | ❌ |
| S-03 | 로그인 | `/auth/login` | ❌ |
| S-04 | 이메일 인증 대기 | `/auth/verify` | ❌ |
| S-05 | 홈 (카테고리 선택) | `/home` | ✅ |
| S-06 | 스포츠 목록 | `/sports` | ✅ |
| S-07 | 스포츠 상세 / 매칭 참가 | `/sports/[id]` | ✅ |
| S-08 | 매칭 방 생성 | `/sports/create` | ✅ |
| S-09 | 매칭 대기실 | `/sports/[id]/lobby` | ✅ |
| S-10 | 팀 밸런싱 결과 | `/sports/[id]/teams` | ✅ |
| S-11 | 공모전 허브 | `/contest` | ✅ |
| S-12 | 그룹 생성 / 초대 링크 | `/group/create` | ✅ |
| S-13 | 그룹 초대 수락 | `/group/join/[token]` | ✅ |
| S-14 | 경기 후 평가 | `/match/[id]/review` | ✅ |
| S-15 | 마이페이지 | `/profile` | ✅ |
| S-16 | 유저 프로필 | `/profile/[userId]` | ✅ |
| S-17 | 관리자 대시보드 | `/admin` | ✅ (관리자) |

---

## 4. 핵심 기능 명세

### 4.1 인증 및 계정 관리

#### 회원가입 플로우

```
[1] 이름 입력
[2] 학번 입력 (10자리 숫자 검증)
[3] 학과 선택 (드롭다운, DB 기반)
[4] 학교 이메일 입력 (@chungbuk.ac.kr 도메인 강제)
[5] Supabase Auth → 인증 이메일 발송
[6] 이메일 링크 클릭 → 인증 완료
[7] 비밀번호 설정 (8자 이상, 특수문자 포함)
[8] 프로필 완성 (각 스포츠별 티어 설정 — 선택)
```

#### 학과 목록 (DB 기반, `departments` 테이블)

충북대학교 공식 홈페이지 기준 전체 단과대학 및 학과를 `departments` 테이블에 시딩한다.  
아래는 대표 예시이며, 실제 DB에는 전체 학과를 포함한다.

<details>
<summary>학과 목록 예시 (펼치기)</summary>

**인문대학**: 국어국문학과, 영어영문학과, 독어독문학과, 불어불문학과, 중어중문학과, 사학과, 철학과  
**사회과학대학**: 사회학과, 행정학과, 정치외교학과, 심리학과, 경제학과  
**경영대학**: 경영학과, 경영정보학과, 회계학과, 무역학과  
**자연과학대학**: 수학과, 통계학과, 물리학과, 화학과, 생물학과, 천문우주학과, 지구환경과학과  
**공과대학**: 기계공학부, 전기공학부, 정보통신공학부, 컴퓨터공학과, 건축공학과, 토목공학부, 화학공학과, 신소재공학과, 안전공학과  
**농업생명환경대학**: 식물자원학과, 축산학과, 원예과학과, 농업경제학과, 환경공학과  
**의과대학**: 의학과  
**약학대학**: 약학과  
**사범대학**: 교육학과, 윤리교육과, 국어교육과, 영어교육과, 수학교육과, 과학교육학부, 사회교육과, 체육교육과  
**생활과학대학**: 아동복지학과, 가족복지학과, 식품영양학과, 주거환경학과, 패션디자인정보학과  
**예술대학**: 음악학과, 미술학과  
**수의과대학**: 수의학과  
*(이하 전체 학과는 `seed_departments.sql` 파일 참조)*

</details>

#### 인증 규칙

- 이메일 도메인: `@chungbuk.ac.kr` 외 가입 불가 (서버 사이드 검증)
- 학번 중복 가입 불가 (`student_id` UNIQUE 제약)
- 미인증 상태에서 핵심 기능 접근 시 `/auth/verify` 리다이렉트

---

### 4.2 카테고리 분류 및 첫 화면

#### 홈 화면 구성 (`/home`)

```
┌─────────────────────────────┐
│        CBNU MATCH           │
│  충북대학교 매칭 플랫폼      │
├──────────────┬──────────────┤
│   🏅 스포츠  │  🏆 공모전   │
│   (Sports)   │  (Contest)   │
└──────────────┴──────────────┘
```

- **두 가지 테마만 노출** (자격증 스터디, 전공 스터디 제외)
- 각 카드는 클릭 시 해당 섹션으로 라우팅

#### 스포츠 서브 카테고리 (`/sports`)

| 종목 | 아이콘 | 기본 팀 인원 |
|------|--------|------------|
| 축구 ⚽ | soccer | 11 vs 11 |
| 풋살 🥅 | futsal | 5 vs 5 |
| 농구 🏀 | basketball | 5 vs 5 |
| 볼링 🎳 | bowling | 개인전 / 팀전 |
| e스포츠 🎮 | esports | 5 vs 5 (종목별 상이) |

#### 공모전 허브 (`/contest`)

- **외부 연동**: [요즘것들 (All For Young)](https://www.allforyoung.com/) 링크를 인앱 WebView 또는 iframe으로 임베드
- 접수 중인 공모전을 사용자가 즉시 확인 가능
- "팀원 구하기" 버튼 → 내부 매칭 게시판으로 연결 (공모전 팀원 모집 기능)
- **구현 방식**: Next.js `<iframe>` 또는 `window.open()` 외부 링크 방식 (CSP 정책에 따라 선택)

---

### 4.3 티어(실력) 시스템 (스포츠 부문)

#### 티어 정의

| 티어 | 단계 | 점수 환산 (내부) | 설명 |
|------|------|----------------|------|
| 루키 | 단일 | 0 | 입문자, 기초 규칙 숙지 단계 |
| 아마추어 1 | 1/5 | 10 | 기본기 갖춘 생활체육인 |
| 아마추어 2 | 2/5 | 20 | |
| 아마추어 3 | 3/5 | 30 | |
| 아마추어 4 | 4/5 | 40 | |
| 아마추어 5 | 5/5 | 50 | 아마추어 최상급 |
| 세미프로 1 | 1/3 | 65 | 준전문가 수준 |
| 세미프로 2 | 2/3 | 75 | |
| 세미프로 3 | 3/3 | 85 | |
| 프로 | 단일 | 100 | 전문 선수급 |

- 티어는 **스포츠 종목별로 독립** 관리 (`user_sport_tiers` 테이블)
- 초기 티어는 회원가입 시 **자기 신고** 방식으로 설정
- 이후 **매칭 결과 + 사후 평가**를 통해 시스템이 조정

---

### 4.4 전력 밸런싱 매칭 알고리즘

#### 알고리즘 목표

> 참가자 N명이 매칭에 모였을 때, 양 팀(A팀, B팀)의 **티어 점수 합계 차이를 최소화**하여 팀을 구성한다.

#### 입력 / 출력

```
Input:
  participants: Array<{ userId: string, tierScore: number }>
  teamSize: number  // 종목별 팀당 인원 수

Output:
  teamA: Array<Participant>
  teamB: Array<Participant>
  scoreDiff: number  // |sum(A) - sum(B)|
```

#### 알고리즘 설계 (Greedy Balanced Split)

```typescript
/**
 * 전력 밸런싱 알고리즘
 * 1. 참가자를 tierScore 내림차순으로 정렬
 * 2. Snake Draft 방식으로 팀에 번갈아 배정
 *    - 홀수 라운드: A → B 순서
 *    - 짝수 라운드: B → A 순서
 * 3. 단, 그룹(Group) 참가자는 분리 금지 원칙 우선 적용
 *    (그룹 전체를 하나의 단위로 취급 후 그룹 간 밸런싱)
 */
function balanceTeams(
  participants: Participant[],
  teamSize: number
): { teamA: Participant[]; teamB: Participant[] } {
  // 1. 티어 점수 내림차순 정렬
  const sorted = [...participants].sort((a, b) => b.tierScore - a.tierScore);

  const teamA: Participant[] = [];
  const teamB: Participant[] = [];

  // 2. Snake Draft 배정
  sorted.forEach((player, index) => {
    const round = Math.floor(index / 2);
    const isEvenRound = round % 2 === 0;
    const positionInRound = index % 2;

    if (isEvenRound) {
      positionInRound === 0 ? teamA.push(player) : teamB.push(player);
    } else {
      positionInRound === 0 ? teamB.push(player) : teamA.push(player);
    }
  });

  return { teamA, teamB };
}
```

#### 매칭 예시 (요구사항 검증)

```
참가자 12명:
  아마추어4 × 4명 (점수: 40)
  아마추어1 × 4명 (점수: 10)
  세미프로2 × 2명 (점수: 75)
  아마추어5 × 2명 (점수: 50)

정렬 후: [75, 75, 50, 50, 40, 40, 40, 40, 10, 10, 10, 10]

Snake Draft 배정:
  라운드0 (짝수): 75→A, 75→B
  라운드1 (홀수): 50→B, 50→A
  라운드2 (짝수): 40→A, 40→B
  라운드3 (홀수): 40→B, 40→A
  라운드4 (짝수): 10→A, 10→B
  라운드5 (홀수): 10→B, 10→A

결과:
  팀A = [세미프로2(75), 아마추어5(50), 아마추어4(40), 아마추어4(40), 아마추어1(10), 아마추어1(10)]
        합계: 225점
  팀B = [세미프로2(75), 아마추어5(50), 아마추어4(40), 아마추어4(40), 아마추어1(10), 아마추어1(10)]
        합계: 225점
  점수 차이: 0점 ✅
```

#### 매칭 방 상태 머신

```
OPEN → FULL → BALANCING → CONFIRMED → IN_PROGRESS → COMPLETED → REVIEWED
         ↓
      CANCELLED (방장이 취소하거나 시간 초과 시)
```

- `OPEN`: 참가자 모집 중
- `FULL`: 정원 충족, 밸런싱 연산 대기
- `BALANCING`: 알고리즘 실행 중 (보통 < 1초)
- `CONFIRMED`: 팀 배정 완료, 참가자 확인 대기
- `IN_PROGRESS`: 경기 진행 중
- `COMPLETED`: 경기 종료, 평가 가능 상태
- `REVIEWED`: 사후 평가 완료

---

### 4.5 팀(그룹) 기능

#### 그룹 생성 플로우

```
[1] 그룹 생성 → 고유 초대 토큰 발급 (UUID v4 기반 slug)
[2] 초대 링크: https://cbnu-match.vercel.app/group/join/{token}
[3] 친구가 링크 클릭 → 로그인 후 그룹 자동 가입
[4] 그룹장이 특정 매칭 방에 그룹 전체 참가 신청
[5] 그룹 인원이 팀 정원의 절반을 초과하면 경고 표시
     (밸런싱 알고리즘 제약으로 인한 사전 안내)
```

#### 그룹 제약 사항

- 하나의 그룹은 하나의 매칭에만 동시 참가 가능
- 그룹 해산 시 개인 참가로 전환 가능
- 그룹 내 팀원 간 강제 분리 금지 (밸런싱 시 동일 팀 배정 우선)
  - 단, 그룹 크기가 팀 정원의 과반을 초과하면 분리 허용 (예외 처리)

---

### 4.6 사후 평가 시스템

#### 매너 온도 평가

- 경기 완료(`COMPLETED`) 상태 전환 후 24시간 이내 평가 가능
- 평가 대상: 같은 매칭에 참가한 상대 팀 전원 (선택적 평가)
- 평가 항목:
  - 스포츠맨십 👍 / 👎
  - 시간 약속 준수 여부
  - 재매칭 의사 ⭐ (1~5점)
- 결과: `manner_temperature` 필드 누적 평균으로 유저 프로필에 표시

#### 부정 실력자 신고 UI/UX

```
[경기 후 참가자 목록 화면]

┌─────────────────────────────────────┐
│ 함께한 플레이어                       │
├─────────────────────────────────────┤
│ 🟢 이민준 (아마추어3)    [❤️ 매너] [!] │
│ 🟢 김수아 (루키)         [❤️ 매너] [!] │
│ 🟢 박현우 (세미프로2)    [❤️ 매너]     │  ← 신고 없음 (정상)
│ 🟢 정다은 (아마추어5)    [❤️ 매너] [!] │
└─────────────────────────────────────┘

[!] 버튼 클릭 시:
  → "부정 실력자 신고"
  → 신고 사유 선택: 
      ① 실제 실력이 티어보다 훨씬 높음
      ② 실제 실력이 티어보다 훨씬 낮음
  → 제출 (익명 처리)
```

**핵심 UX 원칙**:
- 강제 팝업 없음 (자발적 선택)
- 신고 버튼([!])은 매너 평가와 **분리된 독립 버튼**
- 신고는 해당 매칭에서 **1인당 1회**만 가능

---

## 5. 데이터 무결성 및 제재 로직

### 신고 누적 기반 제재 시스템

악의적인 집단 테러 신고를 방지하고, 실제 데이터 이상을 정확히 감지하기 위한 다층 방어 로직.

#### 1단계: 신고 집계 및 신뢰도 점수 산정

```
신고 신뢰도 점수 = Σ (신고자의 매너 온도 × 가중치) / 전체 신고 수

가중치 기준:
  - 신고자 매너 온도 > 80°: 가중치 1.5
  - 신고자 매너 온도 50~80°: 가중치 1.0
  - 신고자 매너 온도 < 50°: 가중치 0.3 (저신뢰 신고자)
```

#### 2단계: 자동 검토 트리거 조건

| 조건 | 트리거 결과 |
|------|-------------|
| 단일 매칭에서 3명 이상 신고 | 자동 플래그 → 관리자 검토 큐 |
| 30일 내 누적 신뢰도 신고 점수 ≥ 10 | 경고 이메일 발송 + 관리자 알림 |
| 30일 내 누적 신뢰도 신고 점수 ≥ 20 | 자동 티어 1단계 강등 (예: 아마추어4 → 아마추어3) |
| 60일 내 강등 후 재발 | 티어 재등록 잠금 7일 + 관리자 최종 판단 |
| 신고자 자신의 신고 피신고 비율 > 80% | 해당 신고자 신뢰도 가중치 0으로 설정 |

#### 3단계: 집단 테러 방지 로직

```
동일 매칭 내 신고 검증:
  IF 해당 매칭에서 피신고자의 신고 비율 > 50%:
    → 집단 신고 의심 플래그 설정
    → 자동 티어 강등 보류
    → 관리자 수동 검토 요청

크로스 매칭 검증:
  IF 동일 신고자가 7일 내 3명 이상에게 신고:
    → 해당 신고자의 최근 30일 신고 가중치 0.1로 패널티
```

#### 4단계: 관리자 검토 및 최종 처리

- `/admin` 대시보드에서 신고 케이스 목록 확인
- 매칭 로그, 참가자 티어 이력, 신고 패턴 시각화
- 관리자 액션:
  - 티어 강제 조정 (상향/하향)
  - 계정 일시 정지 (7일 / 30일)
  - 신고 무효화

---

## 6. DB 스키마 초안

### ERD 요약

```
users ──< user_sport_tiers
  │
  ├──< group_members >── groups ──< match_groups >── matches
  │                                                     │
  ├──< match_participants >─────────────────────────────┤
  │                                                     │
  └──< reviews ──────────────────────────────────────────┘
        │
        └──< fraud_reports
```

---

### 테이블 정의

#### `departments` — 학과 목록

```sql
CREATE TABLE departments (
  id          SERIAL PRIMARY KEY,
  college     TEXT NOT NULL,          -- 단과대학명 (예: 공과대학)
  name        TEXT NOT NULL UNIQUE,   -- 학과명 (예: 컴퓨터공학과)
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

---

#### `users` — 사용자

```sql
CREATE TABLE users (
  id                UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name              TEXT NOT NULL,
  student_id        VARCHAR(10) NOT NULL UNIQUE,  -- 학번
  department_id     INTEGER REFERENCES departments(id),
  email             TEXT NOT NULL UNIQUE,          -- @chungbuk.ac.kr
  email_verified    BOOLEAN NOT NULL DEFAULT false,
  manner_temperature NUMERIC(4,1) NOT NULL DEFAULT 36.5, -- 매너 온도
  role              TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'admin')),
  is_active         BOOLEAN NOT NULL DEFAULT true,
  suspended_until   TIMESTAMPTZ,                  -- 계정 정지 만료 시각
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

---

#### `sport_categories` — 스포츠 종목

```sql
CREATE TABLE sport_categories (
  id          SERIAL PRIMARY KEY,
  name        TEXT NOT NULL UNIQUE,   -- 예: 축구, 풋살, 농구
  icon        TEXT,                   -- 아이콘 키
  team_size   INTEGER NOT NULL,       -- 팀당 인원
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

---

#### `user_sport_tiers` — 유저별 종목 티어

```sql
CREATE TABLE user_sport_tiers (
  id            SERIAL PRIMARY KEY,
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  sport_id      INTEGER NOT NULL REFERENCES sport_categories(id),
  tier_name     TEXT NOT NULL CHECK (tier_name IN (
                  'rookie',
                  'amateur_1','amateur_2','amateur_3','amateur_4','amateur_5',
                  'semipro_1','semipro_2','semipro_3',
                  'pro'
                )),
  tier_score    INTEGER NOT NULL,    -- 내부 점수 (0~100)
  is_locked     BOOLEAN NOT NULL DEFAULT false, -- 티어 재등록 잠금 여부
  locked_until  TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, sport_id)
);
```

---

#### `matches` — 매칭 방

```sql
CREATE TABLE matches (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sport_id        INTEGER NOT NULL REFERENCES sport_categories(id),
  title           TEXT NOT NULL,
  location        TEXT,
  scheduled_at    TIMESTAMPTZ NOT NULL,
  max_participants INTEGER NOT NULL,     -- 총 인원 (예: 12명 = 6vs6)
  status          TEXT NOT NULL DEFAULT 'OPEN' CHECK (status IN (
                    'OPEN','FULL','BALANCING','CONFIRMED',
                    'IN_PROGRESS','COMPLETED','REVIEWED','CANCELLED'
                  )),
  host_user_id    UUID NOT NULL REFERENCES users(id),
  team_a_score    INTEGER,              -- 경기 결과
  team_b_score    INTEGER,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

---

#### `match_participants` — 매칭 참가자 및 팀 배정

```sql
CREATE TABLE match_participants (
  id            SERIAL PRIMARY KEY,
  match_id      UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  group_id      UUID REFERENCES groups(id),    -- 그룹 참가 시
  team          TEXT CHECK (team IN ('A', 'B', NULL)), -- 밸런싱 후 배정
  tier_snapshot INTEGER NOT NULL,              -- 참가 시점 티어 점수 스냅샷
  joined_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (match_id, user_id)
);
```

---

#### `groups` — 그룹

```sql
CREATE TABLE groups (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  host_user_id  UUID NOT NULL REFERENCES users(id),
  invite_token  TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(16), 'hex'),
  is_active     BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

---

#### `group_members` — 그룹 멤버십

```sql
CREATE TABLE group_members (
  id        SERIAL PRIMARY KEY,
  group_id  UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  user_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (group_id, user_id)
);
```

---

#### `reviews` — 사후 평가

```sql
CREATE TABLE reviews (
  id                SERIAL PRIMARY KEY,
  match_id          UUID NOT NULL REFERENCES matches(id),
  reviewer_id       UUID NOT NULL REFERENCES users(id),
  reviewee_id       UUID NOT NULL REFERENCES users(id),
  sportsmanship     BOOLEAN,              -- 스포츠맨십 👍/👎
  punctuality       BOOLEAN,              -- 시간 약속
  rematch_score     INTEGER CHECK (rematch_score BETWEEN 1 AND 5),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (match_id, reviewer_id, reviewee_id),
  CHECK (reviewer_id <> reviewee_id)
);
```

---

#### `fraud_reports` — 부정 실력자 신고

```sql
CREATE TABLE fraud_reports (
  id              SERIAL PRIMARY KEY,
  match_id        UUID NOT NULL REFERENCES matches(id),
  reporter_id     UUID NOT NULL REFERENCES users(id),
  reported_id     UUID NOT NULL REFERENCES users(id),
  fraud_type      TEXT NOT NULL CHECK (fraud_type IN (
                    'tier_too_high',   -- 실력이 티어보다 훨씬 높음
                    'tier_too_low'     -- 실력이 티어보다 훨씬 낮음
                  )),
  trust_weight    NUMERIC(3,2),        -- 신고자 신뢰도 가중치 (계산 후 저장)
  status          TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
                    'pending', 'under_review', 'upheld', 'dismissed'
                  )),
  admin_note      TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (match_id, reporter_id, reported_id),
  CHECK (reporter_id <> reported_id)
);
```

---

#### `tier_audit_log` — 티어 변경 이력

```sql
CREATE TABLE tier_audit_log (
  id              SERIAL PRIMARY KEY,
  user_id         UUID NOT NULL REFERENCES users(id),
  sport_id        INTEGER NOT NULL REFERENCES sport_categories(id),
  old_tier_score  INTEGER NOT NULL,
  new_tier_score  INTEGER NOT NULL,
  reason          TEXT NOT NULL,   -- 예: 'fraud_report_accumulated', 'admin_manual', 'self_update'
  triggered_by    UUID REFERENCES users(id),  -- 관리자 또는 시스템(NULL)
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

---

### RLS (Row Level Security) 정책 요약

```sql
-- users: 본인 프로필만 수정 가능
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_select_all" ON users FOR SELECT USING (true);
CREATE POLICY "users_update_own" ON users FOR UPDATE USING (auth.uid() = id);

-- fraud_reports: 신고자 본인만 조회, 관리자는 전체
CREATE POLICY "fraud_reports_reporter_only" ON fraud_reports
  FOR SELECT USING (reporter_id = auth.uid() OR
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

-- reviews: 같은 매칭 참가자만 작성 가능
CREATE POLICY "reviews_insert_participant" ON reviews
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM match_participants
      WHERE match_id = reviews.match_id AND user_id = auth.uid()
    )
  );
```

---

## 7. 엣지 케이스

| # | 상황 | 처리 방식 |
|---|------|-----------|
| E-01 | 홀수 인원으로 매칭 시작 시 | 매칭 방 생성 시 최대 인원을 짝수로만 설정 가능하도록 강제 |
| E-02 | 그룹 크기 > 팀 인원의 50% | 경고 표시, 그룹 분리 동의 후 참가 허용 |
| E-03 | 모든 참가자가 동일 티어 | Snake Draft 유지, 점수 차 = 0 (이미 균형) |
| E-04 | 1명의 프로 + 나머지 루키 | 프로를 A팀 배정 후 Snake Draft 적용 (Snake Draft 특성상 자동 처리) |
| E-05 | 매칭 CONFIRMED 후 노쇼 | 호스트가 경기 강제 취소 가능, 노쇼 유저에게 경고 누적 |
| E-06 | 동일 유저가 같은 매칭에 중복 참가 | `UNIQUE (match_id, user_id)` DB 제약으로 차단 |
| E-07 | 이메일 인증 전 매칭 참가 시도 | `/auth/verify`로 리다이렉트, 참가 불가 |
| E-08 | 자기 자신을 신고 시도 | `CHECK (reporter_id <> reported_id)` DB 제약으로 차단 |
| E-09 | 24시간 초과 후 평가 시도 | 평가 기간 만료 안내, DB에서 `completed_at + 24h` 검증 |
| E-10 | 계정 정지 상태에서 매칭 참가 | `suspended_until > now()` 확인 후 차단 및 안내 |
| E-11 | 요즘것들 사이트 접속 불가 | iframe 오류 감지 → 직접 링크 버튼으로 fallback |

---

## 8. 배포 전략

### 환경 구성

| 환경 | Branch | URL | 용도 |
|------|--------|-----|------|
| Development | `dev` | localhost:3000 | 로컬 개발 |
| Staging | `staging` | staging.cbnu-match.vercel.app | QA 및 기능 검증 |
| Production | `main` | cbnu-match.vercel.app | 실제 서비스 |

### 배포 파이프라인

```
코드 Push
  → GitHub Actions (Lint + Type Check + Unit Test)
  → Vercel Preview Deploy (PR 단위)
  → QA 검토
  → `main` 머지 → Vercel Production Deploy (자동)
```

### 환경 변수 관리 (Vercel)

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=      # Server Actions 전용, 클라이언트 노출 금지
NEXT_PUBLIC_APP_URL=
```

### DB 마이그레이션 전략

- Supabase CLI `supabase db push` + 마이그레이션 파일 버전 관리
- `supabase/migrations/` 디렉토리에 날짜 기반 SQL 파일 관리
- Production 스키마 변경은 반드시 `staging` 검증 후 적용

### 모니터링

- Vercel Analytics: 페이지뷰, Web Vitals
- Supabase Dashboard: DB 쿼리 성능, RLS 위반 로그
- Sentry (선택): 런타임 에러 추적

---

## 9. Task.md — 개발 마일스톤 체크리스트

```markdown
# CBNU Match — 개발 Task 체크리스트

## 마일스톤 1: 프로젝트 기반 세팅 (Foundation)

- [ ] Next.js + TypeScript + Tailwind CSS + Shadcn/UI 초기 설정
- [ ] Supabase 프로젝트 생성 및 환경 변수 설정 (.env.local)
- [ ] Supabase 클라이언트 유틸 파일 작성 (lib/supabase/client.ts, server.ts)
- [ ] 폴더 구조 설계 (app/, components/, lib/, types/, hooks/)
- [ ] ESLint + Prettier + Husky 설정
- [ ] GitHub 레포지토리 생성 및 브랜치 전략 수립 (main, dev, feature/*)
- [ ] Vercel 프로젝트 연결 및 환경 변수 등록
- [ ] 전역 레이아웃 및 폰트 적용 (app/layout.tsx)

## 마일스톤 2: DB 스키마 및 인증 (Auth & Schema)

- [ ] Supabase 마이그레이션 파일 작성 (departments, users, sport_categories, user_sport_tiers)
- [ ] 매칭/평가 관련 테이블 마이그레이션 (matches, match_participants, groups, group_members, reviews, fraud_reports, tier_audit_log)
- [ ] 충북대학교 전체 학과 시드 데이터 작성 (seed_departments.sql)
- [ ] 스포츠 종목 시드 데이터 작성 (soccer, futsal, basketball, bowling, esports)
- [ ] RLS 정책 전체 적용 및 검증
- [ ] 회원가입 화면 구현 (/auth/signup)
  - [ ] 학과 드롭다운 (departments 테이블 연동)
  - [ ] 학번 형식 검증 (10자리)
  - [ ] 이메일 @chungbuk.ac.kr 도메인 강제
  - [ ] Supabase Auth 이메일 인증 연동
- [ ] 로그인 화면 구현 (/auth/login)
- [ ] 이메일 인증 대기 화면 (/auth/verify)
- [ ] 인증 미완료 시 리다이렉트 미들웨어 (middleware.ts)

## 마일스톤 3: 핵심 화면 및 카테고리 (Core UI)

- [ ] 홈 화면 구현 (/home) — 스포츠 / 공모전 카드 2개만 노출
- [ ] 스포츠 목록 화면 (/sports) — 5개 종목 카드 그리드
- [ ] 공모전 허브 화면 (/contest) — 요즘것들 iframe/외부 링크 연동
- [ ] 마이페이지 (/profile) — 티어 설정, 기본 정보 수정
- [ ] 티어 선택 컴포넌트 (TierSelector) — 종목별 독립 설정
- [ ] 전역 네비게이션 바 (NavigationBar)
- [ ] 공통 UI 컴포넌트 작성 (Button, Card, Badge, Modal, Toast)

## 마일스톤 4: 매칭 시스템 (Matching Core)

- [ ] 매칭 방 생성 화면 (/sports/create) — 종목, 장소, 일시, 인원 설정
- [ ] 매칭 목록 화면 (/sports/[id]) — OPEN 상태 방 목록
- [ ] 매칭 대기실 화면 (/sports/[id]/lobby) — 실시간 참가자 현황 (Supabase Realtime)
- [ ] 전력 밸런싱 알고리즘 구현 (lib/matching/balanceTeams.ts)
  - [ ] Snake Draft 핵심 로직 구현
  - [ ] 그룹 우선 배정 로직 구현
  - [ ] 단위 테스트 작성 (Jest)
- [ ] 팀 배정 결과 화면 (/sports/[id]/teams)
- [ ] 매칭 상태 머신 전환 로직 (Server Actions)
- [ ] 그룹 생성 및 초대 링크 발급 (/group/create)
- [ ] 그룹 초대 수락 화면 (/group/join/[token])
- [ ] 그룹 단위 매칭 참가 기능

## 마일스톤 5: 사후 평가 및 신고 시스템 (Review & Report)

- [ ] 경기 후 참가자 목록 화면 (/match/[id]/review)
  - [ ] 매너 평가 UI (스포츠맨십, 시간 약속, 재매칭 점수)
  - [ ] 부정 실력자 신고 [!] 버튼 구현 (선택적, 비강제)
  - [ ] 신고 사유 선택 모달 (tier_too_high / tier_too_low)
- [ ] 신고 누적 집계 로직 (Supabase Edge Function 또는 Server Action)
  - [ ] 신고자 신뢰도 가중치 계산
  - [ ] 자동 티어 강등 트리거 로직
  - [ ] 집단 테러 감지 로직
- [ ] 매너 온도 업데이트 로직
- [ ] 경고 이메일 발송 연동 (Supabase Edge Function + Resend)

## 마일스톤 6: 관리자 및 데이터 무결성 (Admin & Integrity)

- [ ] 관리자 대시보드 (/admin)
  - [ ] 신고 케이스 목록 및 상세 보기
  - [ ] 티어 강제 조정 기능
  - [ ] 계정 정지 기능 (7일 / 30일)
  - [ ] 신고 무효화 기능
- [ ] 관리자 권한 미들웨어 (role = 'admin' 검증)
- [ ] 티어 변경 이력 (tier_audit_log) 조회 화면
- [ ] 신고 패턴 시각화 차트 (Recharts 또는 Chart.js)

## 마일스톤 7: QA, 최적화 및 배포 (Polish & Deploy)

- [ ] 반응형 UI 전체 검증 (모바일 / 태블릿 / 데스크톱)
- [ ] Lighthouse 성능 점수 90+ 달성
- [ ] 에러 바운더리 및 로딩 스켈레톤 적용
- [ ] Supabase RLS 보안 테스트 (비인가 접근 차단 확인)
- [ ] E2E 테스트 작성 (Playwright — 회원가입, 매칭 참가, 평가 플로우)
- [ ] Staging 환경 전체 QA 통과
- [ ] Production 배포 (main 브랜치 머지)
- [ ] 배포 후 모니터링 세팅 (Vercel Analytics, Sentry)
- [ ] 초기 사용자 유입을 위한 충북대 커뮤니티 홍보 준비
```

---

*본 문서는 초기 버전(v1.0.0)이며, 개발 진행에 따라 지속 업데이트됩니다.*  
*문의: 프로젝트 담당자 → GitHub Issues 또는 팀 채널*
