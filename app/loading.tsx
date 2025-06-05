'use client'

import { motion } from 'framer-motion'

export default function Loader() {
  return (
    <div className="h-screen w-full flex items-center justify-center bg-[#F9F6F1] dark:bg-[#121212]">
      <motion.div
        className="w-16 h-16 border-[6px] border-[#D29587] dark:border-[#F2C6AC] border-t-transparent rounded-full"
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
      />
    </div>
  )
}
