import ProductLocationMap from "../productLocationMap";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { supabaseUrl, supabaseKey } from "../../../lib/supabase";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FaClock, FaTags, FaFire, FaBolt } from "react-icons/fa";
import dayjs from "dayjs";
import RatingSeller from "@/app/composants/ratingseller";
import ProductShareButton from "@/app/composants/productShare";
import type { Metadata } from "next";
import BackButton from "@/app/composants/back-button";
import ProductContact from "../contact";
import {
  Eye,
  Heart,
  Store,
  Package,
  TrendingDown,
  Users,
  Clock,
} from "lucide-react";
import LikeButton from "@/app/composants/likeButton";
import EnhancedProductCarousel from "@/app/composants/EnhancedProductCaroussel";
import GlassCard from "@/app/composants/Glasscard";
import PromoCountdown from "@/app/composants/PromoCountdown";

type Props = { params: { id: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const cookieStore = await cookies();
  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: { get: (name) => cookieStore.get(name)?.value },
  });
  const { data: product } = await supabase
    .from("product")
    .select("*")
    .eq("id", Number(params.id))
    .single();
  if (!product) return { title: "Produit non trouvé" };
  const imageUrl = product.image_url.startsWith("http")
    ? product.image_url
    : `https://sangse.shop${product.image_url}`;
  const productTitle = `${product.title} - ${product.price.toLocaleString()} FCFA | SangseShop`;
  const productDescription =
    product.description ||
    `Commandez ${product.title} maintenant sur SangseShop. Prix: ${product.price.toLocaleString()} FCFA.`;
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
    alternates: { canonical: `https://sangse.shop/product/${product.id}` },
    other: {
      "og:image:secure_url": imageUrl,
      "og:image:type": "image/jpeg",
      "og:image:width": "1200",
      "og:image:height": "630",
    },
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const cookieStore = await cookies();
  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: { get: (name) => cookieStore.get(name)?.value },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();
  let firstName = "clientSangse";
  if (user) {
    const displayName =
      user.user_metadata?.full_name || user.user_metadata?.name;
    if (displayName) firstName = displayName.split(" ")[0];
  }

  const productIdNumber = Number(params.id);
  const { data: product, error: productError } = await supabase
    .from("product")
    .select("*")
    .eq("id", productIdNumber)
    .single();
  if (productError || !product) notFound();

  const currentClicks = product.clicks || 0;
  await supabase
    .from("product")
    .update({ clicks: currentClicks + 1 })
    .eq("id", productIdNumber);

  const { count: likeCount } = await supabase
    .from("product_like")
    .select("*", { count: "exact", head: true })
    .eq("product_id", productIdNumber);
  const { data: productImages } = await supabase
    .from("product_images")
    .select("image_url")
    .eq("product_id", productIdNumber);
  const allImages = [
    product.image_url,
    ...(productImages?.map((img) => img.image_url) || []),
  ].filter(Boolean);
  const isNew =
    product.created_at &&
    dayjs(product.created_at).isAfter(dayjs().subtract(7, "day"));
  const { data: similarProducts } = await supabase
    .from("product")
    .select(
      "id, title, price, image_url, has_promo, promo_price, promo_percentage",
    )
    .eq("category", product.category)
    .neq("id", product.id)
    .limit(8);
  const { data: allRatings } = await supabase
    .from("seller_ratings")
    .select("rating")
    .eq("seller_id", product.user_id);
  const { data: profile } = await supabase
    .from("profiles")
    .select("username, avatar_url, bio")
    .eq("id", product.user_id)
    .single();

  const averageRating =
    allRatings && allRatings.length > 0
      ? allRatings.reduce((a, b) => a + b.rating, 0) / allRatings.length
      : null;
  const ratingCount = allRatings?.length || 0;
  const sellerId = product.user_id;

  // ── Promo ───────────────────────────────────────────────────────────────────
  const hasPromo = !!product.has_promo && !!product.promo_price;
  const promoPrice = hasPromo ? Number(product.promo_price) : null;
  const originalPrice = Number(product.price);
  const promoPercent =
    hasPromo && promoPrice
      ? Math.round(((originalPrice - promoPrice) / originalPrice) * 100)
      : 0;
  const promoSavings = hasPromo && promoPrice ? originalPrice - promoPrice : 0;
  const promoExpiration = product.promo_expiration
    ? new Date(product.promo_expiration)
    : null;
  const promoActive =
    hasPromo && (!promoExpiration || promoExpiration > new Date());
  const displayPrice = promoActive && promoPrice ? promoPrice : originalPrice;

  // ── Gros ────────────────────────────────────────────────────────────────────
  const hasWholesale = !!product.has_wholesale;
  const wholesalePrice = hasWholesale
    ? (product.wholesale_price ?? null)
    : null;
  const minWholesaleQty = hasWholesale
    ? (product.min_wholesale_qty ?? null)
    : null;
  const wholesaleSavings = wholesalePrice
    ? Math.max(0, originalPrice - Number(wholesalePrice))
    : 0;
  const wholesalePercent =
    wholesalePrice && originalPrice > 0
      ? Math.round((wholesaleSavings / originalPrice) * 100)
      : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FAFAFA] via-[#FFF8E7] to-[#F0F4FF] dark:from-[#1C2B49] dark:via-[#1a2538] dark:to-[#0f1729]">
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
              price: displayPrice,
              availability: "https://schema.org/InStock",
            },
          }),
        }}
      />

      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-[#F6C445]/20 rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute bottom-32 right-16 w-96 h-96 bg-[#1C2B49]/15 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        />
        {promoActive && (
          <div
            className="absolute top-1/3 right-1/4 w-72 h-72 bg-red-400/10 rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: "0.5s" }}
          />
        )}
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        <BackButton />

        <nav className="flex items-center space-x-2 text-sm mb-8">
          <Link
            href="/"
            className="text-[#1C2B49] dark:text-gray-200 hover:text-[#F6C445] transition-colors font-medium"
          >
            🏠 Accueil
          </Link>
          <span className="text-[#F6C445]">›</span>
          <span className="bg-[#F6C445]/20 text-[#1C2B49] dark:text-[#F6C445] px-4 py-1.5 rounded-full font-medium border border-[#F6C445]/30 shadow-sm">
            {product.category || "Produit"}
          </span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* ── COLONNE GAUCHE ── */}
          <div className="space-y-6">
            <div className="relative">
              <EnhancedProductCarousel
                images={allImages}
                productTitle={product.title}
                isNew={isNew}
              />
              {/* Badge promo flottant sur l'image */}
              {promoActive && (
                <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
                  <div className="flex items-center gap-1.5 bg-red-500 text-white px-3 py-1.5 rounded-xl font-black text-sm shadow-lg shadow-red-500/40 animate-pulse">
                    <FaFire className="text-orange-300" />-{promoPercent}%
                  </div>
                  <div className="bg-white/90 dark:bg-black/70 backdrop-blur-sm text-red-600 dark:text-red-400 px-3 py-1 rounded-xl text-xs font-bold shadow">
                    Économie {promoSavings.toLocaleString()} FCFA
                  </div>
                </div>
              )}
            </div>
            <ProductShareButton
              product={{
                id: product.id,
                title: product.title,
                price: displayPrice,
                description: product.description,
              }}
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              Partager ce produit
            </ProductShareButton>
          </div>

          {/* ── COLONNE DROITE ── */}
          <div className="space-y-5">
            {/* Titre + Like */}
            <div className="flex justify-between items-start gap-4">
              <h1 className="text-3xl lg:text-4xl font-black text-[#1C2B49] dark:text-white leading-tight flex-1">
                {product.title}
              </h1>
              {user && (
                <div className="flex-shrink-0">
                  <LikeButton productId={productIdNumber} userId={user.id} />
                </div>
              )}
            </div>

            {/* Badges stats */}
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center bg-[#F6C445]/20 text-[#1C2B49] dark:text-[#F6C445] px-3 py-1.5 rounded-full text-xs font-bold border border-[#F6C445]/40">
                📁 {product.category || "—"}
              </span>
              <span className="inline-flex items-center gap-1.5 bg-gray-100 dark:bg-gray-700/50 px-3 py-1.5 rounded-full text-xs font-medium text-gray-600 dark:text-gray-300">
                <Eye size={13} />
                {currentClicks + 1} vues
              </span>
              <span className="inline-flex items-center gap-1.5 bg-red-100 dark:bg-red-500/20 px-3 py-1.5 rounded-full text-xs font-medium text-red-600 dark:text-red-400">
                <Heart size={13} />
                {likeCount || 0} likes
              </span>
              {isNew && (
                <span className="inline-flex items-center bg-gradient-to-r from-[#F6C445] to-orange-500 text-[#1C2B49] px-3 py-1.5 rounded-full text-xs font-bold shadow-md animate-pulse">
                  ✨ Nouveau
                </span>
              )}
              <span className="inline-flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700/50 px-3 py-1.5 rounded-full">
                <FaClock size={11} />
                {dayjs(product.created_at).format("DD/MM/YYYY")}
              </span>
            </div>

            {/* ── BLOC PRIX PROMO ── */}
            {promoActive && promoPrice ? (
              <div className="relative overflow-hidden rounded-3xl border-2 border-red-400 dark:border-red-500 shadow-xl shadow-red-500/20">
                {/* Bande animée */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-orange-400 to-red-500 bg-[length:200%_100%] animate-shimmer" />

                <div className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/40 dark:to-orange-950/30 p-6">
                  {/* Header promo */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-black shadow">
                      <FaFire className="text-orange-300" /> OFFRE LIMITÉE
                    </div>
                    {promoExpiration && (
                      <PromoCountdown
                        expiresAt={promoExpiration.toISOString()}
                      />
                    )}
                  </div>

                  {/* Prix barré + nouveau prix */}
                  <div className="flex items-end gap-4 mb-3">
                    <div>
                      <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                        Prix promo
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-4xl sm:text-5xl font-black text-red-600 dark:text-red-400 leading-none">
                          {promoPrice.toLocaleString()}
                        </span>
                        <span className="text-base font-semibold text-red-600/70 dark:text-red-400/70">
                          FCFA
                        </span>
                      </div>
                    </div>
                    <div className="pb-1">
                      <span className="text-xl font-bold text-gray-400 dark:text-gray-500 line-through">
                        {originalPrice.toLocaleString()} FCFA
                      </span>
                    </div>
                  </div>

                  {/* Gains visuels */}
                  <div className="flex flex-wrap gap-2">
                    <div className="flex items-center gap-1.5 bg-red-500 text-white px-3 py-1.5 rounded-xl text-sm font-bold shadow">
                      <TrendingDown size={14} />-{promoPercent}% de réduction
                    </div>
                    <div className="flex items-center gap-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800 px-3 py-1.5 rounded-xl text-sm font-bold">
                      💰 Tu économises {promoSavings.toLocaleString()} FCFA
                    </div>
                  </div>

                  {/* Barre d'urgence */}
                  <div className="mt-4 flex items-center gap-2 text-xs text-red-600 dark:text-red-400 font-semibold">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-ping" />
                    Ne laisse pas passer cette offre — prix susceptible de
                    changer
                  </div>
                </div>
              </div>
            ) : (
              /* ── BLOC PRIX NORMAL ── */
              <GlassCard className="p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#F6C445]/20 rounded-full blur-2xl" />
                <div className="relative">
                  <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">
                    Prix unitaire
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl sm:text-5xl font-black text-[#1C2B49] dark:text-[#F6C445]">
                      {originalPrice.toLocaleString()}
                    </span>
                    <span className="text-lg font-semibold text-gray-500">
                      FCFA
                    </span>
                  </div>
                </div>
              </GlassCard>
            )}

            {/* ── BLOC PRIX GROS ── */}
            {hasWholesale && wholesalePrice && minWholesaleQty && (
              <div className="relative overflow-hidden rounded-3xl border-2 border-blue-300 dark:border-blue-700 shadow-lg shadow-blue-500/10">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/30 p-5">
                  {/* Header */}
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex items-center gap-1.5 bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-black shadow">
                      <Package size={12} /> PRIX GROSSISTE
                    </div>
                    <span className="text-xs text-blue-600 dark:text-blue-400 font-semibold">
                      dès {minWholesaleQty} unités
                    </span>
                  </div>

                  {/* Prix gros vs unitaire */}
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <div className="text-xs text-blue-600/70 dark:text-blue-400/70 font-medium mb-1">
                        Prix par unité (gros)
                      </div>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-3xl font-black text-blue-700 dark:text-blue-300">
                          {Number(wholesalePrice).toLocaleString()}
                        </span>
                        <span className="text-sm font-semibold text-blue-600/70 dark:text-blue-400/70">
                          FCFA
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-through">
                        Prix unitaire : {originalPrice.toLocaleString()} FCFA
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <div className="bg-blue-600 text-white px-3 py-1.5 rounded-xl text-sm font-black shadow">
                        -{wholesalePercent}%
                      </div>
                      <div className="text-xs text-green-600 dark:text-green-400 font-semibold bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded-lg border border-green-200 dark:border-green-800">
                        {wholesaleSavings.toLocaleString()} FCFA/u
                      </div>
                    </div>
                  </div>

                  {/* Simulateur d'économie */}
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    {[minWholesaleQty, minWholesaleQty * 2].map((qty) => (
                      <div
                        key={qty}
                        className="bg-white/60 dark:bg-white/5 border border-blue-200 dark:border-blue-800 rounded-xl p-3 text-center"
                      >
                        <div className="text-xs text-blue-600 dark:text-blue-400 font-semibold mb-0.5">
                          {qty} unités
                        </div>
                        <div className="text-base font-black text-[#1C2B49] dark:text-white">
                          {(Number(wholesalePrice) * qty).toLocaleString()} FCFA
                        </div>
                        <div className="text-[10px] text-green-600 dark:text-green-400 font-semibold">
                          Économie {(wholesaleSavings * qty).toLocaleString()}{" "}
                          FCFA
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-3 flex items-center gap-1.5 text-xs text-blue-600/80 dark:text-blue-400/80">
                    <Users size={12} />
                    Idéal pour les revendeurs et achats groupés
                  </div>
                </div>
              </div>
            )}

            {/* ── VENDEUR ── */}
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
                    <p className="text-xs text-[#1C2B49]/70 dark:text-gray-400">
                      ID: {sellerId.slice(0, 8)}…
                    </p>
                  )}
                </div>
                {sellerId && (
                  <Link
                    href={`/profile/${sellerId}`}
                    className="px-5 py-2.5 bg-[#1C2B49] hover:bg-[#2a3b60] dark:bg-[#F6C445] dark:hover:bg-[#e5b339] text-white dark:text-[#1C2B49] rounded-xl font-medium shadow-lg transition-all hover:scale-105 flex items-center gap-2 text-sm"
                  >
                    <Store size={16} /> Boutique
                  </Link>
                )}
              </div>
              {profile?.bio && (
                <p className="text-sm text-[#1C2B49]/80 dark:text-gray-200 bg-[#F6C445]/10 p-4 rounded-xl mb-4">
                  📝 {profile.bio}
                </p>
              )}
              {sellerId && (
                <RatingSeller
                  sellerId={sellerId}
                  initialAverage={averageRating}
                  initialCount={ratingCount}
                />
              )}
            </GlassCard>

            <ProductContact
              product={{
                id: product.id,
                title: product.title,
                price: displayPrice,
                whatsapp_number: product.whatsapp_number,
                category: product.category,
                has_wholesale: product.has_wholesale,
                wholesale_price: product.wholesale_price,
                min_wholesale_qty: product.min_wholesale_qty,
              }}
              customerName={firstName}
            />

            {product.description && (
              <GlassCard className="p-6">
                <h3 className="font-black text-xl text-[#1C2B49] dark:text-[#F6C445] mb-4">
                  📝 Description
                </h3>
                <p className="text-[#1C2B49] dark:text-gray-200 leading-relaxed">
                  {product.description}
                </p>
              </GlassCard>
            )}
          </div>
        </div>

        {/* Localisation */}
        {product.latitude && product.longitude && (
          <div className="mt-12">
            <h3 className="font-black text-2xl text-[#1C2B49] dark:text-[#F6C445] mb-6">
              📍 Localisation
            </h3>
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
            <h2 className="text-3xl font-black text-[#1C2B49] dark:text-white mb-8">
              Découvrez aussi
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {similarProducts.map((p) => {
                const pHasPromo = !!p.has_promo && !!p.promo_price;
                const pPromoPercent = pHasPromo
                  ? Math.round(
                      ((p.price - Number(p.promo_price)) / p.price) * 100,
                    )
                  : 0;
                return (
                  <Link key={p.id} href={`/product/${p.id}`} className="group">
                    <GlassCard
                      hover
                      className="overflow-hidden h-full relative"
                    >
                      {pHasPromo && (
                        <div className="absolute top-2 left-2 z-10 bg-red-500 text-white text-xs font-black px-2 py-1 rounded-lg shadow-lg">
                          -{pPromoPercent}%
                        </div>
                      )}
                      <div className="relative h-52 overflow-hidden">
                        <Image
                          src={p.image_url || "/placeholder.jpg"}
                          alt={p.title}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </div>
                      <div className="p-4">
                        <h3 className="font-bold text-[#1C2B49] dark:text-white text-sm line-clamp-2 mb-2 group-hover:text-[#F6C445] transition-colors">
                          {p.title}
                        </h3>
                        {pHasPromo ? (
                          <div>
                            <span className="text-red-500 font-black text-base">
                              {Number(p.promo_price).toLocaleString()} FCFA
                            </span>
                            <span className="text-gray-400 text-xs line-through ml-2">
                              {p.price.toLocaleString()}
                            </span>
                          </div>
                        ) : (
                          <p className="text-[#F6C445] font-black text-base">
                            {p.price.toLocaleString()} FCFA
                          </p>
                        )}
                      </div>
                    </GlassCard>
                  </Link>
                );
              })}
            </div>
          </section>
        )}
      </div>

      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% center; }
          100% { background-position: -200% center; }
        }
        .animate-shimmer { animation: shimmer 2s linear infinite; }
      `}</style>
    </div>
  );
}
