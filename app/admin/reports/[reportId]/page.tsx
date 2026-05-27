import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, ShieldAlert } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import ReportProcessForm from './ReportProcessForm'

interface Props {
  params: Promise<{ reportId: string }>
}

export default async function ReportDetailPage({ params }: Props) {
  const { reportId } = await params
  const supabase = await createClient()

  // 권한 체크
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  // 신고 상세 정보
  const { data: report } = await supabase
    .from('fraud_reports')
    .select(`
      *,
      reporter:users!reporter_id(name, student_id, manner_temperature),
      reported:users!reported_id(name, student_id, manner_temperature),
      match:matches(title, scheduled_at, sport_categories(name))
    `)
    .eq('id', parseInt(reportId, 10))
    .single()

  if (!report) notFound()

  // 이 매치에서의 신고 대상자의 티어 스냅샷 가져오기
  const { data: participantInfo } = await supabase
    .from('match_participants')
    .select('tier_snapshot')
    .eq('match_id', report.match_id)
    .eq('user_id', report.reported_id)
    .single()

  return (
    <div className="min-h-dvh bg-[#0a0a0f] text-white p-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/admin" className="p-2 rounded-xl glass hover:bg-white/10 transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-red-500" />
            <h1 className="text-2xl font-black">신고 상세 내역</h1>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* 피신고자 정보 */}
          <div className="glass rounded-2xl p-6 border border-red-500/20">
            <h3 className="text-sm font-bold text-red-400 mb-4">피신고자 (대상)</h3>
            <div className="space-y-2">
              <p className="text-xl font-bold">{(report.reported as any)?.name}</p>
              <p className="text-sm text-slate-400">학번: {(report.reported as any)?.student_id}</p>
              <p className="text-sm text-slate-400">매너 온도: {(report.reported as any)?.manner_temperature}°C</p>
              <div className="mt-4 p-3 bg-red-500/10 rounded-lg">
                <p className="text-xs text-slate-400 mb-1">당시 참가 티어 점수</p>
                <p className="font-mono text-red-300 font-bold">{participantInfo?.tier_snapshot ?? '알 수 없음'}</p>
              </div>
            </div>
          </div>

          {/* 신고자 정보 */}
          <div className="glass rounded-2xl p-6 border border-indigo-500/20">
            <h3 className="text-sm font-bold text-indigo-400 mb-4">신고자</h3>
            <div className="space-y-2">
              <p className="text-xl font-bold">{(report.reporter as any)?.name}</p>
              <p className="text-sm text-slate-400">학번: {(report.reporter as any)?.student_id}</p>
              <p className="text-sm text-slate-400">매너 온도: {(report.reporter as any)?.manner_temperature}°C</p>
              <div className="mt-4 p-3 bg-indigo-500/10 rounded-lg flex items-center justify-between">
                <span className="text-xs text-slate-400">신뢰도 가중치</span>
                <span className="font-mono text-indigo-300 font-bold">{report.trust_weight}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 매치 및 신고 내용 */}
        <div className="glass rounded-2xl p-6 border border-white/10 mb-6">
          <h3 className="text-lg font-bold mb-4">신고 정보</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-3 border-b border-white/10 pb-4">
              <span className="text-slate-400 text-sm">해당 매치</span>
              <span className="col-span-2 font-medium">
                [{(report.match as any)?.sport_categories?.name}] {(report.match as any)?.title} 
                <span className="text-slate-500 text-xs ml-2">({formatDate((report.match as any)?.scheduled_at)})</span>
              </span>
            </div>
            <div className="grid grid-cols-3 border-b border-white/10 pb-4">
              <span className="text-slate-400 text-sm">신고 사유</span>
              <span className="col-span-2 font-bold text-red-400">
                {report.fraud_type === 'tier_too_high' ? '티어 과대평가 (실제 실력이 훨씬 낮음)' : '양학 의심 (티어 낮게 설정함)'}
              </span>
            </div>
            <div className="grid grid-cols-3 pb-2">
              <span className="text-slate-400 text-sm">접수일</span>
              <span className="col-span-2 text-sm text-slate-300">{formatDate(report.created_at)}</span>
            </div>
          </div>
        </div>

        {/* 처리 폼 (클라이언트 컴포넌트) */}
        {report.status === 'pending' || report.status === 'under_review' ? (
          <ReportProcessForm reportId={report.id} currentStatus={report.status} />
        ) : (
          <div className="glass rounded-2xl p-6 border border-white/10 text-center">
            <h3 className="font-bold mb-2">
              {report.status === 'upheld' ? <span className="text-red-500">승인(제재) 완료된 신고입니다.</span> : <span className="text-slate-500">반려 처리된 신고입니다.</span>}
            </h3>
            {report.admin_note && (
              <div className="mt-4 p-4 bg-white/5 rounded-xl text-sm text-left">
                <span className="text-slate-400 block mb-1">관리자 메모:</span>
                {report.admin_note}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  )
}
