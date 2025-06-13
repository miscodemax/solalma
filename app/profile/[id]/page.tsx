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
import ProductCard from "@/app/composants/product-card"
import { Suspense } from "react"

const categories = [
  { label: 'Vêtement', tip: 'Découvre nos habits tendances pour tous les styles !' },
  { label: 'Artisanat', tip: 'Des pièces uniques faites main, pour offrir ou se faire plaisir.' },
  { label: 'Maquillage', tip: 'Sublime-toi grâce à notre sélection de makeup.' },
  { label: 'Soins et astuces', tip: 'Prends soin de toi avec nos produits naturels et conseils.' }
]

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

function CategoryFilter({
  selectedCategory,
  onSelect,
}: {
  selectedCategory: string | null
  onSelect: (category: string | null) => void
}) {
  return (
    <div className="flex flex-wrap gap-3 mb-2">
      <button
        type="button"
        onClick={() => onSelect(null)}
        className={`px-4 py-2 rounded-full border transition text-sm font-semibold ${!selectedCategory
            ? "bg-[#D29587] text-white border-[#D29587]"
            : "bg-white dark:bg-[#292021] border-[#D29587] text-[#D29587] dark:text-[#FBCFC2] hover:bg-[#FBE9E3]"
          }`}
      >
        Toutes
      </button>
      {categories.map((cat) => (
        <button
          key={cat.label}
          type="button"
          onClick={() => onSelect(cat.label)}
          className={`px-4 py-2 rounded-full border transition text-sm font-semibold relative group ${selectedCategory === cat.label
              ? "bg-[#D29587] text-white border-[#D29587]"
              : "bg-white dark:bg-[#292021] border-[#D29587] text-[#D29587] dark:text-[#FBCFC2] hover:bg-[#FBE9E3]"
            }`}
        >
          {cat.label}
          <span className="absolute left-1/2 -translate-x-1/2 top-full mt-2 z-20 w-max min-w-[160px] max-w-xs px-3 py-2 rounded-xl bg-white dark:bg-[#222] border border-[#EDE9E3] dark:border-[#333] shadow opacity-0 group-hover:opacity-100 pointer-events-none text-xs text-[#D29587] dark:text-[#FBCFC2] transition-opacity">
            {cat.tip}
          </span>
        </button>
      ))}
    </div>
  )
}

function PriceFilter({
  minPrice,
  maxPrice,
  setMinPrice,
  setMaxPrice,
}: {
  minPrice: string
  maxPrice: string
  setMinPrice: (v: string) => void
  setMaxPrice: (v: string) => void
}) {
  return (
    <div className="flex items-center gap-3 mb-2 flex-wrap">
      <input
        type="number"
        value={minPrice}
        min={0}
        onChange={e => setMinPrice(e.target.value)}
        placeholder="Prix min"
        className="px-3 py-2 w-24 rounded-xl border border-[#EDE9E3] dark:border-[#333] bg-white dark:bg-[#19191c] text-sm focus:outline-none focus:ring-2 focus:ring-[#D29587]"
      />
      <span className="text-gray-400 text-sm">—</span>
      <input
        type="number"
        value={maxPrice}
        min={0}
        onChange={e => setMaxPrice(e.target.value)}
        placeholder="Prix max"
        className="px-3 py-2 w-24 rounded-xl border border-[#EDE9E3] dark:border-[#333] bg-white dark:bg-[#19191c] text-sm focus:outline-none focus:ring-2 focus:ring-[#D29587]"
      />
    </div>
  )
}

