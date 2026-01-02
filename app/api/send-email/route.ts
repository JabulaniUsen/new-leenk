import { NextRequest, NextResponse } from 'next/server'
import {
  sendCustomerEmailNotification,
  sendBusinessEmailNotification,
} from '@/lib/utils/email'
import { createClient } from '@/lib/supabase/server'

/**
 * API route to send email notifications
 * Called after messages are sent to notify recipients
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, ...emailData } = body

    // Validate required fields
    if (!type || (type !== 'customer' && type !== 'business')) {
      return NextResponse.json(
        { error: 'Invalid email type' },
        { status: 400 }
      )
    }

    // Send email based on type
    if (type === 'customer') {
      await sendCustomerEmailNotification(emailData)
    } else if (type === 'business') {
      await sendBusinessEmailNotification(emailData)
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error sending email:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to send email' },
      { status: 500 }
    )
  }
}

