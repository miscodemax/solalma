"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase"
import { motion, AnimatePresence } from "framer-motion"
import { AiFillHeart, AiOutlineHeart } from "react-icons/ai"

export default function LikeButton({ productId, userId }: { productId: number; userId: string }) {
  const supabase = createClient()
  const [liked, setLiked] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchLike = async () => {
      const { data } = await supabase
        .from("likes")
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
    if (liked) {
      await supabase
        .from("likes")
        .delete()
        .eq("user_id", userId)
        .eq("product_id", productId)
    } else {
      await supabase
        .from("likes")
        .insert({ user_id: userId, product_id: productId })
    }
  }

  if (!userId || loading) return null

  return (
    <button
      onClick={toggleLike}
      aria-label={liked ? "Retirer des favoris" : "Ajouter aux favoris"}
      className="focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D29587] rounded-full transition-all"
    >
      <AnimatePresence initial={false} mode="wait">
        {liked ? (
          <motion.div
            key="liked"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1.2, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
            className="text-[#D29587] text-xl"
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
            className="text-gray-400 hover:text-[#D29587] text-xl"
          >
            <AiOutlineHeart />
          </motion.div>
        )}
      </AnimatePresence>
    </button>
  )
}
