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
]

export default function AddProductForm({ userId }: Props) {
  const [form, setForm] = useState({
    title: '',
    price: '',
    description: '',
    imageUrl: '',
    whatsappNumber: '',
    category: categories[0].value,
  })

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess(false)

    const fullNumber = '+221' + form.whatsappNumber.trim()

    if (!/^\+221\d{8,9}$/.test(fullNumber)) {
      setError('Veuillez entrer un numéro WhatsApp valide (ex: +221771234567)')
      return
    }

    if (!form.imageUrl) {
      setError('Veuillez d\'abord téléverser une image.')
      return
    }

    setLoading(true)

    const { error } = await supabase.from('product').insert({
      title: form.title.trim(),
      price: parseFloat(form.price),
      description: form.description.trim(),
      image_url: form.imageUrl,
      user_id: userId,
      whatsapp_number: fullNumber,
      category: form.category,
    })

    setLoading(false)

    if (error) {
      setError(error.message)
    } else {
      setSuccess(true)
      setTimeout(() => router.push('/dashboard/products'), 1000)
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
            <div className="flex flex-col items-center gap-6">
              <ImageUploader onUpload={(url) => setForm((prev) => ({ ...prev, imageUrl: url }))} />
              {form.imageUrl && (
                <div className="w-full max-w-md">
                  <Image
                    src={form.imageUrl}
                    alt="Aperçu du produit"
                    width={400}
                    height={400}
                    className="w-full rounded-xl object-cover border border-gray-200 dark:border-gray-600 shadow-sm"
                  />
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
              disabled={loading}
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