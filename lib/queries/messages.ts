import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { sendEmailNotification } from '@/lib/utils/send-notification'
import type { Database, PaginationCursor } from '@/lib/types/database'

type Message = Database['public']['Tables']['messages']['Row']
type MessageInsert = Database['public']['Tables']['messages']['Insert']
type MessageUpdate = Database['public']['Tables']['messages']['Update']

const MESSAGES_PER_PAGE = 20

/**
 * Fetch messages for a conversation with cursor-based pagination
 * Cost optimization: 
 * - Only fetches 20 messages at a time
 * - Uses index on (conversation_id, created_at DESC)
 * - Only selects required columns
 */
export function useMessages(conversationId: string | null) {
  const supabase = createClient()

  return useInfiniteQuery({
    queryKey: ['messages', conversationId],
    queryFn: async ({ pageParam }: { pageParam: PaginationCursor | null }) => {
      if (!conversationId) return { data: [], nextCursor: null, hasMore: false }

      let query = supabase
        .from('messages')
        .select('id, conversation_id, sender_type, sender_id, content, image_url, status, reply_to_id, created_at')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: false })
        .limit(MESSAGES_PER_PAGE + 1) // Fetch one extra to check if there's more

      // Apply cursor for pagination
      if (pageParam) {
        query = query.lt('created_at', pageParam.created_at)
      }

      const { data, error } = await query

      if (error) throw error

      const messages = (data || []) as Message[]
      const hasMore = messages.length > MESSAGES_PER_PAGE
      const messagesToReturn = hasMore ? messages.slice(0, MESSAGES_PER_PAGE) : messages

      // Reverse to show oldest first (for chat UI)
      const reversed = messagesToReturn.reverse()

      const nextCursor: PaginationCursor | null =
        hasMore && reversed.length > 0
          ? {
              created_at: reversed[0].created_at,
              id: reversed[0].id,
            }
          : null

      return {
        data: reversed,
        nextCursor,
        hasMore,
      }
    },
    initialPageParam: null as PaginationCursor | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    enabled: !!conversationId,
  })
}

/**
 * Send a new message
 * Cost optimization: Single insert, triggers conversation update via trigger (if exists)
 */
export function useSendMessage() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async (message: Omit<MessageInsert, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          ...message,
          status: 'sent',
        })
        .select()
        .single()

      if (error) throw error

      // Update conversation updated_at
      await supabase
        .from('conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', message.conversation_id)

      const messageData = data as Message

      // Send email notification (non-blocking)
      try {
        // Get conversation data
        const { data: conversation } = await supabase
          .from('conversations')
          .select('*')
          .eq('id', message.conversation_id)
          .single()

        if (!conversation) return messageData

        // Get business data
        let business
        if (message.sender_type === 'business') {
          // Business sent message - get business from sender_id
          const { data: businessData } = await supabase
            .from('businesses')
            .select('*')
            .eq('id', message.sender_id)
            .single()
          business = businessData
        } else {
          // Customer sent message - get business from conversation
          const { data: businessData } = await supabase
            .from('businesses')
            .select('*')
            .eq('id', conversation.business_id)
            .single()
          business = businessData
        }

        if (business) {
          // Send email notification asynchronously (don't wait)
          sendEmailNotification(messageData, conversation, business).catch(
            (err) => console.error('Email notification error:', err)
          )
        }
      } catch (err) {
        // Don't fail message sending if email fails
        console.error('Failed to prepare email notification:', err)
      }

      return messageData
    },
    onSuccess: (data) => {
      // Invalidate queries - realtime will handle the update to prevent duplicates
      queryClient.invalidateQueries({ queryKey: ['messages', data.conversation_id] })
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
    },
  })
}

/**
 * Update message (edit, delete, status)
 * Cost optimization: Single row update
 */
export function useUpdateMessage() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async ({
      messageId,
      updates,
    }: {
      messageId: string
      updates: MessageUpdate
    }) => {
      const { data, error } = await supabase
        .from('messages')
        .update(updates)
        .eq('id', messageId)
        .select()
        .single()

      if (error) throw error
      return data as Message
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['messages', data.conversation_id] })
    },
  })
}

/**
 * Delete message (business only)
 */
export function useDeleteMessage() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async (messageId: string) => {
      // Get message first to know conversation_id
      const { data: message } = await supabase
        .from('messages')
        .select('conversation_id')
        .eq('id', messageId)
        .single()

      const { error } = await supabase
        .from('messages')
        .delete()
        .eq('id', messageId)

      if (error) throw error
      return { messageId, conversationId: message?.conversation_id }
    },
    onSuccess: ({ conversationId }) => {
      if (conversationId) {
        queryClient.invalidateQueries({ queryKey: ['messages', conversationId] })
      }
    },
  })
}

/**
 * Mark messages as read
 * Cost optimization: Batch update by conversation_id
 */
export function useMarkMessagesAsRead() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async (conversationId: string) => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) throw new Error('Not authenticated')

      // Update all unread messages in this conversation
      const { error } = await supabase
        .from('messages')
        .update({ status: 'read' })
        .eq('conversation_id', conversationId)
        .eq('sender_type', 'customer')
        .in('status', ['sent', 'delivered'])

      if (error) throw error
      return { conversationId }
    },
    onSuccess: ({ conversationId }) => {
      queryClient.invalidateQueries({ queryKey: ['messages', conversationId] })
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
    },
  })
}

/**
 * Broadcast message to all conversations for a business
 * Cost optimization: Single query to get all conversation IDs, then batch insert
 */
export async function broadcastMessage(
  businessId: string,
  content: string,
  imageUrl?: string
): Promise<void> {
  const supabase = createClient()

  // Get business data for email
  const { data: business, error: businessError } = await supabase
    .from('businesses')
    .select('*')
    .eq('id', businessId)
    .single()

  if (businessError) throw businessError

  // Get all conversation IDs for this business
  const { data: conversations, error: fetchError } = await supabase
    .from('conversations')
    .select('id')
    .eq('business_id', businessId)

  if (fetchError) throw fetchError
  if (!conversations || conversations.length === 0) return

  // Batch insert messages
  const messages: MessageInsert[] = conversations.map((conv) => ({
    conversation_id: conv.id,
    sender_type: 'business',
    sender_id: businessId,
    content,
    image_url: imageUrl || null,
    status: 'sent',
  }))

  const { error: insertError } = await supabase
    .from('messages')
    .insert(messages)

  if (insertError) throw insertError

  // Update all conversations' updated_at
  await supabase
    .from('conversations')
    .update({ updated_at: new Date().toISOString() })
    .in('id', conversations.map((c) => c.id))

  // Send email notifications (non-blocking)
  if (business) {
    sendBroadcastEmailNotifications(
      business,
      content,
      imageUrl || null,
      conversations.map((c) => c.id)
    ).catch((err) => console.error('Broadcast email notification error:', err))
  }
}

