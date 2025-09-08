'use client'

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Smartphone, X, Download, Zap, Wifi, Clock, Share, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function PWAInstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [open, setOpen] = useState(false);
    const [isInstalling, setIsInstalling] = useState(false);
    const [isIOS, setIsIOS] = useState(false);
    const [isStandalone, setIsStandalone] = useState(false);
    const [canShowPrompt, setCanShowPrompt] = useState(false);

    useEffect(() => {
        // Vérifier si c'est iOS
        const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
            (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

        // Vérifier si l'app est déjà installée
        const standalone = window.matchMedia("(display-mode: standalone)").matches ||
            (navigator as any).standalone === true ||
            window.navigator.standalone === true;

        setIsIOS(iOS);
        setIsStandalone(standalone);

        console.log('iOS détecté:', iOS);
        console.log('Mode standalone:', standalone);

        // Si déjà installé, ne pas afficher le prompt
        if (standalone) {
            console.log('App déjà installée');
            return;
        }

        // Vérifier si le prompt a déjà été fermé récemment
        const lastDismissed = localStorage.getItem('pwa-install-dismissed');
        const now = Date.now();
        if (lastDismissed && (now - parseInt(lastDismissed)) < 24 * 60 * 60 * 1000) { // 24h
            console.log('Prompt fermé récemment');
            return;
        }

        setCanShowPrompt(true);

        if (iOS) {
            // Pour iOS, afficher après un délai
            console.log('Configuration du prompt iOS');
            const timer = setTimeout(() => {
                console.log('Affichage du prompt iOS');
                setOpen(true);
            }, 3000); // Augmenté à 3 secondes

            return () => clearTimeout(timer);
        } else {
            // Pour Android/autres
            console.log('Configuration du listener beforeinstallprompt');
            const handler = (e: any) => {
                console.log('Événement beforeinstallprompt reçu');
                e.preventDefault();
                setDeferredPrompt(e);
                // Afficher immédiatement quand l'événement est reçu
                setTimeout(() => {
                    console.log('Affichage du prompt Android');
                    setOpen(true);
                }, 1000);
            };

            window.addEventListener("beforeinstallprompt", handler);

            // Fallback: si pas d'événement après 5 secondes, forcer l'affichage
            const fallbackTimer = setTimeout(() => {
                if (!deferredPrompt && canShowPrompt) {
                    console.log('Fallback: affichage forcé du prompt');
                    setOpen(true);
                }
            }, 5000);

            return () => {
                window.removeEventListener("beforeinstallprompt", handler);
                clearTimeout(fallbackTimer);
            };
        }
    }, [canShowPrompt]);

    const handleInstall = async () => {
        if (!deferredPrompt) {
            console.log('Pas de deferredPrompt disponible');
            return;
        }

        setIsInstalling(true);
        try {
            await deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            console.log('Résultat de l\'installation:', outcome);
            setIsInstalling(false);
            setOpen(false);
            setDeferredPrompt(null);
        } catch (error) {
            console.error('Erreur lors de l\'installation:', error);
            setIsInstalling(false);
        }
    };

    const handleDismiss = () => {
        console.log('Fermeture du prompt');
        setOpen(false);
        setDeferredPrompt(null);
        // Enregistrer la date de fermeture
        localStorage.setItem('pwa-install-dismissed', Date.now().toString());
    };

    // Mode debug : afficher un bouton pour forcer l'ouverture (à retirer en production)
    const forceOpen = () => {
        console.log('Ouverture forcée du prompt');
        setOpen(true);
    };

    // Si déjà installé, ne rien afficher
    if (isStandalone) {
        return null;
    }

    return (
        <>
            {/* Bouton de debug - À RETIRER EN PRODUCTION */}
            <div className="fixed top-4 left-4 z-50">
                <Button
                    onClick={forceOpen}
                    className="bg-red-500 text-white text-xs px-2 py-1"
                    size="sm"
                >
                    Debug PWA
                </Button>
            </div>

            <AnimatePresence>
                {open && (
                    <Dialog open={open} onOpenChange={(open) => !open && handleDismiss()}>
                        <DialogContent asChild>
                            <motion.div
                                initial={{ opacity: 0, y: 50 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 50 }}
                                transition={{ duration: 0.5, type: "spring", stiffness: 120 }}
                                className="max-w-sm mx-auto rounded-3xl shadow-2xl border-0 overflow-hidden sm:max-w-md relative bg-white"
                            >
                                <button
                                    onClick={handleDismiss}
                                    className="absolute right-4 top-4 p-1 rounded-full bg-gray-100 hover:bg-gray-200 z-10"
                                >
                                    <X className="w-4 h-4 text-gray-500" />
                                </button>

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
                                        {isIOS
                                            ? "Ajoutez Sangse à votre écran d'accueil pour une expérience optimale"
                                            : "Profitez d'une expérience fluide et rapide avec notre app native"}
                                    </DialogDescription>
                                </DialogHeader>

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
                            </motion.div>
                        </DialogContent>
                    </Dialog>
                )}
            </AnimatePresence>
        </>
    );
}