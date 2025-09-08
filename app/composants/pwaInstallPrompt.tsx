import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Smartphone, Zap, Shield, Wifi } from 'lucide-react';

export default function PremiumPWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Détection du device et du mode standalone
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
                       (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    const standalone = window.matchMedia('(display-mode: standalone)').matches || 
                      window.navigator.standalone === true;

    setIsIOS(isIOSDevice);
    setIsStandalone(standalone);

    // Si déjà installé, ne pas montrer le prompt
    if (standalone) {
      console.log('✅ App déjà installée en mode standalone');
      return;
    }

    // Vérifier si le prompt a été fermé récemment (24h cooldown)
    const lastDismissed = localStorage.getItem('pwa-install-dismissed');
    const now = Date.now();
    if (lastDismissed && (now - parseInt(lastDismissed)) < 24 * 60 * 60 * 1000) {
      console.log('⏰ Prompt fermé récemment, cooldown actif');
      return;
    }

    if (isIOSDevice) {
      // Pour iOS, délai plus long pour une meilleure UX
      const timer = setTimeout(() => {
        console.log('🍎 Affichage du prompt iOS');
        setShowPrompt(true);
      }, 5000);
      return () => clearTimeout(timer);
    } else {
      // Pour Android/Chrome
      const handleBeforeInstallPrompt = (e) => {
        console.log('🤖 beforeinstallprompt capturé');
        e.preventDefault();
        setDeferredPrompt(e);
        
        // Délai pour une entrée plus fluide
        setTimeout(() => {
          setShowPrompt(true);
        }, 2000);
      };

      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

      // Fallback après 8 secondes si pas d'événement
      const fallbackTimer = setTimeout(() => {
        if (!deferredPrompt) {
          console.log('🔄 Fallback - prompt forcé');
          setShowPrompt(true);
        }
      }, 8000);

      return () => {
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        clearTimeout(fallbackTimer);
      };
    }
  }, []);

  const handleInstall = async () => {
    if (isIOS) {
      // Animation de feedback pour iOS
      setIsInstalling(true);
      setTimeout(() => setIsInstalling(false), 1000);
      return;
    }

    if (deferredPrompt) {
      setIsInstalling(true);
      try {
        await deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        console.log('📊 Résultat installation:', outcome);
        
        if (outcome === 'accepted') {
          // Animation de succès
          setTimeout(() => {
            setShowPrompt(false);
          }, 1500);
        } else {
          setIsInstalling(false);
        }
      } catch (error) {
        console.error('❌ Erreur installation:', error);
        setIsInstalling(false);
      }
    }
  };

  const handleDismiss = () => {
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
    setShowPrompt(false);
  };

  // Ne rien rendre si déjà installé
  if (isStandalone) return null;

  return (
    <AnimatePresence>
      {showPrompt && (
        <>
          {/* Overlay avec blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50"
            onClick={handleDismiss}
          />

          {/* Prompt principal */}
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.9 }}
            transition={{ 
              type: "spring", 
              stiffness: 300, 
              damping: 25,
              duration: 0.6 
            }}
            className="fixed bottom-4 left-4 right-4 max-w-sm mx-auto z-50"
          >
            <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
              {/* Header avec close button */}
              <div className="relative">
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleDismiss}
                  className="absolute right-3 top-3 p-2 rounded-full bg-gray-100/80 hover:bg-gray-200/80 transition-colors z-10"
                >
                  <X className="w-4 h-4 text-gray-600" />
                </motion.button>

                {/* Icon animé */}
                <div className="pt-6 pb-4 text-center">
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ 
                      type: "spring", 
                      stiffness: 200, 
                      delay: 0.2 
                    }}
                    className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg mb-4"
                  >
                    <Smartphone className="w-8 h-8 text-white" />
                  </motion.div>

                  <motion.h3
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-xl font-bold text-gray-900 mb-2"
                  >
                    Installer <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Sangse</span>
                  </motion.h3>

                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-gray-600 text-sm px-6"
                  >
                    {isIOS 
                      ? "Ajoutez l'app à votre écran d'accueil pour une expérience native"
                      : "Profitez d'un accès rapide et d'une expérience optimisée"
                    }
                  </motion.p>
                </div>
              </div>

              {/* Features */}
              <div className="px-6 py-4 space-y-3">
                {[
                  { icon: Zap, text: "Démarrage instantané", delay: 0.5 },
                  { icon: Wifi, text: "Fonctionne hors ligne", delay: 0.6 },
                  { icon: Shield, text: "Sécurisé et privé", delay: 0.7 }
                ].map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: feature.delay }}
                    className="flex items-center space-x-3 text-sm"
                  >
                    <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center">
                      <feature.icon className="w-4 h-4 text-blue-600" />
                    </div>
                    <span className="text-gray-700 font-medium">{feature.text}</span>
                  </motion.div>
                ))}
              </div>

              {/* Actions */}
              <div className="px-6 pb-6">
                {isIOS ? (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className="space-y-3"
                  >
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-100">
                      <div className="text-sm text-gray-700 space-y-2">
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">1</div>
                          <span>Appuyez sur <strong>Partager</strong> ⬆️</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">2</div>
                          <span>Sélectionnez <strong>"Sur l'écran d'accueil"</strong> ➕</span>
                        </div>
                      </div>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleInstall}
                      disabled={isInstalling}
                      className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg transition-all duration-200 disabled:opacity-50"
                    >
                      {isInstalling ? (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="flex items-center justify-center space-x-2"
                        >
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                          />
                          <span>Instructions affichées!</span>
                        </motion.div>
                      ) : (
                        "Afficher les instructions"
                      )}
                    </motion.button>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className="space-y-3"
                  >
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleInstall}
                      disabled={isInstalling}
                      className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg transition-all duration-200 disabled:opacity-50"
                    >
                      {isInstalling ? (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="flex items-center justify-center space-x-2"
                        >
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                          />
                          <span>Installation...</span>
                        </motion.div>
                      ) : (
                        <div className="flex items-center justify-center space-x-2">
                          <Download className="w-5 h-5" />
                          <span>Installer maintenant</span>
                        </div>
                      )}
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={handleDismiss}
                      className="w-full text-gray-500 hover:text-gray-700 py-2 text-sm transition-colors"
                    >
                      Peut-être plus tard
                    </motion.button>
                  </motion.div>
                )}
              </div>
            </div>

            {/* Petit indicateur en bas */}
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.2 }}
              className="flex justify-center mt-2"
            >
              <div className="bg-white/80 backdrop-blur-sm rounded-full px-3 py-1 text-xs text-gray-600 shadow-sm">
                Glissez vers le bas pour fermer
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}