import { createAdminClient } from '@/lib/supabase/admin'
import type { Database } from '@/lib/types/database'

type BusinessRow = Database['public']['Tables']['businesses']['Row']
type ConversationRow = Database['public']['Tables']['conversations']['Row']
type MessageRow = Database['public']['Tables']['messages']['Row']
type AdRow = Database['public']['Tables']['ads']['Row']

export type AdminMessage = Pick<
  MessageRow,
  | 'id'
  | 'conversation_id'
  | 'sender_type'
  | 'sender_id'
  | 'content'
  | 'image_url'
  | 'status'
  | 'reply_to_id'
  | 'created_at'
>

export type AdminConversation = Pick<
  ConversationRow,
  | 'id'
  | 'business_id'
  | 'customer_phone'
  | 'customer_name'
  | 'customer_email'
  | 'pinned'
  | 'created_at'
  | 'updated_at'
> & {
  latest_message: AdminMessage | null
  message_count: number
  messages: AdminMessage[]
  unread_count: number
}

export type AdminBusiness = Pick<
  BusinessRow,
  | 'id'
  | 'email'
  | 'business_name'
  | 'phone'
  | 'address'
  | 'business_logo'
  | 'online'
  | 'away_message_enabled'
  | 'is_admin'
  | 'created_at'
  | 'updated_at'
> & {
  conversation_count: number
  conversations: AdminConversation[]
  message_count: number
}

export type AdminAd = Pick<
  AdRow,
  | 'id'
  | 'title'
  | 'description'
  | 'image_url'
  | 'video_url'
  | 'target_url'
  | 'placement'
  | 'duration_seconds'
  | 'sort_order'
  | 'active'
  | 'starts_at'
  | 'ends_at'
  | 'created_at'
  | 'updated_at'
>

export type AdminDashboardData = {
  ads: AdminAd[]
  businesses: AdminBusiness[]
  totals: {
    active_ads: number
    ads: number
    businesses: number
    conversations: number
    messages: number
  }
}

type SupabaseError = {
  message: string
}

type SupabasePage<T> = {
  data: T[] | null
  error: SupabaseError | null
}

const PAGE_SIZE = 1000
const CONVERSATION_ID_CHUNK_SIZE = 100
const BUSINESS_ID_CHUNK_SIZE = 100

async function fetchAllPages<T>(
  label: string,
  fetchPage: (from: number, to: number) => Promise<SupabasePage<T>>
) {
  const rows: T[] = []

  for (let from = 0; ; from += PAGE_SIZE) {
    const to = from + PAGE_SIZE - 1
    const { data, error } = await fetchPage(from, to)

    if (error) {
      throw new Error(`Failed to load ${label}: ${error.message}`)
    }

    const pageRows = data || []
    rows.push(...pageRows)

    if (pageRows.length < PAGE_SIZE) {
      break
    }
  }

  return rows
}

function chunkArray<T>(items: T[], chunkSize: number) {
  const chunks: T[][] = []

  for (let index = 0; index < items.length; index += chunkSize) {
    chunks.push(items.slice(index, index + chunkSize))
  }

  return chunks
}

function sortByNewestUpdate(
  left: Pick<ConversationRow, 'updated_at'>,
  right: Pick<ConversationRow, 'updated_at'>
) {
  return new Date(right.updated_at).getTime() - new Date(left.updated_at).getTime()
}

