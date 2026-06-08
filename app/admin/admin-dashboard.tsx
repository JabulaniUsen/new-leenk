'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import {
  HiChatAlt2,
  HiClock,
  HiCollection,
  HiEye,
  HiEyeOff,
  HiExternalLink,
  HiLogout,
  HiMail,
  HiOfficeBuilding,
  HiPhone,
  HiPhotograph,
  HiPlus,
  HiRefresh,
  HiSearch,
  HiSpeakerphone,
  HiStatusOffline,
  HiStatusOnline,
  HiTrash,
  HiUsers,
  HiVideoCamera,
} from 'react-icons/hi'
import type {
  AdminAd,
  AdminBusiness,
  AdminConversation,
  AdminDashboardData,
  AdminMessage,
} from '@/lib/admin/dashboard'

type AdminFormAction = (formData: FormData) => void | Promise<void>

type AdminDashboardProps = {
  data: AdminDashboardData
  createAdAction: AdminFormAction
  deleteAdAction: AdminFormAction
  logoutAction: AdminFormAction
  toggleAdActiveAction: AdminFormAction
  updateAdAction: AdminFormAction
}

function getInitials(name: string | null, fallback: string) {
  const source = name?.trim() || fallback
  const parts = source.split(/\s+/).filter(Boolean)

  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
  }

  return source.substring(0, 2).toUpperCase()
}

function formatDate(value: string, dateFormat: string) {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return 'Unknown'
  }

  return format(date, dateFormat)
}

function businessName(business: AdminBusiness) {
  return business.business_name || business.email
}

function customerName(conversation: AdminConversation) {
  return (
    conversation.customer_name ||
    conversation.customer_email ||
    conversation.customer_phone ||
    'Customer'
  )
}

function messagePreview(conversation: AdminConversation) {
  const latestMessage = conversation.latest_message

  if (!latestMessage) return 'No messages yet'
  if (latestMessage.content) return latestMessage.content
  if (latestMessage.image_url) return 'Image attachment'

  return 'Empty message'
}

function matchesQuery(values: Array<string | null | undefined>, query: string) {
  if (!query) return true

  return values.some((value) => value?.toLowerCase().includes(query))
}

function senderLabel(
  message: AdminMessage,
  selectedBusiness: AdminBusiness,
  selectedConversation: AdminConversation
) {
  if (message.sender_type === 'business') {
    return businessName(selectedBusiness)
  }

  return customerName(selectedConversation)
}

function toDateTimeLocal(value: string | null) {
  if (!value) return ''

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return ''

  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
  return localDate.toISOString().slice(0, 16)
}

function placementLabel(placement: AdminAd['placement']) {
  return placement
    .split('-')
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(' ')
}

function isAdLive(ad: AdminAd) {
  if (!ad.active) return false

  const now = Date.now()
  const startsAt = ad.starts_at ? new Date(ad.starts_at).getTime() : null
  const endsAt = ad.ends_at ? new Date(ad.ends_at).getTime() : null

  return (
    (startsAt === null || Number.isNaN(startsAt) || startsAt <= now) &&
    (endsAt === null || Number.isNaN(endsAt) || endsAt >= now)
  )
}

function AdPreview({ ad }: { ad: AdminAd }) {
  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-gray-100 dark:border-gray-700 dark:bg-gray-800">
      <div className="aspect-video">
        <img
          src={ad.image_url}
          alt={ad.title}
          className="h-full w-full object-cover"
          loading="lazy"
        />
      </div>
      {ad.video_url && (
        <div className="flex items-center gap-2 border-t border-gray-200 px-3 py-2 text-xs font-medium text-gray-600 dark:border-gray-700 dark:text-gray-300">
          <HiVideoCamera className="text-sm text-primary-600" />
          <span className="truncate">Video link attached</span>
        </div>
      )}
    </div>
  )
}

