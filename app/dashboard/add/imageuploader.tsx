'use client'

import React, { useState, useRef, useCallback } from 'react'
import { createClient } from '@/lib/supabase'
import { ImagePlus, Loader2, X, Star, Upload, CheckCircle2, AlertCircle } from 'lucide-react'

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
    progress?: number
    error?: boolean
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

    // Conversion et compression d'image automatique
    const compressImage = async (file: File): Promise<File> => {
        return new Promise((resolve) => {
            const reader = new FileReader()
            reader.onload = (e) => {
                const img = document.createElement('img')
                img.onload = () => {
                    const canvas = document.createElement('canvas')
                    let width = img.width
                    let height = img.height

                    // Redimensionner si trop grand (max 1920px)
                    const maxSize = 1920
                    if (width > maxSize || height > maxSize) {
                        if (width > height) {
                            height = (height / width) * maxSize
                            width = maxSize
                        } else {
                            width = (width / height) * maxSize
                            height = maxSize
                        }
                    }

                    canvas.width = width
                    canvas.height = height

                    const ctx = canvas.getContext('2d')
                    ctx?.drawImage(img, 0, 0, width, height)

                    // Convertir en WebP (meilleure compression) ou JPEG
                    canvas.toBlob(
                        (blob) => {
                            if (blob) {
                                const compressedFile = new File(
                                    [blob],
                                    file.name.replace(/\.[^/.]+$/, '.webp'),
                                    { type: 'image/webp' }
                                )
                                resolve(compressedFile)
                            } else {
                                resolve(file)
                            }
                        },
                        'image/webp',
                        0.85 // Qualité 85%
                    )
                }
                img.src = e.target?.result as string
            }
            reader.readAsDataURL(file)
        })
    }

    const handleFiles = async (files: FileList | null) => {
        if (!files || files.length === 0) return
        
        const remaining = maxImages - (currentImageCount + images.length)
        const toUpload = Array.from(files).slice(0, remaining)

        if (toUpload.length === 0) {
            setError(`Maximum ${maxImages} images`)
            setTimeout(() => setError(''), 3000)
            return
        }

        // Créer des previews immédiatement avec des IDs uniques
        const newItems: ImageItem[] = toUpload.map((file, index) => ({
            id: `${Date.now()}-${index}-${Math.random().toString(36).slice(2, 9)}`,
            previewUrl: URL.createObjectURL(file),
            name: file.name,
            size: file.size,
            uploading: true,
            progress: 0,
        }))

        setImages(prev => [...prev, ...newItems])

        const uploadedUrls: string[] = []

        // Upload en parallèle pour plus de rapidité
        await Promise.all(
            toUpload.map(async (file, index) => {
                const itemId = newItems[index].id

                try {
                    // Vérifier que c'est bien une image
                    if (!file.type.startsWith('image/')) {
                        throw new Error('Fichier non supporté')
                    }

                    // Compression automatique
                    setImages(prev => prev.map(it => 
                        it.id === itemId ? { ...it, progress: 20 } : it
                    ))

                    const compressedFile = file.size > 500 * 1024 
                        ? await compressImage(file) 
                        : file

                    setImages(prev => prev.map(it => 
                        it.id === itemId ? { ...it, progress: 40 } : it
                    ))

                    const ext = compressedFile.name.split('.').pop() || 'webp'
                    const filename = `${itemId}.${ext}`

                    // Upload
                    setImages(prev => prev.map(it => 
                        it.id === itemId ? { ...it, progress: 60 } : it
                    ))

                    const { error: uploadError } = await supabase.storage
                        .from('product')
                        .upload(filename, compressedFile, { 
                            cacheControl: '3600', 
                            upsert: false 
                        })

                    if (uploadError) throw uploadError

                    setImages(prev => prev.map(it => 
                        it.id === itemId ? { ...it, progress: 90 } : it
                    ))

                    const { data } = supabase.storage.from('product').getPublicUrl(filename)
                    const publicUrl = data.publicUrl

                    // Marquer comme terminé
                    setImages(prev => prev.map(it => 
                        it.id === itemId 
                            ? { ...it, url: publicUrl, uploading: false, progress: 100 } 
                            : it
                    ))
                    
                    uploadedUrls.push(publicUrl)
                } catch (err) {
                    console.error('Upload error:', err)
                    setImages(prev => prev.map(it => 
                        it.id === itemId 
                            ? { ...it, uploading: false, error: true, progress: 0 } 
                            : it
                    ))
                }
            })
        )

        // Notifier le parent avec toutes les URLs après upload
        setTimeout(() => {
            const finalUrls = [...images, ...newItems]
                .filter(i => i.url && !i.error)
                .map(i => i.url!)
            
            // Supprimer les doublons avec Set
            const uniqueUrls = Array.from(new Set(finalUrls))
            
            if (uniqueUrls.length > 0) {
                onUpload(uniqueUrls)
            }
        }, 100)

        // Nettoyer les previews
        setTimeout(() => {
            newItems.forEach(it => {
                try { URL.revokeObjectURL(it.previewUrl) } catch { }
            })
        }, 1000)

        if (fileInputRef.current) fileInputRef.current.value = ''
    }

    const handleRemove = useCallback((id: string) => {
        const removed = images.find(i => i.id === id)
        if (removed?.previewUrl) {
            try { URL.revokeObjectURL(removed.previewUrl) } catch { }
        }
        const updated = images.filter(i => i.id !== id)
        setImages(updated)
        const urls = updated.filter(i => i.url).map(i => i.url!)
        onUpload(urls)
    }, [images, onUpload])

    const totalImages = currentImageCount + images.length
    const canAddMore = totalImages < maxImages

    return (
        <div className="space-y-4">
            {/* Bouton d'ajout simple */}
            <label className={`block cursor-pointer transition-all duration-300 ${!canAddMore ? 'opacity-50 cursor-not-allowed' : ''}`}>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => handleFiles(e.target.files)}
                    disabled={!canAddMore}
                    className="hidden"
                />

                <div className={`relative w-full rounded-2xl border-2 transition-all duration-300 overflow-hidden ${
                    canAddMore
                        ? 'border-gray-300 dark:border-gray-600 bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 hover:border-yellow-400 hover:shadow-lg hover:scale-[1.01]'
                        : 'border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800'
                }`}>
                    <div className="p-6 text-center">
                        <div className="flex justify-center mb-3">
                            <div className="relative">
                                <ImagePlus className="w-10 h-10 text-yellow-500" />
                                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center">
                                    <span className="text-white text-xs font-bold">+</span>
                                </div>
                            </div>
                        </div>
                        
                        <div className="space-y-1">
                            <p className="text-base font-semibold text-gray-800 dark:text-gray-200">
                                Ajouter des photos
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Cliquez pour sélectionner vos images
                            </p>
                            <div className="flex items-center justify-center gap-3 text-xs text-gray-500 dark:text-gray-500 mt-2">
                                <span className="flex items-center gap-1">
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    Tous formats
                                </span>
                                <span className="flex items-center gap-1">
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    Auto-compression
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Compteur d'images */}
                    {totalImages > 0 && (
                        <div className="absolute top-3 right-3 px-3 py-1 bg-yellow-500 text-white text-xs font-bold rounded-full shadow-lg">
                            {totalImages}/{maxImages}
                        </div>
                    )}
                </div>
            </label>

            {/* Galerie d'images */}
            {images.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                    {images.map((img, idx) => (
                        <div
                            key={img.id}
                            className="group relative aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                        >
                            {/* Image */}
                            <img
                                src={img.url || img.previewUrl}
                                alt={img.name}
                                className="w-full h-full object-cover"
                            />

                            {/* Badge Principal */}
                            {idx === 0 && !img.uploading && !img.error && (
                                <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-yellow-400 to-yellow-500 text-white text-xs font-bold rounded-lg shadow-lg">
                                    <Star className="w-3 h-3 fill-white" />
                                    Principal
                                </div>
                            )}

                            {/* État d'upload */}
                            {img.uploading && (
                                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center gap-2">
                                    <Loader2 className="w-8 h-8 text-white animate-spin" />
                                    <div className="w-3/4 h-1.5 bg-white/20 rounded-full overflow-hidden">
                                        <div 
                                            className="h-full bg-gradient-to-r from-yellow-400 to-yellow-500 transition-all duration-300"
                                            style={{ width: `${img.progress || 0}%` }}
                                        />
                                    </div>
                                    <span className="text-xs text-white font-medium">
                                        {img.progress || 0}%
                                    </span>
                                </div>
                            )}

                            {/* Erreur */}
                            {img.error && (
                                <div className="absolute inset-0 bg-red-500/80 flex flex-col items-center justify-center gap-2">
                                    <AlertCircle className="w-8 h-8 text-white" />
                                    <span className="text-xs text-white font-medium">Échec</span>
                                </div>
                            )}

                            {/* Bouton supprimer */}
                            <button
                                onClick={() => handleRemove(img.id)}
                                className="absolute top-2 right-2 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-110 active:scale-95 opacity-0 group-hover:opacity-100"
                                aria-label="Supprimer"
                            >
                                <X className="w-4 h-4" />
                            </button>

                            {/* Infos fichier */}
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className="text-xs text-white/90 truncate">{img.name}</div>
                                <div className="text-[10px] text-white/70">{formatSize(img.size)}</div>
                            </div>

                            {/* Succès */}
                            {img.url && !img.uploading && !img.error && (
                                <div className="absolute top-2 right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                                    <CheckCircle2 className="w-4 h-4 text-white" />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Message d'erreur */}
            {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl animate-pulse">
                    <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                    <p className="text-sm text-red-700 dark:text-red-400 font-medium">{error}</p>
                </div>
            )}
        </div>
    )
}