'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

interface ProcessReportData {
  reportId: number
  status: 'upheld' | 'dismissed'
  adminNote?: string
}

export async function processFraudReport({ reportId, status, adminNote }: ProcessReportData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { success: false, error: '인증되지 않았습니다.' }

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if ((profile as any)?.role !== 'admin') {
    return { success: false, error: '관리자 권한이 없습니다.' }
  }

  // 트랜잭션 대신 단일 업데이트 호출
  const { error } = await (supabase.from('fraud_reports') as any)
    .update({ 
      status, 
      admin_note: adminNote || null,
      updated_at: new Date().toISOString()
    })
    .eq('id', reportId)

  if (error) {
    return { success: false, error: '신고 처리에 실패했습니다.' }
  }

  // 만약 신고가 승인(upheld)되었다면, 신고된 사람의 매너 온도 패널티 부여 등 추가 로직을 넣을 수 있음
  // 이번에는 단순 신고 상태 처리만 진행.

  revalidatePath('/admin')
  revalidatePath(`/admin/reports/${reportId}`)
  return { success: true }
}
