import ProductCard from "../composants/product-card"
import { cookies } from "next/headers"
import { createServerClient } from "@supabase/ssr"
import { supabaseUrl, supabaseKey } from "@/lib/supabase"
import AuthModal from "../composants/auth-modal"
import Link from "next/link"
import { FaHeart, FaStore, FaShoppingBag, FaSearch, FaFilter, FaStar, FaCrown, FaGift, FaChartLine, FaUsers, FaShieldAlt } from "react-icons/fa"

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

  // Statistiques pour les hover cards
  const totalValue = products.reduce((sum, product) => sum + (product.price || 0), 0)
  const categories = [...new Set(products.map(p => p.category))].length
  const avgPrice = products.length > 0 ? totalValue / products.length : 0

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#fefefe] via-pink-50/30 to-purple-50/20 dark:bg-gradient-to-br dark:from-[#0d0d0d] dark:via-purple-950/20 dark:to-pink-950/10 px-4 py-8">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header Section Amélioré */}
        <section className="relative">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">

            {/* Titre avec stats */}
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-2">
                <div className="relative">
                  <h1 className="text-4xl sm:text-5xl font-extrabold bg-gradient-to-r from-pink-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                    💖 Tes coups de cœur
                  </h1>
                  {products.length > 0 && (
                    <div className="absolute -top-2 -right-8 bg-pink-500 text-white text-xs font-bold px-2 py-1 rounded-full animate-bounce">
                      {products.length}
                    </div>
                  )}
                </div>
              </div>

              {/* Stats Cards - Hover Cards */}
              {products.length > 0 && (
                <div className="flex flex-wrap gap-3 mt-4">
                  <div className="group relative">
                    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm px-4 py-2 rounded-full border border-pink-200 dark:border-pink-800 cursor-pointer hover:bg-white dark:hover:bg-gray-800 transition-all duration-300">
                      <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        💰 {totalValue.toLocaleString()} FCFA
                      </span>
                    </div>
                    {/* Hover Card pour valeur totale */}
                    <div className="absolute left-0 top-full mt-2 w-72 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 p-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-20">
                      <div className="space-y-3">
                        <h4 className="font-bold text-gray-800 dark:text-white flex items-center">
                          <FaChartLine className="mr-2 text-green-500" />
                          Analyse de tes favoris
                        </h4>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                            <p className="text-xs text-gray-500 dark:text-gray-400">Valeur totale</p>
                            <p className="font-bold text-lg text-green-600">{totalValue.toLocaleString()} FCFA</p>
                          </div>
                          <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                            <p className="text-xs text-gray-500 dark:text-gray-400">Prix moyen</p>
                            <p className="font-bold text-lg text-blue-600">{avgPrice.toLocaleString()} FCFA</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <FaStar className="text-yellow-500" />
                          <span>Tu as du goût ! Ces articles valent {totalValue.toLocaleString()} FCFA</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="group relative">
                    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm px-4 py-2 rounded-full border border-purple-200 dark:border-purple-800 cursor-pointer hover:bg-white dark:hover:bg-gray-800 transition-all duration-300">
                      <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        🏷️ {categories} catégories
                      </span>
                    </div>
                    {/* Hover Card pour catégories */}
                    <div className="absolute left-0 top-full mt-2 w-64 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 p-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-20">
                      <div className="space-y-3">
                        <h4 className="font-bold text-gray-800 dark:text-white flex items-center">
                          <FaFilter className="mr-2 text-purple-500" />
                          Tes catégories préférées
                        </h4>
                        <div className="space-y-2">
                          {[...new Set(products.map(p => p.category))].slice(0, 4).map((cat, idx) => (
                            <div key={idx} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 p-2 rounded-lg">
                              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{cat}</span>
                              <span className="text-xs bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-2 py-1 rounded-full">
                                {products.filter(p => p.category === cat).length}
                              </span>
                            </div>
                          ))}
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Tu explores {categories} catégories différentes !
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Bouton CTA amélioré */}
            <div className="group relative">
              <Link
                href="/dashboard/add"
                className="inline-flex items-center gap-3 bg-gradient-to-r from-pink-600 via-purple-600 to-pink-600 hover:from-pink-700 hover:via-purple-700 hover:to-pink-700 text-white font-bold text-sm sm:text-base px-8 py-4 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
              >
                <FaStore className="text-lg" />
                Vends tes articles
                <div className="bg-white/20 px-2 py-1 rounded-full text-xs">
                  Gratuit
                </div>
              </Link>

              {/* Hover Card pour CTA */}
              <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 p-6 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-20">
                <div className="space-y-4">
                  <h4 className="font-bold text-gray-800 dark:text-white flex items-center">
                    <FaCrown className="mr-2 text-yellow-500" />
                    Deviens vendeur Sangse
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="bg-green-100 dark:bg-green-900 p-2 rounded-full">
                        <FaGift className="text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-gray-800 dark:text-white">Inscription gratuite</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Aucun frais pour commencer</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-full">
                        <FaUsers className="text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-gray-800 dark:text-white">Milliers d'acheteurs</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Audience active au Sénégal</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="bg-purple-100 dark:bg-purple-900 p-2 rounded-full">
                        <FaShieldAlt className="text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-gray-800 dark:text-white">Ventes sécurisées</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Protection vendeur/acheteur</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-900/20 dark:to-purple-900/20 p-3 rounded-lg">
                    <p className="text-xs text-center text-gray-600 dark:text-gray-400">
                      <strong>+2000</strong> vendeurs nous font déjà confiance
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Actions rapides - Nouvelle section */}
        {products.length > 0 && (
          <section className="bg-white/50 dark:bg-gray-800/30 backdrop-blur-sm p-6 rounded-2xl border border-gray-200 dark:border-gray-700">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <h3 className="font-semibold text-gray-800 dark:text-white">Actions rapides :</h3>

                <div className="group relative">
                  <button className="flex items-center gap-2 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-4 py-2 rounded-xl hover:bg-blue-200 dark:hover:bg-blue-800 transition-all duration-300">
                    <FaFilter className="text-sm" />
                    Filtrer par prix
                  </button>
                  {/* Hover Card pour filtres */}
                  <div className="absolute left-0 top-full mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-xl border p-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-10">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Filtres disponibles :</p>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Prix croissant</span>
                        <span className="text-green-600">📈</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Prix décroissant</span>
                        <span className="text-red-600">📉</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Plus récents</span>
                        <span className="text-blue-600">🆕</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="group relative">
                  <button className="flex items-center gap-2 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-4 py-2 rounded-xl hover:bg-green-200 dark:hover:bg-green-800 transition-all duration-300">
                    <FaHeart className="text-sm" />
                    Partager ma liste
                  </button>
                  {/* Hover Card pour partage */}
                  <div className="absolute left-0 top-full mt-2 w-64 bg-white dark:bg-gray-800 rounded-xl shadow-xl border p-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-10">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      Partage ta liste de favoris avec tes amis et famille !
                    </p>
                    <div className="flex gap-2">
                      <button className="flex-1 bg-green-500 text-white px-3 py-2 rounded-lg text-xs hover:bg-green-600 transition-colors">
                        WhatsApp
                      </button>
                      <button className="flex-1 bg-blue-500 text-white px-3 py-2 rounded-lg text-xs hover:bg-blue-600 transition-colors">
                        Copier lien
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats compactes */}
              <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                <span className="flex items-center gap-1">
                  <FaShoppingBag className="text-pink-500" />
                  {products.length} articles
                </span>
                <span className="flex items-center gap-1">
                  <FaStar className="text-yellow-500" />
                  Valeur: {totalValue.toLocaleString()} FCFA
                </span>
              </div>
            </div>
          </section>
        )}

        {/* Contenu principal */}
        {products.length === 0 ? (
          <div className="text-center mt-16 space-y-8">
            {/* Animation de cœur vide */}
            <div className="relative w-32 h-32 mx-auto mb-8">
              <div className="absolute inset-0 bg-gradient-to-r from-pink-200 via-purple-200 to-pink-200 rounded-full animate-pulse opacity-20"></div>
              <div className="absolute inset-4 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center">
                <FaHeart className="text-4xl text-gray-300 dark:text-gray-600" />
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-3xl font-bold text-gray-800 dark:text-white">
                Ta liste de favoris est vide
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                Découvre des articles incroyables et ajoute-les à tes coups de cœur en cliquant sur 💖
              </p>
            </div>

            {/* CTA principal */}
            <div className="group relative inline-block">
              <Link
                href="/"
                className="inline-flex items-center gap-3 bg-gradient-to-r from-gray-800 to-black dark:from-gray-700 dark:to-gray-900 text-white font-bold px-8 py-4 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
              >
                <FaSearch className="text-lg" />
                Découvrir les articles
                <div className="bg-white/20 px-2 py-1 rounded-full text-xs">
                  +1000 produits
                </div>
              </Link>

              {/* Hover Card pour découverte */}
              <div className="absolute left-1/2 transform -translate-x-1/2 top-full mt-4 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border p-6 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-20">
                <div className="space-y-4">
                  <h4 className="font-bold text-gray-800 dark:text-white text-center">
                    🌟 Découvre Sangse Marketplace
                  </h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="text-2xl mb-1">👔</div>
                      <p className="font-semibold text-gray-800 dark:text-white">Vêtements</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Mode tendance</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="text-2xl mb-1">📱</div>
                      <p className="font-semibold text-gray-800 dark:text-white">Électronique</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">High-tech</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="text-2xl mb-1">🏠</div>
                      <p className="font-semibold text-gray-800 dark:text-white">Maison</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Décoration</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="text-2xl mb-1">⚽</div>
                      <p className="font-semibold text-gray-800 dark:text-white">Sport</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Équipements</p>
                    </div>
                  </div>
                  <p className="text-xs text-center text-gray-500 dark:text-gray-400">
                    Plus de 1000 articles disponibles dans toutes les catégories
                  </p>
                </div>
              </div>
            </div>

            {/* Section devenir vendeur améliorée */}
            <div className="mt-12 max-w-2xl mx-auto">
              <div className="bg-gradient-to-r from-pink-500 via-purple-600 to-pink-500 p-1 rounded-3xl shadow-2xl">
                <div className="bg-white dark:bg-gray-900 p-8 rounded-3xl">
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center mx-auto">
                      <FaCrown className="text-2xl text-white" />
                    </div>

                    <h3 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                      Et si tu devenais vendeur ?
                    </h3>

                    <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                      Transforme tes objets inutilisés en argent ! Vendre sur Sangse est simple,
                      rapide et accessible à tous les Sénégalais.
                    </p>

                    <div className="flex flex-wrap justify-center gap-4 mt-6">
                      <div className="flex items-center gap-2 bg-green-50 dark:bg-green-900/20 px-4 py-2 rounded-full">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-sm text-green-700 dark:text-green-400 font-medium">Inscription gratuite</span>
                      </div>
                      <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 px-4 py-2 rounded-full">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                        <span className="text-sm text-blue-700 dark:text-blue-400 font-medium">Vente en 2 min</span>
                      </div>
                      <div className="flex items-center gap-2 bg-purple-50 dark:bg-purple-900/20 px-4 py-2 rounded-full">
                        <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                        <span className="text-sm text-purple-700 dark:text-purple-400 font-medium">Paiement sécurisé</span>
                      </div>
                    </div>

                    <div className="group relative inline-block mt-8">
                      <Link
                        href="/dashboard/add"
                        className="inline-flex items-center gap-3 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white font-bold px-8 py-4 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                      >
                        <FaStore className="text-lg" />
                        Commencer à vendre
                        <div className="bg-white/20 px-2 py-1 rounded-full text-xs">
                          ✨ Nouveau
                        </div>
                      </Link>

                      {/* Hover Card pour devenir vendeur */}
                      <div className="absolute left-1/2 transform -translate-x-1/2 top-full mt-4 w-96 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border p-6 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-20">
                        <div className="space-y-4">
                          <h4 className="font-bold text-gray-800 dark:text-white text-center">
                            🚀 Pourquoi vendre sur Sangse ?
                          </h4>
                          <div className="space-y-3">
                            <div className="flex items-start gap-3">
                              <div className="bg-green-100 dark:bg-green-900 p-2 rounded-full">
                                <FaChartLine className="text-green-600 dark:text-green-400" />
                              </div>
                              <div>
                                <p className="font-semibold text-sm text-gray-800 dark:text-white">Revenus supplémentaires</p>
                                <p className="text-xs text-gray-600 dark:text-gray-400">Gagne de l'argent avec tes objets inutilisés</p>
                              </div>
                            </div>
                            <div className="flex items-start gap-3">
                              <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-full">
                                <FaUsers className="text-blue-600 dark:text-blue-400" />
                              </div>
                              <div>
                                <p className="font-semibold text-sm text-gray-800 dark:text-white">Communauté active</p>
                                <p className="text-xs text-gray-600 dark:text-gray-400">Des milliers d'acheteurs potentiels</p>
                              </div>
                            </div>
                            <div className="flex items-start gap-3">
                              <div className="bg-purple-100 dark:bg-purple-900 p-2 rounded-full">
                                <FaShieldAlt className="text-purple-600 dark:text-purple-400" />
                              </div>
                              <div>
                                <p className="font-semibold text-sm text-gray-800 dark:text-white">100% sécurisé</p>
                                <p className="text-xs text-gray-600 dark:text-gray-400">Protection complète des transactions</p>
                              </div>
                            </div>
                          </div>
                          <div className="bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-900/10 dark:to-purple-900/10 p-3 rounded-lg text-center">
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              <strong className="text-pink-600">+500</strong> nouveaux vendeurs ce mois-ci
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Grille des produits avec animation */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {products.map((product, index) => (
                <div
                  key={product.id}
                  className="transform transition-all duration-500 hover:scale-105"
                  style={{
                    animationDelay: `${index * 100}ms`,
                    animation: 'fadeInUp 0.6s ease-out forwards'
                  }}
                >
                  <ProductCard product={product} userId={id} />
                </div>
              ))}
            </div>

            {/* Section suggestion */}
            <div className="mt-16 text-center">
              <div className="bg-gradient-to-r from-pink-50 via-purple-50 to-pink-50 dark:from-pink-900/10 dark:via-purple-900/10 dark:to-pink-900/10 p-8 rounded-3xl border border-pink-200 dark:border-pink-800">
                <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
                  🎯 Tu aimes ces articles ?
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-2xl mx-auto">
                  Découvre encore plus d'articles similaires ou deviens vendeur pour proposer tes propres trouvailles !
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    href="/"
                    className="inline-flex items-center gap-2 bg-white dark:bg-gray-800 text-gray-800 dark:text-white font-semibold px-6 py-3 rounded-xl border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300"
                  >
                    <FaSearch />
                    Découvrir plus
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
        <div />
        </div>
    </main>
  )

}