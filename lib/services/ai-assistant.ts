import { GoogleGenerativeAI } from '@google/generative-ai'
import type { BusinessKnowledge, AIModelConfig } from '@/lib/types/ai'
import type { Database } from '@/lib/types/database'

type Message = Database['public']['Tables']['messages']['Row']

const API_KEY = process.env.GEMINI_API_KEY

if (!API_KEY) {
  console.warn('GEMINI_API_KEY is not set. AI features will not work.')
}

const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null

/**
 * Build system prompt from business knowledge
 */
export function buildSystemPrompt(businessKnowledge: BusinessKnowledge | null, businessName: string | null): string {
  if (!businessKnowledge) {
    return `You are a helpful AI assistant for ${businessName || 'this business'}. Answer customer questions politely and professionally.`
  }

  let prompt = `You are an AI assistant representing ${businessKnowledge.businessName || businessName || 'this business'}.\n\n`

  if (businessKnowledge.businessType) {
    prompt += `Business Type: ${businessKnowledge.businessType}\n`
  }

  if (businessKnowledge.services && businessKnowledge.services.length > 0) {
    prompt += `Services Offered: ${businessKnowledge.services.join(', ')}\n`
  }

  if (businessKnowledge.products && businessKnowledge.products.length > 0) {
    prompt += `Products: ${businessKnowledge.products.join(', ')}\n`
  }

  if (businessKnowledge.hours) {
    prompt += `Business Hours: ${businessKnowledge.hours}\n`
  }

  if (businessKnowledge.location) {
    prompt += `Location: ${businessKnowledge.location}\n`
  }

  if (businessKnowledge.contactInfo) {
    const contact = businessKnowledge.contactInfo
    if (contact.phone) prompt += `Phone: ${contact.phone}\n`
    if (contact.email) prompt += `Email: ${contact.email}\n`
    if (contact.address) prompt += `Address: ${contact.address}\n`
  }

  if (businessKnowledge.qaPairs && businessKnowledge.qaPairs.length > 0) {
    prompt += `\nFrequently Asked Questions:\n`
    businessKnowledge.qaPairs.forEach((qa, idx) => {
      prompt += `${idx + 1}. Q: ${qa.question}\n   A: ${qa.answer}\n`
    })
  }

  if (businessKnowledge.additionalInfo) {
    prompt += `\nAdditional Information: ${businessKnowledge.additionalInfo}\n`
  }

  prompt += `\nInstructions:
- Answer customer questions based on the information above
- Be friendly, professional, and helpful
- If you don't know something, politely say so and offer to connect them with a human representative
- Keep responses concise and clear
- Use the business name naturally in your responses`

  return prompt
}

/**
 * Format conversation history for Gemini
 * Gemini requires history to start with 'user' role and alternate properly
 */
export function formatConversationHistory(messages: Message[]): Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> {
  const formatted: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = messages
    .filter((msg) => msg.content) // Only messages with content
    .map((msg) => ({
      role: (msg.sender_type === 'customer' ? 'user' : 'model') as 'user' | 'model',
      parts: [{ text: msg.content || '' }],
    }))

  // Gemini requires history to start with 'user' role
  // Remove any leading 'model' messages
  let startIndex = 0
  while (startIndex < formatted.length && formatted[startIndex].role === 'model') {
    startIndex++
  }

  return formatted.slice(startIndex)
}

/**
 * Generate AI response to customer message
 */
export async function generateAIResponse(
  customerMessage: string,
  businessKnowledge: BusinessKnowledge | null,
  businessName: string | null,
  conversationHistory: Message[],
  modelConfig?: AIModelConfig
): Promise<string> {
  if (!genAI) {
    throw new Error('Gemini API is not configured. Please set GEMINI_API_KEY environment variable.')
  }

  const modelName = modelConfig?.model || 'gemini-1.5-flash'
  const model = genAI.getGenerativeModel({ 
    model: modelName,
    generationConfig: {
      temperature: modelConfig?.temperature ?? 0.7,
      maxOutputTokens: modelConfig?.maxTokens ?? 500,
    },
  })

  const systemPrompt = buildSystemPrompt(businessKnowledge, businessName)
  const history = formatConversationHistory(conversationHistory.slice(-10)) // Last 10 messages for context

  try {
    // Avoid using systemInstruction due to format compatibility issues
    // Instead, prepend system context to the customer message
    // This ensures the AI always has business context without API format issues
    const contextualCustomerMessage = `[Business Context: ${systemPrompt}]\n\nCustomer: ${customerMessage}`

    const chat = model.startChat({
      history: history,
    })

    const result = await chat.sendMessage(contextualCustomerMessage)
    const response = result.response.text()

    if (!response || response.trim().length === 0) {
      throw new Error('Empty response from AI')
    }

    return response.trim()
  } catch (error: any) {
    console.error('Error generating AI response:', error)
    
    // Handle rate limiting
    if (error.message?.includes('429') || error.message?.includes('quota')) {
      throw new Error('AI service is temporarily unavailable due to rate limits. Please try again later.')
    }

    throw new Error(`Failed to generate AI response: ${error.message || 'Unknown error'}`)
  }
}

/**
 * Generate next onboarding question
 */
export async function generateBusinessQuestion(
  currentKnowledge: BusinessKnowledge | null,
  answeredQuestions: string[]
): Promise<string> {
  if (!genAI) {
    throw new Error('Gemini API is not configured. Please set GEMINI_API_KEY environment variable.')
  }

  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

  const knowledgeSummary = currentKnowledge
    ? JSON.stringify(currentKnowledge, null, 2)
    : 'No information collected yet.'

  const prompt = `You are helping a business set up an AI assistant. Based on the information already collected, generate the next question to learn more about the business.

Current Knowledge:
${knowledgeSummary}

Questions Already Asked:
${answeredQuestions.length > 0 ? answeredQuestions.join('\n') : 'None yet'}

Generate ONE specific, helpful question that will help the AI assistant better understand and represent this business. The question should:
- Be clear and easy to answer
- Not duplicate information already collected
- Help the AI provide better customer service
- Be relevant to understanding the business

Only return the question text, nothing else.`

  try {
    const result = await model.generateContent(prompt)
    const question = result.response.text().trim()

    // Clean up the response (remove quotes, numbering, etc.)
    const cleaned = question
      .replace(/^["']|["']$/g, '') // Remove surrounding quotes
      .replace(/^\d+[\.\)]\s*/, '') // Remove numbering
      .trim()

    return cleaned || 'Tell me more about your business.'
  } catch (error: any) {
    console.error('Error generating question:', error)
    // Fallback questions
    const fallbackQuestions = [
      'What are your business hours?',
      'What services or products do you offer?',
      'Where is your business located?',
      'What makes your business unique?',
      'How can customers contact you?',
    ]

    const unusedFallbacks = fallbackQuestions.filter(
      (q) => !answeredQuestions.some((aq) => aq.toLowerCase().includes(q.toLowerCase().split(' ')[0]))
    )

    return unusedFallbacks[0] || 'Tell me more about your business.'
  }
}

