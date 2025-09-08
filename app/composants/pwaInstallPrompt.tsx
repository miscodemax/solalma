'use client'

import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Smartphone, X, Download, Zap, Wifi, Clock, Share, Plus } from "lucide-react"
import { motion } from "framer-motion"

export default function PWAInstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
    const [open, setOpen] = useState(false)
    const [isInstalling, setIsInstalling] = useState(false)
    const [showDelayed, setShowDelayed] = useState(false)
    const [isIOS, setIsIOS] = useState(false)
    const [isStandalone, setIsStandalone] = useState(false)



    useEffect(() => {
        const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
        const standalone = window.matchMedia('(display-mode: standalone)').matches ||
            (window.navigator as any).standalone === true

        setIsIOS(iOS)
        setIsStandalone(standalone)
        if (standalone) return

        const lastDismissed = localStorage.getItem('pwa-install-dismissed')
        const dismissCount = parseInt(localStorage.getItem('pwa-install-dismiss-count') || '0')

        if (iOS) {
            const iosLastDismissed = localStorage.getItem('pwa-install-ios-dismissed')
            const iosDismissCount = parseInt(localStorage.getItem('pwa-install-ios-dismiss-count') || '0')
            if (iosDismissCount >= 3) return
            if (iosLastDismissed) {
                const daysSinceLastDismiss = (Date.now() - parseInt(iosLastDismissed)) / (1000 * 60 * 60 * 24)
                if (daysSinceLastDismiss < 14) return
            }
            setTimeout(() => {
                setShowDelayed(true)
                setTimeout(() => setOpen(true), 500)
            }, 5000)
            return
        }

        const handler = (e: any) => {
            e.preventDefault()
            setDeferredPrompt(e)
            if (dismissCount >= 2) return
            if (lastDismissed) {
                const daysSinceLastDismiss = (Date.now() - parseInt(lastDismissed)) / (1000 * 60 * 60 * 24)
                if (daysSinceLastDismiss < 7) return
            }
            setTimeout(() => {
                setShowDelayed(true)
                setTimeout(() => setOpen(true), 500)
            }, 3000)
        }

        window.addEventListener("beforeinstallprompt", handler)
        return () => window.removeEventListener("beforeinstallprompt", handler)
    }, [])

    const handleInstall = async () => {
        if (!deferredPrompt) return
        setIsInstalling(true)
        try {
            await deferredPrompt.prompt()
            const { outcome } = await deferredPrompt.userChoice
            if (outcome === 'accepted') {
                localStorage.removeItem('pwa-install-dismiss-count')
                localStorage.removeItem('pwa-install-dismissed')
                setTimeout(() => {
                    setOpen(false)
                    setDeferredPrompt(null)
                    setIsInstalling(false)
                }, 1000)
            } else {
                setIsInstalling(false)
                handleDismiss()
            }
        } catch {
            setIsInstalling(false)
            setOpen(false)
        }
    }

    const handleDismiss = () => {
        if (isIOS) {
            const currentCount = parseInt(localStorage.getItem('pwa-install-ios-dismiss-count') || '0')
            localStorage.setItem('pwa-install-ios-dismiss-count', (currentCount + 1).toString())
            localStorage.setItem('pwa-install-ios-dismissed', Date.now().toString())
        } else {
            const currentCount = parseInt(localStorage.getItem('pwa-install-dismiss-count') || '0')
            localStorage.setItem('pwa-install-dismiss-count', (currentCount + 1).toString())
            localStorage.setItem('pwa-install-dismissed', Date.now().toString())
        }
        setOpen(false)
        setDeferredPrompt(null)
    }

    if (isStandalone || (!deferredPrompt && !isIOS) || !showDelayed) return null

    return (
        <Dialog open={open} onOpenChange={(open) => !open && handleDismiss()}>
            <DialogContent className="max-w-sm mx-auto rounded-3xl shadow-2xl border-0 overflow-hidden sm:max-w-md relative bg-white">

                {/* Bouton fermeture discret */}
                <button
                    onClick={handleDismiss}
                    className="absolute right-4 top-4 p-1 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors z-10"
                >
                    <X className="w-4 h-4 text-gray-500" />
                </button>

                {/* Animation icône smartphone */}
                <DialogHeader className="text-center pt-6 pb-4 relative">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.6, type: "spring", stiffness: 120 }}
                        className="relative mx-auto mb-4 w-14 h-14 flex items-center justify-center bg-gradient-to-r from-[#F6C445] to-[#1C2B49] rounded-3xl shadow-lg"
                    >
                        <Smartphone className="w-8 h-8 text-white" />
                    </motion.div>

                    <DialogTitle className="text-2xl font-bold text-[#1C2B49] mb-2">
                        Installez <span className="bg-gradient-to-r from-[#F6C445] to-[#1C2B49] bg-clip-text text-transparent">Sangse</span>
                    </DialogTitle>

                    <DialogDescription className="text-gray-600 text-base leading-relaxed px-2">
                        {isIOS ?
                            "Ajoutez Sangse à votre écran d'accueil pour une expérience optimale" :
                            "Profitez d'une expérience fluide et rapide avec notre app native"
                        }
                    </DialogDescription>
                </DialogHeader>

                {/* Avantages avec icônes */}
                <div className="px-6 py-4 space-y-3">
                    <div className="flex items-center space-x-3 text-sm text-[#1C2B49]">
                        <div className="bg-[#F6C445]/30 p-1.5 rounded-full">
                            <Zap className="w-4 h-4 text-[#F6C445]" />
                        </div>
                        <span>Accès instantané depuis l'écran d'accueil</span>
                    </div>

                    <div className="flex items-center space-x-3 text-sm text-[#1C2B49]">
                        <div className="bg-[#1C2B49]/10 p-1.5 rounded-full">
                            <Wifi className="w-4 h-4 text-[#1C2B49]" />
                        </div>
                        <span>Fonctionne même hors ligne</span>
                    </div>

                    <div className="flex items-center space-x-3 text-sm text-[#1C2B49]">
                        <div className="bg-[#F6C445]/20 p-1.5 rounded-full">
                            <Clock className="w-4 h-4 text-[#F6C445]" />
                        </div>
                        <span>Chargement ultra-rapide</span>
                    </div>
                </div>

                <DialogFooter className="flex-col space-y-3 px-6 pb-6">
                    {isIOS ? (
                        <>
                            <div className="bg-[#F8F9FB] border border-[#1C2B49]/20 rounded-xl p-4 text-sm">
                                <div className="font-semibold text-[#1C2B49] mb-2 flex items-center">
                                    <span>📱 Comment installer sur iOS :</span>
                                </div>
                                <ol className="space-y-1 text-[#1C2B49] list-decimal list-inside">
                                    <li className="flex items-center space-x-2">
                                        <Share className="w-4 h-4 inline flex-shrink-0" />
                                        <span>Appuyez sur le bouton de partage</span>
                                    </li>
                                    <li className="flex items-center space-x-2">
                                        <Plus className="w-4 h-4 inline flex-shrink-0" />
                                        <span>Sélectionnez "Sur l'écran d'accueil"</span>
                                    </li>
                                    <li>Confirmez en appuyant sur "Ajouter"</li>
                                </ol>
                            </div>
                            <Button
                                variant="ghost"
                                onClick={handleDismiss}
                                className="w-full text-[#1C2B49] hover:text-[#F6C445] hover:bg-[#F6C445]/10 py-2 rounded-xl transition-colors"
                            >
                                J'ai compris
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button
                                onClick={handleInstall}
                                disabled={isInstalling}
                                className="w-full bg-gradient-to-r from-[#F6C445] to-[#1C2B49] hover:from-[#E2AE32] hover:to-[#1C2B49] text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
                            >
                                {isInstalling ? (
                                    <div className="flex items-center space-x-2 justify-center">
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        <span>Installation...</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center space-x-2 justify-center">
                                        <Download className="w-4 h-4" />
                                        <span>Installer maintenant</span>
                                    </div>
                                )}
                            </Button>

                            <Button
                                variant="ghost"
                                onClick={handleDismiss}
                                className="w-full text-[#1C2B49] hover:text-[#F6C445] hover:bg-[#F6C445]/10 py-2 rounded-xl transition-colors"
                            >
                                Peut-être plus tard
                            </Button>
                        </>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
