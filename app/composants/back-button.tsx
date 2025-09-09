"use client"

import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ArrowLeftCircle } from "lucide-react"

export default function BackButton() {
  const router = useRouter()

  return (
    <motion.button
      onClick={() => router.back()}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="group flex items-center gap-2 px-5 py-2.5 my-5 rounded-full
                 border border-[#F4B400]/40 bg-white/80 backdrop-blur-lg
                 text-[#1C1C1C] dark:text-white 
                 hover:bg-[#F4B400] hover:text-white hover:border-[#F4B400]
                 shadow-sm hover:shadow-lg transition-all duration-300"
      aria-label="Retour en arrière"
    >
      <motion.div
        whileHover={{ x: -3 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        <ArrowLeftCircle
          className="w-5 h-5 text-[#F4B400] group-hover:text-white transition-colors duration-300"
        />
      </motion.div>
      <span className="font-medium">Retour</span>
    </motion.button>
  )
}
