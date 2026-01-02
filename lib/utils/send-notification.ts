import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/lib/types/database'

type Message = Database['public']['Tables']['messages']['Row']
type Conversation = Database['public']['Tables']['conversations']['Row']
type Business = Database['public']['Tables']['businesses']['Row']

/**
 * Send email notification after message is sent
 * Cost optimization: Non-blocking, doesn't affect message sending flow
 */
export async function sendEmailNotification(
  message: Message,
  conversation: Conversation,
  business: Business
): Promise<void> {
  try {
    // Get base URL for chat links
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const chatUrl = `${baseUrl}/chat/${business.phone || business.id}/${conversation.id}`

    if (message.sender_type === 'business') {
      // Business sent message - notify customer
      await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'customer',
          customerEmail: conversation.customer_email,
          customerName: conversation.customer_name,
          businessName: business.business_name,
          messageContent: message.content,
          messageImageUrl: message.image_url,
          chatUrl,
        }),
      })
    } else {
      // Customer sent message - notify business
      await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'business',
          businessEmail: business.email,
          businessName: business.business_name,
          customerEmail: conversation.customer_email,
          customerName: conversation.customer_name,
          messageContent: message.content,
          messageImageUrl: message.image_url,
          chatUrl: `${baseUrl}/dashboard/${conversation.id}`,
        }),
      })
    }
  } catch (error) {
    // Don't throw - email failure shouldn't break message sending
    console.error('Failed to send email notification:', error)
  }
}

/**
 * Send email notifications for broadcast messages
 */
export async function sendBroadcastEmailNotifications(
  business: Business,
  messageContent: string,
  messageImageUrl: string | null,
  conversationIds: string[]
): Promise<void> {
  try {
    const supabase = createClient()
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    // Get all conversations
    const { data: conversations } = await supabase
      .from('conversations')
      .select('id, customer_email, customer_name')
      .in('id', conversationIds)

    if (!conversations) return

    // Send email to each customer
    const emailPromises = conversations.map((conv) =>
      fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'customer',
          customerEmail: conv.customer_email,
          customerName: conv.customer_name,
          businessName: business.business_name,
          messageContent,
          messageImageUrl,
          chatUrl: `${baseUrl}/chat/${business.phone || business.id}/${conv.id}`,
        }),
      })
    )

    await Promise.allSettled(emailPromises)
  } catch (error) {
    console.error('Failed to send broadcast email notifications:', error)
  }
}

