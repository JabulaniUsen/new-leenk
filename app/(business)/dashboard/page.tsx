'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useBusiness } from '@/lib/queries/businesses'
import { useConversations, useUpdateConversation } from '@/lib/queries/conversations'
import { useRealtimeConversations } from '@/lib/hooks/use-realtime-conversations'
import { formatDistanceToNow } from 'date-fns'
import { HiBookmark } from 'react-icons/hi'

// Helper function to get initials from name or email
function getInitials(name: string | null, email: string): string {
  if (name) {
    const parts = name.trim().split(/\s+/)
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    }
    return name.substring(0, 2).toUpperCase()
  }
  // Fallback to email
  const emailParts = email.split('@')[0]
  if (emailParts.length >= 2) {
    return emailParts.substring(0, 2).toUpperCase()
  }
  return emailParts.substring(0, 1).toUpperCase()
}

export default function DashboardPage() {
  const router = useRouter()
  const supabase = createClient()
  const { data: business, isLoading: businessLoading } = useBusiness()
  const { data: conversations, isLoading: conversationsLoading } = useConversations()
  const updateConversation = useUpdateConversation()
  const [showPinButton, setShowPinButton] = useState<string | null>(null)
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null)
  const touchStartRef = useRef<{ conversationId: string; startTime: number } | null>(null)

  // Subscribe to realtime conversations
  useRealtimeConversations(business?.id || null)

  const handlePinToggle = async (e: React.MouseEvent | React.TouchEvent, conversationId: string, currentlyPinned: boolean) => {
    e.preventDefault()
    e.stopPropagation()
    setShowPinButton(null)
    try {
      await updateConversation.mutateAsync({
        conversationId,
        updates: { pinned: !currentlyPinned },
      })
    } catch (err) {
      console.error('Failed to toggle pin:', err)
    }
  }

  // Long press handler for mobile/touch devices
  const handleTouchStart = (e: React.TouchEvent, conversationId: string) => {
    touchStartRef.current = { conversationId, startTime: Date.now() }
    
    longPressTimerRef.current = setTimeout(() => {
      setShowPinButton(conversationId)
      // Haptic feedback on supported devices
      if ('vibrate' in navigator) {
        navigator.vibrate(50)
      }
    }, 500) // 500ms long press
  }

  const handleTouchMove = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current)
      longPressTimerRef.current = null
    }
    touchStartRef.current = null
  }

  const handleTouchEnd = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current)
      longPressTimerRef.current = null
    }
    touchStartRef.current = null
  }

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current)
      }
    }
  }, [])

  // Click outside to hide pin button
  useEffect(() => {
    const handleClickOutside = () => {
      if (showPinButton) {
        setShowPinButton(null)
      }
    }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [showPinButton])

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
      }
    }
    checkAuth()
  }, [router, supabase])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (businessLoading || conversationsLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg text-gray-600 dark:text-gray-400">Loading...</div>
      </div>
    )
  }

  if (!business) {
    return null
  }

  return (
    <div className="h-full bg-white dark:bg-gray-900">
      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto bg-white dark:bg-gray-900">
        <div className="relative">
          {/* Purple accent line on the left */}
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary-600"></div>
          
          <div className="pl-4">
            {!conversations || conversations.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-gray-500 dark:text-gray-400">No conversations yet</p>
              </div>
            ) : (
              <div className="space-y-0">
                {conversations.map((conversation) => {
                  const initials = getInitials(conversation.customer_name, conversation.customer_email)
                  const displayName = conversation.customer_name || conversation.customer_email || 'Unknown'
                  const unreadCount = (conversation as any).unread_count || 0
                  const messagePreview = (conversation as any).latest_message_preview || ''

                  const hasUnread = unreadCount > 0

                  const isPinButtonVisible = showPinButton === conversation.id || conversation.pinned

                  return (
                    <div
                      key={conversation.id}
                      className={`group relative flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border-b border-gray-100 dark:border-gray-800 ${
                        hasUnread ? 'bg-gray-50/50 dark:bg-gray-800/50' : ''
                      }`}
                      onTouchStart={(e) => handleTouchStart(e, conversation.id)}
                      onTouchMove={handleTouchMove}
                      onTouchEnd={handleTouchEnd}
                    >
                      <Link
                        href={`/dashboard/${conversation.id}`}
                        className="flex items-center gap-3 flex-1 min-w-0"
                      >
                        {/* Avatar */}
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center text-white text-sm font-medium">
                          {initials}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <h3 className={`text-sm truncate ${
                              hasUnread 
                                ? 'font-bold text-gray-900 dark:text-white' 
                                : 'font-semibold text-gray-900 dark:text-white'
                            }`}>
                              {displayName}
                            </h3>
                            {conversation.pinned && (
                              <HiBookmark className="text-primary-600 text-sm flex-shrink-0" />
                            )}
                          </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                          {conversation.customer_email}
                        </p>
                        {messagePreview ? (
                          <p className={`text-sm mt-1 truncate ${
                            hasUnread 
                              ? 'text-gray-900 dark:text-gray-200 font-medium' 
                              : 'text-gray-700 dark:text-gray-300'
                          }`}>
                            {messagePreview}
                          </p>
                        ) : (
                          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1 italic">
                            No messages yet
                          </p>
                        )}
                        </div>

                        {/* Unread count and timestamp */}
                        <div className="flex-shrink-0 flex flex-col items-end gap-1.5">
                          {unreadCount > 0 && (
                            <div className="min-w-[24px] h-6 px-1.5 rounded-full bg-primary-600 flex items-center justify-center text-white text-xs font-semibold">
                              {unreadCount > 99 ? '99+' : unreadCount}
                            </div>
                          )}
                          <span className={`text-xs whitespace-nowrap ${
                            hasUnread 
                              ? 'text-gray-600 dark:text-gray-300 font-medium' 
                              : 'text-gray-500 dark:text-gray-400'
                          }`}>
                            {formatDistanceToNow(new Date(conversation.updated_at), {
                              addSuffix: true,
                            })}
                          </span>
                        </div>
                      </Link>

                      {/* Pin/Unpin Button */}
                      <button
                        onClick={(e) => handlePinToggle(e, conversation.id, conversation.pinned)}
                        onTouchStart={(e) => {
                          e.stopPropagation()
                          handlePinToggle(e, conversation.id, conversation.pinned)
                        }}
                        className={`flex-shrink-0 p-2 rounded-lg transition-all ${
                          isPinButtonVisible
                            ? 'opacity-100'
                            : 'opacity-0 group-hover:opacity-100'
                        } ${
                          conversation.pinned
                            ? 'text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20'
                            : 'text-gray-400 hover:text-primary-600 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                        title={conversation.pinned ? 'Unpin conversation' : 'Pin conversation'}
                      >
                        <HiBookmark className={`text-lg ${conversation.pinned ? 'fill-current' : ''}`} />
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

