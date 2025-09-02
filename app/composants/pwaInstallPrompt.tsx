"use client"

import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Smartphone, X, Download, Zap, Wifi, Clock, Share, Plus } from "lucide-react"

export default function PWAInstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
    const [open, setOpen] = useState(false)
    const [isInstalling, setIsInstalling] = useState(false)
    const [showDelayed, setShowDelayed] = useState(false)
    const [isIOS, setIsIOS] = useState(false)
    const [isStandalone, setIsStandalone] = useState(false)

    useEffect(() => {
        // Détecter iOS et le mode standalone
        const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
        const standalone = window.matchMedia('(display-mode: standalone)').matches ||
            (window.navigator as any).standalone === true

        setIsIOS(iOS)
        setIsStandalone(standalone)

        // Si déjà installé, ne pas afficher
        if (standalone) return

        // Vérifier si l'utilisateur a déjà refusé récemment
        const lastDismissed = localStorage.getItem('pwa-install-dismissed')
        const dismissCount = parseInt(localStorage.getItem('pwa-install-dismiss-count') || '0')

        // Pour iOS, afficher le guide manuel
        if (iOS) {
            const iosLastDismissed = localStorage.getItem('pwa-install-ios-dismissed')
            const iosDismissCount = parseInt(localStorage.getItem('pwa-install-ios-dismiss-count') || '0')

            if (iosDismissCount >= 3) return

            if (iosLastDismissed) {
                const daysSinceLastDismiss = (Date.now() - parseInt(iosLastDismissed)) / (1000 * 60 * 60 * 24)
                if (daysSinceLastDismiss < 14) return // Plus long pour iOS car plus intrusif
            }

            setTimeout(() => {
                setShowDelayed(true)
                setTimeout(() => setOpen(true), 500)
            }, 5000) // Plus long délai pour iOS
            return
        }

        const handler = (e: any) => {
            e.preventDefault()
            setDeferredPrompt(e)

            // Si l'utilisateur a refusé plus de 2 fois, ne plus afficher
            if (dismissCount >= 2) return

            // Si refusé récemment (moins de 7 jours), ne pas afficher
            if (lastDismissed) {
                const daysSinceLastDismiss = (Date.now() - parseInt(lastDismissed)) / (1000 * 60 * 60 * 24)
                if (daysSinceLastDismiss < 7) return
            }

            // Délai avant d'afficher le popup (meilleure UX)
            setTimeout(() => {
                setShowDelayed(true)
                setTimeout(() => setOpen(true), 500) // Animation d'entrée plus douce
            }, 3000) // Attendre 3 secondes après le chargement
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
                // Réinitialiser le compteur de refus si installé
                localStorage.removeItem('pwa-install-dismiss-count')
                localStorage.removeItem('pwa-install-dismissed')

                // Petit délai pour montrer le succès
                setTimeout(() => {
                    setOpen(false)
                    setDeferredPrompt(null)
                    setIsInstalling(false)
                }, 1000)
            } else {
                setIsInstalling(false)
                handleDismiss()
            }
        } catch (error) {
            console.error("Erreur lors de l'installation:", error)
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

    // Ne pas afficher si déjà en mode standalone ou pas le bon moment
    if (isStandalone || (!deferredPrompt && !isIOS) || !showDelayed) return null

    return (
        <Dialog open={open} onOpenChange={(open) => !open && handleDismiss()}>
            <DialogContent className="max-w-sm mx-auto rounded-3xl shadow-2xl border-0 bg-gradient-to-br from-white to-gray-50 overflow-hidden sm:max-w-md">
                {/* Bouton fermeture discret */}
                <button
                    onClick={handleDismiss}
                    className="absolute right-4 top-4 p-1 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors z-10"
                >
                    <X className="w-4 h-4 text-gray-500" />
                </button>

                {/* Animation de fond */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 opacity-60" />

                <div className="relative">
                    <DialogHeader className="text-center pt-6 pb-4">
                        {/* Icône avec animation */}
                        <div className="relative mx-auto mb-4">
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl blur animate-pulse opacity-20" />
                            <div className="relative bg-gradient-to-r from-blue-500 to-purple-600 p-3 rounded-2xl">
                                <Smartphone className="w-8 h-8 text-white" />
                            </div>
                        </div>

                        <DialogTitle className="text-2xl font-bold text-gray-900 mb-2">
                            Installez <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Sangse</span>
                        </DialogTitle>

                        <DialogDescription className="text-gray-600 text-base leading-relaxed px-2">
                            {isIOS ?
                                "Ajoutez Sangse à votre écran d'accueil pour une expérience optimale" :
                                "Profitez d'une expérience optimale avec notre app native"
                            }
                        </DialogDescription>
                    </DialogHeader>

                    {/* Avantages avec icônes */}
                    <div className="px-6 py-4 space-y-3">
                        <div className="flex items-center space-x-3 text-sm text-gray-700">
                            <div className="bg-green-100 p-1.5 rounded-full">
                                <Zap className="w-4 h-4 text-green-600" />
                            </div>
                            <span>Accès instantané depuis l'écran d'accueil</span>
                        </div>

                        <div className="flex items-center space-x-3 text-sm text-gray-700">
                            <div className="bg-blue-100 p-1.5 rounded-full">
                                <Wifi className="w-4 h-4 text-blue-600" />
                            </div>
                            <span>Fonctionne même hors ligne</span>
                        </div>

                        <div className="flex items-center space-x-3 text-sm text-gray-700">
                            <div className="bg-purple-100 p-1.5 rounded-full">
                                <Clock className="w-4 h-4 text-purple-600" />
                            </div>
                            <span>Chargement ultra-rapide</span>
                        </div>
                    </div>

                    <DialogFooter className="flex-col space-y-3 px-6 pb-6">
                        {isIOS ? (
                            /* Guide pour iOS */
                            <>
                                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm">
                                    <div className="font-semibold text-blue-800 mb-2 flex items-center">
                                        <span>📱 Comment installer sur iOS :</span>
                                    </div>
                                    <ol className="space-y-1 text-blue-700 list-decimal list-inside">
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
                                    className="w-full text-gray-600 hover:text-gray-800 hover:bg-gray-100 py-2 rounded-xl transition-colors"
                                >
                                    J'ai compris
                                </Button>
                            </>
                        ) : (
                            /* Boutons pour Android/autres */
                            <>
                                <Button
                                    onClick={handleInstall}
                                    disabled={isInstalling}
                                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
                                >
                                    {isInstalling ? (
                                        <div className="flex items-center space-x-2">
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            <span>Installation...</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center space-x-2">
                                            <Download className="w-4 h-4" />
                                            <span>Installer maintenant</span>
                                        </div>
                                    )}
                                </Button>

                                <Button
                                    variant="ghost"
                                    onClick={handleDismiss}
                                    className="w-full text-gray-600 hover:text-gray-800 hover:bg-gray-100 py-2 rounded-xl transition-colors"
                                >
                                    Peut-être plus tard
                                </Button>
                            </>
                        )}
                    </DialogFooter>
                </div>
            </DialogContent>
        </Dialog>
    )
}