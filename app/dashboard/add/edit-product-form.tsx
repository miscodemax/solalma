'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import Image from 'next/image'
import ImageUploader from './imageuploader'
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
  const [images, setImages] = useState<string[]>(product.images || [])
  const [whatsappNumber, setWhatsappNumber] = useState(product.whatsapp_number || '')
  const [category, setCategory] = useState(product.category || categories[0].value)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!title.trim()) return setError('Le titre est requis.')
    if (!price || isNaN(Number(price)) || Number(price) <= 0) return setError('Prix invalide.')
    if (!description.trim()) return setError('La description est requise.')
    if (!/^\+?\d{7,15}$/.test(whatsappNumber)) return setError('Numéro WhatsApp invalide.')
    if (!category) return setError('Veuillez choisir une catégorie.')
    if (images.length === 0) return setError('Ajoutez au moins une image.')

    setLoading(true)

    const { error } = await supabase
      .from('product')
      .update({
        title: title.trim(),
        price: parseFloat(price),
        description: description.trim(),
        images,
        whatsapp_number: whatsappNumber,
        category,
      })
      .eq('id', product.id)

    setLoading(false)

    if (error) {
      setError(error.message)
    } else {
      router.push('/dashboard/products')
    }
  }

  const handleRemoveImage = (idx: number) => {
    setImages((prev) => prev.filter((_, i) => i !== idx))
  }

  return (
    <div className="min-h-screen px-4 py-8 bg-[#F9F6F1] dark:bg-black transition-colors duration-300">
      <Button
        variant="outline"
        size="lg"
        onClick={() => router.back()}
        className="mb-10 hover:bg-[#D29587] font-bold border-[#D29587] dark:text-white dark:border-white dark:hover:bg-white dark:hover:text-black"
      >
        Retour
      </Button>

      <form
        onSubmit={handleSubmit}
        className="max-w-xl mx-auto space-y-6 bg-white dark:bg-[#1a1a1a] shadow-lg rounded-2xl p-8 border border-[#E6E3DF] dark:border-gray-700 animate-fade-in"
      >
        {error && <p className="text-red-500 text-sm">{error}</p>}

        {/* Image Section */}
        <div className="flex flex-col items-center gap-6">
          <ImageUploader
            onUpload={(urls) => setImages((prev) => [...prev, ...urls])}
          />
          {images.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 w-full">
              {images.map((url, idx) => (
                <div key={idx} className="relative w-full aspect-square group rounded-xl overflow-hidden border border-[#E6E3DF] dark:border-gray-700 shadow-sm">
                  <Image
                    src={url}
                    alt={`Image ${idx + 1}`}
                    fill
                    className="object-cover rounded-xl transition-transform duration-300 group-hover:scale-105"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full opacity-0 group-hover:opacity-100 transition"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Titre du produit"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-3 border border-[#DAD5CD] dark:border-gray-700 dark:bg-[#2a2a2a] dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D29587] transition"
            required
          />
          <input
            type="number"
            placeholder="Prix (en FCFA)"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full px-4 py-3 border border-[#DAD5CD] dark:border-gray-700 dark:bg-[#2a2a2a] dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D29587] transition"
            required
            min={0}
            step="0.01"
          />
          <textarea
            placeholder="Description détaillée..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-3 border border-[#DAD5CD] dark:border-gray-700 dark:bg-[#2a2a2a] dark:text-white rounded-xl h-32 resize-none focus:outline-none focus:ring-2 focus:ring-[#D29587] transition"
            required
          />
          <input
            type="tel"
            placeholder="Numéro WhatsApp (+221...)"
            value={whatsappNumber}
            onChange={(e) => setWhatsappNumber(e.target.value)}
            className="w-full px-4 py-3 border border-[#DAD5CD] dark:border-gray-700 dark:bg-[#2a2a2a] dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D29587] transition"
            pattern="^\+?\d{7,15}$"
            title="Entrez un numéro WhatsApp valide, avec indicatif pays"
            required
          />
          <div className="relative">
            <label
              htmlFor="category"
              className={`absolute left-4 top-3 text-sm transition-all duration-200 ${category
                ? 'text-xs -top-2 bg-white dark:bg-[#1a1a1a] px-1 text-[#D29587]'
                : 'text-[#A6A6A6] dark:text-gray-400'
                }`}
            >
              Catégorie
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full appearance-none px-4 pt-6 pb-3 border border-[#DAD5CD] dark:border-gray-700 dark:bg-[#2a2a2a] dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D29587] transition"
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
                className="h-5 w-5 transform transition-transform duration-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#D29587] text-white font-semibold py-3 rounded-xl hover:bg-[#bb7d72] transition"
        >
          {loading ? 'Modification en cours...' : 'Modifier le produit'}
        </button>
      </form>
    </div>
  )
}
