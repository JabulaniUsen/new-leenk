'use client'

import { useEffect, useState } from 'react'
import { HiDownload, HiX } from 'react-icons/hi'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showPrompt, setShowPrompt] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true)
      return
    }

    // Check if already installed via localStorage
    const installed = localStorage.getItem('pwa-installed')
    if (installed === 'true') {
      setIsInstalled(true)
      return
    }

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      // Show prompt after a short delay
      setTimeout(() => {
        setShowPrompt(true)
      }, 2000) // Show after 2 seconds
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    // Listen for app installed event
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true)
      setShowPrompt(false)
      setDeferredPrompt(null)
      localStorage.setItem('pwa-installed', 'true')
    })

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt) return

    // Show the install prompt
    await deferredPrompt.prompt()

    // Wait for user response
    const { outcome } = await deferredPrompt.userChoice

    if (outcome === 'accepted') {
      setIsInstalled(true)
      localStorage.setItem('pwa-installed', 'true')
    }

    setDeferredPrompt(null)
    setShowPrompt(false)
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    // Don't show again for this session
    sessionStorage.setItem('pwa-prompt-dismissed', 'true')
  }

  const handleDownloadLater = () => {
    setShowPrompt(false)
    // Don't show again for this session
    sessionStorage.setItem('pwa-prompt-dismissed', 'true')
  }

  // Don't show if already installed or dismissed this session
  if (isInstalled || !showPrompt || !deferredPrompt) {
    return null
  }

  if (sessionStorage.getItem('pwa-prompt-dismissed') === 'true') {
    return null
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 animate-slide-up">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border-2 border-primary-200 dark:border-primary-800 p-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
              <HiDownload className="text-2xl text-primary-600 dark:text-primary-400" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
              Install Leenk App
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Install our app for a better experience. Get faster access and work offline.
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={handleInstallClick}
                className="flex-1 rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 active:bg-primary-800 transition-colors flex items-center justify-center gap-2"
              >
                <HiDownload className="text-lg" />
                Install Now
              </button>
              <button
                onClick={handleDownloadLater}
                className="flex-1 rounded-xl bg-gray-100 dark:bg-gray-700 px-4 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Later
              </button>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 rounded-full p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Close"
          >
            <HiX className="text-xl" />
          </button>
        </div>
      </div>
    </div>
  )
}

