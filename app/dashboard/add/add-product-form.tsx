'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import Image from 'next/image'
import ImageUploader from './imageuploader'
import { Button } from '@/components/ui/button'

// --- Ajout d'un composant HoverCard UX ---
function HoverCard({ children, text }: { children: React.ReactNode; text: string }) {
  return (
    <span className="group relative inline-block">
      {children}
      <span className="pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity absolute z-50 left-1/2 -translate-x-1/2 mt-2 w-max max-w-xs bg-[#fff] dark:bg-[#222] text-[#1E1E1E] dark:text-[#FFF] text-sm px-4 py-2 rounded-xl shadow-lg border border-[#EDE9E3] dark:border-[#444]">
        {text}
      </span>
    </span>
  )
}

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
      setError('Veuillez entrer un numéro WhatsApp valide (ex: +221771234567)')
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

  return (
    <div className="animate-fade-in max-w-xl mx-auto dark:bg-black">
      <Button
        variant="outline"
        size="lg"
        onClick={() => router.back()}
        className="mb-8 border-[#D29587] text-[#D29587] font-semibold hover:bg-[#F7ECEA] hover:dark:bg-[#1a1a1a] transition"
        type="button"
      >
        ← Retour
      </Button>

      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-[#121212] border border-[#EDE9E3] dark:border-[#333] shadow-xl rounded-3xl p-10 space-y-6"
        autoComplete="off"
      >
        {error && <p className="text-red-500 text-center font-medium">{error}</p>}
        {success && (
          <p className="text-green-500 dark:text-green-400 text-center font-medium">
            ✅ Produit ajouté avec succès !
          </p>
        )}

        {/* Image uploader avec HoverCard */}
        <div className="flex flex-col items-center gap-4">
          <HoverCard text="Ajoute une belle photo, elle attire l’œil et donne confiance à l’acheteur ✨">
            <div>
              <ImageUploader onUpload={(url) => setForm((prev) => ({ ...prev, imageUrl: url }))} />
            </div>
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

        <div className="space-y-4">
          {/* Title HoverCard */}
          <HoverCard text="Donne un nom accrocheur à ton produit.">
            <input
              name="title"
              type="text"
              placeholder="Titre du produit"
              value={form.title}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-[#DAD5CD] dark:border-[#444] bg-white dark:bg-[#1A1A1A] text-gray-800 dark:text-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D29587] transition"
              required
            />
          </HoverCard>

          {/* Prix HoverCard */}
          <HoverCard text="Indique le prix en FCFA (par exemple : 1500). Sois juste et précis !">
            <input
              name="price"
              type="number"
              placeholder="Prix (en FCFA) - Ex: 1500"
              value={form.price}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-[#DAD5CD] dark:border-[#444] bg-white dark:bg-[#1A1A1A] text-gray-800 dark:text-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D29587] transition"
              required
              min="0"
              step="any"
            />
          </HoverCard>

          {/* Description HoverCard */}
          <HoverCard text="Décris ton produit : composition, taille, couleur, usage, conseils… Sois rassurant(e) et précis(e) !">
            <textarea
              name="description"
              placeholder="Description détaillée… soyez le plus clair possible pour mettre l'acheteur en confiance !"
              value={form.description}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-[#DAD5CD] dark:border-[#444] bg-white dark:bg-[#1A1A1A] text-gray-800 dark:text-gray-100 rounded-xl h-32 resize-none focus:outline-none focus:ring-2 focus:ring-[#D29587] transition"
              required
            />
          </HoverCard>

          {/* Whatsapp HoverCard */}
          <HoverCard text="Ton numéro WhatsApp pour être contacté rapidement (8 à 9 chiffres après +221).">
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
                pattern="\d{8,9}"
                title="Entrez le numéro après +221, uniquement chiffres (8 à 9 chiffres)"
              />
            </div>
          </HoverCard>

          {/* Catégorie HoverCard */}
          <HoverCard text="Choisis la catégorie la plus adaptée pour que ton produit soit facilement trouvé.">
            <div className="relative">
              <label
                htmlFor="category"
                className={`absolute left-4 top-3 text-sm dark:text-[#A6A6A6] text-[#A6A6A6] transition-all duration-200 ${form.category ? 'text-xs -top-2 bg-white dark:bg-[#121212] px-1 text-[#D29587]' : ''
                  }`}
              >
                Catégorie
              </label>
              <select
                id="category"
                name="category"
                value={form.category}
                onChange={handleChange}
                className="w-full appearance-none px-4 pt-6 pb-3 border border-[#DAD5CD] dark:border-[#444] bg-white dark:bg-[#1A1A1A] text-gray-700 dark:text-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D29587] transition"
                required
              >
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-gray-400 dark:text-gray-500">
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </HoverCard>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#D29587] text-white font-semibold py-3 rounded-xl hover:bg-[#bb7d72] disabled:opacity-50 transition"
        >
          {loading ? 'Ajout en cours...' : 'Ajouter le produit'}
        </button>

        <p className="text-center text-xs text-[#A6A6A6] dark:text-[#888] italic mt-2">
          {success ? 'Redirection dans un instant…' : 'Un pas de plus vers une vitrine stylée ✨'}
        </p>
      </form>
    </div>
  )
}