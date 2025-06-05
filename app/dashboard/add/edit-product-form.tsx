'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '../../../lib/supabase'

import Image from 'next/image'
import ImageUploader from './imageuploader'
import { Button } from '@/components/ui/button'

type Props = {
    product: {
        id: number
        title: string
        price: number
        description: string
        image_url: string
        whatsapp_number?: string
        category?: string
    }
}

const categories = [
    { label: 'Vêtements', value: 'vetement' },
    { label: 'Soins et astuces', value: 'soins-et-astuces' },
    { label: 'Maquillage', value: 'maquillage' },
    { label: 'Artisanat (fait main)', value: 'artisanat' },
]

export default function EditProductForm({ product }: Props) {
    const [title, setTitle] = useState(product.title)
    const [price, setPrice] = useState(product.price.toString())
    const [description, setDescription] = useState(product.description)
    const [imageUrl, setImageUrl] = useState(product.image_url)
    const [whatsappNumber, setWhatsappNumber] = useState(product.whatsapp_number || '')
    const [category, setCategory] = useState(product.category || categories[0].value)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const router = useRouter()
    const supabase = createClient()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        // Validation simple côté client
        if (!title.trim()) return setError('Le titre est requis.')
        if (!price || isNaN(Number(price)) || Number(price) <= 0) return setError('Prix invalide.')
        if (!description.trim()) return setError('La description est requise.')
        if (!whatsappNumber.match(/^\+?\d{7,15}$/)) return setError('Numéro WhatsApp invalide.')
        if (!category) return setError('Veuillez choisir une catégorie.')

        setLoading(true)

        const { error } = await supabase
            .from('product')
            .update({
                title: title.trim(),
                price: parseFloat(price),
                description: description.trim(),
                image_url: imageUrl,
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
        <div className='dark:bg-black'>
            <Button
                variant="outline"
                size="lg"
                onClick={() => router.back()}
                className="mb-10 hover:bg-[#D29587] font-bold border-[#D29587]"
            >
                Retour
            </Button>
            <form
                onSubmit={handleSubmit}
                className="max-w-xl mx-auto space-y-6 bg-white shadow-lg rounded-2xl p-8 border border-[#E6E3DF] animate-fade-in"
            >
                {error && <p className="text-red-500 text-sm">{error}</p>}

                <div className="w-full flex flex-col items-center gap-4">
                    <ImageUploader onUpload={setImageUrl} />
                    {imageUrl && (
                        <Image
                            src={imageUrl}
                            alt="Aperçu"
                            width={300}
                            height={300}
                            className="rounded-xl object-cover border border-[#E6E3DF]"
                        />
                    )}
                </div>

                <div className="space-y-4">
                    <input
                        type="text"
                        placeholder="Titre du produit"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full px-4 py-3 border border-[#DAD5CD] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D29587] transition"
                        required
                    />

                    <input
                        type="number"
                        placeholder="Prix (en FCFA)"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        className="w-full px-4 py-3 border border-[#DAD5CD] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D29587] transition"
                        required
                        min={0}
                        step="0.01"
                    />

                    <textarea
                        placeholder="Description détaillée..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full px-4 py-3 border border-[#DAD5CD] rounded-xl h-32 resize-none focus:outline-none focus:ring-2 focus:ring-[#D29587] transition"
                        required
                    />

                    <input
                        type="tel"
                        placeholder="Numéro WhatsApp (+221...)"
                        value={whatsappNumber}
                        onChange={(e) => setWhatsappNumber(e.target.value)}
                        className="w-full px-4 py-3 border border-[#DAD5CD] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D29587] transition"
                        pattern="^\+?\d{7,15}$"
                        title="Entrez un numéro WhatsApp valide, avec indicatif pays"
                        required
                    />

                    {/* --- Nouveau Select Stylisé --- */}
                    <div className="relative">
                        <label
                            htmlFor="category"
                            className={`absolute left-4 top-3 text-sm text-[#A6A6A6] transition-all duration-200 ${category ? 'text-xs -top-2 bg-white px-1 text-[#D29587]' : ''
                                }`}
                        >
                            Catégorie
                        </label>
                        <select
                            id="category"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full appearance-none px-4 pt-6 pb-3 border border-[#DAD5CD] rounded-xl bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#D29587] transition"
                            required
                        >
                            {categories.map((cat) => (
                                <option key={cat.value} value={cat.value}>
                                    {cat.label}
                                </option>
                            ))}
                        </select>
                        {/* Chevron down icon */}
                        <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-gray-400">
                            <svg
                                className="h-5 w-5 transform transition-transform duration-300"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M19 9l-7 7-7-7"
                                />
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

                <p className="text-center text-xs text-[#A6A6A6] italic mt-4">
                    Mise à jour réussie, inchallah 🙌
                </p>
            </form>
        </div>
    )
}
