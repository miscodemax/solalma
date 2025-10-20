import ProductLocationMap from "../productLocationMap"
import { cookies } from "next/headers"
import { createServerClient } from "@supabase/ssr"
import { supabaseUrl, supabaseKey } from "../../../lib/supabase"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { FaClock, FaTags } from "react-icons/fa"
import dayjs from "dayjs"
import RatingSeller from "@/app/composants/ratingseller"
import ProductShareButton from "@/app/composants/productShare"
import type { Metadata } from "next"
import BackButton from "@/app/composants/back-button"
import ProductContact from "../contact"
import { Eye, Heart, Store } from "lucide-react"
import LikeButton from "@/app/composants/likeButton"

// 🎨 NOUVEAUX COMPOSANTS UX
import EnhancedProductCarousel from "@/app/composants/EnhancedProductCaroussel"
import GlassCard from "@/app/composants/Glasscard"

type Props = {
  params: {
    id: string
  }
}

// ✅ BACKEND INTACT - Ne touche à rien ici
export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const cookieStore = await cookies()
    const supabase = createServerClient(supabaseUrl, supabaseKey, {
      cookies: {
        get: (name) => cookieStore.get(name)?.value,
      },
    })
    const { data: product } = await supabase
      .from("product")
      .select("*")
      .eq("id", Number(params.id))
      .single()
  
    if (!product) {
      return { title: "Produit non trouvé" }
    }
  
    const imageUrl = product.image_url.startsWith("http")
      ? product.image_url
      : `https://sangse.shop${product.image_url}`
  
    const productTitle = `${product.title} - ${product.price.toLocaleString()} FCFA | SangseShop`
    const productDescription = product.description || `Commandez ${product.title} maintenant sur SangseShop. Prix: ${product.price.toLocaleString()} FCFA. Livraison rapide à Dakar.`
  
    return {
      title: productTitle,
      description: productDescription,
      openGraph: {
        title: productTitle,
        description: productDescription,
        type: "website",
        url: `https://sangse.shop/product/${product.id}`,
        siteName: "SangseShop",
        locale: "fr_FR",
        images: [
          {
            url: imageUrl,
            width: 1200,
            height: 630,
            alt: product.title,
            type: "image/jpeg",
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: productTitle,
        description: productDescription,
        images: [imageUrl],
        creator: "@sangse",
      },
      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          "max-image-preview": "large",
          "max-snippet": -1,
        },
      },
      alternates: {
        canonical: `https://sangse.shop/product/${product.id}`,
      },
      other: {
        "og:image:secure_url": imageUrl,
        "og:image:type": "image/jpeg",
        "og:image:width": "1200",
        "og:image:height": "630",
      },
    }
}

