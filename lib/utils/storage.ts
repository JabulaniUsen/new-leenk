import { createClient } from '@/lib/supabase/client'

/**
 * Get public URL for business logo from storage bucket
 * Handles both full URLs and storage paths
 */
export function getBusinessLogoUrl(businessLogo: string | null | undefined): string | null {
  if (!businessLogo) return null

  // If it's already a full URL, return it
  if (businessLogo.startsWith('http://') || businessLogo.startsWith('https://')) {
    return businessLogo
  }

  // Otherwise, get public URL from storage bucket
  const supabase = createClient()
  const { data } = supabase.storage.from('business_logo').getPublicUrl(businessLogo)

  return data.publicUrl
}

