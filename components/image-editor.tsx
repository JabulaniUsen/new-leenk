'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { HiX, HiCheck, HiPencil, HiScissors, HiArrowLeft, HiTrash } from 'react-icons/hi'

type Mode = 'preview' | 'crop' | 'draw'

interface ImageEditorProps {
  imageFile: File
  onSave: (file: File) => void
  onCancel: () => void
}

export function ImageEditor({ imageFile, onSave, onCancel }: ImageEditorProps) {
  const [mode, setMode] = useState<Mode>('preview')
  const [imageUrl, setImageUrl] = useState<string>('')
  const [croppedImageUrl, setCroppedImageUrl] = useState<string>('')
  const [drawingImageUrl, setDrawingImageUrl] = useState<string>('')
  
  // Crop state
  const [cropStart, setCropStart] = useState<{ x: number; y: number } | null>(null)
  const [cropEnd, setCropEnd] = useState<{ x: number; y: number } | null>(null)
  const [isCropping, setIsCropping] = useState(false)
  
  // Draw state
  const [isDrawing, setIsDrawing] = useState(false)
  const [brushSize, setBrushSize] = useState(5)
  const [brushColor, setBrushColor] = useState('#000000')
  const [drawHistory, setDrawHistory] = useState<ImageData[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Load image
  useEffect(() => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const url = e.target?.result as string
      setImageUrl(url)
      setCroppedImageUrl(url)
      setDrawingImageUrl(url)
    }
    reader.readAsDataURL(imageFile)
  }, [imageFile])

  // Crop functions
  const handleCropStart = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const rect = canvas.getBoundingClientRect()
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top
    
    setCropStart({ x, y })
    setCropEnd({ x, y })
    setIsCropping(true)
  }

  const handleCropMove = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isCropping || !cropStart) return
    
    const canvas = canvasRef.current
    if (!canvas) return
    
    const rect = canvas.getBoundingClientRect()
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top
    
    setCropEnd({ x, y })
  }

  const handleCropEnd = () => {
    setIsCropping(false)
  }

  const applyCrop = () => {
    if (!cropStart || !cropEnd || !imageRef.current || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const img = imageRef.current
    const imgNaturalWidth = img.naturalWidth || img.width
    const imgNaturalHeight = img.naturalHeight || img.height
    const scaleX = imgNaturalWidth / canvas.width
    const scaleY = imgNaturalHeight / canvas.height

    const x = Math.min(cropStart.x, cropEnd.x) * scaleX
    const y = Math.min(cropStart.y, cropEnd.y) * scaleY
    const width = Math.abs(cropEnd.x - cropStart.x) * scaleX
    const height = Math.abs(cropEnd.y - cropStart.y) * scaleY

    if (width < 10 || height < 10) return

    const croppedCanvas = document.createElement('canvas')
    croppedCanvas.width = width
    croppedCanvas.height = height
    const croppedCtx = croppedCanvas.getContext('2d')
    if (!croppedCtx) return

    croppedCtx.drawImage(img, x, y, width, height, 0, 0, width, height)

    croppedCanvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob)
        setCroppedImageUrl(url)
        setDrawingImageUrl(url)
        setImageUrl(url)
        setCropStart(null)
        setCropEnd(null)
      }
    }, 'image/webp', 0.9)
  }

  // Draw functions
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true)
    draw(e)
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing && !('touches' in e)) return
    
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top

    ctx.lineWidth = brushSize
    ctx.lineCap = 'round'
    ctx.strokeStyle = brushColor

    if (isDrawing) {
      ctx.lineTo(x, y)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(x, y)
    } else {
      ctx.beginPath()
      ctx.moveTo(x, y)
    }
  }

  const stopDrawing = () => {
    if (!isDrawing) return
    
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.beginPath()
    setIsDrawing(false)
    
    // Save state for undo
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    setDrawHistory((prev) => [...prev.slice(0, historyIndex + 1), imageData])
    setHistoryIndex((prev) => prev + 1)
  }

  const undoDraw = () => {
    if (historyIndex < 0) return
    
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const img = imageRef.current
    if (!img) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

    if (historyIndex > 0) {
      ctx.putImageData(drawHistory[historyIndex - 1], 0, 0)
      setHistoryIndex((prev) => prev - 1)
    } else {
      setHistoryIndex(-1)
    }
  }

  const clearDraw = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const img = imageRef.current
    if (!img) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
    setDrawHistory([])
    setHistoryIndex(-1)
  }

  // Initialize canvas when mode or image changes
  useEffect(() => {
    const canvas = canvasRef.current
    const img = imageRef.current
    if (!canvas || !img) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const loadImage = () => {
      // Set canvas size to match image display size
      const maxWidth = Math.min(800, window.innerWidth - 80)
      const maxHeight = Math.min(600, window.innerHeight - 200)
      
      let width = img.naturalWidth || img.width
      let height = img.naturalHeight || img.height
      
      let displayWidth = width
      let displayHeight = height
      
      if (width > maxWidth) {
        displayHeight = (height * maxWidth) / width
        displayWidth = maxWidth
      }
      if (displayHeight > maxHeight) {
        displayWidth = (displayWidth * maxHeight) / displayHeight
        displayHeight = maxHeight
      }

      canvas.width = displayWidth
      canvas.height = displayHeight
      
      ctx.drawImage(img, 0, 0, width, height, 0, 0, displayWidth, displayHeight)
      
      if (mode === 'draw') {
        setDrawHistory([ctx.getImageData(0, 0, displayWidth, displayHeight)])
        setHistoryIndex(0)
      }
    }

    if (img.complete) {
      loadImage()
    } else {
      img.onload = loadImage
    }
  }, [mode, imageUrl, croppedImageUrl, drawingImageUrl])

  // Handle save
  const handleSave = async () => {
    const canvas = canvasRef.current
    if (!canvas) return

    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], imageFile.name, { type: 'image/webp' })
        onSave(file)
      }
    }, 'image/webp', 0.9)
  }

  const currentImageUrl = mode === 'draw' ? drawingImageUrl : croppedImageUrl

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="relative w-full max-w-4xl bg-white dark:bg-gray-800 rounded-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            {mode !== 'preview' && (
              <button
                onClick={() => setMode('preview')}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <HiArrowLeft className="text-xl" />
              </button>
            )}
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {mode === 'preview' && 'Preview Image'}
              {mode === 'crop' && 'Crop Image'}
              {mode === 'draw' && 'Draw on Image'}
            </h2>
          </div>
          <button
            onClick={onCancel}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <HiX className="text-xl" />
          </button>
        </div>

        {/* Canvas Container */}
        <div ref={containerRef} className="relative bg-gray-100 dark:bg-gray-900 p-4 flex items-center justify-center min-h-[400px] max-h-[70vh] overflow-auto">
          <div className="relative inline-block">
            <img
              ref={imageRef}
              src={currentImageUrl}
              alt="Preview"
              className="max-w-full max-h-[60vh] object-contain"
              style={{ display: mode === 'preview' ? 'block' : 'none' }}
            />
            <canvas
              ref={canvasRef}
              className={`border border-gray-300 dark:border-gray-600 rounded-lg cursor-${mode === 'crop' ? 'crosshair' : mode === 'draw' ? 'crosshair' : 'default'} max-w-full`}
              onMouseDown={mode === 'crop' ? handleCropStart : mode === 'draw' ? startDrawing : undefined}
              onMouseMove={mode === 'crop' ? handleCropMove : mode === 'draw' ? draw : undefined}
              onMouseUp={mode === 'crop' ? handleCropEnd : mode === 'draw' ? stopDrawing : undefined}
              onMouseLeave={mode === 'draw' ? stopDrawing : undefined}
              onTouchStart={mode === 'crop' ? handleCropStart : mode === 'draw' ? startDrawing : undefined}
              onTouchMove={mode === 'crop' ? handleCropMove : mode === 'draw' ? draw : undefined}
              onTouchEnd={mode === 'crop' ? handleCropEnd : mode === 'draw' ? stopDrawing : undefined}
              style={{ display: mode === 'preview' ? 'none' : 'block' }}
            />
            
            {/* Crop overlay */}
            {mode === 'crop' && cropStart && cropEnd && (
              <div
                className="absolute border-2 border-primary-500 bg-primary-500/20 pointer-events-none"
                style={{
                  left: `${Math.min(cropStart.x, cropEnd.x)}px`,
                  top: `${Math.min(cropStart.y, cropEnd.y)}px`,
                  width: `${Math.abs(cropEnd.x - cropStart.x)}px`,
                  height: `${Math.abs(cropEnd.y - cropStart.y)}px`,
                }}
              />
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          {mode === 'preview' && (
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => setMode('crop')}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                <HiScissors className="text-lg" />
                <span>Crop</span>
              </button>
              <button
                onClick={() => setMode('draw')}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                <HiPencil className="text-lg" />
                <span>Draw</span>
              </button>
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-6 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition-colors"
              >
                <HiCheck className="text-lg" />
                <span>Send</span>
              </button>
            </div>
          )}

          {mode === 'crop' && (
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => {
                  setCropStart(null)
                  setCropEnd(null)
                }}
                className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Reset
              </button>
              <button
                onClick={applyCrop}
                className="px-4 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition-colors"
              >
                Apply Crop
              </button>
            </div>
          )}

          {mode === 'draw' && (
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-4">
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-700 dark:text-gray-300">Size:</label>
                  <input
                    type="range"
                    min="1"
                    max="20"
                    value={brushSize}
                    onChange={(e) => setBrushSize(Number(e.target.value))}
                    className="w-24"
                  />
                  <span className="text-sm text-gray-600 dark:text-gray-400 w-8">{brushSize}px</span>
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-700 dark:text-gray-300">Color:</label>
                  <input
                    type="color"
                    value={brushColor}
                    onChange={(e) => setBrushColor(e.target.value)}
                    className="w-10 h-10 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
                  />
                </div>
              </div>
              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={undoDraw}
                  disabled={historyIndex < 0}
                  className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Undo
                </button>
                <button
                  onClick={clearDraw}
                  className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center gap-2"
                >
                  <HiTrash className="text-lg" />
                  <span>Clear</span>
                </button>
                <button
                  onClick={handleSave}
                  className="px-6 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition-colors flex items-center gap-2"
                >
                  <HiCheck className="text-lg" />
                  <span>Send</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

