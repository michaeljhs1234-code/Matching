'use client'

import { useState } from 'react'
import { ThumbsUp, ThumbsDown, AlertTriangle, Loader2, Star } from 'lucide-react'
import { submitReview, submitFraudReport } from '@/actions/review'

interface Props {
  matchId: string
  revieweeId: string
  hasReported: boolean
}

export default function ReviewForm({ matchId, revieweeId, hasReported }: Props) {
  const [sportsmanship, setSportsmanship] = useState<boolean | null>(null)
  const [punctuality, setPunctuality] = useState<boolean | null>(null)
  const [rematchScore, setRematchScore] = useState<number>(0)
  
  const [isSubmittingReview, setIsSubmittingReview] = useState(false)
  const [isSubmittingReport, setIsSubmittingReport] = useState(false)
  
  const [error, setError] = useState('')
  const [showReportForm, setShowReportForm] = useState(false)

  const handleReviewSubmit = async () => {
    if (sportsmanship === null || punctuality === null || rematchScore === 0) {
      setError('모든 항목을 평가해주세요.')
      return
    }
    
    setError('')
    setIsSubmittingReview(true)
    
    const result = await submitReview({
      matchId,
      revieweeId,
      sportsmanship,
      punctuality,
      rematchScore
    })

    if (!result.success && result.error) {
      setError(result.error)
    }
    
    setIsSubmittingReview(false)
  }

  const handleReportSubmit = async (type: 'tier_too_high' | 'tier_too_low') => {
    setIsSubmittingReport(true)
    const result = await submitFraudReport({
      matchId,
      reportedId: revieweeId,
      fraudType: type
    })

    if (!result.success && result.error) {
      alert(result.error)
    } else {
      alert('신고가 접수되었습니다. 관리자 확인 후 조치됩니다.')
      setShowReportForm(false)
    }
    setIsSubmittingReport(false)
  }

  return (
    <div className="space-y-4">
      {/* 스포츠맨십 */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-slate-300">스포츠맨십</span>
        <div className="flex gap-2">
          <button
            onClick={() => setSportsmanship(true)}
            className={`p-2 rounded-lg border transition-all ${
              sportsmanship === true 
                ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-400' 
                : 'border-slate-700 text-slate-500 hover:border-slate-600'
            }`}
          >
            <ThumbsUp className="w-4 h-4" />
          </button>
          <button
            onClick={() => setSportsmanship(false)}
            className={`p-2 rounded-lg border transition-all ${
              sportsmanship === false 
                ? 'bg-red-500/20 border-red-500/50 text-red-400' 
                : 'border-slate-700 text-slate-500 hover:border-slate-600'
            }`}
          >
            <ThumbsDown className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 시간 엄수 */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-slate-300">시간 엄수</span>
        <div className="flex gap-2">
          <button
            onClick={() => setPunctuality(true)}
            className={`p-2 rounded-lg border transition-all ${
              punctuality === true 
                ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-400' 
                : 'border-slate-700 text-slate-500 hover:border-slate-600'
            }`}
          >
            <ThumbsUp className="w-4 h-4" />
          </button>
          <button
            onClick={() => setPunctuality(false)}
            className={`p-2 rounded-lg border transition-all ${
              punctuality === false 
                ? 'bg-red-500/20 border-red-500/50 text-red-400' 
                : 'border-slate-700 text-slate-500 hover:border-slate-600'
            }`}
          >
            <ThumbsDown className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 다시 하고 싶어요 (별점) */}
      <div>
        <span className="block text-sm text-slate-300 mb-2">다시 함께 하고 싶나요? (1~5점)</span>
        <div className="flex items-center justify-center gap-1 bg-slate-900/50 p-2 rounded-xl border border-slate-800">
          {[1, 2, 3, 4, 5].map((score) => (
            <button
              key={score}
              onClick={() => setRematchScore(score)}
              className="p-1.5 transition-all"
            >
              <Star 
                className={`w-6 h-6 ${
                  rematchScore >= score 
                    ? 'fill-yellow-400 text-yellow-400' 
                    : 'text-slate-600 hover:text-slate-500'
                }`} 
              />
            </button>
          ))}
        </div>
      </div>

      {error && <p className="text-red-400 text-xs text-center">{error}</p>}

      <div className="flex gap-2 mt-4 pt-4 border-t border-slate-800">
        <button
          onClick={handleReviewSubmit}
          disabled={isSubmittingReview}
          className="flex-1 py-2.5 rounded-xl font-bold text-white btn-glow text-sm flex items-center justify-center gap-2"
          style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}
        >
          {isSubmittingReview ? <Loader2 className="w-4 h-4 animate-spin" /> : '평가 제출'}
        </button>

        {!hasReported && (
          <button
            onClick={() => setShowReportForm(!showReportForm)}
            className="px-3 py-2.5 rounded-xl font-bold text-red-400 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-all text-sm flex items-center gap-1.5"
          >
            <AlertTriangle className="w-4 h-4" />
            신고
          </button>
        )}
      </div>

      {showReportForm && (
        <div className="mt-3 p-3 bg-red-950/30 border border-red-900/50 rounded-xl space-y-2">
          <p className="text-xs text-slate-400 text-center mb-2">
            해당 유저의 실력이 등록된 티어와 심각하게 다를 경우 신고해주세요.
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => handleReportSubmit('tier_too_high')}
              disabled={isSubmittingReport}
              className="flex-1 py-2 rounded-lg bg-red-500/20 text-red-400 text-xs font-semibold hover:bg-red-500/30 transition-all"
            >
              실제 실력이 훨씬 낮음
            </button>
            <button
              onClick={() => handleReportSubmit('tier_too_low')}
              disabled={isSubmittingReport}
              className="flex-1 py-2 rounded-lg bg-red-500/20 text-red-400 text-xs font-semibold hover:bg-red-500/30 transition-all"
            >
              양학 (실력이 너무 높음)
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
