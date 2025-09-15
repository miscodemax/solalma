'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog'
import { Smartphone, X } from 'lucide-react'

export default function SimplePWAInstall() {
    const [deferredPrompt, setDeferredPrompt] = useState(null)
    const [showInstallPrompt, setShowInstallPrompt] = useState(false)
    const [isIOS, setIsIOS] = useState(false)
    const [showIOSDialog, setShowIOSDialog] = useState(false)

    useEffect(() => {
        const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent)
        setIsIOS(isIOSDevice)

        const isStandalone = window.matchMedia('(display-mode: standalone)').matches
        if (isStandalone) return

        if (isIOSDevice) {
            setShowInstallPrompt(true)
            return
        }

        const handleBeforeInstallPrompt = (e) => {
            e.preventDefault()
            setDeferredPrompt(e)
            setShowInstallPrompt(true)
        }

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
        }
    }, [])

    const handleInstall = async () => {
        if (isIOS) {
            setShowIOSDialog(true)
            return
        }

        if (deferredPrompt) {
            deferredPrompt.prompt()
            const { outcome } = await deferredPrompt.userChoice
            if (outcome === 'accepted') setShowInstallPrompt(false)
            setDeferredPrompt(null)
        }
    }

    return (
        <>
            <AnimatePresence>
                {showInstallPrompt && (
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 50 }}
                        transition={{ duration: 0.3 }}
                        className="fixed bottom-16 left-4 right-4 z-[100]"
                    >
                        <div className="bg-white shadow-xl border rounded-2xl p-4 flex items-start space-x-3 max-w-sm mx-auto">
                            <div className="bg-yellow-400 text-white p-2 rounded-xl">
                                <Smartphone size={22} />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold text-gray-800">Installer Sangse</h3>
                                <p className="text-sm text-gray-600">
                                    Accédez plus vite à vos produits préférés, recevez une
                                    expérience fluide sans passer par le navigateur 🚀
                                </p>

                                <div className="mt-3 flex space-x-2">
                                    {/* Bouton avec animation pulse */}
                                    <motion.div
                                        animate={{
                                            scale: [1, 1.05, 1],
                                        }}
                                        transition={{
                                            duration: 1.5,
                                            repeat: Infinity,
                                            ease: 'easeInOut',
                                        }}
                                        className="flex-1"
                                    >
                                        <Button
                                            onClick={handleInstall}
                                            className="w-full bg-yellow-400 hover:bg-yellow-500 text-white"
                                        >
                                            {isIOS ? 'Voir instructions' : 'Installer'}
                                        </Button>
                                    </motion.div>

                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => setShowInstallPrompt(false)}
                                    >
                                        <X className="w-5 h-5 text-gray-500" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Dialog iOS instructions */}
            <Dialog open={showIOSDialog} onOpenChange={setShowIOSDialog}>
                <DialogContent className="rounded-2xl p-6">
                    <DialogHeader>
                        <DialogTitle className="text-lg font-bold text-gray-800">
                            Installer Sangse sur iPhone
                        </DialogTitle>
                        <DialogDescription className="text-sm text-gray-600">
                            Suivez ces étapes simples 👇
                        </DialogDescription>
                    </DialogHeader>

                    <div className="mt-4 space-y-4">
                        {/* Étape 1 */}
                        <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-yellow-100 text-yellow-600 font-bold">
                                1
                            </div>
                            <p className="text-sm text-gray-700">
                                Appuyez sur l’icône <span className="font-medium">Partager</span>
                                en bas de votre écran.
                            </p>

                        </div>

                        {/* Étape 2 */}
                        <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-yellow-100 text-yellow-600 font-bold">
                                2
                            </div>
                            <p className="text-sm text-gray-700">
                                Choisissez <span className="font-medium">Ajouter à l’écran d’accueil</span>.
                            </p>

                        </div>
                    </div>

                    <div className="mt-6 text-center text-sm text-gray-500">
                        Votre app Sangse sera disponible directement comme une application 🚀
                    </div>
                </DialogContent>
            </Dialog>

        </>
    )
}
