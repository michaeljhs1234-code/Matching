import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, Shield, Flame } from 'lucide-react'
import TierBadge from '@/components/common/TierBadge'
import { TierName, TIER_MAP } from '@/types'

interface Props {
  params: Promise<{ sportId: string; matchId: string }>
}

function getTierName(score: number): TierName {
  const scores = [0, 10, 20, 30, 40, 50, 65, 75, 85, 100]
  const names: TierName[] = ['rookie', 'amateur_1', 'amateur_2', 'amateur_3', 'amateur_4', 'amateur_5', 'semipro_1', 'semipro_2', 'semipro_3', 'pro']
  let closest = 0
  let minDiff = Math.abs(score - scores[0])
  for (let i = 1; i < scores.length; i++) {
    const diff = Math.abs(score - scores[i])
    if (diff < minDiff) { minDiff = diff; closest = i }
  }
  return names[closest]
}

export default async function TeamsPage({ params }: Props) {
  const { sportId, matchId } = await params
  const supabase = await createClient()

  const { data: match } = await supabase
    .from('matches')
    .select('*, sport_categories(name)')
    .eq('id', matchId)
    .single()

  if (!match) notFound()

  const { data: participants } = await supabase
    .from('match_participants')
    .select('*, users(name)')
    .eq('match_id', matchId)
    .order('tier_snapshot', { ascending: false })

  const teamA = (participants ?? []).filter((p) => p.team === 'A')
  const teamB = (participants ?? []).filter((p) => p.team === 'B')
  const sumA = teamA.reduce((s, p) => s + p.tier_snapshot, 0)
  const sumB = teamB.reduce((s, p) => s + p.tier_snapshot, 0)
  const scoreDiff = Math.abs(sumA - sumB)

  return (
    <div className="px-4 py-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link href={`/sports/${sportId}/lobby/${matchId}`} className="p-2 rounded-xl glass border border-white/5 text-slate-400 hover:text-white">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl font-black text-white">팀 배정 결과</h1>
          <p className="text-slate-400 text-sm">{match.title}</p>
        </div>
      </div>

      {/* 점수 균형 표시 */}
      <div className="glass-elevated rounded-2xl p-4 mb-5 border border-white/5 text-center">
        <div className="flex items-center justify-center gap-2 mb-1">
          <Shield className="w-5 h-5 text-green-400" />
          <span className="text-sm font-semibold text-white">전력 밸런스</span>
        </div>
        <div className="flex items-center justify-center gap-4 mt-2">
          <div>
            <p className="text-2xl font-black text-indigo-400">{sumA}</p>
            <p className="text-xs text-slate-400">A팀 합계</p>
          </div>
          <div className="text-slate-600 font-bold">vs</div>
          <div>
            <p className="text-2xl font-black text-violet-400">{sumB}</p>
            <p className="text-xs text-slate-400">B팀 합계</p>
          </div>
        </div>
        <div className="mt-2 flex items-center justify-center gap-1">
          <Flame className="w-3.5 h-3.5 text-yellow-400" />
          <span className="text-xs text-slate-400">점수 차이: </span>
          <span className={`text-xs font-bold ${scoreDiff === 0 ? 'text-green-400' : scoreDiff <= 10 ? 'text-yellow-400' : 'text-orange-400'}`}>
            {scoreDiff}점 {scoreDiff === 0 ? '(완벽한 균형! ✨)' : ''}
          </span>
        </div>
      </div>

      {/* 양 팀 표시 */}
      <div className="grid grid-cols-2 gap-3">
        {/* A팀 */}
        <div className="glass-elevated rounded-2xl p-4 border border-indigo-500/20">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-xs font-black text-white">A</div>
            <span className="font-bold text-white text-sm">팀</span>
          </div>
          <div className="space-y-2">
            {teamA.map((p) => {
              const tierName = getTierName(p.tier_snapshot)
              return (
                <div key={p.id} className="flex items-center justify-between">
                  <span className="text-sm text-white truncate flex-1 mr-1">
                    {(p as any).users?.name ?? '?'}
                  </span>
                  <TierBadge tier={tierName} size="xs" />
                </div>
              )
            })}
          </div>
          <div className="mt-3 pt-3 border-t border-slate-700/50">
            <p className="text-xs text-center font-bold text-indigo-400">합계: {sumA}점</p>
          </div>
        </div>

        {/* B팀 */}
        <div className="glass-elevated rounded-2xl p-4 border border-violet-500/20">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg bg-violet-600 flex items-center justify-center text-xs font-black text-white">B</div>
            <span className="font-bold text-white text-sm">팀</span>
          </div>
          <div className="space-y-2">
            {teamB.map((p) => {
              const tierName = getTierName(p.tier_snapshot)
              return (
                <div key={p.id} className="flex items-center justify-between">
                  <span className="text-sm text-white truncate flex-1 mr-1">
                    {(p as any).users?.name ?? '?'}
                  </span>
                  <TierBadge tier={tierName} size="xs" />
                </div>
              )
            })}
          </div>
          <div className="mt-3 pt-3 border-t border-slate-700/50">
            <p className="text-xs text-center font-bold text-violet-400">합계: {sumB}점</p>
          </div>
        </div>
      </div>

      <div className="mt-5 p-4 rounded-xl bg-green-500/5 border border-green-500/20 text-center">
        <p className="text-sm text-green-400 font-medium">🎮 경기 준비 완료!</p>
        <p className="text-xs text-slate-400 mt-1">약속 시간에 모여 즐거운 경기를 진행하세요.</p>
      </div>
    </div>
  )
}
