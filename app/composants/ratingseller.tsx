'use client'

import { useState, useEffect } from 'react'
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

  const handleVote = async (value: number) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return showModal("Connexion requise", "Vous devez être connecté pour noter ce vendeur.")

    if (user.id === sellerId) return showModal("Action impossible", "Vous ne pouvez pas noter vous-même.")

    const { error } = await supabase
      .from('ratings_sellers')
      .upsert({
        seller_id: sellerId,
        buyer_id: user.id,
        rating: value
      })

    if (!error) {
      setHasRated(true)
      setRating(value)

      const { data, error } = await supabase
        .from('ratings_sellers')
        .select('rating')

      if (data && !error) {
        const ratings = data.map(r => r.rating)
        const avg = ratings.reduce((a, b) => a + b, 0) / ratings.length
        setAverage(avg)
        setCount(ratings.length)
      }
    } else {
      showModal("Erreur", "Une erreur est survenue lors de l'envoi de votre note.")
      console.error(error)
    }
  }

  const renderStars = (selectedValue?: number) =>
    Array.from({ length: 5 }, (_, i) => (
      <span
        key={i}
        onClick={() => !hasRated && handleVote(i + 1)}
        className={`cursor-pointer text-2xl ${i < (selectedValue ?? Math.round(average || 0)) ? 'text-yellow-500' : 'text-gray-300'}`}
      >
        ★
      </span>
    ))

  return (
    <>
      <div className="mt-4">
        <div className="flex items-center space-x-2">
          {renderStars(hasRated ? rating : undefined)}
          <span className="text-sm text-gray-600">
            ({average ? average.toFixed(1) : '0.0'} / 5, {count} vote{count > 1 ? 's' : ''})
          </span>
        </div>
        {!hasRated && (
          <p className="text-sm text-gray-500">Cliquez pour noter ce vendeur.</p>
        )}
      </div>

      <AlertDialog open={modalOpen} onOpenChange={setModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{modalTitle}</AlertDialogTitle>
            <AlertDialogDescription>{modalMessage}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Fermer</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
