# SMTP Email Setup Guide

This app uses Google SMTP (Gmail) to send email notifications when messages are sent.

## Setup Instructions

### 1. Create Gmail App Password

1. Go to your Google Account: https://myaccount.google.com/
2. Navigate to **Security** → **2-Step Verification** (enable if not already enabled)
3. Scroll down to **App passwords**
4. Select **Mail** and **Other (Custom name)**
5. Enter "Leenk Chat" as the name
6. Click **Generate**
7. Copy the 16-character app password (you'll need this for `SMTP_PASSWORD`)

### 2. Configure Environment Variables

Add these to your `.env.local` file:

```env
# SMTP Configuration (Google SMTP)
SMTP_USER=your_gmail@gmail.com
SMTP_PASSWORD=your_16_character_app_password
SMTP_FROM_NAME=Leenk Chat

# App URL (for email links)
NEXT_PUBLIC_APP_URL=http://localhost:3000
# For production, use: https://yourdomain.com
```

### 3. Email Notifications

The app automatically sends emails:

- **To customers**: When a business sends them a message
- **To businesses**: When a customer sends them a message
- **To customers**: When an away message is automatically sent

### 4. Testing

After setup, test by:
1. Sending a message from business to customer
2. Sending a message from customer to business
3. Check both email inboxes for notifications

## Troubleshooting

- **Emails not sending**: Check that SMTP credentials are correct
- **"Less secure app" error**: Use App Password, not regular password
- **Email in spam**: Check spam folder, consider setting up SPF/DKIM records for production

