import { Participant, BalancedTeams } from '@/types'

/**
 * 전력 밸런싱 알고리즘 — Snake Draft
 *
 * 1. 참가자를 tierScore 내림차순으로 정렬
 * 2. Snake Draft 방식으로 팀 A·B에 번갈아 배정
 *    - 짝수 라운드: A → B
 *    - 홀수 라운드: B → A
 * 3. 그룹 멤버는 같은 팀에 우선 배정 (groupId 동일 시)
 */
export function balanceTeams(
  participants: Participant[],
  _teamSize?: number
): BalancedTeams {
  if (participants.length === 0) {
    return { teamA: [], teamB: [], scoreDiff: 0 }
  }

  // 그룹 멤버 분리
  const grouped = new Map<string, Participant[]>()
  const ungrouped: Participant[] = []

  for (const p of participants) {
    if (p.groupId) {
      if (!grouped.has(p.groupId)) grouped.set(p.groupId, [])
      grouped.get(p.groupId)!.push(p)
    } else {
      ungrouped.push(p)
    }
  }

  // 그룹 블록을 평균 점수 기준으로 정렬
  const groupBlocks = Array.from(grouped.values()).map((members) => ({
    members,
    avgScore: members.reduce((s, m) => s + m.tierScore, 0) / members.length,
  }))
  groupBlocks.sort((a, b) => b.avgScore - a.avgScore)

  // 개인 참가자는 점수 내림차순 정렬
  ungrouped.sort((a, b) => b.tierScore - a.tierScore)

  const teamA: Participant[] = []
  const teamB: Participant[] = []

  // 그룹 블록 먼저 Snake Draft 배정
  groupBlocks.forEach((block, idx) => {
    const round = Math.floor(idx / 2)
    const isEvenRound = round % 2 === 0
    const posInRound = idx % 2

    const target =
      isEvenRound
        ? posInRound === 0 ? teamA : teamB
        : posInRound === 0 ? teamB : teamA

    target.push(...block.members)
  })

  // 개인 참가자 Snake Draft 배정
  ungrouped.forEach((player, idx) => {
    const round = Math.floor(idx / 2)
    const isEvenRound = round % 2 === 0
    const posInRound = idx % 2

    if (isEvenRound) {
      posInRound === 0 ? teamA.push(player) : teamB.push(player)
    } else {
      posInRound === 0 ? teamB.push(player) : teamA.push(player)
    }
  })

  const sumA = teamA.reduce((s, p) => s + p.tierScore, 0)
  const sumB = teamB.reduce((s, p) => s + p.tierScore, 0)

  return { teamA, teamB, scoreDiff: Math.abs(sumA - sumB) }
}
