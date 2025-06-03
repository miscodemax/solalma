"use server"
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export default async function RatingSeller({ sellerId }: { sellerId: string }) {
  const supabase = createServerComponentClient({ cookies })


  // On suppose que la table "ratings" contient : user_id (vendeur), rating (nombre 1-5)
  const { data, error } = await supabase
    .from("ratings")
    .select("rating")
    .eq("user_id", sellerId)

  if (error) {
    console.error("Erreur fetch ratings:", error)
    return <p>Note indisponible</p>
  }

 

  // Calcul de la moyenne
  const total = data.reduce((acc, cur) => acc + (cur.rating || 0), 0)
  const average = total / data.length

  // Affichage en étoiles simples (★ = rempli, ☆ = vide)
  const stars = Array.from({ length: 5 }, (_, i) =>
    i < Math.round(average) ? "★" : "☆"
  ).join("")

  return (
    <div className="flex items-center space-x-2 text-yellow-500 font-bold select-none" aria-label={`Note moyenne du vendeur : ${average.toFixed(1)} sur 5`}>
      <span className="text-2xl">{stars}</span>
      <span className="text-gray-700 text-sm font-normal">({average.toFixed(1)} / 5)</span>
    </div>
  )
}
