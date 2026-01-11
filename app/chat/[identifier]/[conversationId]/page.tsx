'use client'

import { useEffect, useRef, useState } from 'react'
import { useParams } from 'next/navigation'
import { useMessages, useSendMessage, useUpdateMessage, useDeleteMessage } from '@/lib/queries/messages'
import { useConversation } from '@/lib/queries/conversations'
import { useRealtimeMessages } from '@/lib/hooks/use-realtime-messages'
import { checkAndSendAwayMessage } from '@/lib/utils/away-message'
import { uploadImage } from '@/lib/utils/image-upload'
import { format } from 'date-fns'
import { HiReply, HiPencil, HiTrash, HiPhotograph, HiCheck, HiArrowLeft, HiDotsVertical } from 'react-icons/hi'
import { getBusinessByIdentifier } from '@/lib/queries/businesses'
import { parseLinks, extractFirstUrl } from '@/lib/utils/link-parser'
import { LinkPreview } from '@/components/link-preview'
import { useToast } from '@/lib/hooks/use-toast'
import { ImageEditor } from '@/components/image-editor'
import { ImagePreviewModal } from '@/components/image-preview-modal'

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

export default function ChatPage() {
  const params = useParams()
  const conversationId = params.conversationId as string
  const identifier = params.identifier as string
  const messagesQuery = useMessages(conversationId)
  const { data: conversation } = useConversation(conversationId)
  const sendMessage = useSendMessage()
  const updateMessage = useUpdateMessage()
  const deleteMessage = useDeleteMessage()
  const { showSuccess, showError } = useToast()
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [imageToEdit, setImageToEdit] = useState<File | null>(null)
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null)
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')
  const [business, setBusiness] = useState<any>(null)
  const [contextMenu, setContextMenu] = useState<{
    msgId: string
    isCustomer: boolean
    position: { x: number; y: number }
  } | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null)
  const welcomeMessageSentRef = useRef<string | null>(null)

  // Load business info
  useEffect(() => {
    const loadBusiness = async () => {
      if (identifier) {
        try {
          const businessData = await getBusinessByIdentifier(identifier)
          setBusiness(businessData)
        } catch (err) {
          console.error('Failed to load business:', err)
        }
      }
    }
    loadBusiness()
  }, [identifier])

  // Subscribe to realtime messages
  useRealtimeMessages(conversationId)

  // Send welcome message when customer enters the chat
  // Only runs once per conversation - send immediately when page loads, not waiting for first message
  useEffect(() => {
    const sendWelcomeMessage = async () => {
      // Ensure we have both conversation and business_id before sending
      if (conversation?.business_id && conversationId && welcomeMessageSentRef.current !== conversationId) {
        welcomeMessageSentRef.current = conversationId
        // Send immediately when customer enters the chat page
        // This runs as soon as the conversation is loaded, not waiting for any user action
        checkAndSendAwayMessage(conversation.business_id, conversationId).catch(
          (err) => console.error('Failed to send welcome message:', err)
        )
      }
    }

    // Send immediately when conversation is available - this happens when customer enters the chat
    // Don't wait for any messages or user actions
    if (conversation?.id && conversation?.business_id && conversationId) {
      sendWelcomeMessage()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversation?.id, conversation?.business_id, conversationId]) // Run immediately when conversation loads

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      const scrollHeight = textareaRef.current.scrollHeight
      const maxHeight = 120 // Max height in pixels (about 5-6 lines)
      textareaRef.current.style.height = `${Math.min(scrollHeight, maxHeight)}px`
    }
  }, [message])

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!message.trim() || sending || !conversation) return

    setSending(true)
    try {
      await sendMessage.mutateAsync({
        conversation_id: conversationId,
        sender_type: 'customer',
        sender_id: conversation.customer_email,
        content: message, // Don't trim - preserve formatting
        image_url: null,
        reply_to_id: replyingTo || null,
      })
      setMessage('')
      setReplyingTo(null)

      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'
      }
    } catch (err) {
      console.error('Failed to send message:', err)
      showError('Failed to send message. Please try again.')
    } finally {
      setSending(false)
    }
  }

  // Long press handler for mobile/touch devices
  const handleLongPressStart = (e: React.TouchEvent, msgId: string, isCustomer: boolean) => {
    e.preventDefault()
    const touch = e.touches[0]
    
    longPressTimerRef.current = setTimeout(() => {
      setContextMenu({
        msgId,
        isCustomer,
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
  const handleRightClick = (e: React.MouseEvent, msgId: string, isCustomer: boolean) => {
    e.preventDefault()
    e.stopPropagation()
    setContextMenu({
      msgId,
      isCustomer,
      position: { x: e.clientX, y: e.clientY }
    })
  }

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
      showError('Failed to edit message. Please try again.')
    }
  }

  const handleDelete = async (msgId: string) => {
    if (!confirm('Are you sure you want to delete this message?')) return

    try {
      await deleteMessage.mutateAsync(msgId)
      showSuccess('Message deleted')
    } catch (err) {
      console.error('Failed to delete message:', err)
      showError('Failed to delete message. Please try again.')
    }
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

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !conversation) {
      // Reset input value if no file selected
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      return
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      showError('Please select an image file')
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      return
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      showError('Image size must be less than 10MB')
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      return
    }

    // Show image editor instead of uploading directly
    setImageToEdit(file)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const allMessages = messagesQuery.data?.pages.flatMap((page) => page.data) || []

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

  const getReplyMessage = (replyToId: string) => {
    return allMessages.find((m) => m.id === replyToId)
  }

  const businessName = business?.business_name || 'Business'
  const businessEmail = business?.email || ''
  const initials = getInitials(business?.business_name || null, businessEmail)

  return (
    <div className="flex h-[100vh] flex-col bg-white dark:bg-gray-900">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white px-4 py-3 dark:border-gray-700 dark:bg-gray-800">
        <div className="flex items-center gap-3">
          <button
            onClick={() => window.history.back()}
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
            <div className="flex flex-col">
              <h1 className="text-base font-medium text-gray-900 dark:text-white truncate">
                {businessName}
              </h1>
              <div className="flex items-center gap-1">
                <p className="text-xs text-gray-500 dark:text-[#8696a0]">Online</p>
                <div className="w-2 h-2 rounded-full bg-green-400"></div>
              </div>
            </div>
          </div>
          {/* Menu */}
          <button className="flex-shrink-0 rounded-full p-2 text-gray-600 hover:bg-gray-100 active:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 transition-colors">
            <HiDotsVertical className="text-xl" />
          </button>
        </div>
      </header>

      {/* Messages */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto px-2 py-3 sm:px-4 bg-white dark:bg-gray-900"
      >
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
              const isCustomer = msg.sender_type === 'customer'
              const isEditing = editingId === msg.id
              const replyMessage = msg.reply_to_id ? getReplyMessage(msg.reply_to_id) : null
              return (
                <div
                  key={msg.id}
                  className={`flex ${isCustomer ? 'justify-end' : 'justify-start'} px-2`}
                >
                  <div className="relative max-w-[80%] sm:max-w-[75%] md:max-w-[65%]">
                    {isEditing ? (
                      <div className="rounded-2xl bg-white p-2 sm:p-3 shadow-lg dark:bg-[#202c33] border border-gray-200/50 dark:border-gray-700/50">
                        <textarea
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          className="w-full rounded-xl border border-gray-300 p-2 sm:p-3 text-xs sm:text-sm text-gray-600 dark:border-gray-600 dark:bg-[#111b21] dark:text-[#e9edef] focus:outline-none focus:ring-2 focus:ring-primary-500"
                          rows={3}
                          autoFocus
                        />
                        <div className="mt-2 sm:mt-3 flex gap-2">
                          <button
                            onClick={() => handleSaveEdit(msg.id)}
                            className="flex-1 rounded-xl bg-primary-600 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-white hover:bg-primary-700 active:bg-primary-800 transition-colors"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => {
                              setEditingId(null)
                              setEditContent('')
                            }}
                            className="flex-1 rounded-xl bg-gray-200 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-300 active:bg-gray-400 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div
                        onContextMenu={(e) => handleRightClick(e, msg.id, isCustomer)}
                        onTouchStart={(e) => handleLongPressStart(e, msg.id, isCustomer)}
                        onTouchEnd={handleLongPressEnd}
                        onTouchMove={handleLongPressEnd}
                        className={`rounded-lg px-2.5 sm:px-3 py-1.5 sm:py-2 select-none ${
                          isCustomer
                            ? 'bg-gray-200 text-gray-900 dark:bg-gray-700 dark:text-white'
                            : 'bg-[#dcf8c6] text-gray-900'
                        }`}
                      >
                      {replyMessage && (
                        <div className={`mb-1 sm:mb-1.5 rounded-lg border-l-2 pl-1.5 sm:pl-2 pr-1 sm:pr-1.5 py-0.5 sm:py-1 text-[10px] sm:text-xs ${
                          isCustomer 
                            ? 'bg-gray-300/50 border-gray-400' 
                            : 'bg-white/60 border-gray-600'
                        }`}>
                          <div className="font-medium opacity-90 mb-0.5 text-[9px] sm:text-[10px]">
                            {replyMessage.sender_type === 'customer' ? 'You' : 'Business'}
                          </div>
                          <div className="opacity-80 truncate text-[10px] sm:text-[11px]">
                            {replyMessage.content || 'Image'}
                          </div>
                        </div>
                      )}
                      {msg.image_url && (
                        <div className="mb-1 sm:mb-1.5 -mx-0.5 sm:-mx-1">
                          <img
                            src={msg.image_url}
                            alt="Message attachment"
                            className="max-w-full rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                            onClick={() => setPreviewImageUrl(msg.image_url!)}
                          />
                        </div>
                      )}
                      {msg.content && (
                        <>
                          <p className="whitespace-pre-wrap text-xs sm:text-sm leading-[1.4] break-words">
                            {parseLinks(msg.content)}
                          </p>
                          {extractFirstUrl(msg.content) && (
                            <LinkPreview url={extractFirstUrl(msg.content)!} />
                          )}
                        </>
                      )}
                      <div className="mt-0.5 sm:mt-1 flex items-center justify-end gap-0.5 sm:gap-1 text-[9px] sm:text-[11px] text-gray-500">
                        <span>{format(new Date(msg.created_at), 'HH:mm')}</span>
                        <HiCheck className="inline text-[9px] sm:text-xs" />
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

        {/* Load more button */}
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
              {contextMenu.isCustomer && (
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
            <div className="mb-2 flex items-center justify-between rounded-lg bg-gray-100/80 p-2 dark:bg-[#111b21] border-l-2 border-primary-500">
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium text-gray-700 dark:text-[#e9edef] mb-0.5">
                  Replying to {replyMsg.sender_type === 'customer' ? 'yourself' : 'business'}
                </div>
                <div className="text-xs text-gray-500 dark:text-[#8696a0] truncate">
                  {replyMsg.content || 'Image'}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setReplyingTo(null)}
                className="ml-2 flex-shrink-0 rounded-full p-1 text-gray-500 hover:bg-gray-200 hover:text-gray-700 dark:text-[#8696a0] dark:hover:bg-[#111b21] dark:hover:text-[#e9edef] transition-colors"
              >
                <span className="text-lg leading-none">×</span>
              </button>
            </div>
          ) : null
        })()}
        <div className="flex gap-2 items-end">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            className="hidden"
          />
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              fileInputRef.current?.click()
            }}
            disabled={uploadingImage || sending}
            className="flex-shrink-0 rounded-full p-2.5 text-gray-500 hover:bg-gray-100 active:bg-gray-200 dark:text-[#8696a0] dark:hover:bg-[#111b21] disabled:opacity-50 transition-colors mb-1"
          >
            {uploadingImage ? (
              <span className="text-xs">...</span>
            ) : (
              <HiPhotograph className="text-lg" />
            )}
          </button>
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={replyingTo ? "Type your reply..." : "Type a message..."}
            rows={1}
            className="flex-1 rounded-2xl border-0 bg-gray-100 px-4 py-2.5 text-sm text-gray-600 focus:outline-none focus:ring-0 dark:bg-[#2a3942] dark:text-[#e9edef] dark:placeholder:text-[#8696a0] disabled:opacity-50 resize-none overflow-y-auto min-h-[44px] max-h-[120px]"
            disabled={sending || uploadingImage}
            style={{ height: 'auto' }}
          />
          <button
            type="button"
            onClick={() => handleSend()}
            disabled={!message.trim() || sending || uploadingImage}
            className="flex-shrink-0 rounded-full bg-primary-600 p-2.5 text-white hover:bg-primary-700 active:bg-primary-800 focus:outline-none disabled:opacity-50 transition-colors mb-1"
          >
            {sending ? (
              <span className="text-xs">...</span>
            ) : (
              <HiCheck className="text-lg" />
            )}
          </button>
        </div>
      </form>

      {/* Image Editor Modal */}
      {imageToEdit && conversation && (
        <ImageEditor
          imageFile={imageToEdit}
          onSave={async (editedFile) => {
            setImageToEdit(null)
            setUploadingImage(true)
            try {
              const imageUrl = await uploadImage(editedFile, conversation.business_id, 'images')
              await sendMessage.mutateAsync({
                conversation_id: conversationId,
                sender_type: 'customer',
                sender_id: conversation.customer_email,
                content: null,
                image_url: imageUrl,
                reply_to_id: replyingTo || null,
              })
              setReplyingTo(null)
              showSuccess('Image sent')
            } catch (err) {
              console.error('Failed to upload image:', err)
              showError('Failed to upload image. Please try again.')
            } finally {
              setUploadingImage(false)
            }
          }}
          onCancel={() => {
            setImageToEdit(null)
            if (fileInputRef.current) {
              fileInputRef.current.value = ''
            }
          }}
        />
      )}

      {/* Image Preview Modal */}
      {previewImageUrl && (
        <ImagePreviewModal
          imageUrl={previewImageUrl}
          onClose={() => setPreviewImageUrl(null)}
        />
      )}
    </div>
  )
}

