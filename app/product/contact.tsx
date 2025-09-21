"use client"
import { useState } from 'react'
import { MessageCircle, MapPin, Loader2, AlertTriangle } from 'lucide-react'

interface ProductContactProps {
    product: {
        id: number
        title: string
        price: number
        whatsapp_number?: string
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

    // Fonction pour obtenir la position GPS du client
    const getCurrentLocation = (): Promise<{ lat: number, lng: number, accuracy: number }> => {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('La géolocalisation n\'est pas supportée par votre navigateur'))
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
                    let errorMessage = 'Erreur de géolocalisation'
                    switch (error.code) {
                        case error.PERMISSION_DENIED:
                            errorMessage = 'Permission de localisation refusée'
                            break
                        case error.POSITION_UNAVAILABLE:
                            errorMessage = 'Position indisponible'
                            break
                        case error.TIMEOUT:
                            errorMessage = 'Timeout de localisation'
                            break
                    }
                    reject(new Error(errorMessage))
                },
                {
                    enableHighAccuracy: true,
                    timeout: 15000,
                    maximumAge: 300000 // Cache pendant 5 minutes
                }
            )
        })
    }

    // Fonction pour créer le message WhatsApp avec localisation
    const createWhatsAppMessageWithLocation = async (): Promise<string | null> => {
        try {
            setIsLoadingLocation(true)
            setLocationError(null)

            // Récupérer la position GPS du client
            const location = await getCurrentLocation()

            // Créer le lien Google Maps
            const googleMapsLink = `https://maps.google.com/maps?q=${location.lat},${location.lng}&hl=fr`

            // Déterminer la précision
            const accuracyText = location.accuracy < 100
                ? `(précision: ${Math.round(location.accuracy)}m)`
                : `(précision approximative)`

            // Message structuré et professionnel
            const structuredMessage = `🛍️ NOUVELLE COMMANDE - SangseShop

👤 Client: ${customerName}
📱 Produit: "${product.title}"
💰 Prix: ${product.price.toLocaleString()} FCFA

❓ Le produit est-il encore disponible ?

📍 ADRESSE DE LIVRAISON:
Coordonnées GPS: ${location.lat.toFixed(6)}, ${location.lng.toFixed(6)} ${accuracyText}

🗺️ Lien Google Maps pour la livraison:
${googleMapsLink}

🔗 Lien produit: https://sangse.shop/product/${product.id}

Merci ! J'attends votre confirmation.`

            // Nettoyer le numéro WhatsApp
            const whatsappClean = product.whatsapp_number?.replace(/\D/g, "")

            // Créer le lien WhatsApp
            const whatsappLink = whatsappClean
                ? `https://wa.me/${whatsappClean}?text=${encodeURIComponent(structuredMessage)}`
                : null

            return whatsappLink

        } catch (error) {
            console.error('Erreur de géolocalisation:', error)
            setLocationError(error.message)

            // Message de fallback sans localisation précise
            const fallbackMessage = `🛍️ NOUVELLE COMMANDE - SangseShop

👤 Client: ${customerName}
📱 Produit: "${product.title}"
💰 Prix: ${product.price.toLocaleString()} FCFA

❓ Le produit est-il encore disponible ?

📍 LIVRAISON:
Localisation exacte à préciser par téléphone
(Géolocalisation non autorisée par le client)

🔗 Lien produit: https://sangse.shop/product/${product.id}

Merci ! Contactez-moi pour l'adresse de livraison.`

            const whatsappClean = product.whatsapp_number?.replace(/\D/g, "")
            const whatsappLink = whatsappClean
                ? `https://wa.me/${whatsappClean}?text=${encodeURIComponent(fallbackMessage)}`
                : null

            return whatsappLink
        } finally {
            setIsLoadingLocation(false)
        }
    }

    // Gestion du clic sur le bouton de contact
    const handleContactClick = async () => {
        const whatsappLink = await createWhatsAppMessageWithLocation()

        if (whatsappLink) {
            window.open(whatsappLink, '_blank')
        } else {
            alert('Numéro WhatsApp non disponible')
        }
    }

    // Gestion du contact sans géolocalisation
    const handleContactWithoutLocation = () => {
        const basicMessage = `🛍️ COMMANDE SangseShop

📱 Produit: "${product.title}"
💰 Prix: ${product.price.toLocaleString()} FCFA

Le produit est-il disponible ? 
Contactez-moi pour l'adresse de livraison.

🔗 https://sangse.shop/product/${product.id}`

        const whatsappClean = product.whatsapp_number?.replace(/\D/g, "")
        const whatsappLink = whatsappClean
            ? `https://wa.me/${whatsappClean}?text=${encodeURIComponent(basicMessage)}`
            : null

        if (whatsappLink) {
            window.open(whatsappLink, '_blank')
        } else {
            alert('Numéro WhatsApp non disponible')
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
            {/* Bouton principal avec géolocalisation */}
            <button
                onClick={handleContactClick}
                disabled={isLoadingLocation}
                className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-4 px-6 rounded-2xl shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
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

            {/* Message d'erreur de géolocalisation */}
            {locationError && (
                <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                        <AlertTriangle className="text-orange-500 flex-shrink-0 mt-0.5" size={20} />
                        <div>
                            <p className="text-sm text-orange-700 dark:text-orange-300 font-medium">
                                Géolocalisation échouée
                            </p>
                            <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                                {locationError}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Bouton alternatif sans géolocalisation */}
            <button
                onClick={handleContactWithoutLocation}
                className="w-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 font-medium py-3 px-6 rounded-xl border border-gray-300 dark:border-gray-600 transition-all duration-300"
            >
                <div className="flex items-center justify-center gap-2">
                    <MessageCircle size={18} />
                    <span>Contacter sans localisation</span>
                </div>
            </button>

            {/* Informations sur la géolocalisation */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                <div className="flex items-start gap-3">
                    <MapPin className="text-blue-500 flex-shrink-0 mt-0.5" size={18} />
                    <div>
                        <p className="text-sm text-blue-700 dark:text-blue-300 font-medium">
                            Livraison précise
                        </p>
                        <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                            Partagez votre localisation GPS pour une livraison plus rapide et précise
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}