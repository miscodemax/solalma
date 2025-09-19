'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FaGoogle,
  FaTimes,
  FaUserShield,
  FaRocket,
  FaHeart,
  FaBell,
  FaArrowRight,
  FaEyeSlash
} from 'react-icons/fa'
import { Loader2, Shield, Star, Zap } from 'lucide-react'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  onContinueWithoutAuth?: () => void
  title?: string
  subtitle?: string
  benefits?: string[]
}

const defaultBenefits = [
  "Sauvegardez vos annonces favorites",
  "Recevez des notifications personnalisées",
  "Accédez à votre historique d'achats",
  "Contactez les vendeurs plus facilement"
]

export default function AuthModal({
  isOpen,
  onClose,
  onContinueWithoutAuth,
  title = "Rejoignez notre communauté",
  subtitle = "Découvrez tous les avantages d'un compte",
  benefits = defaultBenefits
}: AuthModalProps) {
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showBenefits, setShowBenefits] = useState(true)

  // Simulation de la fonction de connexion Google (à remplacer par votre logique Supabase)
  const handleGoogleLogin = async () => {
    setLoading(true)
    setError('')

    try {
      // Simulation d'un délai de connexion
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Votre logique Supabase ici
      /*
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?redirect=${encodeURIComponent(window.location.pathname)}`
        }
      })
      
      if (error) {
        setError(error.message)
      } else {
        onClose()
      }
      */

      // Simulation de succès
      onClose()
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }

  const handleContinueWithoutAuth = () => {
    onContinueWithoutAuth?.()
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="bg-white rounded-3xl shadow-2xl max-w-md w-full mx-4 overflow-hidden relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header avec gradient */}
            <div className="bg-gradient-to-br from-[#F6C445] via-[#FFD700] to-[#F6C445] p-6 relative">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-[#1C2B49]/70 hover:text-[#1C2B49] transition-colors"
              >
                <FaTimes className="w-5 h-5" />
              </button>

              <div className="text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring" }}
                  className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full mb-4"
                >
                  <FaUserShield className="text-2xl text-[#1C2B49]" />
                </motion.div>

                <motion.h2
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-xl font-bold text-[#1C2B49] mb-2"
                >
                  {title}
                </motion.h2>

                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-[#1C2B49]/80 text-sm"
                >
                  {subtitle}
                </motion.p>
              </div>
            </div>

            {/* Contenu principal */}
            <div className="p-6 space-y-6">
              {/* Avantages avec animation */}
              {showBenefits && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-3"
                >
                  <div className="flex items-center gap-2 text-sm font-medium text-[#1C2B49] mb-3">
                    <Star className="w-4 h-4 text-[#F6C445]" />
                    Avantages membre
                  </div>

                  {benefits.map((benefit, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                      className="flex items-center gap-3 p-3 bg-gradient-to-r from-[#F6C445]/5 to-[#FFD700]/10 rounded-xl border border-[#F6C445]/20"
                    >
                      <div className="w-8 h-8 bg-[#F6C445]/20 rounded-full flex items-center justify-center flex-shrink-0">
                        {index === 0 && <FaHeart className="w-3 h-3 text-[#F6C445]" />}
                        {index === 1 && <FaBell className="w-3 h-3 text-[#F6C445]" />}
                        {index === 2 && <Shield className="w-3 h-3 text-[#F6C445]" />}
                        {index === 3 && <Zap className="w-3 h-3 text-[#F6C445]" />}
                      </div>
                      <span className="text-sm text-[#1C2B49]/80">{benefit}</span>
                    </motion.div>
                  ))}
                </motion.div>
              )}

              {/* Messages d'erreur */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm text-center"
                  >
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Boutons d'action */}
              <div className="space-y-3">
                {/* Bouton Google */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleGoogleLogin}
                  disabled={loading}
                  className="w-full bg-white hover:bg-gray-50 border-2 border-gray-200 hover:border-gray-300 text-gray-700 font-semibold py-4 px-6 rounded-xl flex items-center justify-center gap-3 transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin h-5 w-5" />
                      <span>Connexion en cours...</span>
                    </>
                  ) : (
                    <>
                      <FaGoogle className="h-5 w-5 text-red-500" />
                      <span>Continuer avec Google</span>
                      <FaArrowRight className="h-4 w-4 ml-auto" />
                    </>
                  )}
                </motion.button>

                {/* Bouton continuer sans connexion */}
                {onContinueWithoutAuth && (
                  <motion.button
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleContinueWithoutAuth}
                    className="w-full bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-700 font-medium py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-all duration-200 text-sm"
                  >
                    <FaEyeSlash className="h-4 w-4" />
                    Continuer sans compte
                  </motion.button>
                )}
              </div>

              {/* Note de sécurité */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="text-center text-xs text-gray-500 space-y-1"
              >
                <div className="flex items-center justify-center gap-1">
                  <Shield className="w-3 h-3" />
                  <span>Connexion 100% sécurisée</span>
                </div>
                <p>Vos données sont protégées et ne seront jamais partagées</p>
              </motion.div>
            </div>

            {/* Décoration en bas */}
            <div className="h-1 bg-gradient-to-r from-[#F6C445] via-[#FFD700] to-[#F6C445]"></div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}