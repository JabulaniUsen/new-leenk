'use client'

import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { RealtimeMessagePayload } from '@/lib/types/database'

/**
 * Subscribe to realtime messages for a specific conversation
 * Cost optimization: 
 * - Only subscribes to one conversation at a time
 * - Filters by conversation_id in the subscription
 * - Unsubscribes on unmount
 */
export function useRealtimeMessages(conversationId: string | null) {
  const queryClient = useQueryClient()
  const supabase = createClient()

  useEffect(() => {
    if (!conversationId) return

    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload: RealtimeMessagePayload) => {
          // Invalidate and refetch messages for this conversation
          queryClient.invalidateQueries({
            queryKey: ['messages', conversationId],
          })

          // Also invalidate conversations to update last message preview
          queryClient.invalidateQueries({
            queryKey: ['conversations'],
          })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [conversationId, queryClient, supabase])
}

