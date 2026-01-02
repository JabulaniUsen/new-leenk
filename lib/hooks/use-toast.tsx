'use client'

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { HiCheckCircle, HiXCircle, HiX } from 'react-icons/hi'

export type ToastType = 'success' | 'error' | 'info'

export interface Toast {
  id: string
  message: string
  type: ToastType
  duration?: number
}

interface ToastContextType {
  toasts: Toast[]
  showToast: (message: string, type?: ToastType, duration?: number) => void
  showSuccess: (message: string, duration?: number) => void
  showError: (message: string, duration?: number) => void
  removeToast: (id: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within ToastProvider')
  }
  return context
}

export function ToastProvider({ children }: { children: ReactNode }): React.ReactElement {
  const [toasts, setToasts] = useState<Toast[]>([])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  const showToast = useCallback(
    (message: string, type: ToastType = 'info', duration: number = 5000) => {
      const id = Math.random().toString(36).substring(2, 9)
      const newToast: Toast = { id, message, type, duration }

      setToasts((prev) => [...prev, newToast])

      // Auto remove after duration
      if (duration > 0) {
        setTimeout(() => {
          removeToast(id)
        }, duration)
      }
    },
    [removeToast]
  )

  const showSuccess = useCallback(
    (message: string, duration?: number) => {
      showToast(message, 'success', duration)
    },
    [showToast]
  )

  const showError = useCallback(
    (message: string, duration?: number) => {
      showToast(message, 'error', duration || 6000) // Errors stay longer
    },
    [showToast]
  )

  return (
    <React.Fragment>
      <ToastContext.Provider value={{ toasts, showToast, showSuccess, showError, removeToast }}>
        {children}
      </ToastContext.Provider>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </React.Fragment>
  )
}

function ToastContainer({
  toasts,
  removeToast,
}: {
  toasts: Toast[]
  removeToast: (id: string) => void
}) {
  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none max-w-sm w-full sm:max-w-md">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
      ))}
    </div>
  )
}

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) {
  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <HiCheckCircle className="text-xl text-green-500" />
      case 'error':
        return <HiXCircle className="text-xl text-red-500" />
      default:
        return null
    }
  }

  const getStyles = () => {
    switch (toast.type) {
      case 'success':
        return 'bg-green-50 dark:bg-green-900 border-green-200 dark:border-green-700 text-green-800 dark:text-green-100'
      case 'error':
        return 'bg-red-50 dark:bg-red-900 border-red-200 dark:border-red-700 text-red-800 dark:text-red-100'
      default:
        return 'bg-blue-50 dark:bg-blue-900 border-blue-200 dark:border-blue-700 text-blue-800 dark:text-blue-100'
    }
  }

  return (
    <div
      className={`rounded-xl border-2 shadow-lg dark:shadow-2xl p-4 flex items-start gap-3 animate-slide-in pointer-events-auto ${getStyles()}`}
    >
      <div className="flex-shrink-0 mt-0.5">{getIcon()}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium break-words">{toast.message}</p>
      </div>
      <button
        onClick={() => onRemove(toast.id)}
        className="flex-shrink-0 rounded-full p-1 hover:bg-black/10 dark:hover:bg-white/20 transition-colors"
        aria-label="Close notification"
      >
        <HiX className="text-lg" />
      </button>
    </div>
  )
}

