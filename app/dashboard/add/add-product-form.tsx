'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import Image from 'next/image'
import ImageUploader from './imageuploader'
import { Button } from '@/components/ui/button'
import { ChevronLeft, Check, Camera, Tag, MapPin, FileText, DollarSign } from 'lucide-react'

type Props = { userId: string }

const categories = [
  { 
    value: 'vetement', 
    label: 'Vêtements', 
    icon: '👗', 
    color: 'from-amber-300 to-saffron-500' // jaune safran chaud
  },
  { 
    value: 'soins_et_astuces', 
    label: 'Soins & Astuces', 
    icon: '🧴', 
    color: 'from-rose-300 to-pink-500' // ton doux et féminin
  },
  { 
    value: 'maquillage', 
    label: 'Maquillage', 
    icon: '💋', 
    color: 'from-rose-400 to-amber-500' // mix glamour / chaleur
  },
  { 
    value: 'artisanat', 
    label: 'Artisanat', 
    icon: '🧶', 
    color: 'from-orange-300 to-amber-500' // teinte artisanale, terreuse
  },
  { 
    value: 'electronique', 
    label: 'Électronique', 
    icon: '💻', 
    color: 'from-cyan-400 to-blue-500' // moderne, technologique
  },
  { 
    value: 'accessoire', 
    label: 'Accessoires', 
    icon: '🕶️', 
    color: 'from-amber-400 to-yellow-500' // doré chic
  },
  { 
    value: 'chaussure', 
    label: 'Chaussures', 
    icon: '👠', 
    color: 'from-rose-400 to-red-500' // féminin & énergique
  },
  { 
    value: 'otaku', 
    label: 'Otaku', 
    icon: '🎌', 
    color: 'from-indigo-400 to-purple-500' // culture pop japonaise
  },
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
  const [currentStep, setCurrentStep] = useState(0)
  const [form, setForm] = useState({
    title: '',
    price: '',
    description: '',
    whatsappNumber: '',
    category: categories[0].value,
    zone: SENEGAL_LOCATIONS[0].name,
    hasWholesale: false,
    wholesalePrice: '',
    minWholesaleQty: ''
  })
  const [userLocation, setUserLocation] = useState<{ lat: number, lng: number } | null>(null)
  const [locationStatus, setLocationStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [images, setImages] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const getUserLocation = () => {
      if (!navigator.geolocation) {
        setLocationStatus('error')
        return
      }
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = { lat: position.coords.latitude, lng: position.coords.longitude }
          setUserLocation(coords)
          setLocationStatus('success')
        },
        () => setLocationStatus('error'),
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
      )
    }
    getUserLocation()
  }, [])

  const steps = [
    { title: 'Photos', icon: Camera, color: 'text-pink-500' },
    { title: 'Catégorie', icon: Tag, color: 'text-purple-500' },
    { title: 'Zone', icon: MapPin, color: 'text-blue-500' },
    { title: 'Détails', icon: FileText, color: 'text-green-500' },
    { title: 'Prix', icon: DollarSign, color: 'text-yellow-500' }
  ]

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      setForm((prev) => ({ ...prev, [name]: checked }))
    } else {
      setForm((prev) => ({ ...prev, [name]: value }))
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

  const canGoNext = () => {
    switch (currentStep) {
      case 0: return images.length > 0
      case 1: return form.category !== ''
      case 2: return form.zone !== ''
      case 3: return form.title.trim() !== '' && form.description.trim() !== ''
      case 4: {
        const baseValid = form.price !== '' && parseFloat(form.price) > 0 && form.whatsappNumber.length >= 8
        if (form.hasWholesale) {
          return baseValid && form.wholesalePrice !== '' && form.minWholesaleQty !== '' &&
            parseFloat(form.wholesalePrice) < parseFloat(form.price) &&
            parseInt(form.minWholesaleQty) > 1
        }
        return baseValid
      }
      default: return false
    }
  }

  const handleNext = () => {
    if (currentStep < steps.length - 1 && canGoNext()) setCurrentStep(currentStep + 1)
  }

  const handlePrevious = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess(false)

    if (!canGoNext()) {
      setError('Veuillez remplir tous les champs correctement')
      return
    }

    const fullNumber = '+221' + form.whatsappNumber.trim()
    if (!/^\+221\d{8,9}$/.test(fullNumber)) {
      setError('Numéro WhatsApp invalide')
      return
    }
    if (images.length === 0) {
      setError('Ajoutez au moins une image')
      return
    }
    if (form.hasWholesale) {
      if (parseFloat(form.wholesalePrice) >= parseFloat(form.price)) {
        setError('Le prix de gros doit être inférieur au prix unitaire')
        return
      }
      if (parseInt(form.minWholesaleQty) < 2) {
        setError('Quantité minimum : 2 unités')
        return
      }
    }

    setLoading(true)
    try {
      const selectedZone = SENEGAL_LOCATIONS.find(loc => loc.name === form.zone)
      const finalCoords = userLocation || (selectedZone ? { lat: selectedZone.lat, lng: selectedZone.lng } : SENEGAL_LOCATIONS[0])

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
          latitude: finalCoords.lat,
          longitude: finalCoords.lng,
          has_wholesale: form.hasWholesale,
          wholesale_price: form.hasWholesale ? parseFloat(form.wholesalePrice) : null,
          min_wholesale_qty: form.hasWholesale ? parseInt(form.minWholesaleQty) : null,
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
      setTimeout(() => router.push('/dashboard/products'), 1800)
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la création')
    } finally {
      setLoading(false)
    }
  }

  const getStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-4">
            <div className="text-center space-y-2 mb-6">
              <div className="text-5xl mb-2">📸</div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Ajoutez vos photos</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">De belles photos = plus de ventes</p>
            </div>

            <div className="rounded-2xl border-2 border-dashed border-[#F4B400]/40 p-6 bg-gradient-to-br from-[#F4B400]/5 to-transparent">
              <ImageUploader onUpload={handleAddImages} maxImages={5} currentImageCount={images.length} />
              <p className="text-xs text-center text-gray-500 mt-3">Maximum 5 photos · La 1ère sera la principale</p>
            </div>

            {images.length > 0 && (
              <div className="grid grid-cols-2 gap-3 mt-4">
                {images.map((img, idx) => (
                  <div key={idx} className="relative rounded-xl overflow-hidden shadow-md border-2 border-gray-100 dark:border-gray-700">
                    <div className="aspect-square relative">
                      <Image src={img} alt={`Photo ${idx + 1}`} fill className="object-cover" />
                      {idx === 0 && (
                        <div className="absolute top-2 left-2 bg-[#F4B400] text-white text-xs font-bold px-2 py-1 rounded-full">
                          Principale
                        </div>
                      )}
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3 flex justify-between items-center">
                      {idx !== 0 && (
                        <button type="button" onClick={() => handleSetMainImage(idx)} className="text-white text-xs font-medium bg-white/20 px-2 py-1 rounded-lg backdrop-blur-sm">
                          Définir principale
                        </button>
                      )}
                      <button type="button" onClick={() => handleRemoveImage(idx)} className="ml-auto text-white text-xs font-medium bg-red-500/80 px-2 py-1 rounded-lg">
                        Supprimer
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )

      case 1:
        return (
          <div className="space-y-4">
            <div className="text-center space-y-2 mb-6">
              <div className="text-5xl mb-2">🏷️</div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Catégorie</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">Quel type de produit ?</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {categories.map((cat) => {
                const selected = form.category === cat.value
                return (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => setForm((prev) => ({ ...prev, category: cat.value }))}
                    className={`relative p-4 rounded-2xl border-2 transition-all duration-200 active:scale-95 ${
                      selected 
                        ? `bg-gradient-to-br ${cat.color} text-white shadow-lg border-transparent` 
                        : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <div className="text-4xl mb-2">{cat.icon}</div>
                    <div className="font-semibold text-sm">{cat.label}</div>
                    {selected && (
                      <div className="absolute top-2 right-2 w-6 h-6 bg-white/30 rounded-full flex items-center justify-center">
                        <Check size={16} className="text-white" />
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-4">
            <div className="text-center space-y-2 mb-6">
              <div className="text-5xl mb-2">📍</div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Votre zone</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">Où se trouve le produit ?</p>
            </div>

            {locationStatus === 'loading' && (
              <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-3">
                  <div className="animate-spin w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full" />
                  <div>
                    <p className="font-medium text-blue-900 dark:text-blue-100 text-sm">Localisation...</p>
                    <p className="text-xs text-blue-700 dark:text-blue-300">Détection en cours</p>
                  </div>
                </div>
              </div>
            )}

            {locationStatus === 'success' && (
              <div className="p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">✅</div>
                  <div>
                    <p className="font-medium text-green-900 dark:text-green-100 text-sm">Position détectée</p>
                    <p className="text-xs text-green-700 dark:text-green-300">Vous pouvez la modifier ci-dessous</p>
                  </div>
                </div>
              </div>
            )}

            {locationStatus === 'error' && (
              <div className="p-4 rounded-xl bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">⚠️</div>
                  <div>
                    <p className="font-medium text-yellow-900 dark:text-yellow-100 text-sm">Sélection manuelle</p>
                    <p className="text-xs text-yellow-700 dark:text-yellow-300">Choisissez votre quartier</p>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-6">
              <label className="block text-sm font-semibold mb-3 text-gray-900 dark:text-white">Sélectionnez votre quartier</label>
              <select 
                name="zone" 
                value={form.zone} 
                onChange={handleChange}
                className="w-full px-4 py-4 text-lg rounded-xl border-2 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-[#F4B400] focus:border-[#F4B400] bg-white dark:bg-gray-800 transition-all"
              >
                {SENEGAL_LOCATIONS.map((loc) => (
                  <option key={loc.name} value={loc.name}>{loc.name}</option>
                ))}
              </select>
              <p className="text-sm mt-3 text-gray-600 dark:text-gray-400">
                Zone : <span className="font-semibold text-[#F4B400]">{form.zone}</span>
              </p>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-4">
            <div className="text-center space-y-2 mb-6">
              <div className="text-5xl mb-2">✏️</div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Détails</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">Décrivez votre produit</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-900 dark:text-white">Titre du produit</label>
                <input 
                  type="text" 
                  name="title" 
                  placeholder="Ex: Robe Wax taille M" 
                  value={form.title} 
                  onChange={handleChange} 
                  maxLength={60}
                  className="w-full px-4 py-4 text-base rounded-xl border-2 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-[#F4B400] focus:border-[#F4B400] bg-white dark:bg-gray-800 transition-all"
                />
                <div className="text-right text-xs text-gray-500 mt-1">{form.title.length}/60</div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-900 dark:text-white">Description</label>
                <textarea 
                  name="description" 
                  value={form.description} 
                  onChange={handleChange} 
                  placeholder="État, taille, matière, couleur..." 
                  maxLength={500}
                  rows={5}
                  className="w-full px-4 py-4 text-base rounded-xl border-2 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-[#F4B400] focus:border-[#F4B400] bg-white dark:bg-gray-800 resize-none transition-all"
                />
                <div className="text-right text-xs text-gray-500 mt-1">{form.description.length}/500</div>
              </div>

              <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                <h4 className="font-semibold text-sm mb-2 text-blue-900 dark:text-blue-100">💡 Conseils</h4>
                <ul className="text-xs text-blue-800 dark:text-blue-200 space-y-1">
                  <li>• Précisez l'état et la taille</li>
                  <li>• Mentionnez les défauts s'il y en a</li>
                  <li>• Soyez honnête pour gagner la confiance</li>
                </ul>
              </div>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-4">
            <div className="text-center space-y-2 mb-6">
              <div className="text-5xl mb-2">💰</div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Prix & Contact</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">Dernière étape !</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-900 dark:text-white">Prix (FCFA)</label>
                <input 
                  type="number" 
                  name="price" 
                  placeholder="25000" 
                  value={form.price} 
                  onChange={handleChange}
                  min={0}
                  className="w-full px-4 py-4 text-lg font-semibold rounded-xl border-2 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-[#F4B400] focus:border-[#F4B400] bg-white dark:bg-gray-800 transition-all"
                />
                <p className="text-xs text-gray-500 mt-2">💡 Un prix juste attire plus d'acheteurs</p>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-900 dark:text-white">WhatsApp</label>
                <div className="flex items-center border-2 border-gray-300 dark:border-gray-600 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-[#F4B400] focus-within:border-[#F4B400] bg-white dark:bg-gray-800 transition-all">
                  <div className="px-4 py-4 bg-[#F4B400]/20 text-gray-900 dark:text-white font-semibold text-base">+221</div>
                  <input 
                    type="tel" 
                    name="whatsappNumber" 
                    placeholder="771234567" 
                    value={form.whatsappNumber} 
                    onChange={handleWhatsappChange}
                    maxLength={9}
                    className="flex-1 px-4 py-4 text-base bg-transparent outline-none"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">📱 Les acheteurs vous contacteront ici</p>
              </div>

              <div className="mt-6 p-4 rounded-2xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-sm text-gray-900 dark:text-white">Prix de gros</h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Pour les achats en volume</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      name="hasWholesale" 
                      checked={form.hasWholesale} 
                      onChange={handleChange}
                      className="sr-only peer"
                    />
                    <div className="w-14 h-8 bg-gray-300 dark:bg-gray-600 rounded-full peer peer-checked:bg-[#F4B400] transition-colors relative">
                      <span className={`absolute left-1 top-1 w-6 h-6 bg-white rounded-full transition-transform ${form.hasWholesale ? 'translate-x-6' : ''}`} />
                    </div>
                  </label>
                </div>

                {form.hasWholesale && (
                  <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div>
                      <label className="block text-xs font-medium mb-2 text-gray-700 dark:text-gray-300">Prix gros (FCFA)</label>
                      <input 
                        type="number" 
                        name="wholesalePrice" 
                        placeholder="20000" 
                        value={form.wholesalePrice} 
                        onChange={handleChange}
                        min={0}
                        className="w-full px-3 py-3 text-sm rounded-lg border-2 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-purple-400 bg-white dark:bg-gray-700"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-2 text-gray-700 dark:text-gray-300">Quantité min.</label>
                      <input 
                        type="number" 
                        name="minWholesaleQty" 
                        placeholder="10" 
                        value={form.minWholesaleQty} 
                        onChange={handleChange}
                        min={2}
                        className="w-full px-3 py-3 text-sm rounded-lg border-2 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-purple-400 bg-white dark:bg-gray-700"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-black pb-32">
      {/* Header fixe */}
      <div className="sticky top-0 z-40 bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="px-4 py-4 flex items-center justify-between max-w-2xl mx-auto">
          <button 
            onClick={() => router.back()} 
            className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 active:scale-95 transition-all"
          >
            <ChevronLeft size={24} className="text-gray-700 dark:text-gray-300" />
          </button>
          
          <div className="text-center flex-1">
            <h1 className="text-lg font-bold text-gray-900 dark:text-white">Nouveau produit</h1>
            <p className="text-xs text-gray-500">Étape {currentStep + 1}/{steps.length}</p>
          </div>

          <div className="w-10" />
        </div>

        {/* Progress bar */}
        <div className="w-full bg-gray-200 dark:bg-gray-800 h-1">
          <div 
            className="h-1 bg-gradient-to-r from-[#F4B400] to-[#E9961A] transition-all duration-300"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Indicateurs d'étapes */}
      <div className="px-4 py-4 max-w-2xl mx-auto">
        <div className="flex items-center justify-between">
          {steps.map((step, idx) => {
            const StepIcon = step.icon
            const isActive = idx === currentStep
            const isCompleted = idx < currentStep
            
            return (
              <div key={step.title} className="flex flex-col items-center flex-1">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                  isActive 
                    ? 'bg-[#F4B400] text-white shadow-lg scale-110' 
                    : isCompleted
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-400'
                }`}>
                  {isCompleted ? <Check size={18} /> : <StepIcon size={18} />}
                </div>
                <span className={`text-[10px] mt-1 font-medium ${
                  isActive ? 'text-[#F4B400]' : 'text-gray-500'
                }`}>
                  {step.title}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Contenu principal */}
      <div className="px-4 max-w-2xl mx-auto">
        {error && (
          <div className="mb-4 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 text-red-700 dark:text-red-200 text-sm animate-shake">
            <div className="flex items-start gap-2">
              <span className="text-lg">⚠️</span>
              <div>
                <p className="font-semibold">Erreur</p>
                <p>{error}</p>
              </div>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 text-green-700 dark:text-green-200 text-sm">
            <div className="flex items-start gap-2">
              <span className="text-lg">✅</span>
              <div>
                <p className="font-semibold">Succès !</p>
                <p>Produit publié. Redirection...</p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
          {getStepContent()}
        </div>
      </div>

      {/* Barre d'action fixe en bas */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/98 dark:bg-gray-900/98 backdrop-blur-xl border-t border-gray-200 dark:border-gray-800 shadow-2xl pb-safe mb-14">
        <div className="px-4 py-4 max-w-2xl mx-auto">
          <div className="flex items-center gap-3">
            {/* Bouton Précédent */}
            <button
              type="button"
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="px-6 py-3 rounded-xl border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 transition-all"
            >
              ← Retour
            </button>

            {/* Bouton Suivant / Publier */}
            {currentStep < steps.length - 1 ? (
              <button
                type="button"
                onClick={handleNext}
                disabled={!canGoNext()}
                className="flex-1 px-6 py-4 rounded-xl bg-gradient-to-r from-[#F4B400] to-[#E9961A] text-white font-bold text-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition-all"
              >
                Suivant →
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading || !canGoNext()}
                className="flex-1 px-6 py-4 rounded-xl bg-gradient-to-r from-green-500 to-green-600 text-white font-bold text-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Publication...</span>
                  </>
                ) : (
                  <>
                    <span>🚀</span>
                    <span>Publier</span>
                  </>
                )}
              </button>
            )}
          </div>

          {/* Indicateur de progression textuel */}
          <div className="text-center mt-3">
            <p className="text-xs text-gray-500">
              {!canGoNext() && currentStep === 0 && "Ajoutez au moins 1 photo"}
              {!canGoNext() && currentStep === 3 && "Remplissez le titre et la description"}
              {!canGoNext() && currentStep === 4 && "Prix et WhatsApp requis"}
              {canGoNext() && currentStep < steps.length - 1 && "Prêt à continuer"}
              {canGoNext() && currentStep === steps.length - 1 && "Prêt à publier votre produit"}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}