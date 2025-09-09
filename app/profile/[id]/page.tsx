import { cookies } from "next/headers"
import { createServerClient } from "@supabase/ssr"
import { supabaseUrl, supabaseKey } from "@/lib/supabase"
import Image from "next/image"
import Link from "next/link"
import CopyButton from "@/app/composants/sharebutton"
import { FaWhatsapp, FaStar, FaBox } from "react-icons/fa"
import { HiBadgeCheck, HiTrendingUp } from "react-icons/hi"
import { Metadata } from "next"
import BackButton from "@/app/composants/back-button"
import { Suspense } from "react"
import ProductGallery from "@/app/composants/productgallery"
import Loader from "@/app/loading"

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

  const description = profile?.bio || "Voici ma boutique sur Sangse 🌸Tu peux commander tous mes produits ici, c'est rapide et sécurisé.Tu peux même te connecter avec Google en 1 clic."
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
    if (rating >= 4.5) return { label: "Vendeur d'Or", icon: "🥇", color: "from-[#F6C445] to-yellow-600" }
    if (rating >= 4.0) return { label: "Vendeur Fiable", icon: "🥈", color: "from-gray-300 to-gray-500" }
    if (rating >= 3.5) return { label: "Bon Vendeur", icon: "🥉", color: "from-orange-300 to-orange-500" }
    return null
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <FaStar
        key={i}
        className={`w-4 h-4 ${i < Math.floor(rating) ? 'text-[#F6C445]' : 'text-gray-300 dark:text-gray-600'
          }`}
      />
    ))
  }

  const products = allProducts || []
  const badge = getBadge()
  const totalProducts = products.length
  const isOwner = user?.id === id

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 mx-auto bg-red-100 rounded-full flex items-center justify-center">
            <span className="text-2xl">😕</span>
          </div>
          <p className="text-lg font-semibold text-red-600">Profil introuvable</p>
          <Link href="/" className="inline-block bg-[#F6C445] text-[#1C2B49] px-6 py-3 rounded-xl font-bold">
            Retour à l accueil
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 space-y-6">
      <BackButton />

      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#F6C445]/10 via-white to-[#1C2B49]/5 dark:from-[#1C2B49] dark:via-gray-800 dark:to-[#1C2B49] shadow-xl border border-[#F6C445]/30 dark:border-[#1C2B49]">
        {badge && (
          <div className="absolute top-4 right-4 z-10">
            <div className={`bg-gradient-to-r ${badge.color} text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1`}>
              <span>{badge.icon}</span>
              <span>{badge.label}</span>
            </div>
          </div>
        )}

        <div className="p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="relative w-32 h-32 sm:w-36 sm:h-36 shrink-0">
              <Image
                src={profile.avatar_url || "/default-avatar.png"}
                alt={`Boutique de ${profile.username}`}
                fill
                className="rounded-full object-cover border-4 border-white dark:border-[#1C2B49] shadow-lg"
              />
              {badge && (
                <div className="absolute -bottom-2 -right-2 bg-[#F6C445] rounded-full p-2 border-4 border-white dark:border-[#1C2B49]">
                  <HiBadgeCheck className="w-4 h-4 text-white" />
                </div>
              )}
            </div>

            <div className="flex-1 text-center sm:text-left space-y-3">
              <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-2">
                {profile.username}
              </h1>
              <p className="text-gray-600 dark:text-gray-300 text-base leading-relaxed">
                {profile.bio || "✨ Passionnée de mode, je partage mes coups de cœur avec vous !"}
              </p>

              <div className="flex flex-wrap justify-center sm:justify-start gap-4 text-sm">
                <div className="flex items-center gap-2 bg-white/50 dark:bg-[#1C2B49]/50 px-3 py-2 rounded-xl">
                  <FaBox className="text-[#F6C445]" />
                  <span className="font-semibold">{totalProducts}</span>
                  <span className="text-gray-600 dark:text-gray-400">articles</span>
                </div>

                {ratings.length > 0 ? (
                  <div className="flex items-center gap-2 bg-white/50 dark:bg-[#1C2B49]/50 px-3 py-2 rounded-xl">
                    <div className="flex items-center gap-1">
                      {renderStars(parseFloat(averageRating!))}
                    </div>
                    <span className="font-semibold">{averageRating}</span>
                    <span className="text-gray-600 dark:text-gray-400">({ratings.length} avis)</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 bg-white/50 dark:bg-[#1C2B49]/50 px-3 py-2 rounded-xl">
                    <HiTrendingUp className="text-[#F6C445]" />
                    <span className="text-gray-600 dark:text-gray-400">Nouveau vendeur</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-[#F6C445]/30 dark:border-[#1C2B49]">
            <div className="flex flex-wrap justify-center sm:justify-start gap-3">
              <Link
                href={`https://wa.me/?text=${encodeURIComponent(
                  `🔗 Découvre la boutique de ${profile.username} sur Sangse.shop : https://sangse.shop/profile/${id}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-xl flex items-center gap-2 font-semibold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
              >
                <FaWhatsapp className="w-5 h-5" />
                Partager sur WhatsApp
              </Link>

              <CopyButton text={`https://sangse.shop/profile/${id}`} platform="Copier le lien" />

              {isOwner && (
                <>
                  <Link
                    href="/profile/update"
                    className="bg-[#F6C445] hover:bg-yellow-500 text-[#1C2B49] px-6 py-3 rounded-xl flex items-center gap-2 font-bold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
                  >
                    ✏️ Modifier profil
                  </Link>
                  <Link
                    href="/dashboard/products"
                    className="bg-[#1C2B49] hover:bg-[#24375e] text-white px-6 py-3 rounded-xl flex items-center gap-2 font-bold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
                  >
                    📦 Gérer produits
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <div className="w-1 h-8 bg-gradient-to-b from-[#F6C445] to-[#1C2B49] rounded-full"></div>
            Ma Collection
          </h2>
          {totalProducts > 0 && (
            <span className="bg-[#F6C445] text-[#1C2B49] px-3 py-1 rounded-full text-sm font-bold">
              {totalProducts} articles
            </span>
          )}
        </div>
        <Suspense fallback={<Loader />}>
          <ProductGallery products={products} userId={user?.id} />
        </Suspense>
      </section>

      {!isOwner && products.length > 0 && (
        <div className="bg-gradient-to-r from-[#F6C445] to-[#1C2B49] rounded-3xl p-6 text-center text-white">
          <h3 className="text-xl font-bold mb-2">💝 Un coup de cœur ?</h3>
          <p className="mb-4 opacity-90">Contactez {profile.username} directement via WhatsApp pour commander</p>
          <a
            href={`https://wa.me/?text=${encodeURIComponent(
              `Bonjour ${profile.username} ! J'ai vu votre boutique sur Sangse.shop et j'aimerais en savoir plus sur vos articles 😊`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-white text-[#1C2B49] px-6 py-3 rounded-xl font-bold hover:bg-gray-100 transition-colors"
          >
            <FaWhatsapp className="w-5 h-5" />
            Contacter maintenant
          </a>
        </div>
      )}
    </div>
  )
}
