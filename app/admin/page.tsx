import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Shield, AlertCircle, CheckCircle, Clock } from 'lucide-react'
import { formatDate } from '@/lib/utils'

export default async function AdminDashboardPage() {
  const supabase = await createClient()

  // 관리자 권한은 proxy.ts에서 이미 검사했으나 한 번 더 확인용 데이터 페칭을 할 수도 있음.
  // 여기서는 단순히 전체 통계와 미처리 신고 목록을 가져옵니다.

  // 1. 신고 현황 데이터 페치
  const { data: reports } = await supabase
    .from('fraud_reports')
    .select(`
      id,
      fraud_type,
      trust_weight,
      status,
      created_at,
      reporter:users!reporter_id(name, student_id),
      reported:users!reported_id(name, student_id)
    `)
    .order('created_at', { ascending: false })
    .limit(50)

  const pendingCount = reports?.filter(r => r.status === 'pending').length ?? 0
  const upheldCount = reports?.filter(r => r.status === 'upheld').length ?? 0
  const dismissedCount = reports?.filter(r => r.status === 'dismissed').length ?? 0

  return (
    <div className="min-h-dvh bg-[#0a0a0f] text-white p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Shield className="w-8 h-8 text-indigo-500" />
          <h1 className="text-3xl font-black">관리자 대시보드</h1>
        </div>

        {/* 요약 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="glass rounded-2xl p-6 border border-white/10">
            <div className="flex items-center gap-2 mb-2 text-slate-400">
              <Clock className="w-5 h-5 text-yellow-500" />
              <h3 className="font-semibold text-sm">대기 중인 신고</h3>
            </div>
            <p className="text-4xl font-black text-white">{pendingCount}건</p>
          </div>
          <div className="glass rounded-2xl p-6 border border-white/10">
            <div className="flex items-center gap-2 mb-2 text-slate-400">
              <CheckCircle className="w-5 h-5 text-red-500" />
              <h3 className="font-semibold text-sm">승인됨 (제재)</h3>
            </div>
            <p className="text-4xl font-black text-white">{upheldCount}건</p>
          </div>
          <div className="glass rounded-2xl p-6 border border-white/10">
            <div className="flex items-center gap-2 mb-2 text-slate-400">
              <AlertCircle className="w-5 h-5 text-green-500" />
              <h3 className="font-semibold text-sm">반려됨 (허위 신고)</h3>
            </div>
            <p className="text-4xl font-black text-white">{dismissedCount}건</p>
          </div>
        </div>

        {/* 신고 목록 테이블 */}
        <div className="glass rounded-2xl border border-white/10 overflow-hidden">
          <div className="px-6 py-4 border-b border-white/10 bg-white/5">
            <h2 className="text-lg font-bold">최근 접수된 부정 실력자 신고</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-black/20 text-slate-400">
                <tr>
                  <th className="px-6 py-4 font-semibold">신고일</th>
                  <th className="px-6 py-4 font-semibold">피신고자</th>
                  <th className="px-6 py-4 font-semibold">신고자 (가중치)</th>
                  <th className="px-6 py-4 font-semibold">사유</th>
                  <th className="px-6 py-4 font-semibold">상태</th>
                  <th className="px-6 py-4 font-semibold text-right">관리</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {reports?.map((report) => (
                  <tr key={report.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 text-slate-400">{formatDate(report.created_at)}</td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-white">{(report.reported as any)?.name}</span>
                      <span className="text-xs text-slate-500 block">{(report.reported as any)?.student_id}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-slate-300">{(report.reporter as any)?.name}</span>
                      <span className="ml-2 text-xs px-2 py-1 rounded bg-indigo-500/20 text-indigo-300">
                        WT: {report.trust_weight}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {report.fraud_type === 'tier_too_high' ? (
                        <span className="text-red-400">실력 미달 (티어 높음)</span>
                      ) : (
                        <span className="text-orange-400">양학 의심 (티어 낮음)</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {report.status === 'pending' && <span className="text-yellow-400 font-semibold">대기중</span>}
                      {report.status === 'upheld' && <span className="text-red-400 font-semibold">승인됨</span>}
                      {report.status === 'dismissed' && <span className="text-slate-500 font-semibold">반려됨</span>}
                      {report.status === 'under_review' && <span className="text-blue-400 font-semibold">검토중</span>}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link 
                        href={`/admin/reports/${report.id}`}
                        className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-xs font-semibold"
                      >
                        상세 보기
                      </Link>
                    </td>
                  </tr>
                ))}

                {!reports?.length && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                      접수된 신고가 없습니다.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
