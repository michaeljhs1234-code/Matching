import { createClient } from '@/lib/supabase/server'

/**
 * 신고자의 매너 온도와 과거 허위 신고 이력을 바탕으로 신뢰도 가중치를 계산합니다.
 * Weight = (MannerTemp / 36.5) * (1 - PriorFalseReports * 0.2)
 */
export async function calculateTrustWeight(reporterId: string): Promise<number> {
  const supabase = await createClient()

  // 1. 신고자의 매너 온도 가져오기
  const { data: user } = await supabase
    .from('users')
    .select('manner_temperature')
    .eq('id', reporterId)
    .single()

  const mannerTemp = user?.manner_temperature ?? 36.5

  // 2. 신고자의 과거 허위 신고(반려된 신고) 이력 가져오기
  const { count: priorFalseReports } = await supabase
    .from('fraud_reports')
    .select('id', { count: 'exact', head: true })
    .eq('reporter_id', reporterId)
    .eq('status', 'dismissed')

  const falseCount = priorFalseReports ?? 0
  
  // 3. 공식에 따른 가중치 계산
  // (1 - PriorFalseReports * 0.2)는 최소 0으로 제한 (음수 방지)
  const falseReportPenalty = Math.max(0, 1 - (falseCount * 0.2))
  let weight = (mannerTemp / 36.5) * falseReportPenalty

  // 소수점 2자리까지만 반올림
  return Math.round(weight * 100) / 100
}