// Client-side filter logic
function ProductGallery({
  products,
  userId,
}: {
  products: any[]
  userId?: string
}) {
  "use client"
  import { useState, useMemo } from "react"
  const [category, setCategory] = useState<string | null>(null)
  const [minPrice, setMinPrice] = useState("")
  const [maxPrice, setMaxPrice] = useState("")

  const filtered = useMemo(() => {
    let filtered = [...products]
    if (category) filtered = filtered.filter(p => p.category === category)
    if (minPrice) filtered = filtered.filter(p => Number(p.price) >= Number(minPrice))
    if (maxPrice) filtered = filtered.filter(p => Number(p.price) <= Number(maxPrice))
    return filtered
  }, [products, category, minPrice, maxPrice])

  return (
    <>
      <CategoryFilter selectedCategory={category} onSelect={setCategory} />
      <PriceFilter minPrice={minPrice} maxPrice={maxPrice} setMinPrice={setMinPrice} setMaxPrice={setMaxPrice} />
      {filtered.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} userId={userId} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-3xl">
          <div className="w-20 h-20 mx-auto mb-4 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
            <FaBox className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Aucun produit trouvé
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Essayez d’autres filtres ou revenez plus tard 🌸
          </p>
        </div>
      )}
    </>
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
        className={`w-4 h-4 ${i < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'
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
          <Link href="/" className="inline-block bg-[#D29587] text-white px-6 py-3 rounded-xl">
            Retour à l accueil
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 space-y-6">
      <BackButton />

      {/* Header Premium */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-pink-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900 shadow-xl border border-pink-100 dark:border-gray-700">
        {/* Badge flottant si vendeur premium */}
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
            {/* Avatar avec statut en ligne */}
            <div className="relative">
              <div className="relative w-32 h-32 sm:w-36 sm:h-36 shrink-0">
                <Image
                  src={profile.avatar_url || "/default-avatar.png"}
                  alt={`Boutique de ${profile.username}`}
                  fill
                  className="rounded-full object-cover border-4 border-white dark:border-gray-700 shadow-lg"
                />
                {/* Indicateur vérifié si badge */}
                {badge && (
                  <div className="absolute -bottom-2 -right-2 bg-green-500 rounded-full p-2 border-4 border-white dark:border-gray-800">
                    <HiBadgeCheck className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
            </div>

            {/* Infos vendeur */}
            <div className="flex-1 text-center sm:text-left space-y-3">
              <div>
                <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-2">
                  {profile.username}
                </h1>
                <p className="text-gray-600 dark:text-gray-300 text-base leading-relaxed">
                  {profile.bio || "✨ Passionnée de mode, je partage mes coups de cœur avec vous !"}
                </p>
              </div>

              {/* Stats en ligne */}
              <div className="flex flex-wrap justify-center sm:justify-start gap-4 text-sm">
                <div className="flex items-center gap-2 bg-white/50 dark:bg-gray-800/50 px-3 py-2 rounded-xl">
                  <FaBox className="text-[#D29587]" />
                  <span className="font-semibold">{totalProducts}</span>
                  <span className="text-gray-600 dark:text-gray-400">articles</span>
                </div>

                {ratings.length > 0 && (
                  <div className="flex items-center gap-2 bg-white/50 dark:bg-gray-800/50 px-3 py-2 rounded-xl">
                    <div className="flex items-center gap-1">
                      {renderStars(parseFloat(averageRating!))}
                    </div>
                    <span className="font-semibold">{averageRating}</span>
                    <span className="text-gray-600 dark:text-gray-400">({ratings.length} avis)</span>
                  </div>
                )}

                {!ratings.length && (
                  <div className="flex items-center gap-2 bg-white/50 dark:bg-gray-800/50 px-3 py-2 rounded-xl">
                    <HiTrendingUp className="text-blue-500" />
                    <span className="text-gray-600 dark:text-gray-400">Nouveau vendeur</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Actions principales */}
          <div className="mt-6 pt-6 border-t border-pink-100 dark:border-gray-700">
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

              <CopyButton
                text={`https://sangse.shop/profile/${id}`}
                platform="Copier le lien"
              />

              {isOwner && (
                <>
                  <Link
                    href="/profile/update"
                    className="bg-[#D29587] hover:bg-[#bb7e70] text-white px-6 py-3 rounded-xl flex items-center gap-2 font-semibold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
                  >
                    ✏️ Modifier profil
                  </Link>
                  <Link
                    href="/dashboard/products"
                    className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-xl flex items-center gap-2 font-semibold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
                  >
                    📦 Gérer produits
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Section Produits améliorée */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <div className="w-1 h-8 bg-gradient-to-b from-[#D29587] to-purple-500 rounded-full"></div>
            Ma Collection
          </h2>
          {totalProducts > 0 && (
            <span className="bg-[#D29587] text-white px-3 py-1 rounded-full text-sm font-semibold">
              {totalProducts} articles
            </span>
          )}
        </div>
        <Suspense fallback={<div>Chargement des filtres...</div>}>
          {/* Filtrage par catégorie/prix */}
          <ProductGallery products={products} userId={user?.id} />
        </Suspense>
      </section>

      {/* Call to action pour visiteurs */}
      {!isOwner && products.length > 0 && (
        <div className="bg-gradient-to-r from-[#D29587] to-purple-500 rounded-3xl p-6 text-center text-white">
          <h3 className="text-xl font-bold mb-2">💝 Un coup de cœur ?</h3>
          <p className="mb-4 opacity-90">Contactez {profile.username} directement via WhatsApp pour commander</p>
          <a
            href={`https://wa.me/?text=${encodeURIComponent(
              `Bonjour ${profile.username} ! J'ai vu votre boutique sur Sangse.shop et j'aimerais en savoir plus sur vos articles 😊`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-white text-[#D29587] px-6 py-3 rounded-xl font-bold hover:bg-gray-100 transition-colors"
          >
            <FaWhatsapp className="w-5 h-5" />
            Contacter maintenant
          </a>
        </div>
      )}
    </div>
  )
}