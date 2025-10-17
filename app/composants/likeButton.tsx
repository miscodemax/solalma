'use client'

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase"
import { motion, AnimatePresence } from "framer-motion"
import { AiFillHeart, AiOutlineHeart } from "react-icons/ai"

export default function LikeButton({ productId, userId }: { productId: number; userId: string }) {
  const supabase = createClient()
  const [liked, setLiked] = useState(false)
  const [loading, setLoading] = useState(true)
  const [confetti, setConfetti] = useState(false)

  useEffect(() => {
    const fetchLike = async () => {
      const { data } = await supabase
        .from("product_like")
        .select("*")
        .eq("user_id", userId)
        .eq("product_id", productId)
        .single()

      setLiked(!!data)
      setLoading(false)
    }

    if (userId) fetchLike()
  }, [productId, userId, supabase])

  const toggleLike = async () => {
    setLiked(!liked) // UI optimiste

    if (!liked) {
      // show confetti only when liking
      setConfetti(true)
      setTimeout(() => setConfetti(false), 600) // remove confetti after animation
      await supabase
        .from("product_like")
        .insert({ user_id: userId, product_id: productId })
    } else {
      await supabase
        .from("product_like")
        .delete()
        .eq("user_id", userId)
        .eq("product_id", productId)
    }
  }

  if (userId === null || loading) return null

  return (
    <div className="relative">
      <button
        onClick={toggleLike}
        aria-label={liked ? "Retirer des favoris" : "Ajouter aux favoris"}
        className="focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1B2A41] rounded-full transition-all"
      >
        <AnimatePresence initial={false} mode="wait">
          {liked ? (
            <motion.div
              key="liked"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1.3, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", stiffness: 600, damping: 12 }}
              className="text-[#F4B400] text-xl drop-shadow-sm"
            >
              <AiFillHeart />
            </motion.div>
          ) : (
            <motion.div
              key="not-liked"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
              className="text-gray-400 hover:text-[#1B2A41] text-xl"
            >
              <AiOutlineHeart />
            </motion.div>
          )}
        </AnimatePresence>
      </button>

      {/* Confetti */}
      <AnimatePresence>
        {confetti && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
          >
            {Array.from({ length: 12 }).map((_, i) => (
              <motion.div
                key={i}
                className="w-2 h-2 rounded-full bg-[#F4B400] dark:bg-[#1B2A41] absolute"
                initial={{ x: 0, y: 0, scale: 1 }}
                animate={{
                  x: (Math.random() - 0.5) * 100,
                  y: -Math.random() * 100 - 20,
                  scale: 0,
                }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
