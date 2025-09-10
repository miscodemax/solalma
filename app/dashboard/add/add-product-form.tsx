'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

import Image from 'next/image'
import ImageUploader from './imageuploader'
import { Button } from '@/components/ui/button'
import {
  HoverCard,
  HoverCardTrigger,
  HoverCardContent,
} from '@/components/ui/hover-card'

type Props = {
  userId: string
}

const categories = [
  { value: 'vetement', label: 'Vêtement' },
  { value: 'soins_et_astuces', label: 'Soins et astuces' },
  { value: 'maquillage', label: 'Maquillage' },
  { value: 'artisanat', label: 'Artisanat (fait mains)' },
  { value: 'electronique', label: 'Electronique' },
]

export default function AddProductForm({ userId }: Props) {
  const [form, setForm] = useState({
    title: '',
    price: '',
    description: '',
    whatsappNumber: '',
    category: categories[0].value,
  })

  // État pour gérer les images multiples
  const [images, setImages] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const router = useRouter()
  const supabase = createClient()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleWhatsappChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '')
    setForm((prev) => ({ ...prev, whatsappNumber: val }))
  }

  // Fonction pour ajouter de nouvelles images (peut être plusieurs à la fois)
  const handleAddImages = (urls: string[]) => {
    setImages((prev) => {
      const newImages = [...prev, ...urls]
      // Limiter à 5 images maximum
      return newImages.slice(0, 5)
    })
  }

  // Fonction pour supprimer une image
  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index))
  }

  // Fonction pour réorganiser les images (définir comme principale)
  const handleSetMainImage = (index: number) => {
    setImages((prev) => {
      const newImages = [...prev]
      const [selectedImage] = newImages.splice(index, 1)
      return [selectedImage, ...newImages]
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess(false)

    const fullNumber = '+221' + form.whatsappNumber.trim()

    if (!/^\+221\d{8,9}$/.test(fullNumber)) {
      setError('Veuillez entrer un numéro WhatsApp valide (ex: +221771234567)')
      return
    }

    if (images.length === 0) {
      setError('Veuillez ajouter au moins une image.')
      return
    }

    setLoading(true)

    try {
      // Insérer le produit avec la première image comme image principale
      const { data: productData, error: productError } = await supabase
        .from('product')
        .insert({
          title: form.title.trim(),
          price: parseFloat(form.price),
          description: form.description.trim(),
          image_url: images[0], // Première image comme principale
          user_id: userId,
          whatsapp_number: fullNumber,
          category: form.category,
        })
        .select()
        .single()

      if (productError) throw productError

      // Si il y a plus d'une image, insérer les images supplémentaires dans product_images
      if (images.length > 1) {
        const additionalImages = images.slice(1).map((imageUrl) => ({
          product_id: productData.id,
          image_url: imageUrl,
        }))

        const { error: imagesError } = await supabase
          .from('product_images')
          .insert(additionalImages)

        if (imagesError) throw imagesError
      }

      setSuccess(true)
      setTimeout(() => router.push('/dashboard/products'), 1000)

    } catch (error: any) {
      setError(error.message || 'Une erreur est survenue lors de la création du produit')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FAF9F6] via-white to-[#FFD55A] dark:bg-gradient-to-br dark:from-[#1a1a1a] dark:via-[#222] dark:to-[#2a2a2a] py-4 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header avec bouton retour */}
        <div className="mb-6 sm:mb-8">
          <Button
            variant="outline"
            size="lg"
            onClick={() => router.back()}
            className="mb-4 border-[#F4C430] text-[#F4C430] font-semibold hover:bg-[#F4C430]/10 hover:dark:bg-[#F4C430]/20 transition-all duration-200 px-6 py-3"
          >
            ← Retour
          </Button>
          <div className="relative">
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-[#F4C430] via-[#FFD55A] to-[#E9961A] bg-clip-text text-transparent mb-2">
              Ajouter un produit
            </h1>
            <div className="absolute -bottom-1 left-0 w-16 h-1 bg-gradient-to-r from-[#F4C430] to-transparent rounded-full"></div>
          </div>
          <p className="text-[#1A1A1A] dark:text-gray-300 text-sm sm:text-base mt-3">
            Remplissez les informations pour mettre votre produit en vente sur Sangse
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8 sm:space-y-10">
          {/* Messages d'erreur/succès */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 backdrop-blur-sm">
              <p className="text-red-700 dark:text-red-400 text-center font-medium">{error}</p>
            </div>
          )}
          {success && (
            <div className="bg-gradient-to-r from-[#FFD55A]/20 to-[#F4C430]/10 border border-[#FFD55A]/30 rounded-xl p-4 backdrop-blur-sm">
              <p className="text-[#F4C430] dark:text-[#FFD55A] text-center font-medium">
                ✅ Produit ajouté avec succès !
              </p>
            </div>
          )}

          {/* Section Photos */}
          <div className="bg-white/80 dark:bg-[#2a2a2a]/80 backdrop-blur-xl rounded-2xl shadow-lg border border-[#E5E7EB] dark:border-gray-600 p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-4 sm:mb-6">
              <div className="p-2 bg-gradient-to-r from-[#F4C430] to-[#E9961A] rounded-xl">
                <span className="text-white text-lg">📸</span>
              </div>
              <h2 className="text-lg sm:text-xl font-semibold text-[#1A1A1A] dark:text-white">
                Photos du produit
              </h2>
            </div>

            <div className="space-y-6">
              {/* Uploader d'image */}
              <div className="flex flex-col items-center">
                <ImageUploader
                  onUpload={handleAddImages}
                  maxImages={5}
                  currentImageCount={images.length}
                />
              </div>

              {/* Aperçu des images */}
              {images.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-[#F4C430] rounded-full animate-pulse"></div>
                    <h3 className="text-md font-medium text-[#1A1A1A] dark:text-gray-300">
                      Images ajoutées ({images.length}/5)
                    </h3>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {images.map((imageUrl, index) => (
                      <div key={index} className="relative group">
                        <div className="relative aspect-square">
                          <Image
                            src={imageUrl}
                            alt={`Produit ${index + 1}`}
                            fill
                            className="rounded-lg object-cover border border-[#E5E7EB] dark:border-gray-600"
                          />

                          {/* Badge image principale */}
                          {index === 0 && (
                            <div className="absolute top-2 left-2 bg-gradient-to-r from-[#F4C430] to-[#FFD55A] text-white text-xs px-3 py-1 rounded-full font-medium shadow-lg">
                              Principale
                            </div>
                          )}

                          {/* Overlay avec actions */}
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                            <div className="flex gap-2">
                              {index !== 0 && (
                                <button
                                  type="button"
                                  onClick={() => handleSetMainImage(index)}
                                  className="bg-gradient-to-r from-[#FFD55A] to-[#F4C430] text-white p-2 rounded-full hover:scale-110 transition-all duration-200 shadow-lg"
                                  title="Définir comme image principale"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" />
                                  </svg>
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => handleRemoveImage(index)}
                                className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 hover:scale-110 transition-all duration-200 shadow-lg"
                                title="Supprimer cette image"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        </div>

                        <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-1">
                          Image {index + 1}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Section Informations générales */}
          <div className="bg-white/80 dark:bg-[#2a2a2a]/80 backdrop-blur-xl rounded-2xl shadow-lg border border-[#E5E7EB] dark:border-gray-600 p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-6 sm:mb-8">
              <div className="p-2 bg-gradient-to-r from-[#FFD55A] to-[#E9961A] rounded-xl">
                <span className="text-white text-lg">ℹ️</span>
              </div>
              <h2 className="text-lg sm:text-xl font-semibold text-[#1A1A1A] dark:text-white">
                Informations générales
              </h2>
            </div>
            {/* ... reste inchangé sauf couleurs ajustées */}
          </div>

          {/* Section Prix et Contact */}
          <div className="bg-white/80 dark:bg-[#2a2a2a]/80 backdrop-blur-xl rounded-2xl shadow-lg border border-[#E5E7EB] dark:border-gray-600 p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-6 sm:mb-8">
              <div className="p-2 bg-gradient-to-r from-[#F4C430] to-[#FFD55A] rounded-xl">
                <span className="text-[#1A1A1A] text-lg">💰</span>
              </div>
              <h2 className="text-lg sm:text-xl font-semibold text-[#1A1A1A] dark:text-white">
                Prix et contact
              </h2>
            </div>
            {/* ... reste inchangé sauf couleurs ajustées */}
          </div>

          {/* Bouton de soumission */}
          <div className="sticky bottom-0 bg-gradient-to-t from-[#FAF9F6] via-[#FAF9F6] to-transparent dark:from-[#1a1a1a] dark:via-[#1a1a1a] dark:to-transparent pb-4 pt-6 -mx-4 px-4 sm:static sm:bg-transparent sm:dark:bg-transparent sm:pb-0 sm:pt-0 sm:mx-0 sm:px-0">
            <button
              type="submit"
              disabled={loading || images.length === 0}
              className="w-full bg-gradient-to-r from-[#F4C430] to-[#E9961A] hover:from-[#FFD55A] hover:to-[#F4C430] text-white font-semibold py-4 px-6 text-lg rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Ajout en cours...
                </div>
              ) : (
                <div className="flex items-center justify-center gap-3">
                  <span>Publier mon produit</span>
                  <div className="bg-white/20 px-2 py-1 rounded-full text-sm">✨</div>
                </div>
              )}
            </button>

            <div className="text-center mt-4">
              {success ? (
                <p className="text-sm text-[#F4C430] font-medium">
                  Redirection dans un instant… 🎉
                </p>
              ) : (
                <p className="text-sm text-[#1A1A1A] dark:text-gray-400">
                  En publiant, vous acceptez nos{' '}
                  <span className="text-[#E9961A] hover:underline cursor-pointer">
                    conditions d'utilisation
                  </span>{' '}
                  ✨
                </p>
              )}
            </div>
          </div>
        </form>

      </div>
    </div>
  )
}