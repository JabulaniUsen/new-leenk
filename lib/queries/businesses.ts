import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/lib/types/database'

type Business = Database['public']['Tables']['businesses']['Row']
type BusinessUpdate = Database['public']['Tables']['businesses']['Update']

/**
 * Fetch current business profile
 * Cost optimization: Only fetches single row by auth.uid()
 */
export function useBusiness() {
  return useQuery({
    queryKey: ['business', 'current'],
    queryFn: async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) throw error
      return data as Business
    },
  })
}

/**
 * Update business profile
 * Cost optimization: Only updates single row, uses RLS
 */
export function useUpdateBusiness() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async (updates: BusinessUpdate) => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('businesses')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business'] })
    },
  })
}

/**
 * Update business online status
 * Cost optimization: Minimal update, only status field
 */
export function useUpdateOnlineStatus() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async (online: boolean) => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('businesses')
        .update({ online, updated_at: new Date().toISOString() })
        .eq('id', user.id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business'] })
    },
  })
}

/**
 * Get business by phone or ID (for customer chat entry)
 * Cost optimization: Single row lookup with index
 */
export async function getBusinessByIdentifier(
  identifier: string
): Promise<Business | null> {
  const supabase = createClient()

  // Try by ID first (UUID)
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  if (uuidRegex.test(identifier)) {
    const { data, error } = await supabase
      .from('businesses')
      .select('*')
      .eq('id', identifier)
      .single()

    if (!error && data) return data as Business
  }

  // Try by phone
  const { data, error } = await supabase
    .from('businesses')
    .select('*')
    .eq('phone', identifier)
    .single()

  if (error || !data) return null
  return data as Business
}

