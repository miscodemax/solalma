'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'

export default function RatingSeller({ sellerId, initialAverage, initialCount }: {
  sellerId: string
  initialAverage: number | null
  initialCount: number
}) {
  const [rating, setRating] = useState<number>(0)
  const [hasRated, setHasRated] = useState<boolean>(false)
  const [average, setAverage] = useState<number | null>(initialAverage)
  const [count, setCount] = useState<number>(initialCount)

  const supabase = createClient()

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
    if (!user) return alert("Vous devez être connecté pour noter.")

    if (user.id === sellerId) return alert("Vous ne pouvez pas noter vous-même.")

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

      // Re-fetch moyenne
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
      alert("Erreur lors de l'envoi de la note.")
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
  )
}
