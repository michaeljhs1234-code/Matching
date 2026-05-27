'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Users, MapPin, Clock, ChevronLeft, Loader2, Zap, LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import TierBadge from '@/components/common/TierBadge'
import StatusBadge from '@/components/common/StatusBadge'
import { TierName, TIER_MAP } from '@/types'
import { MatchStatus } from '@/types/database'
import { formatDate } from '@/lib/utils'
import { balanceTeams } from '@/lib/matching/balanceTeams'

interface ParticipantDisplay {
  id: number
  user_id: string
  tier_snapshot: number
  team: 'A' | 'B' | null
  users: { name: string } | null
  user_sport_tiers: { tier_name: string }[]
}

interface MatchData {
  id: string
  title: string
  location: string | null
  scheduled_at: string
  max_participants: number
  status: MatchStatus
  host_user_id: string
  sport_categories: { name: string; icon: string | null } | null
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

export default function MatchLobbyPage() {
  const params = useParams()
  const router = useRouter()
  const matchId = params.matchId as string
  const sportId = params.sportId as string

  const [match, setMatch] = useState<MatchData | null>(null)
  const [participants, setParticipants] = useState<ParticipantDisplay[]>([])
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [isJoined, setIsJoined] = useState(false)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)

  const fetchData = useCallback(async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) setCurrentUserId(user.id)

    const [matchRes, participantsRes] = await Promise.all([
      supabase.from('matches').select('*, sport_categories(name, icon)').eq('id', matchId).single(),
      supabase.from('match_participants').select('*, users(name)').eq('match_id', matchId).order('joined_at'),
    ])

