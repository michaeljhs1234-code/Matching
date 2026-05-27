import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { MapPin, Clock, Users, Plus } from 'lucide-react'
import StatusBadge from '@/components/common/StatusBadge'
import TierBadge from '@/components/common/TierBadge'
import { SPORT_ICONS, TierName } from '@/types'
import { MatchStatus } from '@/types/database'
import { formatDateShort } from '@/lib/utils'

interface Props {
  params: Promise<{ sportId: string }>
}

export default async function SportMatchListPage({ params }: Props) {
  const { sportId } = await params
  const supabase = await createClient()

  const { data: sport } = await supabase
    .from('sport_categories')
    .select('*')
    .eq('id', sportId)
    .single()

  if (!sport) notFound()

  const { data: matches } = await supabase
    .from('matches')
    .select(`
      *,
      match_participants(count)
    `)
    .eq('sport_id', sportId)
    .in('status', ['OPEN', 'FULL', 'CONFIRMED', 'IN_PROGRESS'])
    .order('scheduled_at', { ascending: true })
    .limit(30)

  const icon = SPORT_ICONS[sport.icon ?? ''] ?? '🏟️'

  return (
    <div className="px-4 py-6 max-w-2xl mx-auto">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="text-4xl">{icon}</div>
          <div>
            <h1 className="text-xl font-black text-white">{sport.name}</h1>
            <p className="text-slate-400 text-sm">팀당 {sport.team_size}명</p>
          </div>
        </div>
        <Link
          href="/sports/create"
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white btn-glow"
          style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}
        >
          <Plus className="w-4 h-4" />
          방 만들기
        </Link>
      </div>

      {/* 매칭 목록 */}
      {(!matches || matches.length === 0) ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🏟️</div>
          <h2 className="text-lg font-bold text-white mb-2">모집 중인 매칭이 없어요</h2>
          <p className="text-slate-400 text-sm mb-6">첫 번째로 매칭을 만들어보세요!</p>
          <Link
            href="/sports/create"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white btn-glow"
            style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}
          >
            <Plus className="w-4 h-4" />
            매칭 만들기
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {matches.map((match) => {
            const participantCount = (match as any).match_participants?.[0]?.count ?? 0
            const isFull = participantCount >= match.max_participants

            return (
              <Link key={match.id} href={`/sports/${sportId}/lobby/${match.id}`} className="block">
                <div className="glass-elevated rounded-2xl p-4 border border-white/5 hover:border-indigo-500/20 transition-all sport-card">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <h3 className="font-bold text-white text-sm flex-1 leading-tight">{match.title}</h3>
                    <StatusBadge status={match.status as MatchStatus} />
                  </div>

                  <div className="flex flex-wrap gap-3 text-xs text-slate-400">
                    {match.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        {match.location}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {formatDateShort(match.scheduled_at)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" />
                      <span className={isFull ? 'text-red-400' : 'text-green-400'}>
                        {participantCount} / {match.max_participants}명
                      </span>
                    </span>
                  </div>

                  {/* 참가 현황 바 */}
                  <div className="mt-3 w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${(participantCount / match.max_participants) * 100}%`,
                        background: isFull
                          ? 'linear-gradient(90deg, #eab308, #f97316)'
                          : 'linear-gradient(90deg, #4f46e5, #7c3aed)',
                      }}
                    />
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
