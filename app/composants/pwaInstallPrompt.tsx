"use client"

import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Smartphone } from "lucide-react"

export default function PWAInstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
    const [open, setOpen] = useState(false)

    useEffect(() => {
        const handler = (e: any) => {
            e.preventDefault()
            setDeferredPrompt(e)
            setOpen(true) // ✅ Ouvre le pop-up
        }

        window.addEventListener("beforeinstallprompt", handler)
        return () => window.removeEventListener("beforeinstallprompt", handler)
    }, [])

    const handleInstall = async () => {
        if (!deferredPrompt) return
        deferredPrompt.prompt()
        const { outcome } = await deferredPrompt.userChoice
        console.log("Résultat installation :", outcome)
        setDeferredPrompt(null)
        setOpen(false)
    }

    if (!deferredPrompt) return null

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="rounded-2xl shadow-2xl">
                <DialogHeader className="text-center">
                    <Smartphone className="mx-auto mb-2 h-10 w-10 text-primary" />
                    <DialogTitle className="text-xl font-bold">
                        Installez <span className="text-primary">Sangse</span>
                    </DialogTitle>
                    <DialogDescription>
                        Accédez à vos produits préférés directement depuis l’écran d’accueil, comme une vraie application 📲
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="sm:justify-center">
                    <Button variant="default" size="lg" onClick={handleInstall} className="w-full">
                        Installer maintenant
                    </Button>
                    <Button variant="outline" size="lg" onClick={() => setOpen(false)} className="w-full">
                        Plus tard
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
