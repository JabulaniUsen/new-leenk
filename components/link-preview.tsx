'use client'

import { useEffect, useState } from 'react'
import { HiExternalLink } from 'react-icons/hi'

interface LinkPreviewData {
  title?: string
  description?: string
  image?: string
  url: string
}

interface LinkPreviewProps {
  url: string
}

export function LinkPreview({ url }: LinkPreviewProps) {
  const [preview, setPreview] = useState<LinkPreviewData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    const fetchPreview = async () => {
      try {
        setLoading(true)
        setError(false)

        // Use a link preview API or fetch metadata
        // For now, we'll create a simple preview from the URL
        const urlObj = new URL(url)
        const hostname = urlObj.hostname.replace('www.', '')

        // Try to fetch Open Graph metadata
        try {
          const response = await fetch(`/api/link-preview?url=${encodeURIComponent(url)}`)
          if (response.ok) {
            const data = await response.json()
            setPreview({
              title: data.title || hostname,
              description: data.description || url,
              image: data.image,
              url,
            })
          } else {
            throw new Error('Failed to fetch preview')
          }
        } catch {
          // Fallback to basic preview
          setPreview({
            title: hostname,
            description: url,
            url,
          })
        }
      } catch (err) {
        console.error('Link preview error:', err)
        setError(true)
      } finally {
        setLoading(false)
      }
    }

    if (url) {
      fetchPreview()
    }
  }, [url])

  if (loading || error || !preview) {
    return null
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => e.stopPropagation()}
      className="block mt-2 rounded-lg border border-gray-300 dark:border-gray-600 overflow-hidden hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
    >
      {preview.image && (
        <div className="w-full h-32 sm:h-40 bg-gray-200 dark:bg-gray-700 overflow-hidden">
          <img
            src={preview.image}
            alt={preview.title || 'Link preview'}
            className="w-full h-full object-cover"
            onError={(e) => {
              // Hide image on error
              e.currentTarget.style.display = 'none'
            }}
          />
        </div>
      )}
      <div className="p-2 sm:p-3">
        <div className="flex items-start gap-2">
          <div className="flex-1 min-w-0">
            <h4 className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white truncate mb-0.5">
              {preview.title}
            </h4>
            {preview.description && (
              <p className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                {preview.description}
              </p>
            )}
            <p className="text-[9px] sm:text-[10px] text-primary-600 dark:text-primary-400 truncate mt-1">
              {new URL(url).hostname.replace('www.', '')}
            </p>
          </div>
          <HiExternalLink className="flex-shrink-0 text-primary-600 dark:text-primary-400 text-sm mt-0.5" />
        </div>
      </div>
    </a>
  )
}

