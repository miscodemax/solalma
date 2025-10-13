'use client'

import { useState, useEffect, useMemo } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { MessageCircle, MapPin, Loader2, AlertTriangle, Phone, ShoppingCart, User, Package, Hash, CheckCircle2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface ProductContactProps {
    product: {
        id: number
        title: string
        category: "vetement" | "chaussure" | "autre"
        price: number
        whatsapp_number?: string
        phone_number?: string
        image_url?: string
        has_wholesale?: boolean
        wholesale_price?: number
        min_wholesale_qty?: number
    }
    customerName?: string
    className?: string
}

export default function ProductContact({ product, customerName, className = "" }: ProductContactProps) {
    const [isLoadingLocation, setIsLoadingLocation] = useState(false)
    const [locationError, setLocationError] = useState<string | null>(null)
    const [isPopupOpen, setIsPopupOpen] = useState(false)
    const [step, setStep] = useState(0)
    const [customData, setCustomData] = useState({
        taillePointure: "",
        quantite: 1,
        phone: "",
        name: ""
    })

    const clientDisplayName = customerName && customerName.trim() !== "" ? customerName : "ClientSangse"
    const isClothing = product.category === 'vetement'
    const isShoes = product.category === 'chaussure'

    const taillesVetements = ["XS", "S", "M", "L", "XL", "XXL"]
    const pointuresChaussures = ["36", "37", "38", "39", "40", "41", "42", "43", "44"]

    // --- LOGIQUE DE CALCUL DU PRIX ---
    const { prixTotal, prixUnitaireApplicable, isWholesaleApplied } = useMemo(() => {
        // 1. On vérifie si le produit a bien toutes les informations pour un prix de gros.
        const isWholesalePossible = product.has_wholesale && product.wholesale_price != null && product.min_wholesale_qty != null

        // 2. On vérifie si la quantité actuelle est SUPÉRIEURE OU ÉGALE (>=) à la quantité minimum requise.
        // C'est cette ligne qui applique la condition que vous avez demandée.
        const isWholesaleApplied = isWholesalePossible && customData.quantite >= product.min_wholesale_qty

        // 3. On choisit le prix unitaire : si la condition précédente est vraie, on prend le prix de gros.
        const prixUnitaire = isWholesaleApplied ? product.wholesale_price : product.price
        
        // 4. On calcule le total en multipliant la quantité par le bon prix unitaire.
        const total = prixUnitaire * customData.quantite

        return {
            prixTotal: total,
            prixUnitaireApplicable: prixUnitaire,
            isWholesaleApplied: isWholesaleApplied
        }
    }, [customData.quantite, product])
    // --- FIN DE LA LOGIQUE DE PRIX ---

    const buttonVariants = {
        initial: { scale: 1, y: 0 },
        hover: { scale: 1.02, y: -2 },
        tap: { scale: 0.98, y: 0 }
    }

    const slideVariants = {
        initial: { opacity: 0, x: 50 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -50 }
    }

    const pulseVariants = {
        initial: { scale: 1 },
        animate: { scale: [1, 1.05, 1], transition: { duration: 2, repeat: Infinity } }
    }

    const getCurrentLocation = (): Promise<{ lat: number; lng: number }> => {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) return reject(new Error("La géolocalisation n'est pas supportée"))
            navigator.geolocation.getCurrentPosition(
                (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
                (err) => {
                    let errorMessage = "Erreur de géolocalisation"
                    switch (err.code) {
                        case err.PERMISSION_DENIED: errorMessage = "Permission de localisation refusée"; break
                        case err.POSITION_UNAVAILABLE: errorMessage = "Position indisponible"; break
                        case err.TIMEOUT: errorMessage = "Timeout de localisation"; break
                    }
                    reject(new Error(errorMessage))
                },
                { enableHighAccuracy: true, timeout: 15000, maximumAge: 300000 }
            )
        })
    }

    const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`)
            const data = await res.json()
            const addr = data.address || {}
            return [addr.road, addr.house_number, addr.suburb, addr.city, addr.town, addr.village].filter(Boolean).join(", ") || "Adresse introuvable"
        } catch { return "Adresse non trouvée" }
    }
    
    const createWhatsAppMessage = (adresse?: string, osmLink?: string, extraData?: typeof customData) => {
        const data = extraData || customData
        const total = prixUnitaireApplicable * data.quantite

        let message = `🛍️ *Nouvelle commande SangseShop*