export default async function ProductDetailPage({ params }: Props) {
  // ✅ BACKEND INTACT - Toute la logique Supabase reste identique
  const cookieStore = await cookies()
  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      get: (name) => cookieStore.get(name)?.value,
    },
  })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  let firstName = 'clientSangse'

  if (user) {
    const displayName = user.user_metadata?.full_name || user.user_metadata?.name
    if (displayName) {
      firstName = displayName.split(" ")[0]
    }
  }

  const productIdNumber = Number(params.id)

  const { data: product, error: productError } = await supabase
    .from("product")
    .select("*")
    .eq("id", productIdNumber)
    .single()

  if (productError || !product) notFound()

  const currentClicks = product.clicks || 0;
  const { error: updateError } = await supabase
    .from('product')
    .update({ clicks: currentClicks + 1 })
    .eq('id', productIdNumber);

  if (updateError) {
    console.error(`Erreur lors de la mise à jour des vues pour le produit ${productIdNumber}:`, updateError);
  }
  
  const { count: likeCount, error: likeError } = await supabase
    .from("product_like")
    .select('*', { count: 'exact', head: true })
    .eq('product_id', productIdNumber);

  if (likeError) {
    console.error("Erreur lors du comptage des likes:", likeError);
  }

  const { data: productImages } = await supabase
    .from("product_images")
    .select("image_url")
    .eq("product_id", productIdNumber)

  const { data: allProducts } = await supabase
    .from("product")
    .select("*")
    .eq("user_id", product?.user_id)

  const allImages = [
    product.image_url,
    ...(productImages?.map((img) => img.image_url) || []),
  ].filter(Boolean)

  const isNew =
    product.created_at &&
    dayjs(product.created_at).isAfter(dayjs().subtract(7, "day"))

  const { data: similarProducts } = await supabase
    .from("product")
    .select("id, title, price, image_url")
    .eq("category", product.category)
    .neq("id", product.id)
    .limit(8)

  const { data: allRatings } = await supabase
    .from("ratings_sellers")
    .select("rating")
    .eq("seller_id", Number(params.id))

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

  const hasWholesale = !!product.has_wholesale
  const wholesalePrice = product.wholesale_price ?? null
  const minWholesaleQty = product.min_wholesale_qty ?? null
  const priceNumber = Number(product.price) || 0

  const savingsPerUnit =
    hasWholesale && wholesalePrice ? Math.max(0, priceNumber - Number(wholesalePrice)) : 0
  const savingsPercent =
    hasWholesale && wholesalePrice && priceNumber > 0
      ? Math.round((savingsPerUnit / priceNumber) * 100)
      : 0

  // ✅ FIN BACKEND - Maintenant juste l'UI améliorée

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FAFAFA] via-[#FFF8E7] to-[#F0F4FF] dark:bg-gradient-to-br dark:from-[#1C2B49] dark:via-[#1a2538] dark:to-[#0f1729]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org/",
            "@type": "Product",
            name: product.title,
            image: product.image_url,
            description: product.description,
            offers: {
              "@type": "Offer",
              url: `https://sangse.shop/product/${product.id}`,
              priceCurrency: "XOF",
              price: product.price,
              availability: "https://schema.org/InStock",
            },
          }),
        }}
      />

      {/* Blobs améliorés */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-[#F6C445]/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-32 right-16 w-96 h-96 bg-[#1C2B49]/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-blue-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        <BackButton />

        {/* Breadcrumb amélioré */}
        <nav className="flex items-center space-x-2 text-sm mb-8">
          <Link href="/" className="text-[#1C2B49] dark:text-gray-200 hover:text-[#F6C445] transition-colors font-medium">
            🏠 Accueil
          </Link>
          <span className="text-[#F6C445]">›</span>
          <span className="bg-[#F6C445]/20 text-[#1C2B49] dark:text-[#F6C445] px-4 py-1.5 rounded-full font-medium border border-[#F6C445]/30 shadow-sm">
            {product.category || "Produit"}
          </span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Colonne gauche - Images avec effet 3D */}
          <div className="space-y-6">
            {/* 🎨 NOUVEAU : Carousel amélioré avec effet 3D */}
            <EnhancedProductCarousel
              images={allImages}
              productTitle={product.title}
              isNew={isNew}
            />
            
            <ProductShareButton
              product={{
                id: product.id,
                title: product.title,
                price: product.price,
                description: product.description
              }}
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              Partager ce produit
            </ProductShareButton>
          </div>

          {/* Colonne droite - Infos */}
          <div className="space-y-6">
            {/* Titre et Like */}
            <div className="flex justify-between items-start gap-4">
              <h1 className="text-4xl lg:text-5xl font-black text-[#1C2B49] dark:text-white leading-tight flex-1">
                {product.title}
              </h1>
              {user && (
                <div className="flex-shrink-0">
                  <LikeButton productId={productIdNumber} userId={user.id} />
                </div>
              )}
            </div>

            {/* Badges améliorés */}
            <div className="flex flex-wrap gap-3">
              <span className="inline-flex items-center bg-[#F6C445]/20 text-[#1C2B49] dark:text-[#F6C445] px-4 py-2 rounded-full text-sm font-bold border border-[#F6C445]/40 shadow-sm transition-all hover:scale-105">
                📁 {product.category || "Non spécifiée"}
              </span>
              <span className="inline-flex items-center gap-2 bg-gray-100 dark:bg-gray-700/50 px-4 py-2 rounded-full text-sm font-medium text-gray-600 dark:text-gray-300 shadow-sm transition-all hover:scale-105">
                <Eye size={16} />
                {currentClicks + 1} vues
              </span>
              <span className="inline-flex items-center gap-2 bg-red-100 dark:bg-red-500/20 px-4 py-2 rounded-full text-sm font-medium text-red-600 dark:text-red-400 shadow-sm transition-all hover:scale-105">
                <Heart size={16} />
                {likeCount || 0} likes
              </span>
              {isNew && (
                <span className="inline-flex items-center bg-gradient-to-r from-[#F6C445] to-orange-500 text-[#1C2B49] px-4 py-2 rounded-full text-sm font-bold shadow-md animate-pulse">
                  ✨ Nouveau
                </span>
              )}
              <span className="inline-flex items-center gap-2 text-sm text-[#1C2B49] dark:text-gray-300 bg-gray-100 dark:bg-gray-700/50 px-4 py-2 rounded-full shadow-sm">
                <FaClock />
                {dayjs(product.created_at).format("DD/MM/YYYY")}
              </span>
            </div>

            {/* 🎨 NOUVEAU : Prix avec GlassCard */}
            <GlassCard className="p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-[#F6C445]/20 rounded-full blur-3xl"></div>
              <div className="relative">
                <div className="text-sm font-semibold text-gray-600 dark:text-gray-300 mb-2">Prix unitaire</div>
                <p className="text-5xl lg:text-6xl font-black text-[#1C2B49] dark:text-[#F6C445] mb-4">
                  {Number(product.price).toLocaleString()}{" "}
                  <span className="text-2xl font-semibold">FCFA</span>
                </p>

                {/* Prix de gros */}
                {hasWholesale && wholesalePrice && minWholesaleQty && (
                  <div className="mt-6 p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl border-2 border-green-200 dark:border-green-700/50">
                    <div className="flex items-center gap-2 mb-3">
                      <FaTags className="text-green-600 dark:text-green-400" />
                      <span className="text-sm font-bold text-green-700 dark:text-green-300">Prix de gros disponible</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-3xl font-bold text-[#1C2B49] dark:text-white">
                          {Number(wholesalePrice).toLocaleString()}
                          <span className="text-base ml-1">FCFA</span>
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                          à partir de <span className="font-bold text-green-600 dark:text-green-400">{minWholesaleQty}</span> unités
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-black text-green-600 dark:text-green-400">-{savingsPercent}%</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">économisez</div>
                        <div className="text-sm text-gray-700 dark:text-gray-300 mt-1">{savingsPerUnit.toLocaleString()} FCFA</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </GlassCard>

            {/* 🎨 NOUVEAU : Vendeur avec GlassCard */}
            <GlassCard className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <Image
                  src={profile?.avatar_url || "/placeholder-avatar.jpg"}
                  alt={profile?.username || "Vendeur"}
                  width={64}
                  height={64}
                  className="rounded-full border-4 border-[#F6C445]/40 object-cover shadow-lg"
                />
                <div className="flex-1">
                  <h3 className="font-bold text-xl text-[#1C2B49] dark:text-white">
                    {profile?.username || "Vendeur vérifié"}
                  </h3>
                  {sellerId && (
                    <p className="text-xs text-[#1C2B49]/70 dark:text-gray-400">ID: {sellerId}</p>
                  )}
                </div>
                {sellerId && (
                  <Link
                    href={`/profile/${sellerId}`}
                    className="px-6 py-3 bg-[#1C2B49] hover:bg-[#2a3b60] dark:bg-[#F6C445] dark:hover:bg-[#e5b339] text-white dark:text-[#1C2B49] rounded-xl font-medium shadow-lg transition-all hover:scale-105 flex items-center gap-2"
                  >
                    <Store size={18} />
                    Boutique
                  </Link>
                )}
              </div>
              {profile?.bio && (
                <p className="text-sm text-[#1C2B49]/80 dark:text-gray-200 bg-[#F6C445]/10 p-4 rounded-xl">
                  📝 {profile.bio}
                </p>
              )}
              {sellerId && (
                <div className="mt-4">
                  <RatingSeller sellerId={sellerId} initialAverage={averageRating} initialCount={ratingCount} />
                </div>
              )}
            </GlassCard>

            <ProductContact
              product={{
                id: product.id,
                title: product.title,
                price: product.price,
                whatsapp_number: product.whatsapp_number,
                category: product.category,
                has_wholesale: product.has_Wholesale,
                wholesale_price: product.wholesale_Price,
                min_wholesale_qty: product.min_Wholesale_Qty
              }}
              customerName={firstName}
            />

            {/* Description */}
            {product.description && (
              <GlassCard className="p-6">
                <h3 className="font-black text-xl text-[#1C2B49] dark:text-[#F6C445] mb-4">📝 Description</h3>
                <p className="text-[#1C2B49] dark:text-gray-200 leading-relaxed">{product.description}</p>
              </GlassCard>
            )}
          </div>
        </div>

        {/* Localisation */}
        {product.latitude && product.longitude && (
          <div className="mt-12">
            <h3 className="font-black text-2xl text-[#1C2B49] dark:text-[#F6C445] mb-6">📍 Localisation</h3>
            <GlassCard className="p-6 overflow-hidden">
              <ProductLocationMap
                productTitle={product.title}
                latitude={product.latitude}
                longitude={product.longitude}
                address={product.zone}
              />
            </GlassCard>
          </div>
        )}

        {/* Produits similaires */}
        {similarProducts && similarProducts.length > 0 && (
          <section className="mt-24">
            <h2 className="text-3xl font-black text-[#1C2B49] dark:text-white mb-8">Découvrez aussi</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {similarProducts.map((p) => (
                <Link
                  key={p.id}
                  href={`/product/${p.id}`}
                  className="group"
                >
                  <GlassCard hover className="overflow-hidden h-full">
                    <div className="relative h-64 overflow-hidden">
                      <Image 
                        src={p.image_url || "/placeholder.jpg"} 
                        alt={p.title} 
                        fill 
                        className="object-cover group-hover:scale-110 transition-transform duration-500" 
                      />
                      {/* Overlay au hover */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                    <div className="p-6">
                      <h3 className="font-bold text-[#1C2B49] dark:text-white text-lg line-clamp-2 mb-2 group-hover:text-[#F6C445] transition-colors">
                        {p.title}
                      </h3>
                      <p className="text-[#F6C445] font-black text-xl">
                        {p.price.toLocaleString()} FCFA
                      </p>
                    </div>
                  </GlassCard>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}