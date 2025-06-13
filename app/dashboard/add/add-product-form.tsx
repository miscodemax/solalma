'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import Image from 'next/image'
import ImageUploader from './imageuploader'
import { Button } from '@/components/ui/button'

type Props = {
  userId: string
}

const categories = [
  { value: 'vetement', label: 'Vêtement' },
  { value: 'soins_et_astuces', label: 'Soins et astuces' },
  { value: 'maquillage', label: 'Maquillage' },
  { value: 'artisanat', label: 'Artisanat (fait mains)' },
]

function HoverCard({
  children,
  text,
  className = '',
}: {
  children: React.ReactNode
  text: string
  className?: string
}) {
  return (
    <span className={`relative group ${className}`}>
      {children}
      <span className="pointer-events-none absolute left-1/2 top-full z-30 mt-2 w-max min-w-[180px] max-w-xs -translate-x-1/2 rounded-xl bg-white dark:bg-[#222] border border-[#EDE9E3] dark:border-[#333] px-4 py-2 text-sm text-[#1E1E1E] dark:text-white shadow-xl opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-200">
        {text}
      </span>
    </span>
  )
}

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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
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
      setError('Numéro WhatsApp invalide. Format attendu : +221771234567')
      return
    }

    if (!form.imageUrl) {
      setError('Veuillez d’abord téléverser une image.')
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

  const isFormValid = () =>
    form.title && form.price && form.description && form.whatsappNumber && form.imageUrl

  return (
    <div className="animate-fade-in max-w-xl mx-auto dark:bg-black">
      <Button
        variant="outline"
        size="lg"
        onClick={() => router.back()}
        className="mb-8 border-[#D29587] text-[#D29587] font-semibold hover:bg-[#F7ECEA] hover:dark:bg-[#1a1a1a] transition"
      >
        ← Retour
      </Button>

      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-[#121212] border border-[#EDE9E3] dark:border-[#333] shadow-xl rounded-3xl p-10 space-y-6"
      >
        {error && (
          <p className="text-red-500 text-center font-semibold border border-red-300 dark:border-red-800 rounded-md p-2 bg-red-50 dark:bg-red-950">
            ⚠️ {error}
          </p>
        )}
        {success && (
          <p className="text-green-600 dark:text-green-400 text-center font-semibold border border-green-300 dark:border-green-800 rounded-md p-2 bg-green-50 dark:bg-green-950">
            ✅ Produit ajouté avec succès !
          </p>
        )}

        {/* Image uploader */}
        <div className="flex flex-col items-center gap-4">
          <HoverCard text="Ajoutez une photo de qualité, elle attire les acheteurs et inspire confiance.">
            <ImageUploader onUpload={(url) => setForm((prev) => ({ ...prev, imageUrl: url }))} />
          </HoverCard>
          {form.imageUrl && (
            <Image
              src={form.imageUrl}
              alt="Aperçu du produit"
              width={300}
              height={300}
              className="rounded-xl object-cover border border-[#DAD5CD] dark:border-[#444]"
            />
          )}
        </div>

        {/* Champs texte */}
        <div className="space-y-4">
          <HoverCard text="Nom clair et accrocheur du produit.">
            <input
              name="title"
              type="text"
              placeholder="Titre du produit"
              value={form.title}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-[#DAD5CD] dark:border-[#444] bg-white dark:bg-[#1A1A1A] text-gray-800 dark:text-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D29587] transition"
              required
              autoFocus
            />
          </HoverCard>

          <HoverCard text="Indiquez le prix en FCFA.">
            <input
              name="price"
              type="number"
              placeholder="Prix (en FCFA) - Ex: 1500"
              value={form.price}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-[#DAD5CD] dark:border-[#444] bg-white dark:bg-[#1A1A1A] text-gray-800 dark:text-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D29587] transition"
              required
              min={0}
              step="any"
            />
          </HoverCard>

          <HoverCard text="Décrivez votre produit (taille, couleur, conseils…).">
            <textarea
              name="description"
              placeholder="Description détaillée…"
              value={form.description}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-[#DAD5CD] dark:border-[#444] bg-white dark:bg-[#1A1A1A] text-gray-800 dark:text-gray-100 rounded-xl h-32 resize-none focus:outline-none focus:ring-2 focus:ring-[#D29587] transition"
              required
            />
          </HoverCard>

          <HoverCard text="Numéro WhatsApp (8 à 9 chiffres après +221).">
            <div className="flex items-center border border-[#DAD5CD] dark:border-[#444] rounded-xl focus-within:ring-2 focus-within:ring-[#D29587] transition">
              <span className="px-4 py-3 bg-[#F7ECEA] dark:bg-[#2A2A2A] text-[#D29587] font-semibold rounded-l-xl select-none">
                +221
              </span>
              <input
                name="whatsappNumber"
                type="tel"
                placeholder="771234567"
                value={form.whatsappNumber}
                onChange={handleWhatsappChange}
                className="flex-grow px-4 py-3 rounded-r-xl bg-white dark:bg-[#1A1A1A] text-gray-800 dark:text-gray-100 focus:outline-none"
                required
                maxLength={9}
              />
            </div>
          </HoverCard>

          <HoverCard text="Choisissez la catégorie du produit.">
            <select
              id="category"
              name="category"
              value={form.category}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-[#DAD5CD] dark:border-[#444] bg-white dark:bg-[#1A1A1A] text-gray-700 dark:text-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D29587] transition"
              required
            >
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </HoverCard>
        </div>

        <Button
          type="submit"
          disabled={loading || !isFormValid()}
          className="w-full bg-[#D29587] text-white font-semibold py-3 rounded-xl hover:bg-[#bb7d72] disabled:opacity-50 transition"
        >
          {loading ? 'Ajout en cours...' : 'Ajouter le produit'}
        </Button>

        <p className="text-center text-xs text-[#A6A6A6] dark:text-[#888] italic mt-2">
          {success ? 'Redirection en cours…' : 'Un pas de plus vers une vitrine stylée ✨'}
        </p>
      </form>
    </div>
  )
}
