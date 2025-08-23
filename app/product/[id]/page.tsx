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
import { FaWhatsapp, FaCheckCircle, FaClock, FaHeart, FaMapMarkerAlt, FaUserCheck } from "react-icons/fa"
import { HiSparkles, HiPhone, HiShare } from "react-icons/hi2"
import type { Metadata } from "next"
import BackButton from "@/app/composants/back-button"
import ProductImageCarousel from "@/app/composants/ProductImageCarousel"

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const res = await fetch(`${supabaseUrl}/rest/v1/product?id=eq.${params.id}`, {
    headers: {
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`,
    },
    cache: "no-store",
  })

  const [product] = await res.json()

  if (!product) return {}

  return {
    title: product.title,
    description: `Découvrez ${product.title} pour ${product.price} FCFA - Contactez directement le vendeur !`,
    openGraph: {
      title: product.title,
      description: `Découvrez ${product.title} pour ${product.price} FCFA - Contactez directement le vendeur !`,
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
      description: `Découvrez ${product.title} pour ${product.price} FCFA - Contactez directement le vendeur !`,
      images: [product.image_url || "https://sangse.shop/placeholder.jpg"],
    },
  }
}

type Props = {
  params: {
    id: string
  }
}

export default async function ProductDetailPage({ params }: Props) {
  const cookieStore = await cookies()
  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      get: (name) => cookieStore.get(name)?.value,
    },
  })

  const {
    data: product,
    error: productError,
  } = await supabase
    .from("product")
    .select("*")
    .eq("id", Number(params.id))
    .single()

  // Récupérer les images supplémentaires
  const { data: productImages } = await supabase
    .from("product_images")
    .select("image_url")
    .eq("product_id", Number(params.id))

  const {
    data: allProducts,
  } = await supabase
    .from("product")
    .select("*")
    .eq("user_id", product?.user_id)

  if (productError || !product) {
    notFound()
  }

  // Construire le tableau de toutes les images
  const allImages = [
    product.image_url, // Image principale en premier
    ...(productImages?.map(img => img.image_url) || [])
  ].filter(Boolean) // Filtrer les valeurs null/undefined

  const isNew =
    product.created_at &&
    dayjs(product.created_at).isAfter(dayjs().subtract(7, "day"))

  const { data: similarProducts } = await supabase
    .from("product")
    .select("id, title, price, image_url")
    .eq("category", product.category)
    .neq("id", product.id)
    .limit(4)

  const { data: allRatings } = await supabase
    .from('ratings_sellers')
    .select('rating')
    .eq('seller_id', Number(params.id))

  const { data: profile } = await supabase
    .from("profiles")
    .select("username, avatar_url, bio")
    .eq("id", product.user_id)
    .single()

  const averageRating =
    allRatings && allRatings.length > 0
      ? allRatings.reduce((a, b) => a + b.rating, 0) / allRatings.length
      : null

  const ratingCount = allRatings?.length || 0
  const sellerId = product.user_id

  const whatsappClean = product.whatsapp_number?.replace(/\D/g, "")
  const prefilledMessage = `Salut ! Je suis intéressé(e) par "${product.title}" à ${product.price.toLocaleString()} FCFA. Est-ce encore disponible ? 

Lien produit: https://sangse.shop/product/${product.id}`
  const whatsappLink = whatsappClean
    ? `https://wa.me/${whatsappClean}?text=${encodeURIComponent(prefilledMessage)}`
    : null

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F9F6F1] via-[#FDF9F4] to-[#F5F1EC] dark:from-[#0A0A0A] dark:via-[#121212] dark:to-[#1A1A1A]">
      {/* Éléments décoratifs flottants */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 bg-[#D29587]/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-32 right-16 w-80 h-80 bg-[#E6B8A2]/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        <BackButton />

        {/* Breadcrumb moderne */}
        <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-8">
          <Link href="/" className="hover:text-[#D29587] transition-colors font-medium">🏠 Accueil</Link>
          <span className="text-[#D29587]">›</span>
          <span className="bg-[#D29587]/10 text-[#D29587] px-3 py-1 rounded-full font-medium">
            {product.category || "Produit"}
          </span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          {/* Section Images avec Carousel */}
          <div className="space-y-6">
            <ProductImageCarousel
              images={allImages}
              productTitle={product.title}
              isNew={isNew}
            />

            {/* Zone de partage moderne */}
            <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-lg p-6 rounded-2xl border border-white/30 shadow-xl">
              <h3 className="font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center text-lg">
                <HiShare className="mr-3 text-[#D29587] text-xl" />
                Partager ce produit
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(
                    `🔥 Regarde ce ${product.title} à ${product.price.toLocaleString()} FCFA sur Sangse.shop ! 
                    
${product.description?.slice(0, 100)}...

👉 https://sangse.shop/product/${product.id}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 py-4 rounded-xl font-semibold flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  <FaWhatsapp className="text-xl" />
                  Partager
                </a>

                <CopyButton
                  text={`https://sangse.shop/product/${product.id}`}
                  platform="📋 Copier"
                />
              </div>
            </div>
          </div>

          {/* Section Informations repensée */}
          <div className="space-y-8">
            {/* En-tête produit avec effets */}
            <div className="space-y-6">
              <div>
                <h1 className="text-4xl lg:text-5xl font-black text-gray-900 dark:text-white leading-tight mb-4">
                  {product.title}
                </h1>

                <div className="flex flex-wrap items-center gap-3 mb-6">
                  <span className="inline-flex items-center bg-gradient-to-r from-[#D29587]/20 to-[#E6B8A2]/20 text-[#D29587] px-4 py-2 rounded-full text-sm font-bold border border-[#D29587]/30">
                    📁 {product.category || "Non spécifiée"}
                  </span>

                  {product.location && (
                    <span className="inline-flex items-center bg-blue-50 text-blue-600 px-4 py-2 rounded-full text-sm font-medium">
                      <FaMapMarkerAlt className="mr-2" />
                      {product.location}
                    </span>
                  )}

                  <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                    <FaClock className="inline mr-1" />
                    {dayjs(product.created_at).format('DD/MM/YYYY')}
                  </span>
                </div>
              </div>

              {/* Prix avec effet dramatique */}
              <div className="relative bg-gradient-to-br from-[#D29587]/10 via-[#E6B8A2]/10 to-[#D29587]/5 p-8 rounded-3xl border-2 border-[#D29587]/20 shadow-2xl">
                <div className="absolute -top-3 left-6 bg-[#D29587] text-white px-4 py-1 rounded-full text-sm font-bold">
                  💰 Prix
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-5xl lg:text-6xl font-black text-[#D29587] mb-2">
                      {product.price.toLocaleString()}
                      <span className="text-2xl font-semibold ml-2">FCFA</span>
                    </p>
                    <p className="text-green-600 font-medium flex items-center">
                      <FaCheckCircle className="mr-2" />
                      Prix négociable au contact
                    </p>
                  </div>

                  <div className="text-right">
                    <div className="bg-gradient-to-r from-orange-400 to-red-400 text-white px-6 py-3 rounded-2xl font-bold text-sm shadow-lg">
                      🔥 CONTACT
                      <br />
                      DIRECT
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Carte vendeur redessinée - toujours affichée */}
            <div className="bg-gradient-to-r from-white/80 to-white/60 dark:from-gray-800/80 dark:to-gray-800/60 backdrop-blur-lg p-8 rounded-3xl border border-white/30 shadow-2xl">
              <div className="flex items-center gap-4 mb-6">
                <div className="relative">
                  <Image
                    src={profile?.avatar_url || "/placeholder-avatar.jpg"}
                    alt={profile?.username || "Vendeur"}
                    width={64}
                    height={64}
                    className="rounded-full border-4 border-[#D29587]/30 object-cover shadow-lg"
                  />
                  <div className="absolute -bottom-1 -right-1 bg-green-500 w-6 h-6 rounded-full border-2 border-white flex items-center justify-center">
                    <FaCheckCircle className="text-white text-xs" />
                  </div>
                </div>

                <div className="flex-1">
                  <h3 className="font-bold text-xl text-gray-800 dark:text-gray-200">
                    {profile?.username || "Vendeur vérifié"}
                  </h3>

                  {sellerId && (
                    <p className="text-xs text-gray-500 mt-1">
                      ID: {sellerId}
                    </p>
                  )}
                </div>

                {sellerId ? (
                  <Link
                    href={`/profile/${sellerId}`}
                    className="bg-[#D29587] hover:bg-[#bb6b5f] text-white px-6 py-3 rounded-xl font-medium text-sm transition-all duration-300 hover:scale-105 shadow-lg flex items-center gap-2"
                  >
                    🏪 Voir boutique
                  </Link>
                ) : (
                  <div className="bg-gray-300 text-gray-500 px-6 py-3 rounded-xl font-medium text-sm">
                    Boutique indisponible
                  </div>
                )}
              </div>

              {profile?.bio && (
                <div className="mb-6 text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl">
                  📝 {profile.bio.slice(0, 120)}{profile.bio.length > 120 ? '...' : ''}
                </div>
              )}

              {sellerId && (
                <RatingSeller
                  sellerId={sellerId}
                  initialAverage={averageRating}
                  initialCount={ratingCount}
                />
              )}

              {/* Bouton alternatif vers la boutique */}
              {sellerId && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                  <Link
                    href={`/profile/${sellerId}`}
                    className="w-full bg-gradient-to-r from-[#D29587]/10 to-[#E6B8A2]/10 hover:from-[#D29587]/20 hover:to-[#E6B8A2]/20 text-[#D29587] px-4 py-3 rounded-xl font-medium text-center transition-all duration-300 hover:scale-105 border-2 border-[#D29587]/20 hover:border-[#D29587]/40 flex items-center justify-center gap-2"
                  >
                    🛍️ Voir tous ses produits
                    <span className="text-xs bg-[#D29587]/20 px-2 py-1 rounded-full">
                      +{allProducts && (allProducts.length - 1)}
                    </span>
                  </Link>
                </div>
              )}
            </div>

            {/* Boutons de contact repensés */}
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="font-black text-2xl text-gray-800 dark:text-gray-200 mb-2">
                  💬 Prêt(e) à discuter ?
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Contactez directement le vendeur pour négocier
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {whatsappLink ? (
                  <a
                    href={whatsappLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative overflow-hidden bg-gradient-to-r from-green-500 via-green-600 to-emerald-600 text-white font-bold text-lg px-8 py-6 rounded-2xl transition-all duration-300 hover:scale-105 shadow-2xl hover:shadow-3xl"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative flex items-center justify-center gap-4">
                      <FaWhatsapp className="text-2xl animate-pulse" />
                      <div className="text-center">
                        <div>Discuter sur WhatsApp</div>
                        <div className="text-sm opacity-90">Message pré-écrit inclus</div>
                      </div>
                    </div>
                  </a>
                ) : (
                  <div className="bg-gray-100 dark:bg-gray-800 text-gray-500 font-bold text-lg px-8 py-6 rounded-2xl text-center">
                    ❌ WhatsApp non disponible
                  </div>
                )}

                {product.whatsapp_number && (
                  <a
                    href={`tel:${product.whatsapp_number}`}
                    className="group bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold text-lg px-8 py-6 rounded-2xl transition-all duration-300 hover:scale-105 shadow-xl hover:shadow-2xl"
                  >
                    <div className="flex items-center justify-center gap-4">
                      <HiPhone className="text-2xl group-hover:animate-bounce" />
                      <div className="text-center">
                        <div>Appeler maintenant</div>
                        <div className="text-sm opacity-90">{product.whatsapp_number}</div>
                      </div>
                    </div>
                  </a>
                )}
              </div>

              {/* Assurance et confiance */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-6 rounded-2xl border border-blue-200 dark:border-blue-800">
                <h4 className="font-bold text-blue-800 dark:text-blue-300 mb-3 text-center">
                  🛡️ Achat en toute confiance
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center text-blue-700 dark:text-blue-300">
                    <FaCheckCircle className="mr-2 text-green-500" />
                    Discussion directe avec le vendeur
                  </div>
                  <div className="flex items-center text-blue-700 dark:text-blue-300">
                    <FaCheckCircle className="mr-2 text-green-500" />
                    Négociation libre du prix
                  </div>
                  <div className="flex items-center text-blue-700 dark:text-blue-300">
                    <FaCheckCircle className="mr-2 text-green-500" />
                    Arrangement livraison à convenir
                  </div>
                  <div className="flex items-center text-blue-700 dark:text-blue-300">
                    <FaCheckCircle className="mr-2 text-green-500" />
                    Paiement selon vos préférences
                  </div>
                </div>
              </div>
            </div>

            {/* Description si disponible */}
            {product.description && (
              <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-lg p-8 rounded-3xl border border-white/30 shadow-xl">
                <h3 className="font-black text-xl text-gray-800 dark:text-gray-200 mb-4 flex items-center">
                  📝 Description détaillée
                </h3>
                <div className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line text-lg">
                  {product.description}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Section produits similaires moderne */}
        {similarProducts && similarProducts.length > 0 && (
          <section className="mt-24">
            <div className="text-center mb-12">
              <h2 className="text-4xl lg:text-5xl font-black text-gray-900 dark:text-white mb-4">
                Découvrez aussi
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                D'autres pépites qui pourraient vous intéresser
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {similarProducts.map((p) => (
                <Link
                  key={p.id}
                  href={`/product/${p.id}`}
                  className="group bg-white/70 dark:bg-gray-900/70 backdrop-blur-lg rounded-3xl shadow-xl border border-white/30 overflow-hidden hover:scale-105 hover:shadow-2xl transition-all duration-500"
                >
                  <div className="relative h-64 overflow-hidden">
                    <Image
                      src={p.image_url || "/placeholder.jpg"}
                      alt={p.title}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>

                  <div className="p-6">
                    <h3 className="font-bold text-gray-900 dark:text-gray-100 text-lg line-clamp-2 mb-3 group-hover:text-[#D29587] transition-colors">
                      {p.title}
                    </h3>
                    <p className="text-[#D29587] font-black text-xl">
                      {p.price.toLocaleString()} FCFA
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}