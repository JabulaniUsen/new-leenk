'use client'

import { useEffect, useMemo, useState } from 'react'
import { HiExternalLink, HiSpeakerphone, HiX } from 'react-icons/hi'
import { useActiveAds, type PublicAd } from '@/lib/queries/ads'
import { createClient } from '@/lib/supabase/client'

const DAILY_AD_KEY = 'leenk_customer_ad_seen_date'

function getTodayKey() {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function chooseDailyAd(ads: PublicAd[]) {
  if (ads.length === 1) return ads[0]

  return ads[Math.floor(Math.random() * ads.length)]
}

function placementClasses(placement: PublicAd['placement']) {
  switch (placement) {
    case 'bottom-left':
      return 'bottom-4 left-4 sm:bottom-6 sm:left-6'
    case 'top-left':
      return 'left-4 top-20 sm:left-6'
    case 'top-right':
      return 'right-4 top-20 sm:right-6'
    case 'bottom-right':
    default:
      return 'bottom-4 right-4 sm:bottom-6 sm:right-6'
  }
}

function getVideoEmbedUrl(videoUrl: string) {
  try {
    const url = new URL(videoUrl)
    const host = url.hostname.replace(/^www\./, '')

    if (host === 'youtu.be') {
      const videoId = url.pathname.replace('/', '')
      return videoId
        ? `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=0&playsinline=1&rel=0`
        : null
    }

    if (host === 'youtube.com' || host === 'm.youtube.com') {
      const watchId = url.searchParams.get('v')
      const pathParts = url.pathname.split('/').filter(Boolean)
      const embeddedId =
        url.pathname.startsWith('/embed/') || url.pathname.startsWith('/shorts/')
          ? pathParts[1]
          : watchId

      return embeddedId
        ? `https://www.youtube.com/embed/${embeddedId}?autoplay=1&mute=1&controls=0&playsinline=1&rel=0`
        : null
    }

    if (host === 'vimeo.com') {
      const videoId = url.pathname.split('/').filter(Boolean)[0]
      return videoId
        ? `https://player.vimeo.com/video/${videoId}?autoplay=1&muted=1&controls=0`
        : null
    }
  } catch {
    return null
  }

  return null
}

function AdMedia({ ad }: { ad: PublicAd }) {
  if (ad.video_url) {
    const embedUrl = getVideoEmbedUrl(ad.video_url)

    if (embedUrl) {
      return (
        <iframe
          src={embedUrl}
          title={ad.title}
          className="h-full w-full"
          allow="autoplay; encrypted-media; picture-in-picture"
          allowFullScreen
        />
      )
    }

    return (
      <video
        src={ad.video_url}
        poster={ad.image_url}
        className="h-full w-full object-cover"
        autoPlay
        loop
        muted
        playsInline
      />
    )
  }

  return (
    <img
      src={ad.image_url}
      alt={ad.title}
      className="h-full w-full object-cover"
      loading="lazy"
    />
  )
}

export function CustomerAdDisplay() {
  const [canShowAds, setCanShowAds] = useState(false)
  const [selectedAd, setSelectedAd] = useState<PublicAd | null>(null)
  const [visible, setVisible] = useState(false)
  const activeAdsQuery = useActiveAds(canShowAds)

  useEffect(() => {
    let mounted = true
    const supabase = createClient()

    supabase.auth
      .getUser()
      .then(({ data }) => {
        if (mounted) setCanShowAds(!data.user)
      })
      .catch(() => {
        if (mounted) setCanShowAds(true)
      })

    return () => {
      mounted = false
    }
  }, [])

  useEffect(() => {
    if (!canShowAds || selectedAd || !activeAdsQuery.data?.length) return

    try {
      const todayKey = getTodayKey()

      if (window.localStorage.getItem(DAILY_AD_KEY) === todayKey) {
        return
      }

      const ad = chooseDailyAd(activeAdsQuery.data)
      window.localStorage.setItem(DAILY_AD_KEY, todayKey)
      setSelectedAd(ad)
      setVisible(true)
    } catch {
      const ad = chooseDailyAd(activeAdsQuery.data)
      setSelectedAd(ad)
      setVisible(true)
    }
  }, [activeAdsQuery.data, canShowAds, selectedAd])

  useEffect(() => {
    if (!visible || !selectedAd) return

    const timeout = window.setTimeout(() => {
      setVisible(false)
    }, selectedAd.duration_seconds * 1000)

    return () => window.clearTimeout(timeout)
  }, [selectedAd, visible])

  const adUrl = useMemo(() => {
    if (!selectedAd?.target_url) return null

    try {
      return new URL(selectedAd.target_url).toString()
    } catch {
      return null
    }
  }, [selectedAd])

  if (!selectedAd || !visible) return null

  return (
    <aside
      aria-label="Sponsored ad"
      className={`fixed z-[60] w-[calc(100vw-2rem)] max-w-sm animate-slide-up overflow-hidden rounded-lg border border-gray-200 bg-white shadow-2xl shadow-gray-900/20 dark:border-gray-700 dark:bg-gray-900 ${placementClasses(
        selectedAd.placement
      )}`}
    >
      <div className="flex items-center justify-between gap-3 border-b border-gray-100 px-3 py-2 dark:border-gray-800">
        <div className="flex min-w-0 items-center gap-2 text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
          <HiSpeakerphone className="flex-shrink-0 text-sm text-primary-600" />
          <span className="truncate">Sponsored</span>
        </div>
        <button
          type="button"
          onClick={() => setVisible(false)}
          className="inline-flex h-8 items-center gap-1 rounded-lg px-2 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
        >
          <HiX className="text-sm" />
          <span>Skip</span>
        </button>
      </div>

      <div className={`relative ${adUrl ? 'cursor-pointer' : ''}`}>
        {adUrl && (
          <a
            href={adUrl}
            aria-label={`Open ad: ${selectedAd.title}`}
            className="absolute inset-0 z-10"
          />
        )}

        <div className="aspect-video bg-gray-100 dark:bg-gray-800">
          <AdMedia ad={selectedAd} />
        </div>

        <div className="space-y-2 px-3 py-3">
          <div className="min-w-0">
            <h2 className="truncate text-sm font-semibold text-gray-950 dark:text-white">
              {selectedAd.title}
            </h2>
            {selectedAd.description && (
              <p className="mt-1 line-clamp-2 text-xs leading-5 text-gray-600 dark:text-gray-300">
                {selectedAd.description}
              </p>
            )}
          </div>

          {adUrl && (
            <div className="inline-flex h-9 items-center gap-2 rounded-lg bg-primary-600 px-3 text-xs font-semibold text-white">
              <HiExternalLink className="text-sm" />
              <span>Open</span>
            </div>
          )}
        </div>
      </div>
    </aside>
  )
}
