import { TierName, MatchStatus } from './database'

export type { TierName, MatchStatus }

export interface TierInfo {
  name: TierName
  label: string
  score: number
  color: string
  bgColor: string
}

export const TIER_MAP: Record<TierName, TierInfo> = {
  rookie:     { name: 'rookie',     label: '루키',       score: 0,   color: '#9ca3af', bgColor: '#f3f4f6' },
  amateur_1:  { name: 'amateur_1',  label: '아마추어 1', score: 10,  color: '#60a5fa', bgColor: '#eff6ff' },
  amateur_2:  { name: 'amateur_2',  label: '아마추어 2', score: 20,  color: '#3b82f6', bgColor: '#dbeafe' },
  amateur_3:  { name: 'amateur_3',  label: '아마추어 3', score: 30,  color: '#2563eb', bgColor: '#bfdbfe' },
  amateur_4:  { name: 'amateur_4',  label: '아마추어 4', score: 40,  color: '#1d4ed8', bgColor: '#93c5fd' },
  amateur_5:  { name: 'amateur_5',  label: '아마추어 5', score: 50,  color: '#1e40af', bgColor: '#60a5fa' },
  semipro_1:  { name: 'semipro_1',  label: '세미프로 1', score: 65,  color: '#7c3aed', bgColor: '#ede9fe' },
  semipro_2:  { name: 'semipro_2',  label: '세미프로 2', score: 75,  color: '#6d28d9', bgColor: '#ddd6fe' },
  semipro_3:  { name: 'semipro_3',  label: '세미프로 3', score: 85,  color: '#5b21b6', bgColor: '#c4b5fd' },
  pro:        { name: 'pro',        label: '프로',       score: 100, color: '#dc2626', bgColor: '#fef2f2' },
}

export const TIER_LIST: TierName[] = [
  'rookie',
  'amateur_1', 'amateur_2', 'amateur_3', 'amateur_4', 'amateur_5',
  'semipro_1', 'semipro_2', 'semipro_3',
  'pro',
]

export const SPORT_ICONS: Record<string, string> = {
  soccer:     '⚽',
  futsal:     '🥅',
  basketball: '🏀',
  bowling:    '🎳',
  esports:    '🎮',
}

export interface Participant {
  userId: string
  tierScore: number
  groupId?: string
  userName?: string
  tierName?: TierName
}

export interface BalancedTeams {
  teamA: Participant[]
  teamB: Participant[]
  scoreDiff: number
}
