'use client'

import { useState, useMemo } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { MessageCircle, MapPin, Loader2, AlertTriangle, Phone, ShoppingCart, User, Package, Hash, CheckCircle2 } from "lucide-react"

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
    const [isConfirmOpen, setIsConfirmOpen] = useState(false) // <-- confirmation popup state
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

    const { prixTotal, prixUnitaireApplicable, isWholesaleApplied } = useMemo(() => {
        const isWholesalePossible = product.has_wholesale && product.wholesale_price != null && product.min_wholesale_qty != null
        const isWholesaleApplied = isWholesalePossible && customData.quantite >= product.min_wholesale_qty!
        const prixUnitaire = isWholesaleApplied ? product.wholesale_price! : product.price
        const total = prixUnitaire * customData.quantite

        return {
            prixTotal: total,
            prixUnitaireApplicable: prixUnitaire,
            isWholesaleApplied: isWholesaleApplied
        }
    }, [customData.quantite, product])

    // LOCALISATION RAPIDE - Une seule tentative optimisée
    const getCurrentLocation = (): Promise<{ lat: number; lng: number }> => {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                return reject(new Error("Géolocalisation non supportée"))
            }

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    resolve({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    })
                },
                (err) => {
                    let errorMessage = "Erreur de géolocalisation"
                    switch (err.code) {
                        case err.PERMISSION_DENIED: 
                            errorMessage = "Activez la localisation dans les paramètres"
                            break
                        case err.POSITION_UNAVAILABLE: 
                            errorMessage = "Position indisponible"
                            break
                        case err.TIMEOUT: 
                            errorMessage = "Timeout - Réessayez"
                            break
                    }
                    reject(new Error(errorMessage))
                },
                {
                    enableHighAccuracy: true,
                    timeout: 8000,  // 8 secondes max
                    maximumAge: 30000  // Cache de 30s acceptable
                }
            )
        })
    }

    // Lien Google Maps direct (comme Yango) - Simple et efficace
    const createGoogleMapsLink = (lat: number, lng: number) => {
        return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`
    }

    const createWhatsAppMessage = (mapsLink?: string, extraData?: typeof customData) => {
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

🔗 *Voir le produit :*
https://sangse.shop/product/${product.id}
`

        if (mapsLink) {
            message += `
📍 *Itinéraire vers le client :*
${mapsLink}

👉 *Dispo ou bien ?*`
        } else {
            message += `
📍 *Livraison :* Adresse à confirmer

👉 *Dispo ou bien ?*`
        }

        const whatsappClean = product.whatsapp_number?.replace(/\D/g, "")
        return whatsappClean ? `https://wa.me/${whatsappClean}?text=${encodeURIComponent(message)}` : null
    }

    const generateWhatsAppLink = async (withLocation: boolean, extraData?: typeof customData): Promise<string | null> => {
        if (!withLocation) {
            return createWhatsAppMessage(undefined, extraData)
        }

        try {
            setIsLoadingLocation(true)
            setLocationError(null)
            
            const location = await getCurrentLocation()
            const mapsLink = createGoogleMapsLink(location.lat, location.lng)
            
            return createWhatsAppMessage(mapsLink, extraData)
        } catch (error: any) {
            setLocationError(error.message)
            return createWhatsAppMessage(undefined, extraData)
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

    // When the user confirms in the confirmation popup -> proceed to generate link and redirect
    const handleConfirmContinue = async () => {
        setIsConfirmOpen(false)
        const whatsappLink = await generateWhatsAppLink(true, customData)
        if (whatsappLink) window.open(whatsappLink, "_blank")
    }

    // If user cancels confirmation we re-open the form popup so they can edit
    const handleConfirmCancel = () => {
        setIsConfirmOpen(false)
        setIsPopupOpen(true)
    }

    // Original behaviour for "Passer" button (sends with default data)
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
                            <button 
                                key={size}
                                onClick={() => setCustomData({ ...customData, taillePointure: size })} 
                                className={`px-4 py-3 rounded-xl font-medium transition-all ${
                                    customData.taillePointure === size 
                                        ? "bg-gradient-to-r from-yellow-400 to-yellow-500 text-white shadow-lg border-2 border-yellow-300" 
                                        : "bg-white hover:bg-yellow-50 text-gray-700 border-2 border-gray-200 hover:border-yellow-300"
                                }`}
                            >
                                {size}
                            </button>
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
                <p className="text-gray-600 text-sm">Combien d'articles souhaitez-vous ?</p>
                <div className="flex items-center space-x-4">
                    <button 
                        onClick={() => customData.quantite > 1 && setCustomData({ ...customData, quantite: customData.quantite - 1 })} 
                        className="w-12 h-12 rounded-full bg-gray-100 hover:bg-yellow-100 text-gray-700 font-bold text-xl transition"
                    >
                        −
                    </button>
                    <div className="flex-1 text-center">
                        <div className="text-3xl font-bold text-yellow-600">{customData.quantite}</div>
                        <div className="text-sm text-gray-500">article{customData.quantite > 1 ? 's' : ''}</div>
                    </div>
                    <button 
                        onClick={() => setCustomData({ ...customData, quantite: customData.quantite + 1 })} 
                        className="w-12 h-12 rounded-full bg-gray-100 hover:bg-yellow-100 text-gray-700 font-bold text-xl transition"
                    >
                        +
                    </button>
                </div>
                <div className="mt-6 text-center bg-yellow-50 p-4 rounded-xl border-2 border-yellow-200">
                    <p className="text-sm text-yellow-700">Prix total estimé</p>
                    <p className="text-2xl font-bold text-yellow-900 mt-1">{prixTotal.toLocaleString()} FCFA</p>
                    {isWholesaleApplied && (
                        <div className="flex items-center justify-center gap-1 text-xs text-green-600 font-semibold mt-1">
                            <CheckCircle2 size={14}/> Prix de gros appliqué !
                        </div>
                    )}
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
                    <input 
                        placeholder="Entrez votre nom" 
                        value={customData.name} 
                        onChange={(e) => setCustomData({ ...customData, name: e.target.value })} 
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-yellow-400 focus:outline-none transition text-gray-800 placeholder-gray-400" 
                    />
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
                <input 
                    type="tel" 
                    placeholder="Ex: 77 123 45 67" 
                    value={customData.phone} 
                    onChange={(e) => setCustomData({ ...customData, phone: e.target.value })} 
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-yellow-400 focus:outline-none transition text-gray-800 placeholder-gray-400" 
                />
            </div>
        )
    })

    const currentStepData = formSteps[step]
    const isLastStep = step === formSteps.length - 1

    return (
        <div className={`space-y-3 ${className}`}>
            {product.whatsapp_number && (
                <button 
                    onClick={handleContactClick} 
                    disabled={isLoadingLocation} 
                    className={`w-full relative overflow-hidden rounded-2xl shadow-xl transition-all hover:scale-[1.02] active:scale-95 ${
                        isLoadingLocation 
                            ? "bg-gradient-to-r from-gray-400 to-gray-500" 
                            : "bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700"
                    } text-white font-bold py-5 px-6 disabled:cursor-not-allowed`}
                >
                    <div className="flex items-center justify-center gap-3">
                        {isLoadingLocation ? (
                            <>
                                <Loader2 className="animate-spin" size={24} /> 
                                <div className="text-left">
                                    <div className="text-lg font-bold">Localisation GPS...</div>
                                    <div className="text-xs opacity-90">Veuillez patienter</div>
                                </div>
                            </>
                        ) : (
                            <>
                                <MapPin size={24} />
                                <div className="text-left">
                                    <div className="text-lg font-bold">Commander maintenant</div>
                                    <div className="text-sm opacity-90">Avec itinéraire GPS</div>
                                </div>
                            </>
                        )}
                    </div>
                </button>
            )}
            <div className="grid grid-cols-2 gap-3">
                {product.whatsapp_number && (
                    <button 
                        onClick={handleContactWithoutLocation} 
                        className="bg-white hover:bg-yellow-50 text-gray-700 font-medium py-3 px-4 rounded-xl border-2 border-gray-200 hover:border-yellow-300 transition text-sm hover:scale-[1.02] active:scale-95"
                    >
                        <MessageCircle size={16} className="mx-auto mb-1" />
                        Sans GPS
                    </button>
                )}
                {product.whatsapp_number && (
                    <button 
                        onClick={handleCallSeller} 
                        className="bg-white hover:bg-yellow-50 text-gray-700 font-medium py-3 px-4 rounded-xl border-2 border-gray-200 hover:border-yellow-300 transition text-sm hover:scale-[1.02] active:scale-95"
                    >
                        <Phone size={16} className="mx-auto mb-1" />
                        Appeler
                    </button>
                )}
            </div>
            {locationError && (
                <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                        <AlertTriangle className="text-orange-500 flex-shrink-0 mt-0.5" size={20} />
                        <div>
                            <p className="text-sm text-orange-700 font-medium">Erreur GPS</p>
                            <p className="text-xs text-orange-600 mt-1">{locationError}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* FORM POPUP */}
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
                            <div 
                                className="bg-white rounded-full h-2 transition-all duration-300" 
                                style={{ width: `${((step + 1) / formSteps.length) * 100}%` }}
                            />
                        </div>
                    </div>
                    <div className="p-6">
                        {currentStepData?.content}
                    </div>
                    <DialogFooter className="p-6 pt-0 flex justify-between">
                        <div className="flex gap-2">
                            {step > 0 && (
                                <Button variant="outline" onClick={handlePrevStep} className="rounded-xl border-gray-300 hover:bg-gray-50">
                                    Précédent
                                </Button>
                            )}
                            <Button variant="outline" onClick={handlePopupCancel} className="rounded-xl border-gray-300 hover:bg-gray-50">
                                Passer
                            </Button>
                        </div>

                        {isLastStep ? (
                            // Instead of directly sending, open a confirmation popup
                            <Button onClick={() => { setIsPopupOpen(false); setIsConfirmOpen(true); }} className="bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-white rounded-xl px-8 shadow-lg hover:scale-105 active:scale-95 transition">
                                <ShoppingCart className="w-4 h-4 mr-2" />
                                Commander
                            </Button>
                        ) : (
                            <Button onClick={handleNextStep} className="bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-white rounded-xl px-6 hover:scale-105 active:scale-95 transition">
                                Suivant
                            </Button>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* CONFIRMATION POPUP (classy & modern summary) */}
            <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
                <DialogContent className="sm:max-w-[480px] rounded-3xl border-0 shadow-2xl p-0 overflow-hidden">
                    <div className="bg-gray-900 p-6 text-white">
                        <div className="flex items-center gap-4">
                            {product.image_url ? (
                                <img src={product.image_url} alt={product.title} className="w-16 h-16 object-cover rounded-lg border border-white/10" />
                            ) : (
                                <div className="w-16 h-16 bg-gray-800 rounded-lg flex items-center justify-center text-gray-300 text-sm">Image</div>
                            )}
                            <div>
                                <h3 className="text-lg font-bold">{product.title}</h3>
                                <p className="text-sm text-gray-300">{isClothing ? "Vêtement" : isShoes ? "Chaussure" : "Produit"}</p>
                            </div>
                        </div>

                        <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                            <div className="bg-white/5 p-3 rounded-lg">
                                <div className="text-xs text-gray-300">Quantité</div>
                                <div className="font-semibold text-white">{customData.quantite}</div>
                            </div>
                            <div className="bg-white/5 p-3 rounded-lg">
                                <div className="text-xs text-gray-300">{isClothing ? "Taille" : isShoes ? "Pointure" : "Option"}</div>
                                <div className="font-semibold text-white">{customData.taillePointure || "—"}</div>
                            </div>
                            <div className="bg-white/5 p-3 rounded-lg">
                                <div className="text-xs text-gray-300">Prix unitaire</div>
                                <div className="font-semibold text-white">{prixUnitaireApplicable.toLocaleString()} FCFA</div>
                            </div>
                            <div className="bg-white/5 p-3 rounded-lg">
                                <div className="text-xs text-gray-300">Prix total</div>
                                <div className="font-semibold text-white">{prixTotal.toLocaleString()} FCFA</div>
                            </div>
                        </div>

                        <div className="mt-4 p-4 bg-white/5 rounded-lg">
                            <div className="text-xs text-gray-300">Client</div>
                            <div className="font-semibold text-white">{customData.name || clientDisplayName}</div>
                            <div className="text-xs text-gray-400 mt-2">Téléphone</div>
                            <div className="font-medium text-white">{customData.phone || "Non fourni"}</div>
                        </div>

                        {locationError && (
                            <div className="mt-3 bg-orange-50/20 rounded-lg p-3 text-xs text-orange-300">
                                ⚠️ Note: {locationError}
                            </div>
                        )}
                    </div>

                    <div className="p-6 flex justify-between items-center">
                        <Button variant="ghost" onClick={handleConfirmCancel} className="rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50">
                            Annuler
                        </Button>
                        <Button onClick={handleConfirmContinue} className="bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl px-6 shadow-lg hover:scale-105 active:scale-95 transition">
                            Continuer
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}