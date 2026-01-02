import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/lib/types/database'

/**
 * Browser-side Supabase client
 * Creates a singleton instance for client components
 * 
 * Cost optimization: Uses browser client for client-side operations
 * to avoid unnecessary server round-trips
 */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

