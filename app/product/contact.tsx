'use client'

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
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

export default function ProductContact({ product, customerName, className = "" }: ProductContactProps) {
    const [isLoadingLocation, setIsLoadingLocation] = useState(false)
    const [locationError, setLocationError] = useState<string | null>(null)
    const [isPopupOpen, setIsPopupOpen] = useState(false)
    const [customData, setCustomData] = useState({
        taillePointure: "",
        quantite: 1,
        phone: "",
        name: ""
    })

    const clientDisplayName = customerName && customerName.trim() !== "" ? customerName : "ClientSangse"

    // Obtenir position GPS
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

    // Géocodage inverse avec adresse courte
    const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`)
            const data = await res.json()
            const addr = data.address || {}
            const shortAddress = `${addr.road || ''} ${addr.house_number || ''}, ${addr.city || addr.town || addr.village || ''}`.trim()
            return shortAddress || "Adresse introuvable"
        } catch {
            return "Adresse non trouvée"
        }
    }

    // Crée message WhatsApp
    const createWhatsAppMessageWithLocation = async (extraData?: typeof customData): Promise<string | null> => {
        try {
            setIsLoadingLocation(true)
            setLocationError(null)

            const location = await getCurrentLocation()
            const adresse = await reverseGeocode(location.lat, location.lng)
            const osmLink = `https://www.openstreetmap.org/?mlat=${location.lat}&mlon=${location.lng}#map=18/${location.lat}/${location.lng}`

            const structuredMessage = `🛍️ *Nouvelle commande SangseShop*

📦 Produit : ${product.title}
💰 Prix : ${product.price.toLocaleString()} FCFA
🔗 Voir produit : https://sangse.shop/product/${product.id}

🙋 Client : ${extraData?.name || clientDisplayName}
${extraData?.taillePointure ? `🎯 ${extraData.taillePointure}` : ""}
📦 Quantité : ${extraData?.quantite || 1}
📞 Téléphone : ${extraData?.phone || "non fourni"}
👉 Dispo ou bien ?

📍 Adresse : ${adresse}
🗺️ Itinéraire : ${osmLink}`

            const whatsappClean = product.whatsapp_number?.replace(/\D/g, "")
            return whatsappClean ? `https://wa.me/${whatsappClean}?text=${encodeURIComponent(structuredMessage)}` : null
        } catch (error: any) {
            setLocationError(error.message)
            const fallbackMessage = `🛍️ *Commande SangseShop*

📦 Produit : ${product.title}
💰 Prix : ${product.price.toLocaleString()} FCFA
🙋 Client : ${extraData?.name || clientDisplayName}
${extraData?.taillePointure ? `🎯 ${extraData.taillePointure}` : ""}
📦 Quantité : ${extraData?.quantite || 1}
📞 Téléphone : ${extraData?.phone || "non fourni"}
👉 Dispo ou bien ?

📍 Livraison : adresse à préciser par téléphone
🔗 Voir produit : https://sangse.shop/product/${product.id}`

            const whatsappClean = product.whatsapp_number?.replace(/\D/g, "")
            return whatsappClean ? `https://wa.me/${whatsappClean}?text=${encodeURIComponent(fallbackMessage)}` : null
        } finally {
            setIsLoadingLocation(false)
        }
    }

    // Popup
    const handleContactClick = () => setIsPopupOpen(true)
    const handlePopupConfirm = async () => {
        setIsPopupOpen(false)
        const whatsappLink = await createWhatsAppMessageWithLocation(customData)
        if (whatsappLink) window.open(whatsappLink, "_blank")
    }
    const handlePopupCancel = async () => {
        setIsPopupOpen(false)
        const whatsappLink = await createWhatsAppMessageWithLocation()
        if (whatsappLink) window.open(whatsappLink, "_blank")
    }

    const handleContactWithoutLocation = async () => {
        const whatsappLink = await createWhatsAppMessageWithLocation()
        if (whatsappLink) window.open(whatsappLink, "_blank")
    }

    const handleCallSeller = () => {
        const phoneClean = product.whatsapp_number?.replace(/\D/g, "")
        if (phoneClean) window.open(`tel:${phoneClean}`)
        else alert("Numéro de téléphone non disponible")
    }

    return (
        <div className={`space-y-4 ${className}`}>
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
                                <span>WhatsApp avec localisation</span>
                            </>
                        )}
                    </div>
                </button>
            )}

            {product.whatsapp_number && (
                <button
                    onClick={handleContactWithoutLocation}
                    className="w-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 font-medium py-3 px-6 rounded-xl border border-gray-300 dark:border-gray-600 transition-all duration-300"
                >
                    WhatsApp sans localisation
                </button>
            )}

            {product.whatsapp_number && (
                <button
                    onClick={handleCallSeller}
                    className="w-full bg-yellow-500 hover:bg-yellow-600 text-[#1C2B49] font-bold py-3 px-6 rounded-xl shadow-md transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                >
                    <Phone size={18} />
                    Appeler le vendeur
                </button>
            )}

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

            {/* Popup shadcn/ui */}
            <Dialog open={isPopupOpen} onOpenChange={setIsPopupOpen}>
                <DialogContent className="sm:max-w-[400px]">
                    <DialogHeader>
                        <DialogTitle>Informations de commande</DialogTitle>
                    </DialogHeader>

                    {(product.title.toLowerCase().includes("vêtement") || product.title.toLowerCase().includes("chaussure")) && (
                        <>
                            <Label className="mt-2">{product.title.toLowerCase().includes("vêtement") ? "Taille" : "Pointure"}</Label>
                            <Input
                                placeholder={product.title.toLowerCase().includes("vêtement") ? "Ex: M, L, XL" : "Ex: 42"}
                                value={customData.taillePointure}
                                onChange={(e) => setCustomData({ ...customData, taillePointure: e.target.value })}
                            />
                        </>
                    )}

                    <Label className="mt-2">Quantité</Label>
                    <Input
                        type="number"
                        min={1}
                        value={customData.quantite}
                        onChange={(e) => setCustomData({ ...customData, quantite: Number(e.target.value) })}
                    />

                    <Label className="mt-2">Téléphone</Label>
                    <Input
                        type="tel"
                        placeholder="Ex: 77XXXXXXX"
                        value={customData.phone}
                        onChange={(e) => setCustomData({ ...customData, phone: e.target.value })}
                    />

                    {!customerName && (
                        <>
                            <Label className="mt-2">Nom</Label>
                            <Input
                                placeholder="Votre nom"
                                value={customData.name}
                                onChange={(e) => setCustomData({ ...customData, name: e.target.value })}
                            />
                        </>
                    )}

                    <DialogFooter className="flex justify-between mt-4">
                        <Button variant="outline" onClick={handlePopupCancel}>Ignorer</Button>
                        <Button onClick={handlePopupConfirm}>Envoyer</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
