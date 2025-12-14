import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { supabaseUrl, supabaseKey } from "@/lib/supabase";
import AuthModal from "@/app/composants/auth-modal";
import AddProductForm from "./add-product-form";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Ajouter un produit - Dashboard",
  description: "Ajoutez un nouveau produit à votre boutique",
};

export default async function AddProductPage() {
  // Récupère le store des cookies une seule fois
  const cookieStore = await cookies();
  // Crée le client Supabase en mode serveur avec gestion sécurisée des cookies
  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      get: (name: string) => cookieStore.get(name)?.value,
    },
  });

  // Récupère l'utilisateur connecté
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  // Affiche le modal d'authentification si l'utilisateur n'est pas connecté
  if (!user || error) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="w-full max-w-md mx-auto px-4">
          <AuthModal />
        </div>
      </main>
    );
  }

  // Obtient le prénom depuis l'email ou les métadonnées utilisateur
  const getUserDisplayName = () => {
    if (user.user_metadata?.full_name) {
      return user.user_metadata.full_name.split(" ")[0];
    }
    if (user.email) {
      const emailPart = user.email.split("@")[0];
      // Capitalise la première lettre
      return emailPart.charAt(0).toUpperCase() + emailPart.slice(1);
    }
    return "Vendeur";
  };

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header de bienvenue - Fixe sur mobile, intégré sur desktop */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10 md:static md:border-0">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-3 mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-[#D29587] to-[#bb7d72] rounded-full flex items-center justify-center shadow-lg">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                  Salut {getUserDisplayName()} ! 👋
                </h1>
                <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base mt-1">
                  Créons ensemble votre nouvelle annonce
                </p>
              </div>
            </div>

            {/* Indicateur de progression - Style Vinted */}
            <div className="flex items-center justify-center md:justify-start gap-2 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-[#D29587] text-white rounded-full flex items-center justify-center text-sm font-semibold">
                  1
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Détails du produit
                </span>
              </div>
              <div className="w-8 h-px bg-gray-300 dark:bg-gray-600 mx-2"></div>
              <div className="flex items-center gap-2 opacity-50">
                <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-400 rounded-full flex items-center justify-center text-sm font-semibold">
                  2
                </div>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Publication
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Contenu principal - Le formulaire prend maintenant tout l'espace */}
      <AddProductForm userId={user.id} />
      {/* Footer d'aide - Seulement sur desktop */}
      <div className="hidden md:block bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className="flex flex-col items-center gap-2">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-blue-600 dark:text-blue-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                Photos de qualité
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Utilisez des photos nettes et bien éclairées
              </p>
            </div>

            <div className="flex flex-col items-center gap-2">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-green-600 dark:text-green-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                Description complète
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Détaillez l'état, la taille et les matières
              </p>
            </div>

            <div className="flex flex-col items-center gap-2">
              <div className="w-10 h-10 bg-[#D29587]/20 rounded-full flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-[#D29587]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                  />
                </svg>
              </div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                Prix juste
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Fixez un prix attractif et compétitif
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
