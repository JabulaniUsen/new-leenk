'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useBusiness, useUpdateBusiness } from '@/lib/queries/businesses'
import { useQueryClient } from '@tanstack/react-query'
import { uploadImage } from '@/lib/utils/image-upload'
import { getBusinessLogoUrl } from '@/lib/utils/storage'
import { HiUser, HiUsers, HiSpeakerphone, HiCollection, HiLink, HiCamera, HiDocumentDuplicate, HiLocationMarker, HiPhone, HiOfficeBuilding, HiPaperAirplane, HiTrash, HiRefresh, HiPhotograph, HiColorSwatch } from 'react-icons/hi'
import { useToast } from '@/lib/hooks/use-toast'
import { ImageEditor } from '@/components/image-editor'
import {
  DEFAULT_PRIMARY_COLOR,
  DEFAULT_SECONDARY_COLOR,
  FONT_FAMILY_OPTIONS,
  FONT_STYLE_OPTIONS,
  FONT_SIZE_OPTIONS,
  BORDER_RADIUS_OPTIONS,
  HEADER_STYLE_OPTIONS,
  CHAT_BG_OPTIONS,
  getBusinessThemeValues,
  hexToRgba,
  normalizeHexColor,
  normalizeFontFamily,
  normalizeFontStyle,
  normalizeFontSize,
  normalizeBorderRadius,
  normalizeHeaderStyle,
  normalizeChatBg,
  getGoogleFontUrl,
  getFontSizePx,
  getBorderRadiusPx,
  getChatBgStyle,
  getHeaderStyle,
} from '@/lib/utils/business-theme'

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
  const [savingAppearance, setSavingAppearance] = useState(false)
  const [copied, setCopied] = useState(false)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const logoInputRef = useRef<HTMLInputElement>(null)
  const [activeTab, setActiveTab] = useState('profile')
  
  // Broadcast message state
  const [broadcastContent, setBroadcastContent] = useState('')
  const [broadcasting, setBroadcasting] = useState(false)
  const [broadcastImageToEdit, setBroadcastImageToEdit] = useState<File | null>(null)
  const [broadcastImageUrl, setBroadcastImageUrl] = useState<string | null>(null)
  const [uploadingBroadcastImage, setUploadingBroadcastImage] = useState(false)
  const broadcastImageInputRef = useRef<HTMLInputElement>(null)
  
  // Away message state
  const [awayMessage, setAwayMessage] = useState('')
  const [awayMessageEnabled, setAwayMessageEnabled] = useState(false)
  const [savingAwayMessage, setSavingAwayMessage] = useState(false)
  const [themePrimaryColor, setThemePrimaryColor] = useState(DEFAULT_PRIMARY_COLOR)
  const [themeSecondaryColor, setThemeSecondaryColor] = useState(DEFAULT_SECONDARY_COLOR)
  const [themeFontFamily, setThemeFontFamily] = useState<string>(FONT_FAMILY_OPTIONS[0].value)
  const [themeFontStyle, setThemeFontStyle] = useState<'normal' | 'italic'>(FONT_STYLE_OPTIONS[0].value)
  const [themeFontSize, setThemeFontSize] = useState<'small' | 'normal' | 'large'>('normal')
  const [themeBorderRadius, setThemeBorderRadius] = useState<'sharp' | 'rounded' | 'pill'>('rounded')
  const [themeHeaderStyle, setThemeHeaderStyle] = useState<'solid' | 'gradient'>('solid')
  const [themeChatBg, setThemeChatBg] = useState<'plain' | 'solid' | 'dots' | 'grid'>('plain')

  // Initialize form with business data
  useEffect(() => {
    if (business) {
      setBusinessName(business.business_name || '')
      setPhone(business.phone || '')
      setAddress(business.address || '')
      setAwayMessage(business.away_message || '')
      setAwayMessageEnabled(business.away_message_enabled || false)
      const themeValues = getBusinessThemeValues(business)
      setThemePrimaryColor(themeValues.primaryColor)
      setThemeSecondaryColor(themeValues.secondaryColor)
      setThemeFontFamily(themeValues.fontFamily)
      setThemeFontStyle(themeValues.fontStyle)
      setThemeFontSize(themeValues.fontSize)
      setThemeBorderRadius(themeValues.borderRadius)
      setThemeHeaderStyle(themeValues.headerStyle)
      setThemeChatBg(themeValues.chatBg)
    }
  }, [business])

  useEffect(() => {
    const hash = window.location.hash
    if (hash === '#appearance') {
      setActiveTab('appearance')
    } else if (hash === '#broadcast') {
      setActiveTab('broadcast')
    } else if (hash === '#away') {
      setActiveTab('away')
    } else {
      setActiveTab('profile')
    }

    const handleHashChange = () => {
      const newHash = window.location.hash
      if (newHash === '#appearance') {
        setActiveTab('appearance')
      } else if (newHash === '#broadcast') {
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

  // Load Google Font for preview when font family changes
  useEffect(() => {
    const url = getGoogleFontUrl(themeFontFamily)
    if (!url) return
    const id = 'preview-google-font'
    const existing = document.getElementById(id)
    if (existing) existing.remove()
    const link = document.createElement('link')
    link.id = id
    link.rel = 'stylesheet'
    link.href = url
    document.head.appendChild(link)
  }, [themeFontFamily])

  const handleSaveAppearance = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!business) return

    setSavingAppearance(true)
    try {
      await updateBusiness.mutateAsync({
        theme_primary_color: normalizeHexColor(themePrimaryColor, DEFAULT_PRIMARY_COLOR),
        theme_secondary_color: normalizeHexColor(themeSecondaryColor, DEFAULT_SECONDARY_COLOR),
        theme_font_family: normalizeFontFamily(themeFontFamily),
        theme_font_style: normalizeFontStyle(themeFontStyle),
        theme_font_size: normalizeFontSize(themeFontSize),
        theme_border_radius: normalizeBorderRadius(themeBorderRadius),
        theme_header_style: normalizeHeaderStyle(themeHeaderStyle),
        theme_chat_bg: normalizeChatBg(themeChatBg),
      })
      showSuccess('Appearance settings saved successfully!')
    } catch (err) {
      console.error('Failed to save appearance settings:', err)
      showError('Failed to save appearance settings. Please try again.')
    } finally {
      setSavingAppearance(false)
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

  const handleBroadcastImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !business) {
      if (broadcastImageInputRef.current) {
        broadcastImageInputRef.current.value = ''
      }
      return
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      showError('Please select an image file')
      if (broadcastImageInputRef.current) {
        broadcastImageInputRef.current.value = ''
      }
      return
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      showError('Image size must be less than 10MB')
      if (broadcastImageInputRef.current) {
        broadcastImageInputRef.current.value = ''
      }
      return
    }

    // Show image editor
    setBroadcastImageToEdit(file)
    if (broadcastImageInputRef.current) {
      broadcastImageInputRef.current.value = ''
    }
  }

  const handleRemoveBroadcastImage = () => {
    setBroadcastImageUrl(null)
    if (broadcastImageInputRef.current) {
      broadcastImageInputRef.current.value = ''
    }
  }

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!business || (!broadcastContent.trim() && !broadcastImageUrl)) return

    if (!confirm('Are you sure you want to send this message to all your customers?')) {
      return
    }

    setBroadcasting(true)
    try {
      const { broadcastMessage } = await import('@/lib/queries/messages')
      await broadcastMessage(
        business.id, 
        broadcastContent.trim() || '', 
        broadcastImageUrl || undefined
      )
      setBroadcastContent('')
      setBroadcastImageUrl(null)
      
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
      showSuccess('Welcome message settings saved successfully!')
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
            onClick={(e) => {
              e.preventDefault()
              router.push('/settings#broadcast')
            }}
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
            href="/settings#appearance"
            onClick={(e) => {
              e.preventDefault()
              router.push('/settings#appearance')
            }}
            className={`flex items-center gap-2 text-sm whitespace-nowrap pb-2 -mb-3 transition-colors ${
              activeTab === 'appearance'
                ? 'text-primary-600 dark:text-primary-400 font-semibold border-b-2 border-primary-600 dark:border-primary-400'
                : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
            }`}
          >
            <HiColorSwatch className="text-lg" />
            <span className="hidden sm:inline">Appearance</span>
          </Link>
          <Link
            href="/settings#away"
            onClick={(e) => {
              e.preventDefault()
              router.push('/settings#away')
            }}
            className={`flex items-center gap-2 text-sm whitespace-nowrap pb-2 -mb-3 transition-colors ${
              activeTab === 'away'
                ? 'text-primary-600 dark:text-primary-400 font-semibold border-b-2 border-primary-600 dark:border-primary-400'
                : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
            }`}
          >
            <HiCollection className="text-lg" />
            <span className="hidden sm:inline">Welcome Message</span>
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
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-600 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
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
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-600 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
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
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-600 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
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
                className="flex-1 rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 text-gray-600 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 text-sm font-mono"
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

        {/* Appearance Section */}
        {activeTab === 'appearance' && (
          <>
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Appearance</h1>
              <p className="text-gray-600 dark:text-gray-400">Customize your chat page — colors, fonts, bubble shapes, and more</p>
            </div>

            <div className="space-y-6">
              <div className="bg-white rounded-xl border border-gray-200 dark:bg-gray-800 dark:border-gray-700 p-6 shadow-sm">
                <form onSubmit={handleSaveAppearance} className="space-y-8">

                  {/* Colors */}
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-4">Colors</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
                          Primary Color
                        </label>
                        <div className="flex items-center gap-3">
                          <input
                            type="color"
                            value={themePrimaryColor}
                            onChange={(e) => setThemePrimaryColor(e.target.value)}
                            className="h-11 w-14 rounded border border-gray-300 dark:border-gray-600 cursor-pointer bg-transparent"
                          />
                          <input
                            type="text"
                            value={themePrimaryColor}
                            onChange={(e) => setThemePrimaryColor(e.target.value)}
                            className="flex-1 rounded-lg border border-gray-300 px-3 py-2.5 text-gray-700 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            placeholder="#9333ea"
                          />
                        </div>
                        <p className="mt-1.5 text-xs text-gray-400">Header, buttons, and outgoing bubble color</p>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
                          Secondary Color
                        </label>
                        <div className="flex items-center gap-3">
                          <input
                            type="color"
                            value={themeSecondaryColor}
                            onChange={(e) => setThemeSecondaryColor(e.target.value)}
                            className="h-11 w-14 rounded border border-gray-300 dark:border-gray-600 cursor-pointer bg-transparent"
                          />
                          <input
                            type="text"
                            value={themeSecondaryColor}
                            onChange={(e) => setThemeSecondaryColor(e.target.value)}
                            className="flex-1 rounded-lg border border-gray-300 px-3 py-2.5 text-gray-700 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            placeholder="#f3e8ff"
                          />
                        </div>
                        <p className="mt-1.5 text-xs text-gray-400">Incoming bubble and background tint</p>
                      </div>
                    </div>
                  </div>

                  {/* Typography */}
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-4">Typography</p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                      <div className="sm:col-span-1">
                        <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
                          Font Family
                        </label>
                        <select
                          value={themeFontFamily}
                          onChange={(e) => setThemeFontFamily(e.target.value)}
                          className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-700 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        >
                          <optgroup label="System fonts">
                            {FONT_FAMILY_OPTIONS.filter((f) => !f.googleFont).map((option) => (
                              <option key={option.value} value={option.value}>{option.label}</option>
                            ))}
                          </optgroup>
                          <optgroup label="Google Fonts">
                            {FONT_FAMILY_OPTIONS.filter((f) => f.googleFont).map((option) => (
                              <option key={option.value} value={option.value}>{option.label}</option>
                            ))}
                          </optgroup>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
                          Font Style
                        </label>
                        <select
                          value={themeFontStyle}
                          onChange={(e) => setThemeFontStyle(e.target.value as 'normal' | 'italic')}
                          className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-700 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        >
                          {FONT_STYLE_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
                          Font Size
                        </label>
                        <select
                          value={themeFontSize}
                          onChange={(e) => setThemeFontSize(e.target.value as 'small' | 'normal' | 'large')}
                          className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-700 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        >
                          {FONT_SIZE_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* UI Style */}
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-4">UI Style</p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
                          Bubble Shape
                        </label>
                        <div className="flex gap-2">
                          {BORDER_RADIUS_OPTIONS.map((option) => (
                            <button
                              key={option.value}
                              type="button"
                              onClick={() => setThemeBorderRadius(option.value as 'sharp' | 'rounded' | 'pill')}
                              className={`flex-1 py-2.5 text-xs font-medium border transition-all ${
                                themeBorderRadius === option.value
                                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                                  : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-gray-400'
                              }`}
                              style={{
                                borderRadius:
                                  option.value === 'sharp' ? '4px' : option.value === 'pill' ? '999px' : '10px',
                              }}
                            >
                              {option.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
                          Header Style
                        </label>
                        <div className="flex gap-2">
                          {HEADER_STYLE_OPTIONS.map((option) => (
                            <button
                              key={option.value}
                              type="button"
                              onClick={() => setThemeHeaderStyle(option.value as 'solid' | 'gradient')}
                              className={`flex-1 py-2.5 text-xs font-medium rounded-lg border transition-all ${
                                themeHeaderStyle === option.value
                                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                                  : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-gray-400'
                              }`}
                            >
                              {option.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
                          Chat Background
                        </label>
                        <div className="flex gap-2">
                          {CHAT_BG_OPTIONS.map((option) => (
                            <button
                              key={option.value}
                              type="button"
                              onClick={() => setThemeChatBg(option.value as 'plain' | 'solid' | 'dots' | 'grid')}
                              className={`flex-1 py-2.5 text-xs font-medium rounded-lg border transition-all ${
                                themeChatBg === option.value
                                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                                  : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-gray-400'
                              }`}
                            >
                              {option.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={savingAppearance}
                      className="flex items-center gap-2 px-6 py-3 rounded-lg bg-primary-600 text-white font-semibold hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md shadow-primary-600/20"
                    >
                      <span className="w-2 h-2 rounded-full bg-white"></span>
                      <span>{savingAppearance ? 'Saving...' : 'Save Appearance'}</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Live Preview */}
              <div className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Live Preview</p>
                  <p className="text-xs text-gray-400 mt-0.5">This is how your customers will see the chat page</p>
                </div>
                {/* Simulated phone frame */}
                <div className="p-4">
                  <div
                    className="mx-auto overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg"
                    style={{ maxWidth: 340, fontFamily: normalizeFontFamily(themeFontFamily), fontStyle: normalizeFontStyle(themeFontStyle), fontSize: getFontSizePx(themeFontSize) }}
                  >
                    {/* Header */}
                    <div
                      className="flex items-center gap-2 px-4 py-3"
                      style={getHeaderStyle(themeHeaderStyle, normalizeHexColor(themePrimaryColor, DEFAULT_PRIMARY_COLOR))}
                    >
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold" style={{ backgroundColor: 'rgba(255,255,255,0.25)', color: '#fff' }}>
                        {business.business_name ? business.business_name.slice(0, 2).toUpperCase() : 'BZ'}
                      </div>
                      <div>
                        <p className="text-white text-sm font-medium leading-tight">{business.business_name || 'Your Business'}</p>
                        <p className="text-xs" style={{ color: 'rgba(255,255,255,0.75)' }}>Online</p>
                      </div>
                    </div>
                    {/* Messages */}
                    <div
                      className="px-3 py-4 space-y-2.5 min-h-[140px]"
                      style={getChatBgStyle(themeChatBg, normalizeHexColor(themeSecondaryColor, DEFAULT_SECONDARY_COLOR))}
                    >
                      <div className="flex justify-start">
                        <div
                          className="max-w-[75%] px-3 py-2 text-gray-900 shadow-sm"
                          style={{
                            backgroundColor: normalizeHexColor(themeSecondaryColor, DEFAULT_SECONDARY_COLOR),
                            borderRadius: getBorderRadiusPx(themeBorderRadius),
                          }}
                        >
                          Hi! How can I help you today?
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <div
                          className="max-w-[75%] px-3 py-2 text-white shadow-sm"
                          style={{
                            backgroundColor: normalizeHexColor(themePrimaryColor, DEFAULT_PRIMARY_COLOR),
                            borderRadius: getBorderRadiusPx(themeBorderRadius),
                          }}
                        >
                          I'd like to place an order.
                        </div>
                      </div>
                      <div className="flex justify-start">
                        <div
                          className="max-w-[75%] px-3 py-2 text-gray-900 shadow-sm"
                          style={{
                            backgroundColor: normalizeHexColor(themeSecondaryColor, DEFAULT_SECONDARY_COLOR),
                            borderRadius: getBorderRadiusPx(themeBorderRadius),
                          }}
                        >
                          Sure! Let me pull that up for you.
                        </div>
                      </div>
                    </div>
                    {/* Input bar */}
                    <div
                      className="flex items-center gap-2 px-3 py-2.5"
                      style={{ backgroundColor: hexToRgba(normalizeHexColor(themeSecondaryColor, DEFAULT_SECONDARY_COLOR), 0.12), borderTop: `1px solid ${hexToRgba(normalizeHexColor(themePrimaryColor, DEFAULT_PRIMARY_COLOR), 0.2)}` }}
                    >
                      <div className="flex-1 rounded-2xl bg-white px-3 py-1.5 text-xs text-gray-400">Type a message...</div>
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs"
                        style={{ backgroundColor: normalizeHexColor(themePrimaryColor, DEFAULT_PRIMARY_COLOR) }}
                      >
                        ➤
                      </div>
                    </div>
                  </div>
                </div>
              </div>
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
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-600 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all resize-none"
                  />
                  <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    This message will be sent to all your customers immediately.
                  </p>
                </div>

                {/* Image Attachment */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
                    Image (Optional)
                  </label>
                  <input
                    ref={broadcastImageInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleBroadcastImageSelect}
                    className="hidden"
                  />
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => broadcastImageInputRef.current?.click()}
                      disabled={broadcasting || uploadingBroadcastImage}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <HiPhotograph className="text-lg" />
                      <span>Attach Image</span>
                    </button>
                    {broadcastImageUrl && (
                      <div className="flex items-center gap-2">
                        <img
                          src={broadcastImageUrl}
                          alt="Broadcast preview"
                          className="h-16 w-16 rounded-lg object-cover border border-gray-300 dark:border-gray-600 cursor-pointer hover:opacity-90 transition-opacity"
                          onClick={() => {
                            // Could open preview modal here if needed
                          }}
                        />
                        <button
                          type="button"
                          onClick={handleRemoveBroadcastImage}
                          className="p-1.5 rounded-full text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 transition-colors"
                          aria-label="Remove image"
                        >
                          <HiTrash className="text-lg" />
                        </button>
                      </div>
                    )}
                  </div>
                  <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    You can attach an image along with your message. Image will be compressed automatically.
                  </p>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={broadcasting || uploadingBroadcastImage || (!broadcastContent.trim() && !broadcastImageUrl)}
                    className="flex items-center gap-2 px-6 py-3 rounded-lg bg-primary-600 text-white font-semibold hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md shadow-primary-600/20"
                  >
                    <HiPaperAirplane className="text-lg" />
                    <span>{broadcasting ? 'Sending...' : 'Send Broadcast'}</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Image Editor Modal */}
            {broadcastImageToEdit && business && (
              <ImageEditor
                imageFile={broadcastImageToEdit}
                onSave={async (editedFile) => {
                  setBroadcastImageToEdit(null)
                  setUploadingBroadcastImage(true)
                  try {
                    const imageUrl = await uploadImage(editedFile, business.id, 'images')
                    setBroadcastImageUrl(imageUrl)
                    showSuccess('Image attached successfully')
                  } catch (err) {
                    console.error('Failed to upload image:', err)
                    showError('Failed to upload image. Please try again.')
                  } finally {
                    setUploadingBroadcastImage(false)
                  }
                }}
                onCancel={() => {
                  setBroadcastImageToEdit(null)
                  if (broadcastImageInputRef.current) {
                    broadcastImageInputRef.current.value = ''
                  }
                }}
              />
            )}
          </>
        )}

        {/* Away Message Section */}
        {activeTab === 'away' && (
          <>
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Welcome Message</h1>
              <p className="text-gray-600 dark:text-gray-400">Automatically send a welcome message after a customer sends their first message</p>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 dark:bg-gray-800 dark:border-gray-700 p-6 shadow-sm">
              <form onSubmit={handleSaveAwayMessage} className="space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-700">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-1">
                      Enable Welcome Message
                    </label>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Automatically send this message once after a customer sends their first message
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
                    Welcome Message
                  </label>
                  <textarea
                    value={awayMessage}
                    onChange={(e) => setAwayMessage(e.target.value)}
                    placeholder="e.g., Hello! Thanks for reaching out. We're here to help!"
                    rows={4}
                    disabled={!awayMessageEnabled}
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-600 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all resize-none disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    This message will be sent automatically once, right after the customer's first message in a conversation (if enabled).
                  </p>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={savingAwayMessage}
                    className="flex items-center gap-2 px-6 py-3 rounded-lg bg-primary-600 text-white font-semibold hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md shadow-primary-600/20"
                  >
                    <span className="w-2 h-2 rounded-full bg-white"></span>
                    <span>{savingAwayMessage ? 'Saving...' : 'Save Welcome Message'}</span>
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
