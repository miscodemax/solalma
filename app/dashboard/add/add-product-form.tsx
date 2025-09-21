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

type Props = { userId: string }

const categories = [
  { value: 'vetement', label: 'Vêtement' },
  { value: 'soins_et_astuces', label: 'Soins et astuces' },
  { value: 'maquillage', label: 'Maquillage' },
  { value: 'artisanat', label: 'Artisanat (fait mains)' },
  { value: 'electronique', label: 'Electronique' },
]

const SENEGAL_LOCATIONS = [
  { name: "Dakar", lat: 14.6928, lng: -17.4467 },
  { name: "Plateau", lat: 14.6708, lng: -17.4395 },
  { name: "Médina", lat: 14.6765, lng: -17.4515 },
  { name: "Yoff", lat: 14.7539, lng: -17.4731 },
  { name: "Sacré-Coeur", lat: 14.7306, lng: -17.4640 },
  { name: "Almadies", lat: 14.7447, lng: -17.5264 },
  { name: "Ngor", lat: 14.7587, lng: -17.5180 },
  { name: "Ouakam", lat: 14.7289, lng: -17.4922 },
  { name: "Point E", lat: 14.7019, lng: -17.4644 },
  { name: "Mermoz", lat: 14.7089, lng: -17.4558 },
  { name: "Fann", lat: 14.7056, lng: -17.4739 },
  { name: "Liberté", lat: 14.7086, lng: -17.4656 },
  { name: "HLM", lat: 14.7085, lng: -17.4520 },
  { name: "Grand Dakar", lat: 14.7089, lng: -17.4495 },
  { name: "Pikine", lat: 14.7549, lng: -17.3985 },
  { name: "Guédiawaye", lat: 14.7692, lng: -17.4056 },
  { name: "Parcelles Assainies", lat: 14.7642, lng: -17.4314 },
  { name: "Rufisque", lat: 14.7167, lng: -17.2667 },
  { name: "Thiès", lat: 14.7886, lng: -16.9260 },
  { name: "Kaolack", lat: 14.1592, lng: -16.0729 },
  { name: "Saint-Louis", lat: 16.0179, lng: -16.4817 },
  { name: "Mbour", lat: 14.4198, lng: -16.9639 },
  { name: "Diourbel", lat: 14.6574, lng: -16.2335 },
  { name: "Ziguinchor", lat: 12.5681, lng: -16.2717 }
]