    if (matchRes.data) setMatch(matchRes.data as any)
    if (participantsRes.data) {
      setParticipants(participantsRes.data as any)
      if (user) setIsJoined(participantsRes.data.some((p) => p.user_id === user.id))
    }
    setLoading(false)
  }, [matchId])

  useEffect(() => {
    fetchData()
    const supabase = createClient()

    // Realtime 구독
    const channel = supabase
      .channel(`match-lobby-${matchId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'match_participants',
        filter: `match_id=eq.${matchId}`,
      }, () => { fetchData() })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'matches',
        filter: `id=eq.${matchId}`,
      }, (payload) => {
        setMatch((prev) => prev ? { ...prev, ...payload.new } as any : null)
        // 팀 배정 완료 시 자동 이동
        if (payload.new.status === 'CONFIRMED') {
          router.push(`/sports/${sportId}/teams/${matchId}`)
        }
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [matchId, sportId, fetchData, router])

  const handleJoin = async () => {
    if (!currentUserId) { router.push('/login'); return }
    setActionLoading(true)
    const supabase = createClient()

    // 내 티어 조회
    const { data: myTier } = await supabase
      .from('user_sport_tiers')
      .select('tier_score')
      .eq('user_id', currentUserId)
      .eq('sport_id', match?.sport_categories ? sportId : sportId)
      .single()

    const { error } = await (supabase.from('match_participants') as any).insert({
      match_id: matchId,
      user_id: currentUserId,
      tier_snapshot: myTier?.tier_score ?? 0,
    })

    if (!error) {
      // 정원 달성 시 FULL 상태로 변경
      if (participants.length + 1 >= (match?.max_participants ?? 0)) {
        await supabase.from('matches').update({ status: 'FULL' }).eq('id', matchId)
      }
      setIsJoined(true)
    }
    setActionLoading(false)
  }

  const handleLeave = async () => {
    if (!currentUserId) return
    setActionLoading(true)
    const supabase = createClient()
    await supabase.from('match_participants').delete().eq('match_id', matchId).eq('user_id', currentUserId)

    // FULL → OPEN 롤백
    if (match?.status === 'FULL') {
      await supabase.from('matches').update({ status: 'OPEN' }).eq('id', matchId)
    }
    setIsJoined(false)
    setActionLoading(false)
  }

  const handleStartBalancing = async () => {
    if (!match) return
    setActionLoading(true)
    const supabase = createClient()

    // 밸런싱 알고리즘 실행
    const participantData = participants.map((p) => ({
      userId: p.user_id,
      tierScore: p.tier_snapshot,
    }))

    const { teamA, teamB } = balanceTeams(participantData)

    // 팀 배정 업데이트
    const updates = [
      ...teamA.map((p) => ({ match_id: matchId, user_id: p.userId, team: 'A' as const })),
      ...teamB.map((p) => ({ match_id: matchId, user_id: p.userId, team: 'B' as const })),
    ]

    await Promise.all(
      updates.map((u) =>
        supabase.from('match_participants').update({ team: u.team }).eq('match_id', u.match_id).eq('user_id', u.user_id)
      )
    )
    await supabase.from('matches').update({ status: 'CONFIRMED' }).eq('id', matchId)

    router.push(`/sports/${sportId}/teams/${matchId}`)
    setActionLoading(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-dvh">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
      </div>
    )
  }

  if (!match) return <div className="p-6 text-center text-slate-400">매칭을 찾을 수 없습니다.</div>

  const isHost = currentUserId === match.host_user_id
  const participantCount = participants.length
  const maxCount = match.max_participants
  const isFull = participantCount >= maxCount
  const canBalance = isHost && isFull && match.status === 'FULL'

  return (
    <div className="px-4 py-6 max-w-2xl mx-auto">
      {/* 뒤로가기 */}
      <div className="flex items-center gap-3 mb-5">
        <Link href={`/sports/${sportId}`} className="p-2 rounded-xl glass border border-white/5 text-slate-400 hover:text-white">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-black text-white truncate">{match.title}</h1>
          <div className="flex items-center gap-2 mt-0.5">
            <StatusBadge status={match.status} />
            {isHost && <span className="text-xs text-yellow-400 bg-yellow-400/10 px-2 py-0.5 rounded-lg border border-yellow-400/20">방장</span>}
          </div>
        </div>
      </div>

      {/* 매칭 정보 */}
      <div className="glass-elevated rounded-2xl p-4 mb-4 border border-white/5">
        <div className="grid grid-cols-2 gap-3 text-sm">
          {match.location && (
            <div className="flex items-center gap-2 text-slate-400">
              <MapPin className="w-4 h-4 text-indigo-400 flex-shrink-0" />
              <span className="truncate">{match.location}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-slate-400">
            <Clock className="w-4 h-4 text-indigo-400 flex-shrink-0" />
            <span className="truncate text-xs">{formatDate(match.scheduled_at)}</span>
          </div>
          <div className="flex items-center gap-2 col-span-2">
            <Users className="w-4 h-4 text-indigo-400 flex-shrink-0" />
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-slate-400">{participantCount} / {maxCount}명</span>
                <span className={`text-xs font-bold ${isFull ? 'text-yellow-400' : 'text-green-400'}`}>
                  {isFull ? '정원 마감' : `${maxCount - participantCount}명 남음`}
                </span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${(participantCount / maxCount) * 100}%`,
                    background: isFull ? 'linear-gradient(90deg, #eab308, #f97316)' : 'linear-gradient(90deg, #4f46e5, #7c3aed)',
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 참가자 목록 */}
      <div className="glass-elevated rounded-2xl p-4 mb-4 border border-white/5">
        <h3 className="text-sm font-bold text-white mb-3">참가자 ({participantCount}명)</h3>
        <div className="space-y-2">
          {participants.map((p) => {
            const tierName = getTierName(p.tier_snapshot)
            const isMe = p.user_id === currentUserId
            return (
              <div key={p.id} className="flex items-center justify-between py-2 border-b border-slate-800/50 last:border-0">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-xs font-bold text-white">
                    {(p as any).users?.name?.[0] ?? '?'}
                  </div>
                  <span className="text-sm text-white">
                    {(p as any).users?.name ?? '알 수 없음'}
                    {isMe && <span className="text-indigo-400 text-xs ml-1">(나)</span>}
                    {p.user_id === match.host_user_id && <span className="text-yellow-400 text-xs ml-1">👑</span>}
                  </span>
                </div>
                <TierBadge tier={tierName} size="xs" />
              </div>
            )
          })}

          {participantCount === 0 && (
            <div className="text-center py-4 text-slate-500 text-sm">
              아직 참가자가 없습니다
            </div>
          )}
        </div>
      </div>

      {/* 액션 버튼 */}
      <div className="space-y-3">
        {/* 방장 전용: 밸런싱 시작 */}
        {canBalance && (
          <button
            onClick={handleStartBalancing}
            disabled={actionLoading}
            className="w-full py-3.5 rounded-2xl font-bold text-white btn-glow flex items-center justify-center gap-2 disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #059669, #10b981)' }}
          >
            {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
            팀 밸런싱 시작
          </button>
        )}

        {/* 참가 / 나가기 버튼 */}
        {match.status === 'OPEN' || match.status === 'FULL' ? (
          isJoined ? (
            <button
              onClick={handleLeave}
              disabled={actionLoading}
              className="w-full py-3.5 rounded-2xl font-semibold border border-red-500/30 text-red-400 hover:bg-red-500/10 flex items-center justify-center gap-2 disabled:opacity-50 transition-all"
            >
              {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
              매칭 나가기
            </button>
          ) : !isFull ? (
            <button
              onClick={handleJoin}
              disabled={actionLoading}
              className="w-full py-3.5 rounded-2xl font-bold text-white btn-glow flex items-center justify-center gap-2 disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}
            >
              {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Users className="w-4 h-4" />}
              참가하기
            </button>
          ) : (
            <div className="text-center py-3 text-slate-400 text-sm">정원이 가득 찼습니다</div>
          )
        ) : null}

        {match.status === 'CONFIRMED' && (
          <Link
            href={`/sports/${sportId}/teams/${matchId}`}
            className="block w-full py-3.5 rounded-2xl font-bold text-center text-white btn-glow"
            style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}
          >
            팀 배정 결과 보기
          </Link>
        )}
      </div>
    </div>
  )
}
