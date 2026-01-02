import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { QueryProvider } from '@/components/providers/query-provider'
import { ThemeProvider } from '@/components/providers/theme-provider'
import { ServiceWorkerRegister } from '@/components/service-worker-register'
import { ToastProvider } from '@/lib/hooks/use-toast'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Leenk - Business Chat',
  description: 'WhatsApp Business-style chat application',
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
  },
  manifest: '/manifest.json',
  themeColor: '#9333ea',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Leenk',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#9333ea" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Leenk" />
      </head>
      <body className={inter.className}>
        <ThemeProvider>
          <ToastProvider>
            <QueryProvider>
              {children}
              <ServiceWorkerRegister />
            </QueryProvider>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

