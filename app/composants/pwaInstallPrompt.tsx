"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Smartphone, X, Download, Zap, Wifi, Clock, Share, Plus } from "lucide-react";
import { motion } from "framer-motion";

export default function PWAInstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [open, setOpen] = useState(false);
    const [isInstalling, setIsInstalling] = useState(false);
    const [isIOS, setIsIOS] = useState(false);
    const [isStandalone, setIsStandalone] = useState(false);

    useEffect(() => {
        const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        const standalone = window.matchMedia("(display-mode: standalone)").matches || (navigator as any).standalone === true;
        setIsIOS(iOS);
        setIsStandalone(standalone);

        if (standalone) return;

        if (iOS) {
            // iOS : affiche le prompt après 3 secondes
            setTimeout(() => setOpen(true), 3000);
        } else {
            // Android/Desktop : capture beforeinstallprompt
            const handler = (e: any) => {
                e.preventDefault();
                setDeferredPrompt(e);
                setOpen(true);
            };
            window.addEventListener("beforeinstallprompt", handler);
            return () => window.removeEventListener("beforeinstallprompt", handler);
        }
    }, []);

    const handleInstall = async () => {
        if (!deferredPrompt) return;
        setIsInstalling(true);
        await deferredPrompt.prompt();
        setIsInstalling(false);
        setOpen(false);
        setDeferredPrompt(null);
    };

    const handleDismiss = () => {
        setOpen(false);
        setDeferredPrompt(null);
    };

    if (isStandalone || (!deferredPrompt && !isIOS)) return null;

    return (
        <Dialog open={open} onOpenChange={(open) => !open && handleDismiss()}>
            <DialogContent className="max-w-sm mx-auto rounded-3xl shadow-2xl border-0 overflow-hidden sm:max-w-md relative bg-white">
                <button onClick={handleDismiss} className="absolute right-4 top-4 p-1 rounded-full bg-gray-100 hover:bg-gray-200 z-10">
                    <X className="w-4 h-4 text-gray-500" />
                </button>

                <DialogHeader className="text-center pt-6 pb-4 relative">
                    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.6, type: "spring", stiffness: 120 }} className="relative mx-auto mb-4 w-14 h-14 flex items-center justify-center bg-gradient-to-r from-[#F6C445] to-[#1C2B49] rounded-3xl shadow-lg">
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
                            <Button variant="ghost" onClick={handleDismiss} className="w-full text-[#1C2B49] hover:text-[#F6C445] hover:bg-[#F6C445]/10 py-2 rounded-xl transition-colors">
                                J'ai compris
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button onClick={handleInstall} disabled={isInstalling} className="w-full bg-gradient-to-r from-[#F6C445] to-[#1C2B49] hover:from-[#E2AE32] hover:to-[#1C2B49] text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]">
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

                            <Button variant="ghost" onClick={handleDismiss} className="w-full text-[#1C2B49] hover:text-[#F6C445] hover:bg-[#F6C445]/10 py-2 rounded-xl transition-colors">
                                Peut-être plus tard
                            </Button>
                        </>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
