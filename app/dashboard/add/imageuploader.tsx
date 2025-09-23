'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase'
import { ImagePlus, Loader2, X, Star } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface ImageUploaderProps {
    onUpload: (urls: string[]) => void
    maxImages?: number
    currentImageCount?: number
}

interface ImageItem {
    id: string
    url: string
    name: string
    uploading?: boolean
}

export default function ImageUploader({
    onUpload,
    maxImages = 5,
    currentImageCount = 0,
}: ImageUploaderProps) {
    const [images, setImages] = useState<ImageItem[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const fileInputRef = useRef<HTMLInputElement>(null)
    const supabase = createClient()

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return
        const files = Array.from(e.target.files)
        const remaining = maxImages - (currentImageCount + images.length)

        if (files.length > remaining) {
            setError(`Vous pouvez encore ajouter ${remaining} image${remaining > 1 ? 's' : ''}`)
            setTimeout(() => setError(''), 3000)
            return
        }

        setLoading(true)
        const uploaded: string[] = []

        for (const file of files) {
            if (!file.type.startsWith('image/')) continue

            const id = `${Date.now()}-${file.name}`
            const { error: uploadError } = await supabase.storage.from('product').upload(id, file)

            if (!uploadError) {
                const { data } = supabase.storage.from('product').getPublicUrl(id)
                uploaded.push(data.publicUrl)
                setImages(prev => [...prev, { id, url: data.publicUrl, name: file.name }])
            }
        }

        if (uploaded.length > 0) onUpload([...images.map(i => i.url), ...uploaded])
        setLoading(false)
        e.target.value = '' // reset input
    }

    const handleRemove = (id: string) => {
        const updated = images.filter(img => img.id !== id)
        setImages(updated)
        onUpload(updated.map(i => i.url))
    }

    return (
        <div className="space-y-4">
            {/* Bouton principal */}
            <button
                onClick={() => fileInputRef.current?.click()}
                disabled={loading || images.length >= maxImages}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-gray-300 bg-gray-50 hover:bg-gray-100 text-gray-700 font-medium transition disabled:opacity-50"
            >
                {loading ? (
                    <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Téléversement...
                    </>
                ) : (
                    <>
                        <ImagePlus className="w-5 h-5" />
                        Ajouter une image ({images.length}/{maxImages})
                    </>
                )}
            </button>

            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileSelect}
                className="hidden"
            />

            {/* Galerie */}
            <div className="flex gap-4 flex-wrap">
                {images.map((img, i) => (
                    <motion.div
                        key={img.id}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="relative w-28 h-28 rounded-lg overflow-hidden shadow-md"
                    >
                        <img src={img.url} alt={img.name} className="w-full h-full object-cover" />

                        {i === 0 && (
                            <span className="absolute top-2 left-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded-md flex items-center gap-1 shadow">
                                <Star className="w-3 h-3" />
                                Principal
                            </span>
                        )}

                        <button
                            onClick={() => handleRemove(img.id)}
                            className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1 hover:bg-black/80"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </motion.div>
                ))}
            </div>

            {/* Message d’erreur */}
            <AnimatePresence>
                {error && (
                    <motion.p
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="text-sm text-red-600"
                    >
                        {error}
                    </motion.p>
                )}
            </AnimatePresence>
        </div>
    )
}
