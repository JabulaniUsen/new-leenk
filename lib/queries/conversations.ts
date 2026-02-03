import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/lib/types/database'

type Conversation = Database['public']['Tables']['conversations']['Row']
type ConversationInsert = Database['public']['Tables']['conversations']['Insert']
type ConversationUpdate = Database['public']['Tables']['conversations']['Update']

const MESSAGES_PER_PAGE = 20

/**
 * Fetch conversations for current business
 * Cost optimization: Paginated, ordered by updated_at DESC (uses index)
 * Only fetches essential columns
 */
export function useConversations() {
  const supabase = createClient()

  return useQuery({
    queryKey: ['conversations'],
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('conversations')
        .select('id, business_id, customer_email, customer_name, customer_phone, pinned, updated_at, created_at')
        .eq('business_id', user.id)
        .order('pinned', { ascending: false })
        .order('updated_at', { ascending: false })
        .limit(100) // Reasonable limit to prevent huge queries

      if (error) throw error
      
      const conversations = (data || []) as Conversation[]
      
      // Fetch unread counts and latest messages for each conversation
      const conversationsWithExtras = await Promise.all(
        conversations.map(async (conv) => {
          // Get unread count (customer messages that are not read)
          const { count: unreadCount, error: unreadError } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('conversation_id', conv.id)
            .eq('sender_type', 'customer')
            .in('status', ['sent', 'delivered'])

          // Get latest message preview (handle case where no messages exist)
          const { data: latestMessages } = await supabase
            .from('messages')
            .select('content, image_url, sender_type')
            .eq('conversation_id', conv.id)
            .order('created_at', { ascending: false })
            .limit(1)

          type MessagePreview = { content: string | null; image_url: string | null; sender_type: string }
          const latestMessage = (latestMessages && latestMessages.length > 0 ? latestMessages[0] : null) as MessagePreview | null
          
          // Determine preview text
          let preview = ''
          if (latestMessage) {
            if (latestMessage.content) {
              preview = latestMessage.content
            } else if (latestMessage.image_url) {
              preview = 'Image'
            }
          }

          return {
            ...conv,
            unread_count: unreadCount || 0,
            latest_message_preview: preview,
          }
        })
      )

      return conversationsWithExtras
    },
  })
}

/**
 * Fetch single conversation by ID
 * Cost optimization: Single row lookup
 */
export function useConversation(conversationId: string | null) {
  return useQuery({
    queryKey: ['conversation', conversationId],
    queryFn: async () => {
      if (!conversationId) return null

      const supabase = createClient()
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .eq('id', conversationId)
        .single()

      if (error) throw error
      return data as Conversation
    },
    enabled: !!conversationId,
  })
}

/**
 * Find or create conversation for customer
 * Cost optimization: Uses unique constraint to prevent duplicates
 */
export function useFindOrCreateConversation() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async ({
      businessId,
      customerEmail,
      customerName,
      customerPhone,
    }: {
      businessId: string
      customerEmail: string
      customerName?: string
      customerPhone?: string
    }) => {
      // Try to find existing conversation
      const { data: existing } = await supabase
        .from('conversations')
        .select('*')
        .eq('business_id', businessId)
        .eq('customer_email', customerEmail)
        .single()

      if (existing) {
        const existingConv = existing as Conversation
        // Update name/phone if provided
        if (customerName || customerPhone) {
          const updates: ConversationUpdate = {
            customer_name: customerName || existingConv.customer_name,
            customer_phone: customerPhone || existingConv.customer_phone,
            updated_at: new Date().toISOString(),
          }
          const { data, error } = await (supabase
            .from('conversations') as any)
            .update(updates)
            .eq('id', existingConv.id)
            .select()
            .single()

          if (error) throw error
          return data as Conversation
        }
        return existingConv
      }

      // Create new conversation
      const insert: ConversationInsert = {
        business_id: businessId,
        customer_email: customerEmail,
        customer_name: customerName || null,
        customer_phone: customerPhone || null,
      }

      const { data, error } = await (supabase
        .from('conversations') as any)
        .insert(insert)
        .select()
        .single()

      if (error) throw error
      
      const newConversation = data as Conversation
      
      // Send welcome message for new conversation (non-blocking)
      // Import dynamically to avoid circular dependencies
      import('@/lib/utils/away-message').then(({ checkAndSendAwayMessage }) => {
        checkAndSendAwayMessage(businessId, newConversation.id).catch(
          (err) => console.error('Failed to send welcome message:', err)
        )
      })
      
      return newConversation
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
    },
  })
}

/**
 * Check if conversation exists for email and business
 * Cost optimization: Single row lookup with index
 */
export async function checkConversationExists(
  businessId: string,
  customerEmail: string
): Promise<boolean> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('conversations')
    .select('id')
    .eq('business_id', businessId)
    .eq('customer_email', customerEmail)
    .single()

  // If error and it's not a "not found" error, throw it
  if (error && error.code !== 'PGRST116') {
    throw error
  }

  return !!data
}

/**
 * Update conversation (pin, update name, etc.)
 */
export function useUpdateConversation() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async ({
      conversationId,
      updates,
    }: {
      conversationId: string
      updates: ConversationUpdate
    }) => {
      const updateData: ConversationUpdate = {
        ...updates,
        updated_at: new Date().toISOString(),
      }
      const { data, error } = await (supabase
        .from('conversations') as any)
        .update(updateData)
        .eq('id', conversationId)
        .select()
        .single()

      if (error) throw error
      return data as Conversation
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
    },
  })
}

/**
 * Delete conversation (business only)
 * Cost optimization: Deletes messages first, then conversation
 */
export function useDeleteConversation() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async (conversationId: string) => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) throw new Error('Not authenticated')

      // Verify the conversation belongs to the business
      const { data: conversation, error: fetchError } = await supabase
        .from('conversations')
        .select('business_id')
        .eq('id', conversationId)
        .single()

      if (fetchError) throw fetchError
      if (!conversation) {
        throw new Error('Conversation not found')
      }
      
      const conversationData = conversation as { business_id: string }
      if (conversationData.business_id !== user.id) {
        throw new Error('Unauthorized: Conversation does not belong to this business')
      }

      // Delete all messages in the conversation first
      const { error: messagesError } = await (supabase
        .from('messages') as any)
        .delete()
        .eq('conversation_id', conversationId)

      if (messagesError) throw messagesError

      // Delete the conversation
      const { error: conversationError } = await (supabase
        .from('conversations') as any)
        .delete()
        .eq('id', conversationId)

      if (conversationError) throw conversationError

      return { conversationId }
    },
    onSuccess: ({ conversationId }) => {
      // Invalidate all related queries
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
      queryClient.invalidateQueries({ queryKey: ['conversation', conversationId] })
      queryClient.invalidateQueries({ queryKey: ['messages', conversationId] })
    },
  })
}

