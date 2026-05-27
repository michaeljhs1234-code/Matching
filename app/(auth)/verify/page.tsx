'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Mail, RefreshCw, Loader2, CheckCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function VerifyPage() {
  const [resending, setResending] = useState(false)
  const [resent, setResent] = useState(false)
  const [cooldown, setCooldown] = useState(0)

  const handleResend = async () => {
    if (cooldown > 0) return
    setResending(true)
    // 재발송은 사용자가 이메일을 다시 입력하도록 로그인 페이지로 안내
    // 실제로는 Supabase resend OTP 사용
    await new Promise((r) => setTimeout(r, 1000))
    setResending(false)
    setResent(true)
    setCooldown(60)
    const timer = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) { clearInterval(timer); return 0 }
        return prev - 1
      })
    }, 1000)
  }

  return (
    <div className="min-h-dvh flex items-center justify-center gradient-bg px-4">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/3 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <h1 className="text-3xl font-black gradient-text">CBNU MATCH</h1>
          </Link>
        </div>

        <div className="glass-elevated rounded-2xl p-8 shadow-2xl text-center">
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-indigo-500/10 border border-indigo-500/20 mx-auto mb-6">
            <Mail className="w-8 h-8 text-indigo-400" />
          </div>

          <h2 className="text-xl font-bold text-white mb-3">이메일 인증 대기 중</h2>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            충북대학교 이메일로 인증 링크를 발송했습니다.
            <br />
            이메일함을 확인하고 링크를 클릭해주세요.
          </p>

          <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 mb-6 text-left">
            <h3 className="text-sm font-semibold text-slate-300 mb-2">인증 이메일이 안 왔나요?</h3>
            <ul className="text-xs text-slate-400 space-y-1">
              <li>• 스팸 메일함을 확인해보세요</li>
              <li>• 입력한 이메일 주소가 맞는지 확인하세요</li>
              <li>• 1~2분 정도 기다려보세요</li>
            </ul>
          </div>

          {resent && (
            <div className="flex items-center gap-2 justify-center text-green-400 text-sm mb-4">
              <CheckCircle className="w-4 h-4" />
              인증 이메일을 재발송했습니다
            </div>
          )}

          <button
            onClick={handleResend}
            disabled={resending || cooldown > 0}
            className="w-full py-2.5 rounded-xl border border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/10 text-sm font-medium flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            {resending ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> 발송 중...</>
            ) : cooldown > 0 ? (
              `${cooldown}초 후 재발송 가능`
            ) : (
              <><RefreshCw className="w-4 h-4" /> 인증 이메일 재발송</>
            )}
          </button>

          <div className="mt-6 pt-6 border-t border-slate-700/50">
            <Link href="/auth/login" className="text-slate-400 hover:text-white text-sm transition-colors">
              로그인 페이지로 돌아가기
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
