'use server'

import { createClient } from '@/lib/supabase/server'
import { calculateTrustWeight } from '@/lib/fraud/calculateTrustWeight'
import { revalidatePath } from 'next/cache'

interface SubmitReviewData {
  matchId: string
  revieweeId: string
  sportsmanship: boolean
  punctuality: boolean
  rematchScore: number // 1 to 5
}

export async function submitReview(data: SubmitReviewData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: '인증되지 않은 사용자입니다.' }
  }

  // 리뷰 인서트
  const { error } = await (supabase.from('reviews') as any)
    .insert({
      match_id: data.matchId,
      reviewer_id: user.id,
      reviewee_id: data.revieweeId,
      sportsmanship: data.sportsmanship,
      punctuality: data.punctuality,
      rematch_score: data.rematchScore,
    })

  if (error) {
    if (error.code === '23505') {
      return { success: false, error: '이미 해당 유저를 평가했습니다.' }
    }
    return { success: false, error: '평가 저장 중 오류가 발생했습니다.' }
  }

  // 매너 온도 로직 적용
  // 기본적으로 온도 변동 로직:
  // 스포츠맨십 좋음(+0.1), 나쁨(-0.1)
  // 시간 엄수 좋음(+0.1), 나쁨(-0.1)
  // 다시 하고 싶어요 점수 4~5(+0.1), 1~2(-0.1), 3(0)
  let tempChange = 0
  tempChange += data.sportsmanship ? 0.1 : -0.1
  tempChange += data.punctuality ? 0.1 : -0.1
  if (data.rematchScore >= 4) tempChange += 0.1
  else if (data.rematchScore <= 2) tempChange -= 0.1

  // 기존 유저 온도 가져오기
  const { data: reviewee } = await supabase
    .from('users')
    .select('manner_temperature')
    .eq('id', data.revieweeId)
    .single()

  if (reviewee) {
    let newTemp = ((reviewee as any).manner_temperature || 36.5) + tempChange
    // 온도 범위 제한 (0 ~ 100)
    newTemp = Math.max(0, Math.min(100, newTemp))

    await (supabase.from('users') as any)
      .update({ manner_temperature: newTemp })
      .eq('id', data.revieweeId)
  }

  revalidatePath(`/match/${data.matchId}/review`)
  return { success: true }
}

interface SubmitFraudReportData {
  matchId: string
  reportedId: string
  fraudType: 'tier_too_high' | 'tier_too_low'
}

export async function submitFraudReport(data: SubmitFraudReportData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: '인증되지 않은 사용자입니다.' }
  }

  // 신뢰도 가중치 계산
  const trustWeight = await calculateTrustWeight(user.id)

  // 신고 데이터 인서트
  const { error } = await (supabase.from('fraud_reports') as any)
    .insert({
      match_id: data.matchId,
      reporter_id: user.id,
      reported_id: data.reportedId,
      fraud_type: data.fraudType,
      trust_weight: trustWeight,
      status: 'pending'
    })

  if (error) {
    if (error.code === '23505') {
      return { success: false, error: '이미 해당 유저를 신고했습니다.' }
    }
    return { success: false, error: '신고 접수 중 오류가 발생했습니다.' }
  }

  return { success: true }
}
