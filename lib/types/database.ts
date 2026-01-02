/**
 * Database TypeScript Types
 * Generated from the complete database schema
 */

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
      businesses: {
        Row: {
          id: string
          email: string
          password_hash: string
          business_name: string | null
          phone: string | null
          address: string | null
          business_logo: string | null
          online: boolean
          away_message: string | null
          away_message_enabled: boolean
          is_admin: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          password_hash: string
          business_name?: string | null
          phone?: string | null
          address?: string | null
          business_logo?: string | null
          online?: boolean
          away_message?: string | null
          away_message_enabled?: boolean
          is_admin?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          password_hash?: string
          business_name?: string | null
          phone?: string | null
          address?: string | null
          business_logo?: string | null
          online?: boolean
          away_message?: string | null
          away_message_enabled?: boolean
          is_admin?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      conversations: {
        Row: {
          id: string
          business_id: string
          customer_phone: string | null
          customer_name: string | null
          customer_email: string
          pinned: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          business_id: string
          customer_phone?: string | null
          customer_name?: string | null
          customer_email: string
          pinned?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          business_id?: string
          customer_phone?: string | null
          customer_name?: string | null
          customer_email?: string
          pinned?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          conversation_id: string
          sender_type: 'business' | 'customer'
          sender_id: string
          content: string | null
          image_url: string | null
          status: 'sent' | 'delivered' | 'read'
          reply_to_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          conversation_id: string
          sender_type: 'business' | 'customer'
          sender_id: string
          content?: string | null
          image_url?: string | null
          status?: 'sent' | 'delivered' | 'read'
          reply_to_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          conversation_id?: string
          sender_type?: 'business' | 'customer'
          sender_id?: string
          content?: string | null
          image_url?: string | null
          status?: 'sent' | 'delivered' | 'read'
          reply_to_id?: string | null
          created_at?: string
        }
      }
      images: {
        Row: {
          id: string
          message_id: string | null
          business_id: string
          url: string
          filename: string | null
          created_at: string
        }
        Insert: {
          id?: string
          message_id?: string | null
          business_id: string
          url: string
          filename?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          message_id?: string | null
          business_id?: string
          url?: string
          filename?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

/**
 * Helper types for pagination
 * Cost optimization: Cursor-based pagination reduces database load
 */
export type PaginationCursor = {
  created_at: string
  id: string
}

export type PaginatedResponse<T> = {
  data: T[]
  nextCursor: PaginationCursor | null
  hasMore: boolean
}

/**
 * Realtime payload types
 * Cost optimization: Only subscribe to specific tables/channels
 */
export type RealtimeMessagePayload = {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE'
  new: Database['public']['Tables']['messages']['Row']
  old: Database['public']['Tables']['messages']['Row'] | null
}

export type RealtimeConversationPayload = {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE'
  new: Database['public']['Tables']['conversations']['Row']
  old: Database['public']['Tables']['conversations']['Row'] | null
}

