'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import Image from 'next/image'
import { Loader2, X, Upload, Edit3, Check, AlertCircle } from 'lucide-react'
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
  }
}

type ImageItem = {
  url: string
  isOriginal: boolean
  isUploading?: boolean
  uploadProgress?: number
}

const categories = [
  { label: 'Vêtements', value: 'vetement' },
  { label: 'Soins et astuces', value: 'soins_et_astuces' },
  { label: 'Maquillage', value: 'maquillage' },
  { label: 'Artisanat (fait main)', value: 'artisanat' },
  { label: 'Electronique', value: 'electronique' },
]

export default function EditProductForm({ product }: Props) {
  const [title, setTitle] = useState(product.title)
  const [price, setPrice] = useState(product.price.toString())
  const [description, setDescription] = useState(product.description)
  const [images, setImages] = useState<ImageItem[]>(
    (product.images || []).map(url => ({ url, isOriginal: true }))
  )
  const [whatsappNumber, setWhatsappNumber] = useState(product.whatsapp_number || '')
  const [category, setCategory] = useState(product.category || categories[0].value)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const router = useRouter()
  const supabase = createClient()

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, replaceIndex?: number) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setError('')
    setSuccessMessage('')

    for (const file of files) {
      if (file.size > 5 * 1024 * 1024) {
        setError(`${file.name} est trop volumineux (max 5MB).`)
        continue
      }
      if (!file.type.startsWith('image/')) {
        setError(`${file.name} n'est pas une image valide.`)
        continue
      }

      // Créer un placeholder pour l'image en cours d'upload
      const tempImageItem: ImageItem = {
        url: URL.createObjectURL(file),
        isOriginal: false,
        isUploading: true,
        uploadProgress: 0
      }

      if (replaceIndex !== undefined) {
        // Remplacer une image existante
        setImages(prev => {
          const newImages = [...prev]
          newImages[replaceIndex] = tempImageItem
          return newImages
        })
      } else {
        // Ajouter une nouvelle image
        setImages(prev => [...prev, tempImageItem])
      }

      // Upload vers Supabase
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`

      try {
        const { error: uploadError } = await supabase.storage
          .from('product')
          .upload(fileName, file)

        if (uploadError) {
          setError(uploadError.message)
          // Retirer l'image en cas d'erreur
          if (replaceIndex !== undefined) {
            setImages(prev => prev.filter((_, i) => i !== replaceIndex))
          } else {
            setImages(prev => prev.slice(0, -1))
          }
          continue
        }

        const { data } = supabase.storage.from('product').getPublicUrl(fileName)

        // Mettre à jour avec l'URL finale
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
          setImages(prev => {
            const newImages = [...prev]
            newImages[newImages.length - 1] = finalImageItem
            return newImages
          })
        }

        setSuccessMessage('Image uploadée avec succès !')
        setTimeout(() => setSuccessMessage(''), 3000)

      } catch (err) {
        setError('Erreur lors de l\'upload')
        if (replaceIndex !== undefined) {
          setImages(prev => prev.filter((_, i) => i !== replaceIndex))
        } else {
          setImages(prev => prev.slice(0, -1))
        }
      }
    }

    e.target.value = ''
  }

  const handleRemoveImage = (idx: number) => {
    setImages(prev => prev.filter((_, i) => i !== idx))
    setSuccessMessage('Image supprimée')
    setTimeout(() => setSuccessMessage(''), 2000)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccessMessage('')

    if (!title.trim()) return setError('Le titre est requis.')
    if (!price || isNaN(Number(price)) || Number(price) <= 0) return setError('Prix invalide.')
    if (!description.trim()) return setError('La description est requise.')
    if (!/^\+?\d{7,15}$/.test(whatsappNumber)) return setError('Numéro WhatsApp invalide.')
    if (!category) return setError('Veuillez choisir une catégorie.')
    if (images.length === 0) return setError('Ajoutez au moins une image.')
    if (images.some(img => img.isUploading)) return setError('Attendez que tous les uploads soient terminés.')

    setLoading(true)

    const { error } = await supabase
      .from('product')
      .update({
        title: title.trim(),
        price: parseFloat(price),
        description: description.trim(),
        images: images.map(img => img.url),
        whatsapp_number: whatsappNumber,
        category,
      })
      .eq('id', product.id)

    setLoading(false)

    if (error) {
      setError(error.message)
    } else {
      setSuccessMessage('Produit modifié avec succès ! Redirection...')
      setTimeout(() => {
        router.push('/dashboard/products')
      }, 1500)
    }
  }

  const hasChanges = () => {
    return (
      title !== product.title ||
      price !== product.price.toString() ||
      description !== product.description ||
      whatsappNumber !== (product.whatsapp_number || '') ||
      category !== (product.category || categories[0].value) ||
      images.length !== (product.images || []).length ||
      images.some((img, i) => img.url !== (product.images || [])[i])
    )
  }

  return (
    <div className="min-h-screen px-4 py-8 bg-neutral-100 dark:bg-dark-bg">
      <Button
        variant="outline"
        size="lg"
        onClick={() => router.back()}
        className="mb-10 font-bold border-[#F6C445] text-[#F6C445] hover:bg-[#F6C445] hover:text-white dark:text-neutral-100 dark:border-neutral-100 dark:hover:bg-neutral-100 dark:hover:text-dark-bg"
      >
        ← Retour
      </Button>

      <form
        onSubmit={handleSubmit}
        className="max-w-2xl mx-auto space-y-8 bg-white dark:bg-dark-card shadow-lg rounded-2xl p-8 border border-neutral-200 dark:border-neutral-700"
      >
        {/* Messages de feedback */}
        {error && (
          <div className="flex items-center gap-2 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
          </div>
        )}

        {successMessage && (
          <div className="flex items-center gap-2 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
            <Check className="w-5 h-5 text-green-500" />
            <p className="text-green-600 dark:text-green-400 text-sm">{successMessage}</p>
          </div>
        )}

        {/* Section Images Améliorée */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-200">
              Images du produit
            </h3>
            <span className="text-sm text-neutral-500 bg-neutral-100 dark:bg-neutral-800 px-2 py-1 rounded-full">
              {images.length} image{images.length > 1 ? 's' : ''}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {images.map((imageItem, idx) => (
              <div
                key={idx}
                className="relative w-full aspect-square group rounded-xl overflow-hidden border-2 border-neutral-200 dark:border-neutral-700 shadow-sm hover:shadow-md transition-all"
              >
                <Image
                  src={imageItem.url}
                  alt={`Image ${idx + 1}`}
                  fill
                  className="object-cover"
                />

                {/* Overlay d'upload */}
                {imageItem.isUploading && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <div className="text-center text-white">
                      <Loader2 className="animate-spin w-8 h-8 mx-auto mb-2" />
                      <p className="text-xs">Upload...</p>
                    </div>
                  </div>
                )}

                {/* Badge original/nouvelle */}
                <div className="absolute top-2 left-2">
                  {imageItem.isOriginal ? (
                    <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                      Original
                    </span>
                  ) : (
                    <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                      Nouvelle
                    </span>
                  )}
                </div>

                {/* Boutons d'action */}
                {!imageItem.isUploading && (
                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition">
                    <label
                      htmlFor={`replace-${idx}`}
                      className="bg-yellow-500 hover:bg-yellow-600 text-white p-1.5 rounded-full cursor-pointer transition"
                      title="Remplacer cette image"
                    >
                      <Edit3 size={14} />
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
                      className="bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-full transition"
                      title="Supprimer cette image"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}
              </div>
            ))}

            {/* Bouton ajouter nouvelle image */}
            {images.length < 6 && (
              <label
                htmlFor="add-image"
                className="cursor-pointer flex flex-col items-center justify-center w-full aspect-square rounded-xl border-2 border-dashed border-neutral-300 dark:border-neutral-700 hover:border-[#F6C445] hover:bg-[#F6C445]/5 transition bg-neutral-50 dark:bg-dark-bg group"
              >
                <Upload className="w-8 h-8 text-neutral-400 group-hover:text-[#F6C445] transition mb-2" />
                <span className="text-sm text-neutral-500 group-hover:text-[#F6C445] transition font-medium">
                  Ajouter une image
                </span>
                <input
                  id="add-image"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => handleImageUpload(e)}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {images.length >= 6 && (
            <p className="text-sm text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg">
              Maximum 6 images par produit atteint
            </p>
          )}
        </div>

        {/* Informations produit */}
        <div className="space-y-5">
          <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-200">
            Informations du produit
          </h3>

          <div className="grid gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Titre du produit
              </label>
              <input
                type="text"
                placeholder="Titre du produit"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 border border-neutral-300 dark:border-neutral-700 dark:bg-dark-card dark:text-neutral-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F6C445] transition"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Prix (FCFA)
              </label>
              <input
                type="number"
                placeholder="Prix en FCFA"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full px-4 py-3 border border-neutral-300 dark:border-neutral-700 dark:bg-dark-card dark:text-neutral-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F6C445] transition"
                required
                min={0}
                step="0.01"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Description
              </label>
              <textarea
                placeholder="Description détaillée de votre produit..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-3 border border-neutral-300 dark:border-neutral-700 dark:bg-dark-card dark:text-neutral-100 rounded-xl h-32 resize-none focus:outline-none focus:ring-2 focus:ring-[#F6C445] transition"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Numéro WhatsApp
              </label>
              <input
                type="tel"
                placeholder="+221XXXXXXXXX"
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                className="w-full px-4 py-3 border border-neutral-300 dark:border-neutral-700 dark:bg-dark-card dark:text-neutral-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F6C445] transition"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Catégorie
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-3 border border-neutral-300 dark:border-neutral-700 dark:bg-dark-card dark:text-neutral-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F6C445] transition"
                required
              >
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Boutons d'action */}
        <div className="flex gap-4 pt-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 font-semibold py-3 rounded-xl hover:bg-neutral-300 dark:hover:bg-neutral-600 transition"
          >
            Annuler
          </button>

          <button
            type="submit"
            disabled={loading || images.some(img => img.isUploading) || !hasChanges()}
            className="flex-1 bg-gradient-to-r from-[#F6C445] to-[#FFD700] text-[#1C2B49] font-semibold py-3 rounded-xl shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-95 transition disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="animate-spin w-4 h-4" />
                Modification en cours...
              </span>
            ) : !hasChanges() ? (
              'Aucune modification'
            ) : (
              '✅ Enregistrer les modifications'
            )}
          </button>
        </div>

        {/* Indicateur de modifications */}
        {hasChanges() && (
          <div className="text-center text-sm text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 p-3 rounded-lg">
            🟡 Vous avez des modifications non sauvegardées
          </div>
        )}
      </form>
    </div>
  )
}