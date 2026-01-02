'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useState } from 'react'

/**
 * TanStack Query Provider
 * 
 * Cost optimization configuration:
 * - Stale time: 30s - reduces unnecessary refetches
 * - Cache time: 5min - keeps data in memory to avoid duplicate queries
 * - Retry: Only on network errors, not 4xx errors (saves egress)
 * - Refetch on window focus: Disabled to reduce background queries
 */
export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30 * 1000, // 30 seconds
            gcTime: 5 * 60 * 1000, // 5 minutes (formerly cacheTime)
            retry: (failureCount, error: any) => {
              // Only retry on network errors, not 4xx/5xx
              if (error?.status >= 400 && error?.status < 500) {
                return false
              }
              return failureCount < 2
            },
            refetchOnWindowFocus: false,
            refetchOnReconnect: true,
          },
          mutations: {
            retry: false, // Don't retry mutations
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  )
}

