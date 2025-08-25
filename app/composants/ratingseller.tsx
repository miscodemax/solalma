'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"

export default function RatingSeller({
  sellerId,
  initialAverage,
  initialCount
}: {
  sellerId: string
  initialAverage: number | null
  initialCount: number
}) {
  const [rating, setRating] = useState<number>(0)
  const [hasRated, setHasRated] = useState<boolean>(false)
  const [average, setAverage] = useState<number | null>(initialAverage)
  const [count, setCount] = useState<number>(initialCount)

  const [modalOpen, setModalOpen] = useState(false)
  const [modalTitle, setModalTitle] = useState('')
  const [modalMessage, setModalMessage] = useState('')
  const [pendingRating, setPendingRating] = useState<number>(0)

  const supabase = createClient()

  const showModal = (title: string, message: string) => {
    setModalTitle(title)
    setModalMessage(message)
    setModalOpen(true)
  }

  useEffect(() => {
    const fetchAlreadyRated = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('ratings_sellers')
        .select('rating')
        .eq('seller_id', sellerId)
        .eq('buyer_id', user.id)
        .maybeSingle()

      if (data) {
        setHasRated(true)
        setRating(data.rating)
      }
    }

    fetchAlreadyRated()
  }, [sellerId])

  const confirmVote = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return showModal("Connexion requise", "Vous devez être connecté pour noter ce vendeur.")

    if (user.id === sellerId) return showModal("Action impossible", "Vous ne pouvez pas noter vous-même.")

    const { error } = await supabase
      .from('ratings_sellers')
      .upsert({
        seller_id: sellerId,
        buyer_id: user.id,
        rating: pendingRating
      })

    if (!error) {
      setHasRated(true)
      setRating(pendingRating)

      const { data, error } = await supabase
        .from('ratings_sellers')
        .select('rating')

      if (data && !error) {
        const ratings = data.map(r => r.rating)
        const avg = ratings.reduce((a, b) => a + b, 0) / ratings.length
        setAverage(avg)
        setCount(ratings.length)
      }
      setModalOpen(false)
    } else {
      showModal("Erreur", "Une erreur est survenue lors de l'envoi de votre note.")
      console.error(error)
    }
  }

  const renderStars = (selectedValue?: number, clickable = true) =>
    Array.from({ length: 5 }, (_, i) => (
      <motion.span
        key={i}
        whileHover={clickable ? { scale: 1.2, rotate: -5 } : {}}
        whileTap={clickable ? { scale: 0.9 } : {}}
        onClick={() => clickable && setPendingRating(i + 1)}
        className={`cursor-pointer text-3xl transition-colors ${i < (selectedValue ?? 0) ? 'text-yellow-500' : 'text-gray-400'
          }`}
      >
        ★
      </motion.span>
    ))

  return (
    <>
      <div className="mt-4">
        <div className="flex items-center space-x-2">
          {renderStars(hasRated ? rating : undefined, false)}
          <span className="text-sm text-gray-600 dark:text-gray-400">
            ({average ? average.toFixed(1) : '0.0'} / 5, {count} vote{count > 1 ? 's' : ''})
          </span>
        </div>
        {!hasRated && (
          <Button
            variant="outline"
            size="sm"
            className="mt-2"
            onClick={() => setModalOpen(true)}
          >
            Noter ce vendeur
          </Button>
        )}
      </div>

      <AnimatePresence>
        {modalOpen && (
          <AlertDialog open={modalOpen} onOpenChange={setModalOpen}>
            <AlertDialogContent asChild>
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 30 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="p-6 rounded-2xl bg-white dark:bg-zinc-900 shadow-2xl"
              >
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-xl font-bold text-center">
                    Noter ce vendeur
                  </AlertDialogTitle>
                  <AlertDialogDescription className="text-center text-gray-600 dark:text-gray-400">
                    Cette action est <span className="font-semibold text-red-500">irréversible</span>.
                    Votre note contribue à évaluer la <span className="font-semibold">fiabilité</span> de ce vendeur.
                    Choisissez attentivement.
                  </AlertDialogDescription>
                </AlertDialogHeader>

                <div className="flex justify-center mt-4">
                  {renderStars(pendingRating)}
                </div>

                <AlertDialogFooter className="mt-6 flex justify-between">
                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                  <Button
                    onClick={confirmVote}
                    disabled={pendingRating === 0}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white rounded-xl"
                  >
                    Confirmer ma note
                  </Button>
                </AlertDialogFooter>
              </motion.div>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </AnimatePresence>
    </>
  )
}
