'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, Users, Copy, CheckCircle, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function CreateGroupPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [createdGroup, setCreatedGroup] = useState<{ id: string; invite_token: string } | null>(null)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState('')

  const handleCreate = async () => {
    if (!name.trim()) { setError('그룹 이름을 입력해주세요'); return }
    setError('')
    setLoading(true)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const { data, error: dbError } = await (supabase.from('groups') as any)
      .insert({ name: name.trim(), host_user_id: user.id })
      .select()
      .single()

    if (dbError) {
      setError('그룹 생성에 실패했습니다')
      setLoading(false)
      return
    }

    // 자신도 멤버로 추가
    await (supabase.from('group_members') as any).insert({ group_id: data.id, user_id: user.id })

    setCreatedGroup(data)
    setLoading(false)
  }

  const handleCopy = () => {
    if (!createdGroup) return
    const link = `${window.location.origin}/group/join/${createdGroup.invite_token}`
    navigator.clipboard.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="px-4 py-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="p-2 rounded-xl glass border border-white/5 text-slate-400 hover:text-white">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-black text-white">그룹 만들기</h1>
      </div>

      {!createdGroup ? (
        <div className="glass-elevated rounded-2xl p-6 border border-white/5">
          <div className="text-4xl text-center mb-4">👥</div>
          <h2 className="text-center font-bold text-white mb-1">친구를 초대하세요</h2>
          <p className="text-center text-slate-400 text-sm mb-6">
            그룹을 만들면 초대 링크가 생성됩니다.<br />
            같은 그룹 멤버는 같은 팀에 배정될 가능성이 높아요!
          </p>

          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-300 mb-1.5">그룹 이름</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="예: 컴공과 풋살팀"
              maxLength={30}
              className="w-full px-4 py-2.5 rounded-xl border text-sm"
              style={{ background: 'rgba(15,15,26,0.8)', borderColor: error ? '#ef4444' : '#1e293b', color: '#f1f5f9' }}
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            />
            {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
          </div>

          <button
            onClick={handleCreate}
            disabled={loading}
            className="w-full py-3 rounded-xl font-bold text-white btn-glow flex items-center justify-center gap-2 disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}
          >
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> 생성 중...</> : <><Users className="w-4 h-4" /> 그룹 만들기</>}
          </button>
        </div>
      ) : (
        <div className="glass-elevated rounded-2xl p-6 border border-green-500/20 text-center">
          <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
          <h2 className="text-xl font-bold text-white mb-1">그룹이 생성되었습니다!</h2>
          <p className="text-slate-400 text-sm mb-6">초대 링크를 친구에게 공유하세요</p>

          <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/50 text-left mb-4">
            <p className="text-xs text-slate-400 mb-1">초대 링크</p>
            <p className="text-sm text-indigo-300 truncate">
              {`${window.location.origin}/group/join/${createdGroup.invite_token}`}
            </p>
          </div>

          <button
            onClick={handleCopy}
            className="w-full py-3 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition-all"
            style={{
              background: copied ? 'rgba(34,197,94,0.2)' : 'rgba(79,70,229,0.2)',
              border: copied ? '1px solid rgba(34,197,94,0.4)' : '1px solid rgba(79,70,229,0.4)',
              color: copied ? '#4ade80' : '#818cf8',
            }}
          >
            {copied ? <><CheckCircle className="w-4 h-4" /> 복사 완료!</> : <><Copy className="w-4 h-4" /> 링크 복사하기</>}
          </button>

          <button
            onClick={() => router.push('/home')}
            className="mt-3 w-full py-2.5 rounded-xl text-slate-400 hover:text-white text-sm transition-colors"
          >
            홈으로 돌아가기
          </button>
        </div>
      )}
    </div>
  )
}
