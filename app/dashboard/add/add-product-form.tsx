'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '../../../lib/supabase'

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

export default function AddProductForm({ userId }: Props) {
    const [title, setTitle] = useState('')
    const [price, setPrice] = useState('')
    const [description, setDescription] = useState('')
    const [imageUrl, setImageUrl] = useState('')
    const [whatsappNumber, setWhatsappNumber] = useState('')
    const [category, setCategory] = useState(categories[0].value)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')
        setSuccess(false)

        // Simple validation Whatsapp (optionnel)
        if (!whatsappNumber.match(/^\+?\d{8,15}$/)) {
            setLoading(false)
            setError('Veuillez entrer un numéro WhatsApp valide (ex: +221771234567)')
            return
        }

        const { error } = await supabase.from('product').insert({
            title,
            price: parseFloat(price),
            description,
            image_url: imageUrl,
            user_id: userId,
            whatsapp_number: whatsappNumber,
            category,
        })

        setLoading(false)

        if (error) {
            setError(error.message)
        } else {
            setSuccess(true)
            setTimeout(() => {
                router.push('/dashboard/products')
            }, 1000)
        }
    }

    return (
        <div className="animate-fade-in max-w-xl mx-auto">
            <Button
                variant="outline"
                size="lg"
                onClick={() => router.back()}
                className="mb-8 border-[#D29587] text-[#D29587] font-semibold hover:bg-[#F7ECEA] transition"
            >
                ← Retour
            </Button>

            <form
                onSubmit={handleSubmit}
                className="bg-white border border-[#EDE9E3] shadow-xl rounded-3xl p-10 space-y-6"
            >
                {error && (
                    <p className="text-red-500 text-center font-medium">{error}</p>
                )}
                {success && (
                    <p className="text-green-600 text-center font-medium">
                        ✅ Produit ajouté avec succès !
                    </p>
                )}

                <div className="flex flex-col items-center gap-4">
                    <ImageUploader onUpload={setImageUrl} />
                    {imageUrl && (
                        <Image
                            src={imageUrl}
                            alt="Aperçu du produit"
                            width={300}
                            height={300}
                            className="rounded-xl object-cover border border-[#DAD5CD]"
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
                        placeholder="Prix (en FCFA) - Ex: 1500"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        className="w-full px-4 py-3 border border-[#DAD5CD] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D29587] transition"
                        required
                        min="0"
                        step="any"
                    />

                    <textarea
                        placeholder="Description détaillée..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full px-4 py-3 border border-[#DAD5CD] rounded-xl h-32 resize-none focus:outline-none focus:ring-2 focus:ring-[#D29587] transition"
                        required
                    />

                    <input
                        type="text"
                        placeholder="Numéro WhatsApp (ex: +221771234567)"
                        value={whatsappNumber}
                        onChange={(e) => setWhatsappNumber(e.target.value)}
                        className="w-full px-4 py-3 border border-[#DAD5CD] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D29587] transition"
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
                    className="w-full bg-[#D29587] text-white font-semibold py-3 rounded-xl hover:bg-[#bb7d72] disabled:opacity-50 transition"
                >
                    {loading ? 'Ajout en cours...' : 'Ajouter le produit'}
                </button>

                <p className="text-center text-xs text-[#A6A6A6] italic mt-2">
                    {success ? 'Redirection dans un instant…' : 'Un pas de plus vers une vitrine stylée ✨'}
                </p>
            </form>
        </div>
    )
}
