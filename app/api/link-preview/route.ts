import { NextRequest, NextResponse } from 'next/server'

/**
 * Link Preview API Route
 * Fetches Open Graph and meta tags from a URL
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const url = searchParams.get('url')

  if (!url) {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 })
  }

  try {
    // Validate URL
    const urlObj = new URL(url)

    // Fetch the page
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; LeenkBot/1.0)',
      },
      // Timeout after 5 seconds
      signal: AbortSignal.timeout(5000),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const html = await response.text()

    // Extract Open Graph and meta tags
    const titleMatch = html.match(/<meta\s+property="og:title"\s+content="([^"]+)"/i) ||
                       html.match(/<title>([^<]+)<\/title>/i)
    const descriptionMatch = html.match(/<meta\s+property="og:description"\s+content="([^"]+)"/i) ||
                            html.match(/<meta\s+name="description"\s+content="([^"]+)"/i)
    const imageMatch = html.match(/<meta\s+property="og:image"\s+content="([^"]+)"/i)

    const title = titleMatch ? titleMatch[1] : null
    const description = descriptionMatch ? descriptionMatch[1] : null
    let image = imageMatch ? imageMatch[1] : null

    // Resolve relative image URLs
    if (image && !image.startsWith('http')) {
      image = new URL(image, urlObj.origin).href
    }

    return NextResponse.json({
      title: title || urlObj.hostname,
      description: description || null,
      image: image || null,
      url,
    })
  } catch (error: any) {
    console.error('Link preview error:', error)
    
    // Return basic info even on error
    try {
      const urlObj = new URL(url)
      return NextResponse.json({
        title: urlObj.hostname.replace('www.', ''),
        description: null,
        image: null,
        url,
      })
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL' },
        { status: 400 }
      )
    }
  }
}

