import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Settings, LogOut } from 'lucide-react'
import TierBadge from '@/components/common/TierBadge'
import { TIER_MAP, TIER_LIST, TierName, SPORT_ICONS } from '@/types'
import { getMannerColor, getMannerLabel } from '@/lib/utils'

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users')
    .select(`
      *,
      departments(name, college)
    `)
    .eq('id', user.id)
    .single()

  const { data: tiers } = await supabase
    .from('user_sport_tiers')
    .select('*, sport_categories(name, icon)')
    .eq('user_id', user.id)

  const { data: sports } = await supabase
    .from('sport_categories')
    .select('*')
    .order('id')

  const mannerTemp = profile?.manner_temperature ?? 36.5
  const mannerColor = getMannerColor(mannerTemp)
  const mannerLabel = getMannerLabel(mannerTemp)

  return (
    <div className="px-4 py-6 max-w-2xl mx-auto">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-black text-white">프로필</h1>
        <form action="/signout" method="POST">
          <button
            formAction={async () => {
              'use server'
              const supabase2 = await createClient()
              await supabase2.auth.signOut()
              redirect('/login')
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl glass border border-red-500/20 text-red-400 hover:text-red-300 text-xs transition-all"
          >
            <LogOut className="w-3.5 h-3.5" />
            로그아웃
          </button>
        </form>
      </div>

      {/* 프로필 카드 */}
      <div className="glass-elevated rounded-2xl p-6 mb-4 border border-white/5">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-2xl font-black text-white flex-shrink-0">
            {profile?.name?.[0] ?? '?'}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold text-white">{profile?.name}</h2>
            <p className="text-slate-400 text-sm">{profile?.student_id}</p>
            <p className="text-slate-500 text-xs mt-0.5">
              {(profile as any)?.departments?.college} · {(profile as any)?.departments?.name}
            </p>
          </div>
        </div>

        {/* 매너 온도 */}
        <div className="mt-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-300">매너 온도</span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold" style={{ color: mannerColor }}>{mannerTemp}°C</span>
              <span className="text-xs text-slate-400">{mannerLabel}</span>
            </div>
          </div>
          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${Math.min(mannerTemp, 100)}%`,
                background: `linear-gradient(90deg, #ef4444, #eab308, #22c55e)`,
              }}
            />
          </div>
        </div>
      </div>

      {/* 종목별 티어 */}
      <div className="glass-elevated rounded-2xl p-6 border border-white/5">
        <h3 className="text-base font-bold text-white mb-4">종목별 티어</h3>
        <div className="space-y-3">
          {(sports ?? []).map((sport) => {
            const myTier = tiers?.find((t) => t.sport_id === sport.id)
            const icon = SPORT_ICONS[sport.icon ?? ''] ?? '🏟️'

            return (
              <div key={sport.id} className="flex items-center justify-between py-2 border-b border-slate-800/50 last:border-0">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{icon}</span>
                  <span className="text-sm text-slate-300">{sport.name}</span>
                </div>
                {myTier ? (
                  <TierBadge tier={myTier.tier_name as TierName} />
                ) : (
                  <span className="text-xs text-slate-600">미설정</span>
                )}
              </div>
            )
          })}
        </div>

        <Link
          href="/profile/edit"
          className="mt-4 flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-slate-700/50 text-slate-400 hover:text-white hover:border-slate-600 text-sm transition-all"
        >
          <Settings className="w-4 h-4" />
          티어 수정하기
        </Link>
      </div>
    </div>
  )
}
