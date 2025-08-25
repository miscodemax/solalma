'use client'

import { motion } from 'framer-motion'
import { ShoppingBag } from 'lucide-react'

export default function Loader() {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-[#F5F5F5] dark:bg-[#121212]">
      {/* Icône de sac qui rebondit */}
      <motion.div
        animate={{
          y: [0, -20, 0], // rebond
          scale: [1, 1.1, 1],
        }}
        transition={{
          repeat: Infinity,
          duration: 1.2,
          ease: 'easeInOut',
        }}
      >
        <ShoppingBag
          className="w-16 h-16 text-[#4A5568] dark:text-[#E2E8F0]"
          strokeWidth={1.5}
        />
      </motion.div>

      {/* Texte animé en dessous */}
      <motion.p
        className="mt-6 text-lg font-medium text-[#2D3748] dark:text-[#E2E8F0]"
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ repeat: Infinity, duration: 2 }}
      >
        Chargement de votre expérience shopping...
      </motion.p>
    </div>
  )
}
