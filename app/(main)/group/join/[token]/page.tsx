import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Users, CheckCircle, XCircle } from 'lucide-react'

interface Props {
  params: Promise<{ token: string }>
}

export default async function GroupJoinPage({ params }: Props) {
  const { token } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/auth/login?callbackUrl=/group/join/${token}`)

  const { data: group } = await supabase
    .from('groups')
    .select('*, users(name)')
    .eq('invite_token', token)
    .eq('is_active', true)
    .single()

  if (!group) {
    return (
      <div className="min-h-dvh flex items-center justify-center gradient-bg px-4">
        <div className="glass-elevated rounded-2xl p-8 max-w-sm w-full text-center border border-red-500/20">
          <XCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">유효하지 않은 초대 링크</h2>
          <p className="text-slate-400 text-sm mb-6">만료되었거나 존재하지 않는 초대 링크입니다.</p>
          <Link href="/home" className="inline-block px-6 py-2.5 rounded-xl text-indigo-400 border border-indigo-500/30 hover:bg-indigo-500/10 transition-all text-sm">
            홈으로 돌아가기
          </Link>
        </div>
      </div>
    )
  }

  // 이미 가입 여부 확인
  const { data: existing } = await supabase
    .from('group_members')
    .select('id')
    .eq('group_id', (group as any).id)
    .eq('user_id', user.id)
    .single()

  let joined = false
  if (!existing) {
    const { error: joinError } = await (supabase.from('group_members') as any)
      .insert({ group_id: (group as any).id, user_id: user.id })
    joined = !joinError
  } else {
    joined = true
  }

  return (
    <div className="min-h-dvh flex items-center justify-center gradient-bg px-4">
      <div className="glass-elevated rounded-2xl p-8 max-w-sm w-full text-center border border-green-500/20">
        <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto mb-4">
          {joined ? <CheckCircle className="w-8 h-8 text-green-400" /> : <Users className="w-8 h-8 text-indigo-400" />}
        </div>
        <h2 className="text-xl font-bold text-white mb-2">
          {existing ? '이미 가입된 그룹' : `${(group as any).name} 가입 완료!`}
        </h2>
        <p className="text-slate-400 text-sm mb-2">
          {existing
            ? '이미 이 그룹의 멤버입니다.'
            : `"${(group as any).name}" 그룹에 합류했습니다.`}
        </p>
        <p className="text-xs text-slate-500 mb-6">
          그룹장: {(group as any).users?.name}
        </p>
        <Link
          href="/sports"
          className="block w-full py-3 rounded-xl font-bold text-white btn-glow text-center"
          style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}
        >
          매칭 찾으러 가기
        </Link>
        <Link href="/home" className="mt-3 block text-sm text-slate-400 hover:text-white transition-colors">
          홈으로
        </Link>
      </div>
    </div>
  )
}
