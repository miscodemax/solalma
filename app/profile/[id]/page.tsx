"use client"
import { cookies } from "next/headers"
import { createServerClient } from "@supabase/ssr"
import { supabaseUrl, supabaseKey } from "@/lib/supabase"
import Image from "next/image"
import Link from "next/link"
import CopyButton from "@/app/composants/sharebutton"
import { FaWhatsapp, FaStar, FaBox, FaTimes } from "react-icons/fa"
import { HiBadgeCheck, HiTrendingUp } from "react-icons/hi"
import { Metadata } from "next"
import BackButton from "@/app/composants/back-button"
import { Suspense, useState } from "react"
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

// Modal pour voir la photo de profil en grand
function AvatarModal({ isOpen, onClose, imageUrl, username }: {
  isOpen: boolean,
  onClose: () => void,
  imageUrl: string,
  username: string
}) {
  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div className="relative max-w-md w-full">
        {/* Bouton fermer */}
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 text-white/80 hover:text-white transition-colors z-10"
        >
          <FaTimes className="w-6 h-6" />
        </button>

        {/* Image en grand */}
        <div className="relative w-full aspect-square rounded-2xl overflow-hidden">
          <Image
            src={imageUrl}
            alt={username}
            fill
            className="object-cover"
            priority
          />
        </div>

        {/* Nom en dessous */}
        <div className="text-center mt-4">
          <h3 className="text-white text-xl font-bold">{username}</h3>
        </div>
      </div>
    </div>
  )
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
    if (rating >= 4.5) return { label: "Vendeur d'Or", icon: "🥇", color: "from-yellow-400 to-yellow-600" }
    if (rating >= 4.0) return { label: "Vendeur Fiable", icon: "🥈", color: "from-gray-300 to-gray-500" }
    if (rating >= 3.5) return { label: "Bon Vendeur", icon: "🥉", color: "from-orange-300 to-orange-500" }
    return null
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <FaStar
        key={i}
        className={`w-4 h-4 transition-colors ${i < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'
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
        <div className="text-center space-y-4 animate-fade-in">
          <div className="w-20 h-20 mx-auto bg-red-100 rounded-full flex items-center justify-center animate-bounce">
            <span className="text-2xl">😕</span>
          </div>
          <p className="text-lg font-semibold text-red-600">Profil introuvable</p>
          <Link href="/" className="inline-block bg-[#D29587] hover:bg-[#bb7e70] text-white px-6 py-3 rounded-xl transition-all duration-200 hover:scale-105">
            Retour à l'accueil
          </Link>
        </div>
      </div>
    )
  }

  return (
    <ProfilePageContent
      profile={profile}
      user={user}
      products={products}
      ratings={ratings}
      averageRating={averageRating}
      badge={badge}
      totalProducts={totalProducts}
      isOwner={isOwner}
      id={id}
      renderStars={renderStars}
    />
  )
}

// Composant client séparé pour gérer l'état
function ProfilePageContent({
  profile,
  user,
  products,
  ratings,
  averageRating,
  badge,
  totalProducts,
  isOwner,
  id,
  renderStars
}: any) {
  const [showAvatarModal, setShowAvatarModal] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`https://sangse.shop/profile/${id}`)
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 2000)
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 space-y-6">
      <BackButton />

      {/* Modal pour voir l'avatar en grand */}
      <AvatarModal
        isOpen={showAvatarModal}
        onClose={() => setShowAvatarModal(false)}
        imageUrl={profile.avatar_url || "/default-avatar.png"}
        username={profile.username}
      />

      {/* Header Premium avec animations */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-pink-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900 shadow-xl border border-pink-100 dark:border-gray-700 animate-fade-in">
        {/* Badge flottant avec animation */}
        {badge && (
          <div className="absolute top-4 right-4 z-10 animate-slide-in-right">
            <div className={`bg-gradient-to-r ${badge.color} text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1 hover:scale-110 transition-transform cursor-default`}>
              <span className="animate-bounce">{badge.icon}</span>
              <span>{badge.label}</span>
            </div>
          </div>
        )}

        <div className="p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            {/* Avatar cliquable avec effet hover */}
            <div className="relative group">
              <div className="relative w-32 h-32 sm:w-36 sm:h-36 shrink-0">
                <div
                  className="relative w-full h-full cursor-pointer transform transition-all duration-300 group-hover:scale-105"
                  onClick={() => setShowAvatarModal(true)}
                >
                  <Image
                    src={profile.avatar_url || "/default-avatar.png"}
                    alt={`Boutique de ${profile.username}`}
                    fill
                    className="rounded-full object-cover border-4 border-white dark:border-gray-700 shadow-lg group-hover:shadow-2xl transition-shadow duration-300"
                  />

                  {/* Overlay au hover */}
                  <div className="absolute inset-0 bg-black/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <span className="text-white text-sm font-medium bg-black/50 px-2 py-1 rounded-full">
                      Voir en grand
                    </span>
                  </div>
                </div>

                {/* Indicateur vérifié avec animation */}
                {badge && (
                  <div className="absolute -bottom-2 -right-2 bg-green-500 rounded-full p-2 border-4 border-white dark:border-gray-800 animate-pulse">
                    <HiBadgeCheck className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
            </div>

            {/* Infos vendeur avec animations */}
            <div className="flex-1 text-center sm:text-left space-y-3 animate-slide-in-left">
              <div>
                <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-2 hover:text-[#D29587] transition-colors duration-300">
                  {profile.username}
                </h1>
                <p className="text-gray-600 dark:text-gray-300 text-base leading-relaxed">
                  {profile.bio || "✨ Passionnée de mode, je partage mes coups de cœur avec vous !"}
                </p>
              </div>

              {/* Stats en ligne avec hover effects */}
              <div className="flex flex-wrap justify-center sm:justify-start gap-4 text-sm">
                <div className="flex items-center gap-2 bg-white/50 dark:bg-gray-800/50 px-3 py-2 rounded-xl hover:bg-white/80 dark:hover:bg-gray-700/80 transition-all duration-200 hover:scale-105 cursor-default">
                  <FaBox className="text-[#D29587]" />
                  <span className="font-semibold">{totalProducts}</span>
                  <span className="text-gray-600 dark:text-gray-400">articles</span>
                </div>

                {ratings.length > 0 && (
                  <div className="flex items-center gap-2 bg-white/50 dark:bg-gray-800/50 px-3 py-2 rounded-xl hover:bg-white/80 dark:hover:bg-gray-700/80 transition-all duration-200 hover:scale-105 cursor-default">
                    <div className="flex items-center gap-1">
                      {renderStars(parseFloat(averageRating!))}
                    </div>
                    <span className="font-semibold">{averageRating}</span>
                    <span className="text-gray-600 dark:text-gray-400">({ratings.length} avis)</span>
                  </div>
                )}

                {!ratings.length && (
                  <div className="flex items-center gap-2 bg-white/50 dark:bg-gray-800/50 px-3 py-2 rounded-xl hover:bg-white/80 dark:hover:bg-gray-700/80 transition-all duration-200 hover:scale-105 cursor-default">
                    <HiTrendingUp className="text-blue-500" />
                    <span className="text-gray-600 dark:text-gray-400">Nouveau vendeur</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Actions principales avec animations améliorées */}
          <div className="mt-6 pt-6 border-t border-pink-100 dark:border-gray-700">
            <div className="flex flex-wrap justify-center sm:justify-start gap-3">
              <Link
                href={`https://wa.me/?text=${encodeURIComponent(
                  `🔗 Découvre la boutique de ${profile.username} sur Sangse.shop : https://sangse.shop/profile/${id}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-xl flex items-center gap-2 font-semibold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 active:scale-95"
              >
                <FaWhatsapp className="w-5 h-5" />
                Partager sur WhatsApp
              </Link>

              <button
                onClick={handleCopyLink}
                className={`${copiedLink ? 'bg-green-500' : 'bg-gray-500 hover:bg-gray-600'} text-white px-6 py-3 rounded-xl flex items-center gap-2 font-semibold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 active:scale-95`}
              >
                {copiedLink ? '✅' : '📋'} {copiedLink ? 'Copié !' : 'Copier le lien'}
              </button>

              {isOwner && (
                <>
                  <Link
                    href="/profile/update"
                    className="bg-[#D29587] hover:bg-[#bb7e70] text-white px-6 py-3 rounded-xl flex items-center gap-2 font-semibold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 active:scale-95"
                  >
                    ✏️ Modifier profil
                  </Link>
                  <Link
                    href="/dashboard/products"
                    className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-xl flex items-center gap-2 font-semibold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 active:scale-95"
                  >
                    📦 Gérer produits
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Section Produits avec animation */}
      <section className="space-y-4 animate-slide-in-up">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <div className="w-1 h-8 bg-gradient-to-b from-[#D29587] to-purple-500 rounded-full animate-pulse"></div>
            Ma Collection
          </h2>
          {totalProducts > 0 && (
            <span className="bg-[#D29587] text-white px-3 py-1 rounded-full text-sm font-semibold animate-bounce">
              {totalProducts} articles
            </span>
          )}
        </div>
        <Suspense fallback={<Loader />}>
          <ProductGallery products={products} userId={user?.id} />
        </Suspense>
      </section>

      {/* Call to action pour visiteurs avec animation */}
      {!isOwner && products.length > 0 && (
        <div className="bg-gradient-to-r from-[#D29587] to-purple-500 rounded-3xl p-6 text-center text-white animate-fade-in hover:shadow-2xl transition-shadow duration-300">
          <h3 className="text-xl font-bold mb-2">💝 Un coup de cœur ?</h3>
          <p className="mb-4 opacity-90">Contactez {profile.username} directement via WhatsApp pour commander</p>
          <a
            href={`https://wa.me/?text=${encodeURIComponent(
              `Bonjour ${profile.username} ! J'ai vu votre boutique sur Sangse.shop et j'aimerais en savoir plus sur vos articles 😊`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-white text-[#D29587] px-6 py-3 rounded-xl font-bold hover:bg-gray-100 transition-all duration-200 hover:scale-105 active:scale-95"
          >
            <FaWhatsapp className="w-5 h-5" />
            Contacter maintenant
          </a>
        </div>
      )}

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slide-in-right {
          from { opacity: 0; transform: translateX(50px); }
          to { opacity: 1; transform: translateX(0); }
        }
        
        @keyframes slide-in-left {
          from { opacity: 0; transform: translateX(-50px); }
          to { opacity: 1; transform: translateX(0); }
        }
        
        @keyframes slide-in-up {
          from { opacity: 0; transform: translateY(50px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
        
        .animate-slide-in-right {
          animation: slide-in-right 0.8s ease-out;
        }
        
        .animate-slide-in-left {
          animation: slide-in-left 0.8s ease-out;
        }
        
        .animate-slide-in-up {
          animation: slide-in-up 0.8s ease-out;
        }
      `}</style>
    </div>
  )
}