import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { SPORT_ICONS } from '@/types'

export default async function SportsPage() {
  const supabase = await createClient()
  const { data: sports } = await supabase
    .from('sport_categories')
    .select('*')
    .order('id')

  // 각 종목별 OPEN 매칭 수 조회
  const sportWithCounts = await Promise.all(
    (sports ?? []).map(async (sport) => {
      const { count } = await supabase
        .from('matches')
        .select('*', { count: 'exact', head: true })
        .eq('sport_id', sport.id)
        .eq('status', 'OPEN')
      return { ...sport, openCount: count ?? 0 }
    })
  )

  const sportColors: Record<string, { gradient: string; border: string; text: string }> = {
    soccer:     { gradient: 'from-emerald-500/15 to-green-600/10',   border: 'border-emerald-500/25', text: 'text-emerald-400' },
    futsal:     { gradient: 'from-blue-500/15 to-cyan-600/10',       border: 'border-blue-500/25',    text: 'text-blue-400' },
    basketball: { gradient: 'from-orange-500/15 to-red-500/10',      border: 'border-orange-500/25',  text: 'text-orange-400' },
    bowling:    { gradient: 'from-purple-500/15 to-violet-600/10',   border: 'border-purple-500/25',  text: 'text-purple-400' },
    esports:    { gradient: 'from-indigo-500/15 to-violet-600/10',   border: 'border-indigo-500/25',  text: 'text-indigo-400' },
  }

  return (
    <div className="px-4 py-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-white">스포츠 매칭</h1>
        <p className="text-slate-400 text-sm mt-1">종목을 선택해 매칭을 찾아보세요</p>
      </div>

      <div className="space-y-3">
        {sportWithCounts.map((sport) => {
          const icon = SPORT_ICONS[sport.icon ?? ''] ?? '🏟️'
          const color = sportColors[sport.icon ?? ''] ?? sportColors.soccer

          return (
            <Link key={sport.id} href={`/sports/${sport.id}`} className="block">
              <div className={`relative rounded-2xl p-5 sport-card border bg-gradient-to-r ${color.gradient} ${color.border}`}>
                <div className="flex items-center gap-4">
                  <div className="text-4xl">{icon}</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg font-bold text-white">{sport.name}</h2>
                      {sport.openCount > 0 ? (
                        <span className="px-2.5 py-1 rounded-lg text-xs font-semibold status-open">
                          {sport.openCount}개 모집 중
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-500 bg-slate-800/50 border border-slate-700/50">
                          대기 중
                        </span>
                      )}
                    </div>
                    <p className={`text-sm mt-0.5 ${color.text}`}>
                      팀당 {sport.team_size}명
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          )
        })}
      </div>

      {/* 매칭 만들기 버튼 */}
      <div className="mt-6">
        <Link
          href="/sports/create"
          className="block w-full py-3.5 rounded-2xl text-center font-bold text-white btn-glow"
          style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}
        >
          + 매칭 방 만들기
        </Link>
      </div>
    </div>
  )
}
