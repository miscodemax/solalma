'use client'

import React, { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase'
import { ImagePlus, Loader2, X, Star } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'

interface ImageUploaderProps {
    onUpload: (urls: string[]) => void
    maxImages?: number
    currentImageCount?: number
}

interface ImageItem {
    id: string
    previewUrl: string
    url?: string
    name: string
    size: number
    uploading?: boolean
}

export default function ImageUploader({
    onUpload,
    maxImages = 5,
    currentImageCount = 0,
}: ImageUploaderProps) {
    const [images, setImages] = useState<ImageItem[]>([])
    const [error, setError] = useState('')
    const fileInputRef = useRef<HTMLInputElement | null>(null)
    const supabase = createClient()

    const formatSize = (bytes: number) => {
        if (bytes === 0) return '0 B'
        const k = 1024
        const sizes = ['B', 'KB', 'MB']
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
    }

    const handleFiles = async (files: FileList | null) => {
        if (!files || files.length === 0) return
        const remaining = maxImages - (currentImageCount + images.length)
        const toUpload = Array.from(files).slice(0, remaining)

        if (toUpload.length === 0) {
            setError(`Limite atteinte (${maxImages} images max)`)
            setTimeout(() => setError(''), 3000)
            return
        }

        const newItems: ImageItem[] = toUpload.map((file) => ({
            id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
            previewUrl: URL.createObjectURL(file),
            name: file.name,
            size: file.size,
            uploading: true,
        }))

        setImages((prev) => [...prev, ...newItems])

        const uploadedUrls: string[] = []

        for (let i = 0; i < toUpload.length; i++) {
            const file = toUpload[i]
            const itemId = newItems[i].id

            if (!file.type.startsWith('image/')) {
                setError(`${file.name} n'est pas une image`)
                setTimeout(() => setError(''), 2500)
                setImages((prev) =>
                    prev.map((it) =>
                        it.id === itemId ? { ...it, uploading: false } : it
                    )
                )
                continue
            }
            if (file.size > 10 * 1024 * 1024) {
                setError(`${file.name} dépasse 10MB`)
                setTimeout(() => setError(''), 2500)
                setImages((prev) =>
                    prev.map((it) =>
                        it.id === itemId ? { ...it, uploading: false } : it
                    )
                )
                continue
            }

            try {
                const ext = file.name.split('.').pop() || 'jpg'
                const filename = `${itemId}.${ext}`

                const { error: uploadError } = await supabase.storage
                    .from('product')
                    .upload(filename, file, { cacheControl: '3600', upsert: false })

                if (uploadError) throw uploadError

                const { data } = supabase.storage.from('product').getPublicUrl(filename)
                const publicUrl = data.publicUrl

                setImages((prev) =>
                    prev.map((it) =>
                        it.id === itemId ? { ...it, url: publicUrl, uploading: false } : it
                    )
                )
                uploadedUrls.push(publicUrl)
            } catch (err) {
                console.error('upload error', err)
                setError(`Échec upload: ${file.name}`)
                setTimeout(() => setError(''), 3000)
                setImages((prev) => prev.filter((it) => it.id !== itemId))
            }
        }

        const existingUploaded = images.filter((i) => i.url).map((i) => i.url!)
        const allUrls = [...existingUploaded, ...uploadedUrls]
        if (allUrls.length > 0) onUpload(allUrls)

        setTimeout(() => {
            newItems.forEach((it) => {
                try {
                    URL.revokeObjectURL(it.previewUrl)
                } catch { }
            })
        }, 1000)

        if (fileInputRef.current) fileInputRef.current.value = ''
    }

    const handleRemove = (id: string) => {
        const removed = images.find((i) => i.id === id)
        if (removed?.previewUrl) try { URL.revokeObjectURL(removed.previewUrl) } catch { }
        const updated = images.filter((i) => i.id !== id)
        setImages(updated)
        const urls = updated.filter((i) => i.url).map((i) => i.url!)
        onUpload(urls)
    }

    return (
        <div className="space-y-4">
            {/* bouton stylé */}
            <label htmlFor="file-upload">
                <input
                    id="file-upload"
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => handleFiles(e.target.files)}
                    className="hidden"
                />
                <Button
                    type="button"
                    className="w-full px-6 py-3 bg-gradient-to-r from-[#F4C430] to-[#E9961A] text-white font-semibold rounded-xl shadow-lg hover:scale-105 transition-all duration-300 disabled:opacity-50"
                    disabled={images.length + currentImageCount >= maxImages}
                >
                    <ImagePlus className="w-5 h-5 mr-2" />
                    {images.length + currentImageCount >= maxImages
                        ? 'Limite atteinte'
                        : '📸 Ajouter des photos'}
                </Button>
            </label>

            {/* compteur */}
            <p className="text-sm text-gray-500">
                {images.length + currentImageCount}/{maxImages} photos sélectionnées
            </p>

            {/* galerie */}
            <div className="flex gap-3 flex-wrap">
                {images.map((img, idx) => (
                    <motion.div
                        key={img.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="relative w-28 h-28 rounded-lg overflow-hidden shadow-md bg-gray-50"
                    >
                        <img
                            src={img.url || img.previewUrl}
                            alt={img.name}
                            className="w-full h-full object-cover"
                        />

                        {idx === 0 && !img.uploading && (
                            <span className="absolute top-2 left-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded-md flex items-center gap-1 shadow">
                                <Star className="w-3 h-3" />
                                Principal
                            </span>
                        )}

                        {img.uploading && (
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                <Loader2 className="w-5 h-5 text-white animate-spin" />
                            </div>
                        )}

                        <button
                            onClick={() => handleRemove(img.id)}
                            className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1 hover:bg-black/80"
                            aria-label="Supprimer l'image"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </motion.div>
                ))}
            </div>

            {/* erreurs */}
            <AnimatePresence>
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        className="text-sm text-red-600"
                    >
                        {error}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
