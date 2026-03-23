import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/lib/types/database'
import { sendEmailNotification } from '@/lib/utils/send-notification'

type Business = Database['public']['Tables']['businesses']['Row']
type MessageInsert = Database['public']['Tables']['messages']['Insert']
type CheckAndSendAwayMessageOptions = {
  onlyOnFirstCustomerMessage?: boolean
}

/**
 * Check if welcome/away message should be sent and send it automatically
 * Sends once per conversation after the customer's first message (when requested)
 */
export async function checkAndSendAwayMessage(
  businessId: string,
  conversationId: string,
  options: CheckAndSendAwayMessageOptions = {}
): Promise<void> {
  const supabase = createClient()

  // Get business with away message settings
  const { data: business, error } = await supabase
    .from('businesses')
    .select('away_message_enabled, away_message')
    .eq('id', businessId)
    .single()

  if (error || !business) return

  // Type assertion needed because select with specific columns doesn't infer types correctly
  type BusinessAwayMessage = Pick<Business, 'away_message_enabled' | 'away_message'>
  const businessData = business as BusinessAwayMessage
  
  // Only send if away message is enabled and message is set
  if (!businessData.away_message_enabled || !businessData.away_message) {
    return
  }

  // Optional guard: only send after the first customer message in a conversation.
  if (options.onlyOnFirstCustomerMessage) {
    const { count: customerMessageCount, error: customerCountError } = await supabase
      .from('messages')
      .select('id', { count: 'exact', head: true })
      .eq('conversation_id', conversationId)
      .eq('sender_type', 'customer')

    if (customerCountError) {
      console.error('Failed to check customer message count:', customerCountError)
      return
    }

    if (customerMessageCount !== 1) {
      return
    }
  }

  const awayMessage = businessData.away_message

  // Check if this specific away message was already sent in this conversation
  // This ensures we don't send duplicate welcome messages
  const { data: existingAwayMessage, error: checkError } = await supabase
    .from('messages')
    .select('id')
    .eq('conversation_id', conversationId)
    .eq('sender_type', 'business')
    .eq('sender_id', businessId)
    .eq('content', awayMessage)
    .limit(1)
    .maybeSingle()

  // maybeSingle() returns null if no row found, so we check for data existence
  if (existingAwayMessage && !checkError) {
    return
  }

  // Send away message
  const message: MessageInsert = {
    conversation_id: conversationId,
    sender_type: 'business',
    sender_id: businessId,
    content: awayMessage,
    status: 'sent',
  }

  const { data: insertedMessage, error: insertError } = await supabase
    .from('messages')
    .insert(message as any)
    .select()
    .single()

  if (insertError) {
    console.error('Failed to insert away message:', insertError)
    return
  }

  // Update conversation updated_at
  await (supabase
    .from('conversations') as any)
    .update({ updated_at: new Date().toISOString() })
    .eq('id', conversationId)

  // Send email notification for away message (non-blocking)
  if (insertedMessage) {
    try {
      const { data: conversation } = await supabase
        .from('conversations')
        .select('*')
        .eq('id', conversationId)
        .single()

      if (conversation) {
        // Get full business data
        const { data: fullBusiness } = await supabase
          .from('businesses')
          .select('*')
          .eq('id', businessId)
          .single()

        if (fullBusiness) {
          sendEmailNotification(insertedMessage, conversation, fullBusiness).catch(
            (err) => console.error('Away message email notification error:', err)
          )
        }
      }
    } catch (err) {
      console.error('Failed to send away message email notification:', err)
    }
  }
}