function AdFormFields({ ad }: { ad?: AdminAd }) {
  return (
    <>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="md:col-span-2">
          <label
            htmlFor={ad ? `ad-title-${ad.id}` : 'ad-title'}
            className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Title
          </label>
          <input
            id={ad ? `ad-title-${ad.id}` : 'ad-title'}
            name="title"
            required
            defaultValue={ad?.title || ''}
            className="h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 outline-none transition-colors focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
          />
        </div>

        <div className="md:col-span-2">
          <label
            htmlFor={ad ? `ad-description-${ad.id}` : 'ad-description'}
            className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Description
          </label>
          <textarea
            id={ad ? `ad-description-${ad.id}` : 'ad-description'}
            name="description"
            rows={3}
            defaultValue={ad?.description || ''}
            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition-colors focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
          />
        </div>

        <div className="md:col-span-2">
          <label
            htmlFor={ad ? `ad-image-${ad.id}` : 'ad-image'}
            className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Image URL
          </label>
          <input
            id={ad ? `ad-image-${ad.id}` : 'ad-image'}
            name="image_url"
            type="url"
            required
            defaultValue={ad?.image_url || ''}
            placeholder="https://example.com/ad-image.jpg"
            className="h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 outline-none transition-colors focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
          />
        </div>

        <div className="md:col-span-2">
          <label
            htmlFor={ad ? `ad-video-${ad.id}` : 'ad-video'}
            className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Video URL
          </label>
          <input
            id={ad ? `ad-video-${ad.id}` : 'ad-video'}
            name="video_url"
            type="url"
            defaultValue={ad?.video_url || ''}
            placeholder="https://youtube.com/watch?v=..."
            className="h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 outline-none transition-colors focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
          />
        </div>

        <div className="md:col-span-2">
          <label
            htmlFor={ad ? `ad-target-${ad.id}` : 'ad-target'}
            className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Target URL
          </label>
          <input
            id={ad ? `ad-target-${ad.id}` : 'ad-target'}
            name="target_url"
            type="url"
            defaultValue={ad?.target_url || ''}
            placeholder="https://example.com"
            className="h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 outline-none transition-colors focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
          />
        </div>

        <div>
          <label
            htmlFor={ad ? `ad-placement-${ad.id}` : 'ad-placement'}
            className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Placement
          </label>
          <select
            id={ad ? `ad-placement-${ad.id}` : 'ad-placement'}
            name="placement"
            defaultValue={ad?.placement || 'bottom-right'}
            className="h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 outline-none transition-colors focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
          >
            <option value="bottom-right">Bottom Right</option>
            <option value="bottom-left">Bottom Left</option>
            <option value="top-right">Top Right</option>
            <option value="top-left">Top Left</option>
          </select>
        </div>

        <div>
          <label
            htmlFor={ad ? `ad-duration-${ad.id}` : 'ad-duration'}
            className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Duration
          </label>
          <select
            id={ad ? `ad-duration-${ad.id}` : 'ad-duration'}
            name="duration_seconds"
            defaultValue={String(ad?.duration_seconds || 4)}
            className="h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 outline-none transition-colors focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
          >
            <option value="3">3 seconds</option>
            <option value="4">4 seconds</option>
            <option value="5">5 seconds</option>
          </select>
        </div>

        <div>
          <label
            htmlFor={ad ? `ad-sort-${ad.id}` : 'ad-sort'}
            className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Sort order
          </label>
          <input
            id={ad ? `ad-sort-${ad.id}` : 'ad-sort'}
            name="sort_order"
            type="number"
            defaultValue={ad?.sort_order ?? 0}
            className="h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 outline-none transition-colors focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
          />
        </div>

        <label className="flex h-10 items-center gap-2 self-end rounded-lg border border-gray-200 bg-white px-3 text-sm font-medium text-gray-700 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-300">
          <input
            name="active"
            type="checkbox"
            defaultChecked={ad?.active ?? true}
            className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          />
          <span>Active</span>
        </label>

        <div>
          <label
            htmlFor={ad ? `ad-starts-${ad.id}` : 'ad-starts'}
            className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Starts
          </label>
          <input
            id={ad ? `ad-starts-${ad.id}` : 'ad-starts'}
            name="starts_at"
            type="datetime-local"
            defaultValue={toDateTimeLocal(ad?.starts_at || null)}
            className="h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 outline-none transition-colors focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
          />
        </div>

        <div>
          <label
            htmlFor={ad ? `ad-ends-${ad.id}` : 'ad-ends'}
            className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Ends
          </label>
          <input
            id={ad ? `ad-ends-${ad.id}` : 'ad-ends'}
            name="ends_at"
            type="datetime-local"
            defaultValue={toDateTimeLocal(ad?.ends_at || null)}
            className="h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 outline-none transition-colors focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
          />
        </div>
      </div>
    </>
  )
}

