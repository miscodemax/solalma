'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { ImagePlus, Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import {
    DndContext,
    closestCenter,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core'
import {
    arrayMove,
    SortableContext,
    horizontalListSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface ImageUploaderProps {
    onUpload: (urls: string[]) => void
    maxImages?: number
    currentImageCount?: number
}

function SortableImage({ url, index }: { url: string; index: number }) {
    const { attributes, listeners, setNodeRef, transform, transition } =
        useSortable({ id: url })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className="relative w-28 h-28 flex-shrink-0 rounded-lg overflow-hidden border border-gray-200 cursor-grab active:cursor-grabbing"
        >
            <img
                src={url}
                alt={`image-${index}`}
                className="w-full h-full object-cover"
            />
            {index === 0 && (
                <span className="absolute bottom-1 left-1 bg-[#D29587] text-white text-xs px-2 py-0.5 rounded">
                    Principale
                </span>
            )}
        </div>
    )
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

    const sensors = useSensors(useSensor(PointerSensor))

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
                    console.error('Upload error:', uploadError)
                    setError(
                        `Erreur lors du téléversement de ${file.name}: ${uploadError.message}`
                    )
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
            const newImages = [...images, ...uploadedUrls]
            setImages(newImages)
            onUpload(newImages)
            setSuccess(
                `${uploadCount} image${uploadCount > 1 ? 's' : ''} téléversée${uploadCount > 1 ? 's' : ''
                } avec succès !`
            )
            setTimeout(() => setSuccess(''), 3000)
        }

        e.target.value = ''
    }

    const handleDragEnd = (event: any) => {
        const { active, over } = event
        if (!over || active.id === over.id) return

        const oldIndex = images.indexOf(active.id)
        const newIndex = images.indexOf(over.id)

        const reordered = arrayMove(images, oldIndex, newIndex)
        setImages(reordered)
        onUpload(reordered)
    }

    const remainingSlots = maxImages - (currentImageCount + images.length)
    const isDisabled = uploading || remainingSlots <= 0

    return (
        <div className="w-full space-y-3">
            {/* Zone upload */}
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
                    <div
                        className={`flex flex-col items-center transition-colors ${isDisabled ? 'text-gray-400' : 'text-[#A6A6A6] group-hover:text-[#D29587]'
                            }`}
                    >
                        <ImagePlus className="w-8 h-8 mb-2" />
                        <span className="text-sm font-medium">
                            {remainingSlots > 0
                                ? `Ajouter ${remainingSlots === 1 ? 'une image' : `${remainingSlots} images`
                                }`
                                : 'Limite atteinte'}
                        </span>
                        <span className="text-xs mt-1">
                            PNG, JPG jusqu&apos;à 5 Mo • Sélection multiple possible
                        </span>
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

            {/* Drag & Drop preview */}
            {images.length > 0 && (
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    <SortableContext
                        items={images}
                        strategy={horizontalListSortingStrategy}
                    >
                        <div className="flex gap-2 overflow-x-auto">
                            {images.map((url, index) => (
                                <SortableImage key={url} url={url} index={index} />
                            ))}
                        </div>
                    </SortableContext>
                </DndContext>
            )}
        </div>
    )
}