📦 *Produit :* ${product.title}
${data.taillePointure ? `🎯 *${isClothing ? 'Taille' : 'Pointure'} :* ${data.taillePointure}\n` : ""}
🔢 *Quantité :* ${data.quantite}
💰 *Prix total :* ${total.toLocaleString()} FCFA
_(${prixUnitaireApplicable.toLocaleString()} FCFA / unité${isWholesaleApplied ? ", prix de gros appliqué" : ""})_

🙋 *Client :* ${data.name || clientDisplayName}
📞 *Téléphone :* ${data.phone || "non fourni"}

`

        if (adresse && osmLink) {
            message += `📍 *Adresse :* ${adresse}\n🗺️ *Itinéraire :* ${osmLink}\n\n`
        } else {
            message += `📍 *Livraison :* Adresse à préciser\n\n`
        }

        message += `👉 Dispo ou bien ?\n🔗 Voir produit : https://sangse.shop/product/${product.id}`

        const whatsappClean = product.whatsapp_number?.replace(/\D/g, "")
        return whatsappClean ? `https://wa.me/${whatsappClean}?text=${encodeURIComponent(message)}` : null
    }

    const generateWhatsAppLink = async (withLocation: boolean, extraData?: typeof customData): Promise<string | null> => {
        if (!withLocation) {
            return createWhatsAppMessage(undefined, undefined, extraData)
        }

        try {
            setIsLoadingLocation(true)
            setLocationError(null)
            const location = await getCurrentLocation()
            const adresse = await reverseGeocode(location.lat, location.lng)
            const osmLink = `https://www.openstreetmap.org/?mlat=${location.lat}&mlon=${location.lng}#map=18/${location.lat}/${location.lng}`
            return createWhatsAppMessage(adresse, osmLink, extraData)
        } catch (error: any) {
            setLocationError(error.message)
            return createWhatsAppMessage(undefined, undefined, extraData)
        } finally {
            setIsLoadingLocation(false)
        }
    }

    const handleContactClick = () => {
        setStep(0)
        setIsPopupOpen(true)
    }

    const handleNextStep = () => setStep(step + 1)
    const handlePrevStep = () => { if (step > 0) setStep(step - 1) }

    const handlePopupConfirm = async () => {
        setIsPopupOpen(false)
        const whatsappLink = await generateWhatsAppLink(true, customData)
        if (whatsappLink) window.open(whatsappLink, "_blank")
    }

    const handlePopupCancel = async () => {
        setIsPopupOpen(false)
        const defaultData = { ...customData, quantite: 1, taillePointure: "", phone: "", name: "" }
        const whatsappLink = await generateWhatsAppLink(true, defaultData)
        if (whatsappLink) window.open(whatsappLink, "_blank")
    }

    const handleContactWithoutLocation = async () => {
        const whatsappLink = await generateWhatsAppLink(false)
        if (whatsappLink) window.open(whatsappLink, "_blank")
    }

    const handleCallSeller = () => {
        const phoneClean = product.whatsapp_number?.replace(/\D/g, "")
        if (phoneClean) window.open(`tel:${phoneClean}`)
        else alert("Numéro de téléphone non disponible")
    }

    const formSteps = []

    if (isClothing || isShoes) {
        formSteps.push({
            key: "size",
            title: isClothing ? "Choisissez votre taille" : "Choisissez votre pointure",
            icon: <Package className="w-5 h-5" />,
            content: (
                <div className="space-y-4">
                    <p className="text-gray-600 text-sm">{isClothing ? "Sélectionnez la taille qui vous convient" : "Sélectionnez votre pointure"}</p>
                    <div className="grid grid-cols-3 gap-2">
                        {(isClothing ? taillesVetements : pointuresChaussures).map(size => (
                            <motion.button key={size} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setCustomData({ ...customData, taillePointure: size })} className={`px-4 py-3 rounded-xl font-medium transition-all duration-300 ${customData.taillePointure === size ? "bg-gradient-to-r from-yellow-400 to-yellow-500 text-white shadow-lg shadow-yellow-200 border-2 border-yellow-300" : "bg-white hover:bg-yellow-50 text-gray-700 border-2 border-gray-200 hover:border-yellow-300"}`}>{size}</motion.button>
                        ))}
                    </div>
                </div>
            )
        })
    }

    formSteps.push({
        key: "quantity",
        title: "Quantité souhaitée",
        icon: <Hash className="w-5 h-5" />,
        content: (
            <div className="space-y-4">
                <p className="text-gray-600 text-sm">Combien d'articles souhaitez-vous commander ?</p>
                <div className="flex items-center space-x-4">
                    <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => customData.quantite > 1 && setCustomData({ ...customData, quantite: customData.quantite - 1 })} className="w-12 h-12 rounded-full bg-gray-100 hover:bg-yellow-100 text-gray-700 hover:text-yellow-700 font-bold text-xl flex items-center justify-center transition-all duration-200">−</motion.button>
                    <div className="flex-1 text-center">
                        <div className="text-3xl font-bold text-yellow-600">{customData.quantite}</div>
                        <div className="text-sm text-gray-500">article{customData.quantite > 1 ? 's' : ''}</div>
                    </div>
                    <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => setCustomData({ ...customData, quantite: customData.quantite + 1 })} className="w-12 h-12 rounded-full bg-gray-100 hover:bg-yellow-100 text-gray-700 hover:text-yellow-700 font-bold text-xl flex items-center justify-center transition-all duration-200">+</motion.button>
                </div>
                <div className="mt-6 text-center bg-yellow-50/50 p-4 rounded-xl border-2 border-yellow-200/50">
                    <p className="text-sm text-yellow-700">Prix total estimé</p>
                    <p className="text-2xl font-bold text-yellow-900 mt-1">{prixTotal.toLocaleString()} FCFA</p>
                    <AnimatePresence>
                        {isWholesaleApplied && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="flex items-center justify-center gap-1 text-xs text-green-600 font-semibold mt-1">
                                <CheckCircle2 size={14}/> Prix de gros appliqué !
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        )
    })

    if (!customerName) {
        formSteps.push({
            key: "name",
            title: "Votre nom",
            icon: <User className="w-5 h-5" />,
            content: (
                <div className="space-y-4">
                    <p className="text-gray-600 text-sm">Comment souhaitez-vous être appelé ?</p>
                    <input placeholder="Entrez votre nom" value={customData.name} onChange={(e) => setCustomData({ ...customData, name: e.target.value })} className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-yellow-400 focus:outline-none transition-all duration-200 text-gray-800 placeholder-gray-400" />
                </div>
            )
        })
    }

    formSteps.push({
        key: "phone",
        title: "Votre numéro",
        icon: <Phone className="w-5 h-5" />,
        content: (
            <div className="space-y-4">
                <p className="text-gray-600 text-sm">Pour vous contacter concernant la livraison</p>
                <input type="tel" placeholder="Ex: 77 123 45 67" value={customData.phone} onChange={(e) => setCustomData({ ...customData, phone: e.target.value })} className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-yellow-400 focus:outline-none transition-all duration-200 text-gray-800 placeholder-gray-400" />
            </div>
        )
    })

    const currentStepData = formSteps[step]
    const isLastStep = step === formSteps.length - 1

    return (
        <div className={`space-y-3 ${className}`}>
            {product.whatsapp_number && (
                <motion.button variants={buttonVariants} initial="initial" whileHover="hover" whileTap="tap" onClick={handleContactClick} disabled={isLoadingLocation} className={`w-full relative overflow-hidden rounded-2xl shadow-xl transition-all duration-300 ${isLoadingLocation ? "bg-gradient-to-r from-gray-400 to-gray-500" : "bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700"} text-white font-bold py-5 px-6 disabled:cursor-not-allowed`}>
                    <motion.div variants={pulseVariants} initial="initial" animate={!isLoadingLocation ? "animate" : "initial"} className="flex items-center justify-center gap-3">
                        {isLoadingLocation ? (<><Loader2 className="animate-spin" size={24} /> <span className="text-lg">Localisation...</span></>) : (<><div className="flex items-center gap-2"><MessageCircle size={24} /><MapPin size={20} /></div><div className="text-left"><div className="text-lg font-bold">Commander maintenant</div><div className="text-sm opacity-90">WhatsApp + Localisation</div></div></>)}
                    </motion.div>
                    <div className="absolute inset-0 -skew-x-12 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </motion.button>
            )}
            <div className="grid grid-cols-2 gap-3">
                {product.whatsapp_number && (<motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleContactWithoutLocation} className="bg-white hover:bg-yellow-50 text-gray-700 font-medium py-3 px-4 rounded-xl border-2 border-gray-200 hover:border-yellow-300 transition-all duration-300 text-sm"><MessageCircle size={16} className="mx-auto mb-1" />Sans localisation</motion.button>)}
                {product.whatsapp_number && (<motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleCallSeller} className="bg-white hover:bg-yellow-50 text-gray-700 font-medium py-3 px-4 rounded-xl border-2 border-gray-200 hover:border-yellow-300 transition-all duration-300 text-sm"><Phone size={16} className="mx-auto mb-1" />Appeler</motion.button>)}
            </div>
            <AnimatePresence>
                {locationError && (<motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-xl p-4 shadow-sm"><div className="flex items-start gap-3"><AlertTriangle className="text-orange-500 flex-shrink-0 mt-0.5" size={20} /><div><p className="text-sm text-orange-700 font-medium">Erreur de géolocalisation</p><p className="text-xs text-orange-600 mt-1">{locationError}</p></div></div></motion.div>)}
            </AnimatePresence>
            <Dialog open={isPopupOpen} onOpenChange={setIsPopupOpen}>
                <DialogContent className="sm:max-w-[450px] rounded-3xl border-0 shadow-2xl p-0 overflow-hidden">
                    <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 p-6 text-white">
                        <div className="flex items-center gap-3">
                            {currentStepData?.icon}
                            <div>
                                <DialogTitle className="text-xl font-bold text-white">{currentStepData?.title}</DialogTitle>
                                <p className="text-yellow-100 text-sm mt-1">Étape {step + 1} sur {formSteps.length}</p>
                            </div>
                        </div>
                        <div className="mt-4 bg-yellow-300/30 rounded-full h-2">
                            <motion.div className="bg-white rounded-full h-2" initial={{ width: 0 }} animate={{ width: `${((step + 1) / formSteps.length) * 100}%` }} transition={{ duration: 0.3 }} />
                        </div>
                    </div>
                    <div className="p-6">
                        <AnimatePresence mode="wait">
                            <motion.div key={step} variants={slideVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.3 }}>{currentStepData?.content}</motion.div>
                        </AnimatePresence>
                    </div>
                    <DialogFooter className="p-6 pt-0 flex justify-between">
                        <div className="flex gap-2">
                            {step > 0 && (<Button variant="outline" onClick={handlePrevStep} className="rounded-xl border-gray-300 hover:bg-gray-50">Précédent</Button>)}
                            <Button variant="outline" onClick={handlePopupCancel} className="rounded-xl border-gray-300 hover:bg-gray-50">Passer</Button>
                        </div>
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            {isLastStep ? (<Button onClick={handlePopupConfirm} className="bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-white rounded-xl px-8 shadow-lg"><ShoppingCart className="w-4 h-4 mr-2" />Commander</Button>) : (<Button onClick={handleNextStep} className="bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-white rounded-xl px-6">Suivant</Button>)}
                        </motion.div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}