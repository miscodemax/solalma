'use client'

import { useState, useRef, useCallback } from 'react'
import { createClient } from '@/lib/supabase'
import {
    ImagePlus, Loader2, CheckCircle, AlertCircle, X, Camera,
    Upload, Move, Star, Eye, Sparkles, RotateCcw
} from 'lucide-react'
import { motion, AnimatePresence, Reorder } from 'framer-motion'

interface ImageUploaderProps {
    onUpload: (urls: string[]) => void
    maxImages?: number
    currentImageCount?: number
}

interface ImageItem {
    id: string
    url: string
    name: string
    size: number
    uploading?: boolean
    progress?: number
}

export default function ImageUploader({
    onUpload,
    maxImages = 5,
    currentImageCount = 0,
}: ImageUploaderProps) {
    const [images, setImages] = useState<ImageItem[]>([])
    const [dragActive, setDragActive] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({})

    const supabase = createClient()
    const fileInputRef = useRef<HTMLInputElement>(null)

    // Drag & Drop handlers
    const handleDrag = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true)
        } else if (e.type === 'dragleave') {
            setDragActive(false)
        }
    }, [])

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setDragActive(false)

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFiles(Array.from(e.dataTransfer.files))
        }
    }, [])

    // Gestion des fichiers
    const handleFiles = async (files: File[]) => {
        const remainingSlots = maxImages - (currentImageCount + images.length)
        if (remainingSlots <= 0) {
            setError('🚫 Limite d\'images atteinte')
            setTimeout(() => setError(''), 4000)
            return
        }

        const validFiles = files.filter(file => {
            // Validation du type
            if (!file.type.startsWith('image/')) {
                setError(`❌ "${file.name}" n'est pas une image valide`)
                setTimeout(() => setError(''), 4000)
                return false
            }

            // Validation de la taille
            if (file.size > 10 * 1024 * 1024) { // 10MB
                setError(`📏 "${file.name}" est trop volumineux (max 10MB)`)
                setTimeout(() => setError(''), 4000)
                return false
            }

            return true
        }).slice(0, remainingSlots)

        if (validFiles.length === 0) return

        // Créer les objets images avec preview immédiat
        const newImages: ImageItem[] = validFiles.map(file => ({
            id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            url: URL.createObjectURL(file), // Preview immédiat
            name: file.name,
            size: file.size,
            uploading: true,
            progress: 0
        }))

        setImages(prev => [...prev, ...newImages])

        // Upload en parallèle avec simulation de progress
        const uploadPromises = newImages.map(async (imageItem, index) => {
            const file = validFiles[index]

            // Simulation du progress
            const progressInterval = setInterval(() => {
                setUploadProgress(prev => ({
                    ...prev,
                    [imageItem.id]: Math.min((prev[imageItem.id] || 0) + Math.random() * 15, 90)
                }))
            }, 200)

            try {
                const fileExt = file.name.split('.').pop()?.toLowerCase()
                const fileName = `${imageItem.id}.${fileExt}`

                const { error: uploadError } = await supabase.storage
                    .from('product')
                    .upload(fileName, file)

                clearInterval(progressInterval)

                if (uploadError) {
                    throw new Error(uploadError.message)
                }

                const { data } = supabase.storage.from('product').getPublicUrl(fileName)

                // Finaliser le progress
                setUploadProgress(prev => ({
                    ...prev,
                    [imageItem.id]: 100
                }))

                // Mettre à jour l'image avec l'URL finale
                setTimeout(() => {
                    setImages(prev => prev.map(img =>
                        img.id === imageItem.id
                            ? { ...img, url: data.publicUrl, uploading: false }
                            : img
                    ))
                    setUploadProgress(prev => {
                        const { [imageItem.id]: removed, ...rest } = prev
                        return rest
                    })
                }, 500)

                return data.publicUrl

            } catch (error) {
                clearInterval(progressInterval)
                setImages(prev => prev.filter(img => img.id !== imageItem.id))
                setError(`❌ Échec upload: ${file.name}`)
                setTimeout(() => setError(''), 4000)
                return null
            }
        })

        const results = await Promise.all(uploadPromises)
        const successfulUploads = results.filter(Boolean) as string[]

        if (successfulUploads.length > 0) {
            setSuccess(`✨ ${successfulUploads.length} image${successfulUploads.length > 1 ? 's' : ''} ajoutée${successfulUploads.length > 1 ? 's' : ''} !`)
            setTimeout(() => setSuccess(''), 4000)

            // Notifier le parent avec toutes les URLs
            const allUrls = images.filter(img => !img.uploading).map(img => img.url)
                .concat(successfulUploads)
            onUpload(allUrls)
        }
    }

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            handleFiles(Array.from(e.target.files))
        }
        e.target.value = '' // Reset pour permettre la sélection du même fichier
    }

    const handleRemove = (imageItem: ImageItem) => {
        // Révoquer l'URL de preview si nécessaire
        if (imageItem.url.startsWith('blob:')) {
            URL.revokeObjectURL(imageItem.url)
        }

        const updatedImages = images.filter(img => img.id !== imageItem.id)
        setImages(updatedImages)

        const urls = updatedImages.filter(img => !img.uploading).map(img => img.url)
        onUpload(urls)

        // Feedback haptique visuel
        setSuccess('🗑️ Image supprimée')
        setTimeout(() => setSuccess(''), 2000)
    }

    const handleReorder = (newOrder: ImageItem[]) => {
        setImages(newOrder)
        const urls = newOrder.filter(img => !img.uploading).map(img => img.url)
        onUpload(urls)
    }

    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 B'
        const k = 1024
        const sizes = ['B', 'KB', 'MB']
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
    }

    const remainingSlots = maxImages - (currentImageCount + images.length)
    const canUpload = remainingSlots > 0

    return (
        <div className="w-full space-y-6">
            {/* Zone d'upload principale */}
            <motion.div
                className={`relative group cursor-pointer overflow-hidden rounded-2xl transition-all duration-300 ${dragActive
                        ? 'border-3 border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 scale-105 shadow-2xl'
                        : canUpload
                            ? 'border-2 border-dashed border-gray-300 dark:border-gray-600 bg-gray-50/50 dark:bg-gray-800/30 hover:bg-gradient-to-br hover:from-yellow-50 hover:to-orange-50 dark:hover:from-yellow-900/20 dark:hover:to-orange-900/20 hover:border-yellow-400 hover:scale-[1.02] hover:shadow-xl'
                            : 'border-2 border-dashed border-gray-200 bg-gray-100 dark:bg-gray-800 cursor-not-allowed opacity-60'
                    }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => canUpload && fileInputRef.current?.click()}
                whileHover={canUpload ? { y: -2 } : {}}
                whileTap={canUpload ? { scale: 0.98 } : {}}
            >
                {/* Background animé */}
                <div className="absolute inset-0 bg-gradient-to-br from-transparent via-yellow-400/5 to-orange-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                {/* Particules flottantes */}
                {dragActive && (
                    <div className="absolute inset-0">
                        {[...Array(6)].map((_, i) => (
                            <motion.div
                                key={i}
                                className="absolute w-2 h-2 bg-yellow-400 rounded-full"
                                initial={{ x: Math.random() * 400, y: Math.random() * 200, opacity: 0 }}
                                animate={{
                                    y: [null, -20, null],
                                    opacity: [0, 1, 0],
                                    scale: [0.5, 1, 0.5]
                                }}
                                transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    delay: i * 0.2
                                }}
                            />
                        ))}
                    </div>
                )}

                <div className="relative z-10 flex flex-col items-center justify-center p-12 min-h-[200px]">
                    <motion.div
                        className={`mb-4 p-4 rounded-full transition-all duration-300 ${dragActive
                                ? 'bg-yellow-400 text-white scale-125'
                                : canUpload
                                    ? 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 group-hover:bg-yellow-100 group-hover:text-yellow-600'
                                    : 'bg-gray-300 text-gray-400'
                            }`}
                        animate={dragActive ? { rotate: [0, -10, 10, 0] } : {}}
                        transition={{ duration: 0.5, repeat: dragActive ? Infinity : 0 }}
                    >
                        {dragActive ? (
                            <Upload className="w-8 h-8" />
                        ) : (
                            <ImagePlus className="w-8 h-8" />
                        )}
                    </motion.div>

                    <div className="text-center space-y-2">
                        {dragActive ? (
                            <div className="space-y-1">
                                <p className="text-lg font-bold text-yellow-600">
                                    ✨ Déposez vos images ici !
                                </p>
                                <p className="text-sm text-yellow-500">
                                    Comme par magie... 🪄
                                </p>
                            </div>
                        ) : canUpload ? (
                            <div className="space-y-3">
                                <p className="text-lg font-semibold text-gray-700 dark:text-gray-200">
                                    📸 Ajoutez vos photos
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Glissez-déposez ou <span className="text-yellow-600 font-medium underline">cliquez pour parcourir</span>
                                </p>
                                <div className="flex items-center justify-center gap-6 text-xs text-gray-400">
                                    <span className="flex items-center gap-1">
                                        <Camera className="w-3 h-3" />
                                        PNG, JPG, WEBP
                                    </span>
                                    <span>•</span>
                                    <span>Max 10MB</span>
                                    <span>•</span>
                                    <span className="text-yellow-600 font-medium">
                                        {remainingSlots} place{remainingSlots > 1 ? 's' : ''} restante{remainingSlots > 1 ? 's' : ''}
                                    </span>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-1">
                                <p className="text-lg font-semibold text-gray-500">
                                    🎯 Limite atteinte
                                </p>
                                <p className="text-sm text-gray-400">
                                    Vous avez ajouté {maxImages} images maximum
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Indicateur de progression globale */}
                    {Object.keys(uploadProgress).length > 0 && (
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-700">
                            <motion.div
                                className="h-full bg-gradient-to-r from-yellow-400 to-orange-500"
                                initial={{ width: 0 }}
                                animate={{
                                    width: `${Object.values(uploadProgress).reduce((a, b) => a + b, 0) / Object.keys(uploadProgress).length}%`
                                }}
                                transition={{ duration: 0.3 }}
                            />
                        </div>
                    )}
                </div>
            </motion.div>

            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileInput}
                className="hidden"
            />

            {/* Messages de feedback */}
            <AnimatePresence>
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.95 }}
                        className="flex items-center gap-3 text-sm text-red-600 bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 p-4 rounded-xl border border-red-200 dark:border-red-800/50 shadow-sm"
                    >
                        <AlertCircle className="w-5 h-5 flex-shrink-0 animate-pulse" />
                        <span className="font-medium">{error}</span>
                    </motion.div>
                )}

                {success && (
                    <motion.div
                        initial={{ opacity: 0, y: -20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.95 }}
                        className="flex items-center gap-3 text-sm text-green-600 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-4 rounded-xl border border-green-200 dark:border-green-800/50 shadow-sm"
                    >
                        <CheckCircle className="w-5 h-5 flex-shrink-0 animate-bounce" />
                        <span className="font-medium">{success}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Galerie des images avec réorganisation */}
            {images.length > 0 && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-yellow-500" />
                            Vos images ({images.length}/{maxImages})
                        </h3>
                        {images.length > 1 && (
                            <p className="text-sm text-gray-500 flex items-center gap-1">
                                <Move className="w-4 h-4" />
                                Glissez pour réorganiser
                            </p>
                        )}
                    </div>

                    <Reorder.Group
                        axis="x"
                        values={images}
                        onReorder={handleReorder}
                        className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide"
                    >
                        <AnimatePresence>
                            {images.map((imageItem, index) => (
                                <Reorder.Item
                                    key={imageItem.id}
                                    value={imageItem}
                                    className="flex-shrink-0"
                                    whileDrag={{
                                        scale: 1.05,
                                        zIndex: 50,
                                        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)"
                                    }}
                                    dragElastic={0.1}
                                >
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.8, y: 20 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.8, y: -20 }}
                                        transition={{ duration: 0.3, delay: index * 0.1 }}
                                        className="group relative w-32 h-32 rounded-xl overflow-hidden bg-white dark:bg-gray-800 shadow-lg hover:shadow-2xl transition-all duration-300"
                                    >
                                        {/* Image */}
                                        <img
                                            src={imageItem.url}
                                            alt={imageItem.name}
                                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                                        />

                                        {/* Overlay avec informations */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                            <div className="absolute bottom-2 left-2 right-2">
                                                <p className="text-white text-xs font-medium truncate">
                                                    {imageItem.name}
                                                </p>
                                                <p className="text-gray-300 text-xs">
                                                    {formatFileSize(imageItem.size)}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Badge principale */}
                                        {index === 0 && !imageItem.uploading && (
                                            <motion.div
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                className="absolute top-2 left-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs px-2 py-1 rounded-full font-medium shadow-lg flex items-center gap-1"
                                            >
                                                <Star className="w-3 h-3 fill-current" />
                                                Principal
                                            </motion.div>
                                        )}

                                        {/* Badge de vue */}
                                        {index > 0 && !imageItem.uploading && (
                                            <div className="absolute top-2 left-2 bg-black/40 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                                                <Eye className="w-3 h-3" />
                                                #{index + 1}
                                            </div>
                                        )}

                                        {/* Indicateur d'upload */}
                                        {imageItem.uploading && (
                                            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex flex-col items-center justify-center">
                                                <Loader2 className="w-6 h-6 text-white animate-spin mb-2" />
                                                <div className="w-16 h-1 bg-gray-700 rounded-full overflow-hidden">
                                                    <motion.div
                                                        className="h-full bg-gradient-to-r from-yellow-400 to-orange-500"
                                                        initial={{ width: 0 }}
                                                        animate={{
                                                            width: `${uploadProgress[imageItem.id] || 0}%`
                                                        }}
                                                        transition={{ duration: 0.3 }}
                                                    />
                                                </div>
                                                <p className="text-white text-xs mt-1">
                                                    {Math.round(uploadProgress[imageItem.id] || 0)}%
                                                </p>
                                            </div>
                                        )}

                                        {/* Bouton de suppression */}
                                        <button
                                            onClick={() => handleRemove(imageItem)}
                                            className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110 transform"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>

                                        {/* Indicateur de glissement */}
                                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-50 transition-opacity duration-300">
                                            <Move className="w-6 h-6 text-white" />
                                        </div>
                                    </motion.div>
                                </Reorder.Item>
                            ))}
                        </AnimatePresence>
                    </Reorder.Group>
                </div>
            )}

            {/* Tips et conseils */}
            {images.length === 0 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-blue-200/50 dark:border-blue-800/50"
                >
                    <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-3 flex items-center gap-2">
                        💡 Conseils pour de belles photos
                    </h4>
                    <ul className="space-y-2 text-sm text-blue-700 dark:text-blue-300">
                        <li className="flex items-start gap-2">
                            <span className="text-blue-500 mt-0.5">•</span>
                            <span>Utilisez un bon éclairage naturel</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-blue-500 mt-0.5">•</span>
                            <span>Prenez plusieurs angles de votre produit</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-blue-500 mt-0.5">•</span>
                            <span>La première image sera la photo principale</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-blue-500 mt-0.5">•</span>
                            <span>Évitez les arrière-plans encombrés</span>
                        </li>
                    </ul>
                </div>
            )}

            {/* Styles CSS additionnels */}
            <style jsx global>{`
                .scrollbar-hide {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
            `}</style>
        </div>
    )
}