export default function AddProductForm({ userId }: Props) {
  const [form, setForm] = useState({
    title: '',
    price: '',
    description: '',
    whatsappNumber: '',
    category: categories[0].value,
    zone: SENEGAL_LOCATIONS[0].name,
  })
  const [latLng, setLatLng] = useState({ lat: SENEGAL_LOCATIONS[0].lat, lng: SENEGAL_LOCATIONS[0].lng })
  const [images, setImages] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const router = useRouter()
  const supabase = createClient()

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    if (name === 'zone') {
      const loc = SENEGAL_LOCATIONS.find((l) => l.name === value)
      if (loc) setLatLng({ lat: loc.lat, lng: loc.lng })
    }
  }

  const handleWhatsappChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '')
    setForm((prev) => ({ ...prev, whatsappNumber: val }))
  }

  const handleAddImages = (urls: string[]) => setImages((prev) => [...prev, ...urls].slice(0, 5))
  const handleRemoveImage = (index: number) => setImages((prev) => prev.filter((_, i) => i !== index))
  const handleSetMainImage = (index: number) => {
    setImages((prev) => {
      const newImages = [...prev]
      const [selected] = newImages.splice(index, 1)
      return [selected, ...newImages]
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
      const { data: productData, error: productError } = await supabase
        .from('product')
        .insert({
          title: form.title.trim(),
          price: parseFloat(form.price),
          description: form.description.trim(),
          image_url: images[0],
          user_id: userId,
          whatsapp_number: fullNumber,
          category: form.category,
          zone: form.zone,
          latitude: latLng.lat,
          longitude: latLng.lng,
        })
        .select()
        .single()
      if (productError) throw productError
      if (images.length > 1) {
        const additionalImages = images.slice(1).map((imageUrl) => ({ product_id: productData.id, image_url: imageUrl }))
        const { error: imagesError } = await supabase.from('product_images').insert(additionalImages)
        if (imagesError) throw imagesError
      }
      setSuccess(true)
      setTimeout(() => router.push('/dashboard/products'), 1000)
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue lors de la création du produit')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FAF9F6] via-white to-[#F4C430]/5 dark:bg-gradient-to-br dark:from-[#1a1a1a] dark:via-[#222] dark:to-[#2a2a2a] py-4 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 sm:mb-8">
          <Button
            variant="outline"
            size="lg"
            onClick={() => router.back()}
            className="mb-4 border-[#E9961A] text-[#E9961A] font-semibold hover:bg-[#E9961A]/10 hover:dark:bg-[#E9961A]/20 transition-all duration-200 px-6 py-3"
          >
            ← Retour
          </Button>
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-[#F4C430] via-[#E9961A] to-[#F4C430] bg-clip-text text-transparent mb-2">Ajouter un produit</h1>
          <p className="text-[#1A1A1A] dark:text-gray-300 text-sm sm:text-base mt-3">
            Remplissez les informations pour mettre votre produit en vente sur Sangse
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8 sm:space-y-10">
          {error && <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 text-center text-red-700 dark:text-red-400 font-medium">{error}</div>}
          {success && <div className="bg-gradient-to-r from-[#F4C430]/20 to-[#FFD55A]/10 border border-[#F4C430]/30 rounded-xl p-4 text-center text-[#E9961A] dark:text-[#F4C430] font-medium">✅ Produit ajouté avec succès !</div>}

          {/* Photos */}
          <div className="bg-white/80 dark:bg-[#2a2a2a]/80 backdrop-blur-xl rounded-2xl shadow-lg border border-[#F4C430]/20 dark:border-gray-600 p-6 sm:p-8">
            <h2 className="text-lg sm:text-xl font-semibold mb-4 text-[#1A1A1A] dark:text-white">📸 Photos du produit</h2>
            <ImageUploader onUpload={handleAddImages} maxImages={5} currentImageCount={images.length} />
            {images.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
                {images.map((img, idx) => (
                  <div key={idx} className="relative group">
                    <Image src={img} alt={`Produit ${idx + 1}`} fill className="rounded-lg object-cover border border-[#F4C430]/30 dark:border-gray-600" />
                    {idx === 0 && <div className="absolute top-2 left-2 bg-gradient-to-r from-[#F4C430] to-[#E9961A] text-[#1A1A1A] text-xs px-2 py-1 rounded-full font-medium shadow-lg">Principale</div>}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <div className="flex gap-2">
                        {idx !== 0 && <button type="button" onClick={() => handleSetMainImage(idx)} className="bg-gradient-to-r from-[#E9961A] to-[#F4C430] text-[#1A1A1A] p-2 rounded-full hover:scale-110 transition-all duration-200 shadow-lg">⭐</button>}
                        <button type="button" onClick={() => handleRemoveImage(idx)} className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 hover:scale-110 transition-all duration-200 shadow-lg">🗑️</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Informations générales */}
          <div className="bg-white/80 dark:bg-[#2a2a2a]/80 backdrop-blur-xl rounded-2xl shadow-lg border border-[#F4C430]/20 dark:border-gray-600 p-6 sm:p-8 space-y-6">
            <HoverCard>
              <HoverCardTrigger asChild>
                <input type="text" name="title" placeholder="Titre du produit" value={form.title} onChange={handleChange} className="w-full px-4 py-4 border border-[#F4C430]/30 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E9961A]" required />
              </HoverCardTrigger>
              <HoverCardContent>Ex: Robe Wax taille M</HoverCardContent>
            </HoverCard>

            <HoverCard>
              <HoverCardTrigger asChild>
                <select name="category" value={form.category} onChange={handleChange} className="w-full px-4 py-4 border border-[#F4C430]/30 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E9961A]">
                  {categories.map((cat) => <option key={cat.value} value={cat.value}>{cat.label}</option>)}
                </select>
              </HoverCardTrigger>
              <HoverCardContent>Choisissez la catégorie qui décrit le mieux votre produit</HoverCardContent>
            </HoverCard>

            <HoverCard>
              <HoverCardTrigger asChild>
                <select name="zone" value={form.zone} onChange={handleChange} className="w-full px-4 py-4 border border-[#F4C430]/30 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E9961A]">
                  {SENEGAL_LOCATIONS.map((loc) => <option key={loc.name} value={loc.name}>{loc.name}</option>)}
                </select>
              </HoverCardTrigger>
              <HoverCardContent>Votre localisation pour ce produit</HoverCardContent>
            </HoverCard>

            <HoverCard>
              <HoverCardTrigger asChild>
                <textarea name="description" value={form.description} onChange={handleChange} placeholder="Description du produit" className="w-full px-4 py-4 border border-[#F4C430]/30 dark:border-gray-600 rounded-xl h-32 resize-none focus:outline-none focus:ring-2 focus:ring-[#E9961A]" required />
              </HoverCardTrigger>
              <HoverCardContent>Décrivez les caractéristiques du produit, état, taille, couleurs…</HoverCardContent>
            </HoverCard>
          </div>

          {/* Prix & WhatsApp */}
          <div className="bg-white/80 dark:bg-[#2a2a2a]/80 backdrop-blur-xl rounded-2xl shadow-lg border border-[#F4C430]/20 dark:border-gray-600 p-6 sm:p-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <input type="number" name="price" placeholder="Prix en FCFA" value={form.price} onChange={handleChange} className="w-full px-4 py-4 border border-[#F4C430]/30 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E9961A]" required min={0} />
            <div className="flex border border-[#F4C430]/30 dark:border-gray-600 rounded-xl">
              <div className="px-4 py-4 bg-gradient-to-r from-[#F4C430]/20 to-[#E9961A]/20 rounded-l-xl">+221</div>
              <input type="tel" name="whatsappNumber" placeholder="771234567" value={form.whatsappNumber} onChange={handleWhatsappChange} className="flex-1 px-4 py-4 rounded-r-xl focus:outline-none" maxLength={9} required />
            </div>
          </div>

          {/* Bouton de soumission sticky */}
          <div className="sticky bottom-0 bg-gradient-to-t from-[#FAF9F6] via-[#FAF9F6] to-transparent dark:from-[#1a1a1a] dark:via-[#1a1a1a] dark:to-transparent pb-4 pt-6 sm:static sm:bg-transparent sm:pb-0 sm:pt-0">
            <button type="submit" disabled={loading || images.length === 0} className="w-full bg-gradient-to-r from-[#F4C430] to-[#E9961A] hover:from-[#E9961A] hover:to-[#F4C430] text-[#1A1A1A] font-semibold py-4 px-6 text-lg rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl">
              {loading ? 'Ajout en cours…' : 'Publier mon produit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
