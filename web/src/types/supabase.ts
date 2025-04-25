// File: web/src/types/supabase.ts
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Project = Database['public']['Tables']['projects']['Row'];
export type Block = Database['public']['Tables']['blocks']['Row'];

export interface Database {
  public: {
    Tables: {
      projects: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      blocks: {
        Row: {
          id: string
          project_id: string
          type: string
          content: string | null
          metadata: Json
          position: number | null
          level: number | null
          created_at: string
        }
        Insert: {
          id?: string
          project_id: string
          type: string
          content?: string | null
          metadata?: Json
          position?: number | null
          level?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          type?: string
          content?: string | null
          metadata?: Json
          position?: number | null
          level?: number | null
          created_at?: string
        }
      }
    }
  }
}