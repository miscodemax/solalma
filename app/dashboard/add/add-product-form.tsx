'use client'

import React, { useState, useEffect, useRef } from 'react'
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
  // -- form state --
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

  // bottom offset used to position the fixed action bar above any existing tab bar
  const [bottomOffset, setBottomOffset] = useState(16)
  const tabbarRefs = useRef<{ el: Element; originalDisplay: string | null }[]>([])

  const router = useRouter()
  const supabase = createClient()

  // -- detect & optionally hide app tab bar(s) and compute offset so the action bar sits above them on mobile
  useEffect(() => {
    // selectors commonly used for bottom tabbars/navigation in apps
    const selectors = [
      '.tabbar',
      '#tabbar',
      '.bottom-nav',
      '.app-tabbar',
      '.mobile-bottom-nav',
      'nav.bottom-navigation',
      'footer.bottom-nav'
    ]

    const found: { el: Element; originalDisplay: string | null }[] = []
    let totalHeight = 0

    selectors.forEach((sel) => {
      document.querySelectorAll(sel).forEach((el) => {
        const computed = window.getComputedStyle(el)
        const rect = (el as HTMLElement).getBoundingClientRect()
        const h = rect.height || parseFloat(computed.height || '0') || 0
        found.push({ el, originalDisplay: (el as HTMLElement).style.display || null })
        // hide the element (user asked to "cache" the tab bar)
        ;(el as HTMLElement).style.display = 'none'
        totalHeight += h
      })
    })

    // If we found any tabbar, push the action bar above them
    if (found.length > 0) {
      // set a minimum safe offset and include some breathing room and safe-area for iPhones
      const safeArea = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--safe-area-inset-bottom') || '0') || 0
      setBottomOffset(Math.max(12, Math.ceil(totalHeight)) + safeArea + 8)
      tabbarRefs.current = found
    } else {
      // fallback: ensure we respect iOS safe area
      const cssSafe = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--safe-area-inset-bottom') || '0') || 0
      setBottomOffset(12 + cssSafe)
    }

    // restore on unmount
    return () => {
      tabbarRefs.current.forEach(({ el, originalDisplay }) => {
        ;(el as HTMLElement).style.display = originalDisplay ?? ''
      })
      tabbarRefs.current = []
    }
  }, [])

  // -- location grab with friendly fallback --
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
        () => {
          setLocationStatus('error')
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
      )
    }
    getUserLocation()
  }, [])

  // -- reusable UI pieces --
  const StepHeader = ({ title, emoji, subtitle }: { title: string, emoji?: string, subtitle?: string }) => (
    <div className="text-center space-y-3 mb-6">
      <div className="text-5xl">{emoji}</div>
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white">{title}</h2>
      {subtitle && <p className="text-gray-600 dark:text-gray-400">{subtitle}</p>}
    </div>
  )

  const ProgressBar = ({ step }: { step: number }) => {
    const percent = ((step + 1) / steps.length) * 100
    return (
      <div aria-hidden className="w-full mt-4">
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
          <div style={{ width: `${percent}%` }} className="h-2 bg-gradient-to-r from-[#F4C430] to-[#E9961A] transition-all duration-300" />
        </div>
      </div>
    )
  }

  // -- steps description (kept constant) --
  const steps = [
    { title: 'Photos', subtitle: 'Ajoutez des images attrayantes', icon: '📸' },
    { title: 'Catégorie', subtitle: 'Choisissez le type de produit', icon: '🏷️' },
    { title: 'Zone', subtitle: 'Choisissez votre quartier', icon: '📍' },
    { title: 'Détails', subtitle: 'Décrivez votre produit', icon: '✏️' },
    { title: 'Prix & Contact', subtitle: 'Fixez votre prix et contact', icon: '💰' }
  ]

  // -- handlers --
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

  // -- validation & progression --
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

  // -- submit --
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess(false)

    if (!canGoNext()) {
      setError('Veuillez remplir tous les champs correctement avant de publier.')
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
      setError(err.message || 'Une erreur est survenue lors de la création du produit')
    } finally {
      setLoading(false)
    }
  }

  // -- step content refined for clarity and better UX --
  const getStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <StepHeader title="Ajoutez vos photos" emoji="📸" subtitle="Des images claires et bien cadrées augmentent vos chances de vente" />
            <div className="rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 p-4 bg-white/60 dark:bg-gray-800/60">
              <ImageUploader onUpload={handleAddImages} maxImages={5} currentImageCount={images.length} />
              <p className="text-sm text-gray-500 mt-2">Jusqu'à 5 images — la première est la photo principale.</p>
            </div>

            {images.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {images.map((img, idx) => (
                  <div key={idx} className="relative rounded-xl overflow-hidden border border-gray-100 dark:border-gray-700">
                    <div className="aspect-[4/3] relative">
                      <Image src={img} alt={`Produit ${idx + 1}`} fill className="object-cover" />
                    </div>
                    <div className="p-2 flex justify-between items-center bg-white/90 dark:bg-black/40">
                      <div className="flex items-center gap-2">
                        {idx === 0 ? <span className="text-sm font-medium text-[#E9961A]">Principale</span> : <button type="button" onClick={() => handleSetMainImage(idx)} className="text-sm text-gray-600 hover:text-[#E9961A]">Définir</button>}
                      </div>
                      <button type="button" onClick={() => handleRemoveImage(idx)} className="text-sm text-red-600 hover:underline">Supprimer</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      case 1:
        return (
          <div className="space-y-6">
            <StepHeader title="Choisissez votre catégorie" emoji="🏷️" subtitle="Facilitez la recherche des acheteurs" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {categories.map((cat) => {
                const selected = form.category === cat.value
                return (
                  <button key={cat.value} type="button" onClick={() => setForm((prev) => ({ ...prev, category: cat.value }))} aria-pressed={selected}
                    className={`flex items-center gap-3 p-3 rounded-2xl border transition-all duration-200 ${selected ? `bg-gradient-to-br ${cat.color} text-white shadow-lg border-transparent` : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:scale-[1.02]'}`}>
                    <div className="text-2xl">{cat.icon}</div>
                    <div className="text-left">
                      <div className="font-semibold">{cat.label}</div>
                      <div className="text-xs text-gray-500">Cliquez pour sélectionner</div>
                    </div>
                    {selected && <div className="ml-auto text-white font-bold">✓</div>}
                  </button>
                )
              })}
            </div>
          </div>
        )
      case 2:
        return (
          <div className="space-y-6">
            <StepHeader title="Choisissez votre quartier" emoji="📍" subtitle="Le bon quartier aide à mieux cibler les acheteurs" />
            <div className={`p-4 rounded-xl border-2 ${locationStatus === 'success' ? 'bg-green-50 border-green-200' : locationStatus === 'error' ? 'bg-yellow-50 border-yellow-200' : 'bg-blue-50 border-blue-200'}`}>
              <div className="flex items-center gap-3">
                {locationStatus === 'loading' && (<><div className="animate-spin w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full" /> <div><p className="font-medium text-blue-700">Localisation en cours...</p><p className="text-sm text-blue-600">Nous utilisons votre position pour suggérer le meilleur quartier.</p></div></>)}
                {locationStatus === 'success' && (<><div className="text-green-500 text-xl">✅</div><div><p className="font-medium text-green-700">Position détectée</p><p className="text-sm text-green-600">Vous pouvez la conserver ou choisir un quartier manuellement.</p></div></>)}
                {locationStatus === 'error' && (<><div className="text-yellow-500 text-xl">⚠️</div><div><p className="font-medium text-yellow-700">Géolocalisation indisponible</p><p className="text-sm text-yellow-600">Choisissez votre quartier ci-dessous.</p></div></>)}
              </div>
            </div>

            <div className="p-6 rounded-2xl border-2 bg-white/60 dark:bg-gray-800/60">
              <label className="block text-sm font-medium mb-2">Sélectionnez votre quartier</label>
              <select name="zone" value={form.zone} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:ring-2 focus:ring-yellow-300">
                {SENEGAL_LOCATIONS.map((loc) => (<option key={loc.name} value={loc.name}>{loc.name}</option>))}
              </select>
              <p className="text-sm mt-3 text-gray-500">Zone affichée : <span className="font-semibold">{form.zone}</span></p>
            </div>
          </div>
        )
      case 3:
        return (
          <div className="space-y-6">
            <StepHeader title="Détails du produit" emoji="✏️" subtitle="Donnez confiance aux acheteurs avec des informations précises" />
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Titre</label>
                <input type="text" name="title" placeholder="Ex: Robe Wax taille M, comme neuve" value={form.title} onChange={handleChange} maxLength={60}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:ring-2 focus:ring-[#E9961A]" />
                <div className="text-right text-sm text-gray-500 mt-1">{form.title.length}/60</div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea name="description" value={form.description} onChange={handleChange} placeholder="Décrivez l'état, la taille, la matière..." maxLength={500} className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 h-36 resize-none focus:ring-2 focus:ring-[#E9961A]" />
                <div className="text-right text-sm text-gray-500 mt-1">{form.description.length}/500</div>
              </div>

              <div className="p-4 rounded-lg bg-blue-50 border border-blue-100">
                <h4 className="font-medium">Conseils rapides</h4>
                <ul className="text-sm text-gray-600 mt-2 space-y-1">
                  <li>• Indiquez l'état exact et la taille</li>
                  <li>• Ajoutez des mesures si nécessaire</li>
                  <li>• Soyez transparent sur les défauts éventuels</li>
                </ul>
              </div>
            </div>
          </div>
        )
      case 4:
        return (
          <div className="space-y-6">
            <StepHeader title="Prix et contact" emoji="💰" subtitle="Dernière étape — soyez clair pour obtenir des messages" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Prix unitaire (FCFA)</label>
                <input type="number" name="price" placeholder="Ex: 25000" value={form.price} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:ring-2 focus:ring-[#E9961A]" min={0} />
                <div className="text-sm text-gray-500 mt-2">Astuce : un prix honnête attire des acheteurs sérieux.</div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Numéro WhatsApp</label>
                <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden">
                  <div className="px-4 py-3 bg-[#F4C430]/20 text-gray-800">+221</div>
                  <input type="tel" name="whatsappNumber" placeholder="771234567" value={form.whatsappNumber} onChange={handleWhatsappChange} className="flex-1 px-4 py-3" maxLength={9} />
                </div>
                <div className="text-sm text-gray-500 mt-2">Nous utiliserons ce numéro pour que les acheteurs puissent vous contacter.</div>
              </div>
            </div>

            <div className="mt-4 p-4 rounded-2xl border-2 bg-white/60">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold">Proposer un prix de gros (optionnel)</h3>
                  <p className="text-sm text-gray-500">Attirez les acheteurs qui achètent en volume.</p>
                </div>
                <label className="inline-flex items-center cursor-pointer">
                  <input type="checkbox" name="hasWholesale" checked={form.hasWholesale} onChange={handleChange} className="sr-only peer" />
                  <div className="w-12 h-7 bg-gray-200 rounded-full relative peer-checked:bg-[#7C3AED] transition-colors">
                    <span className={`absolute left-[4px] top-[4px] w-5 h-5 bg-white rounded-full transition-transform peer-checked:translate-x-5`} />
                  </div>
                </label>
              </div>

              {form.hasWholesale && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Prix de gros (FCFA)</label>
                    <input type="number" name="wholesalePrice" placeholder="Ex: 20000" value={form.wholesalePrice} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:ring-2 focus:ring-purple-300" min={0} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Quantité minimum</label>
                    <input type="number" name="minWholesaleQty" placeholder="Ex: 10" value={form.minWholesaleQty} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:ring-2 focus:ring-purple-300" min={2} />
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
    <div className="min-h-screen bg-gradient-to-br from-[#FAF9F6] via-white to-[#F4C430]/5 dark:from-[#0b0b0b] dark:via-[#111] dark:to-[#1f1f1f] py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <Button variant="ghost" size="lg" onClick={() => router.back()} className="text-[#E9961A]">
            ← Retour
          </Button>
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-[#F4C430] via-[#E9961A] to-[#F4C430] bg-clip-text text-transparent">
              Publier votre produit
            </h1>
            <div className="text-sm text-gray-500">Suivez les étapes — 2 minutes suffisent.</div>
          </div>
          <div />
        </div>

        <div className="bg-white/90 dark:bg-[#121212]/90 rounded-3xl shadow-lg border border-[#F4C430]/10 p-6 sm:p-8">
          <div className="flex items-start gap-6">
            <div className="w-1/3 hidden md:block">
              <div className="sticky top-6">
                <div className="space-y-4">
                  {steps.map((s, i) => (
                    <button key={s.title} type="button" onClick={() => i <= currentStep && setCurrentStep(i)} className={`w-full text-left p-3 rounded-lg transition-colors ${i === currentStep ? 'bg-[#FFF3D6] border border-[#F4C430]' : 'hover:bg-gray-50'}`}>
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 flex items-center justify-center rounded-full ${i <= currentStep ? 'bg-[#F4C430] text-white' : 'bg-gray-200 text-gray-600'}`}>{i + 1}</div>
                        <div>
                          <div className="font-medium text-sm">{s.title}</div>
                          <div className="text-xs text-gray-500">{s.subtitle}</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
                <ProgressBar step={currentStep} />
              </div>
            </div>

            <div className="flex-1">
              {error && (
                <div className="mb-4 p-3 rounded-lg bg-red-50 border-l-4 border-red-400 text-red-700">
                  {error}
                </div>
              )}
              {success && (
                <div className="mb-4 p-3 rounded-lg bg-green-50 border-l-4 border-green-400 text-green-700">
                  Produit publié avec succès ! Redirection en cours...
                </div>
              )}

              <div className="md:hidden mb-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">Étape {currentStep + 1} / {steps.length}</div>
                  <div className="text-sm font-semibold text-[#E9961A]">{steps[currentStep].title}</div>
                </div>
                <ProgressBar step={currentStep} />
              </div>

              <div className="p-4 rounded-2xl border border-gray-100 bg-white/60">
                {getStepContent()}
              </div>
            </div>
          </div>
        </div>

        {/* action bar: fixed but positioned above the (hidden) tab bar via bottomOffset.
            On mobile the buttons are larger and stacked if needed for easy tapping.
            We also use env(safe-area-inset-bottom) to respect iOS notch areas. */}
        <form onSubmit={handleSubmit} className="pointer-events-auto" style={{ zIndex: 60 }}>
          <div
            className="fixed left-1/2 transform -translate-x-1/2 w-full max-w-4xl px-4"
            style={{ bottom: `${bottomOffset}px`, transition: 'bottom 220ms ease' }}
          >
            <div className="bg-white/98 dark:bg-gray-900/95 backdrop-blur-sm rounded-2xl p-3 flex flex-col sm:flex-row items-center gap-3 border border-[#F4C430]/10 shadow-lg" style={{ paddingBottom: `calc(env(safe-area-inset-bottom, 0px) + 12px)` }}>
              {/* Previous */}
              <div className="w-full sm:w-auto">
                <Button type="button" variant="outline" onClick={handlePrevious} disabled={currentStep === 0} className="w-full sm:w-auto px-4 py-3 border-[#E9961A] text-[#E9961A] disabled:opacity-50">
                  ← Précédent
                </Button>
              </div>

              <div className="flex-1 text-center">
                <div className="text-sm text-gray-500">Étape {currentStep + 1} sur {steps.length}</div>
                <div className="text-xs text-gray-700">{steps[currentStep].subtitle}</div>
              </div>

              <div className="w-full sm:w-auto">
                {currentStep < steps.length - 1 ? (
                  <Button type="button" onClick={handleNext} disabled={!canGoNext()} className="w-full sm:w-auto px-4 py-3 bg-gradient-to-r from-[#F4C430] to-[#E9961A] text-white disabled:opacity-50">
                    Suivant →
                  </Button>
                ) : (
                  <Button type="submit" disabled={loading || !canGoNext()} className="w-full sm:w-auto px-5 py-3 bg-gradient-to-r from-[#F4C430] to-[#E9961A] text-white font-semibold">
                    {loading ? 'Publication...' : '🚀 Publier'}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}