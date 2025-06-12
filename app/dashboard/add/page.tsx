import { cookies } from "next/headers"
import { createServerClient } from "@supabase/ssr"
import { supabaseUrl, supabaseKey } from "@/lib/supabase"
import AuthModal from "@/app/composants/auth-modal"
import AddProductForm from "./add-product-form"


export const dynamic = "force-dynamic"

export const metadata = {
  title: "Ajouter un produit - Dashboard",
  description: "Ajoutez un nouveau produit à votre boutique",
}

export default async function AddProductPage() {
  const cookieStore = await cookies()
  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      get: (name) => cookieStore.get(name)?.value,
    },
  })

  const { data: { user }, error } = await supabase.auth.getUser()


  // Si l'utilisateur n'est pas connecté, affiche le modal d'authentification
  if (!user || error) {
    return (
      <div className="min-h-screen flex items-center justify-center dark:bg-black">
        <AuthModal />
      </div>
    )
  }
  return (
    <div className="min-h-screen bg-[#F9F6F1]dark:bg-black py-10 px-4 flex items-center justify-center">
      <div className="w-full max-w-2xl bg-white shadow-lg border border-[#E6E3DF] rounded-2xl p-8">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-extrabold text-[#1E1E1E] mb-2">
            Bonjour {user.email?.split("@")[0] || "!"} 👋
          </h1>
          <p className="text-[#6B6B6B] text-sm">
            Prêt·e à ajouter un nouveau produit à votre boutique ?
          </p>
        </div>
        <AddProductForm userId={user.id} />
      </div>
    </div>
  )
}
