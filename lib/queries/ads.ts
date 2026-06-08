import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/lib/types/database'

type AdRow = Database['public']['Tables']['ads']['Row']

export type PublicAd = Pick<
  AdRow,
  | 'id'
  | 'title'
  | 'description'
  | 'image_url'
  | 'video_url'
  | 'target_url'
  | 'placement'
  | 'duration_seconds'
  | 'sort_order'
  | 'starts_at'
  | 'ends_at'
>

function isAdInSchedule(ad: PublicAd) {
  const now = Date.now()
  const startsAt = ad.starts_at ? new Date(ad.starts_at).getTime() : null
  const endsAt = ad.ends_at ? new Date(ad.ends_at).getTime() : null

  return (
    (startsAt === null || Number.isNaN(startsAt) || startsAt <= now) &&
    (endsAt === null || Number.isNaN(endsAt) || endsAt >= now)
  )
}

export function useActiveAds(enabled = true) {
  const supabase = createClient()

  return useQuery({
    queryKey: ['ads', 'active'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ads')
        .select(
          'id, title, description, image_url, video_url, target_url, placement, duration_seconds, sort_order, starts_at, ends_at'
        )
        .eq('active', true)
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false })

      if (error) throw error

      return ((data || []) as PublicAd[]).filter(isAdInSchedule)
    },
    enabled,
    staleTime: 1000 * 60 * 10,
  })
}
