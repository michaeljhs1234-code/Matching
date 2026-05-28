export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      departments: {
        Row: {
          id: number
          college: string
          name: string
          created_at: string
        }
        Insert: {
          id?: number
          college: string
          name: string
          created_at?: string
        }
        Update: {
          id?: number
          college?: string
          name?: string
          created_at?: string
        }
      }
      users: {
        Row: {
          id: string
          name: string
          student_id: string
          department_id: number | null
          email: string
          email_verified: boolean
          manner_temperature: number
          role: 'student' | 'admin'
          is_active: boolean
          suspended_until: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          name: string
          student_id: string
          department_id?: number | null
          email: string
          email_verified?: boolean
          manner_temperature?: number
          role?: 'student' | 'admin'
          is_active?: boolean
          suspended_until?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          student_id?: string
          department_id?: number | null
          email?: string
          email_verified?: boolean
          manner_temperature?: number
          role?: 'student' | 'admin'
          is_active?: boolean
          suspended_until?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      sport_categories: {
        Row: {
          id: number
          name: string
          icon: string | null
          team_size: number
          created_at: string
        }
        Insert: {
          id?: number
          name: string
          icon?: string | null
          team_size: number
          created_at?: string
        }
        Update: {
          id?: number
          name?: string
          icon?: string | null
          team_size?: number
          created_at?: string
        }
      }
      user_sport_tiers: {
        Row: {
          id: number
          user_id: string
          sport_id: number
          tier_name: TierName
          tier_score: number
          is_locked: boolean
          locked_until: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          user_id: string
          sport_id: number
          tier_name: TierName
          tier_score: number
          is_locked?: boolean
          locked_until?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          user_id?: string
          sport_id?: number
          tier_name?: TierName
          tier_score?: number
          is_locked?: boolean
          locked_until?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      matches: {
        Row: {
          id: string
          sport_id: number
          title: string
          location: string | null
          scheduled_at: string
          max_participants: number
          status: MatchStatus
          host_user_id: string
          team_a_score: number | null
          team_b_score: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          sport_id: number
          title: string
          location?: string | null
          scheduled_at: string
          max_participants: number
          status?: MatchStatus
          host_user_id: string
          team_a_score?: number | null
          team_b_score?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          sport_id?: number
          title?: string
          location?: string | null
          scheduled_at?: string
          max_participants?: number
          status?: MatchStatus
          host_user_id?: string
          team_a_score?: number | null
          team_b_score?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      match_participants: {
        Row: {
          id: number
          match_id: string
          user_id: string
          group_id: string | null
          team: 'A' | 'B' | null
          tier_snapshot: number
          joined_at: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          match_id: string
          user_id: string
          group_id?: string | null
          team?: 'A' | 'B' | null
          tier_snapshot: number
          joined_at?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          match_id?: string
          user_id?: string
          group_id?: string | null
          team?: 'A' | 'B' | null
          tier_snapshot?: number
          joined_at?: string
          created_at?: string
          updated_at?: string
        }
      }
      groups: {
        Row: {
          id: string
          name: string
          host_user_id: string
          invite_token: string
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          host_user_id: string
          invite_token?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          host_user_id?: string
          invite_token?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      group_members: {
        Row: {
          id: number
          group_id: string
          user_id: string
          joined_at: string
        }
        Insert: {
          id?: number
          group_id: string
          user_id: string
          joined_at?: string
        }
        Update: {
          id?: number
          group_id?: string
          user_id?: string
          joined_at?: string
        }
      }
      reviews: {
        Row: {
          id: number
          match_id: string
          reviewer_id: string
          reviewee_id: string
          sportsmanship: boolean | null
          punctuality: boolean | null
          rematch_score: number | null
          created_at: string
        }
        Insert: {
          id?: number
          match_id: string
          reviewer_id: string
          reviewee_id: string
          sportsmanship?: boolean | null
          punctuality?: boolean | null
          rematch_score?: number | null
          created_at?: string
        }
        Update: {
          id?: number
          match_id?: string
          reviewer_id?: string
          reviewee_id?: string
          sportsmanship?: boolean | null
          punctuality?: boolean | null
          rematch_score?: number | null
          created_at?: string
        }
      }
      fraud_reports: {
        Row: {
          id: number
          match_id: string
          reporter_id: string
          reported_id: string
          fraud_type: 'tier_too_high' | 'tier_too_low'
          trust_weight: number | null
          status: 'pending' | 'under_review' | 'upheld' | 'dismissed'
          admin_note: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          match_id: string
          reporter_id: string
          reported_id: string
          fraud_type: 'tier_too_high' | 'tier_too_low'
          trust_weight?: number | null
          status?: 'pending' | 'under_review' | 'upheld' | 'dismissed'
          admin_note?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          match_id?: string
          reporter_id?: string
          reported_id?: string
          fraud_type?: 'tier_too_high' | 'tier_too_low'
          trust_weight?: number | null
          status?: 'pending' | 'under_review' | 'upheld' | 'dismissed'
          admin_note?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      tier_audit_log: {
        Row: {
          id: number
          user_id: string
          sport_id: number
          old_tier_score: number
          new_tier_score: number
          reason: string
          triggered_by: string | null
          created_at: string
        }
        Insert: {
          id?: number
          user_id: string
          sport_id: number
          old_tier_score: number
          new_tier_score: number
          reason: string
          triggered_by?: string | null
          created_at?: string
        }
        Update: {
          id?: number
          user_id?: string
          sport_id?: number
          old_tier_score?: number
          new_tier_score?: number
          reason?: string
          triggered_by?: string | null
          created_at?: string
        }
      }
      match_messages: {
        Row: {
          id: number
          match_id: string
          sender_id: string
          content: string
          is_deleted: boolean
          created_at: string
        }
        Insert: {
          id?: number
          match_id: string
          sender_id: string
          content: string
          is_deleted?: boolean
          created_at?: string
        }
        Update: {
          id?: number
          match_id?: string
          sender_id?: string
          content?: string
          is_deleted?: boolean
          created_at?: string
        }
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}

export type TierName =
  | 'rookie'
  | 'amateur_1'
  | 'amateur_2'
  | 'amateur_3'
  | 'amateur_4'
  | 'amateur_5'
  | 'semipro_1'
  | 'semipro_2'
  | 'semipro_3'
  | 'pro'

export type MatchStatus =
  | 'OPEN'
  | 'FULL'
  | 'BALANCING'
  | 'CONFIRMED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'REVIEWED'
  | 'CANCELLED'
