# Product Requirements Document (PRD)
## 충북대학교 커뮤니티 기반 스포츠·공모전 매칭 시스템

---

| 항목 | 내용 |
|------|------|
| **문서 버전** | v1.0.0 |
| **작성일** | 2026-05-28 |
| **상태** | Draft |
| **작성자** | Product Team |
| **기술 스택** | Next.js 15 (App Router) · TypeScript · Supabase (Postgres + Auth) · Tailwind CSS · Shadcn/UI · React Query / Server Actions · Vercel |

---

## 목차

1. [개요 및 배경](#1-개요-및-배경)
2. [목표 지표 (Success Metrics)](#2-목표-지표-success-metrics)
3. [사용자 페르소나](#3-사용자-페르소나)
4. [사용자 스토리](#4-사용자-스토리)
5. [화면 목록 (Screen Inventory)](#5-화면-목록-screen-inventory)
6. [기능 명세](#6-기능-명세)
   - 6.1 인증 및 계정 관리
   - 6.2 홈 화면 및 카테고리 구조
   - 6.3 티어(실력) 시스템
   - 6.4 전력 밸런싱 매칭 알고리즘
   - 6.5 팀(그룹) 기능
   - 6.6 사후 평가 시스템
7. [데이터 무결성 및 제재 로직](#7-데이터-무결성-및-제재-로직)
8. [DB 스키마 초안](#8-db-스키마-초안)
9. [비기능 요구사항](#9-비기능-요구사항)
10. [엣지 케이스](#10-엣지-케이스)
11. [배포 전략](#11-배포-전략)

---

## 1. 개요 및 배경

### 문제 정의

충북대학교 학생들은 교내 스포츠 활동이나 공모전 팀원을 구할 때 에브리타임 자유게시판, 카카오톡 단체채팅방, 지인 네트워크에 전적으로 의존한다.

| 문제 | 영향 |
|------|------|
| 실력 불균형 팀 구성 | 일방적 경기 → 재미 저하 → 참여율 감소 |
| 팀원 신뢰도 부재 | 노쇼(No-show), 실력 허위 기재 |
| 공모전 정보 분산 | 접수 마감일 놓침, 팀 구성 지연 |
| 체계적 매칭 시스템 부재 | 매칭 과정이 반복적으로 개인 역량에만 의존 |

### 솔루션

**충북대 재학생 전용 인증(학교 이메일)** 기반의 스포츠·공모전 매칭 플랫폼을 구축한다.

핵심 차별점은 **전력 밸런싱 알고리즘**으로, 참여자들의 티어를 양 팀에 균등 분배하여 공정하고 재미있는 경기 환경을 보장한다.

### 서비스 범위

- **포함**: 스포츠 매칭, 공모전 정보 연동 및 팀원 모집
- **제외 (v1.0)**: 자격증 스터디, 전공 스터디 매칭

---

## 2. 목표 지표 (Success Metrics)

| 지표 | 목표 | 측정 방법 |
|------|------|-----------|
| 월간 활성 사용자(MAU) | 런칭 3개월 내 300명 | Vercel Analytics |
| 매칭 완료율 | 생성된 매칭의 80% 이상 실제 경기 진행 | `matches.status = COMPLETED` 비율 |
| 부정 신고 티어 조정 정확도 | 90% 이상 | 관리자 검토 후 upheld 판정 비율 |
| 이메일 인증 전환율 | 가입 시작 대비 70% 이상 인증 완료 | Auth 이벤트 로그 |

---

## 3. 사용자 페르소나

| ID | 유형 | 이름 | 학년/학과 | 목표 | 불편 사항 |
|----|------|------|-----------|------|-----------|
| P1 | 캐주얼 스포츠인 | 이민준 | 3학년 / 컴퓨터공학과 | 수업 후 가볍게 풋살 | 인원 모으기 귀찮음, 실력 차이가 너무 남 |
| P2 | 공모전 팀장 | 김수아 | 2학년 / 경영학과 | 디자인 전공 팀원 필요 | 적합한 사람 찾기 어려움, 공모전 정보 분산 |
| P3 | 스포츠 고수 | 박현우 | 4학년 / 체육교육과 | 수준 맞는 경기 원함 | 초보와 섞여 게임이 되지 않음 |

---

## 4. 사용자 스토리

```
[US-01] 회원가입
  As a  충북대 재학생,
  I want 학번과 학교 이메일로 가입하고 싶다.
  So that 재학생만 이용 가능한 신뢰도 높은 커뮤니티에 접근할 수 있다.
  Acceptance Criteria:
    - @chungbuk.ac.kr 도메인 이메일만 허용
    - 학번 8자리 형식 검증
    - 이메일 인증 링크 발송 및 확인 후 가입 완료

[US-02] 스포츠 매칭 참가
  As a  스포츠 활동을 원하는 학생,
  I want 내 티어를 설정하고 매칭에 참가하고 싶다.
  So that 비슷한 실력의 사람들과 균형 잡힌 팀으로 경기할 수 있다.
  Acceptance Criteria:
    - 종목별 티어 선택 가능
    - 정원이 찰 때 자동으로 팀 밸런싱 실행
    - 팀 배정 결과를 대기실에서 실시간 확인 가능

[US-03] 팀(그룹) 구성
  As a  친구와 함께 참가하려는 학생,
  I want 그룹을 만들어 친구를 초대한 후 함께 매칭에 등록하고 싶다.
  So that 친구와 같은 팀에 배정될 가능성을 높일 수 있다.
  Acceptance Criteria:
    - 초대 링크 생성 및 공유 가능
    - 그룹 단위 매칭 참가 기능
    - 그룹 멤버가 팀 정원 과반 초과 시 경고 표시

[US-04] 공모전 정보 확인
  As a  공모전에 관심 있는 학생,
  I want 현재 접수 중인 공모전 목록을 한 곳에서 보고 싶다.
  So that 마감 기한을 놓치지 않고 팀원을 구할 수 있다.
  Acceptance Criteria:
    - 요즘것들 플랫폼 연동으로 실시간 공모전 정보 제공
    - "팀원 구하기" 버튼으로 내부 모집 게시판 연결

[US-05] 사후 평가 (매너 온도)
  As a  경기를 마친 참가자,
  I want 함께 플레이한 사람에 대해 선택적으로 평가하고 싶다.
  So that 플랫폼의 데이터 신뢰도가 유지된다.
  Acceptance Criteria:
    - 경기 종료 후 24시간 이내 평가 가능
    - 강제 팝업 없이 선택적 평가
    - 평가 결과가 매너 온도에 반영

[US-06] 부정 실력자 신고
  As a  티어를 속인 유저를 만난 학생,
  I want 강제 팝업 없이 유저 목록에서 해당 사람만 선택해 신고하고 싶다.
  So that 불필요한 UI 없이 빠르게 신고하고 플랫폼 데이터 무결성을 지킬 수 있다.
  Acceptance Criteria:
    - 참가자 목록 옆 [!] 버튼으로 선택적 신고
    - 1인당 동일 매칭에 1회만 신고 가능
    - 신고는 익명으로 처리
```

---

## 5. 화면 목록 (Screen Inventory)

| ID | 화면명 | 라우트 경로 | 인증 필요 | 비고 |
|----|--------|-------------|-----------|------|
| S-01 | 랜딩 페이지 | `/` | ❌ | 서비스 소개, CTA |
| S-02 | 회원가입 | `/auth/signup` | ❌ | 다단계 폼 |
| S-03 | 로그인 | `/auth/login` | ❌ | |
| S-04 | 이메일 인증 대기 | `/auth/verify` | ❌ | 재발송 버튼 포함 |
| S-05 | 홈 (카테고리 선택) | `/home` | ✅ | 스포츠·공모전 2개 카드만 |
| S-06 | 스포츠 목록 | `/sports` | ✅ | 5개 종목 그리드 |
| S-07 | 매칭 방 목록 | `/sports/[sportId]` | ✅ | OPEN 상태 방 필터링 |
| S-08 | 매칭 방 생성 | `/sports/create` | ✅ | 종목·장소·일시·인원 설정 |
| S-09 | 매칭 대기실 | `/sports/[sportId]/lobby/[matchId]` | ✅ | Supabase Realtime |
| S-10 | 팀 밸런싱 결과 | `/sports/[sportId]/teams/[matchId]` | ✅ | A팀·B팀 배정 표시 |
| S-11 | 공모전 허브 | `/contest` | ✅ | 요즘것들 iframe 연동 |
| S-12 | 그룹 생성 | `/group/create` | ✅ | 초대 토큰 발급 |
| S-13 | 그룹 초대 수락 | `/group/join/[token]` | ✅ | 자동 그룹 가입 |
| S-14 | 경기 후 평가 | `/match/[matchId]/review` | ✅ | 매너 평가 + 신고 |
| S-15 | 마이페이지 | `/profile` | ✅ | 티어·정보 수정 |
| S-16 | 유저 프로필 | `/profile/[userId]` | ✅ | 공개 프로필 |
| S-17 | 관리자 대시보드 | `/admin` | ✅ (admin) | 신고 관리·티어 조정 |

---

## 6. 기능 명세

### 6.1 인증 및 계정 관리

#### 회원가입 플로우

```
Step 1  이름 입력
Step 2  학번 입력 (8자리 숫자, 중복 불가)
Step 3  학과 선택 (departments 테이블 드롭다운)
Step 4  학교 이메일 입력 (@chungbuk.ac.kr 강제, 중복 불가)
Step 5  Supabase Auth → 인증 이메일 자동 발송
Step 6  이메일 링크 클릭 → email_verified = true
Step 7  비밀번호 설정 (8자 이상, 영문+숫자+특수문자 포함)
Step 8  종목별 티어 초기 설정 (선택, 이후 마이페이지에서 변경 가능)
```

#### 학과 목록 (departments 테이블 시딩)

충북대학교 공식 홈페이지 기준 전체 단과대학·학과를 `departments` 테이블에 사전 등록한다.

<details>
<summary>학과 목록 예시 (클릭하여 펼치기)</summary>

| 단과대학 | 학과 |
|----------|------|
| 인문대학 | 국어국문학과, 영어영문학과, 독어독문학과, 불어불문학과, 중어중문학과, 사학과, 철학과 |
| 사회과학대학 | 사회학과, 행정학과, 정치외교학과, 심리학과, 경제학과 |
| 경영대학 | 경영학과, 경영정보학과, 회계학과, 무역학과 |
| 자연과학대학 | 수학과, 통계학과, 물리학과, 화학과, 생물학과, 천문우주학과, 지구환경과학과 |
| 공과대학 | 기계공학부, 전기공학부, 정보통신공학부, 컴퓨터공학과, 건축공학과, 토목공학부, 화학공학과, 신소재공학과, 안전공학과 |
| 농업생명환경대학 | 식물자원학과, 축산학과, 원예과학과, 농업경제학과, 환경공학과 |
| 의과대학 | 의학과 |
| 약학대학 | 약학과 |
| 사범대학 | 교육학과, 윤리교육과, 국어교육과, 영어교육과, 수학교육과, 과학교육학부, 사회교육과, 체육교육과 |
| 생활과학대학 | 아동복지학과, 가족복지학과, 식품영양학과, 주거환경학과, 패션디자인정보학과 |
| 예술대학 | 음악학과, 미술학과 |
| 수의과대학 | 수의학과 |

*(전체 목록은 `supabase/seed/seed_departments.sql` 참조)*

</details>

#### 인증 규칙

| 규칙 | 구현 위치 |
|------|-----------|
| `@chungbuk.ac.kr` 도메인만 허용 | 서버 사이드(Server Action) + DB CHECK |
| 학번 8자리 형식 강제 | 클라이언트 정규식 + 서버 검증 |
| 학번 중복 가입 불가 | `student_id UNIQUE` 제약 |
| 이메일 인증 전 핵심 기능 접근 차단 | `middleware.ts` 리다이렉트 |

---

### 6.2 홈 화면 및 카테고리 구조

#### 홈 화면 (`/home`) — 2개 카드만 노출

```
┌──────────────────────────────────┐
│         CBNU MATCH               │
│    충북대학교 매칭 플랫폼         │
├─────────────────┬────────────────┤
│   🏅  스포츠    │   🏆  공모전   │
│    Sports       │    Contest     │
└─────────────────┴────────────────┘

※ 자격증 스터디, 전공 스터디 카드는 v1.0에서 제외
```

#### 스포츠 종목 (`/sports`)

| 종목 | 아이콘 키 | 기본 팀 인원 | 매칭 최소 인원 |
|------|-----------|-------------|---------------|
| 축구 ⚽ | soccer | 11 vs 11 | 22명 |
| 풋살 🥅 | futsal | 5 vs 5 | 10명 |
| 농구 🏀 | basketball | 5 vs 5 | 10명 |
| 볼링 🎳 | bowling | 팀전 설정 가능 | 4명~ |
| e스포츠 🎮 | esports | 5 vs 5 | 10명 |

#### 공모전 허브 (`/contest`)

- **외부 연동**: [요즘것들 (All For Young)](https://www.allforyoung.com/) — 접수 중 공모전 실시간 정보 제공
- **구현 방식**: Next.js `<iframe>` 임베드 (CSP 허용 시) 또는 `window.open()` 외부 링크 방식
- **Fallback**: iframe 로드 실패 시 직접 링크 버튼으로 자동 전환
- **팀원 모집 연동**: "팀원 구하기" 버튼 → 내부 공모전 팀원 모집 게시판으로 라우팅

---

### 6.3 티어(실력) 시스템

#### 티어 체계 (스포츠 종목 공통, 종목별 독립 관리)

| 티어 등급 | 단계 | 내부 점수 | 설명 |
|-----------|------|-----------|------|
| 루키 (Rookie) | 단일 | 0 | 입문자, 기초 규칙 숙지 단계 |
| 아마추어 1 | 1/5 | 10 | 기본기를 갖춘 생활체육인 |
| 아마추어 2 | 2/5 | 20 | |
| 아마추어 3 | 3/5 | 30 | |
| 아마추어 4 | 4/5 | 40 | |
| 아마추어 5 | 5/5 | 50 | 아마추어 최상급 |
| 세미프로 1 | 1/3 | 65 | 준전문가 수준 |
| 세미프로 2 | 2/3 | 75 | |
| 세미프로 3 | 3/3 | 85 | |
| 프로 (Pro) | 단일 | 100 | 전문 선수급 |

#### 티어 운영 원칙

- 티어는 **스포츠 종목별로 독립** 관리 (`user_sport_tiers` 테이블)
- 초기 설정은 **자기 신고(Self-report)** 방식
- 이후 사후 평가 + 신고 누적 데이터를 기반으로 **시스템·관리자가 조정**
- 티어 변경 내역은 전부 `tier_audit_log`에 기록

---

### 6.4 전력 밸런싱 매칭 알고리즘

#### 목표

> 참가자 N명이 매칭에 모였을 때, **양 팀(A·B)의 티어 점수 합계 차이를 최소화**하여 팀을 구성한다.

#### 알고리즘: Greedy Snake Draft

**입력 / 출력 명세**

```
Input:
  participants  : Array<{ userId: string, tierScore: number, groupId?: string }>
  teamSize      : number  // 팀당 인원 (종목별 상이)

Output:
  teamA         : Participant[]
  teamB         : Participant[]
  scoreDiff     : number   // |sum(teamA) - sum(teamB)|
```

**처리 순서**

```
1. 참가자를 tierScore 내림차순 정렬
2. Snake Draft 방식으로 팀 배정
     짝수 라운드: A → B 순으로 배정
     홀수 라운드: B → A 순으로 배정
3. 그룹(Group) 참가자 우선 처리
     - 그룹 전체를 단일 블록으로 간주
     - 블록 대표 점수(평균)로 정렬 후 Snake Draft 적용
     - 그룹 크기가 팀 정원 50% 초과 시 분리 허용 (사전 동의 필요)
```

**TypeScript 구현 (핵심 로직)**

```typescript
// lib/matching/balanceTeams.ts

export interface Participant {
  userId: string;
  tierScore: number;
  groupId?: string;
}

export function balanceTeams(
  participants: Participant[],
  teamSize: number
): { teamA: Participant[]; teamB: Participant[]; scoreDiff: number } {
  // 1. 티어 점수 내림차순 정렬
  const sorted = [...participants].sort((a, b) => b.tierScore - a.tierScore);

  const teamA: Participant[] = [];
  const teamB: Participant[] = [];

  // 2. Snake Draft 배정
  sorted.forEach((player, index) => {
    const round = Math.floor(index / 2);
    const isEvenRound = round % 2 === 0;
    const posInRound = index % 2;

    if (isEvenRound) {
      posInRound === 0 ? teamA.push(player) : teamB.push(player);
    } else {
      posInRound === 0 ? teamB.push(player) : teamA.push(player);
    }
  });

  const sumA = teamA.reduce((acc, p) => acc + p.tierScore, 0);
  const sumB = teamB.reduce((acc, p) => acc + p.tierScore, 0);

  return { teamA, teamB, scoreDiff: Math.abs(sumA - sumB) };
}
```

**매칭 예시 검증**

```
[입력] 참가자 12명
  세미프로2 × 2명 (75점)
  아마추어5 × 2명 (50점)
  아마추어4 × 4명 (40점)
  아마추어1 × 4명 (10점)

[정렬] [75, 75, 50, 50, 40, 40, 40, 40, 10, 10, 10, 10]

[Snake Draft]
  Round 0 (짝수):  75 → A,  75 → B
  Round 1 (홀수):  50 → B,  50 → A
  Round 2 (짝수):  40 → A,  40 → B
  Round 3 (홀수):  40 → B,  40 → A
  Round 4 (짝수):  10 → A,  10 → B
  Round 5 (홀수):  10 → B,  10 → A

[결과]
  팀 A: 75 + 50 + 40 + 40 + 10 + 10 = 225점
  팀 B: 75 + 50 + 40 + 40 + 10 + 10 = 225점
  점수 차: 0점 ✅
```

#### 매칭 방 상태 머신

```
         참가자 모집
  OPEN ──────────────► FULL
    │                    │ 정원 충족
    │ 방장 취소/시간초과  ▼
    └──────────────► BALANCING ─► CONFIRMED ─► IN_PROGRESS ─► COMPLETED ─► REVIEWED
                                      │
                                  CANCELLED (참가자 이탈 / 방장 취소)
```

| 상태 | 설명 |
|------|------|
| `OPEN` | 참가자 모집 중 |
| `FULL` | 정원 충족, 밸런싱 대기 |
| `BALANCING` | 알고리즘 실행 중 (< 1초) |
| `CONFIRMED` | 팀 배정 완료, 참가자 확인 대기 |
| `IN_PROGRESS` | 경기 진행 중 |
| `COMPLETED` | 경기 종료, 평가 가능 (24시간 창) |
| `REVIEWED` | 사후 평가 완료 |
| `CANCELLED` | 취소됨 |

---

### 6.5 팀(그룹) 기능

#### 그룹 생성 및 참가 플로우

```
[1] 그룹 생성
      └─► 고유 초대 토큰 발급 (UUID v4 기반 hex slug)

[2] 초대 링크 공유
      └─► https://cbnu-match.vercel.app/group/join/{token}

[3] 친구가 링크 클릭
      └─► 로그인 확인 → 그룹 자동 가입 (group_members INSERT)

[4] 그룹장이 매칭 방에 그룹 전체 참가 신청
      └─► 그룹 멤버 전원 match_participants에 일괄 등록

[5] 정원 초과 경고 (그룹 인원 > 팀 정원의 50%)
      └─► "분리 동의" 체크 후 참가 허용
```

#### 그룹 제약 사항

- 하나의 그룹은 **하나의 매칭**에만 동시 참가 가능
- 그룹 해산 시 멤버는 **개인 참가**로 자동 전환
- 밸런싱 시 그룹 멤버 **동일 팀 배정 우선** (분리 금지 원칙)
- 단, 그룹 크기가 팀 정원 50% 초과 시 분리 가능 (사전 동의 필수)

---

### 6.6 사후 평가 시스템

#### 매너 온도 평가

| 항목 | 타입 | 설명 |
|------|------|------|
| 스포츠맨십 | Boolean (👍/👎) | 기본적인 스포츠맨십 태도 |
| 시간 약속 준수 | Boolean (👍/👎) | 집합 시간 엄수 여부 |
| 재매칭 의사 | Integer (1~5점) | 다시 같이 하고 싶은 정도 |

- 평가 가능 시간: 경기 `COMPLETED` 전환 후 **24시간 이내**
- 평가 대상: 같은 매칭 참가자 전원 (선택적, 강제 아님)
- 결과: `users.manner_temperature` 누적 평균 반영 (초기값: 36.5)

#### 부정 실력자 신고 UI/UX

```
┌─────────────────────────────────────────┐
│ 함께한 플레이어                           │
├─────────────────────────────────────────┤
│ 🟢 이민준 (아마추어3)   [❤️ 매너]  [!]  │
│ 🟢 김수아 (루키)        [❤️ 매너]  [!]  │
│ 🟢 박현우 (세미프로2)   [❤️ 매너]       │  ← 이미 신고하지 않음
│ 🟢 정다은 (아마추어5)   [❤️ 매너]  [!]  │
└─────────────────────────────────────────┘

[!] 클릭 시 바텀시트 표시:
  ─────────────────────────────
  "이민준 님의 실력 신고"
  ─────────────────────────────
  ○ 실제 실력이 티어보다 훨씬 높음 (실력 과소 신고)
  ○ 실제 실력이 티어보다 훨씬 낮음 (실력 과대 신고)
  ─────────────────────────────
           [신고하기]   [취소]
  ─────────────────────────────
```

**핵심 UX 원칙**

| 원칙 | 구현 방식 |
|------|-----------|
| 강제 팝업 없음 | 경기 종료 후 자동 팝업 금지, 사용자가 [!] 버튼을 직접 클릭해야 신고 가능 |
| 선택적 신고 | 신고할 유저만 개별 선택 (전원 일괄 평가 강제 없음) |
| 독립 버튼 | 매너 평가([❤️])와 신고([!])는 완전히 분리된 독립 액션 |
| 1회 제한 | 동일 매칭 내 동일 유저에 대해 1인당 1회만 신고 가능 |
| 익명 처리 | 피신고자에게 신고자 정보 노출 없음 |

---

## 7. 데이터 무결성 및 제재 로직

### 개요

악의적인 집단 테러 신고를 방지하고, 실제 티어 위반을 정확히 감지하기 위해 **4단계 다층 방어 로직**을 적용한다.

### 1단계 — 신고 신뢰도 점수 산정

```
신고 신뢰도 점수 = Σ (신고자_매너온도 × 가중치) / 전체 신고 수

가중치 기준표:
  신고자 매너 온도 > 80°C  →  가중치 1.5  (고신뢰 신고자)
  신고자 매너 온도 50~80°C  →  가중치 1.0  (기본)
  신고자 매너 온도 < 50°C   →  가중치 0.3  (저신뢰 신고자)
```

### 2단계 — 자동 트리거 조건

| 조건 | 자동 트리거 액션 |
|------|-----------------|
| 단일 매칭 내 3명 이상 신고 | 자동 플래그 설정 → 관리자 검토 큐 진입 |
| 30일 내 누적 신뢰도 점수 ≥ 10 | 경고 이메일 발송 + 관리자 알림 |
| 30일 내 누적 신뢰도 점수 ≥ 20 | 티어 1단계 자동 강등 (예: 아마추어4 → 아마추어3) |
| 강등 후 60일 내 재발 | 티어 재등록 잠금 7일 + 관리자 최종 판단 의뢰 |
| 신고자 피신고 비율 > 80% | 해당 신고자 가중치 0으로 고정 (무력화) |

### 3단계 — 집단 테러 방지 로직

```
[동일 매칭 내 신고 검증]
IF 피신고자를 신고한 인원 / 전체 참가자 > 50%:
  → "집단 신고 의심" 플래그 설정
  → 자동 티어 강등 HOLD
  → 관리자 수동 검토 큐로 이관

[크로스 매칭 신고자 검증]
IF 동일 신고자가 7일 내 3명 이상 서로 다른 유저를 신고:
  → 해당 신고자의 최근 30일 모든 신고 가중치 × 0.1 패널티
```

### 4단계 — 관리자 검토 및 최종 처리

관리자는 `/admin` 대시보드에서 아래 정보를 확인하고 최종 판단을 내린다.

- 신고 케이스 목록 (상태: pending / under_review / upheld / dismissed)
- 매칭 로그 및 참가자 티어 이력 타임라인
- 신고 패턴 시각화 차트

**관리자 액션**

| 액션 | 효과 |
|------|------|
| 티어 강제 조정 | `user_sport_tiers.tier_score` 직접 수정 + `tier_audit_log` 기록 |
| 계정 일시 정지 | `users.suspended_until` 설정 (7일 / 30일 선택) |
| 신고 무효화 | `fraud_reports.status = 'dismissed'` |
| 신고 인정 | `fraud_reports.status = 'upheld'` + 티어 강등 실행 |

---

## 8. DB 스키마 초안

### ERD 개요

```
departments
    │ 1
    │ N
  users ──────────────────────< user_sport_tiers
    │  1                              │ (종목별 독립)
    │  N                        sport_categories
    ├────────────────────────── match_participants
    │                                 │ N
    │                                 │ 1
    ├─────────────────────────────── matches
    │                                 │
    ├──< group_members >── groups ────┘ (match를 통해 연결)
    │
    ├──< reviews (reviewer / reviewee)
    │
    └──< fraud_reports (reporter / reported)
              │
              └── tier_audit_log
```

### 테이블 정의

#### `departments` — 학과 목록

```sql
CREATE TABLE departments (
  id         SERIAL PRIMARY KEY,
  college    TEXT NOT NULL,           -- 단과대학명 (예: 공과대학)
  name       TEXT NOT NULL UNIQUE,    -- 학과명 (예: 컴퓨터공학과)
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

---

#### `users` — 사용자

```sql
CREATE TABLE users (
  id                  UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name                TEXT        NOT NULL,
  student_id          VARCHAR(10) NOT NULL UNIQUE,         -- 충북대 학번 (8자리)
  department_id       INTEGER     REFERENCES departments(id),
  email               TEXT        NOT NULL UNIQUE,          -- @chungbuk.ac.kr
  email_verified      BOOLEAN     NOT NULL DEFAULT false,
  manner_temperature  NUMERIC(4,1) NOT NULL DEFAULT 36.5,   -- 매너 온도 (최소 0, 최대 100)
  role                TEXT        NOT NULL DEFAULT 'student'
                        CHECK (role IN ('student', 'admin')),
  is_active           BOOLEAN     NOT NULL DEFAULT true,
  suspended_until     TIMESTAMPTZ,                          -- NULL이면 정상
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

---

#### `sport_categories` — 스포츠 종목

```sql
CREATE TABLE sport_categories (
  id         SERIAL  PRIMARY KEY,
  name       TEXT    NOT NULL UNIQUE,  -- 예: 축구, 풋살, 농구
  icon       TEXT,                     -- 아이콘 키 (예: soccer)
  team_size  INTEGER NOT NULL,         -- 팀당 인원
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

---

#### `user_sport_tiers` — 유저별 종목 티어

```sql
CREATE TABLE user_sport_tiers (
  id           SERIAL   PRIMARY KEY,
  user_id      UUID     NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  sport_id     INTEGER  NOT NULL REFERENCES sport_categories(id),
  tier_name    TEXT     NOT NULL CHECK (tier_name IN (
                 'rookie',
                 'amateur_1','amateur_2','amateur_3','amateur_4','amateur_5',
                 'semipro_1','semipro_2','semipro_3',
                 'pro'
               )),
  tier_score   INTEGER  NOT NULL CHECK (tier_score BETWEEN 0 AND 100),
  is_locked    BOOLEAN  NOT NULL DEFAULT false,
  locked_until TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, sport_id)
);
```

---

#### `matches` — 매칭 방

```sql
CREATE TABLE matches (
  id               UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  sport_id         INTEGER NOT NULL REFERENCES sport_categories(id),
  title            TEXT    NOT NULL,
  location         TEXT,
  scheduled_at     TIMESTAMPTZ NOT NULL,
  max_participants INTEGER NOT NULL CHECK (max_participants % 2 = 0),  -- 반드시 짝수
  status           TEXT    NOT NULL DEFAULT 'OPEN'
                     CHECK (status IN (
                       'OPEN','FULL','BALANCING','CONFIRMED',
                       'IN_PROGRESS','COMPLETED','REVIEWED','CANCELLED'
                     )),
  host_user_id     UUID    NOT NULL REFERENCES users(id),
  team_a_score     INTEGER,
  team_b_score     INTEGER,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

---

#### `match_participants` — 매칭 참가자 및 팀 배정

```sql
CREATE TABLE match_participants (
  id            SERIAL PRIMARY KEY,
  match_id      UUID    NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  user_id       UUID    NOT NULL REFERENCES users(id)   ON DELETE CASCADE,
  group_id      UUID    REFERENCES groups(id),
  team          TEXT    CHECK (team IN ('A', 'B')),   -- NULL: 밸런싱 전
  tier_snapshot INTEGER NOT NULL,                      -- 참가 시점 tier_score 스냅샷
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
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name         TEXT NOT NULL,
  host_user_id UUID NOT NULL REFERENCES users(id),
  invite_token TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(16), 'hex'),
  is_active    BOOLEAN NOT NULL DEFAULT true,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

---

#### `group_members` — 그룹 멤버십

```sql
CREATE TABLE group_members (
  id        SERIAL PRIMARY KEY,
  group_id  UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  user_id   UUID NOT NULL REFERENCES users(id)  ON DELETE CASCADE,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (group_id, user_id)
);
```

---

#### `reviews` — 사후 평가

```sql
CREATE TABLE reviews (
  id             SERIAL  PRIMARY KEY,
  match_id       UUID    NOT NULL REFERENCES matches(id),
  reviewer_id    UUID    NOT NULL REFERENCES users(id),
  reviewee_id    UUID    NOT NULL REFERENCES users(id),
  sportsmanship  BOOLEAN,                -- 👍 true / 👎 false / NULL 미평가
  punctuality    BOOLEAN,                -- 시간 약속 준수
  rematch_score  INTEGER CHECK (rematch_score BETWEEN 1 AND 5),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (match_id, reviewer_id, reviewee_id),
  CHECK (reviewer_id <> reviewee_id)
);
```

---

#### `fraud_reports` — 부정 실력자 신고

```sql
CREATE TABLE fraud_reports (
  id           SERIAL  PRIMARY KEY,
  match_id     UUID    NOT NULL REFERENCES matches(id),
  reporter_id  UUID    NOT NULL REFERENCES users(id),
  reported_id  UUID    NOT NULL REFERENCES users(id),
  fraud_type   TEXT    NOT NULL CHECK (fraud_type IN (
                 'tier_too_high',  -- 실력이 티어보다 훨씬 높음
                 'tier_too_low'    -- 실력이 티어보다 훨씬 낮음
               )),
  trust_weight NUMERIC(3,2),       -- 신고자 신뢰도 가중치 (계산 후 저장)
  status       TEXT    NOT NULL DEFAULT 'pending'
                 CHECK (status IN ('pending','under_review','upheld','dismissed')),
  admin_note   TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (match_id, reporter_id, reported_id),
  CHECK (reporter_id <> reported_id)
);
```

---

#### `tier_audit_log` — 티어 변경 이력

```sql
CREATE TABLE tier_audit_log (
  id             SERIAL  PRIMARY KEY,
  user_id        UUID    NOT NULL REFERENCES users(id),
  sport_id       INTEGER NOT NULL REFERENCES sport_categories(id),
  old_tier_score INTEGER NOT NULL,
  new_tier_score INTEGER NOT NULL,
  reason         TEXT    NOT NULL,
    -- 'self_update' | 'fraud_report_accumulated' | 'admin_manual' | 'admin_demotion'
  triggered_by   UUID    REFERENCES users(id),  -- NULL이면 시스템 자동
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

---

### RLS (Row Level Security) 정책

```sql
-- ── users ──────────────────────────────────────────────────
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_select_all"  ON users FOR SELECT USING (true);
CREATE POLICY "users_update_own"  ON users FOR UPDATE USING (auth.uid() = id);

-- ── match_participants ─────────────────────────────────────
ALTER TABLE match_participants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "mp_select_all"     ON match_participants FOR SELECT USING (true);
CREATE POLICY "mp_insert_own"     ON match_participants FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ── fraud_reports ──────────────────────────────────────────
ALTER TABLE fraud_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "fr_reporter_or_admin" ON fraud_reports FOR SELECT
  USING (
    reporter_id = auth.uid() OR
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );
CREATE POLICY "fr_insert_participant" ON fraud_reports FOR INSERT
  WITH CHECK (
    reporter_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM match_participants
      WHERE match_id = fraud_reports.match_id AND user_id = auth.uid()
    )
  );

-- ── reviews ────────────────────────────────────────────────
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "reviews_insert_participant" ON reviews FOR INSERT
  WITH CHECK (
    reviewer_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM match_participants
      WHERE match_id = reviews.match_id AND user_id = auth.uid()
    )
  );
```

---

## 9. 비기능 요구사항

| 분류 | 요구사항 | 목표치 |
|------|----------|--------|
| **성능** | 페이지 초기 로드 (LCP) | < 2.5초 |
| **성능** | 밸런싱 알고리즘 실행 시간 | < 500ms (100명 이하) |
| **가용성** | 서비스 업타임 | 99.5% 이상 |
| **보안** | 인증 없는 API 접근 | RLS로 전면 차단 |
| **보안** | SUPABASE_SERVICE_ROLE_KEY | 서버 사이드 전용, 클라이언트 노출 금지 |
| **접근성** | WCAG | AA 수준 준수 |
| **확장성** | DB 인덱스 | 주요 FK 및 `status`, `scheduled_at` 컬럼 인덱스 적용 |
| **모니터링** | 에러 추적 | Sentry 연동 (런타임 에러) |

---

## 10. 엣지 케이스

| ID | 상황 | 처리 방식 |
|----|------|-----------|
| E-01 | 홀수 인원으로 매칭 방 생성 시도 | `max_participants % 2 = 0` DB CHECK로 차단, UI에서도 짝수만 선택 가능 |
| E-02 | 그룹 인원 > 팀 정원의 50% | 경고 토스트 표시 후 "분리 동의" 체크박스 활성화 시 참가 허용 |
| E-03 | 전원 동일 티어 | Snake Draft 정상 작동, 점수 차 = 0 (이미 균형) |
| E-04 | 프로 1명 + 루키 다수 | Snake Draft 특성상 프로가 A팀 1번으로 자동 배정, 나머지 균등 분배 |
| E-05 | CONFIRMED 후 노쇼 | 방장이 경기 강제 취소 가능, 노쇼 유저에게 경고 누적 (3회 시 1주 서비스 이용 제한) |
| E-06 | 동일 유저 중복 참가 시도 | `UNIQUE (match_id, user_id)` DB 제약으로 서버에서 차단, 클라이언트에도 중복 방지 |
| E-07 | 이메일 미인증 상태로 매칭 접근 | `middleware.ts`에서 `/auth/verify`로 리다이렉트 |
| E-08 | 자기 자신 신고 시도 | `CHECK (reporter_id <> reported_id)` DB 제약 + 클라이언트에서 본인 행 [!] 버튼 숨김 |
| E-09 | 24시간 초과 후 평가 API 호출 | Server Action에서 `match.completed_at + 24h` 검증 후 `403` 반환 |
| E-10 | 계정 정지 중 매칭 참가 시도 | `suspended_until > now()` 확인 후 차단, 정지 해제 일시 안내 |
| E-11 | 요즘것들 iframe 로드 실패 | `onError` 이벤트 감지 → 직접 외부 링크 버튼으로 자동 fallback |
| E-12 | 밸런싱 알고리즘 실패 (서버 에러) | 상태를 `FULL`로 롤백, 관리자 알림 발송, 사용자에게 재시도 안내 |

---

## 11. 배포 전략

### 환경 구성

| 환경 | 브랜치 | URL | 목적 |
|------|--------|-----|------|
| Development | `dev` | `localhost:3000` | 로컬 개발 |
| Staging | `staging` | `staging.cbnu-match.vercel.app` | QA 및 기능 검증 |
| Production | `main` | `cbnu-match.vercel.app` | 실제 서비스 |

### CI/CD 파이프라인

```
git push (feature/* → dev)
  │
  ├─► GitHub Actions
  │     ├─ ESLint + TypeScript 타입 체크
  │     ├─ Jest 단위 테스트 (balanceTeams 알고리즘 포함)
  │     └─ Playwright E2E 테스트 (Staging 환경)
  │
  └─► Vercel
        ├─ PR 단위: Preview Deploy (자동)
        └─ main 머지: Production Deploy (자동)
```

### 환경 변수

```env
# 클라이언트 노출 가능 (NEXT_PUBLIC_)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_APP_URL=

# 서버 전용 (절대 클라이언트 노출 금지)
SUPABASE_SERVICE_ROLE_KEY=
```

### DB 마이그레이션 전략

```
supabase/
  migrations/
    20260528_001_initial_schema.sql
    20260528_002_rls_policies.sql
    20260528_003_seed_departments.sql
    20260528_004_seed_sport_categories.sql
```

- `supabase db push`로 버전 관리
- Production 스키마 변경은 **반드시 Staging 검증 후** 적용
- 롤백 플랜: 각 마이그레이션 파일에 `DOWN` 스크립트 병기

### 모니터링 스택

| 도구 | 용도 |
|------|------|
| Vercel Analytics | 페이지뷰, Web Vitals (LCP, FID, CLS) |
| Supabase Dashboard | DB 쿼리 성능, RLS 위반 로그, 실시간 연결 수 |
| Sentry | 런타임 에러 추적, 알림 |

---

*본 PRD는 v1.0.0 초안이며, 스프린트 진행에 따라 지속 업데이트됩니다.*  
*관련 문서: [requirement.md](./requirement.md) · [task.md](./task.md)*
