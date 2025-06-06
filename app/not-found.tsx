'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { MoveLeft } from 'lucide-react'
import { motion } from 'framer-motion'
import BackButton from './composants/back-button'

export default function Notfound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F9F6F1] dark:bg-[#0D0D0D] px-6">
      <BackButton />
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="text-center max-w-md bg-white dark:bg-[#1A1A1A] rounded-2xl shadow-xl p-8 border border-[#E6E3DF] dark:border-[#333333]"
      >
        <h1 className="text-6xl font-bold text-[#D29587] mb-4">404</h1>
        <p className="text-xl font-medium text-[#1E1E1E] dark:text-white mb-2">
          Oups, cette page est introuvable.
        </p>
        <p className="text-sm text-[#6B6B6B] dark:text-gray-400 mb-6">
          Peut-être qu&apos;elle a été supprimée ou que vous avez mal tapé l&apos;adresse.
        </p>

        <Link href="/">
          <Button className="bg-[#D29587] hover:bg-[#bb7d72] text-white px-6 py-3 text-base flex items-center gap-2">
            <MoveLeft className="w-4 h-4" />
            Retour à l&apos;accueil
          </Button>
        </Link>

        <div className="mt-6 text-xs text-[#A6A6A6] dark:text-gray-500 italic">
          Une marketplace stylée, africaine & chaleureuse ✨
        </div>
      </motion.div>
    </div>
  )
}
