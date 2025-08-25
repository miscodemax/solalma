'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { ImagePlus, Loader2, CheckCircle, AlertCircle } from 'lucide-react'

interface ImageUploaderProps {
    onUpload: (url: string) => void
    currentImage?: string
}

export default function ImageUploader({ onUpload, currentImage }: ImageUploaderProps) {
    const [uploading, setUploading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const supabase = createClient()

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        // Vérifier la taille (5MB max)
        if (file.size > 5 * 1024 * 1024) {
            setError(`Le fichier est trop volumineux (max 5MB)`)
            return
        }

        // Vérifier le type
        if (!file.type.startsWith('image/')) {
            setError(`Ce fichier n'est pas une image valide`)
            return
        }

        setUploading(true)
        setError('')
        setSuccess('')

        const fileExt = file.name.split('.').pop()?.toLowerCase()
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`

        try {
            const { error: uploadError } = await supabase.storage
                .from('product')
                .upload(fileName, file)

            if (uploadError) {
                console.error('Upload error:', uploadError)
                setError(`Erreur lors du téléversement : ${uploadError.message}`)
                return
            }

            const { data } = supabase.storage.from('product').getPublicUrl(fileName)
            onUpload(data.publicUrl)

            setSuccess(`Image téléversée avec succès !`)
            setTimeout(() => setSuccess(''), 3000)
        } catch (err) {
            console.error('Unexpected error:', err)
            setError(`Erreur inattendue lors du téléversement`)
        } finally {
            setUploading(false)
            e.target.value = '' // reset input
        }
    }

    const isDisabled = uploading

    return (
        <div className="w-full space-y-3">
            <label
                htmlFor="upload-image"
                className={`group cursor-pointer flex items-center justify-center w-full h-44 rounded-xl border-2 border-dashed transition-all duration-200 ${isDisabled
                    ? 'border-gray-300 bg-gray-100 cursor-not-allowed'
                    : 'border-[#DAD5CD] bg-[#F9F6F1] hover:bg-[#f0ece6] hover:border-[#D29587]'
                    }`}
            >
                {uploading ? (
                    <div className="flex flex-col items-center text-[#D29587]">
                        <Loader2 className="animate-spin w-8 h-8 mb-2" />
                        <span className="text-sm font-medium">Téléversement...</span>
                    </div>
                ) : (
                    <div className="flex flex-col items-center text-[#A6A6A6] group-hover:text-[#D29587]">
                        <ImagePlus className="w-8 h-8 mb-2" />
                        <span className="text-sm font-medium">
                            {currentImage ? 'Remplacer l’image' : 'Ajouter une image'}
                        </span>
                        <span className="text-xs mt-1">PNG, JPG jusqu’à 5 Mo</span>
                    </div>
                )}
            </label>

            <input
                id="upload-image"
                type="file"
                accept="image/*"
                onChange={handleUpload}
                disabled={isDisabled}
                className="hidden"
            />

            {/* Messages de statut */}
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
        </div>
    )
}