export async function getAdminDashboardData(): Promise<AdminDashboardData> {
  const supabase = createAdminClient()

  const ads = await fetchAllPages<AdminAd>('ads', async (from, to) => {
    const result = await supabase
      .from('ads')
      .select(
        'id, title, description, image_url, video_url, target_url, placement, duration_seconds, sort_order, active, starts_at, ends_at, created_at, updated_at'
      )
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false })
      .range(from, to)

    return {
      data: result.data as AdminAd[] | null,
      error: result.error,
    }
  })

  const conversations = await fetchAllPages<
    Omit<
      AdminConversation,
      'latest_message' | 'message_count' | 'messages' | 'unread_count'
    >
  >('conversations', async (from, to) => {
    const result = await supabase
      .from('conversations')
      .select(
        'id, business_id, customer_phone, customer_name, customer_email, pinned, created_at, updated_at'
      )
      .order('updated_at', { ascending: false })
      .range(from, to)

    return {
      data: result.data as
        | Omit<
            AdminConversation,
            'latest_message' | 'message_count' | 'messages' | 'unread_count'
          >[]
        | null,
      error: result.error,
    }
  })

  const businessIdsWithConversations = Array.from(
    new Set(conversations.map((conversation) => conversation.business_id))
  )
  const businesses: AdminBusiness[] = []

  for (const businessIdChunk of chunkArray(
    businessIdsWithConversations,
    BUSINESS_ID_CHUNK_SIZE
  )) {
    const chunkBusinesses = await fetchAllPages<AdminBusiness>(
      'businesses with conversations',
      async (from, to) => {
        const result = await supabase
          .from('businesses')
          .select(
            'id, email, business_name, phone, address, business_logo, online, away_message_enabled, is_admin, created_at, updated_at'
          )
          .in('id', businessIdChunk)
          .order('created_at', { ascending: false })
          .range(from, to)

        return {
          data: result.data as AdminBusiness[] | null,
          error: result.error,
        }
      }
    )

    businesses.push(...chunkBusinesses)
  }

  const conversationIds = conversations.map((conversation) => conversation.id)
  const messages: AdminMessage[] = []

  for (const conversationIdChunk of chunkArray(
    conversationIds,
    CONVERSATION_ID_CHUNK_SIZE
  )) {
    const chunkMessages = await fetchAllPages<AdminMessage>(
      'messages',
      async (from, to) => {
        const result = await supabase
          .from('messages')
          .select(
            'id, conversation_id, sender_type, sender_id, content, image_url, status, reply_to_id, created_at'
          )
          .in('conversation_id', conversationIdChunk)
          .order('created_at', { ascending: true })
          .range(from, to)

        return {
          data: result.data as AdminMessage[] | null,
          error: result.error,
        }
      }
    )

    messages.push(...chunkMessages)
  }

  const messagesByConversation = new Map<string, AdminMessage[]>()

  for (const conversation of conversations) {
    messagesByConversation.set(conversation.id, [])
  }

  for (const message of messages) {
    const conversationMessages = messagesByConversation.get(message.conversation_id)
    if (conversationMessages) {
      conversationMessages.push(message)
    }
  }

  const enrichedConversations: AdminConversation[] = conversations
    .map((conversation) => {
      const conversationMessages = messagesByConversation.get(conversation.id) || []
      const sortedMessages = conversationMessages.sort(
        (left, right) =>
          new Date(left.created_at).getTime() - new Date(right.created_at).getTime()
      )
      const latestMessage = sortedMessages[sortedMessages.length - 1] || null
      const unreadCount = sortedMessages.filter(
        (message) =>
          message.sender_type === 'customer' &&
          (message.status === 'sent' || message.status === 'delivered')
      ).length

      return {
        ...conversation,
        latest_message: latestMessage,
        message_count: sortedMessages.length,
        messages: sortedMessages,
        unread_count: unreadCount,
      }
    })
    .sort((left, right) => {
      if (left.pinned !== right.pinned) {
        return left.pinned ? -1 : 1
      }

      return sortByNewestUpdate(left, right)
    })

  const conversationsByBusiness = new Map<string, AdminConversation[]>()

  for (const conversation of enrichedConversations) {
    const businessConversations =
      conversationsByBusiness.get(conversation.business_id) || []
    businessConversations.push(conversation)
    conversationsByBusiness.set(conversation.business_id, businessConversations)
  }

  const businessesWithConversations = businesses.map((business) => {
    const businessConversations = conversationsByBusiness.get(business.id) || []
    const messageCount = businessConversations.reduce(
      (total, conversation) => total + conversation.message_count,
      0
    )

    return {
      ...business,
      conversation_count: businessConversations.length,
      conversations: businessConversations,
      message_count: messageCount,
    }
  })

  return {
    ads,
    businesses: businessesWithConversations,
    totals: {
      active_ads: ads.filter((ad) => ad.active).length,
      ads: ads.length,
      businesses: businessesWithConversations.length,
      conversations: enrichedConversations.length,
      messages: messages.length,
    },
  }
}
