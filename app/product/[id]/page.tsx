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
    <div className="min-h-screen bg-[#FAFAFA] dark:from-[#0A0A0A] dark:via-[#121212] dark:to-[#1A1A1A]">
      {/* Éléments décoratifs avec palette Sangse */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 bg-[#A8D5BA]/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-32 right-16 w-80 h-80 bg-[#FFD6BA]/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/3 w-48 h-48 bg-[#6366F1]/5 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        <BackButton />

        {/* Breadcrumb avec palette Sangse */}
        <nav className="flex items-center space-x-2 text-sm text-[#374151] mb-8">
          <Link href="/" className="hover:text-[#6366F1] transition-colors font-medium">🏠 Accueil</Link>
          <span className="text-[#A8D5BA]">›</span>
          <span className="bg-[#A8D5BA]/20 text-[#6366F1] px-3 py-1 rounded-full font-medium border border-[#A8D5BA]/30">
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

            {/* Zone de partage avec palette Sangse */}
            <div className="bg-white/90 dark:bg-gray-900/70 backdrop-blur-lg p-6 rounded-2xl border border-[#E5E7EB] shadow-xl">
              <h3 className="font-bold text-[#374151] dark:text-gray-200 mb-4 flex items-center text-lg">
                <HiShare className="mr-3 text-[#6366F1] text-xl" />
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

          {/* Section Informations avec palette Sangse */}
          <div className="space-y-8">
            {/* En-tête produit */}
            <div className="space-y-6">
              <div>
                <h1 className="text-4xl lg:text-5xl font-black text-[#374151] dark:text-white leading-tight mb-4">
                  {product.title}
                </h1>

                <div className="flex flex-wrap items-center gap-3 mb-6">
                  <span className="inline-flex items-center bg-[#A8D5BA]/20 text-[#6366F1] px-4 py-2 rounded-full text-sm font-bold border border-[#A8D5BA]/40">
                    📁 {product.category || "Non spécifiée"}
                  </span>

                  {isNew && (
                    <span className="inline-flex items-center bg-[#FFD6BA]/30 text-[#6366F1] px-4 py-2 rounded-full text-sm font-bold border border-[#FFD6BA]/50">
                      ✨ Nouveau
                    </span>
                  )}

                  {product.location && (
                    <span className="inline-flex items-center bg-[#F5E6CC]/40 text-[#374151] px-4 py-2 rounded-full text-sm font-medium border border-[#F5E6CC]/60">
                      <FaMapMarkerAlt className="mr-2" />
                      {product.location}
                    </span>
                  )}

                  <span className="text-sm text-[#374151] bg-[#E5E7EB]/50 px-3 py-1 rounded-full border border-[#E5E7EB]">
                    <FaClock className="inline mr-1" />
                    {dayjs(product.created_at).format('DD/MM/YYYY')}
                  </span>
                </div>
              </div>

              {/* Prix avec accent indigo */}
              <div className="relative bg-gradient-to-br from-[#6366F1]/10 via-[#A8D5BA]/10 to-[#F5E6CC]/10 p-8 rounded-3xl border-2 border-[#6366F1]/20 shadow-2xl">
                <div className="absolute -top-3 left-6 bg-[#6366F1] text-white px-4 py-1 rounded-full text-sm font-bold">
                  💰 Prix
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-5xl lg:text-6xl font-black text-[#6366F1] mb-2">
                      {product.price.toLocaleString()}
                      <span className="text-2xl font-semibold ml-2">FCFA</span>
                    </p>
                    <p className="text-[#A8D5BA] font-medium flex items-center">
                      <FaCheckCircle className="mr-2" />
                      Prix négociable au contact
                    </p>
                  </div>

                  <div className="text-right">
                    <div className="bg-gradient-to-r from-[#FFD6BA] to-[#F5E6CC] text-[#374151] px-6 py-3 rounded-2xl font-bold text-sm shadow-lg border border-[#FFD6BA]/50">
                      🔥 CONTACT
                      <br />
                      DIRECT
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Carte vendeur avec palette Sangse */}
            <div className="bg-gradient-to-r from-white/90 to-[#FAFAFA]/90 dark:from-gray-800/80 dark:to-gray-800/60 backdrop-blur-lg p-8 rounded-3xl border border-[#E5E7EB] shadow-2xl">
              <div className="flex items-center gap-4 mb-6">
                <div className="relative">
                  <Image
                    src={profile?.avatar_url || "/placeholder-avatar.jpg"}
                    alt={profile?.username || "Vendeur"}
                    width={64}
                    height={64}
                    className="rounded-full border-4 border-[#A8D5BA]/40 object-cover shadow-lg"
                  />
                  <div className="absolute -bottom-1 -right-1 bg-[#A8D5BA] w-6 h-6 rounded-full border-2 border-white flex items-center justify-center">
                    <FaCheckCircle className="text-white text-xs" />
                  </div>
                </div>

                <div className="flex-1">
                  <h3 className="font-bold text-xl text-[#374151] dark:text-gray-200">
                    {profile?.username || "Vendeur vérifié"}
                  </h3>

                  {sellerId && (
                    <p className="text-xs text-[#374151]/70 mt-1">
                      ID: {sellerId}
                    </p>
                  )}
                </div>

                {sellerId ? (
                  <Link
                    href={`/profile/${sellerId}`}
                    className="bg-[#6366F1] hover:bg-[#5855d6] text-white px-6 py-3 rounded-xl font-medium text-sm transition-all duration-300 hover:scale-105 shadow-lg flex items-center gap-2"
                  >
                    🏪 Voir boutique
                  </Link>
                ) : (
                  <div className="bg-[#E5E7EB] text-[#374151] px-6 py-3 rounded-xl font-medium text-sm">
                    Boutique indisponible
                  </div>
                )}
              </div>

              {profile?.bio && (
                <div className="mb-6 text-[#374151] dark:text-gray-300 bg-[#F5E6CC]/20 dark:bg-gray-700/50 p-4 rounded-xl border border-[#F5E6CC]/30">
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

              {/* Bouton alternatif avec vert sauge */}
              {sellerId && (
                <div className="mt-4 pt-4 border-t border-[#E5E7EB] dark:border-gray-600">
                  <Link
                    href={`/profile/${sellerId}`}
                    className="w-full bg-[#A8D5BA]/20 hover:bg-[#A8D5BA]/30 text-[#6366F1] px-4 py-3 rounded-xl font-medium text-center transition-all duration-300 hover:scale-105 border-2 border-[#A8D5BA]/30 hover:border-[#A8D5BA]/50 flex items-center justify-center gap-2"
                  >
                    🛍️ Voir tous ses produits
                    <span className="text-xs bg-[#6366F1]/20 px-2 py-1 rounded-full">
                      +{allProducts && (allProducts.length - 1)}
                    </span>
                  </Link>
                </div>
              )}
            </div>

            {/* Boutons de contact avec palette Sangse */}
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="font-black text-2xl text-[#374151] dark:text-gray-200 mb-2">
                  💬 Prêt(e) à discuter ?
                </h3>
                <p className="text-[#374151]/70 dark:text-gray-400">
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
                  <div className="bg-[#E5E7EB] dark:bg-gray-800 text-[#374151] font-bold text-lg px-8 py-6 rounded-2xl text-center">
                    ❌ WhatsApp non disponible
                  </div>
                )}

                {product.whatsapp_number && (
                  <a
                    href={`tel:${product.whatsapp_number}`}
                    className="group bg-gradient-to-r from-[#6366F1] to-[#5855d6] text-white font-bold text-lg px-8 py-6 rounded-2xl transition-all duration-300 hover:scale-105 shadow-xl hover:shadow-2xl"
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

              {/* Assurance avec palette Sangse */}
              <div className="bg-gradient-to-r from-[#A8D5BA]/10 to-[#F5E6CC]/10 dark:from-blue-900/20 dark:to-indigo-900/20 p-6 rounded-2xl border border-[#A8D5BA]/30">
                <h4 className="font-bold text-[#6366F1] dark:text-blue-300 mb-3 text-center">
                  🛡️ Achat en toute confiance
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center text-[#374151] dark:text-blue-300">
                    <FaCheckCircle className="mr-2 text-[#A8D5BA]" />
                    Discussion directe avec le vendeur
                  </div>
                  <div className="flex items-center text-[#374151] dark:text-blue-300">
                    <FaCheckCircle className="mr-2 text-[#A8D5BA]" />
                    Négociation libre du prix
                  </div>
                  <div className="flex items-center text-[#374151] dark:text-blue-300">
                    <FaCheckCircle className="mr-2 text-[#A8D5BA]" />
                    Arrangement livraison à convenir
                  </div>
                  <div className="flex items-center text-[#374151] dark:text-blue-300">
                    <FaCheckCircle className="mr-2 text-[#A8D5BA]" />
                    Paiement selon vos préférences
                  </div>
                </div>
              </div>
            </div>

            {/* Description avec palette Sangse */}
            {product.description && (
              <div className="bg-white/90 dark:bg-gray-900/70 backdrop-blur-lg p-8 rounded-3xl border border-[#E5E7EB] shadow-xl">
                <h3 className="font-black text-xl text-[#374151] dark:text-gray-200 mb-4 flex items-center">
                  📝 Description détaillée
                </h3>
                <div className="text-[#374151] dark:text-gray-300 leading-relaxed whitespace-pre-line text-lg">
                  {product.description}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Section produits similaires avec palette Sangse */}
        {similarProducts && similarProducts.length > 0 && (
          <section className="mt-24">
            <div className="text-center mb-12">
              <h2 className="text-4xl lg:text-5xl font-black text-[#374151] dark:text-white mb-4">
                Découvrez aussi
              </h2>
              <p className="text-xl text-[#374151]/70 dark:text-gray-400 max-w-2xl mx-auto">
                D'autres pépites qui pourraient vous intéresser
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {similarProducts.map((p) => (
                <Link
                  key={p.id}
                  href={`/product/${p.id}`}
                  className="group bg-white/90 dark:bg-gray-900/70 backdrop-blur-lg rounded-3xl shadow-xl border border-[#E5E7EB] overflow-hidden hover:scale-105 hover:shadow-2xl transition-all duration-500 hover:border-[#A8D5BA]/50"
                >
                  <div className="relative h-64 overflow-hidden">
                    <Image
                      src={p.image_url || "/placeholder.jpg"}
                      alt={p.title}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#6366F1]/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>

                  <div className="p-6">
                    <h3 className="font-bold text-[#374151] dark:text-gray-100 text-lg line-clamp-2 mb-3 group-hover:text-[#6366F1] transition-colors">
                      {p.title}
                    </h3>
                    <p className="text-[#6366F1] font-black text-xl">
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