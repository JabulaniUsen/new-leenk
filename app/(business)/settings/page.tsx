'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useBusiness, useUpdateBusiness } from '@/lib/queries/businesses'
import { useQueryClient } from '@tanstack/react-query'
import { uploadImage } from '@/lib/utils/image-upload'
import { getBusinessLogoUrl } from '@/lib/utils/storage'
import { HiUser, HiUsers, HiSpeakerphone, HiCollection, HiLink, HiCamera, HiDocumentDuplicate, HiLocationMarker, HiPhone, HiOfficeBuilding, HiPaperAirplane, HiTrash, HiRefresh } from 'react-icons/hi'
import { useToast } from '@/lib/hooks/use-toast'

// Helper function to get initials from name or email
function getInitials(name: string | null, email: string): string {
  if (name) {
    const parts = name.trim().split(/\s+/)
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    }
    return name.substring(0, 2).toUpperCase()
  }
  const emailParts = email.split('@')[0]
  if (emailParts.length >= 2) {
    return emailParts.substring(0, 2).toUpperCase()
  }
  return emailParts.substring(0, 1).toUpperCase()
}

export default function SettingsPage() {
  const router = useRouter()
  const supabase = createClient()
  const queryClient = useQueryClient()
  const { data: business, isLoading } = useBusiness()
  const updateBusiness = useUpdateBusiness()
  const { showSuccess, showError } = useToast()
  const [businessName, setBusinessName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [saving, setSaving] = useState(false)
  const [copied, setCopied] = useState(false)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const logoInputRef = useRef<HTMLInputElement>(null)
  
  // Broadcast message state
  const [broadcastContent, setBroadcastContent] = useState('')
  const [broadcasting, setBroadcasting] = useState(false)
  
  // Away message state
  const [awayMessage, setAwayMessage] = useState('')
  const [awayMessageEnabled, setAwayMessageEnabled] = useState(false)
  const [savingAwayMessage, setSavingAwayMessage] = useState(false)

  // Initialize form with business data
  useEffect(() => {
    if (business) {
      setBusinessName(business.business_name || '')
      setPhone(business.phone || '')
      setAddress(business.address || '')
      setAwayMessage(business.away_message || '')
      setAwayMessageEnabled(business.away_message_enabled || false)
    }
  }, [business])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!business) return

    setSaving(true)
    try {
      await updateBusiness.mutateAsync({
        business_name: businessName || null,
        phone: phone || null,
        address: address || null,
      })
      showSuccess('Settings saved successfully!')
    } catch (err) {
      console.error('Failed to save settings:', err)
      showError('Failed to save settings. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const getBusinessLink = () => {
    if (!business) return ''
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || (typeof window !== 'undefined' ? window.location.origin : '')
    const identifier = business.phone || business.id
    return `${baseUrl}/chat/${identifier}`
  }

  const handleCopyLink = async () => {
    const link = getBusinessLink()
    try {
      await navigator.clipboard.writeText(link)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy link:', err)
      const textArea = document.createElement('textarea')
      textArea.value = link
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !business) return

    setUploadingLogo(true)
    try {
      const supabase = createClient()
      const { compressImage } = await import('@/lib/utils/image-upload')
      const compressedBlob = await compressImage(file)
      const compressedFile = new File([compressedBlob], file.name, {
        type: 'image/webp',
      })

      const fileExt = compressedFile.name.split('.').pop()
      const fileName = `${business.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`

      const { error } = await supabase.storage
        .from('business_logo')
        .upload(fileName, compressedFile, {
          cacheControl: '3600',
          upsert: false,
        })

      if (error) throw error

      await updateBusiness.mutateAsync({
        business_logo: fileName,
      })
      
      showSuccess('Logo uploaded successfully!')
    } catch (err) {
      console.error('Failed to upload logo:', err)
      showError('Failed to upload logo. Please try again.')
    } finally {
      setUploadingLogo(false)
      if (logoInputRef.current) {
        logoInputRef.current.value = ''
      }
    }
  }

  const handleRemoveLogo = async () => {
    if (!business) return
    if (!confirm('Are you sure you want to remove your logo?')) return
    try {
      await updateBusiness.mutateAsync({
        business_logo: null,
      })
      showSuccess('Logo removed successfully!')
    } catch (err) {
      console.error('Failed to remove logo:', err)
      showError('Failed to remove logo. Please try again.')
    }
  }

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!business || !broadcastContent.trim()) return

    if (!confirm('Are you sure you want to send this message to all your customers?')) {
      return
    }

    setBroadcasting(true)
    try {
      const { broadcastMessage } = await import('@/lib/queries/messages')
      await broadcastMessage(business.id, broadcastContent.trim())
      setBroadcastContent('')
      
      // Invalidate queries to refresh conversations and messages
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
      queryClient.invalidateQueries({ queryKey: ['messages'] })
      
      showSuccess('Broadcast message sent successfully!')
    } catch (err) {
      console.error('Failed to broadcast:', err)
      showError('Failed to send broadcast message. Please try again.')
    } finally {
      setBroadcasting(false)
    }
  }

  const handleSaveAwayMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!business) return

    setSavingAwayMessage(true)
    try {
      await updateBusiness.mutateAsync({
        away_message: awayMessage.trim() || null,
        away_message_enabled: awayMessageEnabled,
      })
      showSuccess('Away message settings saved successfully!')
    } catch (err) {
      console.error('Failed to save away message:', err)
      showError('Failed to save away message settings. Please try again.')
    } finally {
      setSavingAwayMessage(false)
    }
  }

  if (isLoading || !business) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-lg text-gray-600 dark:text-gray-400">Loading...</div>
      </div>
    )
  }

  const initials = getInitials(business.business_name, business.email)
  const logoUrl = getBusinessLogoUrl(business.business_logo)

  const [activeTab, setActiveTab] = useState('profile')

  useEffect(() => {
    const hash = window.location.hash
    if (hash === '#broadcast') {
      setActiveTab('broadcast')
    } else if (hash === '#away') {
      setActiveTab('away')
    } else {
      setActiveTab('profile')
    }

    const handleHashChange = () => {
      const newHash = window.location.hash
      if (newHash === '#broadcast') {
        setActiveTab('broadcast')
      } else if (newHash === '#away') {
        setActiveTab('away')
      } else {
        setActiveTab('profile')
      }
    }

    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  return (
    <div className="min-h-full bg-gray-50 dark:bg-gray-900">
      {/* Navigation Bar */}
      <div className="bg-white border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700 px-6 py-3">
        <div className="flex items-center gap-8 overflow-x-auto">
          <Link
            href="/settings"
            className={`flex items-center gap-2 text-sm whitespace-nowrap pb-2 -mb-3 transition-colors ${
              activeTab === 'profile'
                ? 'text-primary-600 dark:text-primary-400 font-semibold border-b-2 border-primary-600 dark:border-primary-400'
                : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
            }`}
          >
            <HiUser className="text-lg" />
            <span>Profile</span>
          </Link>
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white text-sm whitespace-nowrap pb-2 -mb-3 transition-colors"
          >
            <HiUsers className="text-lg" />
            <span className="hidden sm:inline">Users</span>
          </Link>
          <Link
            href="/settings#broadcast"
            className={`flex items-center gap-2 text-sm whitespace-nowrap pb-2 -mb-3 transition-colors ${
              activeTab === 'broadcast'
                ? 'text-primary-600 dark:text-primary-400 font-semibold border-b-2 border-primary-600 dark:border-primary-400'
                : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
            }`}
          >
            <HiSpeakerphone className="text-lg" />
            <span className="hidden sm:inline">Broadcast Message</span>
          </Link>
          <Link
            href="/settings#away"
            className={`flex items-center gap-2 text-sm whitespace-nowrap pb-2 -mb-3 transition-colors ${
              activeTab === 'away'
                ? 'text-primary-600 dark:text-primary-400 font-semibold border-b-2 border-primary-600 dark:border-primary-400'
                : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
            }`}
          >
            <HiCollection className="text-lg" />
            <span className="hidden sm:inline">Away Message</span>
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Profile Section */}
        {activeTab === 'profile' && (
          <>
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Profile</h1>
              <p className="text-gray-600 dark:text-gray-400">Manage your business profile information</p>
            </div>

            <div className="space-y-6">
          {/* Profile Picture/Logo */}
          <div className="bg-white rounded-xl border border-gray-200 dark:bg-gray-800 dark:border-gray-700 p-6 shadow-sm">
            <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-4">
              Business Logo
            </label>
            <div className="flex items-start gap-6">
              <div className="flex-shrink-0">
                {logoUrl ? (
                  <div className="relative">
                    <img
                      src={logoUrl}
                      alt="Business logo"
                      className="h-28 w-28 rounded-full object-cover border-4 border-gray-100 dark:border-gray-700 shadow-md"
                    />
                  </div>
                ) : (
                  <div className="h-28 w-28 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center border-4 border-gray-100 dark:border-gray-700 shadow-md">
                    <div className="text-3xl font-bold text-white">
                      {initials}
                    </div>
                  </div>
                )}
              </div>
              <div className="flex-1 pt-2">
                <div className="flex gap-3">
                  <input
                    ref={logoInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => logoInputRef.current?.click()}
                    disabled={uploadingLogo}
                    className="p-2.5 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 disabled:opacity-50 transition-colors"
                    aria-label={business.business_logo ? 'Change logo' : 'Upload logo'}
                    title={business.business_logo ? 'Change logo' : 'Upload logo'}
                  >
                    {business.business_logo ? (
                      <HiRefresh className="text-xl" />
                    ) : (
                      <HiCamera className="text-xl" />
                    )}
                  </button>
                  {business.business_logo && (
                    <button
                      type="button"
                      onClick={handleRemoveLogo}
                      className="p-2.5 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 transition-colors"
                      aria-label="Remove logo"
                      title="Remove logo"
                    >
                      <HiTrash className="text-xl" />
                    </button>
                  )}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
                  Recommended: Square image, at least 200x200px. JPG, PNG or WebP format.
                </p>
              </div>
            </div>
          </div>

          {/* Business Details Form */}
          <div className="bg-white rounded-xl border border-gray-200 dark:bg-gray-800 dark:border-gray-700 p-6 shadow-sm">
            <form onSubmit={handleSave} className="space-y-6">
              {/* Business Name */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white mb-3">
                  <HiOfficeBuilding className="text-lg text-gray-500 dark:text-gray-400" />
                  Business Name
                </label>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  placeholder="Enter business name"
                />
              </div>

              {/* Phone Number */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white mb-3">
                  <HiPhone className="text-lg text-gray-500 dark:text-gray-400" />
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  placeholder="Enter phone number"
                />
              </div>

              {/* Address */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white mb-3">
                  <HiLocationMarker className="text-lg text-gray-500 dark:text-gray-400" />
                  Address
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  placeholder="Enter address"
                />
              </div>

              {/* Save Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-3 rounded-lg bg-primary-600 text-white font-semibold hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md shadow-primary-600/20"
                >
                  <span className="w-2 h-2 rounded-full bg-white"></span>
                  <span>{saving ? 'Saving...' : 'Save Changes'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Chat Link */}
          <div className="bg-white rounded-xl border border-gray-200 dark:bg-gray-800 dark:border-gray-700 p-6 shadow-sm">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white mb-4">
              <HiLink className="text-lg text-gray-500 dark:text-gray-400" />
              Chat Link
            </label>
            <div className="flex gap-3">
              <input
                type="text"
                value={getBusinessLink()}
                readOnly
                className="flex-1 rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 text-sm font-mono"
              />
              <button
                type="button"
                onClick={handleCopyLink}
                className={`p-3 rounded-lg transition-all shadow-md ${
                  copied
                    ? 'bg-green-600 text-white shadow-green-600/20'
                    : 'bg-primary-600 text-white hover:bg-primary-700 shadow-primary-600/20'
                }`}
                aria-label={copied ? 'Copied!' : 'Copy link'}
                title={copied ? 'Copied!' : 'Copy link'}
              >
                <HiDocumentDuplicate className="text-xl" />
              </button>
            </div>
            <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
              Share this link with your customers to start chatting with them.
            </p>
          </div>
            </div>

            {/* Logout at bottom */}
            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <Link
                href="/login"
                onClick={async (e) => {
                  e.preventDefault()
                  await supabase.auth.signOut()
                  router.push('/login')
                }}
                className="inline-flex items-center gap-2 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-sm font-medium transition-colors"
              >
                <span>Logout</span>
                <span>→</span>
              </Link>
            </div>
          </>
        )}

        {/* Broadcast Message Section */}
        {activeTab === 'broadcast' && (
          <>
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Broadcast Message</h1>
              <p className="text-gray-600 dark:text-gray-400">Send a message to all your customers at once</p>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 dark:bg-gray-800 dark:border-gray-700 p-6 shadow-sm">
              <form onSubmit={handleBroadcast} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
                    Message
                  </label>
                  <textarea
                    value={broadcastContent}
                    onChange={(e) => setBroadcastContent(e.target.value)}
                    placeholder="Type your message here..."
                    rows={6}
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all resize-none"
                  />
                  <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    This message will be sent to all your customers immediately.
                  </p>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={broadcasting || !broadcastContent.trim()}
                    className="flex items-center gap-2 px-6 py-3 rounded-lg bg-primary-600 text-white font-semibold hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md shadow-primary-600/20"
                  >
                    <HiPaperAirplane className="text-lg" />
                    <span>{broadcasting ? 'Sending...' : 'Send Broadcast'}</span>
                  </button>
                </div>
              </form>
            </div>
          </>
        )}

        {/* Away Message Section */}
        {activeTab === 'away' && (
          <>
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Away Message</h1>
              <p className="text-gray-600 dark:text-gray-400">Automatically send a message when customers contact you</p>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 dark:bg-gray-800 dark:border-gray-700 p-6 shadow-sm">
              <form onSubmit={handleSaveAwayMessage} className="space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-700">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-1">
                      Enable Away Message
                    </label>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Automatically send this message when a customer sends you a message
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={awayMessageEnabled}
                      onChange={(e) => setAwayMessageEnabled(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
                    Away Message
                  </label>
                  <textarea
                    value={awayMessage}
                    onChange={(e) => setAwayMessage(e.target.value)}
                    placeholder="e.g., We're currently offline. We'll get back to you as soon as possible!"
                    rows={4}
                    disabled={!awayMessageEnabled}
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all resize-none disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    This message will be sent automatically to customers when they send you a message (if enabled).
                  </p>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={savingAwayMessage}
                    className="flex items-center gap-2 px-6 py-3 rounded-lg bg-primary-600 text-white font-semibold hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md shadow-primary-600/20"
                  >
                    <span className="w-2 h-2 rounded-full bg-white"></span>
                    <span>{savingAwayMessage ? 'Saving...' : 'Save Away Message'}</span>
                  </button>
                </div>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
