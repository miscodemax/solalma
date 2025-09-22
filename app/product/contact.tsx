'use client'

import { useState } from "react"
import { MessageCircle, MapPin, Loader2, AlertTriangle, Image as ImageIcon, Phone } from "lucide-react"

interface ProductContactProps {
    product: {
        id: number
        title: string
        price: number
        whatsapp_number?: string
        phone_number?: string
        image_url?: string
    }
    customerName?: string
    className?: string
}

export default function ProductContact({
    product,
    customerName = "Client SangseShop",
    className = ""
}: ProductContactProps) {
    const [isLoadingLocation, setIsLoadingLocation] = useState(false)
    const [locationError, setLocationError] = useState<string | null>(null)

    // Obtenir position GPS
    const getCurrentLocation = (): Promise<{ lat: number; lng: number }> => {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error("La géolocalisation n'est pas supportée par votre navigateur"))
                return
            }
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    resolve({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    })
                },
                (error) => {
                    let errorMessage = "Erreur de géolocalisation"
                    switch (error.code) {
                        case error.PERMISSION_DENIED:
                            errorMessage = "Permission de localisation refusée"
                            break
                        case error.POSITION_UNAVAILABLE:
                            errorMessage = "Position indisponible"
                            break
                        case error.TIMEOUT:
                            errorMessage = "Timeout de localisation"
                            break
                    }
                    reject(new Error(errorMessage))
                },
                { enableHighAccuracy: true, timeout: 15000, maximumAge: 300000 }
            )
        })
    }

    // Géocodage inverse avec OpenStreetMap
    const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
        try {
            const res = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
            )
            const data = await res.json()
            return data.display_name || "Adresse introuvable"
        } catch (err) {
            return "Adresse non trouvée: " + err
        }
    }

    // Message WhatsApp avec adresse complète
    const createWhatsAppMessageWithLocation = async (): Promise<string | null> => {
        try {
            setIsLoadingLocation(true)
            setLocationError(null)

            const location = await getCurrentLocation()
            const adresse = await reverseGeocode(location.lat, location.lng)

            const structuredMessage = `🛍️ NOUVELLE COMMANDE - SangseShop

📱 Produit: "${product.title}"
💰 Prix: ${product.price.toLocaleString()} FCFA

👤 Client: ${customerName}

❓ Le produit est-il encore disponible ?

📍 Adresse de livraison: ${adresse}

🔗 Voir le produit: https://sangse.shop/product/${product.id}`

            const whatsappClean = product.whatsapp_number?.replace(/\D/g, "")
            return whatsappClean
                ? `https://wa.me/${whatsappClean}?text=${encodeURIComponent(structuredMessage)}`
                : null
        } catch (error: any) {
            setLocationError(error.message)

            const fallbackMessage = `🛍️ COMMANDE - SangseShop

📱 Produit: "${product.title}"
💰 Prix: ${product.price.toLocaleString()} FCFA

👤 Client: ${customerName}

📍 Livraison: localisation exacte à préciser par téléphone

🔗 Voir le produit: https://sangse.shop/product/${product.id}`

            const whatsappClean = product.whatsapp_number?.replace(/\D/g, "")
            return whatsappClean
                ? `https://wa.me/${whatsappClean}?text=${encodeURIComponent(fallbackMessage)}`
                : null
        } finally {
            setIsLoadingLocation(false)
        }
    }

    const handleContactClick = async () => {
        const whatsappLink = await createWhatsAppMessageWithLocation()
        if (whatsappLink) window.open(whatsappLink, "_blank")
    }

    const handleContactWithoutLocation = () => {
        const basicMessage = `🛍️ COMMANDE SangseShop

📱 Produit: "${product.title}"
💰 Prix: ${product.price.toLocaleString()} FCFA

👤 Client: ${customerName}

📍 Livraison: adresse à préciser par téléphone

🔗 Voir le produit: https://sangse.shop/product/${product.id}`

        const whatsappClean = product.whatsapp_number?.replace(/\D/g, "")
        if (whatsappClean) {
            window.open(`https://wa.me/${whatsappClean}?text=${encodeURIComponent(basicMessage)}`, "_blank")
        }
    }

    const handleCallSeller = () => {
        if (product.whatsapp_number) {
            const phoneClean = product.whatsapp_number.replace(/\D/g, "")
            window.open(`tel:${phoneClean}`)
        } else {
            alert("Numéro de téléphone non disponible")
        }
    }

    if (!product.whatsapp_number && !product.whatsapp_number) {
        return (
            <div className={`bg-gray-100 dark:bg-gray-800 p-6 rounded-2xl border ${className}`}>
                <div className="text-center text-gray-600 dark:text-gray-400">
                    <MessageCircle className="mx-auto mb-3" size={24} />
                    <p>Contact WhatsApp et téléphone non disponible</p>
                </div>
            </div>
        )
    }

    return (
        <div className={`space-y-4 ${className}`}>
            {/* Bouton WhatsApp avec géolocalisation */}
            {product.whatsapp_number && (
                <button
                    onClick={handleContactClick}
                    disabled={isLoadingLocation}
                    className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-4 px-6 rounded-2xl shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-50"
                >
                    <div className="flex items-center justify-center gap-3">
                        {isLoadingLocation ? (
                            <>
                                <Loader2 className="animate-spin" size={20} />
                                <span>Localisation en cours...</span>
                            </>
                        ) : (
                            <>
                                <MessageCircle size={20} />
                                <MapPin size={16} />
                                <span>Contacter via WhatsApp avec localisation</span>
                            </>
                        )}
                    </div>
                </button>
            )}

            {/* Bouton WhatsApp sans géolocalisation */}
            {product.whatsapp_number && (
                <button
                    onClick={handleContactWithoutLocation}
                    className="w-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 font-medium py-3 px-6 rounded-xl border border-gray-300 dark:border-gray-600 transition-all duration-300"
                >
                    <div className="flex items-center justify-center gap-2">
                        <MessageCircle size={18} />
                        <span>Contacter via WhatsApp sans localisation</span>
                    </div>
                </button>
            )}

            {/* Bouton Appel direct */}
            {product.whatsapp_number && (
                <button
                    onClick={handleCallSeller}
                    className="w-full bg-yellow-500 hover:bg-yellow-600 text-[#1C2B49] font-bold py-3 px-6 rounded-xl shadow-md transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                >
                    <Phone size={18} />
                    <span>Appeler le vendeur</span>
                </button>
            )}

            {/* Erreur géolocalisation */}
            {locationError && (
                <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                        <AlertTriangle className="text-orange-500 flex-shrink-0 mt-0.5" size={20} />
                        <div>
                            <p className="text-sm text-orange-700 dark:text-orange-300 font-medium">Erreur</p>
                            <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">{locationError}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Rappel UX image produit */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                <div className="flex items-start gap-3">
                    <ImageIcon className="text-blue-500 flex-shrink-0 mt-0.5" size={18} />
                    <div>
                        <p className="text-sm text-blue-700 dark:text-blue-300 font-medium">Image du produit</p>
                        <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                            L’image s’affichera automatiquement dans WhatsApp grâce aux métadonnées de la page produit
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
