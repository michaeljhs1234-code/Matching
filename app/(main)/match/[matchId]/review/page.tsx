import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import ReviewForm from './ReviewForm'

interface Props {
  params: Promise<{ matchId: string }>
}

export default async function MatchReviewPage({ params }: Props) {
  const { matchId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // 매치 정보 가져오기
  const { data: match } = await supabase
    .from('matches')
    .select('title, status')
    .eq('id', matchId)
    .single()

  if (!match) notFound()

  // 이 매치에 참가한 사람들 가져오기
  const { data: participants } = await supabase
    .from('match_participants')
    .select('user_id, team, users(name, student_id)')
    .eq('match_id', matchId)

  if (!participants) notFound()

  const isParticipant = participants.some(p => p.user_id === user.id)
  if (!isParticipant) {
    return (
      <div className="px-4 py-6 text-center text-slate-400">
        참여한 매치만 평가할 수 있습니다.
      </div>
    )
  }

  // 내가 평가해야 할 사람들 (나를 제외한 나머지 팀원/상대팀)
  const others = participants.filter(p => p.user_id !== user.id)

  // 이미 내가 남긴 평가 내역 가져오기
  const { data: myReviews } = await supabase
    .from('reviews')
    .select('reviewee_id')
    .eq('match_id', matchId)
    .eq('reviewer_id', user.id)
    
  const reviewedIds = new Set(myReviews?.map(r => r.reviewee_id) || [])

  // 이미 내가 남긴 신고 내역 가져오기
  const { data: myReports } = await supabase
    .from('fraud_reports')
    .select('reported_id')
    .eq('match_id', matchId)
    .eq('reporter_id', user.id)
    
  const reportedIds = new Set(myReports?.map(r => r.reported_id) || [])

  return (
    <div className="px-4 py-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/home" className="p-2 rounded-xl glass border border-white/5 text-slate-400 hover:text-white">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl font-black text-white">사후 평가</h1>
          <p className="text-slate-400 text-sm">{match.title}</p>
        </div>
      </div>

      <div className="space-y-6">
        {others.map((other) => {
          const hasReviewed = reviewedIds.has(other.user_id)
          const hasReported = reportedIds.has(other.user_id)

          return (
            <div key={other.user_id} className="glass-elevated rounded-2xl p-5 border border-white/5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center font-bold text-white">
                  {(other as any).users?.name?.[0] ?? '?'}
                </div>
                <div>
                  <h3 className="font-bold text-white">{(other as any).users?.name}</h3>
                  <p className="text-xs text-slate-400">{other.team}팀</p>
                </div>
                {hasReviewed && (
                  <span className="ml-auto text-xs font-semibold text-green-400 bg-green-400/10 px-2 py-1 rounded-lg border border-green-400/20">
                    평가 완료
                  </span>
                )}
              </div>

              {!hasReviewed ? (
                <ReviewForm 
                  matchId={matchId} 
                  revieweeId={other.user_id} 
                  hasReported={hasReported}
                />
              ) : (
                <p className="text-sm text-slate-500 text-center py-2">
                  이 참가자에 대한 평가를 이미 마쳤습니다.
                </p>
              )}
            </div>
          )
        })}

        {others.length === 0 && (
          <div className="text-center py-10 text-slate-400">
            평가할 다른 참가자가 없습니다.
          </div>
        )}
      </div>
    </div>
  )
}
