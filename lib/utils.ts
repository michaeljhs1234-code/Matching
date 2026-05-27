import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatDateShort(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('ko-KR', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function getMannerColor(temp: number): string {
  if (temp >= 70) return '#22c55e'
  if (temp >= 50) return '#eab308'
  if (temp >= 30) return '#f97316'
  return '#ef4444'
}

export function getMannerLabel(temp: number): string {
  if (temp >= 80) return '매너왕 🏆'
  if (temp >= 60) return '좋은 매너 😊'
  if (temp >= 40) return '보통 😐'
  if (temp >= 20) return '주의 필요 😕'
  return '매너 주의 ⚠️'
}
