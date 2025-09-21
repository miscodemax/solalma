"use client"
import { useState } from "react"
import { MessageCircle, MapPin, Loader2, AlertTriangle, Image as ImageIcon } from "lucide-react"

// Tableau des zones au Sénégal
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

// Fonction pour trouver la zone la plus proche
function getClosestLocation(lat: number, lng: number) {
    let closest = SENEGAL_LOCATIONS[0]
    let minDist = Infinity
    SENEGAL_LOCATIONS.forEach((loc) => {
        const dist = Math.sqrt((loc.lat - lat) ** 2 + (loc.lng - lng) ** 2)
        if (dist < minDist) {
            closest = loc
            minDist = dist
        }
    })
    return closest.name
}

interface ProductContactProps {
    product: {
        id: number
        title: string
        price: number
        whatsapp_number?: string
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
    const getCurrentLocation = (): Promise<{ lat: number; lng: number; accuracy: number }> => {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error("La géolocalisation n'est pas supportée par votre navigateur"))
                return
            }
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    resolve({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                        accuracy: position.coords.accuracy
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

    // Créer message WhatsApp avec zone
    const createWhatsAppMessageWithLocation = async (): Promise<string | null> => {
        try {
            setIsLoadingLocation(true)
            setLocationError(null)

            const location = await getCurrentLocation()
            const closestZone = getClosestLocation(location.lat, location.lng)

            const structuredMessage = `🛍️ NOUVELLE COMMANDE - SangseShop

📱 Produit: "${product.title}"
💰 Prix: ${product.price.toLocaleString()} FCFA

👤 Client: ${customerName}

❓ Le produit est-il encore disponible ?

📍 Adresse de livraison: ${closestZone}

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

    if (!product.whatsapp_number) {
        return (
            <div className={`bg-gray-100 dark:bg-gray-800 p-6 rounded-2xl border ${className}`}>
                <div className="text-center text-gray-600 dark:text-gray-400">
                    <MessageCircle className="mx-auto mb-3" size={24} />
                    <p>Contact WhatsApp non disponible</p>
                </div>
            </div>
        )
    }

    return (
        <div className={`space-y-4 ${className}`}>
            {/* Bouton avec géolocalisation */}
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
                            <span>Contacter avec ma localisation</span>
                        </>
                    )}
                </div>
            </button>

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

            {/* Bouton sans géolocalisation */}
            <button
                onClick={handleContactWithoutLocation}
                className="w-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 font-medium py-3 px-6 rounded-xl border border-gray-300 dark:border-gray-600 transition-all duration-300"
            >
                <div className="flex items-center justify-center gap-2">
                    <MessageCircle size={18} />
                    <span>Contacter sans localisation</span>
                </div>
            </button>

            {/* Rappel UX */}
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
