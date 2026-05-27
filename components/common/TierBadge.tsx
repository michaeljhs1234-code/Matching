import { cn } from '@/lib/utils'
import { TierName, TIER_MAP } from '@/types'

interface TierBadgeProps {
  tier: TierName
  size?: 'xs' | 'sm' | 'md'
  className?: string
}

export default function TierBadge({ tier, size = 'sm', className }: TierBadgeProps) {
  const info = TIER_MAP[tier]

  const sizeClasses = {
    xs: 'px-1.5 py-0.5 text-[10px]',
    sm: 'px-2.5 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
  }

  const tierClass = tier === 'rookie'
    ? 'tier-rookie'
    : tier.startsWith('amateur')
    ? 'tier-amateur'
    : tier.startsWith('semipro')
    ? 'tier-semipro'
    : 'tier-pro'

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-lg font-bold tracking-wide',
        tierClass,
        sizeClasses[size],
        className
      )}
    >
      {info.label}
    </span>
  )
}
