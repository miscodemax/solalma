'use client'
import React, { useEffect, useRef, useState } from 'react'
import { X, RotateCw, ZoomIn, ZoomOut, Check } from 'lucide-react'

interface EditingImage {
  file: File
  url: string
}

interface PhotoEditorProps {
  image: EditingImage
  onClose: () => void
  onApply: (editedFile: File) => void
  // si true, le modal laisse la place pour une bottom bar (ex: 56px + safe-area)
  avoidBottomBar?: boolean
}

export default function PhotoEditor({
  image,
  onClose,
  onApply,
  avoidBottomBar = true,
}: PhotoEditorProps) {
  const overlayRef = useRef<HTMLDivElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const imgRef = useRef<HTMLImageElement | null>(null)

  // Transform state
  const [rotation, setRotation] = useState(0) // degrees
  const [zoom, setZoom] = useState(1) // scale
  const [offset, setOffset] = useState({ x: 0, y: 0 }) // pan in canvas space
  const [isDragging, setIsDragging] = useState(false)
  const dragStart = useRef<{ x: number; y: number } | null>(null)
  const offsetStart = useRef({ x: 0, y: 0 })
  const lastTouchDistance = useRef<number | null>(null)

  // Keep a loaded Image object for drawing/export
  const [loadedImage, setLoadedImage] = useState<HTMLImageElement | null>(null)

  // Draw preview on canvas whenever transform or image changes
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx || !loadedImage) return

    // Clear
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Save and apply transforms: center, pan, rotate, scale, draw
    ctx.save()
    // center
    const cx = canvas.width / 2
    const cy = canvas.height / 2
    ctx.translate(cx + offset.x, cy + offset.y)
    ctx.rotate((rotation * Math.PI) / 180)
    ctx.scale(zoom, zoom)

    // Draw image centered
    ctx.drawImage(loadedImage, -loadedImage.width / 2, -loadedImage.height / 2)
    ctx.restore()
  }, [loadedImage, rotation, zoom, offset])

  // Load image into an Image element and size canvas to fit container with max constraints
  useEffect(() => {
    if (!image) return
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      imgRef.current = img
      setLoadedImage(img)

      const canvas = canvasRef.current
      if (!canvas) return

      // Determine canvas size: fit into max width/height while preserving aspect ratio
      // We allow the canvas to be reasonably big on desktop and constrained on mobile
      const maxWidth = Math.min(window.innerWidth - 48, 1000) // leave some margin
      const maxHeight = Math.min(window.innerHeight - (avoidBottomBar ? 120 : 80), 900)

      let width = img.width
      let height = img.height

      // scale down if needed
      const ratio = Math.min(maxWidth / width, maxHeight / height, 1)
      width = Math.round(width * ratio)
      height = Math.round(height * ratio)

      canvas.width = width
      canvas.height = height

      // reset transforms
      setRotation(0)
      setZoom(1)
      setOffset({ x: 0, y: 0 })
    }
    img.src = image.url

    return () => {
      // do not revoke here: parent handles objectURL revocation when it closes
    }
  }, [image, avoidBottomBar])

  // Helper: apply edits to an output blob/file
  const exportEditedFile = async () => {
    if (!loadedImage) return
    // Create final canvas sized to original image multiplied by zoom and rotated extents
    const rad = (rotation * Math.PI) / 180
    const sin = Math.abs(Math.sin(rad))
    const cos = Math.abs(Math.cos(rad))

    const sourceW = loadedImage.width
    const sourceH = loadedImage.height

    // Determine new bounding box after rotation
    const newWidth = Math.ceil(sourceW * cos + sourceH * sin)
    const newHeight = Math.ceil(sourceW * sin + sourceH * cos)

    // Create final canvas at source resolution to keep quality, then scale by zoom
    const finalCanvas = document.createElement('canvas')
    finalCanvas.width = Math.max(1, Math.round(newWidth * zoom))
    finalCanvas.height = Math.max(1, Math.round(newHeight * zoom))

    const ctx = finalCanvas.getContext('2d')
    if (!ctx) return

    // Center, apply rotation and scale, then draw
    ctx.save()
    ctx.translate(finalCanvas.width / 2 + offset.x * (finalCanvas.width / (canvasRef.current?.width || finalCanvas.width)), finalCanvas.height / 2 + offset.y * (finalCanvas.height / (canvasRef.current?.height || finalCanvas.height)))
    ctx.rotate(rad)
    ctx.scale(zoom, zoom)
    ctx.drawImage(loadedImage, -sourceW / 2, -sourceH / 2)
    ctx.restore()

    // Convert to blob (webp)
    return new Promise<File | null>((resolve) => {
      finalCanvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve(null)
            return
          }
          const name = image.file.name.replace(/\.[^/.]+$/, '.webp')
          const editedFile = new File([blob], name, { type: 'image/webp' })
          resolve(editedFile)
        },
        'image/webp',
        0.9,
      )
    })
  }

  // Close when clicking overlay outside modal
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  // Pointer / drag handlers for pan
  const onPointerDown = (e: React.PointerEvent) => {
    // ignore if multi-touch (handled in touch handlers)
    if (e.pointerType === 'touch' && (e as any).isPrimary === false) return
    (e.target as Element).setPointerCapture(e.pointerId)
    setIsDragging(true)
    dragStart.current = { x: e.clientX, y: e.clientY }
    offsetStart.current = { ...offset }
  }

  const onPointerMove = (e: React.PointerEvent) => {
    if (!isDragging || !dragStart.current) return
    const dx = e.clientX - dragStart.current.x
    const dy = e.clientY - dragStart.current.y
    setOffset({ x: offsetStart.current.x + dx, y: offsetStart.current.y + dy })
  }

  const onPointerUp = (e: React.PointerEvent) => {
    try {
      (e.target as Element).releasePointerCapture(e.pointerId)
    } catch {}
    setIsDragging(false)
    dragStart.current = null
  }

  // Touch handlers for pinch to zoom
  const onTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const d = distanceBetweenTouches(e.touches[0], e.touches[1])
      lastTouchDistance.current = d
    } else if (e.touches.length === 1) {
      // start drag
      dragStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
      offsetStart.current = { ...offset }
      setIsDragging(true)
    }
  }

  const onTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const d = distanceBetweenTouches(e.touches[0], e.touches[1])
      if (lastTouchDistance.current) {
        const diff = d - lastTouchDistance.current
        const factor = diff / 200 // sensitivity
        setZoom((z) => Math.min(3, Math.max(0.5, z + factor)))
      }
      lastTouchDistance.current = d
    } else if (e.touches.length === 1 && isDragging && dragStart.current) {
      const dx = e.touches[0].clientX - dragStart.current.x
      const dy = e.touches[0].clientY - dragStart.current.y
      setOffset({ x: offsetStart.current.x + dx, y: offsetStart.current.y + dy })
    }
  }

  const onTouchEnd = (e: React.TouchEvent) => {
    if (e.touches.length < 2) lastTouchDistance.current = null
    if (e.touches.length === 0) {
      setIsDragging(false)
      dragStart.current = null
    }
  }

  function distanceBetweenTouches(a: Touch, b: Touch) {
    const dx = a.clientX - b.clientX
    const dy = a.clientY - b.clientY
    return Math.hypot(dx, dy)
  }

  const handleApply = async () => {
    const edited = await exportEditedFile()
    if (edited) {
      onApply(edited)
    }
  }

  // Prevent background scroll while editor open
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [])

  // Layout classes responsive: mobile bottom-sheet vs centered modal
  const bottomOffset = avoidBottomBar ? 'calc(env(safe-area-inset-bottom, 0px) + 56px)' : '16px'

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-4 sm:p-6"
      style={{ pointerEvents: 'auto' }}
      aria-modal="true"
      role="dialog"
    >
      {/* backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        aria-hidden
      />

      {/* Modal / bottom-sheet */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full sm:max-w-3xl max-h-[90vh] bg-white dark:bg-gray-800 rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden transform transition-all"
        style={{
          // On small screens, appear as bottom sheet
          marginBottom: window.innerWidth < 640 ? bottomOffset : undefined,
          maxHeight: 'calc(90vh - 32px)',
        }}
      >
        {/* header */}
        <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setRotation((r) => (r - 90) % 360)}
              title="Rotation -90°"
              className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition"
            >
              <RotateCw className="w-5 h-5 text-gray-700 dark:text-gray-200" />
            </button>
            <div className="text-sm font-semibold text-gray-800 dark:text-gray-200">
              Édition
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-center transition"
            >
              <X className="w-5 h-5 text-gray-700 dark:text-gray-200" />
            </button>
          </div>
        </div>

        {/* canvas area */}
        <div
          className="p-3 sm:p-6 bg-gray-50 dark:bg-gray-900/50 flex items-center justify-center"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <canvas
            ref={canvasRef}
            className="rounded-md shadow-md max-w-full max-h-[60vh]"
            style={{
              touchAction: 'none',
              userSelect: 'none',
            }}
          />
        </div>

        {/* controls */}
        <div className="p-3 sm:p-4 border-t border-gray-200 dark:border-gray-700 space-y-3">
          <div className="flex items-center gap-3">
            <ZoomOut className="w-4 h-4 text-gray-600 dark:text-gray-300" />
            <input
              aria-label="Zoom"
              type="range"
              min={0.5}
              max={3}
              step={0.01}
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="flex-1 h-2 rounded-lg appearance-none cursor-pointer bg-gray-200 dark:bg-gray-700"
            />
            <ZoomIn className="w-4 h-4 text-gray-600 dark:text-gray-300" />
            <div className="text-xs w-12 text-right text-gray-600 dark:text-gray-300 font-mono">
              {Math.round(zoom * 100)}%
            </div>
          </div>

          <div className="flex items-center justify-end gap-3">
            <button
              onClick={() => {
                setRotation(0)
                setZoom(1)
                setOffset({ x: 0, y: 0 })
              }}
              className="px-4 py-2 rounded-md border border-gray-200 dark:border-gray-700 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
            >
              Réinitialiser
            </button>

            <button
              onClick={async () => {
                // rotate +90
                setRotation((r) => (r + 90) % 360)
              }}
              className="px-4 py-2 rounded-md border border-gray-200 dark:border-gray-700 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
            >
              Tourner +90°
            </button>

            <button
              onClick={async () => {
                // apply and send file to parent
                const f = await exportEditedFile()
                if (f) {
                  // close modal then apply
                  onApply(f)
                }
              }}
              className="px-4 py-2 rounded-md bg-gradient-to-r from-yellow-400 to-yellow-500 text-white font-medium hover:from-yellow-500 hover:to-yellow-600 shadow-md transition"
            >
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4" />
                Appliquer
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}