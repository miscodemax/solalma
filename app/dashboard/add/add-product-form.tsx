'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

import Image from 'next/image'
import ImageUploader from './imageuploader'
import { Button } from '@/components/ui/button'

type Props = { userId: string }

const categories = [
  { value: 'vetement', label: 'Vêtement', icon: '👗', color: 'from-pink-400 to-rose-500' },
  { value: 'soins_et_astuces', label: 'Soins et astuces', icon: '💄', color: 'from-purple-400 to-pink-500' },
  { value: 'maquillage', label: 'Maquillage', icon: '💋', color: 'from-red-400 to-pink-500' },
  { value: 'artisanat', label: 'Artisanat', icon: '🎨', color: 'from-blue-400 to-purple-500' },
  { value: 'electronique', label: 'Electronique', icon: '📱', color: 'from-cyan-400 to-blue-500' },
  { value: 'accessoire', label: 'Accessoire', icon: '👜', color: 'from-amber-400 to-orange-500' },
  { value: 'chaussure', label: 'Chaussure', icon: '👠', color: 'from-yellow-400 to-orange-500' },
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
    // Ajout des champs pour le prix de gros
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
          console.log('Position utilisateur obtenue:', coords)
        },
        (error) => {
          console.error('Erreur géolocalisation:', error)
          setLocationStatus('error')
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 300000 }
      )
    }
    getUserLocation()
  }, [])

  const steps = [
    { title: 'Photos', subtitle: 'Ajoutez des images attrayantes', icon: '📸' },
    { title: 'Catégorie', subtitle: 'Choisissez le type de produit', icon: '🏷️' },
    { title: 'Zone', subtitle: 'Choisissez votre quartier', icon: '📍' },
    { title: 'Détails', subtitle: 'Décrivez votre produit', icon: '✏️' },
    { title: 'Prix & Contact', subtitle: 'Fixez votre prix et contact', icon: '💰' }
  ]

  // Mise à jour pour gérer les cases à cocher (checkbox)
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

  // Mise à jour de la validation pour inclure le prix de gros
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
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  // Mise à jour de la soumission pour inclure le prix de gros
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess(false)

    if (!canGoNext()) {
      setError('Veuillez remplir tous les champs correctement.')
      return
    }

    const fullNumber = '+221' + form.whatsappNumber.trim()
    if (!/^\+221\d{8,9}$/.test(fullNumber)) {
      setError('Veuillez entrer un numéro WhatsApp valide (ex: 771234567)')
      return
    }
    if (images.length === 0) {
      setError('Veuillez ajouter au moins une image.')
      return
    }
    // Ajout de la validation pour le prix de gros avant soumission
    if (form.hasWholesale) {
      if (parseFloat(form.wholesalePrice) >= parseFloat(form.price)) {
        setError('Le prix de gros doit être inférieur au prix unitaire.')
        return
      }
      if (parseInt(form.minWholesaleQty) < 2) {
        setError('La quantité minimum pour le prix de gros doit être d\'au moins 2.')
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
          // Ajout des champs de gros à l'objet d'insertion
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
      setTimeout(() => router.push('/dashboard/products'), 2000)
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue lors de la création du produit')
    } finally {
      setLoading(false)
    }
  }

  const getStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6 animate-in fade-in-50 slide-in-from-right-4 duration-500">
            <div className="text-center space-y-3 mb-8">
              <div className="text-6xl mb-4">📸</div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Ajoutez vos photos</h2>
              <p className="text-gray-600 dark:text-gray-400">Des images de qualité attirent plus d'acheteurs</p>
            </div>
            <ImageUploader onUpload={handleAddImages} maxImages={5} currentImageCount={images.length} />
            {images.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-6">
                {images.map((img, idx) => (
                  <div key={idx} className="relative group aspect-square">
                    <Image src={img} alt={`Produit ${idx + 1}`} fill className="rounded-2xl object-cover border-2 border-gray-200 dark:border-gray-700 group-hover:border-[#F4C430] transition-all duration-300" />
                    {idx === 0 && <div className="absolute -top-2 -right-2 bg-gradient-to-r from-[#F4C430] to-[#E9961A] text-white text-xs px-3 py-1 rounded-full font-medium shadow-lg animate-pulse">⭐ Principale</div>}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-300 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <div className="flex gap-2">
                        {idx !== 0 && <button type="button" onClick={() => handleSetMainImage(idx)} className="bg-white/20 backdrop-blur-sm text-white p-2 rounded-full hover:bg-white/30 transition-all duration-200">⭐</button>}
                        <button type="button" onClick={() => handleRemoveImage(idx)} className="bg-red-500/80 backdrop-blur-sm text-white p-2 rounded-full hover:bg-red-500 transition-all duration-200">🗑️</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      case 1:
        return (
          <div className="space-y-6 animate-in fade-in-50 slide-in-from-right-4 duration-500">
            <div className="text-center space-y-3 mb-8">
              <div className="text-6xl mb-4">🏷️</div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Choisissez votre catégorie</h2>
              <p className="text-gray-600 dark:text-gray-400">Aidez les acheteurs à vous trouver facilement</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {categories.map((cat) => (
                <button key={cat.value} type="button" onClick={() => setForm((prev) => ({ ...prev, category: cat.value }))} className={`relative p-6 rounded-2xl border-2 transition-all duration-300 transform hover:scale-105 ${form.category === cat.value ? 'border-[#F4C430] bg-gradient-to-br ' + cat.color + ' text-white shadow-xl' : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-[#F4C430]/50'}`}>
                  <div className="text-3xl mb-3">{cat.icon}</div>
                  <h3 className="font-semibold text-lg">{cat.label}</h3>
                  {form.category === cat.value && <div className="absolute -top-2 -right-2 bg-white text-[#F4C430] rounded-full p-1">✓</div>}
                </button>
              ))}
            </div>
          </div>
        )
      case 2:
        return (
          <div className="space-y-6 animate-in fade-in-50 slide-in-from-right-4 duration-500">
            <div className="text-center space-y-3 mb-8">
              <div className="text-6xl mb-4">📍</div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Choisissez votre quartier</h2>
              <p className="text-gray-600 dark:text-gray-400">Cette information sera visible par les acheteurs</p>
            </div>
            <div className={`p-4 rounded-xl border-2 ${locationStatus === 'success' ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' : locationStatus === 'error' ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800' : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'}`}>
              <div className="flex items-center gap-3">
                {locationStatus === 'loading' && (<><div className="animate-spin w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full"></div><div><p className="text-blue-700 dark:text-blue-300 font-medium">🗺️ Localisation en cours...</p><p className="text-sm text-blue-600 dark:text-blue-400">Pour des recommandations plus précises</p></div></>)}
                {locationStatus === 'success' && (<><div className="text-green-500 text-xl">✅</div><div><p className="text-green-700 dark:text-green-300 font-medium">Position exacte détectée !</p><p className="text-sm text-green-600 dark:text-green-400">Vos recommandations seront ultra-précises</p></div></>)}
                {locationStatus === 'error' && (<><div className="text-yellow-500 text-xl">⚠️</div><div><p className="text-yellow-700 dark:text-yellow-300 font-medium">Géolocalisation indisponible</p><p className="text-sm text-yellow-600 dark:text-yellow-400">Pas de souci, nous utiliserons votre quartier</p></div></>)}
              </div>
            </div>
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 p-6 rounded-2xl border-2 border-yellow-200 dark:border-yellow-800">
              <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200 mb-4">🏘️ Sélectionnez votre quartier</h3>
              <select name="zone" value={form.zone} onChange={handleChange} className="w-full px-4 py-4 border-2 border-yellow-200 dark:border-yellow-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 bg-white dark:bg-gray-800 transition-all duration-300 text-lg font-medium">
                {SENEGAL_LOCATIONS.map((loc) => (<option key={loc.name} value={loc.name}>{loc.name}</option>))}
              </select>
              <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-3 flex items-center gap-2">📍 Zone affichée : <span className="font-bold">{form.zone}</span></p>
            </div>
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-4 rounded-xl">
              <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">💡 Comment ça marche ?</h4>
              <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                <li>• Votre quartier sera visible par tous les acheteurs</li>
                <li>• Votre position exacte reste privée et sert aux recommandations</li>
                <li>• Les acheteurs proches verront votre annonce en priorité</li>
              </ul>
            </div>
          </div>
        )
      case 3:
        return (
          <div className="space-y-6 animate-in fade-in-50 slide-in-from-right-4 duration-500">
            <div className="text-center space-y-3 mb-8">
              <div className="text-6xl mb-4">✏️</div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Détails du produit</h2>
              <p className="text-gray-600 dark:text-gray-400">Plus de détails = plus de confiance</p>
            </div>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">✨ Titre du produit</label>
                <input type="text" name="title" placeholder="Ex: Robe Wax taille M, comme neuve" value={form.title} onChange={handleChange} maxLength={60} className="w-full px-4 py-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E9961A] focus:border-[#F4C430] bg-white dark:bg-gray-800 transition-all duration-300 text-lg" required />
              	<div className="text-right text-sm text-gray-500 mt-1">{form.title.length}/60</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">📝 Description détaillée</label>
                <textarea name="description" value={form.description} onChange={handleChange} placeholder="Décrivez votre produit : état, taille, couleur..." maxLength={500} className="w-full px-4 py-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl h-32 resize-none focus:outline-none focus:ring-2 focus:ring-[#E9961A] focus:border-[#F4C430] bg-white dark:bg-gray-800 transition-all duration-300" required />
              	<div className="text-right text-sm text-gray-500 mt-1">{form.description.length}/500</div>
              </div>
            </div>
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-4 rounded-xl">
            	<h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">💡 Conseils :</h4>
            	<ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
            		<li>• Mentionnez l'état (neuf, très bon état, etc.)</li>
            		<li>• Précisez la taille, couleur, marque...</li>
            		<li>• Soyez honnête sur les défauts éventuels</li>
            	</ul>
          	</div>
        </div>
        )
      case 4:
        return (
          <div className="space-y-6 animate-in fade-in-50 slide-in-from-right-4 duration-500">
            <div className="text-center space-y-3 mb-8">
              <div className="text-6xl mb-4">💰</div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Prix et contact</h2>
            	<p className="text-gray-600 dark:text-gray-400">Dernière étape avant la publication !</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">💵 Prix unitaire (FCFA)</label>
                <input type="number" name="price" placeholder="Ex: 25000" value={form.price} onChange={handleChange} className="w-full px-4 py-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E9961A] focus:border-[#F4C430] bg-white dark:bg-gray-800 transition-all duration-300 text-lg" required min={0} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">📱 Numéro WhatsApp</label>
                <div className="flex border-2 border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-[#E9961A] focus-within:border-[#F4C430] transition-all duration-300">
                  <div className="px-4 py-4 bg-gradient-to-r from-[#F4C430]/20 to-[#E9961A]/20 text-gray-700 dark:text-gray-300 font-medium">+221</div>
                  <input type="tel" name="whatsappNumber" placeholder="771234567" value={form.whatsappNumber} onChange={handleWhatsappChange} className="flex-1 px-4 py-4 focus:outline-none bg-white dark:bg-gray-800 text-lg" maxLength={9} required />
                </div>
              </div>
            </div>

            {/* NOUVELLE SECTION : PRIX DE GROS */}
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 p-6 rounded-2xl border-2 border-purple-200 dark:border-purple-800 transition-all duration-300">
            	<div className="flex items-center justify-between mb-4">
            		<div>
            			<h3 className="text-lg font-semibold text-purple-800 dark:text-purple-200">📦 Proposer un prix de gros</h3>
            			<p className="text-sm text-purple-600 dark:text-purple-400">Optionnel : attirez les acheteurs en volume</p>
            		</div>
            		<label className="relative inline-flex items-center cursor-pointer">
            			<input type="checkbox" name="hasWholesale" checked={form.hasWholesale} onChange={handleChange} className="sr-only peer" />
            			<div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all dark:border-gray-600 peer-checked:bg-gradient-to-r peer-checked:from-purple-500 peer-checked:to-indigo-600"></div>
            		</label>
          	    </div>
          	    {form.hasWholesale && (
          		    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6 pt-6 border-t border-purple-200 dark:border-purple-800 animate-in fade-in duration-500">
          		    	<div>
          		    		<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">📉 Prix de gros (FCFA)</label>
          		    		<input type="number" name="wholesalePrice" placeholder="Ex: 20000" value={form.wholesalePrice} onChange={handleChange} className="w-full px-4 py-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-gray-800 transition-all duration-300 text-lg" required min={0} />
          		    	</div>
          		    	<div>
          		    		<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">🔢 Quantité minimum</label>
          		    		<input type="number" name="minWholesaleQty" placeholder="Ex: 10" value={form.minWholesaleQty} onChange={handleChange} className="w-full px-4 py-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-gray-800 transition-all duration-300 text-lg" required min={2} />
          		    	</div>
          		    </div>
          	    )}
          	</div>
        </div>
      	)
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FAF9F6] via-white to-[#F4C430]/5 dark:bg-gradient-to-br dark:from-[#1a1a1a] dark:via-[#222] dark:to-[#2a2a2a] py-4 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Button variant="outline" size="lg" onClick={() => router.back()} className="mb-6 border-[#E9961A] text-[#E9961A] font-semibold hover:bg-[#E9961A]/10 hover:dark:bg-[#E9961A]/20 transition-all duration-200 px-6 py-3">
            ← Retour
          </Button>
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-[#F4C430] via-[#E9961A] to-[#F4C430] bg-clip-text text-transparent mb-4">
              ✨ Publier votre produit
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              Quelques étapes simples pour mettre votre produit en ligne
            </p>
          </div>
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              {steps.map((step, index) => (
                <div key={index} className="flex flex-col items-center flex-1">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${index <= currentStep ? 'bg-gradient-to-r from-[#F4C430] to-[#E9961A] text-white shadow-lg' : 'bg-gray-200 dark:bg-gray-700 text-gray-500'}`}>
                    {index < currentStep ? '✓' : index + 1}
                  </div>
                  <div className="text-xs mt-2 text-center max-w-20">
                    <div className={`font-medium ${index <= currentStep ? 'text-[#E9961A]' : 'text-gray-500'}`}>{step.title}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div className="bg-gradient-to-r from-[#F4C430] to-[#E9961A] h-2 rounded-full transition-all duration-500 ease-out" style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}></div>
            </div>
          </div>
        </div>
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 mb-6 rounded-r-xl animate-in slide-in-from-left-4 duration-300">
            <div className="flex items-center"><div className="text-red-500 mr-3">⚠️</div><p className="text-red-700 dark:text-red-400 font-medium">{error}</p></div>
          </div>
        )}
        {success && (
          <div className="bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 p-4 mb-6 rounded-r-xl animate-in slide-in-from-left-4 duration-300">
          	<div className="flex items-center"><div className="text-green-500 mr-3">🎉</div><p className="text-green-700 dark:text-green-400 font-medium">Produit publié avec succès ! Redirection en cours...</p></div>
          </div>
        )}
        <div className="bg-white/80 dark:bg-[#2a2a2a]/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-[#F4C430]/20 dark:border-gray-600 p-8 sm:p-10 mb-8">
          {getStepContent()}
        </div>
        <form onSubmit={handleSubmit} className="flex justify-between items-center sticky bottom-4 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-2xl p-4 shadow-xl border border-[#F4C430]/20">
          <Button type="button" variant="outline" onClick={handlePrevious} disabled={currentStep === 0} className="px-6 py-3 border-[#E9961A] text-[#E9961A] hover:bg-[#E9961A]/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300">
            ← Précédent
          </Button>
          <div className="text-center flex-1 mx-4">
            <div className="text-sm text-gray-500 dark:text-gray-400">Étape {currentStep + 1} sur {steps.length}</div>
            <div className="font-medium text-[#E9961A]">{steps[currentStep].subtitle}</div>
          </div>
          {currentStep < steps.length - 1 ? (
            <Button type="button" onClick={handleNext} disabled={!canGoNext()} className="px-6 py-3 bg-gradient-to-r from-[#F4C430] to-[#E9961A] hover:from-[#E9961A] hover:to-[#F4C430] text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg">
              Suivant →
            </Button>
          ) : (
            <Button type="submit" disabled={loading || !canGoNext()} className="px-8 py-3 bg-gradient-to-r from-[#F4C430] to-[#E9961A] hover:from-[#E9961A] hover:to-[#F4C430] text-white font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-xl text-lg">
              {loading ? (<div className="flex items-center"><div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"></div>Publication...</div>) : (<div className="flex items-center">🚀 Publier mon produit</div>)}
            </Button>
          )}
        </form>
      </div>
    </div>
  )
}