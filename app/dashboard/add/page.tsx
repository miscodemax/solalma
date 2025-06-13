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
  // Récupère le store des cookies une seule fois
  const cookieStore = await cookies()
  // Crée le client Supabase en mode serveur avec gestion sécurisée des cookies
  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      get: (name: string) => cookieStore.get(name)?.value,
    },
  })

  // Récupère l'utilisateur connecté
  const { data: { user }, error } = await supabase.auth.getUser()

  // Affiche le modal d'authentification si l'utilisateur n'est pas connecté
  if (!user || error) {
    return (
      <main className="min-h-screen flex items-center justify-center dark:bg-black bg-[#F9F6F1]">
        <AuthModal />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#F9F6F1] dark:bg-black py-10 px-4 flex items-center justify-center">
      <section className="w-full max-w-2xl bg-white dark:bg-[#18181A] shadow-lg border border-[#E6E3DF] dark:border-[#232326] rounded-2xl p-8">
        <header className="mb-6 text-center">
          <h1 className="text-3xl font-extrabold text-[#1E1E1E] dark:text-white mb-2">
            Bonjour {user.email?.split("@")[0] || "!"} 👋
          </h1>
          <p className="text-[#6B6B6B] dark:text-[#AAAAAA] text-sm">
            Prêt·e à ajouter un nouveau produit à votre boutique&nbsp;?
          </p>
        </header>
        <AddProductForm userId={user.id} />
      </section>
    </main>
  )
}