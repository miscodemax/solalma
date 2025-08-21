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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-4 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header avec bouton retour */}
        <div className="mb-6 sm:mb-8">
          <Button
            variant="outline"
            size="lg"
            onClick={() => router.back()}
            className="mb-4 border-[#D29587] text-[#D29587] font-semibold hover:bg-[#F7ECEA] hover:dark:bg-[#1a1a1a] transition-all duration-200 px-6 py-3"
          >
            ← Retour
          </Button>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Ajouter un produit
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
            Remplissez les informations pour mettre votre produit en vente
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8 sm:space-y-10">
          {/* Messages d'erreur/succès */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
              <p className="text-red-700 dark:text-red-400 text-center font-medium">{error}</p>
            </div>
          )}
          {success && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4">
              <p className="text-green-700 dark:text-green-400 text-center font-medium">
                ✅ Produit ajouté avec succès !
              </p>
            </div>
          )}

          {/* Section Photos */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 sm:p-8">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-4 sm:mb-6">
              📸 Photos du produit
            </h2>

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
                  <h3 className="text-md font-medium text-gray-700 dark:text-gray-300">
                    Images ajoutées ({images.length}/5)
                  </h3>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {images.map((imageUrl, index) => (
                      <div key={index} className="relative group">
                        <div className="relative aspect-square">
                          <Image
                            src={imageUrl}
                            alt={`Produit ${index + 1}`}
                            fill
                            className="rounded-lg object-cover border border-gray-200 dark:border-gray-600"
                          />

                          {/* Badge image principale */}
                          {index === 0 && (
                            <div className="absolute top-2 left-2 bg-[#D29587] text-white text-xs px-2 py-1 rounded-full font-medium">
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
                                  className="bg-[#D29587] text-white p-2 rounded-full hover:bg-[#bb7d72] transition-colors"
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
                                className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
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
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 sm:p-8">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-6 sm:mb-8">
              ℹ️ Informations générales
            </h2>

            <div className="space-y-6 sm:space-y-8">
              {/* Titre */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Titre du produit *
                </label>
                <HoverCard>
                  <HoverCardTrigger asChild>
                    <input
                      name="title"
                      type="text"
                      placeholder="Ex: Robe Wax taille M"
                      value={form.title}
                      onChange={handleChange}
                      className="w-full px-4 py-4 text-base border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D29587] focus:border-transparent transition-all duration-200"
                      required
                    />
                  </HoverCardTrigger>
                  <HoverCardContent className="w-64 text-sm text-gray-700 dark:text-gray-300">
                    Donnez un nom clair à votre produit. Ex : <strong>Robe Wax taille M</strong>
                  </HoverCardContent>
                </HoverCard>
              </div>

              {/* Catégorie */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Catégorie *
                </label>
                <HoverCard>
                  <HoverCardTrigger asChild>
                    <div className="relative">
                      <select
                        name="category"
                        value={form.category}
                        onChange={handleChange}
                        className="w-full appearance-none px-4 py-4 text-base border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D29587] focus:border-transparent transition-all duration-200"
                        required
                      >
                        {categories.map((cat) => (
                          <option key={cat.value} value={cat.value}>
                            {cat.label}
                          </option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-gray-400 dark:text-gray-500">
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </HoverCardTrigger>
                  <HoverCardContent className="w-64 text-sm text-gray-700 dark:text-gray-300">
                    Choisissez la catégorie qui décrit le mieux votre produit.
                  </HoverCardContent>
                </HoverCard>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Description *
                </label>
                <HoverCard>
                  <HoverCardTrigger asChild>
                    <textarea
                      name="description"
                      placeholder="Décrivez votre produit en détail : matières, couleurs, état, taille, conseils d'entretien..."
                      value={form.description}
                      onChange={handleChange}
                      className="w-full px-4 py-4 text-base border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-xl h-32 sm:h-40 resize-none focus:outline-none focus:ring-2 focus:ring-[#D29587] focus:border-transparent transition-all duration-200"
                      required
                    />
                  </HoverCardTrigger>
                  <HoverCardContent className="w-64 text-sm text-gray-700 dark:text-gray-300">
                    Décrivez les avantages, matériaux, tailles ou instructions d'entretien.
                  </HoverCardContent>
                </HoverCard>
              </div>
            </div>
          </div>

          {/* Section Prix et Contact */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 sm:p-8">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-6 sm:mb-8">
              💰 Prix et contact
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
              {/* Prix */}
              <div className="sm:col-span-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Prix en FCFA *
                </label>
                <HoverCard>
                  <HoverCardTrigger asChild>
                    <div className="relative">
                      <input
                        name="price"
                        type="number"
                        placeholder="2500"
                        value={form.price}
                        onChange={handleChange}
                        className="w-full pl-4 pr-16 py-4 text-base border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D29587] focus:border-transparent transition-all duration-200"
                        required
                        min="0"
                        step="any"
                      />
                      <div className="absolute inset-y-0 right-4 flex items-center text-gray-500 dark:text-gray-400 text-sm font-medium">
                        FCFA
                      </div>
                    </div>
                  </HoverCardTrigger>
                  <HoverCardContent className="w-64 text-sm text-gray-700 dark:text-gray-300">
                    Indiquez un prix réaliste en FCFA. Ne mettez que les chiffres (ex : 2500).
                  </HoverCardContent>
                </HoverCard>
              </div>

              {/* WhatsApp */}
              <div className="sm:col-span-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Numéro WhatsApp *
                </label>
                <HoverCard>
                  <HoverCardTrigger asChild>
                    <div className="flex border border-gray-300 dark:border-gray-600 rounded-xl focus-within:ring-2 focus-within:ring-[#D29587] focus-within:border-transparent transition-all duration-200">
                      <div className="flex items-center px-4 py-4 bg-gray-50 dark:bg-gray-600 text-[#D29587] font-semibold rounded-l-xl border-r border-gray-300 dark:border-gray-600">
                        +221
                      </div>
                      <input
                        name="whatsappNumber"
                        type="tel"
                        placeholder="771234567"
                        value={form.whatsappNumber}
                        onChange={handleWhatsappChange}
                        className="flex-1 px-4 py-4 text-base bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-r-xl focus:outline-none"
                        required
                        maxLength={9}
                        pattern="\d{8,9}"
                        title="Entrez le numéro après +221, uniquement chiffres (8 à 9 chiffres)"
                      />
                    </div>
                  </HoverCardTrigger>
                  <HoverCardContent className="w-64 text-sm text-gray-700 dark:text-gray-300">
                    Ce numéro sera utilisé pour contacter l'acheteur sur WhatsApp.
                  </HoverCardContent>
                </HoverCard>
              </div>
            </div>
          </div>

          {/* Bouton de soumission */}
          <div className="sticky bottom-0 bg-gray-50 dark:bg-gray-900 pb-4 pt-6 -mx-4 px-4 sm:static sm:bg-transparent sm:dark:bg-transparent sm:pb-0 sm:pt-0 sm:mx-0 sm:px-0">
            <button
              type="submit"
              disabled={loading || images.length === 0}
              className="w-full bg-[#D29587] text-white font-semibold py-4 px-6 text-lg rounded-xl hover:bg-[#bb7d72] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Ajout en cours...
                </div>
              ) : (
                'Publier mon produit'
              )}
            </button>

            <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
              {success ? 'Redirection dans un instant…' : 'En publiant, vous acceptez nos conditions d\'utilisation ✨'}
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}