function AdminAdsManager({
  ads,
  createAdAction,
  deleteAdAction,
  toggleAdActiveAction,
  updateAdAction,
}: {
  ads: AdminAd[]
  createAdAction: AdminFormAction
  deleteAdAction: AdminFormAction
  toggleAdActiveAction: AdminFormAction
  updateAdAction: AdminFormAction
}) {
  return (
    <main className="flex-1 overflow-y-auto bg-gray-50 p-4 dark:bg-gray-950 lg:p-6">
      <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[380px_minmax(0,1fr)]">
        <section className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="mb-4 flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50 text-primary-600 dark:bg-primary-950/30">
              <HiPlus className="text-xl" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-950 dark:text-white">
                Create Ad
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Customers see one active ad once per day.
              </p>
            </div>
          </div>

          <form action={createAdAction} className="space-y-4">
            <AdFormFields />
            <button
              type="submit"
              className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-primary-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-primary-700"
            >
              <HiSpeakerphone className="text-lg" />
              <span>Create ad</span>
            </button>
          </form>
        </section>

        <section className="min-w-0">
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-base font-semibold text-gray-950 dark:text-white">
                Ads
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {ads.length} total, {ads.filter(isAdLive).length} currently visible
              </p>
            </div>
          </div>

          {ads.length === 0 ? (
            <div className="flex min-h-[360px] items-center justify-center rounded-lg border border-dashed border-gray-300 bg-white px-4 text-center dark:border-gray-700 dark:bg-gray-900">
              <div>
                <HiPhotograph className="mx-auto text-4xl text-gray-300 dark:text-gray-600" />
                <p className="mt-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                  No ads yet
                </p>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Create the first customer ad from the form.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid gap-4 xl:grid-cols-2">
              {ads.map((ad) => {
                const live = isAdLive(ad)

                return (
                  <article
                    key={ad.id}
                    className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900"
                  >
                    <AdPreview ad={ad} />

                    <div className="mt-4 flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="truncate text-sm font-semibold text-gray-950 dark:text-white">
                          {ad.title}
                        </h3>
                        {ad.description && (
                          <p className="mt-1 line-clamp-2 text-xs leading-5 text-gray-500 dark:text-gray-400">
                            {ad.description}
                          </p>
                        )}
                      </div>
                      <span
                        className={`flex-shrink-0 rounded-full px-2 py-1 text-[11px] font-semibold ${
                          live
                            ? 'bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-300'
                            : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300'
                        }`}
                      >
                        {live ? 'Live' : 'Paused'}
                      </span>
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-gray-500 dark:text-gray-400">
                      <span className="rounded-lg bg-gray-50 px-2.5 py-2 dark:bg-gray-950">
                        {placementLabel(ad.placement)}
                      </span>
                      <span className="rounded-lg bg-gray-50 px-2.5 py-2 dark:bg-gray-950">
                        {ad.duration_seconds}s display
                      </span>
                      <span className="rounded-lg bg-gray-50 px-2.5 py-2 dark:bg-gray-950">
                        Sort {ad.sort_order}
                      </span>
                      <span className="rounded-lg bg-gray-50 px-2.5 py-2 dark:bg-gray-950">
                        {ad.video_url ? 'Video' : 'Image'}
                      </span>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <form action={toggleAdActiveAction}>
                        <input type="hidden" name="id" value={ad.id} />
                        <input
                          type="hidden"
                          name="active"
                          value={ad.active ? 'false' : 'true'}
                        />
                        <button
                          type="submit"
                          className="inline-flex h-9 items-center gap-2 rounded-lg border border-gray-200 px-3 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                        >
                          {ad.active ? (
                            <HiEyeOff className="text-base" />
                          ) : (
                            <HiEye className="text-base" />
                          )}
                          <span>{ad.active ? 'Pause' : 'Activate'}</span>
                        </button>
                      </form>

                      <form
                        action={deleteAdAction}
                        onSubmit={(event) => {
                          if (!window.confirm('Delete this ad?')) {
                            event.preventDefault()
                          }
                        }}
                      >
                        <input type="hidden" name="id" value={ad.id} />
                        <button
                          type="submit"
                          className="inline-flex h-9 items-center gap-2 rounded-lg border border-red-200 px-3 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 dark:border-red-900/60 dark:text-red-400 dark:hover:bg-red-950/30"
                        >
                          <HiTrash className="text-base" />
                          <span>Delete</span>
                        </button>
                      </form>
                    </div>

                    <details className="mt-4 rounded-lg border border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-950">
                      <summary className="flex cursor-pointer list-none items-center gap-2 px-3 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300">
                        <span>Edit ad</span>
                      </summary>
                      <form
                        action={updateAdAction}
                        className="space-y-4 border-t border-gray-200 p-3 dark:border-gray-800"
                      >
                        <input type="hidden" name="id" value={ad.id} />
                        <AdFormFields ad={ad} />
                        <button
                          type="submit"
                          className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-primary-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-primary-700"
                        >
                          <span>Save changes</span>
                        </button>
                      </form>
                    </details>
                  </article>
                )
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  )
}

export function AdminDashboard({
  data,
  createAdAction,
  deleteAdAction,
  logoutAction,
  toggleAdActiveAction,
  updateAdAction,
}: AdminDashboardProps) {
  const router = useRouter()
  const [activeView, setActiveView] = useState<'chats' | 'ads'>('chats')
  const [businessQuery, setBusinessQuery] = useState('')
  const [conversationQuery, setConversationQuery] = useState('')
  const [selectedBusinessId, setSelectedBusinessId] = useState(
    data.businesses[0]?.id || ''
  )
  const [selectedConversationId, setSelectedConversationId] = useState('')

  const normalizedBusinessQuery = businessQuery.trim().toLowerCase()
  const normalizedConversationQuery = conversationQuery.trim().toLowerCase()

  const filteredBusinesses = useMemo(() => {
    return data.businesses.filter((business) =>
      matchesQuery(
        [
          business.business_name,
          business.email,
          business.phone,
          business.address,
        ],
        normalizedBusinessQuery
      )
    )
  }, [data.businesses, normalizedBusinessQuery])

  const selectedBusiness =
    filteredBusinesses.find((business) => business.id === selectedBusinessId) ||
    filteredBusinesses[0] ||
    null

  const filteredConversations = useMemo(() => {
    if (!selectedBusiness) return []

    return selectedBusiness.conversations.filter((conversation) => {
      const messageMatches = conversation.messages.some((message) =>
        matchesQuery([message.content], normalizedConversationQuery)
      )

      return (
        matchesQuery(
          [
            conversation.customer_name,
            conversation.customer_email,
            conversation.customer_phone,
            messagePreview(conversation),
          ],
          normalizedConversationQuery
        ) || messageMatches
      )
    })
  }, [selectedBusiness, normalizedConversationQuery])

  const selectedConversation =
    filteredConversations.find(
      (conversation) => conversation.id === selectedConversationId
    ) ||
    filteredConversations[0] ||
    null

  useEffect(() => {
    setConversationQuery('')
    setSelectedConversationId(selectedBusiness?.conversations[0]?.id || '')
  }, [selectedBusiness?.id])

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 text-gray-900 dark:bg-gray-950 dark:text-white">
      <header className="border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <div className="flex flex-col gap-4 px-4 py-4 lg:flex-row lg:items-center lg:justify-between lg:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <Image
              src="/logo.png"
              alt="Leenk"
              width={36}
              height={36}
              className="h-9 w-9 flex-shrink-0 dark:opacity-90"
            />
            <div className="min-w-0">
              <h1 className="truncate text-lg font-semibold text-gray-950 dark:text-white">
                Admin Dashboard
              </h1>
              <p className="truncate text-sm text-gray-500 dark:text-gray-400">
                Businesses, conversations, messages, and customer ads
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 dark:border-gray-800 dark:bg-gray-950">
                <div className="text-[11px] font-medium uppercase text-gray-500 dark:text-gray-400">
                  Businesses
                </div>
                <div className="text-lg font-semibold">{data.totals.businesses}</div>
              </div>
              <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 dark:border-gray-800 dark:bg-gray-950">
                <div className="text-[11px] font-medium uppercase text-gray-500 dark:text-gray-400">
                  Chats
                </div>
                <div className="text-lg font-semibold">
                  {data.totals.conversations}
                </div>
              </div>
              <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 dark:border-gray-800 dark:bg-gray-950">
                <div className="text-[11px] font-medium uppercase text-gray-500 dark:text-gray-400">
                  Messages
                </div>
                <div className="text-lg font-semibold">{data.totals.messages}</div>
              </div>
              <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 dark:border-gray-800 dark:bg-gray-950">
                <div className="text-[11px] font-medium uppercase text-gray-500 dark:text-gray-400">
                  Active Ads
                </div>
                <div className="text-lg font-semibold">{data.totals.active_ads}</div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex rounded-lg border border-gray-200 bg-gray-50 p-1 dark:border-gray-700 dark:bg-gray-950">
                <button
                  type="button"
                  onClick={() => setActiveView('chats')}
                  className={`inline-flex h-8 items-center gap-2 rounded-md px-3 text-sm font-medium transition-colors ${
                    activeView === 'chats'
                      ? 'bg-white text-primary-700 shadow-sm dark:bg-gray-800 dark:text-primary-300'
                      : 'text-gray-600 hover:text-gray-950 dark:text-gray-400 dark:hover:text-white'
                  }`}
                >
                  <HiChatAlt2 className="text-base" />
                  <span>Chats</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveView('ads')}
                  className={`inline-flex h-8 items-center gap-2 rounded-md px-3 text-sm font-medium transition-colors ${
                    activeView === 'ads'
                      ? 'bg-white text-primary-700 shadow-sm dark:bg-gray-800 dark:text-primary-300'
                      : 'text-gray-600 hover:text-gray-950 dark:text-gray-400 dark:hover:text-white'
                  }`}
                >
                  <HiSpeakerphone className="text-base" />
                  <span>Ads</span>
                </button>
              </div>
              <button
                type="button"
                onClick={() => router.refresh()}
                title="Refresh dashboard"
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                <HiRefresh className="text-lg" />
              </button>
              <form action={logoutAction}>
                <button
                  type="submit"
                  className="inline-flex h-10 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  <HiLogout className="text-lg" />
                  <span>Logout</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </header>

      {activeView === 'ads' ? (
        <AdminAdsManager
          ads={data.ads}
          createAdAction={createAdAction}
          deleteAdAction={deleteAdAction}
          toggleAdActiveAction={toggleAdActiveAction}
          updateAdAction={updateAdAction}
        />
      ) : (
        <main className="grid flex-1 grid-cols-1 lg:min-h-0 lg:grid-cols-[320px_360px_minmax(0,1fr)]">
        <section className="border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 lg:min-h-0 lg:overflow-y-auto lg:border-b-0 lg:border-r">
          <div className="sticky top-0 z-10 border-b border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-200">
              <HiOfficeBuilding className="text-lg text-primary-600" />
              <span>Businesses</span>
            </div>
            <label className="sr-only" htmlFor="business-search">
              Search businesses
            </label>
            <div className="relative">
              <HiSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                id="business-search"
                value={businessQuery}
                onChange={(event) => setBusinessQuery(event.target.value)}
                placeholder="Search businesses"
                className="h-10 w-full rounded-lg border border-gray-200 bg-gray-50 pl-9 pr-3 text-sm text-gray-900 outline-none transition-colors focus:border-primary-500 focus:bg-white focus:ring-2 focus:ring-primary-500/20 dark:border-gray-700 dark:bg-gray-950 dark:text-white dark:focus:bg-gray-900"
              />
            </div>
          </div>

          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {filteredBusinesses.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                No businesses found
              </div>
            ) : (
              filteredBusinesses.map((business) => {
                const selected = business.id === selectedBusiness?.id

                return (
                  <button
                    key={business.id}
                    type="button"
                    onClick={() => setSelectedBusinessId(business.id)}
                    className={`w-full border-l-4 px-4 py-3 text-left transition-colors ${
                      selected
                        ? 'border-primary-600 bg-primary-50/70 dark:bg-primary-950/20'
                        : 'border-transparent hover:bg-gray-50 dark:hover:bg-gray-800/60'
                    }`}
                  >
                    <div className="flex min-w-0 gap-3">
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gray-900 text-sm font-semibold text-white dark:bg-gray-700">
                        {getInitials(business.business_name, business.email)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex min-w-0 items-center gap-2">
                          <p className="truncate text-sm font-semibold text-gray-950 dark:text-white">
                            {businessName(business)}
                          </p>
                          {business.online ? (
                            <HiStatusOnline
                              className="flex-shrink-0 text-green-500"
                              title="Online"
                            />
                          ) : (
                            <HiStatusOffline
                              className="flex-shrink-0 text-gray-400"
                              title="Offline"
                            />
                          )}
                        </div>
                        <p className="mt-0.5 truncate text-xs text-gray-500 dark:text-gray-400">
                          {business.email}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-2 text-xs text-gray-500 dark:text-gray-400">
                          <span className="inline-flex items-center gap-1">
                            <HiChatAlt2 />
                            {business.conversation_count}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <HiCollection />
                            {business.message_count}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <HiClock />
                            {formatDate(business.created_at, 'MMM d, yyyy')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>
                )
              })
            )}
          </div>
        </section>

        <section className="border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 lg:min-h-0 lg:overflow-y-auto lg:border-b-0 lg:border-r">
          <div className="sticky top-0 z-10 border-b border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-200">
                <HiUsers className="text-lg text-primary-600" />
                <span className="truncate">
                  {selectedBusiness ? businessName(selectedBusiness) : 'Conversations'}
                </span>
              </div>
              {selectedBusiness && (
                <Link
                  href={`/chat/${selectedBusiness.phone || selectedBusiness.id}`}
                  title="Open customer chat"
                  className="inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  <HiExternalLink />
                </Link>
              )}
            </div>
            <label className="sr-only" htmlFor="conversation-search">
              Search conversations
            </label>
            <div className="relative">
              <HiSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                id="conversation-search"
                value={conversationQuery}
                onChange={(event) => setConversationQuery(event.target.value)}
                placeholder="Search conversations"
                className="h-10 w-full rounded-lg border border-gray-200 bg-gray-50 pl-9 pr-3 text-sm text-gray-900 outline-none transition-colors focus:border-primary-500 focus:bg-white focus:ring-2 focus:ring-primary-500/20 dark:border-gray-700 dark:bg-gray-950 dark:text-white dark:focus:bg-gray-900"
              />
            </div>
          </div>

          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {!selectedBusiness ? (
              <div className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                Select a business
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                No conversations found
              </div>
            ) : (
              filteredConversations.map((conversation) => {
                const selected = conversation.id === selectedConversation?.id
                const latestPreview = messagePreview(conversation)

                return (
                  <button
                    key={conversation.id}
                    type="button"
                    onClick={() => setSelectedConversationId(conversation.id)}
                    className={`w-full border-l-4 px-4 py-3 text-left transition-colors ${
                      selected
                        ? 'border-primary-600 bg-primary-50/70 dark:bg-primary-950/20'
                        : 'border-transparent hover:bg-gray-50 dark:hover:bg-gray-800/60'
                    }`}
                  >
                    <div className="flex min-w-0 gap-3">
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary-600 text-sm font-semibold text-white">
                        {getInitials(
                          conversation.customer_name,
                          conversation.customer_email
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <p className="min-w-0 truncate text-sm font-semibold text-gray-950 dark:text-white">
                            {customerName(conversation)}
                          </p>
                          <span className="flex-shrink-0 text-[11px] text-gray-500 dark:text-gray-400">
                            {formatDate(conversation.updated_at, 'MMM d')}
                          </span>
                        </div>
                        <p className="mt-0.5 truncate text-xs text-gray-500 dark:text-gray-400">
                          {conversation.customer_email}
                        </p>
                        <p className="mt-2 truncate text-xs text-gray-600 dark:text-gray-300">
                          {latestPreview}
                        </p>
                        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                          <span>{conversation.message_count} messages</span>
                          {conversation.unread_count > 0 && (
                            <span className="rounded-full bg-primary-600 px-2 py-0.5 text-white">
                              {conversation.unread_count} unread
                            </span>
                          )}
                          {conversation.pinned && (
                            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                              Pinned
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                )
              })
            )}
          </div>
        </section>

        <section className="flex min-h-[560px] flex-col bg-gray-50 dark:bg-gray-950 lg:min-h-0">
          {selectedBusiness && selectedConversation ? (
            <>
              <div className="border-b border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex min-w-0 gap-3">
                    <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-primary-600 text-sm font-semibold text-white">
                      {getInitials(
                        selectedConversation.customer_name,
                        selectedConversation.customer_email
                      )}
                    </div>
                    <div className="min-w-0">
                      <h2 className="truncate text-base font-semibold text-gray-950 dark:text-white">
                        {customerName(selectedConversation)}
                      </h2>
                      <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
                        <span className="inline-flex items-center gap-1">
                          <HiMail />
                          {selectedConversation.customer_email}
                        </span>
                        {selectedConversation.customer_phone && (
                          <span className="inline-flex items-center gap-1">
                            <HiPhone />
                            {selectedConversation.customer_phone}
                          </span>
                        )}
                      </div>
                      <p className="mt-1 truncate text-xs text-gray-500 dark:text-gray-400">
                        {businessName(selectedBusiness)}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <span className="rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-1 dark:border-gray-700 dark:bg-gray-950">
                      {selectedConversation.message_count} messages
                    </span>
                    <span className="rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-1 dark:border-gray-700 dark:bg-gray-950">
                      Updated {formatDate(selectedConversation.updated_at, 'MMM d, p')}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
                {selectedConversation.messages.length === 0 ? (
                  <div className="flex h-full min-h-[280px] items-center justify-center text-center text-sm text-gray-500 dark:text-gray-400">
                    No messages in this conversation
                  </div>
                ) : (
                  selectedConversation.messages.map((message) => {
                    const isBusinessMessage = message.sender_type === 'business'

                    return (
                      <div
                        key={message.id}
                        className={`flex ${
                          isBusinessMessage ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        <div
                          className={`max-w-[88%] rounded-lg px-3 py-2 shadow-sm sm:max-w-[72%] ${
                            isBusinessMessage
                              ? 'bg-[#dcf8c6] text-gray-900'
                              : 'bg-white text-gray-900 dark:bg-gray-800 dark:text-white'
                          }`}
                        >
                          <div className="mb-1 text-[11px] font-semibold text-gray-600 dark:text-gray-300">
                            {senderLabel(
                              message,
                              selectedBusiness,
                              selectedConversation
                            )}
                          </div>
                          {message.image_url && (
                            <img
                              src={message.image_url}
                              alt="Message attachment"
                              className="mb-2 max-h-72 max-w-full rounded-lg object-contain"
                            />
                          )}
                          {message.content && (
                            <p className="whitespace-pre-wrap break-words text-sm leading-5">
                              {message.content}
                            </p>
                          )}
                          {!message.content && !message.image_url && (
                            <p className="text-sm italic text-gray-500">
                              Empty message
                            </p>
                          )}
                          <div className="mt-1 flex items-center justify-end gap-2 text-[11px] text-gray-500">
                            <span>{formatDate(message.created_at, 'MMM d, p')}</span>
                            <span className="capitalize">{message.status}</span>
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center px-4 text-center text-sm text-gray-500 dark:text-gray-400">
              Select a business and conversation to view messages
            </div>
          )}
        </section>
        </main>
      )}
    </div>
  )
}
