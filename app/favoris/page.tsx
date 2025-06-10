import ProductCard from "../composants/product-card"
import { cookies } from "next/headers"
import { createServerClient } from "@supabase/ssr"
import { supabaseUrl, supabaseKey } from "@/lib/supabase"
import AuthModal from "@/app/composants/auth-modal"
import Link from "next/link"

export default async function FavoritesPage() {
  const cookieStore = await cookies()
  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      get: (name) => cookieStore.get(name)?.value,
    },
  })

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (!user || error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black">
        <AuthModal />
      </div>
    )
  }

  // Récupère les likes
  const { data: likes } = await supabase
    .from("product_like")
    .select("*")
    .eq("user_id", user.id)

  const productIds = likes?.map((like) => like.product_id)

  // Récupère les produits likés
  let products = []
  if (productIds && productIds.length > 0) {
    const { data } = await supabase
      .from("product")
      .select("*")
      .in("id", productIds)
    products = data || []
  }

  const id = user?.id || null

  return (
    <main className="min-h-screen bg-[#fefefe] dark:bg-[#0d0d0d] px-4 py-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <section className="flex justify-between items-center">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#111] dark:text-white">
            💖 Tes coups de cœur
          </h1>
          <Link
            href="/vendre"
            className="inline-flex items-center gap-2 bg-pink-600 hover:bg-pink-700 text-white font-semibold text-sm sm:text-base px-5 py-2 rounded-full shadow transition-all"
          >
            🚀 Vends tes articles
          </Link>
        </section>

        {products.length === 0 ? (
          <div className="text-center mt-24 text-gray-600 dark:text-gray-300 space-y-3">
            <p className="text-2xl font-semibold">Tu n’as pas encore de favoris</p>
            <p className="text-sm">Explore la boutique et ajoute des articles à ton 💖</p>

            <Link
              href="/"
              className="mt-6 inline-block bg-black text-white px-6 py-2 rounded-full text-sm hover:bg-gray-800 transition"
            >
              🛍️ Parcourir les articles
            </Link>

            <div className="mt-10 max-w-md mx-auto bg-gradient-to-r from-pink-100 via-pink-200 to-pink-100 dark:from-pink-900 dark:via-pink-800 dark:to-pink-900 p-6 rounded-2xl shadow-lg">
              <h2 className="text-xl font-bold text-pink-900 dark:text-pink-100 mb-2">
                Et si tu devenais vendeur ?
              </h2>
              <p className="text-sm text-pink-800 dark:text-pink-200 mb-4">
                Gagne de l’argent facilement en vendant tes articles en quelques clics. C’est simple, rapide et ouvert à tout le monde.
              </p>
              <Link
                href="/vendre"
                className="inline-block bg-pink-600 hover:bg-pink-700 text-white font-semibold px-5 py-2 rounded-full text-sm transition"
              >
                ✨ Commencer à vendre
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} userId={id} />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
