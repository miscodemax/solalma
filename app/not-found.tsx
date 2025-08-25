'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import { ShoppingBag, MoveLeft } from 'lucide-react'
import BackButton from './composants/back-button'

export default function Notfound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F9F6F1] dark:bg-[#0D0D0D] px-6 relative">
      <BackButton />

      {/* Icône du sac renversé */}
      <motion.div
        initial={{ rotate: -15, opacity: 0 }}
        animate={{ rotate: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="mb-6"
      >
        <ShoppingBag className="w-20 h-20 text-[#D29587] dark:text-[#F2C6AC]" strokeWidth={1.5} />
      </motion.div>

      {/* Contenu principal */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        className="text-center max-w-md bg-white dark:bg-[#1A1A1A] rounded-2xl shadow-lg p-8 border border-[#E6E3DF] dark:border-[#333333]"
      >
        <h1 className="text-6xl font-extrabold text-[#D29587] dark:text-[#F2C6AC] mb-4">
          404
        </h1>

        <p className="text-lg font-medium text-[#1E1E1E] dark:text-white mb-2">
          Oups… votre panier est vide.
        </p>
        <p className="text-sm text-[#6B6B6B] dark:text-gray-400 mb-6">
          La page que vous cherchez n’existe pas ou a été déplacée.
        </p>

        {/* Bouton retour */}
        <Link href="/">
          <Button className="bg-[#D29587] hover:bg-[#bb7d72] dark:bg-[#F2C6AC] dark:hover:bg-[#e6b190] text-white dark:text-black px-6 py-3 text-base flex items-center gap-2 rounded-xl shadow-md">
            <MoveLeft className="w-4 h-4" />
            Retour à l&apos;accueil
          </Button>
        </Link>

        {/* Petite tagline */}
        <div className="mt-6 text-xs text-[#A6A6A6] dark:text-gray-500 italic">
          Une marketplace stylée, africaine & chaleureuse ✨
        </div>
      </motion.div>
    </div>
  )
}
