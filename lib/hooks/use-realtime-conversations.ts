'use client'

import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { RealtimeConversationPayload, RealtimeMessagePayload } from '@/lib/types/database'

/**
 * Subscribe to realtime conversations for current business
 * Cost optimization:
 * - Only subscribes to conversations for authenticated business
 * - Filters by business_id in the subscription
 * - Also listens to messages to update previews and unread counts
 * - Unsubscribes on unmount
 */
export function useRealtimeConversations(businessId: string | null) {
  const queryClient = useQueryClient()
  const supabase = createClient()

  useEffect(() => {
    if (!businessId) return

    const channel = supabase
      .channel(`conversations:${businessId}`)
      .on(
        'postgres_changes' as any,
        {
          event: '*',
          schema: 'public',
          table: 'conversations',
          filter: `business_id=eq.${businessId}`,
        },
        (payload: RealtimeConversationPayload) => {
          // Invalidate conversations list
          queryClient.invalidateQueries({
            queryKey: ['conversations'],
          })
        }
      )
      .on(
        'postgres_changes' as any,
        {
          event: '*',
          schema: 'public',
          table: 'messages',
        },
        (payload: RealtimeMessagePayload) => {
          // When messages change, invalidate conversations to update previews and unread counts
          // We need to check if the message belongs to this business's conversations
          queryClient.invalidateQueries({
            queryKey: ['conversations'],
          })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [businessId, queryClient, supabase])
}

