// app/product/[id]/page.tsx
import { cookies } from "next/headers"
import { createServerClient } from "@supabase/ssr"
import { supabaseUrl, supabaseKey } from "../../../lib/supabase"
import Image from "next/image"
import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import dayjs from "dayjs"
import RatingSeller from "@/app/composants/ratingseller"
import CopyButton from "@/app/composants/sharebutton"
import { FaWhatsapp } from "react-icons/fa"
// app/product/[id]/page.tsx
import type { Metadata } from "next"

// en haut de ton fichier, après les imports
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

  const { data: userData, error: userError } = await supabase.auth.getUser()
  if (userError || !userData.user) {
    redirect("/signin")
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

  const averageRating =
    allRatings && allRatings.length > 0
      ? allRatings.reduce((a, b) => a + b.rating, 0) / allRatings.length
      : null

  const ratingCount = allRatings?.length || 0

  const sellerId = product.user_id // ou product.profiles.id si join automatique


  const whatsappClean = product.whatsapp_number?.replace(/\D/g, "")
  const prefilledMessage = `Bonjour ! Je suis intéressé(e) par votre produit "${product.title}" à ${product.price.toLocaleString()} FCFA dans la catégorie ${product.category}. Est-il toujours disponible ?`
  const whatsappLink = whatsappClean
    ? `https://wa.me/${whatsappClean}?text=${encodeURIComponent(prefilledMessage)}`
    : null

  return (
    <div className="max-w-6xl mx-auto px-4 dark:bg-black py-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
        {/* Image principale */}
        <div className="relative w-full h-[520px] rounded-2xl overflow-hidden shadow border border-[#E6E3DF] group cursor-zoom-in">
          <Image
            src={product.image_url || "/placeholder.jpg"}
            alt={product.title}
            fill
            className="object-cover transition-transform duration-700 ease-in-out group-hover:scale-[1.15]"
            priority
          />

        </div>

        {/* Infos produit */}
        <div className="space-y-5 flex flex-col">
          <h1 className="text-4xl font-extrabold text-[#333]">{product.title}</h1>

          {isNew && (
            <span className="inline-block bg-[#D29587]/20 text-[#D29587] px-4 py-1 rounded-full text-sm font-medium select-none">
              🆕 Nouveauté
            </span>
          )}

          <p className="text-md font-semibold text-[#D29587] uppercase tracking-wide">
            Catégorie : {product.category || "Non spécifiée"}
          </p>

          <p className="text-3xl font-bold text-[#D29587]">
            {product.price.toLocaleString()} FCFA
          </p>

          {/* Boutons de contact */}
          <div className="flex flex-wrap items-center gap-4 mt-6">
            {whatsappLink ? (
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-6 py-3 bg-green-500 text-white font-semibold rounded-xl hover:bg-green-600 transition"
                aria-label="Contacter le vendeur sur WhatsApp"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.52 3.478A11.959 11.959 0 0012 0C5.373 0 0 5.373 0 12a11.94 11.94 0 001.611 6.072L0 24l5.977-1.559A11.958 11.958 0 0012 24c6.627 0 12-5.373 12-12 0-3.207-1.246-6.218-3.48-8.522zm-8.52 17.136a9.637 9.637 0 01-5.176-1.476l-.371-.224-3.548.925.947-3.464-.243-.364a9.675 9.675 0 0115.45-11.846 9.636 9.636 0 01-6.31 15.445zm5.414-7.333c-.298-.149-1.759-.868-2.031-.967-.273-.099-.472-.149-.672.15-.199.298-.768.967-.942 1.164-.173.198-.347.223-.645.075-.298-.149-1.257-.463-2.395-1.479-.885-.788-1.48-1.761-1.654-2.06-.173-.298-.018-.459.13-.607.134-.133.298-.347.447-.52.149-.173.198-.298.298-.497.099-.198.05-.372-.025-.52-.075-.149-.672-1.62-.92-2.213-.242-.58-.487-.5-.672-.51l-.572-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.872.118.571-.085 1.759-.718 2.006-1.412.248-.693.248-1.287.173-1.412-.074-.124-.273-.198-.571-.347z" />
                </svg>
                Contacter sur WhatsApp
              </a>
            ) : (
              <p className="text-red-500 font-semibold select-none">
                Numéro WhatsApp non disponible
              </p>
            )}

            {product.whatsapp_number && (
              <a
                href={`tel:${product.whatsapp_number}`}
                className="inline-flex items-center px-6 py-3 bg-blue-500 text-white font-semibold rounded-xl hover:bg-blue-600 transition"
                aria-label="Appeler le vendeur"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  viewBox="0 0 24 24"
                >
                  <path d="M22 16.92v3a2 2 0 01-2.18 2 19.8 19.8 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.8 19.8 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.13 1.21.38 2.39.75 3.5a2 2 0 01-.45 2.11L9 10.92a16 16 0 006 6l1.59-1.59a2 2 0 012.11-.45c1.11.37 2.29.62 3.5.75a2 2 0 011.72 2z" />
                </svg>
                📞 Appeler le vendeur
              </a>
            )}
          </div>
          {sellerId && (
            <>
              <RatingSeller
                sellerId={sellerId}
                initialAverage={averageRating}
                initialCount={ratingCount}
              />

              <Link
                href={`/profile/${sellerId}`}
                className="inline-flex items-center px-6 py-3 bg-[#D29587] text-white font-semibold rounded-xl hover:bg-[#bb6b5f] transition"
                aria-label="Voir le profil du vendeur"
              >
                🛍️ Voir le profil du vendeur
              </Link>
            </>
          )}

          <div className="mt-6">
            <h2 className="text-sm font-semibold text-gray-600 mb-2">📤 Partager ce produit !</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-md">
              {/* WhatsApp */}
              <a
                href={`https://wa.me/?text=${encodeURIComponent(
                  `🔗 Découvre ce ${product.title} à seulement ${product.price} sur Sangse.shop : https://sangse.shop/product/${product.id}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-xl text-sm flex items-center justify-center gap-2 transition"
              >
                <FaWhatsapp className="w-4 h-4" />
                Partager
              </a>

              {/* Instagram */}
              <CopyButton
                text={`https://sangse.shop/product/${product.id}`}
                platform="Tiktok/Instagram"
              />


            </div>
          </div>
          {/* Description */}
          {product.description && (
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
              {product.description}
            </p>
          )}
          {/* Produits similaires */}
          {similarProducts && similarProducts.length > 0 && (
            <section className="mt-10">
              <h2 className="text-4xl text-center font-extrabold text-[#333] mb-4">Produits similaires</h2>
              <div className="flex justify-center space-x-6 overflow-x-auto scrollbar-thin scrollbar-thumb-[#D29587]/70 scrollbar-track-transparent py-2">
                {similarProducts.map((p) => (
                  <Link
                    key={p.id}
                    href={`/product/${p.id}`}
                    className="group min-w-[220px] bg-white border border-[#E6E3DF] rounded-2xl shadow transition-all duration-300 hover:shadow-xl hover:-translate-y-1 p-4 flex flex-col"
                    aria-label={`Voir le produit ${p.title}`}
                  >
                    {/* Image avec zoom fluide */}
                    <div className="relative w-full h-40 rounded-xl overflow-hidden dark:bg-black mb-3">
                      <Image
                        src={p.image_url || "/placeholder.jpg"}
                        alt={p.title}
                        fill
                        className="object-cover transition-transform duration-700 ease-in-out group-hover:scale-110"
                      />
                    </div>

                    {/* Titre avec effet de ligne limitée */}
                    <h3 className="font-semibold text-[#333] line-clamp-2 mb-1">{p.title}</h3>

                    {/* Prix bien mis en avant */}
                    <p className="text-[#D29587] font-bold text-lg mt-auto">{p.price.toLocaleString()} FCFA</p>
                  </Link>

                ))}
              </div>
            </section>
          )}
        </div>

      </div>


    </div>
  )
}
