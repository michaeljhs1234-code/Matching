import Link from 'next/link'
import { ArrowRight, Shield, Zap, Users } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-dvh gradient-bg overflow-hidden">
      {/* 배경 장식 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-indigo-600/8 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-0 w-[500px] h-[500px] bg-violet-600/8 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 w-[400px] h-[400px] bg-cyan-600/5 rounded-full blur-3xl" />
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      {/* 네비게이션 */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-5 max-w-6xl mx-auto">
        <div className="text-2xl font-black gradient-text">CBNU MATCH</div>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="px-4 py-2 text-sm text-slate-300 hover:text-white transition-colors"
          >
            로그인
          </Link>
          <Link
            href="/signup"
            className="px-5 py-2 rounded-xl text-sm font-semibold text-white btn-glow transition-all"
            style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}
          >
            시작하기
          </Link>
        </div>
      </nav>

      {/* 히어로 섹션 */}
      <section className="relative z-10 text-center px-6 pt-20 pb-24 max-w-5xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-sm text-indigo-300 mb-8 border border-indigo-500/20">
          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          충북대학교 재학생 전용 플랫폼
        </div>

        <h1 className="text-5xl sm:text-7xl font-black mb-6 leading-tight">
          <span className="text-white">공정한 경기,</span>
          <br />
          <span className="gradient-text">스마트한 매칭</span>
        </h1>

        <p className="text-slate-400 text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
          전력 밸런싱 알고리즘으로 양 팀의 실력을 균등하게 분배합니다.
          <br />
          스포츠부터 공모전까지, 충북대 학생들을 연결합니다.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/signup"
            className="group inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-bold text-white text-lg btn-glow"
            style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}
          >
            지금 시작하기
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-semibold text-slate-300 hover:text-white glass border border-slate-700/50 hover:border-slate-500/50 transition-all"
          >
            로그인
          </Link>
        </div>
      </section>

      {/* 카테고리 미리보기 */}
      <section className="relative z-10 px-6 pb-20 max-w-4xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* 스포츠 카드 */}
          <div className="glass-elevated rounded-2xl p-6 sport-card border border-indigo-500/20 hover:border-indigo-500/40">
            <div className="text-5xl mb-4">🏅</div>
            <h2 className="text-xl font-bold text-white mb-2">스포츠 매칭</h2>
            <p className="text-slate-400 text-sm mb-4">
              축구 · 풋살 · 농구 · 볼링 · e스포츠<br />
              전력 밸런싱으로 공정한 팀 구성
            </p>
            <div className="flex flex-wrap gap-2">
              {['⚽ 축구', '🥅 풋살', '🏀 농구', '🎳 볼링', '🎮 e스포츠'].map((s) => (
                <span key={s} className="px-2.5 py-1 rounded-lg text-xs text-indigo-300 bg-indigo-500/10 border border-indigo-500/20">
                  {s}
                </span>
              ))}
            </div>
          </div>

          {/* 공모전 카드 */}
          <div className="glass-elevated rounded-2xl p-6 sport-card border border-violet-500/20 hover:border-violet-500/40">
            <div className="text-5xl mb-4">🏆</div>
            <h2 className="text-xl font-bold text-white mb-2">공모전 매칭</h2>
            <p className="text-slate-400 text-sm mb-4">
              요즘것들 연동으로 실시간 공모전 확인<br />
              팀원이 필요하다면 바로 모집하세요
            </p>
            <div className="flex flex-wrap gap-2">
              {['🔴 마감 임박', '📋 접수 중', '👥 팀원 모집'].map((s) => (
                <span key={s} className="px-2.5 py-1 rounded-lg text-xs text-violet-300 bg-violet-500/10 border border-violet-500/20">
                  {s}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 특징 섹션 */}
      <section className="relative z-10 px-6 pb-24 max-w-5xl mx-auto">
        <h2 className="text-3xl font-black text-center text-white mb-12">
          왜 <span className="gradient-text">CBNU Match</span>인가요?
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            {
              icon: <Zap className="w-6 h-6 text-yellow-400" />,
              bg: 'bg-yellow-500/10',
              border: 'border-yellow-500/20',
              title: '전력 밸런싱 알고리즘',
              desc: 'Snake Draft 방식으로 양 팀의 티어 점수를 균등하게 분배해 항상 공정한 경기를 만들어냅니다.',
            },
            {
              icon: <Shield className="w-6 h-6 text-green-400" />,
              bg: 'bg-green-500/10',
              border: 'border-green-500/20',
              title: '충북대 인증 시스템',
              desc: '학교 이메일 인증으로 재학생만 이용 가능한 신뢰도 높은 커뮤니티를 운영합니다.',
            },
            {
              icon: <Users className="w-6 h-6 text-blue-400" />,
              bg: 'bg-blue-500/10',
              border: 'border-blue-500/20',
              title: '그룹 초대 링크',
              desc: '친구에게 링크를 공유해 그룹으로 참가하면 같은 팀에 배정될 가능성이 높아집니다.',
            },
          ].map((f) => (
            <div key={f.title} className="glass rounded-2xl p-6 border" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
              <div className={`inline-flex p-3 rounded-xl ${f.bg} border ${f.border} mb-4`}>
                {f.icon}
              </div>
              <h3 className="font-bold text-white mb-2">{f.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 푸터 */}
      <footer className="relative z-10 text-center py-8 text-slate-600 text-sm border-t border-slate-800/50">
        © 2026 CBNU Match. 충북대학교 재학생 전용 서비스.
      </footer>
    </div>
  )
}
