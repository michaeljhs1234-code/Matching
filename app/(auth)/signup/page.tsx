'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  ChevronLeft, ChevronRight, Loader2, User, Hash,
  GraduationCap, Mail, Lock, Eye, EyeOff, CheckCircle2, RefreshCw
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { signUpSchema, SignUpFormData } from '@/lib/validators/auth'

interface Department {
  id: number
  college: string
  name: string
}

const STEPS = ['기본 정보', '이메일 & 비밀번호', 'OTP 인증']

export default function SignUpPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [departments, setDepartments] = useState<Department[]>([])
  const [colleges, setColleges] = useState<string[]>([])
  const [selectedCollege, setSelectedCollege] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [serverError, setServerError] = useState('')

  // OTP 관련 상태
  const [otpSending, setOtpSending] = useState(false)
  const [otpSent, setOtpSent] = useState(false)
  const [otpValues, setOtpValues] = useState(['', '', '', '', '', ''])
  const [otpVerifying, setOtpVerifying] = useState(false)
  const [otpError, setOtpError] = useState('')
  const [resendCooldown, setResendCooldown] = useState(0)
  const otpRefs = useRef<(HTMLInputElement | null)[]>([])

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    trigger,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<SignUpFormData>({ resolver: zodResolver(signUpSchema) })

  // 학과 목록 불러오기
  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('departments')
      .select('id, college, name')
      .order('college')
      .order('name')
      .then(({ data }) => {
        if (data) {
          const typed = data as Department[]
          setDepartments(typed)
          const uniqueColleges = [...new Set(typed.map((d) => d.college))]
          setColleges(uniqueColleges)
        }
      })
  }, [])

  // 재전송 카운트다운
  useEffect(() => {
    if (resendCooldown <= 0) return
    const timer = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [resendCooldown])

  const filteredDepts = departments.filter((d) => d.college === selectedCollege)

  // Step 0→1 이동
  const handleStep0Next = async () => {
    const ok = await trigger(['name', 'student_id', 'department_id'])
    if (ok) setStep(1)
  }

  // Step 1→2: 이메일+비밀번호 유효성 검사 후 signUp & OTP 발송
  const handleSendOtp = async () => {
    const ok = await trigger(['email', 'password', 'confirmPassword'])
    if (!ok) return

    const email = getValues('email')
    const password = getValues('password')
    setOtpSending(true)
    setServerError('')
    setOtpError('')

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signUp({
        email,
        password,
      })

      if (error) {
        if (error.message.includes('over_email_send_rate_limit')) {
          setServerError('이메일 전송 한도를 초과했습니다. 잠시 후 다시 시도해주세요.')
          setOtpSending(false)
          return
        }
        if (error.message.includes('already registered') || error.message.includes('User already registered')) {
          setServerError('이미 가입된 이메일입니다. 로그인 페이지로 이동해주세요.')
          setOtpSending(false)
          return
        }
        // 그 외 에러는 그래도 OTP가 발송됐을 수 있으므로 계속 진행
      }

      setOtpSent(true)
      setStep(2)
      setResendCooldown(60)
      setOtpValues(['', '', '', '', '', ''])
      setTimeout(() => otpRefs.current[0]?.focus(), 100)
    } catch {
      setServerError('이메일 발송 중 오류가 발생했습니다.')
    } finally {
      setOtpSending(false)
    }
  }

  // OTP 재전송 (signUp 재호출)
  const handleResendOtp = async () => {
    if (resendCooldown > 0) return
    const email = getValues('email')
    const password = getValues('password')
    setOtpError('')
    setOtpValues(['', '', '', '', '', ''])
    setResendCooldown(60)

    const supabase = createClient()
    await supabase.auth.signUp({ email, password })
    setTimeout(() => otpRefs.current[0]?.focus(), 100)
  }

  // OTP 입력 핸들러
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return
    const newVals = [...otpValues]
    newVals[index] = value.slice(-1)
    setOtpValues(newVals)
    setOtpError('')

    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus()
    }
  }

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpValues[index] && index > 0) {
      otpRefs.current[index - 1]?.focus()
    }
  }

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    const newVals = Array(6).fill('')
    pasted.split('').forEach((ch, i) => { newVals[i] = ch })
    setOtpValues(newVals)
    otpRefs.current[Math.min(pasted.length, 5)]?.focus()
  }

  // OTP 검증 → type: 'signup' 사용
  const handleVerifyOtp = async () => {
    const code = otpValues.join('')
    if (code.length < 6) {
      setOtpError('6자리 인증번호를 모두 입력해주세요.')
      return
    }

    setOtpVerifying(true)
    setOtpError('')

    const supabase = createClient()
    const email = getValues('email')

    const { data: { session }, error } = await supabase.auth.verifyOtp({
      email,
      token: code,
      type: 'signup',
    })

    if (error) {
      setOtpError('인증번호가 올바르지 않거나 만료되었습니다. 다시 확인해주세요.')
      setOtpVerifying(false)
      return
    }

    // OTP 인증 성공 → users 테이블에 프로필 생성
    if (session?.user) {
      const data = getValues()
      const { error: profileError } = await (supabase.from('users') as any).insert({
        id: session.user.id,
        name: data.name,
        student_id: data.student_id,
        department_id: data.department_id,
        email: data.email,
        email_verified: true,
        role: 'student',
      })

      if (profileError && !profileError.message.includes('duplicate')) {
        console.error('Profile creation error:', profileError)
      }
    }

    setOtpVerifying(false)
    router.push('/home')
  }

  // 최종 제출 (form submit) - OTP 검증에서 이미 처리하므로 fallback만 유지
  const onSubmit = async () => {
    // OTP 검증 완료 시 handleVerifyOtp에서 라우팅까지 처리됨
  }

  return (
    <div className="min-h-dvh flex items-center justify-center gradient-bg px-4 py-8">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <h1 className="text-3xl font-black gradient-text">MATCH</h1>
            <p className="text-slate-400 text-sm mt-1">매칭 플랫폼</p>
          </Link>
        </div>

        {/* Step 인디케이터 */}
        <div className="flex items-center justify-between mb-6 px-2">
          {STEPS.map((label, idx) => (
            <div key={idx} className="flex items-center">
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold transition-all ${
                  idx < step
                    ? 'bg-green-600 text-white'
                    : idx === step
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-800 text-slate-500'
                }`}
              >
                {idx < step ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
              </div>
              <span
                className={`ml-1.5 text-xs hidden sm:block ${
                  idx < step ? 'text-green-400' : idx === step ? 'text-indigo-400' : 'text-slate-600'
                }`}
              >
                {label}
              </span>
              {idx < STEPS.length - 1 && (
                <div
                  className={`mx-2 flex-1 h-0.5 rounded ${idx < step ? 'bg-green-600' : 'bg-slate-800'}`}
                  style={{ minWidth: '16px' }}
                />
              )}
            </div>
          ))}
        </div>

        <div className="glass-elevated rounded-2xl p-8 shadow-2xl">
          <form onSubmit={handleSubmit(onSubmit)}>

            {/* ── STEP 0: 기본 정보 ── */}
            {step === 0 && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-white mb-4">기본 정보 입력</h2>

                {/* 이름 */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">이름</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      {...register('name')}
                      placeholder="홍길동"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm transition-all"
                      style={{
                        background: 'rgba(15,15,26,0.8)',
                        borderColor: errors.name ? '#ef4444' : '#1e293b',
                        color: '#f1f5f9',
                      }}
                    />
                  </div>
                  {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>}
                </div>

                {/* 학번 */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">학번</label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      {...register('student_id')}
                      placeholder="2022026033 (10자리)"
                      maxLength={10}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm transition-all"
                      style={{
                        background: 'rgba(15,15,26,0.8)',
                        borderColor: errors.student_id ? '#ef4444' : '#1e293b',
                        color: '#f1f5f9',
                      }}
                    />
                  </div>
                  {errors.student_id && <p className="text-red-400 text-xs mt-1">{errors.student_id.message}</p>}
                </div>

                {/* 단과대 선택 */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">단과대학</label>
                  <div className="relative">
                    <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <select
                      value={selectedCollege}
                      onChange={(e) => {
                        setSelectedCollege(e.target.value)
                        setValue('department_id', 0 as unknown as number)
                      }}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm appearance-none"
                      style={{ background: 'rgba(15,15,26,0.8)', borderColor: '#1e293b', color: '#f1f5f9' }}
                    >
                      <option value="">단과대를 선택하세요</option>
                      {colleges.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* 학과 선택 */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">학과</label>
                  <select
                    {...register('department_id', { valueAsNumber: true })}
                    disabled={!selectedCollege}
                    className="w-full px-4 py-2.5 rounded-xl border text-sm appearance-none"
                    style={{
                      background: 'rgba(15,15,26,0.8)',
                      borderColor: errors.department_id ? '#ef4444' : '#1e293b',
                      color: '#f1f5f9',
                      opacity: !selectedCollege ? 0.5 : 1,
                    }}
                  >
                    <option value={0}>학과를 선택하세요</option>
                    {filteredDepts.map((d) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                  {errors.department_id && (
                    <p className="text-red-400 text-xs mt-1">{errors.department_id.message}</p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleStep0Next}
                  className="w-full py-3 rounded-xl font-semibold text-white btn-glow flex items-center justify-center gap-2"
                  style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}
                >
                  다음 <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* ── STEP 1: 이메일 & 비밀번호 입력 ── */}
            {step === 1 && (
              <div className="space-y-4">
                <button
                  type="button"
                  onClick={() => setStep(0)}
                  className="flex items-center gap-1 text-slate-400 hover:text-white text-sm mb-2"
                >
                  <ChevronLeft className="w-4 h-4" /> 이전
                </button>
                <h2 className="text-xl font-bold text-white mb-4">이메일 & 비밀번호</h2>

                <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-sm">
                  📧 입력하신 이메일로 6자리 인증번호를 발송합니다
                </div>

                {/* 이메일 */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">이메일</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      {...register('email')}
                      type="email"
                      placeholder="example@gmail.com"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm"
                      style={{
                        background: 'rgba(15,15,26,0.8)',
                        borderColor: errors.email ? '#ef4444' : '#1e293b',
                        color: '#f1f5f9',
                      }}
                    />
                  </div>
                  {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
                </div>

                {/* 비밀번호 */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">비밀번호</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      {...register('password')}
                      type={showPassword ? 'text' : 'password'}
                      placeholder="비밀번호를 입력하세요"
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl border text-sm"
                      style={{
                        background: 'rgba(15,15,26,0.8)',
                        borderColor: errors.password ? '#ef4444' : '#1e293b',
                        color: '#f1f5f9',
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-slate-500 text-xs mt-1">비밀번호는 최소 6자리 이상이어야 합니다</p>
                  {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
                </div>

                {/* 비밀번호 확인 */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">비밀번호 확인</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      {...register('confirmPassword')}
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="비밀번호를 다시 입력하세요"
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl border text-sm"
                      style={{
                        background: 'rgba(15,15,26,0.8)',
                        borderColor: errors.confirmPassword ? '#ef4444' : '#1e293b',
                        color: '#f1f5f9',
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-red-400 text-xs mt-1">{errors.confirmPassword.message}</p>
                  )}
                </div>

                {serverError && (
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                    {serverError}
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={otpSending}
                  className="w-full py-3 rounded-xl font-semibold text-white btn-glow flex items-center justify-center gap-2 disabled:opacity-60"
                  style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}
                >
                  {otpSending ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> 발송 중...</>
                  ) : (
                    <>인증번호 발송 <ChevronRight className="w-4 h-4" /></>
                  )}
                </button>
              </div>
            )}

            {/* ── STEP 2: OTP 인증 ── */}
            {step === 2 && (
              <div className="space-y-5">
                <button
                  type="button"
                  onClick={() => { setStep(1); setOtpSent(false); setOtpError('') }}
                  className="flex items-center gap-1 text-slate-400 hover:text-white text-sm mb-2"
                >
                  <ChevronLeft className="w-4 h-4" /> 이전
                </button>
                <h2 className="text-xl font-bold text-white mb-1">인증번호 확인</h2>
                <p className="text-slate-400 text-sm">
                  <span className="text-indigo-400 font-semibold">{getValues('email')}</span>으로<br />
                  발송된 6자리 인증번호를 입력해주세요.
                </p>

                {/* OTP 입력 박스 */}
                <div className="flex gap-2 justify-center my-4">
                  {otpValues.map((val, i) => (
                    <input
                      key={i}
                      ref={(el) => { otpRefs.current[i] = el }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={val}
                      onChange={(e) => handleOtpChange(i, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(i, e)}
                      onPaste={i === 0 ? handleOtpPaste : undefined}
                      className="w-11 h-14 text-center text-xl font-bold rounded-xl border-2 transition-all outline-none"
                      style={{
                        background: 'rgba(15,15,26,0.9)',
                        borderColor: otpError
                          ? '#ef4444'
                          : val
                          ? '#4f46e5'
                          : '#1e293b',
                        color: '#f1f5f9',
                        boxShadow: val ? '0 0 0 2px rgba(79,70,229,0.2)' : 'none',
                      }}
                    />
                  ))}
                </div>

                {otpError && (
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
                    {otpError}
                  </div>
                )}

                {serverError && (
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
                    {serverError}
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleVerifyOtp}
                  disabled={otpVerifying || otpValues.join('').length < 6}
                  className="w-full py-3 rounded-xl font-semibold text-white btn-glow flex items-center justify-center gap-2 disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}
                >
                  {otpVerifying ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> 확인 중...</>
                  ) : (
                    <>인증 확인 <CheckCircle2 className="w-4 h-4" /></>
                  )}
                </button>

                {/* 재전송 */}
                <div className="text-center">
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={resendCooldown > 0}
                    className="text-sm flex items-center gap-1.5 mx-auto disabled:opacity-50"
                    style={{ color: resendCooldown > 0 ? '#64748b' : '#818cf8' }}
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    {resendCooldown > 0
                      ? `재전송 가능까지 ${resendCooldown}초`
                      : '인증번호 재전송'}
                  </button>
                </div>
              </div>
            )}
          </form>

          <div className="mt-6 text-center">
            <p className="text-slate-400 text-sm">
              이미 계정이 있으신가요?{' '}
              <Link href="/login" className="text-indigo-400 hover:text-indigo-300 font-medium">
                로그인
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
