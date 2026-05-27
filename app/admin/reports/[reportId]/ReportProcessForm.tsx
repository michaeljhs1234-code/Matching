'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, CheckCircle, XCircle } from 'lucide-react'
import { processFraudReport } from '@/actions/admin'

interface Props {
  reportId: number
  currentStatus: string
}

export default function ReportProcessForm({ reportId }: Props) {
  const router = useRouter()
  const [adminNote, setAdminNote] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleProcess = async (status: 'upheld' | 'dismissed') => {
    setIsSubmitting(true)
    setError('')

    const result = await processFraudReport({
      reportId,
      status,
      adminNote: adminNote.trim() || undefined
    })

    if (!result.success && result.error) {
      setError(result.error)
      setIsSubmitting(false)
    } else {
      router.refresh()
    }
  }

  return (
    <div className="glass rounded-2xl p-6 border border-white/10">
      <h3 className="text-lg font-bold mb-4">신고 처리</h3>
      
      <div className="mb-6">
        <label className="block text-sm font-medium text-slate-300 mb-2">
          관리자 검토 메모 (선택)
        </label>
        <textarea
          value={adminNote}
          onChange={(e) => setAdminNote(e.target.value)}
          placeholder="처리 사유를 기록하세요..."
          className="w-full h-24 px-4 py-3 rounded-xl border text-sm resize-none"
          style={{ background: 'rgba(15,15,26,0.8)', borderColor: '#1e293b', color: '#f1f5f9' }}
        />
      </div>

      {error && <p className="text-red-400 text-xs mb-4">{error}</p>}

      <div className="flex gap-3">
        <button
          onClick={() => handleProcess('upheld')}
          disabled={isSubmitting}
          className="flex-1 py-3 rounded-xl font-bold text-white bg-red-600 hover:bg-red-500 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
          신고 승인 (제재)
        </button>
        <button
          onClick={() => handleProcess('dismissed')}
          disabled={isSubmitting}
          className="flex-1 py-3 rounded-xl font-bold text-white bg-slate-700 hover:bg-slate-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
          신고 반려 (허위)
        </button>
      </div>
    </div>
  )
}
