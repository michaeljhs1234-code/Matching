import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import TierBadge from '@/components/common/TierBadge'
import { TierName, SPORT_ICONS } from '@/types'
import { getMannerColor, getMannerLabel } from '@/lib/utils'

interface Props {
  params: Promise<{ userId: string }>
}

export default async function UserProfilePage({ params }: Props) {
  const { userId } = await params
  const supabase = await createClient()

  const { data: profile } = await supabase
    .from('users')
    .select('*, departments(name, college)')
    .eq('id', userId)
    .single()

  if (!profile) notFound()

  const { data: tiers } = await supabase
    .from('user_sport_tiers')
    .select('*, sport_categories(name, icon)')
    .eq('user_id', userId)

  const mannerTemp = profile.manner_temperature ?? 36.5
  const mannerColor = getMannerColor(mannerTemp)
  const mannerLabel = getMannerLabel(mannerTemp)

  return (
    <div className="px-4 py-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-black text-white mb-6">플레이어 프로필</h1>

      <div className="glass-elevated rounded-2xl p-6 mb-4 border border-white/5">
        <div className="flex items-center gap-4 mb-5">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-2xl font-black text-white">
            {profile.name[0]}
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">{profile.name}</h2>
            <p className="text-slate-400 text-sm">
              {(profile as any).departments?.college} · {(profile as any).departments?.name}
            </p>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-300">매너 온도</span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold" style={{ color: mannerColor }}>{mannerTemp}°C</span>
              <span className="text-xs text-slate-400">{mannerLabel}</span>
            </div>
          </div>
          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{
                width: `${Math.min(mannerTemp, 100)}%`,
                background: 'linear-gradient(90deg, #ef4444, #eab308, #22c55e)',
              }}
            />
          </div>
        </div>
      </div>

      <div className="glass-elevated rounded-2xl p-6 border border-white/5">
        <h3 className="text-base font-bold text-white mb-4">종목별 티어</h3>
        <div className="space-y-3">
          {(tiers ?? []).map((t) => {
            const icon = SPORT_ICONS[(t as any).sport_categories?.icon ?? ''] ?? '🏟️'
            return (
              <div key={t.id} className="flex items-center justify-between py-2 border-b border-slate-800/50 last:border-0">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{icon}</span>
                  <span className="text-sm text-slate-300">{(t as any).sport_categories?.name}</span>
                </div>
                <TierBadge tier={t.tier_name as TierName} />
              </div>
            )
          })}
          {(!tiers || tiers.length === 0) && (
            <p className="text-slate-500 text-sm text-center py-4">설정된 티어가 없습니다</p>
          )}
        </div>
      </div>
    </div>
  )
}
