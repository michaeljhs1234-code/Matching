import { ExternalLink } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '공모전 허브',
  description: '접수 중인 공모전을 확인하고 팀원을 모집하세요',
}

const ALLFORYOUNG_URL = 'https://www.allforyoung.com/'

export default function ContestPage() {
  return (
    <div className="flex flex-col h-[calc(100dvh-80px)]">
      {/* 헤더 */}
      <div className="px-4 pt-6 pb-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-white">공모전 🏆</h1>
            <p className="text-slate-400 text-sm mt-0.5">접수 중인 공모전을 확인하세요</p>
          </div>
          <a
            href={ALLFORYOUNG_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl glass border border-white/10 text-slate-400 hover:text-white text-xs transition-all"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            새 탭으로 열기
          </a>
        </div>
      </div>

      {/* iframe 컨테이너 */}
      <div className="flex-1 relative px-4 pb-4">
        <div className="w-full h-full rounded-2xl overflow-hidden border border-white/10 glass">
          <ContestFrame />
        </div>
      </div>
    </div>
  )
}

function ContestFrame() {
  return (
    <>
      {/* 실제 iframe - CSP 정책에 따라 작동 여부 달라짐 */}
      <iframe
        src={ALLFORYOUNG_URL}
        className="w-full h-full"
        title="요즘것들 - 공모전 정보"
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
        loading="lazy"
        id="contest-iframe"
      />
      {/* Fallback: iframe 로드 실패 시 표시 */}
      <noscript>
        <FallbackUI />
      </noscript>
    </>
  )
}

function FallbackUI() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-6">
      <div className="text-6xl mb-4">🏆</div>
      <h2 className="text-xl font-bold text-white mb-2">공모전 정보</h2>
      <p className="text-slate-400 text-sm mb-6">
        요즘것들에서 접수 중인 공모전을 확인하세요
      </p>
      <a
        href={ALLFORYOUNG_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white btn-glow"
        style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}
      >
        <ExternalLink className="w-4 h-4" />
        요즘것들 바로가기
      </a>
    </div>
  )
}
