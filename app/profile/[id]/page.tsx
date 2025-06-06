// /app/profile/[id]/page.tsx


import { cookies } from "next/headers"
import { createServerClient } from "@supabase/ssr"
import { supabaseUrl, supabaseKey } from "@/lib/supabase"
import Image from "next/image"
import Link from "next/link"
import CopyButton from "@/app/composants/sharebutton"
import { FaWhatsapp } from "react-icons/fa"

import { Metadata } from "next"
import BackButton from "@/app/composants/back-button"


export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const cookieStore = await cookies()
  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      get: (name) => cookieStore.get(name)?.value,
    },
  })

  const { data: profile } = await supabase
    .from("profiles")
    .select("username, avatar_url, bio")
    .eq("id", params.id)
    .single()

  const title = profile?.username
    ? `Découvre la boutique de ${profile.username} sur Sangse.shop`
    : "Profil vendeur - Sangse.shop"

  const description = profile?.bio || "Découvre les produits proposés par ce vendeur."

  const image = profile?.avatar_url || "https://sangse.shop/default-avatar.png"
  const url = `https://sangse.shop/profile/${params.id}`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      siteName: "Sangse.shop",
      images: [
        {
          url: image,
          width: 600,
          height: 600,
          alt: profile?.username || "Avatar vendeur",
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  }
}


export default async function UserProfilePage({ params }: { params: { id: string } }) {
  const cookieStore = await cookies()
  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      get: (name) => cookieStore.get(name)?.value,
    },
  })
  const { id } = params

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("username, avatar_url, bio")
    .eq("id", id)
    .single()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: products } = await supabase
    .from("product")
    .select("*")
    .eq("user_id", id)
    .order("created_at", { ascending: false })

  const { data: ratingsData } = await supabase
    .from("ratings_sellers")
    .select("rating")
    .eq("seller_id", id)

  const ratings = ratingsData?.map((r) => r.rating) || []
  const averageRating =
    ratings.length > 0 ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1) : null

  if (!profile || profileError) {
    return <p className="p-6 text-center text-red-500 font-semibold">Profil introuvable.</p>
  }

  return (
    <div className="max-w-4xl mx-auto dark:bg-black p-6 space-y-10">
      <BackButton />
      {/* Section Profil */}
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
        <div className="w-24 h-24 relative">
          <Image
            src={profile.avatar_url || "/default-avatar.png"}
            alt="Avatar"
            fill
            className="rounded-full object-cover border"
          />
        </div>
        <div className="flex-1 w-full">
          <h1 className="text-2xl font-bold">{profile.username || "Utilisateur"}</h1>
          <p className="text-gray-600">{profile.bio || "Pas de biographie disponible."}</p>
          {ratings.length > 0 ? (
            <p className="text-sm text-yellow-600 mt-2">
              ⭐ Note moyenne du vendeur : <span className="font-semibold">{averageRating} / 5</span>
            </p>
          ) : (
            <p className="text-sm text-gray-400 mt-2">⭐ Aucun avis pour l’instant</p>
          )}

          {/* Section de partage */}
          <div className="mt-6">
            <h2 className="text-sm font-semibold text-gray-600 mb-2">📤 Partager cette boutique</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-md">
              {/* WhatsApp */}
              <a
                href={`https://wa.me/?text=${encodeURIComponent(
                  `🔗 Découvre la boutique de ${profile.username} sur Sangse.shop : https://sangse.shop/profile/${id}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-xl text-sm flex items-center justify-center gap-2 transition"
              >
                <FaWhatsapp className="w-4 h-4" />
                Partager
              </a>

              {/* Instagram */}
              <CopyButton
                text={`https://sangse.shop/profile/${id}`}
                platform="Tiktok/Instagram"
              />


            </div>
          </div>

          {/* Modifier profil (si c’est l'utilisateur connecté) */}
          {user?.id === id && (
            <div className="flex flex-col md:flex-row gap-3">
              <Link
                href="/profile/update"
                className="inline-block mt-6 px-4 py-2 text-sm bg-[#D29587] text-white rounded-xl hover:bg-[#bb7e70] transition"
              >
                ✏️ Modifier mon profil
              </Link>
              <Link
                href="/dashboard/products"
                className="inline-block mt-6 px-4 py-2 text-sm bg-[#D29587] text-white rounded-xl hover:bg-[#bb7e70] transition"
              >
                ✏️ Gerer mes produits
              </Link>
            </div>

          )}
        </div>
      </div>

      {/* Section Produits */}
      <div>
        <h2 className="text-xl font-semibold mb-4">🛍️ Produits en vente</h2>

        {products && products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((product) => (
              <Link key={product.id} href={`/product/${product.id}`} className="group block">
                <div className="bg-white border dark:bg-black border-[#E6E3DF] rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition duration-300 w-full">
                  <div className="relative w-full h-48 sm:h-56">
                    <Image
                      src={product.image_url || '/placeholder.jpg'}
                      alt={product.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105 group-hover:rotate-1"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    />
                  </div>
                  <div className="p-3 sm:p-4 space-y-1">
                    <h2 className="text-sm sm:text-base font-semibold text-[#333] truncate">
                      {product.title}
                    </h2>
                    <p className="text-xs sm:text-sm text-[#777] line-clamp-2">
                      {product.description}
                    </p>
                    <p className="mt-1 font-bold text-[#D29587] text-sm sm:text-base">
                      {product.price} FCFA
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">Aucun produit pour l’instant.</p>
        )}
      </div>
    </div>
  )
}
