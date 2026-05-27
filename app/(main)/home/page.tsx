import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { ChevronRight } from 'lucide-react'

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let profile = null
  if (user) {
    const { data } = await supabase
      .from('users')
      .select('name')
      .eq('id', user.id)
      .single()
    profile = data
  }

  return (
    <div className="px-4 py-6 max-w-2xl mx-auto">
      {/* 헤더 */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-sm">안녕하세요 👋</p>
            <h1 className="text-2xl font-black text-white mt-0.5">
              {profile?.name ?? '충북대생'}님
            </h1>
          </div>
          <div className="text-3xl font-black gradient-text">CBNU</div>
        </div>
      </div>

      {/* 메인 카드 2개 */}
      <div className="space-y-4">
        {/* 스포츠 */}
        <Link href="/sports" className="block">
          <div
            className="relative rounded-2xl p-6 overflow-hidden sport-card border border-indigo-500/20"
            style={{ background: 'linear-gradient(135deg, rgba(79,70,229,0.15) 0%, rgba(124,58,237,0.1) 100%)' }}
          >
            <div className="absolute top-0 right-0 w-40 h-40 opacity-10 text-[120px] leading-none select-none pointer-events-none">🏅</div>
            <div className="relative">
              <div className="text-5xl mb-3">🏅</div>
              <h2 className="text-xl font-black text-white mb-1">스포츠 매칭</h2>
              <p className="text-slate-400 text-sm mb-4">
                축구 · 풋살 · 농구 · 볼링 · e스포츠
              </p>
              <div className="flex items-center gap-2 text-indigo-400 text-sm font-semibold">
                매칭 찾기 <ChevronRight className="w-4 h-4" />
              </div>
            </div>
          </div>
        </Link>

        {/* 공모전 */}
        <Link href="/contest" className="block">
          <div
            className="relative rounded-2xl p-6 overflow-hidden sport-card border border-violet-500/20"
            style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.15) 0%, rgba(6,182,212,0.08) 100%)' }}
          >
            <div className="absolute top-0 right-0 w-40 h-40 opacity-10 text-[120px] leading-none select-none pointer-events-none">🏆</div>
            <div className="relative">
              <div className="text-5xl mb-3">🏆</div>
              <h2 className="text-xl font-black text-white mb-1">공모전</h2>
              <p className="text-slate-400 text-sm mb-4">
                접수 중인 공모전 확인 · 팀원 모집
              </p>
              <div className="flex items-center gap-2 text-violet-400 text-sm font-semibold">
                공모전 보기 <ChevronRight className="w-4 h-4" />
              </div>
            </div>
          </div>
        </Link>
      </div>

      {/* 안내 배너 */}
      <div className="mt-6 p-4 rounded-xl glass border border-white/5">
        <div className="flex items-start gap-3">
          <span className="text-2xl">⚡</span>
          <div>
            <p className="text-sm font-semibold text-white mb-0.5">전력 밸런싱 매칭</p>
            <p className="text-xs text-slate-400 leading-relaxed">
              Snake Draft 알고리즘으로 양 팀의 티어 점수를 균등하게 분배합니다. 항상 공정한 경기를 즐겨보세요.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
