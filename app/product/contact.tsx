"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Phone, Loader2 } from "lucide-react"

interface ProductContactProps {
    product: {
        id: number
        title: string
        price: number
        category: "vetement" | "chaussure" | string
        whatsapp_number?: string
    }
    customerName?: string
}

export default function ProductContact({ product, customerName }: ProductContactProps) {
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [name, setName] = useState(customerName || "")
    const [phone, setPhone] = useState("")
    const [quantity, setQuantity] = useState(1)
    const [sizeOrPointure, setSizeOrPointure] = useState("")
    const [isLoadingLocation, setIsLoadingLocation] = useState(false)
    const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null)

    // Obtenir la position GPS
    const getCurrentLocation = (): Promise<{ lat: number; lng: number }> => {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) return reject(new Error("La géolocalisation n'est pas supportée"))
            navigator.geolocation.getCurrentPosition(
                (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
                (err) => reject(err),
                { enableHighAccuracy: true, timeout: 15000, maximumAge: 300000 }
            )
        })
    }

    const handleWhatsAppRedirect = async () => {
        setIsLoadingLocation(true)
        let adresseText = "Adresse à préciser par téléphone"
        try {
            const loc = await getCurrentLocation()
            setLocation(loc)
            adresseText = `https://www.openstreetmap.org/?mlat=${loc.lat}&mlon=${loc.lng}#map=18/${loc.lat}/${loc.lng}`
        } catch {
            // Ignore si géolocalisation échoue
        } finally {
            setIsLoadingLocation(false)
        }

        const fields: string[] = []
        if (name) fields.push(`Nom: ${name}`)
        if (phone) fields.push(`Téléphone: ${phone}`)
        if (quantity) fields.push(`Quantité: ${quantity}`)
        if (sizeOrPointure)
            fields.push(product.category === "vetement" ? `Taille: ${sizeOrPointure}` : `Pointure: ${sizeOrPointure}`)
        fields.push(`Adresse: ${adresseText}`)

        const message = `🛍️ *Commande SangseShop*\n\n📦 Produit: ${product.title}\n💰 Prix: ${product.price.toLocaleString()} FCFA\n${fields.join(
            "\n"
        )}\n🔗 Voir produit: https://sangse.shop/product/${product.id}`

        const whatsappClean = product.whatsapp_number?.replace(/\D/g, "")
        if (whatsappClean) {
            window.open(`https://wa.me/${whatsappClean}?text=${encodeURIComponent(message)}`, "_blank")
        }
        setIsDialogOpen(false)
    }

    return (
        <>
            <Button
                className="w-full bg-green-500 hover:bg-green-600 text-white py-4 rounded-xl shadow-md flex items-center justify-center gap-2"
                onClick={() => setIsDialogOpen(true)}
            >
                {isLoadingLocation ? <Loader2 className="animate-spin" size={18} /> : <Phone size={18} />}
                Contacter par WhatsApp
            </Button>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-md mx-auto p-6 rounded-2xl">
                    <DialogHeader>
                        <DialogTitle>Infos pour contacter le vendeur</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4 mt-4">
                        {!customerName && (
                            <div className="flex flex-col">
                                <Label>Nom (optionnel)</Label>
                                <Input placeholder="Votre nom" value={name} onChange={(e) => setName(e.target.value)} />
                            </div>
                        )}

                        <div className="flex flex-col">
                            <Label>Numéro de téléphone (optionnel)</Label>
                            <Input placeholder="Ex: 77xxxxxxx" value={phone} onChange={(e) => setPhone(e.target.value)} />
                        </div>

                        <div className="flex flex-col">
                            <Label>Quantité</Label>
                            <Input type="number" min={1} value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} />
                        </div>

                        {product.category === "vetement" && (
                            <div className="flex flex-col">
                                <Label>Taille (optionnelle)</Label>
                                <Select onValueChange={setSizeOrPointure} value={sizeOrPointure}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Choisir une taille" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {["XS", "S", "M", "L", "XL", "XXL"].map((size) => (
                                            <SelectItem key={size} value={size}>
                                                {size}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {product.category === "chaussure" && (
                            <div className="flex flex-col">
                                <Label>Pointure (optionnelle)</Label>
                                <Select onValueChange={setSizeOrPointure} value={sizeOrPointure}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Choisir une pointure" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Array.from({ length: 15 }, (_, i) => i + 35).map((pt) => (
                                            <SelectItem key={pt} value={pt.toString()}>
                                                {pt}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                    </div>

                    <DialogFooter className="mt-6 flex justify-between">
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                            Annuler
                        </Button>
                        <Button onClick={handleWhatsAppRedirect}>Envoyer à WhatsApp</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}
