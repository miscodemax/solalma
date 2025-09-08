'use client'

import { useState, useEffect } from 'react';

export default function SimplePWAInstall() {
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [showInstallButton, setShowInstallButton] = useState(false);
    const [isIOS, setIsIOS] = useState(false);

    useEffect(() => {
        // Détection iOS
        const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent);
        setIsIOS(isIOSDevice);

        // Vérifier si déjà installé
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches;

        if (isStandalone) {
            console.log('App déjà installée');
            return;
        }

        // Pour iOS - toujours montrer le bouton
        if (isIOSDevice) {
            setShowInstallButton(true);
            console.log('iOS détecté - bouton affiché');
            return;
        }

        // Pour Android/Chrome
        const handleBeforeInstallPrompt = (e) => {
            console.log('beforeinstallprompt déclenché');
            e.preventDefault();
            setDeferredPrompt(e);
            setShowInstallButton(true);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        // Fallback - montrer le bouton après 3 secondes même sans l'événement
        const fallbackTimer = setTimeout(() => {
            console.log('Fallback - affichage du bouton');
            setShowInstallButton(true);
        }, 3000);

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
            clearTimeout(fallbackTimer);
        };
    }, []);

    const handleInstall = async () => {
        if (isIOS) {
            alert('Pour installer sur iOS:\n1. Appuyez sur le bouton Partager\n2. Sélectionnez "Ajouter à l\'écran d\'accueil"');
            return;
        }

        if (deferredPrompt) {
            console.log('Installation avec deferredPrompt');
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            console.log('Résultat:', outcome);
            setDeferredPrompt(null);
            setShowInstallButton(false);
        } else {
            console.log('Pas de deferredPrompt - affichage instructions');
            alert('Pour installer cette app:\n1. Ouvrez le menu du navigateur\n2. Sélectionnez "Installer l\'application"');
        }
    };

    if (!showInstallButton) {
        return (
            <div className="fixed top-4 right-4 bg-blue-500 text-white p-2 rounded text-sm">
                En attente du prompt PWA...
            </div>
        );
    }

    return (
        <div className="fixed bottom-9 left-4 right-4 bg-white shadow-lg rounded-lg p-4 border max-w-sm mx-auto">
            <div className="flex items-center space-x-3">
                <div className="bg-yellow-400 p-2 rounded-lg">
                    📱
                </div>
                <div className="flex-1">
                    <h3 className="font-semibold text-gray-800">Installer Sangse</h3>
                    <p className="text-sm text-gray-600">
                        {isIOS ? 'Ajouter à l\'écran d\'accueil' : 'Installation rapide disponible'}
                    </p>
                </div>
            </div>

            <div className="mt-4 flex space-x-2">
                <button
                    onClick={handleInstall}
                    className="flex-1 bg-yellow-400 hover:bg-yellow-600 text-white px-4 py-2 rounded font-medium"
                >
                    {isIOS ? 'Instructions' : 'Installer'}
                </button>
                <button
                    onClick={() => setShowInstallButton(false)}
                    className="px-4 py-2 text-gray-500 hover:text-gray-700"
                >
                    ✕
                </button>
            </div>

            {/* Info de debug */}
            <div className="mt-2 text-xs text-gray-400">
                iOS: {isIOS ? 'Oui' : 'Non'} |
                Prompt: {deferredPrompt ? 'Disponible' : 'Indisponible'}
            </div>
        </div>
    );
}