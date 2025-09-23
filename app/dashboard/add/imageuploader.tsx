'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { ImagePlus, Loader2, CheckCircle, AlertCircle, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface ImageUploaderProps {
    onUpload: (urls: string[]) => void
    maxImages?: number
    currentImageCount?: number
}

export default function ImageUploader({
    onUpload,
    maxImages = 5,
    currentImageCount = 0,
}: ImageUploaderProps) {
    const [uploading, setUploading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [images, setImages] = useState<string[]>([])
    const supabase = createClient()

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (!files || files.length === 0) return

        const remainingSlots = maxImages - (currentImageCount + images.length)
        if (remainingSlots <= 0) {
            setError(`Vous avez déjà atteint la limite de ${maxImages} images`)
            return
        }

        const filesToUpload = Array.from(files).slice(0, remainingSlots)
        if (filesToUpload.length < files.length) {
            setError(
                `Seules ${filesToUpload.length} images ont été sélectionnées (limite: ${maxImages} images au total)`
            )
        }

        setUploading(true)
        setError('')
        setSuccess('')

        const uploadedUrls: string[] = []
        let uploadCount = 0

        for (const file of filesToUpload) {
            if (file.size > 5 * 1024 * 1024) {
                setError(`${file.name} est trop volumineux. Taille maximum: 5MB`)
                continue
            }

            if (!file.type.startsWith('image/')) {
                setError(`${file.name} n'est pas une image valide`)
                continue
            }

            const fileExt = file.name.split('.').pop()?.toLowerCase()
            const fileName = `${Date.now()}-${Math.random()
                .toString(36)
                .substring(2, 8)}.${fileExt}`

            try {
                const { error: uploadError } = await supabase.storage
                    .from('product')
                    .upload(fileName, file)

                if (uploadError) {
                    setError(`Erreur lors du téléversement de ${file.name}`)
                    continue
                }

                const { data } = supabase.storage.from('product').getPublicUrl(fileName)
                uploadedUrls.push(data.publicUrl)
                uploadCount++
            } catch {
                setError(`Erreur inattendue lors du téléversement de ${file.name}`)
            }
        }

        setUploading(false)

        if (uploadedUrls.length > 0) {
            const newImages = [...images, ...uploadedUrls]
            setImages(newImages)
            onUpload(newImages)
            setSuccess(
                `${uploadCount} image${uploadCount > 1 ? 's' : ''} téléversée avec succès !`
            )
            setTimeout(() => setSuccess(''), 3000)
        }

        e.target.value = ''
    }

    const handleRemove = (url: string) => {
        const updated = images.filter((img) => img !== url)
        setImages(updated)
        onUpload(updated)
    }

    const remainingSlots = maxImages - (currentImageCount + images.length)
    const isDisabled = uploading || remainingSlots <= 0

    return (
        <div className="w-full space-y-4">
            {/* Zone upload */}
            <label
                htmlFor="upload-image"
                className={`group cursor-pointer flex items-center justify-center w-full h-40 rounded-xl border-2 border-dashed transition-all duration-300 ${isDisabled
                    ? 'border-gray-300 bg-gray-100 cursor-not-allowed'
                    : 'border-[#DAD5CD] bg-[#F9F6F1] hover:bg-[#f0ece6] hover:border-[#D29587]'
                    }`}
            >
                {uploading ? (
                    <div className="flex flex-col items-center text-[#D29587]">
                        <Loader2 className="animate-spin w-7 h-7 mb-2" />
                        <span className="text-sm font-medium">Téléversement...</span>
                    </div>
                ) : (
                    <div
                        className={`flex flex-col items-center transition-colors ${isDisabled ? 'text-gray-400' : 'text-[#A6A6A6] group-hover:text-[#D29587]'
                            }`}
                    >
                        <ImagePlus className="w-7 h-7 mb-2" />
                        <span className="text-sm font-medium">
                            {remainingSlots > 0
                                ? `Ajouter ${remainingSlots === 1 ? 'une image' : `${remainingSlots} images`}`
                                : 'Limite atteinte'}
                        </span>
                        <span className="text-xs mt-1">PNG, JPG • max 5 Mo</span>
                    </div>
                )}
            </label>

            <input
                id="upload-image"
                type="file"
                accept="image/*"
                multiple
                onChange={handleUpload}
                disabled={isDisabled}
                className="hidden"
            />

            {/* Messages */}
            {error && (
                <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            {success && (
                <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 p-3 rounded-lg">
                    <CheckCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{success}</span>
                </div>
            )}

            {/* Liste images */}
            <div className="flex gap-3 overflow-x-auto pb-2">
                <AnimatePresence>
                    {images.map((url, index) => (
                        <motion.div
                            key={url}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.3 }}
                            className="relative flex-shrink-0 w-28 h-28 rounded-xl overflow-hidden border border-gray-200"
                        >
                            <img src={url} alt="" className="w-full h-full object-cover" />
                            {index === 0 && (
                                <span className="absolute bottom-1 left-1 bg-[#D29587] text-white text-xs px-2 py-0.5 rounded">
                                    Principale
                                </span>
                            )}
                            <button
                                onClick={() => handleRemove(url)}
                                className="absolute top-1 right-1 bg-black/60 rounded-full p-1 text-white hover:bg-black/80 transition"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    )
}
