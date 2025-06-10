// app/profile/[id]/page.tsx
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

  const { data: profile } = await supabase
    .from("profiles")
    .select("username, avatar_url, bio")
    .eq("id", id)
    .single()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: allProducts } = await supabase
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

  const getBadge = () => {
    if (!averageRating) return null
    const rating = parseFloat(averageRating)
    if (rating >= 4.5) return "🥇 Vendeur d’or"
    if (rating >= 4.0) return "🥈 Vendeur fiable"
    return null
  }

  const products = allProducts || []

  if (!profile) {
    return <p className="p-6 text-center text-red-500 font-semibold">Profil introuvable.</p>
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-8">
      <BackButton />

      {/* Header Vendeur */}
      <div className="rounded-3xl p-6 bg-white dark:bg-[#0f0f0f] shadow-lg border border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row items-center gap-6">
        <div className="relative w-28 h-28 sm:w-32 sm:h-32 shrink-0">
          <Image
            src={profile.avatar_url || "/default-avatar.png"}
            alt="Avatar"
            fill
            className="rounded-full object-cover border border-gray-300 dark:border-gray-600"
          />
        </div>
        <div className="flex-1 space-y-2 text-center sm:text-left">
          <h1 className="text-2xl font-extrabold text-[#111] dark:text-white flex items-center justify-center sm:justify-start gap-2">
            {profile.username}
            {getBadge() && (
              <span className="bg-yellow-200 text-yellow-900 text-xs font-medium px-2 py-1 rounded-full">
                {getBadge()}
              </span>
            )}
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">{profile.bio || "Pas de description."}</p>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            ⭐ {ratings.length > 0 ? `Note moyenne : ${averageRating}/5` : "Aucun avis pour le moment"}
          </p>

          {/* Actions */}
          <div className="flex flex-wrap justify-center sm:justify-start gap-3 mt-3">
            <a
              href={`https://wa.me/?text=${encodeURIComponent(
                `🔗 Découvre la boutique de ${profile.username} sur Sangse.shop : https://sangse.shop/profile/${id}`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 text-sm rounded-xl flex items-center gap-2"
            >
              <FaWhatsapp />
              Partager
            </a>
            <CopyButton text={`https://sangse.shop/profile/${id}`} platform="Tiktok/Instagram" />
            {user?.id === id && (
              <>
                <Link
                  href="/profile/update"
                  className="bg-[#D29587] hover:bg-[#bb7e70] text-white px-4 py-2 text-sm rounded-xl"
                >
                  ✏️ Modifier mon profil
                </Link>
                <Link
                  href="/dashboard/products"
                  className="bg-[#D29587] hover:bg-[#bb7e70] text-white px-4 py-2 text-sm rounded-xl"
                >
                  📦 Gérer mes produits
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Section Produits */}
      <section>
        <h2 className="text-xl font-semibold text-[#111] dark:text-white mb-4">
          🛍️ Articles en vente
        </h2>
        {products.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((product) => (
              <Link
                href={`/product/${product.id}`}
                key={product.id}
                className="group bg-white dark:bg-[#181818] rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-xl transition"
              >
                <div className="relative w-full aspect-[4/5]">
                  <Image
                    src={product.image_url || "/placeholder.jpg"}
                    alt={product.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-3 space-y-1">
                  <h3 className="text-sm font-medium text-[#222] dark:text-white truncate">
                    {product.title}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">{product.description}</p>
                  <p className="text-sm font-bold text-[#D29587] dark:text-[#FBCFC2]">
                    {product.price.toLocaleString()} FCFA
                  </p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">Ce vendeur n’a pas encore publié d’article.</p>
        )}
      </section>
    </div>
  )
}
