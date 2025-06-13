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
import { FaWhatsapp, FaShieldAlt, FaCheckCircle, FaClock, FaEye, FaHeart } from "react-icons/fa"
import type { Metadata } from "next"
import BackButton from "@/app/composants/back-button"
import AuthModal from "@/app/composants/auth-modal"

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
    description: `Achetez ${product.title} pour seulement ${product.price} FCFA !`,
    openGraph: {
      title: product.title,
      description: `Achetez ${product.title} pour seulement ${product.price} FCFA !`,
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
      description: `Achetez ${product.title} pour seulement ${product.price} FCFA !`,
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

  const { data: userData } = await supabase.auth.getUser()

  if (!userData?.user) {
    return (
      <div className="min-h-screen flex items-center justify-center dark:bg-black">
        <AuthModal />
      </div>
    )
  }

  const {
    data: product,
    error: productError,
  } = await supabase
    .from("product")
    .select("*")
    .eq("id", Number(params.id))
    .single()

  if (productError || !product) {
    notFound()
  }

  const isNew =
    product.created_at &&
    dayjs(product.created_at).isAfter(dayjs().subtract(7, "day"))

  const { data: similarProducts } = await supabase
    .from("product")
    .select("id, title, price, image_url")
    .eq("category", product.category)
    .neq("id", product.id)
    .limit(6)

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
  const prefilledMessage = `Bonjour ! Je suis intéressé(e) par votre produit "${product.title}" à ${product.price.toLocaleString()} FCFA dans la catégorie ${product.category}. Est-il toujours disponible ?`
  const whatsappLink = whatsappClean
    ? `https://wa.me/${whatsappClean}?text=${encodeURIComponent(prefilledMessage)}`
    : null

  return (
    <div className="max-w-7xl mx-auto px-4 dark:bg-black py-8">
      <BackButton />

      {/* Header avec breadcrumb amélioré */}
      <div className="mb-8">
        <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-4">
          <Link href="/" className="hover:text-[#D29587] transition-colors">Accueil</Link>
          <span>›</span>
          <span className="text-gray-700 font-medium">{product.title}</span>
        </nav>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        {/* Section Image avec améliorations */}
        <div className="space-y-4">
          <div className="relative w-full h-[600px] rounded-3xl overflow-hidden shadow-2xl border border-gray-200 group">
            <Image
              src={product.image_url || "/placeholder.jpg"}
              alt={product.title}
              fill
              className="object-cover transition-all duration-700 ease-in-out group-hover:scale-105"
              priority
            />

            {/* Badges flottants */}
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              {isNew && (
                <div className="group relative">
                  <span className="inline-flex items-center bg-gradient-to-r from-green-400 to-emerald-500 text-white px-3 py-1.5 rounded-full text-sm font-semibold shadow-lg animate-pulse">
                    ✨ Nouveau
                  </span>
                  {/* Hover Card pour "Nouveau" */}
                  <div className="absolute left-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border p-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-10">
                    <p className="text-sm text-gray-600">
                      <FaClock className="inline mr-1 text-green-500" />
                      Publié il y a moins de 7 jours
                    </p>
                  </div>
                </div>
              )}

              {/* Badge confiance */}
              <div className="group relative">
                <span className="inline-flex items-center bg-blue-500 text-white px-3 py-1.5 rounded-full text-sm font-semibold shadow-lg">
                  <FaShieldAlt className="mr-1" /> Vérifié
                </span>
                {/* Hover Card pour sécurité */}
                <div className="absolute left-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border p-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-10">
                  <div className="space-y-2">
                    <h4 className="font-semibold text-gray-800 flex items-center">
                      <FaShieldAlt className="mr-2 text-blue-500" />
                      Achat Sécurisé
                    </h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li className="flex items-center"><FaCheckCircle className="mr-2 text-green-500 text-xs" />Vendeur vérifié</li>
                      <li className="flex items-center"><FaCheckCircle className="mr-2 text-green-500 text-xs" />Paiement sécurisé</li>
                      <li className="flex items-center"><FaCheckCircle className="mr-2 text-green-500 text-xs" />Support client 24/7</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Bouton favoris */}
            <div className="absolute top-4 right-4">
              <button className="bg-white/90 backdrop-blur-sm p-2.5 rounded-full shadow-lg hover:bg-white hover:scale-110 transition-all duration-300 group">
                <FaHeart className="text-gray-400 group-hover:text-red-500 transition-colors" />
              </button>
            </div>

            {/* Indicateur de vues */}
            <div className="absolute bottom-4 right-4 bg-black/50 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-sm">
              <FaEye className="inline mr-1" /> 127 vues
            </div>
          </div>
        </div>

        {/* Section Informations avec améliorations */}
        <div className="space-y-6">
          {/* En-tête produit */}
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">{product.title}</h1>
            </div>

            <div className="flex items-center gap-3">
              <span className="inline-flex items-center bg-[#D29587]/10 text-[#D29587] px-4 py-2 rounded-full text-sm font-semibold">
                📁 {product.category || "Non spécifiée"}
              </span>
              <span className="text-gray-400">•</span>
              <span className="text-sm text-gray-500">
                Publié {dayjs(product.created_at).format('DD/MM/YYYY')}
              </span>
            </div>

            {/* Prix avec animation */}
            <div className="bg-gradient-to-r from-[#D29587]/5 to-[#D29587]/10 p-6 rounded-2xl border border-[#D29587]/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Prix</p>
                  <p className="text-4xl font-bold text-[#D29587] animate-pulse">
                    {product.price.toLocaleString()} FCFA
                  </p>
                </div>
                <div className="text-right">
                  <div className="group relative">
                    <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                      💰 Prix négociable
                    </div>
                    {/* Hover Card pour prix */}
                    <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border p-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-10">
                      <p className="text-sm text-gray-600">
                        Contactez le vendeur pour discuter du prix !
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Informations vendeur avec hover card */}
          {sellerId && profile && (
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                  <Image
                    src={profile.avatar_url || "/placeholder-avatar.jpg"}
                    alt={profile.username || "Vendeur"}
                    width={48}
                    height={48}
                    className="rounded-full border border-gray-300 object-cover"
                  />
                  {profile.username || "Vendeur"}
                </h3>
                <Link
                  href={`/profile/${sellerId}`}
                  className="text-[#D29587] hover:text-[#bb6b5f] font-medium text-sm transition-colors"
                >
                  Voir profil →
                </Link>
              </div>
              {profile.bio && (
                <div className="mb-4 text-gray-600 text-sm">{profile.bio}</div>
              )}

              <RatingSeller
                sellerId={sellerId}
                initialAverage={averageRating}
                initialCount={ratingCount}
              />

              {/* Hover Card pour infos vendeur */}
              <div className="relative group mt-3">
                <button
                  type="button"
                  className="inline-flex items-center text-xs text-gray-500 hover:underline"
                >
                  <FaCheckCircle className="text-green-600 mr-1" />
                  Voir plus d'infos sur le vendeur
                </button>
                <div className="absolute left-0 top-full mt-2 w-72 bg-white rounded-xl shadow-xl border p-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-20">
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-800">À propos du vendeur</h4>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="bg-gray-50 p-2 rounded-lg">
                        <p className="text-gray-500">Ventes réalisées</p>
                        <p className="font-semibold">24+</p>
                      </div>
                      <div className="bg-gray-50 p-2 rounded-lg">
                        <p className="text-gray-500">Membre depuis</p>
                        <p className="font-semibold">2024</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-green-600">
                      <FaCheckCircle className="text-sm" />
                      <span className="text-sm">Vendeur vérifié</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          {/* Boutons de contact améliorés */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-800">💬 Contacter le vendeur</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {whatsappLink ? (
                <div className="group relative">
                  <a
                    href={whatsappLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center px-6 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                  >
                    <FaWhatsapp className="mr-3 text-lg" />
                    WhatsApp
                  </a>
                  {/* Hover Card pour WhatsApp */}
                  <div className="absolute left-1/2 transform -translate-x-1/2 top-full mt-2 w-64 bg-white rounded-xl shadow-xl border p-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-10">
                    <p className="text-sm text-gray-600">
                      Discussion instantanée avec le vendeur via WhatsApp
                    </p>
                  </div>
                </div>
              ) : (
                <div className="w-full px-6 py-4 bg-gray-100 text-gray-500 font-semibold rounded-xl text-center">
                  WhatsApp indisponible
                </div>
              )}

              {product.whatsapp_number && (
                <div className="group relative">
                  <a
                    href={`tel:${product.whatsapp_number}`}
                    className="w-full inline-flex items-center justify-center px-6 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                  >
                    <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.8 19.8 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.8 19.8 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.13 1.21.38 2.39.75 3.5a2 2 0 01-.45 2.11L9 10.92a16 16 0 006 6l1.59-1.59a2 2 0 012.11-.45c1.11.37 2.29.62 3.5.75a2 2 0 011.72 2z" />
                    </svg>
                    Appeler
                  </a>
                  {/* Hover Card pour appel */}
                  <div className="absolute left-1/2 transform -translate-x-1/2 top-full mt-2 w-64 bg-white rounded-xl shadow-xl border p-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-10">
                    <p className="text-sm text-gray-600">
                      Appel direct au {product.whatsapp_number}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Section partage améliorée */}
          <div className="bg-gray-50 p-6 rounded-2xl">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
              📤 Partager ce produit
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <a
                href={`https://wa.me/?text=${encodeURIComponent(
                  `🔗 Découvre ce ${product.title} à seulement ${product.price} FCFA sur Sangse.shop : https://sangse.shop/product/${product.id}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-3 rounded-xl text-sm flex items-center justify-center gap-2 transition-all duration-300 hover:scale-105"
              >
                <FaWhatsapp className="w-4 h-4" />
                Partager
              </a>
              <CopyButton
                text={`https://sangse.shop/product/${product.id}`}
                platform="Copier le lien"
              />
            </div>
          </div>

          {/* Description */}
          {product.description && (
            <div className="bg-white p-6 rounded-2xl border border-gray-200">
              <h3 className="font-semibold text-gray-800 mb-3">📝 Description</h3>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {product.description}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Section produits similaires améliorée */}
      {similarProducts && similarProducts.length > 0 && (
        <section className="mt-16">
          <div className="text-center mb-10">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Produits similaires</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Découvrez d'autres articles qui pourraient vous intéresser dans la même catégorie
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {similarProducts.map((p) => (
              <Link
                key={p.id}
                href={`/product/${p.id}`}
                className="group bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-xl hover:-translate-y-2 transition-all duration-500"
              >
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={p.image_url || "/placeholder.jpg"}
                    alt={p.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>

                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 line-clamp-2 mb-2 group-hover:text-[#D29587] transition-colors">
                    {p.title}
                  </h3>
                  <p className="text-[#D29587] font-bold text-lg">
                    {p.price.toLocaleString()} FCFA
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}