

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
import ProductImageCarousel from "@/app/composants/ProductImageCarousel"
import ProductContact from "../contact" // Le nouveau composant

type Props = {
  params: {
    id: string
  }
}

// Fonction pour générer les métadonnées dynamiques
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

  return {
    title: product.title,
    description: product.description,
    openGraph: {
      title: product.title,
      description: product.description,
      type: "website",
      url: `https://sangse.shop/product/${product.id}`,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
        },
      ],
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

  // Récupérer l'utilisateur connecté
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Initialiser firstName avec une valeur par défaut
  let firstName = 'clientSangse'

  if (user) {
    // Le "Display Name" de Google (ex: "Mamadou Ndiaye")
    const displayName = user.user_metadata?.full_name || user.user_metadata?.name
    
    if (displayName) {
      // On prend seulement le premier mot = prénom
      firstName = displayName.split(" ")[0]
    }
  }

  const { data: product, error: productError } = await supabase
    .from("product")
    .select("*")
    .eq("id", Number(params.id))
    .single()

  if (productError || !product) notFound()

  const { data: productImages } = await supabase
    .from("product_images")
    .select("image_url")
    .eq("product_id", Number(params.id))

  const { data: allProducts } = await supabase
    .from("product")
    .select("*")
    .eq("user_id", product?.user_id)

  console.log(allProducts?.length || 0)

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

  // Helpers for wholesale display
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

  // Normalize WhatsApp for direct CTA (remove non-digits)
  const whatsappDigits = product.whatsapp_number
    ? product.whatsapp_number.replace(/\D/g, '')
    : null
  const whatsappLink = whatsappDigits ? `https://wa.me/${whatsappDigits}?text=${encodeURIComponent(`Bonjour, je suis intéressé(e) par votre produit "${product.title}". Je voudrais en savoir plus sur le prix de gros.`)}` : null

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#1C2B49]">
      {/* Structured Data pour Google */}
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

      {/* décorations */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 bg-[#F6C445]/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-32 right-16 w-80 h-80 bg-[#1C2B49]/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        <BackButton />

        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-[#1C2B49] mb-8 dark:text-gray-200">
          <Link href="/" className="hover:text-[#F6C445] transition-colors font-medium">
            🏠 Accueil
          </Link>
          <span className="text-[#F6C445]">›</span>
          <span className="bg-[#F6C445]/20 text-[#1C2B49] px-3 py-1 rounded-full font-medium border border-[#F6C445]/30 dark:text-[#F6C445]">
            {product.category || "Produit"}
          </span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          {/* Images */}
          <div className="space-y-6">
            <ProductImageCarousel
              images={allImages}
              productTitle={product.title}
              isNew={isNew}
            />

            {/* partage */}
            <ProductShareButton
              product={{
                id: product.id,
                title: product.title,
                price: product.price,
                description: product.description
              }}
              className="w-full"
            >
              Partager ce produit
            </ProductShareButton>
          </div>

          {/* Infos produit */}
          <div className="space-y-8">
            <div>
              <h1 className="text-4xl lg:text-5xl font-black text-[#1C2B49] dark:text-white leading-tight mb-4">
                {product.title}
              </h1>

              <div className="flex flex-wrap items-center gap-3 mb-6">
                <span className="inline-flex items-center bg-[#F6C445]/20 text-[#1C2B49] px-4 py-2 rounded-full text-sm font-bold border border-[#F6C445]/40 dark:text-[#F6C445]">
                  📁 {product.category || "Non spécifiée"}
                </span>
                {isNew && (
                  <span className="inline-flex items-center bg-[#1C2B49]/20 text-[#F6C445] px-4 py-2 rounded-full text-sm font-bold border border-[#1C2B49]/40">
                    ✨ Nouveau
                  </span>
                )}

                <span className="text-sm text-[#1C2B49] bg-[#E5E7EB]/50 px-3 py-1 rounded-full border border-[#E5E7EB]">
                  <FaClock className="inline mr-1" />
                  {dayjs(product.created_at).format("DD/MM/YYYY")}
                </span>
              </div>
            </div>

            {/* Prix */}
            <div className="relative bg-gradient-to-br from-[#F6C445]/10 via-[#1C2B49]/5 to-[#F6C445]/5 p-8 rounded-3xl border-2 border-[#F6C445]/30 shadow-2xl">
              <div className="absolute -top-3 left-6 bg-[#F6C445] text-[#1C2B49] px-4 py-1 rounded-full text-sm font-bold">
                💰 Prix
              </div>

              {/* Top-right badge when wholesale available */}
              {hasWholesale && wholesalePrice && minWholesaleQty && (
                <div className="absolute top-4 right-4 inline-flex items-center gap-2 bg-white/90 dark:bg-[#17304f] border border-[#F6C445]/20 px-3 py-2 rounded-full shadow-md">
                  <FaTags className="text-[#F6C445]" />
                  <div className="text-sm font-semibold text-[#1C2B49] dark:text-white">Prix de gros</div>
                </div>
              )}

              <p className="text-5xl lg:text-6xl font-black text-[#1C2B49] dark:text-[#F6C445] mb-2">
                {Number(product.price).toLocaleString()}{" "}
                <span className="text-2xl font-semibold">FCFA</span>
              </p>

              {/* Wholesale promotional card - compact, promotional, and harmonized */}
              {hasWholesale && wholesalePrice && minWholesaleQty ? (
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                  <div className="sm:col-span-2 p-4 rounded-xl bg-white/90 dark:bg-[#12223a] border border-[#E8E6E1]/40">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm text-gray-600 dark:text-gray-300">Prix de gros</div>
                        <div className="text-2xl font-bold text-[#1C2B49] dark:text-white">
                          {Number(wholesalePrice).toLocaleString()} <span className="text-base font-medium">FCFA</span>
                        </div>
                        <div className="text-sm text-gray-500 mt-1">à partir de <span className="font-semibold">{minWholesaleQty}</span> unités</div>
                      </div>

                      <div className="text-right">
                        <div className="text-sm text-green-600 font-bold">{savingsPercent}%</div>
                        <div className="text-xs text-gray-500">économisez</div>
                        <div className="text-sm text-gray-700 mt-1">{savingsPerUnit.toLocaleString()} FCFA / unité</div>
                      </div>
                    </div>

                    <div className="mt-3 text-xs text-gray-500">
                      Offre idéale pour revendeurs et achats en quantité. Contactez le vendeur pour finaliser la commande en gros.
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mt-4 text-sm text-gray-600 dark:text-gray-300">
                  Aucun prix de gros proposé — vous pouvez toutefois contacter le vendeur pour une offre personnalisée.
                </div>
              )}
            </div>

            {/* Vendeur */}
            <div className="bg-white dark:bg-[#1C2B49]/70 p-8 rounded-3xl border border-[#E5E7EB] shadow-2xl">
              <div className="flex items-center gap-4 mb-6">
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
                    <p className="text-xs text-[#1C2B49]/70 dark:text-gray-300">ID: {sellerId}</p>
                  )}
                </div>
                {sellerId ? (
                  <Link
                    href={`/profile/${sellerId}`}
                    className="bg-[#1C2B49] hover:bg-[#2a3b60] text-white px-6 py-3 rounded-xl font-medium shadow-lg transition"
                  >
                    🏪 Voir boutique
                  </Link>
                ) : (
                  <div className="bg-[#E5E7EB] text-[#1C2B49] px-6 py-3 rounded-xl">Boutique indisponible</div>
                )}
              </div>
              {profile?.bio && (
                <p className="text-sm text-[#1C2B49]/80 dark:text-gray-200 bg-[#F6C445]/10 p-3 rounded-xl">
                  📝 {profile.bio}
                </p>
              )}
              {sellerId && (
                <RatingSeller sellerId={sellerId} initialAverage={averageRating} initialCount={ratingCount} />
              )}
            </div>

            {/* Composant de contact avec géolocalisation */}
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
              <div className="bg-white dark:bg-[#1C2B49]/70 p-8 rounded-3xl border border-[#E5E7EB] shadow-xl">
                <h3 className="font-black text-xl text-[#1C2B49] dark:text-[#F6C445] mb-4">📝 Description</h3>
                <p className="text-[#1C2B49] dark:text-gray-200">{product.description}</p>
              </div>
            )}
          </div>
        </div>

        {/* Localisation */}
        {product.latitude && product.longitude && (
          <div className="mt-8">
            <h3 className="font-black text-xl text-[#1C2B49] dark:text-[#F6C445] mb-4">📍 Localisation</h3>
            <ProductLocationMap
              productTitle={product.title}
              latitude={product.latitude}
              longitude={product.longitude}
              address={product.zone}
            />
          </div>
        )}

        {/* Produits similaires */}
        {similarProducts && similarProducts.length > 0 && (
          <section className="mt-24">
            <h2 className="text-3xl font-black text-[#1C2B49] dark:text-white mb-6">Découvrez aussi</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {similarProducts.map((p) => (
                <Link
                  key={p.id}
                  href={`/product/${p.id}`}
                  className="bg-white dark:bg-[#1C2B49]/70 rounded-3xl shadow-xl border border-[#E5E7EB] hover:scale-105 transition overflow-hidden"
                >
                  <div className="relative h-64">
                    <Image src={p.image_url || "/placeholder.jpg"} alt={p.title} fill className="object-cover" />
                  </div>
                  <div className="p-6">
                    <h3 className="font-bold text-[#1C2B49] dark:text-white text-lg line-clamp-2">{p.title}</h3>
                    <p className="text-[#F6C445] font-black text-xl">{p.price.toLocaleString()} FCFA</p>
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