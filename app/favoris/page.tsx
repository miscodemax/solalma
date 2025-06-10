import ProductCard from "../composants/product-card"
import { cookies } from "next/headers"
import { createServerClient } from "@supabase/ssr"
import { supabaseUrl, supabaseKey } from "@/lib/supabase"
import AuthModal from "@/app/composants/auth-modal"

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

  const { data: likedProducts } = await supabase
    .from("likes")
    .select("product_id, products(*)")
    .eq("user_id", user.id)

  const products = likedProducts?.map((like) => like.products) || []

  return (
    <main className="min-h-screen bg-[#f9f9f9] dark:bg-[#0d0d0d] px-4 py-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-[#333] dark:text-white mb-4">
          💖 Mes favoris
        </h1>

        {products.length === 0 ? (
          <div className="text-center mt-16 text-gray-600 dark:text-gray-300">
            <p className="text-lg">Tu n’as pas encore liké de produit.</p>
            <p className="text-sm mt-1">Explore la boutique et ajoute des articles à tes favoris 💫</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
