import { cookies } from "next/headers"
import { createServerClient } from "@supabase/ssr"
import { supabaseUrl, supabaseKey } from "../../../lib/supabase"
import Link from "next/link"
import ProductImage from "./productimage"
import DeleteButton from "./deletebutton"
import { Store } from "lucide-react"
import BackButton from "@/app/composants/back-button"
import AuthModal from "@/app/composants/auth-modal"

export default async function ProductsPage() {
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
      <div className="min-h-screen flex items-center justify-center dark:bg-black">
        <AuthModal />
      </div>
    )
  }


  const { data: products, error: productsError } = await supabase
    .from("product")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  if (productsError) {
    throw new Error(productsError.message)
  }

  return (
    <div className="min-h-screen bg-[#F9F6F1] dark:bg-[#0f0f0f] bg-[url('/dots.svg')] bg-repeat opacity-[0.95] px-4 py-10">
      <div className="max-w-6xl mx-auto">
        <BackButton />
        {/* Message de bienvenue */}
        <div className="bg-[#f3ede9] dark:bg-[#1e1e1e] p-6 rounded-xl shadow-sm mb-10 flex items-center gap-4">
          <div className="bg-[#D29587] text-white p-3 rounded-full shadow">
            <Store className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-[#1E1E1E] dark:text-white">
              Bienvenue dans votre boutique ✨
            </h2>
            <p className="text-[#6B6B6B] dark:text-[#aaa] text-sm">
              Gérez vos produits comme un pro, et faites briller votre vitrine personnelle.
            </p>
          </div>
        </div>

        {/* CTA d'ajout de produit */}
        <div className="flex justify-end mb-6">
          <Link
            href="/dashboard/add"
            className="bg-[#D29587] hover:bg-[#c37f71] text-white px-5 py-2 rounded-lg shadow-md transition text-sm font-semibold"
          >
            + Ajouter un produit
          </Link>
        </div>

        {/* Liste de produits */}
        {products.length === 0 ? (
          <p className="text-center text-[#555] dark:text-[#aaa] mt-10">
            Vous n&apos;avez aucun produit pour le moment.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-white dark:bg-[#181818] border border-[#E6E3DF] dark:border-[#333] rounded-xl shadow-sm overflow-hidden flex flex-col transition-all duration-300 hover:shadow-md hover:-translate-y-1"
              >
                <ProductImage src={product.image_url} alt={product.title} />
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-[#1E1E1E] dark:text-white">
                      {product.title}
                    </h2>
                    <p className="text-xs text-[#999] dark:text-[#888] mt-1">
                      Ajouté le {new Date(product.created_at).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-[#6B6B6B] dark:text-[#bbb] mt-2 line-clamp-2">
                      {product.description}
                    </p>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-[#D29587] font-semibold">
                      {product.price} FCFA
                    </span>
                    <div className="flex gap-2 text-sm">
                      <Link href={`/dashboard/edit/${product.id}`}>
                        <button
                          type="button"
                          className="text-[#D29587] font-bold border border-[#D29587] hover:bg-[#D29587] hover:text-white transition-all duration-200 px-4 py-1.5 rounded-lg"
                        >
                          Modifier
                        </button>
                      </Link>
                      <DeleteButton id={product.id} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
