'use client'

import { ReactNode } from 'react'

/**
 * URL regex pattern - matches http, https, and www URLs
 */
const URL_REGEX = /(https?:\/\/[^\s]+|www\.[^\s]+)/gi

/**
 * Parse text and convert URLs to clickable links
 * Preserves whitespace and formatting
 */
export function parseLinks(text: string): ReactNode[] {
  if (!text) return []

  const parts: ReactNode[] = []
  let lastIndex = 0
  let match
  let keyCounter = 0

  // Reset regex lastIndex
  URL_REGEX.lastIndex = 0

  while ((match = URL_REGEX.exec(text)) !== null) {
    // Add text before the URL (preserve whitespace including newlines)
    if (match.index > lastIndex) {
      const textBefore = text.substring(lastIndex, match.index)
      // Split by newlines and preserve them
      const lines = textBefore.split('\n')
      lines.forEach((line, lineIndex) => {
        if (lineIndex > 0) {
          parts.push(<br key={`br-${keyCounter++}`} />)
        }
        if (line) {
          parts.push(line)
        }
      })
    }

    // Process the URL
    let url = match[0]
    let displayUrl = url

    // Add protocol if missing
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = `https://${url}`
    }

    // Truncate display URL if too long
    try {
      const urlObj = new URL(url)
      displayUrl = urlObj.hostname + urlObj.pathname
      if (displayUrl.length > 50) {
        displayUrl = displayUrl.substring(0, 47) + '...'
      }
    } catch {
      // If URL parsing fails, use original
      displayUrl = url.length > 50 ? url.substring(0, 47) + '...' : url
    }

    // Add clickable link
    parts.push(
      <a
        key={`link-${keyCounter++}`}
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-primary-600 dark:text-primary-400 hover:underline break-all inline"
        onClick={(e) => e.stopPropagation()}
      >
        {displayUrl}
      </a>
    )

    lastIndex = URL_REGEX.lastIndex
  }

  // Add remaining text (preserve newlines)
  if (lastIndex < text.length) {
    const textAfter = text.substring(lastIndex)
    const lines = textAfter.split('\n')
    lines.forEach((line, lineIndex) => {
      if (lineIndex > 0) {
        parts.push(<br key={`br-${keyCounter++}`} />)
      }
      if (line) {
        parts.push(line)
      }
    })
  }

  return parts.length > 0 ? parts : [text]
}

/**
 * Extract first URL from text
 */
export function extractFirstUrl(text: string): string | null {
  if (!text) return null

  URL_REGEX.lastIndex = 0
  const match = text.match(URL_REGEX)
  if (!match || match.length === 0) return null

  let url = match[0]
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = `https://${url}`
  }

  return url
}

