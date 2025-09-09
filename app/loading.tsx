'use client'

import { motion } from 'framer-motion'
import { ShoppingBag } from 'lucide-react'

export default function Loader() {
  return (
    <div className="h-screen w-full flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-[#FFFBEA] via-[#FFF8E1] to-[#FDE68A] dark:from-[#0A0A0A] dark:via-[#1A1A1A] dark:to-[#2D2D2D]">

      {/* Halo animé derrière */}
      <motion.div
        className="absolute w-[300px] h-[300px] rounded-full bg-[#F4B400]/30 blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.6, 0.9, 0.6],
        }}
        transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
      />

      {/* Orbes lumineuses en rotation */}
      <motion.div
        className="absolute w-[200px] h-[200px] rounded-full border-2 border-[#F4B400]/30 flex items-center justify-center"
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 6, ease: 'linear' }}
      >
        <motion.div
          className="w-3 h-3 rounded-full bg-[#F4B400]"
          animate={{ scale: [1, 1.4, 1] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
        />
      </motion.div>

      <motion.div
        className="absolute w-[260px] h-[260px] rounded-full border border-[#F4B400]/20"
        animate={{ rotate: -360 }}
        transition={{ repeat: Infinity, duration: 12, ease: 'linear' }}
      />

      {/* Icône sac au centre */}
      <motion.div
        animate={{
          y: [0, -10, 0],
          scale: [1, 1.05, 1],
        }}
        transition={{
          repeat: Infinity,
          duration: 1.8,
          ease: 'easeInOut',
        }}
      >
        <ShoppingBag
          className="w-16 h-16 text-[#F4B400] dark:text-[#FACC15]"
          strokeWidth={1.5}
        />
      </motion.div>
    </div>
  )
}
