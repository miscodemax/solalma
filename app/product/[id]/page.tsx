// app/product/[id]/page.tsx
import { cookies } from "next/headers"
import { createServerClient } from "@supabase/ssr"
import { supabaseUrl, supabaseKey } from "../../../lib/supabase"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import dayjs from "dayjs"
import RatingSeller from "@/app/composants/ratingseller"
import CopyButton from "@/app/composants/sharebutton"
import { FaWhatsapp, FaCheckCircle, FaClock, FaHeart, FaMapMarkerAlt, FaEye } from "react-icons/fa"
import { HiSparkles, HiPhone, HiShare, HiChatBubbleLeftRight, HiBadgeCheck } from "react-icons/hi2"
import type { Metadata } from "next"
import BackButton from "@/app/composants/back-button"
import ProductImageCarousel from "@/app/composants/ProductImageCarousel"

type Props = {
  params: {
    id: string
  }
}

// --- Metadata SEO ---
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const productId = Number(params.id)
  if (isNaN(productId)) return {}

  const res = await fetch(`${supabaseUrl}/rest/v1/product?id=eq.${productId}`, {
    headers: {
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`,
    },
    cache: "no-store",
  })

  const [product] = await res.json()

  if (!product) return {}

  const priceText = Number(product.price).toLocaleString()

  return {
    title: `${product.title} - ${priceText} FCFA | Sangse.shop`,
    description: `Découvrez ${product.title} pour ${priceText} FCFA - Contactez directement le vendeur ! ${String(product.description || "").slice(0, 100)}...`,
    openGraph: {
      title: product.title,
      description: `Découvrez ${product.title} pour ${priceText} FCFA - Contactez directement le vendeur !`,
      url: `https://sangse.shop/product/${product.id}`,
      images: [
        {
          url: product.image_url || "https://sangse.shop/placeholder.jpg",
          width: 1200,
          height: 630,
          alt: product.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: product.title,
      description: `Découvrez ${product.title} pour ${priceText} FCFA - Contactez directement le vendeur !`,
      images: [product.image_url || "https://sangse.shop/placeholder.jpg"],
    },
  }
}

export default async function ProductDetailPage({ params }: Props) {
  const cookieStore = await cookies()
  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      get: (name) => cookieStore.get(name)?.value,
    },
  })

  try {
    const productId = Number(params.id)
    if (isNaN(productId)) notFound()

    // --- Produit principal ---
    const { data: product, error: productError } = await supabase
      .from("product")
      .select("*")
      .eq("id", productId)
      .single()

    if (productError || !product) {
      console.error("Erreur produit:", productError)
      notFound()
    }

    // --- Images supplémentaires ---
    const { data: productImages } = await supabase
      .from("product_images")
      .select("image_url")
      .eq("product_id", productId)

    // --- Validation des images ---
    const validateImageUrl = (url: string | null) => {
      if (!url || url.trim() === "") return null
      try {
        new URL(url)
        return url
      } catch {
        if (url.startsWith("/") || url.startsWith("./")) return url
        return null
      }
    }

    const validMainImage = validateImageUrl(product.image_url)
    const validAdditionalImages = (productImages || [])
      .map((img) => validateImageUrl(img.image_url))
      .filter(Boolean)

    const allImages = [
      ...(validMainImage ? [validMainImage] : []),
      ...validAdditionalImages,
    ]

    const isNew =
      product.created_at &&
      dayjs(product.created_at).isAfter(dayjs().subtract(7, "day"))

    // --- Produits similaires ---
    const { data: similarProducts } = await supabase
      .from("product")
      .select("id, title, price, image_url, created_at")
      .eq("category", product.category)
      .neq("id", product.id)
      .limit(4)

    // --- Ratings vendeur ---
    const { data: allRatings } = await supabase
      .from("ratings_sellers")
      .select("rating")
      .eq("seller_id", product.user_id)

    // --- Profil vendeur ---
    const { data: profile } = await supabase
      .from("profiles")
      .select("username, avatar_url, bio, created_at")
      .eq("id", product.user_id)
      .single()

    const averageRating =
      allRatings && allRatings.length > 0
        ? allRatings.reduce((a, b) => a + b.rating, 0) / allRatings.length
        : null

    const ratingCount = allRatings?.length || 0
    const sellerId = product.user_id

    // --- WhatsApp ---
    const whatsappClean = product.whatsapp_number?.replace(/\D/g, "")
    const prefilledMessage = `Salut ! Je suis intéressé(e) par "${product.title}" à ${Number(
      product.price
    ).toLocaleString()} FCFA. Est-ce encore disponible ?

Lien produit: https://sangse.shop/product/${product.id}`

    const whatsappLink = whatsappClean
      ? `https://wa.me/${whatsappClean}?text=${encodeURIComponent(
        prefilledMessage
      )}`
      : null

    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F8FAFC] via-[#F1F5F9] to-[#E2E8F0] dark:from-[#0F172A] dark:via-[#1E293B] dark:to-[#334155]">
        {/* Éléments décoratifs optimisés */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-96 h-96 bg-blue-500/3 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-32 right-16 w-80 h-80 bg-purple-500/3 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-emerald-500/3 rounded-full blur-3xl animate-pulse delay-2000"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <BackButton />

          {/* Breadcrumb amélioré */}
          <nav className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 mb-8">
            <Link href="/" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium flex items-center">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
              </svg>
              Accueil
            </Link>
            <span className="text-gray-400">›</span>
            <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-3 py-1 rounded-full font-medium text-xs">
              {product.category || "Produit"}
            </span>
          </nav>

          <div className="grid grid-cols-1 xl:grid-cols-5 gap-8 lg:gap-12">
            {/* Section Images - 3 colonnes sur XL */}
            <div className="xl:col-span-3">
              <div className="sticky top-6">
                {allImages.length > 0 ? (
                  <ProductImageCarousel
                    images={allImages}
                    productTitle={product.title}
                    isNew={isNew}
                  />
                ) : (
                  <div className="w-full aspect-square bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-2xl flex items-center justify-center shadow-lg">
                    <div className="text-center">
                      <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                        <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <p className="text-gray-500 font-medium">Image non disponible</p>
                      <p className="text-sm text-gray-400 mt-1">Le vendeur n'a pas ajouté de photo</p>
                    </div>
                  </div>
                )}

                {/* Statistiques produit */}
                <div className="grid grid-cols-3 gap-4 mt-6">
                  <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-4 rounded-xl text-center border border-gray-200/50 dark:border-gray-700/50">
                    <FaEye className="text-blue-500 text-xl mx-auto mb-2" />
                    <div className="text-sm font-bold text-gray-900 dark:text-gray-100">Vues</div>
                    <div className="text-xs text-gray-500">Bientôt disponible</div>
                  </div>
                  <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-4 rounded-xl text-center border border-gray-200/50 dark:border-gray-700/50">
                    <FaHeart className="text-red-500 text-xl mx-auto mb-2" />
                    <div className="text-sm font-bold text-gray-900 dark:text-gray-100">Favoris</div>
                    <div className="text-xs text-gray-500">Bientôt disponible</div>
                  </div>
                  <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-4 rounded-xl text-center border border-gray-200/50 dark:border-gray-700/50">
                    <HiChatBubbleLeftRight className="text-green-500 text-xl mx-auto mb-2" />
                    <div className="text-sm font-bold text-gray-900 dark:text-gray-100">Messages</div>
                    <div className="text-xs text-gray-500">Contact direct</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Section Informations - 2 colonnes sur XL */}
            <div className="xl:col-span-2 space-y-6">
              {/* En-tête produit */}
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg p-8 rounded-3xl border border-gray-200/50 dark:border-gray-700/50 shadow-xl">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex-1">
                    <h1 className="text-3xl lg:text-4xl font-black text-gray-900 dark:text-white leading-tight mb-4">
                      {product.title}
                    </h1>

                    <div className="flex flex-wrap items-center gap-2 mb-4">
                      {isNew && (
                        <span className="inline-flex items-center bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 text-green-700 dark:text-green-300 px-3 py-1.5 rounded-full text-xs font-bold border border-green-200 dark:border-green-800">
                          <HiSparkles className="mr-1.5 text-sm" />
                          Nouveau
                        </span>
                      )}

                      <span className="inline-flex items-center bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-3 py-1.5 rounded-full text-xs font-medium border border-blue-200 dark:border-blue-800">
                        📁 {product.category || "Non spécifiée"}
                      </span>

                      {product.location && (
                        <span className="inline-flex items-center bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-3 py-1.5 rounded-full text-xs font-medium border border-purple-200 dark:border-purple-800">
                          <FaMapMarkerAlt className="mr-1.5" />
                          {product.location}
                        </span>
                      )}
                    </div>

                    <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                      <FaClock className="mr-2" />
                      Publié le {dayjs(product.created_at).format('DD/MM/YYYY')}
                    </div>
                  </div>

                  <button className="bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 p-3 rounded-full transition-colors">
                    <FaHeart className="text-gray-400 hover:text-red-500 transition-colors text-lg" />
                  </button>
                </div>

                {/* Prix ultra moderne */}
                <div className="relative bg-gradient-to-br from-blue-500/10 via-purple-500/5 to-emerald-500/10 dark:from-blue-500/20 dark:via-purple-500/10 dark:to-emerald-500/20 p-8 rounded-2xl border-2 border-blue-500/20 dark:border-blue-400/30">
                  <div className="absolute -top-3 left-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-1 rounded-full text-sm font-bold">
                    💰 Prix
                  </div>

                  <div className="flex items-end justify-between">
                    <div>
                      <div className="flex items-baseline">
                        <span className="text-4xl lg:text-5xl font-black text-blue-600 dark:text-blue-400">
                          {product.price.toLocaleString()}
                        </span>
                        <span className="text-xl font-semibold text-gray-600 dark:text-gray-400 ml-2">
                          FCFA
                        </span>
                      </div>
                      <p className="text-green-600 dark:text-green-400 font-medium flex items-center mt-2">
                        <FaCheckCircle className="mr-2" />
                        Prix négociable
                      </p>
                    </div>

                    <div className="text-right">
                      <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-3 rounded-xl font-bold text-sm shadow-lg">
                        🔥 CONTACT
                        <br />
                        DIRECT
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              {product.description && (
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg p-6 rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg">
                  <h3 className="font-bold text-lg text-gray-800 dark:text-gray-200 mb-4 flex items-center">
                    📝 Description détaillée
                  </h3>
                  <div className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                    {product.description}
                  </div>
                </div>
              )}

              {/* Carte vendeur moderne */}
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg p-6 rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg">
                <div className="flex items-center gap-4 mb-4">
                  <div className="relative">
                    <Image
                      src={profile?.avatar_url || "/placeholder-avatar.jpg"}
                      alt={profile?.username || "Vendeur"}
                      width={60}
                      height={60}
                      className="rounded-full border-3 border-blue-500/30 object-cover shadow-lg"
                    />
                    <div className="absolute -bottom-1 -right-1 bg-green-500 w-5 h-5 rounded-full border-2 border-white flex items-center justify-center">
                      <HiBadgeCheck className="text-white text-xs" />
                    </div>
                  </div>

                  <div className="flex-1">
                    <h3 className="font-bold text-xl text-gray-800 dark:text-gray-200">
                      {profile?.username || "Vendeur vérifié"}
                    </h3>
                    {profile?.created_at && (
                      <p className="text-sm text-gray-500">
                        Membre depuis {dayjs(profile.created_at).format('MMM YYYY')}
                      </p>
                    )}
                  </div>

                  {sellerId && (
                    <Link
                      href={`/profile/${sellerId}`}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-medium text-sm transition-all duration-300 hover:scale-105 shadow-md"
                    >
                      🏪 Boutique
                    </Link>
                  )}
                </div>

                {profile?.bio && (
                  <div className="mb-4 text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl text-sm">
                    📝 {profile.bio.slice(0, 150)}{profile.bio.length > 150 ? '...' : ''}
                  </div>
                )}

                {sellerId && (
                  <RatingSeller
                    sellerId={sellerId}
                    initialAverage={averageRating}
                    initialCount={ratingCount}
                  />
                )}
              </div>

              {/* Boutons de contact optimisés */}
              <div className="space-y-4">
                <div className="text-center mb-4">
                  <h3 className="font-black text-xl text-gray-800 dark:text-gray-200 mb-2">
                    💬 Prêt(e) à acheter ?
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Contactez le vendeur pour négocier et finaliser
                  </p>
                </div>

                <div className="space-y-3">
                  {whatsappLink ? (
                    <a
                      href={whatsappLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group relative overflow-hidden bg-gradient-to-r from-green-500 via-green-600 to-emerald-600 text-white font-bold text-base px-6 py-4 rounded-xl transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl w-full flex items-center justify-center gap-3"
                    >
                      <FaWhatsapp className="text-xl" />
                      <div>
                        <div>Discuter sur WhatsApp</div>
                        <div className="text-xs opacity-90">Message pré-écrit inclus</div>
                      </div>
                    </a>
                  ) : (
                    <div className="bg-gray-100 dark:bg-gray-800 text-gray-500 font-medium px-6 py-4 rounded-xl text-center">
                      ❌ WhatsApp non disponible
                    </div>
                  )}

                  {product.whatsapp_number && (
                    <a
                      href={`tel:${product.whatsapp_number}`}
                      className="group bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold px-6 py-4 rounded-xl transition-all duration-300 hover:scale-105 shadow-lg w-full flex items-center justify-center gap-3"
                    >
                      <HiPhone className="text-xl" />
                      <div>
                        <div>Appeler maintenant</div>
                        <div className="text-xs opacity-90">{product.whatsapp_number}</div>
                      </div>
                    </a>
                  )}
                </div>

                {/* Zone de partage compacte */}
                <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl">
                  <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center text-sm">
                    <HiShare className="mr-2 text-blue-500" />
                    Partager ce produit
                  </h4>

                  <div className="grid grid-cols-2 gap-3">
                    <a
                      href={`https://wa.me/?text=${encodeURIComponent(
                        `🔥 Regarde ce ${product.title} à ${product.price.toLocaleString()} FCFA sur Sangse.shop ! 
                        
👉 https://sangse.shop/product/${product.id}`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-green-500 hover:bg-green-600 text-white px-4 py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-all text-sm"
                    >
                      <FaWhatsapp />
                      Partager
                    </a>

                    <CopyButton
                      text={`https://sangse.shop/product/${product.id}`}
                      platform="📋 Copier"
                    />
                  </div>
                </div>

                {/* Assurance moderne */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-4 rounded-xl border border-blue-200 dark:border-blue-800">
                  <h4 className="font-bold text-blue-800 dark:text-blue-300 mb-3 text-center text-sm">
                    🛡️ Achat sécurisé
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center text-blue-700 dark:text-blue-300">
                      <FaCheckCircle className="mr-2 text-green-500 text-sm" />
                      Discussion directe
                    </div>
                    <div className="flex items-center text-blue-700 dark:text-blue-300">
                      <FaCheckCircle className="mr-2 text-green-500 text-sm" />
                      Prix négociable
                    </div>
                    <div className="flex items-center text-blue-700 dark:text-blue-300">
                      <FaCheckCircle className="mr-2 text-green-500 text-sm" />
                      Livraison flexible
                    </div>
                    <div className="flex items-center text-blue-700 dark:text-blue-300">
                      <FaCheckCircle className="mr-2 text-green-500 text-sm" />
                      Paiement libre
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section produits similaires */}
          {similarProducts && similarProducts.length > 0 && (
            <section className="mt-16">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-2">
                  Produits similaires
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  D'autres produits qui pourraient vous intéresser
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {similarProducts.map((p) => {
                  const pIsNew = dayjs(p.created_at).isAfter(dayjs().subtract(7, "day"))
                  return (
                    <Link
                      key={p.id}
                      href={`/product/${p.id}`}
                      className="group bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 overflow-hidden hover:scale-105 hover:shadow-xl transition-all duration-300"
                    >
                      <div className="relative h-48 overflow-hidden">
                        <Image
                          src={validateImageUrl(p.image_url) || "/placeholder.jpg"}
                          alt={p.title}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        {pIsNew && (
                          <div className="absolute top-3 left-3 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                            Nouveau
                          </div>
                        )}
                      </div>

                      <div className="p-4">
                        <h3 className="font-bold text-gray-900 dark:text-gray-100 text-sm line-clamp-2 mb-2 group-hover:text-blue-600 transition-colors">
                          {p.title}
                        </h3>
                        <p className="text-blue-600 dark:text-blue-400 font-black text-lg">
                          {p.price.toLocaleString()} FCFA
                        </p>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </section>
          )}
        </div>
      </div>
    )
  } catch (error) {
    console.error("Erreur lors du chargement de la page:", error)
    notFound()
  }
}
