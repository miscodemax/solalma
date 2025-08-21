'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { ImagePlus, Loader2, CheckCircle, AlertCircle } from 'lucide-react'

interface ImageUploaderProps {
    onUpload: (urls: string[]) => void
    maxImages?: number
    currentImageCount?: number
}

export default function ImageUploader({
    onUpload,
    maxImages = 5,
    currentImageCount = 0
}: ImageUploaderProps) {
    const [uploading, setUploading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const supabase = createClient()

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (!files || files.length === 0) return

        // Vérifier le nombre total d'images
        const remainingSlots = maxImages - currentImageCount
        if (remainingSlots <= 0) {
            setError(`Vous avez déjà atteint la limite de ${maxImages} images`)
            return
        }

        const filesToUpload = Array.from(files).slice(0, remainingSlots)
        if (filesToUpload.length < files.length) {
            setError(`Seules ${filesToUpload.length} images ont été sélectionnées (limite: ${maxImages} images au total)`)
        }

        setUploading(true)
        setError('')
        setSuccess('')

        const uploadedUrls: string[] = []
        let uploadCount = 0

        for (const file of filesToUpload) {
            // Vérifier la taille du fichier (5MB max)
            if (file.size > 5 * 1024 * 1024) {
                setError(`${file.name} est trop volumineux. Taille maximum: 5MB`)
                continue
            }

            // Vérifier le type de fichier
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
                    console.error('Upload error:', uploadError)
                    setError(`Erreur lors du téléversement de ${file.name}: ${uploadError.message}`)
                    continue
                }

                const { data } = supabase.storage.from('product').getPublicUrl(fileName)
                uploadedUrls.push(data.publicUrl)
                uploadCount++

            } catch (err) {
                console.error('Unexpected error:', err)
                setError(`Erreur inattendue lors du téléversement de ${file.name}`)
            }
        }

        setUploading(false)

        if (uploadedUrls.length > 0) {
            onUpload(uploadedUrls)
            setSuccess(`${uploadCount} image${uploadCount > 1 ? 's' : ''} téléversée${uploadCount > 1 ? 's' : ''} avec succès !`)

            // Effacer le message de succès après 3 secondes
            setTimeout(() => setSuccess(''), 3000)
        }

        // Reset input pour pouvoir réuploader
        e.target.value = ''
    }

    const remainingSlots = maxImages - currentImageCount
    const isDisabled = uploading || remainingSlots <= 0

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
                    <div className={`flex flex-col items-center transition-colors ${isDisabled
                        ? 'text-gray-400'
                        : 'text-[#A6A6A6] group-hover:text-[#D29587]'
                        }`}>
                        <ImagePlus className="w-8 h-8 mb-2" />
                        <span className="text-sm font-medium">
                            {remainingSlots > 0
                                ? `Ajouter ${remainingSlots === 1 ? 'une image' : `${remainingSlots} images`}`
                                : 'Limite d\'images atteinte'
                            }
                        </span>
                        <span className="text-xs mt-1">
                            PNG, JPG jusqu&apos;à 5 Mo • Sélection multiple possible
                        </span>
                        {currentImageCount > 0 && (
                            <span className="text-xs text-[#D29587] mt-1 font-medium">
                                {currentImageCount}/{maxImages} images ajoutées
                            </span>
                        )}
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

            {/* Instructions */}
            <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
                <p className="font-medium mb-1">💡 Conseils pour de meilleures photos :</p>
                <ul className="space-y-1">
                    <li>• Prenez des photos sous un bon éclairage</li>
                    <li>• Montrez le produit sous différents angles</li>
                    <li>• La première image sera utilisée comme image principale</li>
                </ul>
            </div>
        </div>
    )
}