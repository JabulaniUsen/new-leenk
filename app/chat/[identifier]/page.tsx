'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getBusinessByIdentifier } from '@/lib/queries/businesses'
import { useFindOrCreateConversation, checkConversationExists } from '@/lib/queries/conversations'
import { getBusinessLogoUrl } from '@/lib/utils/storage'
import type { Database } from '@/lib/types/database'

type Business = Database['public']['Tables']['businesses']['Row']

type Step = 'email' | 'name' | 'chat'

export default function CustomerChatPage() {
  const params = useParams()
  const router = useRouter()
  const identifier = params.identifier as string
  const [business, setBusiness] = useState<Business | null>(null)
  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(true)
  const [checking, setChecking] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const findOrCreateConversation = useFindOrCreateConversation()

  useEffect(() => {
    const loadBusiness = async () => {
      try {
        const businessData = await getBusinessByIdentifier(identifier)
        if (!businessData) {
          setError('Business not found')
          return
        }
        setBusiness(businessData)
      } catch (err: any) {
        setError(err.message || 'Failed to load business')
      } finally {
        setLoading(false)
      }
    }
    loadBusiness()
  }, [identifier])

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!business || !email) return

    setChecking(true)
    setError(null)
    try {
      // Check if conversation exists
      const exists = await checkConversationExists(business.id, email)

      if (exists) {
        // Has chat history - returning user, go directly to chat
        // Get existing conversation and redirect
        const conversation = await findOrCreateConversation.mutateAsync({
          businessId: business.id,
          customerEmail: email,
        })
        router.push(`/chat/${identifier}/${conversation.id}`)
      } else {
        // No chat history - new user, show name field
        setStep('name')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to check conversation')
    } finally {
      setChecking(false)
    }
  }

  const proceedToChat = async () => {
    if (!business || !email) return

    setLoading(true)
    try {
      const conversation = await findOrCreateConversation.mutateAsync({
        businessId: business.id,
        customerEmail: email,
        customerName: name || undefined,
        customerPhone: phone || undefined,
      })

      router.push(`/chat/${identifier}/${conversation.id}`)
    } catch (err: any) {
      setError(err.message || 'Failed to start conversation')
      setLoading(false)
    }
  }

  const handleNameSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await proceedToChat()
  }

  if (loading && !business) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg text-gray-600 dark:text-gray-400">Loading...</div>
      </div>
    )
  }

  if (error || !business) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Business Not Found
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-8 shadow-lg dark:bg-gray-800">
        <div className="text-center">
          {getBusinessLogoUrl(business.business_logo) && (
            <img
              src={getBusinessLogoUrl(business.business_logo)!}
              alt={business.business_name || 'Business'}
              className="mx-auto h-20 w-20 rounded-full object-cover"
            />
          )}
          <h2 className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">
            {business.business_name || 'Chat with Business'}
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {step === 'email'
              ? 'Enter your email to start chatting'
              : 'Welcome! Please enter your name to get started'}
          </p>
        </div>

        {error && (
          <div className="mt-4 rounded-md bg-red-50 p-4 dark:bg-red-900/20">
            <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        {step === 'email' && (
          <form className="mt-8 space-y-6" onSubmit={handleEmailSubmit}>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Email *
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                placeholder="your@email.com"
                disabled={checking}
              />
            </div>
            <div>
              <button
                type="submit"
                disabled={checking || !email}
                className="w-full rounded-md bg-primary-600 px-4 py-2 text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50"
              >
                {checking ? 'Checking...' : 'Continue'}
              </button>
            </div>
          </form>
        )}

        {step === 'name' && (
          <form className="mt-8 space-y-6" onSubmit={handleNameSubmit}>
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Name *
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                placeholder="Your name"
                autoFocus
                disabled={loading}
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                This is your first time chatting with us. Please enter your name to get started.
              </p>
            </div>
            <div>
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Phone (optional)
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                placeholder="+1234567890"
                disabled={loading}
              />
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setStep('email')
                  setName('')
                  setPhone('')
                }}
                className="flex-1 rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                disabled={loading}
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading || !name.trim()}
                className="flex-1 rounded-md bg-primary-600 px-4 py-2 text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50"
              >
                {loading ? 'Starting chat...' : 'Start Chat'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

