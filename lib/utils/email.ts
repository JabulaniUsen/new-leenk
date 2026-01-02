import nodemailer from 'nodemailer'

/**
 * Create SMTP transporter for Google SMTP
 * Uses environment variables for configuration
 */
function createTransporter() {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD, // App password for Gmail
    },
  })
}

/**
 * Send email notification to customer when business sends a message
 */
export async function sendCustomerEmailNotification({
  customerEmail,
  customerName,
  businessName,
  messageContent,
  messageImageUrl,
  chatUrl,
}: {
  customerEmail: string
  customerName?: string | null
  businessName?: string | null
  messageContent?: string | null
  messageImageUrl?: string | null
  chatUrl: string
}): Promise<void> {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
    console.warn('SMTP credentials not configured, skipping email notification')
    return
  }

  const transporter = createTransporter()

  const displayName = customerName || customerEmail
  const businessDisplayName = businessName || 'Business'

  const emailContent = messageImageUrl
    ? `${businessDisplayName} sent you an image`
    : messageContent || 'New message'

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #9333ea 0%, #7e22ce 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">New Message</h1>
        </div>
        <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
          <p style="font-size: 16px; margin-bottom: 20px;">
            Hi ${displayName},
          </p>
          <p style="font-size: 16px; margin-bottom: 20px;">
            You have a new message from <strong>${businessDisplayName}</strong>:
          </p>
          <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #9333ea; margin: 20px 0;">
            ${messageImageUrl ? `<img src="${messageImageUrl}" alt="Message image" style="max-width: 100%; border-radius: 8px; margin-bottom: 10px;">` : ''}
            ${messageContent ? `<p style="margin: 0; white-space: pre-wrap;">${messageContent}</p>` : ''}
          </div>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${chatUrl}" style="display: inline-block; background: #9333ea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">
              View Message
            </a>
          </div>
          <p style="font-size: 14px; color: #6b7280; margin-top: 30px; text-align: center;">
            This is an automated notification. Please do not reply to this email.
          </p>
        </div>
      </body>
    </html>
  `

  const textContent = `
Hi ${displayName},

You have a new message from ${businessDisplayName}:

${messageImageUrl ? '[Image attached]' : ''}
${messageContent || ''}

View your message: ${chatUrl}

This is an automated notification. Please do not reply to this email.
  `.trim()

  await transporter.sendMail({
    from: `"${businessDisplayName}" <${process.env.SMTP_USER}>`,
    to: customerEmail,
    subject: `New message from ${businessDisplayName}`,
    text: textContent,
    html: htmlContent,
  })
}

/**
 * Send email notification to business when customer sends a message
 */
export async function sendBusinessEmailNotification({
  businessEmail,
  businessName,
  customerEmail,
  customerName,
  messageContent,
  messageImageUrl,
  chatUrl,
}: {
  businessEmail: string
  businessName?: string | null
  customerEmail: string
  customerName?: string | null
  messageContent?: string | null
  messageImageUrl?: string | null
  chatUrl: string
}): Promise<void> {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
    console.warn('SMTP credentials not configured, skipping email notification')
    return
  }

  const transporter = createTransporter()

  const customerDisplayName = customerName || customerEmail
  const businessDisplayName = businessName || 'Your Business'

  const emailContent = messageImageUrl
    ? `${customerDisplayName} sent you an image`
    : messageContent || 'New message'

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #9333ea 0%, #7e22ce 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">New Customer Message</h1>
        </div>
        <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
          <p style="font-size: 16px; margin-bottom: 20px;">
            Hi ${businessDisplayName},
          </p>
          <p style="font-size: 16px; margin-bottom: 20px;">
            You have a new message from <strong>${customerDisplayName}</strong> (${customerEmail}):
          </p>
          <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #9333ea; margin: 20px 0;">
            ${messageImageUrl ? `<img src="${messageImageUrl}" alt="Message image" style="max-width: 100%; border-radius: 8px; margin-bottom: 10px;">` : ''}
            ${messageContent ? `<p style="margin: 0; white-space: pre-wrap;">${messageContent}</p>` : ''}
          </div>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${chatUrl}" style="display: inline-block; background: #9333ea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">
              View Message
            </a>
          </div>
          <p style="font-size: 14px; color: #6b7280; margin-top: 30px; text-align: center;">
            This is an automated notification. Please do not reply to this email.
          </p>
        </div>
      </body>
    </html>
  `

  const textContent = `
Hi ${businessDisplayName},

You have a new message from ${customerDisplayName} (${customerEmail}):

${messageImageUrl ? '[Image attached]' : ''}
${messageContent || ''}

View the message: ${chatUrl}

This is an automated notification. Please do not reply to this email.
  `.trim()

  await transporter.sendMail({
    from: `"${process.env.SMTP_FROM_NAME || 'Leenk Chat'}" <${process.env.SMTP_USER}>`,
    to: businessEmail,
    subject: `New message from ${customerDisplayName}`,
    text: textContent,
    html: htmlContent,
  })
}

