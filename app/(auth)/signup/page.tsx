'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ChevronLeft, ChevronRight, Loader2, User, Hash, GraduationCap, Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { signUpSchema, SignUpFormData } from '@/lib/validators/auth'

interface Department {
  id: number
  college: string
  name: string
}

const STEPS = ['기본 정보', '이메일 인증', '비밀번호 설정']

export default function SignUpPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [departments, setDepartments] = useState<Department[]>([])
  const [colleges, setColleges] = useState<string[]>([])
  const [selectedCollege, setSelectedCollege] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [serverError, setServerError] = useState('')
  const [emailSent, setEmailSent] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    trigger,
    formState: { errors, isSubmitting },
  } = useForm<SignUpFormData>({ resolver: zodResolver(signUpSchema) })

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

  const filteredDepts = departments.filter((d) => d.college === selectedCollege)

  const handleNextStep = async () => {
    if (step === 0) {
      const ok = await trigger(['name', 'student_id', 'department_id'])
      if (ok) setStep(1)
    } else if (step === 1) {
      const ok = await trigger(['email'])
      if (ok) setStep(2)
    }
  }

  const onSubmit = async (data: SignUpFormData) => {
    setServerError('')
    const supabase = createClient()

    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: {
          name: data.name,
          student_id: data.student_id,
          department_id: data.department_id,
        },
      },
    })

    if (signUpError) {
      if (signUpError.message.includes('already registered')) {
        setServerError('이미 가입된 이메일입니다. 로그인 페이지로 이동해주세요.')
      } else {
        setServerError(signUpError.message)
      }
      return
    }

    if (authData.user) {
      // users 테이블에 프로필 생성
      const { error: profileError } = await (supabase.from('users') as any).insert({
        id: authData.user.id,
        name: data.name,
        student_id: data.student_id,
        department_id: data.department_id,
        email: data.email,
        email_verified: false,
        role: 'student'
      })

      if (profileError && !profileError.message.includes('duplicate')) {
        console.error('Profile creation error:', profileError)
      }
    }

    setEmailSent(true)
    router.push('/verify')
  }

  if (emailSent) {
    return (
      <div className="min-h-dvh flex items-center justify-center gradient-bg px-4">
        <div className="text-center">
          <div className="text-6xl mb-4">📧</div>
          <h2 className="text-2xl font-bold text-white mb-2">이메일을 확인해주세요</h2>
          <p className="text-slate-400">인증 링크를 발송했습니다.</p>
        </div>
      </div>
    )
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
            <h1 className="text-3xl font-black gradient-text">CBNU MATCH</h1>
            <p className="text-slate-400 text-sm mt-1">충북대학교 재학생 전용</p>
          </Link>
        </div>

        {/* Step 인디케이터 */}
        <div className="flex items-center justify-between mb-6 px-2">
          {STEPS.map((label, idx) => (
            <div key={idx} className="flex items-center">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold transition-all ${
                idx <= step
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-800 text-slate-500'
              }`}>
                {idx + 1}
              </div>
              <span className={`ml-1.5 text-xs hidden sm:block ${idx <= step ? 'text-indigo-400' : 'text-slate-600'}`}>
                {label}
              </span>
              {idx < STEPS.length - 1 && (
                <div className={`mx-2 flex-1 h-0.5 rounded ${idx < step ? 'bg-indigo-600' : 'bg-slate-800'}`} style={{ minWidth: '20px' }} />
              )}
            </div>
          ))}
        </div>

        <div className="glass-elevated rounded-2xl p-8 shadow-2xl">
          <form onSubmit={handleSubmit(onSubmit)}>
            {/* STEP 0: 기본 정보 */}
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
                      style={{ background: 'rgba(15,15,26,0.8)', borderColor: errors.name ? '#ef4444' : '#1e293b', color: '#f1f5f9' }}
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
                      placeholder="12345678 (8자리)"
                      maxLength={8}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm transition-all"
                      style={{ background: 'rgba(15,15,26,0.8)', borderColor: errors.student_id ? '#ef4444' : '#1e293b', color: '#f1f5f9' }}
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
                  {errors.department_id && <p className="text-red-400 text-xs mt-1">{errors.department_id.message}</p>}
                </div>

                <button
                  type="button"
                  onClick={handleNextStep}
                  className="w-full py-3 rounded-xl font-semibold text-white btn-glow flex items-center justify-center gap-2"
                  style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}
                >
                  다음 <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* STEP 1: 이메일 */}
            {step === 1 && (
              <div className="space-y-4">
                <button
                  type="button"
                  onClick={() => setStep(0)}
                  className="flex items-center gap-1 text-slate-400 hover:text-white text-sm mb-2"
                >
                  <ChevronLeft className="w-4 h-4" /> 이전
                </button>
                <h2 className="text-xl font-bold text-white mb-4">학교 이메일 인증</h2>

                <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-sm">
                  🎓 충북대학교 이메일(@chungbuk.ac.kr)만 사용 가능합니다
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">학교 이메일</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      {...register('email')}
                      type="email"
                      placeholder="student@chungbuk.ac.kr"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm"
                      style={{ background: 'rgba(15,15,26,0.8)', borderColor: errors.email ? '#ef4444' : '#1e293b', color: '#f1f5f9' }}
                    />
                  </div>
                  {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
                </div>

                <button
                  type="button"
                  onClick={handleNextStep}
                  className="w-full py-3 rounded-xl font-semibold text-white btn-glow flex items-center justify-center gap-2"
                  style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}
                >
                  다음 <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* STEP 2: 비밀번호 */}
            {step === 2 && (
              <div className="space-y-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex items-center gap-1 text-slate-400 hover:text-white text-sm mb-2"
                >
                  <ChevronLeft className="w-4 h-4" /> 이전
                </button>
                <h2 className="text-xl font-bold text-white mb-4">비밀번호 설정</h2>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">비밀번호</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      {...register('password')}
                      type={showPassword ? 'text' : 'password'}
                      placeholder="8자 이상, 영문+숫자+특수문자"
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl border text-sm"
                      style={{ background: 'rgba(15,15,26,0.8)', borderColor: errors.password ? '#ef4444' : '#1e293b', color: '#f1f5f9' }}
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">비밀번호 확인</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      {...register('confirmPassword')}
                      type="password"
                      placeholder="비밀번호를 다시 입력하세요"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm"
                      style={{ background: 'rgba(15,15,26,0.8)', borderColor: errors.confirmPassword ? '#ef4444' : '#1e293b', color: '#f1f5f9' }}
                    />
                  </div>
                  {errors.confirmPassword && <p className="text-red-400 text-xs mt-1">{errors.confirmPassword.message}</p>}
                </div>

                {serverError && (
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                    {serverError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 rounded-xl font-semibold text-white btn-glow flex items-center justify-center gap-2 disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}
                >
                  {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" /> 가입 중...</> : '회원가입 완료'}
                </button>
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
