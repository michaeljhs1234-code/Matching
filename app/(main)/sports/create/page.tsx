'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ChevronLeft, MapPin, Clock, Users, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const createMatchSchema = z.object({
  sport_id: z.number().int().positive('종목을 선택해주세요'),
  title: z.string().min(2, '제목은 2자 이상이어야 합니다').max(50, '제목은 50자 이내여야 합니다'),
  location: z.string().optional(),
  scheduled_at: z.string().min(1, '날짜와 시간을 선택해주세요'),
  max_participants: z.number().int().min(2).refine((n) => n % 2 === 0, '인원은 짝수여야 합니다'),
})

type CreateMatchForm = z.infer<typeof createMatchSchema>

interface Sport {
  id: number
  name: string
  icon: string | null
  team_size: number
}

export default function CreateMatchPage() {
  const router = useRouter()
  const [sports, setSports] = useState<Sport[]>([])
  const [serverError, setServerError] = useState('')

  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } =
    useForm<CreateMatchForm>({
      resolver: zodResolver(createMatchSchema),
      defaultValues: { max_participants: 10 },
    })

  const selectedSportId = watch('sport_id')

  useEffect(() => {
    const supabase = createClient()
    supabase.from('sport_categories').select('*').order('id')
      .then(({ data }) => { if (data) setSports(data) })
  }, [])

  useEffect(() => {
    const sport = sports.find((s) => s.id === selectedSportId)
    if (sport) {
      setValue('max_participants', sport.team_size * 2)
    }
  }, [selectedSportId, sports, setValue])

  const onSubmit = async (data: CreateMatchForm) => {
    setServerError('')
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/auth/login'); return }

    const { data: match, error } = await (supabase.from('matches') as any)
      .insert({
        sport_id: data.sport_id,
        title: data.title,
        location: data.location || null,
        scheduled_at: new Date(data.scheduled_at).toISOString(),
        max_participants: data.max_participants,
        host_user_id: user.id,
      })
      .select()
      .single()

    if (error) {
      setServerError('매칭 방 생성에 실패했습니다. 다시 시도해주세요.')
      return
    }

    router.push(`/sports/${data.sport_id}/lobby/${match.id}`)
  }

  const currentMaxParticipants = watch('max_participants')

  return (
    <div className="px-4 py-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="p-2 rounded-xl glass border border-white/5 text-slate-400 hover:text-white">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-black text-white">매칭 방 만들기</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="glass-elevated rounded-2xl p-6 border border-white/5 space-y-5">

          {/* 종목 선택 */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">종목 선택</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {sports.map((sport) => {
                const icons: Record<string, string> = { soccer: '⚽', futsal: '🥅', basketball: '🏀', bowling: '🎳', esports: '🎮' }
                const isSelected = selectedSportId === sport.id
                return (
                  <button
                    key={sport.id}
                    type="button"
                    onClick={() => setValue('sport_id', sport.id)}
                    className="flex items-center gap-2 p-3 rounded-xl border text-sm font-medium transition-all"
                    style={{
                      background: isSelected ? 'rgba(79,70,229,0.2)' : 'rgba(15,15,26,0.5)',
                      borderColor: isSelected ? '#4f46e5' : '#1e293b',
                      color: isSelected ? '#818cf8' : '#94a3b8',
                    }}
                  >
                    <span>{icons[sport.icon ?? ''] ?? '🏟️'}</span>
                    <span>{sport.name}</span>
                  </button>
                )
              })}
            </div>
            {errors.sport_id && <p className="text-red-400 text-xs mt-1">{errors.sport_id.message}</p>}
          </div>

          {/* 제목 */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              <span className="flex items-center gap-1.5">매칭 제목</span>
            </label>
            <input
              {...register('title')}
              placeholder="예: 오후 풋살 같이 하실 분!"
              className="w-full px-4 py-2.5 rounded-xl border text-sm"
              style={{ background: 'rgba(15,15,26,0.8)', borderColor: errors.title ? '#ef4444' : '#1e293b', color: '#f1f5f9' }}
            />
            {errors.title && <p className="text-red-400 text-xs mt-1">{errors.title.message}</p>}
          </div>

          {/* 장소 */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" />장소 (선택)</span>
            </label>
            <input
              {...register('location')}
              placeholder="예: 충북대학교 운동장"
              className="w-full px-4 py-2.5 rounded-xl border text-sm"
              style={{ background: 'rgba(15,15,26,0.8)', borderColor: '#1e293b', color: '#f1f5f9' }}
            />
          </div>

          {/* 날짜/시간 */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" />날짜 및 시간</span>
            </label>
            <input
              {...register('scheduled_at')}
              type="datetime-local"
              min={new Date().toISOString().slice(0, 16)}
              className="w-full px-4 py-2.5 rounded-xl border text-sm"
              style={{ background: 'rgba(15,15,26,0.8)', borderColor: errors.scheduled_at ? '#ef4444' : '#1e293b', color: '#f1f5f9' }}
            />
            {errors.scheduled_at && <p className="text-red-400 text-xs mt-1">{errors.scheduled_at.message}</p>}
          </div>

          {/* 최대 인원 */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5" />
                총 인원 (반드시 짝수) — 현재: {currentMaxParticipants}명 ({currentMaxParticipants / 2}vs{currentMaxParticipants / 2})
              </span>
            </label>
            <input
              {...register('max_participants', { valueAsNumber: true })}
              type="number"
              min={2}
              max={40}
              step={2}
              className="w-full px-4 py-2.5 rounded-xl border text-sm"
              style={{ background: 'rgba(15,15,26,0.8)', borderColor: errors.max_participants ? '#ef4444' : '#1e293b', color: '#f1f5f9' }}
            />
            {errors.max_participants && <p className="text-red-400 text-xs mt-1">{errors.max_participants.message}</p>}
          </div>
        </div>

        {serverError && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {serverError}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3.5 rounded-2xl font-bold text-white btn-glow flex items-center justify-center gap-2 disabled:opacity-50"
          style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}
        >
          {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" /> 생성 중...</> : '매칭 방 만들기'}
        </button>
      </form>
    </div>
  )
}
