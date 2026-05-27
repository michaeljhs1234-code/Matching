import { MatchStatus } from '@/types/database'
import { cn } from '@/lib/utils'

const STATUS_CONFIG: Record<MatchStatus, { label: string; className: string }> = {
  OPEN:        { label: '모집 중',  className: 'status-open' },
  FULL:        { label: '정원 마감', className: 'status-full' },
  BALANCING:   { label: '팀 배정 중', className: 'status-confirmed' },
  CONFIRMED:   { label: '배정 완료', className: 'status-confirmed' },
  IN_PROGRESS: { label: '경기 중',  className: 'status-in-progress' },
  COMPLETED:   { label: '경기 종료', className: 'status-completed' },
  REVIEWED:    { label: '평가 완료', className: 'status-completed' },
  CANCELLED:   { label: '취소됨',   className: 'status-cancelled' },
}

interface StatusBadgeProps {
  status: MatchStatus
  className?: string
}

export default function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status]
  return (
    <span className={cn('px-2.5 py-1 rounded-lg text-xs font-semibold', config.className, className)}>
      {config.label}
    </span>
  )
}
