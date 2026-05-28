import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, Calendar, MapPin, Users, MessageCircle, Star } from 'lucide-react'
import MatchChat from './MatchChat'

interface Props {
  params: Promise<{ matchId: string }>
}

export default async function MatchDetailPage({ params }: Props) {
  const { matchId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // 매치 정보
  const { data: match } = await supabase
    .from('matches')
    .select('id, title, location, scheduled_at, max_participants, status, host_user_id, sport_categories(name, icon)')
    .eq('id', matchId)
    .single()

  if (!match) notFound()

  // 내 프로필
  const { data: myProfile } = await (supabase as any)
    .from('users')
    .select('name')
    .eq('id', user.id)
    .single()

  // 참가자 목록
  const { data: participants } = await supabase
    .from('match_participants')
    .select('user_id, team, users(name)')
    .eq('match_id', matchId)

  const isParticipant = participants?.some((p) => p.user_id === user.id) || match.host_user_id === user.id
  const participantCount = participants?.length ?? 0
  const sport = (match as any).sport_categories

  const statusLabel: Record<string, { label: string; color: string }> = {
    OPEN: { label: '모집 중', color: '#22c55e' },
    FULL: { label: '마감', color: '#f59e0b' },
    BALANCING: { label: '밸런싱', color: '#818cf8' },
    CONFIRMED: { label: '확정', color: '#4f46e5' },
    IN_PROGRESS: { label: '진행 중', color: '#06b6d4' },
    COMPLETED: { label: '완료', color: '#64748b' },
    REVIEWED: { label: '평가 완료', color: '#64748b' },
    CANCELLED: { label: '취소됨', color: '#ef4444' },
  }

  const status = statusLabel[match.status] ?? { label: match.status, color: '#64748b' }

  const formatDate = (iso: string) => {
    const d = new Date(iso)
    return d.toLocaleString('ko-KR', {
      month: 'long',
      day: 'numeric',
      weekday: 'short',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="px-4 py-6 max-w-2xl mx-auto">
      {/* 헤더 */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/sports" className="p-2 rounded-xl glass border border-white/5 text-slate-400 hover:text-white">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-black text-white truncate">{match.title}</h1>
          <p className="text-slate-400 text-sm">{sport?.icon} {sport?.name}</p>
        </div>
        <span
          className="px-3 py-1 rounded-full text-xs font-bold flex-shrink-0"
          style={{ background: `${status.color}20`, color: status.color, border: `1px solid ${status.color}40` }}
        >
          {status.label}
        </span>
      </div>

      {/* 매치 정보 카드 */}
      <div className="glass-elevated rounded-2xl p-5 border border-white/5 mb-5 space-y-3">
        <div className="flex items-center gap-3 text-sm text-slate-300">
          <Calendar className="w-4 h-4 text-indigo-400 flex-shrink-0" />
          <span>{formatDate(match.scheduled_at)}</span>
        </div>
        {match.location && (
          <div className="flex items-center gap-3 text-sm text-slate-300">
            <MapPin className="w-4 h-4 text-violet-400 flex-shrink-0" />
            <span>{match.location}</span>
          </div>
        )}
        <div className="flex items-center gap-3 text-sm text-slate-300">
          <Users className="w-4 h-4 text-cyan-400 flex-shrink-0" />
          <span>
            {participantCount} / {match.max_participants}명 참가 중
          </span>
          <div
            className="flex-1 h-1.5 rounded-full overflow-hidden"
            style={{ background: 'rgba(255,255,255,0.06)' }}
          >
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${Math.min((participantCount / match.max_participants) * 100, 100)}%`,
                background: 'linear-gradient(90deg, #4f46e5, #7c3aed)',
              }}
            />
          </div>
        </div>
      </div>

      {/* 평가 링크 (완료된 매치) */}
      {(match.status === 'COMPLETED' || match.status === 'REVIEWED') && isParticipant && (
        <Link
          href={`/match/${matchId}/review`}
          className="flex items-center gap-2 p-4 rounded-xl mb-5 text-sm font-semibold transition-all"
          style={{
            background: 'linear-gradient(135deg, rgba(79,70,229,0.15), rgba(124,58,237,0.1))',
            border: '1px solid rgba(79,70,229,0.3)',
            color: '#818cf8',
          }}
        >
          <Star className="w-4 h-4" />
          사후 평가 하러 가기
          <ChevronLeft className="w-4 h-4 rotate-180 ml-auto" />
        </Link>
      )}

      {/* 채팅 섹션 */}
      {isParticipant ? (
        <div
          className="glass-elevated rounded-2xl border border-white/5 overflow-hidden"
          style={{ height: '480px', display: 'flex', flexDirection: 'column' }}
        >
          <MatchChat
            matchId={matchId}
            currentUserId={user.id}
            currentUserName={myProfile?.name ?? '나'}
          />
        </div>
      ) : (
        <div
          className="rounded-2xl p-6 text-center"
          style={{ background: 'rgba(15,15,26,0.5)', border: '1px solid rgba(255,255,255,0.05)' }}
        >
          <MessageCircle className="w-10 h-10 text-slate-600 mx-auto mb-2" />
          <p className="text-slate-400 text-sm">매치 참가자만 채팅에 접근할 수 있습니다.</p>
        </div>
      )}
    </div>
  )
}
