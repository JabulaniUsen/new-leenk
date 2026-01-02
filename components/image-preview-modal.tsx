'use client'

import { useEffect } from 'react'
import { HiX, HiZoomIn, HiZoomOut } from 'react-icons/hi'

interface ImagePreviewModalProps {
  imageUrl: string
  onClose: () => void
}

export function ImagePreviewModal({ imageUrl, onClose }: ImagePreviewModalProps) {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose()
    }
  }

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden'
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'unset'
    }
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4"
      onClick={onClose}
    >
      <div className="relative max-w-full max-h-full">
        <img
          src={imageUrl}
          alt="Preview"
          className="max-w-full max-h-[90vh] object-contain rounded-lg"
          onClick={(e) => e.stopPropagation()}
        />
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors"
          aria-label="Close preview"
        >
          <HiX className="text-2xl" />
        </button>
      </div>
    </div>
  )
}

