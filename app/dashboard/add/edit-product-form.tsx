'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import Image from 'next/image'
import { Loader2, X, Upload, Edit3, Check, AlertCircle, Save, Undo2, Star, Plus, Camera, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'

type Props = {
  product: {
    id: number
    title: string
    price: number
    description: string
    images: string[]
    whatsapp_number?: string
    category?: string
    zone?: string
  }
}

type ImageItem = {
  url: string
  isOriginal: boolean
  isUploading?: boolean
  uploadProgress?: number
  file?: File
}

const categories = [
  { value: 'vetement', label: 'Vêtement', icon: '👗', color: 'from-pink-400 to-rose-500' },
  { value: 'soins_et_astuces', label: 'Soins et astuces', icon: '💄', color: 'from-purple-400 to-pink-500' },
  { value: 'maquillage', label: 'Maquillage', icon: '💋', color: 'from-red-400 to-pink-500' },
  { value: 'artisanat', label: 'Artisanat', icon: '🎨', color: 'from-blue-400 to-purple-500' },
  { value: 'electronique', label: 'Electronique', icon: '📱', color: 'from-cyan-400 to-blue-500' },
  { value: 'accessoire', label: 'Accessoire', icon: '👜', color: 'from-amber-400 to-orange-500' },
]

const SENEGAL_LOCATIONS = [
  "Dakar", "Plateau", "Médina", "Yoff", "Sacré-Coeur", "Almadies", "Ngor", "Ouakam",
  "Point E", "Mermoz", "Fann", "Liberté", "HLM", "Grand Dakar", "Pikine", "Guédiawaye",
  "Parcelles Assainies", "Rufisque", "Thiès", "Kaolack", "Saint-Louis", "Mbour",
  "Diourbel", "Ziguinchor"
]

export default function EditProductForm({ product }: Props) {
  const [form, setForm] = useState({
    title: product.title,
    price: product.price.toString(),
    description: product.description,
    whatsappNumber: product.whatsapp_number?.replace('+221', '') || '',
    category: product.category || categories[0].value,
    zone: product.zone || SENEGAL_LOCATIONS[0],
  })

  const [images, setImages] = useState<ImageItem[]>(
    (product.images || []).map(url => ({ url, isOriginal: true }))
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [hasChanges, setHasChanges] = useState(false)
  const [draggedOver, setDraggedOver] = useState(false)
  const [autoSaving, setAutoSaving] = useState(false)

  const router = useRouter()
  const supabase = createClient()

  // Détection des changements
  useEffect(() => {
    const changed = (
      form.title !== product.title ||
      form.price !== product.price.toString() ||
      form.description !== product.description ||
      form.whatsappNumber !== (product.whatsapp_number?.replace('+221', '') || '') ||
      form.category !== (product.category || categories[0].value) ||
      form.zone !== (product.zone || SENEGAL_LOCATIONS[0]) ||
      images.length !== (product.images || []).length ||
      images.some((img, i) => img.url !== (product.images || [])[i])
    )
    setHasChanges(changed)
  }, [form, images, product])

  const handleInputChange = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }))
    setError('')
  }

  const handleWhatsappChange = (value: string) => {
    const cleaned = value.replace(/\D/g, '')
    setForm(prev => ({ ...prev, whatsappNumber: cleaned }))
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDraggedOver(true)
  }

  const handleDragLeave = () => {
    setDraggedOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDraggedOver(false)
    const files = Array.from(e.dataTransfer.files)
    handleFileUpload(files)
  }

  const handleFileUpload = async (files: File[] | FileList, replaceIndex?: number) => {
    setError('')
    setSuccessMessage('')

    for (const file of files) {
      if (file.size > 10 * 1024 * 1024) {
        setError(`${file.name} est trop volumineux (max 10MB).`)
        continue
      }
      if (!file.type.startsWith('image/')) {
        setError(`${file.name} n'est pas une image valide.`)
        continue
      }

      const tempImageItem: ImageItem = {
        url: URL.createObjectURL(file),
        isOriginal: false,
        isUploading: true,
        uploadProgress: 0,
        file
      }

      if (replaceIndex !== undefined) {
        setImages(prev => {
          const newImages = [...prev]
          newImages[replaceIndex] = tempImageItem
          return newImages
        })
      } else {
        setImages(prev => [...prev, tempImageItem])
      }

      // Simulation de progression d'upload
      const progressInterval = setInterval(() => {
        setImages(prev => prev.map(img =>
          img.file === file && img.isUploading
            ? { ...img, uploadProgress: Math.min((img.uploadProgress || 0) + 10, 90) }
            : img
        ))
      }, 100)

      try {
        const fileExt = file.name.split('.').pop()
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`

        const { error: uploadError } = await supabase.storage
          .from('product')
          .upload(fileName, file)

        clearInterval(progressInterval)

        if (uploadError) {
          setError(uploadError.message)
          if (replaceIndex !== undefined) {
            setImages(prev => prev.filter((_, i) => i !== replaceIndex))
          } else {
            setImages(prev => prev.filter(img => img.file !== file))
          }
          continue
        }

        const { data } = supabase.storage.from('product').getPublicUrl(fileName)

        const finalImageItem: ImageItem = {
          url: data.publicUrl,
          isOriginal: false,
          isUploading: false
        }

        if (replaceIndex !== undefined) {
          setImages(prev => {
            const newImages = [...prev]
            newImages[replaceIndex] = finalImageItem
            return newImages
          })
        } else {
          setImages(prev => prev.map(img =>
            img.file === file ? finalImageItem : img
          ))
        }

        setSuccessMessage('Image uploadée avec succès ! ✨')
        setTimeout(() => setSuccessMessage(''), 3000)

      } catch (err) {
        clearInterval(progressInterval)
        setError('Erreur lors de l\'upload')
        if (replaceIndex !== undefined) {
          setImages(prev => prev.filter((_, i) => i !== replaceIndex))
        } else {
          setImages(prev => prev.filter(img => img.file !== file))
        }
      }
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, replaceIndex?: number) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    await handleFileUpload(files, replaceIndex)
    e.target.value = ''
  }

  const handleRemoveImage = (idx: number) => {
    setImages(prev => prev.filter((_, i) => i !== idx))
    setSuccessMessage('Image supprimée 🗑️')
    setTimeout(() => setSuccessMessage(''), 2000)
  }

  const handleSetMainImage = (idx: number) => {
    setImages(prev => {
      const newImages = [...prev]
      const [selected] = newImages.splice(idx, 1)
      return [selected, ...newImages]
    })
    setSuccessMessage('Image principale définie ! ⭐')
    setTimeout(() => setSuccessMessage(''), 2000)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await saveChanges()
  }

  const saveChanges = async () => {
    if (!hasChanges) return

    setError('')
    setSuccessMessage('')

    // Validations
    if (!form.title.trim()) {
      setError('Le titre est requis.')
      return
    }
    if (!form.price || isNaN(Number(form.price)) || Number(form.price) <= 0) {
      setError('Prix invalide.')
      return
    }
    if (!form.description.trim()) {
      setError('La description est requise.')
      return
    }
    const fullNumber = '+221' + form.whatsappNumber.trim()
    if (!/^\+221\d{8,9}$/.test(fullNumber)) {
      setError('Numéro WhatsApp invalide (ex: 771234567).')
      return
    }
    if (images.length === 0) {
      setError('Ajoutez au moins une image.')
      return
    }
    if (images.some(img => img.isUploading)) {
      setError('Attendez que tous les uploads soient terminés.')
      return
    }

    setLoading(true)

    try {
      const { error } = await supabase
        .from('product')
        .update({
          title: form.title.trim(),
          price: parseFloat(form.price),
          description: form.description.trim(),
          image_url: images[0]?.url,
          whatsapp_number: fullNumber,
          category: form.category,
          zone: form.zone,
        })
        .eq('id', product.id)

      if (error) throw error

      // Mise à jour des images supplémentaires si nécessaire
      if (images.length > 1) {
        await supabase
          .from('product_images')
          .delete()
          .eq('product_id', product.id)

        const additionalImages = images.slice(1).map(img => ({
          product_id: product.id,
          image_url: img.url
        }))

        if (additionalImages.length > 0) {
          await supabase
            .from('product_images')
            .insert(additionalImages)
        }
      }

      setSuccessMessage('🎉 Produit modifié avec succès ! Redirection...')
      setTimeout(() => {
        router.push('/dashboard/products')
      }, 2000)

    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }

  const resetChanges = () => {
    setForm({
      title: product.title,
      price: product.price.toString(),
      description: product.description,
      whatsappNumber: product.whatsapp_number?.replace('+221', '') || '',
      category: product.category || categories[0].value,
      zone: product.zone || SENEGAL_LOCATIONS[0],
    })
    setImages((product.images || []).map(url => ({ url, isOriginal: true })))
    setError('')
    setSuccessMessage('Modifications annulées ↩️')
    setTimeout(() => setSuccessMessage(''), 2000)
  }

  const selectedCategory = categories.find(cat => cat.value === form.category) || categories[0]

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FAF9F6] via-white to-[#F4C430]/5 dark:bg-gradient-to-br dark:from-[#1a1a1a] dark:via-[#222] dark:to-[#2a2a2a] py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header avec statut de sauvegarde */}
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="outline"
            size="lg"
            onClick={() => router.back()}
            className="border-[#E9961A] text-[#E9961A] font-semibold hover:bg-[#E9961A]/10 hover:dark:bg-[#E9961A]/20 transition-all duration-200 px-6 py-3"
          >
            ← Retour
          </Button>

          <div className="flex items-center gap-4">
            {hasChanges && (
              <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 px-4 py-2 rounded-xl">
                <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">Modifications non sauvées</span>
              </div>
            )}

            {autoSaving && (
              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-4 py-2 rounded-xl">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm font-medium">Sauvegarde...</span>
              </div>
            )}
          </div>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-[#F4C430] via-[#E9961A] to-[#F4C430] bg-clip-text text-transparent mb-4">
            ✏️ Modifier votre produit
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Apportez vos modifications en toute simplicité
          </p>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 rounded-r-xl animate-in slide-in-from-left-4 duration-300">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-500 mr-3" />
              <p className="text-red-700 dark:text-red-400 font-medium">{error}</p>
            </div>
          </div>
        )}

        {successMessage && (
          <div className="mb-6 bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 p-4 rounded-r-xl animate-in slide-in-from-left-4 duration-300">
            <div className="flex items-center">
              <Check className="w-5 h-5 text-green-500 mr-3" />
              <p className="text-green-700 dark:text-green-400 font-medium">{successMessage}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Section Images avec drag & drop */}
          <div className="bg-white/80 dark:bg-[#2a2a2a]/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-[#F4C430]/20 dark:border-gray-600 p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-r from-[#F4C430] to-[#E9961A] rounded-xl">
                <Camera className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">Images du produit</h2>
              <div className="bg-gradient-to-r from-[#F4C430]/20 to-[#E9961A]/20 px-3 py-1 rounded-full">
                <span className="text-sm font-medium text-[#E9961A]">{images.length}/6</span>
              </div>
            </div>

            {/* Zone de drop */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-2xl p-8 mb-6 transition-all duration-300 ${draggedOver
                  ? 'border-[#F4C430] bg-[#F4C430]/10'
                  : 'border-gray-300 dark:border-gray-600'
                }`}
            >
              <div className="text-center">
                <Upload className={`w-12 h-12 mx-auto mb-4 transition-colors ${draggedOver ? 'text-[#F4C430]' : 'text-gray-400'
                  }`} />
                <p className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Glissez vos images ici ou cliquez pour parcourir
                </p>
                <p className="text-sm text-gray-500">JPG, PNG jusqu'à 10MB chacune</p>
                <label className="inline-block mt-4 cursor-pointer bg-gradient-to-r from-[#F4C430] to-[#E9961A] text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all duration-300">
                  <Plus className="w-4 h-4 inline mr-2" />
                  Parcourir les fichiers
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => handleImageUpload(e)}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Grille d'images */}
            {images.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {images.map((imageItem, idx) => (
                  <div
                    key={idx}
                    className="relative group aspect-square rounded-2xl overflow-hidden border-2 border-gray-200 dark:border-gray-600 hover:border-[#F4C430] transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    <Image
                      src={imageItem.url}
                      alt={`Image ${idx + 1}`}
                      fill
                      className="object-cover"
                    />

                    {/* Overlay de progression */}
                    {imageItem.isUploading && (
                      <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center">
                        <Loader2 className="animate-spin w-8 h-8 text-white mb-2" />
                        <div className="w-3/4 bg-gray-700 rounded-full h-2 mb-2">
                          <div
                            className="bg-[#F4C430] h-2 rounded-full transition-all duration-300"
                            style={{ width: `${imageItem.uploadProgress || 0}%` }}
                          ></div>
                        </div>
                        <p className="text-white text-xs">Upload {imageItem.uploadProgress || 0}%</p>
                      </div>
                    )}

                    {/* Badges */}
                    <div className="absolute top-2 left-2 flex gap-1">
                      {idx === 0 && (
                        <div className="bg-gradient-to-r from-[#F4C430] to-[#E9961A] text-white text-xs px-2 py-1 rounded-full font-medium flex items-center gap-1">
                          <Star className="w-3 h-3" />
                          Principale
                        </div>
                      )}
                      {imageItem.isOriginal ? (
                        <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">Original</span>
                      ) : (
                        <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                          <Sparkles className="w-3 h-3" />
                          Nouvelle
                        </span>
                      )}
                    </div>

                    {/* Boutons d'action */}
                    {!imageItem.isUploading && (
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-2">
                        {idx !== 0 && (
                          <button
                            type="button"
                            onClick={() => handleSetMainImage(idx)}
                            className="bg-yellow-500 hover:bg-yellow-600 text-white p-2 rounded-full transition-all duration-200 hover:scale-110"
                            title="Définir comme image principale"
                          >
                            <Star className="w-4 h-4" />
                          </button>
                        )}
                        <label
                          htmlFor={`replace-${idx}`}
                          className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-full cursor-pointer transition-all duration-200 hover:scale-110"
                          title="Remplacer cette image"
                        >
                          <Edit3 className="w-4 h-4" />
                          <input
                            id={`replace-${idx}`}
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageUpload(e, idx)}
                            className="hidden"
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-full transition-all duration-200 hover:scale-110"
                          title="Supprimer cette image"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Informations du produit */}
          <div className="bg-white/80 dark:bg-[#2a2a2a]/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-[#F4C430]/20 dark:border-gray-600 p-8 space-y-6">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6">📝 Informations du produit</h2>

            {/* Titre */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                ✨ Titre du produit
              </label>
              <input
                type="text"
                placeholder="Ex: Robe Wax taille M, comme neuve"
                value={form.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className="w-full px-4 py-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E9961A] focus:border-[#F4C430] bg-white dark:bg-gray-800 transition-all duration-300 text-lg"
                required
              />
              <div className="text-right text-sm text-gray-500 mt-1">
                {form.title.length}/60 caractères
              </div>
            </div>

            {/* Catégorie */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                🏷️ Catégorie
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {categories.map((cat) => (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => handleInputChange('category', cat.value)}
                    className={`relative p-4 rounded-xl border-2 transition-all duration-300 ${form.category === cat.value
                        ? 'border-[#F4C430] bg-gradient-to-br ' + cat.color + ' text-white shadow-lg scale-105'
                        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-[#F4C430]/50 hover:scale-102'
                      }`}
                  >
                    <div className="text-2xl mb-2">{cat.icon}</div>
                    <h3 className="font-medium text-sm">{cat.label}</h3>
                    {form.category === cat.value && (
                      <div className="absolute -top-1 -right-1 bg-white text-[#F4C430] rounded-full p-1">
                        <Check className="w-4 h-4" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Prix et localisation */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  💵 Prix en FCFA
                </label>
                <input
                  type="number"
                  placeholder="Ex: 25000"
                  value={form.price}
                  onChange={(e) => handleInputChange('price', e.target.value)}
                  className="w-full px-4 py-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E9961A] focus:border-[#F4C430] bg-white dark:bg-gray-800 transition-all duration-300 text-lg"
                  required
                  min={0}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  📍 Zone
                </label>
                <select
                  value={form.zone}
                  onChange={(e) => handleInputChange('zone', e.target.value)}
                  className="w-full px-4 py-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E9961A] focus:border-[#F4C430] bg-white dark:bg-gray-800 transition-all duration-300"
                >
                  {SENEGAL_LOCATIONS.map((location) => (
                    <option key={location} value={location}>{location}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                📝 Description détaillée
              </label>
              <textarea
                placeholder="Décrivez votre produit : état, taille, couleur, matière..."
                value={form.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="w-full px-4 py-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl h-32 resize-none focus:outline-none focus:ring-2 focus:ring-[#E9961A] focus:border-[#F4C430] bg-white dark:bg-gray-800 transition-all duration-300"
                required
              />
              <div className="text-right text-sm text-gray-500 mt-1">
                {form.description.length}/500 caractères
              </div>
            </div>

            {/* WhatsApp */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                📱 Numéro WhatsApp
              </label>
              <div className="flex border-2 border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-[#E9961A] focus-within:border-[#F4C430] transition-all duration-300">
                <div className="px-4 py-4 bg-gradient-to-r from-[#F4C430]/20 to-[#E9961A]/20 text-gray-700 dark:text-gray-300 font-medium">
                  +221
                </div>
                <input
                  type="tel"
                  placeholder="771234567"
                  value={form.whatsappNumber}
                  onChange={(e) => handleWhatsappChange(e.target.value)}
                  className="flex-1 px-4 py-4 focus:outline-none bg-white dark:bg-gray-800 text-lg"
                  maxLength={9}
                  required
                />
              </div>
            </div>
          </div>

          {/* Actions flottantes */}
          <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
            <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-[#F4C430]/20 p-4">
              <div className="flex items-center gap-4">
                {/* Bouton Reset */}
                {hasChanges && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={resetChanges}
                    className="flex items-center gap-2 border-gray-300 text-gray-600 hover:bg-gray-50 transition-all duration-300"
                  >
                    <Undo2 className="w-4 h-4" />
                    Annuler
                  </Button>
                )}

                {/* Indicateur de statut */}
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-50 dark:bg-gray-800">
                  <div className={`w-2 h-2 rounded-full ${hasChanges
                      ? 'bg-orange-500 animate-pulse'
                      : 'bg-green-500'
                    }`}></div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {hasChanges ? 'Modifications en attente' : 'Tout est sauvé'}
                  </span>
                </div>

                {/* Bouton Sauvegarder */}
                <Button
                  type="submit"
                  disabled={loading || images.some(img => img.isUploading) || !hasChanges}
                  className={`flex items-center gap-2 px-6 py-3 text-lg font-bold transition-all duration-300 ${hasChanges
                      ? 'bg-gradient-to-r from-[#F4C430] to-[#E9961A] hover:from-[#E9961A] hover:to-[#F4C430] text-white shadow-lg hover:shadow-xl scale-100 hover:scale-105'
                      : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    }`}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Sauvegarde...
                    </>
                  ) : hasChanges ? (
                    <>
                      <Save className="w-5 h-5" />
                      Sauvegarder les modifications
                    </>
                  ) : (
                    <>
                      <Check className="w-5 h-5" />
                      Aucune modification
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Section conseils */}
          {hasChanges && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-6 animate-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                  <Sparkles className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-bold text-blue-800 dark:text-blue-200 mb-2">
                    💡 Conseils pour optimiser votre produit
                  </h3>
                  <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                    <li>• Des photos de qualité augmentent vos ventes de 70%</li>
                    <li>• Une description détaillée inspire confiance</li>
                    <li>• Un prix juste attire plus d'acheteurs</li>
                    <li>• Répondez rapidement aux messages WhatsApp</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Statistiques du produit */}
          <div className="bg-gradient-to-r from-[#F4C430]/10 to-[#E9961A]/10 rounded-2xl p-6 border border-[#F4C430]/20">
            <h3 className="font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
              <div className="p-2 bg-[#F4C430] rounded-xl">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              Aperçu de votre produit
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-[#E9961A]">{images.length}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Images</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-[#E9961A]">{form.title.length}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Caract. titre</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-[#E9961A]">{form.description.length}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Caract. desc.</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-[#E9961A]">{selectedCategory.icon}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{selectedCategory.label}</div>
              </div>
            </div>
          </div>

          {/* Preview du produit */}
          <div className="bg-white/80 dark:bg-[#2a2a2a]/80 backdrop-blur-xl rounded-2xl shadow-lg border border-[#F4C430]/20 dark:border-gray-600 p-6">
            <h3 className="font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
              👁️ Aperçu public de votre produit
            </h3>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
              <div className="flex gap-4">
                {images[0] && (
                  <div className="w-20 h-20 relative rounded-lg overflow-hidden flex-shrink-0">
                    <Image
                      src={images[0].url}
                      alt="Aperçu"
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-gray-900 dark:text-white truncate">
                    {form.title || 'Titre du produit...'}
                  </h4>
                  <p className="text-[#E9961A] font-bold text-lg">
                    {form.price ? `${parseFloat(form.price).toLocaleString()} FCFA` : 'Prix...'}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                    {form.description || 'Description du produit...'}
                  </p>
                  <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                    <span className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded-full">
                      {selectedCategory.icon} {selectedCategory.label}
                    </span>
                    <span className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded-full">
                      📍 {form.zone}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Espace pour le bouton flottant */}
          <div className="h-20"></div>
        </form>
      </div>
    </div>
  )
}