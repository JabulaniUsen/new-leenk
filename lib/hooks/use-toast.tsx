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
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-3 pointer-events-none max-w-sm w-full sm:max-w-md">
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
        return <HiCheckCircle className="text-2xl text-white" />
      case 'error':
        return <HiXCircle className="text-2xl text-white" />
      default:
        return null
    }
  }

  const getStyles = () => {
    switch (toast.type) {
      case 'success':
        return {
          container: 'bg-gradient-to-r from-green-500 to-green-600 dark:from-green-600 dark:to-green-700 shadow-lg shadow-green-500/30 dark:shadow-green-600/30',
          iconBg: 'bg-white/20',
          text: 'text-white',
          close: 'hover:bg-white/20 text-white'
        }
      case 'error':
        return {
          container: 'bg-gradient-to-r from-red-500 to-red-600 dark:from-red-600 dark:to-red-700 shadow-lg shadow-red-500/30 dark:shadow-red-600/30',
          iconBg: 'bg-white/20',
          text: 'text-white',
          close: 'hover:bg-white/20 text-white'
        }
      default:
        return {
          container: 'bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 shadow-lg shadow-blue-500/30 dark:shadow-blue-600/30',
          iconBg: 'bg-white/20',
          text: 'text-white',
          close: 'hover:bg-white/20 text-white'
        }
    }
  }

  const styles = getStyles()

  return (
    <div
      className={`rounded-2xl ${styles.container} p-4 flex items-start gap-3 animate-slide-in pointer-events-auto backdrop-blur-sm border border-white/20`}
    >
      <div className={`flex-shrink-0 rounded-full p-2 ${styles.iconBg}`}>
        {getIcon()}
      </div>
      <div className="flex-1 min-w-0 pt-0.5">
        <p className={`text-sm font-semibold break-words ${styles.text}`}>{toast.message}</p>
      </div>
      <button
        onClick={() => onRemove(toast.id)}
        className={`flex-shrink-0 rounded-full p-1.5 transition-colors ${styles.close}`}
        aria-label="Close notification"
      >
        <HiX className="text-lg" />
      </button>
    </div>
  )
}

