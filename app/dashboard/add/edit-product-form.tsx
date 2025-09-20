'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import Image from 'next/image'
import { Loader2, Plus, X } from 'lucide-react'
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
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  const router = useRouter()
  const supabase = createClient()

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    setError('')
    const uploadedUrls: string[] = []

    for (const file of files) {
      if (file.size > 5 * 1024 * 1024) {
        setError(`${file.name} est trop volumineux (max 5MB).`)
        continue
      }
      if (!file.type.startsWith('image/')) {
        setError(`${file.name} n'est pas une image valide.`)
        continue
      }

      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('product')
        .upload(fileName, file)

      if (uploadError) {
        setError(uploadError.message)
        continue
      }

      const { data } = supabase.storage.from('product').getPublicUrl(fileName)
      uploadedUrls.push(data.publicUrl)
    }

    if (uploadedUrls.length > 0) {
      setImages((prev) => [...prev, ...uploadedUrls])
    }

    setUploading(false)
    e.target.value = ''
  }

  const handleRemoveImage = (idx: number) => {
    setImages((prev) => prev.filter((_, i) => i !== idx))
  }

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
        className="max-w-xl mx-auto space-y-6 bg-white dark:bg-dark-card shadow-lg rounded-2xl p-8 border border-neutral-200 dark:border-neutral-700"
      >
        {error && <p className="text-red-500 text-sm">{error}</p>}

        {/* Images Section */}
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {images.map((url, idx) => (
              <div
                key={idx}
                className="relative w-full aspect-square group rounded-xl overflow-hidden border border-neutral-200 dark:border-neutral-700 shadow-sm"
              >
                <Image
                  src={url}
                  alt={`Image ${idx + 1}`}
                  fill
                  className="object-cover rounded-xl"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(idx)}
                  className="absolute top-2 right-2 bg-black/60 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition"
                >
                  <X size={16} />
                </button>
              </div>
            ))}

            {/* Bouton ajout image */}
            <label
              htmlFor="upload-image"
              className="cursor-pointer flex items-center justify-center w-full aspect-square rounded-xl border-2 border-dashed border-neutral-300 dark:border-neutral-700 hover:border-[#F6C445] transition bg-neutral-50 dark:bg-dark-bg"
            >
              {uploading ? (
                <Loader2 className="animate-spin w-6 h-6 text-[#F6C445]" />
              ) : (
                <Plus className="w-8 h-8 text-neutral-500" />
              )}
              <input
                id="upload-image"
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
                disabled={uploading}
              />
            </label>
          </div>
        </div>

        {/* Infos produit */}
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Titre du produit"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-3 border border-neutral-300 dark:border-neutral-700 dark:bg-dark-card dark:text-neutral-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F6C445]"
            required
          />
          <input
            type="number"
            placeholder="Prix (en FCFA)"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full px-4 py-3 border border-neutral-300 dark:border-neutral-700 dark:bg-dark-card dark:text-neutral-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F6C445]"
            required
            min={0}
            step="0.01"
          />
          <textarea
            placeholder="Description détaillée..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-3 border border-neutral-300 dark:border-neutral-700 dark:bg-dark-card dark:text-neutral-100 rounded-xl h-32 resize-none focus:outline-none focus:ring-2 focus:ring-[#F6C445]"
            required
          />
          <input
            type="tel"
            placeholder="Numéro WhatsApp (+221...)"
            value={whatsappNumber}
            onChange={(e) => setWhatsappNumber(e.target.value)}
            className="w-full px-4 py-3 border border-neutral-300 dark:border-neutral-700 dark:bg-dark-card dark:text-neutral-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F6C445]"
            required
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-4 py-3 border border-neutral-300 dark:border-neutral-700 dark:bg-dark-card dark:text-neutral-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F6C445]"
            required
          >
            {categories.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        {/* Bouton submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-[#F6C445] to-[#FFD700] text-[#1C2B49] font-semibold py-3 rounded-xl shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-95 transition disabled:opacity-60"
        >
          {loading ? 'Modification en cours...' : '✅ Modifier le produit'}
        </button>
      </form>
    </div>
  )
}
