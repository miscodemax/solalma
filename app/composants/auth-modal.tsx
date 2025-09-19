'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { FaGoogle, FaTimes, FaUserShield, FaHeart, FaBell, FaEyeSlash } from 'react-icons/fa'
import { Loader2, Shield, Star } from 'lucide-react'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  onContinueWithoutAuth?: () => void
  title?: string
  subtitle?: string
}

export default function AuthModal({
  isOpen,
  onClose,
  onContinueWithoutAuth,
  title = "Rejoignez notre communauté",
  subtitle = "Découvrez tous les avantages"
}: AuthModalProps) {
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const benefits = [
    { icon: FaHeart, text: "Sauvegardez vos annonces favorites" },
    { icon: FaBell, text: "Recevez des notifications personnalisées" },
    { icon: Shield, text: "Accédez à votre historique sécurisé" }
  ]

  const handleGoogleLogin = async () => {
    setLoading(true)
    setError('')

    try {
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

      // Simulation temporaire
      await new Promise(resolve => setTimeout(resolve, 1500))
      onClose()
    } catch (err: any) {
      setError(err.message || 'Erreur de connexion')
    } finally {
      setLoading(false)
    }
  }

  const handleContinueWithoutAuth = () => {
    onContinueWithoutAuth?.()
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="bg-white rounded-2xl shadow-xl max-w-md w-full relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#F6C445] to-[#FFD700] p-6 rounded-t-2xl relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-[#1C2B49]/70 hover:text-[#1C2B49] transition-colors p-1"
            aria-label="Fermer"
          >
            <FaTimes className="w-4 h-4" />
          </button>

          <div className="text-center">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <FaUserShield className="text-xl text-[#1C2B49]" />
            </div>
            <h2 className="text-lg font-bold text-[#1C2B49] mb-1">{title}</h2>
            <p className="text-[#1C2B49]/80 text-sm">{subtitle}</p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Benefits */}
          <div>
            <div className="flex items-center gap-2 text-sm font-medium text-[#1C2B49] mb-3">
              <Star className="w-4 h-4 text-[#F6C445]" />
              Avantages membre
            </div>

            <div className="space-y-2">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center gap-3 p-2">
                  <div className="w-6 h-6 bg-[#F6C445]/10 rounded-full flex items-center justify-center">
                    <benefit.icon className="w-3 h-3 text-[#F6C445]" />
                  </div>
                  <span className="text-sm text-[#1C2B49]/80">{benefit.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm text-center">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="space-y-3">
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full bg-white border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-3 px-4 rounded-lg flex items-center justify-center gap-3 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin h-4 w-4" />
                  <span>Connexion...</span>
                </>
              ) : (
                <>
                  <FaGoogle className="h-4 w-4 text-red-500" />
                  <span>Continuer avec Google</span>
                </>
              )}
            </button>

            {onContinueWithoutAuth && (
              <button
                onClick={handleContinueWithoutAuth}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-600 font-medium py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition-all duration-200 text-sm"
              >
                <FaEyeSlash className="h-3" />
                Continuer sans compte
              </button>
            )}
          </div>

          {/* Security note */}
          <div className="text-center text-xs text-gray-500">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Shield className="w-3 h-3" />
              <span>Connexion sécurisée</span>
            </div>
            <p>Vos données sont protégées</p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}