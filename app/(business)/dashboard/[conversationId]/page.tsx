'use client'

import { useEffect, useRef, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useBusiness } from '@/lib/queries/businesses'
import { useMessages, useSendMessage, useUpdateMessage, useDeleteMessage, useMarkMessagesAsRead, broadcastMessage } from '@/lib/queries/messages'
import { useConversation } from '@/lib/queries/conversations'
import { useRealtimeMessages } from '@/lib/hooks/use-realtime-messages'
import { uploadImage } from '@/lib/utils/image-upload'
import { format } from 'date-fns'
import { HiReply, HiPencil, HiTrash, HiPhotograph, HiCheck, HiCheckCircle, HiArrowLeft, HiDotsVertical } from 'react-icons/hi'

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

export default function BusinessChatPage() {
  const params = useParams()
  const router = useRouter()
  const conversationId = params.conversationId as string
  const supabase = createClient()
  const { data: business } = useBusiness()
  const messagesQuery = useMessages(conversationId)
  const { data: conversation } = useConversation(conversationId)
  const sendMessage = useSendMessage()
  const updateMessage = useUpdateMessage()
  const deleteMessage = useDeleteMessage()
  const markAsRead = useMarkMessagesAsRead()
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [contextMenu, setContextMenu] = useState<{
    msgId: string
    isBusiness: boolean
    position: { x: number; y: number }
  } | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Subscribe to realtime messages
  useRealtimeMessages(conversationId)

  // Mark messages as read when conversation is opened
  useEffect(() => {
    if (conversationId && business) {
      markAsRead.mutate(conversationId)
    }
  }, [conversationId, business])

  const allMessages = messagesQuery.data?.pages.flatMap((page) => page.data) || []
  const isBusinessMessage = (senderType: string) => senderType === 'business'

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current && allMessages.length > 0 && messagesContainerRef.current) {
      // Check if user is near bottom (within 200px) before auto-scrolling
      const messagesContainer = messagesContainerRef.current
      const isNearBottom = 
        messagesContainer.scrollHeight - messagesContainer.scrollTop - messagesContainer.clientHeight < 200
      if (isNearBottom) {
        // Use a small delay to ensure DOM is updated
        const timeoutId = setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
        }, 50)
        return () => clearTimeout(timeoutId)
      }
    }
  }, [allMessages.length])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim() || sending || !business) return

    setSending(true)
    try {
      await sendMessage.mutateAsync({
        conversation_id: conversationId,
        sender_type: 'business',
        sender_id: business.id,
        content: message.trim(),
        image_url: null,
        reply_to_id: replyingTo || null,
      })
      setMessage('')
      setReplyingTo(null)
    } catch (err) {
      console.error('Failed to send message:', err)
    } finally {
      setSending(false)
    }
  }

  const getReplyMessage = (replyToId: string) => {
    return allMessages.find((m) => m.id === replyToId)
  }

  // Long press handler for mobile/touch devices
  const handleLongPressStart = (e: React.TouchEvent, msgId: string, msgIsBusiness: boolean) => {
    e.preventDefault()
    const touch = e.touches[0]
    
    longPressTimerRef.current = setTimeout(() => {
      setContextMenu({
        msgId,
        isBusiness: msgIsBusiness,
        position: { x: touch.clientX, y: touch.clientY }
      })
      // Haptic feedback on mobile (if supported)
      if (navigator.vibrate) {
        navigator.vibrate(50)
      }
    }, 500) // 500ms long press
  }

  const handleLongPressEnd = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current)
      longPressTimerRef.current = null
    }
  }

  // Right-click handler for desktop
  const handleRightClick = (e: React.MouseEvent, msgId: string, msgIsBusiness: boolean) => {
    e.preventDefault()
    e.stopPropagation()
    setContextMenu({
      msgId,
      isBusiness: msgIsBusiness,
      position: { x: e.clientX, y: e.clientY }
    })
  }

  const closeContextMenu = () => {
    setContextMenu(null)
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current)
      longPressTimerRef.current = null
    }
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current)
      }
    }
  }, [])

  const handleEdit = (msgId: string, currentContent: string) => {
    setEditingId(msgId)
    setEditContent(currentContent || '')
  }

  const handleSaveEdit = async (msgId: string) => {
    if (!editContent.trim()) return

    try {
      await updateMessage.mutateAsync({
        messageId: msgId,
        updates: { content: editContent.trim() },
      })
      setEditingId(null)
      setEditContent('')
    } catch (err) {
      console.error('Failed to edit message:', err)
    }
  }

  const handleDelete = async (msgId: string) => {
    if (!confirm('Are you sure you want to delete this message?')) return

    try {
      await deleteMessage.mutateAsync(msgId)
    } catch (err) {
      console.error('Failed to delete message:', err)
    }
  }

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !business) return

    setUploadingImage(true)
    try {
      const imageUrl = await uploadImage(file, business.id, 'images')
      await sendMessage.mutateAsync({
        conversation_id: conversationId,
        sender_type: 'business',
        sender_id: business.id,
        content: null,
        image_url: imageUrl,
        reply_to_id: replyingTo || null,
      })
      setReplyingTo(null)
    } catch (err) {
      console.error('Failed to upload image:', err)
      alert('Failed to upload image')
    } finally {
      setUploadingImage(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const customerName = conversation?.customer_name || conversation?.customer_email || 'Chat'
  const customerEmail = conversation?.customer_email || ''
  const initials = getInitials(conversation?.customer_name || null, customerEmail)

  return (
    <div className="flex h-screen flex-col bg-white dark:bg-gray-900">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white px-4 py-3 dark:border-gray-700 dark:bg-gray-800">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/dashboard')}
            className="flex-shrink-0 rounded-full p-2 text-gray-600 hover:bg-gray-100 active:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 transition-colors"
          >
            <HiArrowLeft className="text-xl" />
          </button>
          {/* Avatar */}
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center text-white text-sm font-medium">
            {initials}
          </div>
          {/* Name and Email */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-base font-medium text-gray-900 dark:text-white truncate">
                {conversation?.customer_name || 'Customer'}
              </h1>
              <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
              {conversation?.customer_email}
            </p>
          </div>
          {/* Menu */}
          <button className="flex-shrink-0 rounded-full p-2 text-gray-600 hover:bg-gray-100 active:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 transition-colors">
            <HiDotsVertical className="text-xl" />
          </button>
        </div>
      </header>

      {/* Messages */}
      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto px-2 py-3 sm:px-4 bg-white dark:bg-gray-900">
        {messagesQuery.isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-gray-500 dark:text-[#8696a0] text-sm">Loading messages...</div>
          </div>
        ) : allMessages.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-center text-gray-500 dark:text-[#8696a0] text-sm">
              No messages yet. Start the conversation!
            </div>
          </div>
        ) : (
          <div className="space-y-1 relative z-[1]">
            {allMessages.map((msg) => {
              const isBusiness = isBusinessMessage(msg.sender_type)
              const isEditing = editingId === msg.id
              const replyMessage = msg.reply_to_id ? getReplyMessage(msg.reply_to_id) : null

              return (
                <div
                  key={msg.id}
                  className={`flex ${isBusiness ? 'justify-end' : 'justify-start'} px-2`}
                >
                  <div className="relative max-w-[75%] sm:max-w-[65%]">
                    {isEditing ? (
                      <div className="rounded-2xl bg-white p-3 shadow-lg dark:bg-[#202c33] border border-gray-200/50 dark:border-gray-700/50">
                        <textarea
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          className="w-full rounded-xl border border-gray-300 p-3 text-sm dark:border-gray-600 dark:bg-[#111b21] dark:text-[#e9edef] focus:outline-none focus:ring-2 focus:ring-primary-500"
                          rows={3}
                          autoFocus
                        />
                        <div className="mt-3 flex gap-2">
                          <button
                            onClick={() => handleSaveEdit(msg.id)}
                            className="flex-1 rounded-xl bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 active:bg-primary-800 transition-colors"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => {
                              setEditingId(null)
                              setEditContent('')
                            }}
                            className="flex-1 rounded-xl bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300 active:bg-gray-400 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div
                        onContextMenu={(e) => handleRightClick(e, msg.id, isBusiness)}
                        onTouchStart={(e) => handleLongPressStart(e, msg.id, isBusiness)}
                        onTouchEnd={handleLongPressEnd}
                        onTouchMove={handleLongPressEnd}
                        className={`rounded-lg px-3 py-2 select-none ${
                          isBusiness
                            ? 'bg-gray-200 text-gray-900 dark:bg-gray-700 dark:text-white'
                            : 'bg-[#dcf8c6] text-gray-900'
                        }`}
                      >
                        {replyMessage && (
                          <div className={`mb-1.5 rounded-lg border-l-2 pl-2 pr-1.5 py-1 text-xs ${
                            isBusiness 
                              ? 'bg-gray-300/50 border-gray-400' 
                              : 'bg-white/60 border-gray-600'
                          }`}>
                            <div className="font-medium opacity-90 mb-0.5 text-[10px]">
                              {replyMessage.sender_type === 'business' ? 'You' : 'Customer'}
                            </div>
                            <div className="opacity-80 truncate text-[11px]">
                              {replyMessage.content || 'Image'}
                            </div>
                          </div>
                        )}
                        {msg.image_url && (
                          <div className="mb-1.5 -mx-1">
                            <img
                              src={msg.image_url}
                              alt="Message attachment"
                              className="max-w-full rounded-lg"
                            />
                          </div>
                        )}
                        {msg.content && <p className="whitespace-pre-wrap text-sm leading-[1.4]">{msg.content}</p>}
                        <div className="mt-1 flex items-center justify-end gap-1 text-[11px] text-gray-500">
                          <span>{format(new Date(msg.created_at), 'HH:mm')}</span>
                          {isBusiness && (
                            <span className="ml-0.5">
                              {msg.status === 'read' ? (
                                <span className="text-blue-500">Seen</span>
                              ) : msg.status === 'delivered' ? (
                                <HiCheckCircle className="inline text-xs text-blue-500" />
                              ) : (
                                <HiCheck className="inline text-xs" />
                              )}
                            </span>
                          )}
                          {!isBusiness && (
                            <HiCheck className="inline text-xs" />
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
            <div ref={messagesEndRef} />
          </div>
        )}

        {/* Load more */}
        {messagesQuery.hasNextPage && (
          <div className="flex justify-center py-4">
            <button
              onClick={() => messagesQuery.fetchNextPage()}
              disabled={messagesQuery.isFetchingNextPage}
              className="rounded-md bg-gray-200 px-4 py-2 text-sm text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 disabled:opacity-50"
            >
              {messagesQuery.isFetchingNextPage ? 'Loading...' : 'Load older messages'}
            </button>
          </div>
        )}
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <div
          className="fixed inset-0 z-50"
          onClick={closeContextMenu}
          onTouchStart={(e) => {
            // Only close if touch is on the backdrop, not on the menu
            if (e.target === e.currentTarget) {
              closeContextMenu()
            }
          }}
        >
          <div
            className="absolute rounded-2xl bg-white dark:bg-[#233138] shadow-2xl border border-gray-200/50 dark:border-gray-700/50 min-w-[200px] overflow-hidden"
            style={{
              left: `${Math.min(contextMenu.position.x, typeof window !== 'undefined' ? window.innerWidth - 220 : contextMenu.position.x)}px`,
              top: `${Math.max(contextMenu.position.y - 10, 60)}px`,
              transform: 'translateY(-100%)',
            }}
            onClick={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
          >
            <div className="py-1">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setReplyingTo(contextMenu.msgId)
                  closeContextMenu()
                }}
                onTouchEnd={(e) => {
                  e.stopPropagation()
                  setReplyingTo(contextMenu.msgId)
                  closeContextMenu()
                }}
                className="w-full px-4 py-2.5 text-left text-sm text-gray-900 dark:text-[#e9edef] hover:bg-gray-100 dark:hover:bg-[#182229] transition-colors flex items-center gap-3"
              >
                <HiReply className="text-base" />
                <span>Reply</span>
              </button>
              {contextMenu.isBusiness && (
                <>
                  <div className="border-t border-gray-200 dark:border-gray-700 my-0.5"></div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      const msg = allMessages.find((m) => m.id === contextMenu.msgId)
                      if (msg) {
                        handleEdit(msg.id, msg.content || '')
                        closeContextMenu()
                      }
                    }}
                    onTouchEnd={(e) => {
                      e.stopPropagation()
                      const msg = allMessages.find((m) => m.id === contextMenu.msgId)
                      if (msg) {
                        handleEdit(msg.id, msg.content || '')
                        closeContextMenu()
                      }
                    }}
                    className="w-full px-4 py-2.5 text-left text-sm text-gray-900 dark:text-[#e9edef] hover:bg-gray-100 dark:hover:bg-[#182229] transition-colors flex items-center gap-3"
                  >
                    <HiPencil className="text-base" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDelete(contextMenu.msgId)
                      closeContextMenu()
                    }}
                    onTouchEnd={(e) => {
                      e.stopPropagation()
                      handleDelete(contextMenu.msgId)
                      closeContextMenu()
                    }}
                    className="w-full px-4 py-2.5 text-left text-sm text-red-500 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-[#182229] transition-colors flex items-center gap-3"
                  >
                    <HiTrash className="text-base" />
                    <span>Delete</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Input */}
      <form
        onSubmit={handleSend}
        className="border-t border-gray-200 bg-white px-3 py-3 dark:border-gray-700 dark:bg-gray-800 sm:px-4"
      >
        {replyingTo && (() => {
          const replyMsg = getReplyMessage(replyingTo)
          return replyMsg ? (
            <div className="mb-2 flex items-center justify-between rounded-lg bg-gray-100 p-2 dark:bg-gray-700">
              <div className="flex-1">
                <div className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                  Replying to {replyMsg.sender_type === 'business' ? 'yourself' : 'customer'}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-500 truncate">
                  {replyMsg.content || 'Image'}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setReplyingTo(null)}
                className="ml-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                ×
              </button>
            </div>
          ) : null
        })()}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageSelect}
          className="hidden"
        />
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadingImage || sending}
            className="rounded-md bg-gray-200 px-4 py-2 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 disabled:opacity-50"
          >
            {uploadingImage ? 'Uploading...' : '📷'}
          </button>
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={replyingTo ? "Type your reply..." : "Type a message..."}
            className="flex-1 rounded-md border border-gray-300 px-4 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            disabled={sending || uploadingImage}
          />
          <button
            type="submit"
            disabled={!message.trim() || sending || uploadingImage}
            className="rounded-md bg-primary-600 px-6 py-2 text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {sending ? 'Sending...' : 'Send'}
          </button>
        </div>
      </form>
    </div>
  )
}

