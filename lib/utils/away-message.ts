import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/lib/types/database'
import { sendEmailNotification } from '@/lib/utils/send-notification'

type Business = Database['public']['Tables']['businesses']['Row']
type MessageInsert = Database['public']['Tables']['messages']['Insert']

/**
 * Check if welcome/away message should be sent and send it automatically
 * Sends once per conversation when customer enters the chat
 * Cost optimization: Only checks if message was ever sent in this conversation
 */
export async function checkAndSendAwayMessage(
  businessId: string,
  conversationId: string
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
  
  const awayMessage = businessData.away_message

  // Check if away message was already sent in this conversation (ever)
  // This ensures it only sends once per conversation as a welcome message
  const { data: existingAwayMessage } = await supabase
    .from('messages')
    .select('id')
    .eq('conversation_id', conversationId)
    .eq('sender_type', 'business')
    .eq('sender_id', businessId)
    .eq('content', awayMessage)
    .limit(1)
    .single()

  // Don't send if already sent in this conversation
  if (existingAwayMessage) {
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

