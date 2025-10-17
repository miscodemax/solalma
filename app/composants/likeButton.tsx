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
import ProductContact from "../contact"
import { Eye, Heart } from "lucide-react"
import LikeButton from "@/app/composants/likeButton" // AJOUT : Import du composant LikeButton

type Props = {
  params: {
    id: string
  }
}

// La fonction generateMetadata reste inchangée
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

  // Incrémentation directe de la colonne 'clicks'
  const currentClicks = product.clicks || 0;
  const { error: updateError } = await supabase
    .from('product')
    .update({ clicks: currentClicks + 1 })
    .eq('id', productIdNumber);

  if (updateError) {
    console.error(`Erreur lors de la mise à jour des vues pour le produit ${productIdNumber}:`, updateError);
  }
  
  // Compter le nombre de likes pour ce produit
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

  const whatsappDigits = product.whatsapp_number
    ? product.whatsapp_number.replace(/\D/g, '')
    : null
  const whatsappLink = whatsappDigits ? `https://wa.me/${whatsappDigits}?text=${encodeURIComponent(`Bonjour, je suis intéressé(e) par votre produit "${product.title}". Je voudrais en savoir plus sur le prix de gros.`)}` : null

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#1C2B49]">
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

      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 bg-[#F6C445]/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-32 right-16 w-80 h-80 bg-[#1C2B49]/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        <BackButton />

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
          <div className="space-y-6">
            <ProductImageCarousel
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
              className="w-full"
            >
              Partager ce produit
            </ProductShareButton>
          </div>

          <div className="space-y-8">
            <div>
              {/* AJOUT : Conteneur pour le titre et le bouton Like */}
              <div className="flex justify-between items-start gap-4">
                <h1 className="text-4xl lg:text-5xl font-black text-[#1C2B49] dark:text-white leading-tight mb-4 flex-1">
                  {product.title}
                </h1>
                {/* On ne passe le userId que s'il existe */}
                {user && (
                  <div className="mt-2">
                    <LikeButton productId={productIdNumber} userId={user.id} />
                  </div>
                )}
              </div>
              {/* FIN DE L'AJOUT */}
              
              <div className="flex flex-wrap items-center gap-x-4 gap-y-3 mb-6">
                <span className="inline-flex items-center bg-[#F6C445]/20 text-[#1C2B49] px-4 py-2 rounded-full text-sm font-bold border border-[#F6C445]/40 dark:text-[#F6C445]">
                  📁 {product.category || "Non spécifiée"}
                </span>
                <span className="inline-flex items-center gap-2 bg-gray-100 dark:bg-gray-700/50 px-3 py-1.5 rounded-full text-sm font-medium text-gray-600 dark:text-gray-300">
                  <Eye size={16} className="text-gray-500 dark:text-gray-400" />
                  {currentClicks + 1} vues
                </span>
                <span className="inline-flex items-center gap-2 bg-red-100 dark:bg-red-500/20 px-3 py-1.5 rounded-full text-sm font-medium text-red-600 dark:text-red-400">
                  <Heart size={16} />
                  {likeCount || 0} likes
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

            <div className="relative bg-gradient-to-br from-[#F6C445]/10 via-[#1C2B49]/5 to-[#F6C445]/5 p-8 rounded-3xl border-2 border-[#F6C445]/30 shadow-2xl">
              <div className="absolute -top-3 left-6 bg-[#F6C445] text-[#1C2B49] px-4 py-1 rounded-full text-sm font-bold">
                💰 Prix
              </div>
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

            {product.description && (
              <div className="bg-white dark:bg-[#1C2B49]/70 p-8 rounded-3xl border border-[#E5E7EB] shadow-xl">
                <h3 className="font-black text-xl text-[#1C2B49] dark:text-[#F6C445] mb-4">📝 Description</h3>
                <p className="text-[#1C2B49] dark:text-gray-200">{product.description}</p>
              </div>
            )}
          </div>
        </div>

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