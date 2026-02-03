import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { createClient } from '@supabase/supabase-js'

export const supabase = createClientComponentClient()

// For server-side operations
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          name: string | null
          created_at: string
        }
        Insert: {
          id: string
          email: string
          name?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string | null
          created_at?: string
        }
      }
      preferences: {
        Row: {
          user_id: string
          auto_start_sessions: boolean
          auto_start_breaks: boolean
          volume: number
          sound_theme: string
          monthly_email_opt_in: boolean
          timezone: string
          updated_at: string
        }
        Insert: {
          user_id: string
          auto_start_sessions?: boolean
          auto_start_breaks?: boolean
          volume?: number
          sound_theme?: string
          monthly_email_opt_in?: boolean
          timezone?: string
          updated_at?: string
        }
        Update: {
          user_id?: string
          auto_start_sessions?: boolean
          auto_start_breaks?: boolean
          volume?: number
          sound_theme?: string
          monthly_email_opt_in?: boolean
          timezone?: string
          updated_at?: string
        }
      }
      sessions: {
        Row: {
          id: string
          user_id: string
          type: 'short' | 'long'
          duration_seconds: number
          started_at: string
          ended_at: string
          note: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: 'short' | 'long'
          duration_seconds: number
          started_at: string
          ended_at: string
          note?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: 'short' | 'long'
          duration_seconds?: number
          started_at?: string
          ended_at?: string
          note?: string | null
          created_at?: string
        }
      }
      email_reports: {
        Row: {
          id: string
          user_id: string
          month: string
          sent_at: string
          totals_json: any
          created_at: string
        }
      }
    }
  }
}
