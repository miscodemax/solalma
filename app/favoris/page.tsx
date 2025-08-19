import ProductCard from "../composants/product-card"
import { cookies } from "next/headers"
import { createServerClient } from "@supabase/ssr"
import { supabaseUrl, supabaseKey } from "@/lib/supabase"
import AuthModal from "../composants/auth-modal"
import Link from "next/link"
import { FaHeart, FaStore, FaShoppingBag, FaSearch, FaFilter, FaStar, FaCrown, FaGift, FaChartLine, FaUsers, FaShieldAlt, FaShare, FaSort, FaEye, FaFire, FaGem } from "react-icons/fa"

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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-[#0a0a0a] dark:via-[#111] dark:to-[#0a0a0a]">
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
  const premiumItems = products.filter(p => p.price > 50000).length

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50/50 via-white to-gray-100/30 dark:from-[#0a0a0a] dark:via-[#111] dark:to-[#0f0f0f] relative overflow-hidden">

      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.05]">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, #D29587 1px, transparent 1px), 
                           radial-gradient(circle at 75% 75%, #FBCFC2 1px, transparent 1px)`,
          backgroundSize: '24px 24px'
        }}></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 py-8 space-y-10">

        {/* Header Section Ultra Premium */}
        <section className="relative">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">

            {/* Hero Title Section */}
            <div className="flex-1 space-y-6">
              <div className="relative">
                <div className="absolute -top-4 -left-4 w-8 h-8 bg-gradient-to-r from-[#D29587] to-[#FBCFC2] rounded-full blur-sm opacity-60 animate-pulse"></div>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black bg-gradient-to-r from-[#D29587] via-[#B36B5E] to-[#D29587] bg-clip-text text-transparent leading-tight">
                  Mes Favoris
                </h1>
                <div className="absolute -bottom-2 left-0 w-24 h-1 bg-gradient-to-r from-[#D29587] to-transparent rounded-full"></div>

                {products.length > 0 && (
                  <div className="absolute -top-3 -right-3 bg-gradient-to-r from-[#D29587] to-[#B36B5E] text-white text-sm font-bold px-3 py-1.5 rounded-2xl shadow-lg animate-bounce">
                    {products.length}
                  </div>
                )}
              </div>

              <p className="text-lg text-gray-600 dark:text-gray-300 font-light max-w-2xl leading-relaxed">
                Collection personnelle de tes articles préférés sur Sangse Marketplace
              </p>

              {/* Stats Premium Cards */}
              {products.length > 0 && (
                <div className="flex flex-wrap gap-4">
                  {/* Stat 1: Valeur totale */}
                  <div className="group relative">
                    <div className="backdrop-blur-xl bg-white/80 dark:bg-[#1a1a1a]/80 border border-gray-200/50 dark:border-gray-700/50 px-6 py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer hover:scale-105">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-r from-emerald-500 to-green-600 rounded-xl">
                          <FaChartLine className="text-white text-sm" />
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Valeur collection</p>
                          <p className="text-lg font-bold text-gray-900 dark:text-white">
                            {totalValue.toLocaleString()} <span className="text-sm font-normal text-gray-500">FCFA</span>
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Enhanced Hover Card */}
                    <div className="absolute left-0 top-full mt-3 w-80 bg-white dark:bg-[#1a1a1a] rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 p-6 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-30 transform group-hover:translate-y-1">
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="p-3 bg-gradient-to-r from-emerald-500 to-green-600 rounded-2xl">
                            <FaGem className="text-white text-lg" />
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-900 dark:text-white">Analyse de collection</h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Insights détaillés</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 p-4 rounded-2xl border border-emerald-200 dark:border-emerald-800">
                            <p className="text-xs text-emerald-700 dark:text-emerald-300 font-medium mb-1">Valeur totale</p>
                            <p className="font-black text-xl text-emerald-800 dark:text-emerald-200">{totalValue.toLocaleString()}</p>
                            <p className="text-xs text-emerald-600 dark:text-emerald-400">FCFA</p>
                          </div>
                          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-4 rounded-2xl border border-blue-200 dark:border-blue-800">
                            <p className="text-xs text-blue-700 dark:text-blue-300 font-medium mb-1">Prix moyen</p>
                            <p className="font-black text-xl text-blue-800 dark:text-blue-200">{Math.round(avgPrice).toLocaleString()}</p>
                            <p className="text-xs text-blue-600 dark:text-blue-400">FCFA</p>
                          </div>
                        </div>

                        <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/10 dark:to-orange-900/10 p-4 rounded-2xl border border-amber-200 dark:border-amber-700">
                          <div className="flex items-center gap-2 mb-2">
                            <FaFire className="text-amber-600" />
                            <span className="text-sm font-semibold text-amber-800 dark:text-amber-200">Collection Premium</span>
                          </div>
                          <p className="text-xs text-amber-700 dark:text-amber-300">
                            {premiumItems > 0 ? `${premiumItems} articles premium dans ta collection` : "Ajoute des articles premium pour augmenter la valeur"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Stat 2: Catégories */}
                  <div className="group relative">
                    <div className="backdrop-blur-xl bg-white/80 dark:bg-[#1a1a1a]/80 border border-gray-200/50 dark:border-gray-700/50 px-6 py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer hover:scale-105">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl">
                          <FaFilter className="text-white text-sm" />
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Catégories</p>
                          <p className="text-lg font-bold text-gray-900 dark:text-white">
                            {categories} <span className="text-sm font-normal text-gray-500">types</span>
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Categories Hover Card */}
                    <div className="absolute left-0 top-full mt-3 w-72 bg-white dark:bg-[#1a1a1a] rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 p-6 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-30">
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl">
                            <FaStar className="text-white text-lg" />
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-900 dark:text-white">Tes préférences</h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Par catégorie</p>
                          </div>
                        </div>

                        <div className="space-y-2">
                          {[...new Set(products.map(p => p.category))].slice(0, 4).map((cat, idx) => {
                            const count = products.filter(p => p.category === cat).length;
                            const percentage = Math.round((count / products.length) * 100);
                            return (
                              <div key={idx} className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{cat || 'Non catégorisé'}</span>
                                  <span className="text-xs bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 text-purple-800 dark:text-purple-200 px-2 py-1 rounded-full font-bold">
                                    {count}
                                  </span>
                                </div>
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                  <div
                                    className="bg-gradient-to-r from-purple-500 to-pink-600 h-2 rounded-full transition-all duration-500"
                                    style={{ width: `${percentage}%` }}
                                  ></div>
                                </div>
                              </div>
                            )
                          })}
                        </div>

                        <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/10 dark:to-pink-900/10 p-3 rounded-2xl border border-purple-200 dark:border-purple-700">
                          <p className="text-xs text-center text-purple-700 dark:text-purple-300">
                            Tu explores <strong>{categories}</strong> catégories différentes
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Stat 3: Items Premium */}
                  {premiumItems > 0 && (
                    <div className="group relative">
                      <div className="backdrop-blur-xl bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 border border-amber-200 dark:border-amber-700 px-6 py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer hover:scale-105">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-gradient-to-r from-amber-500 to-yellow-600 rounded-xl">
                            <FaCrown className="text-white text-sm" />
                          </div>
                          <div>
                            <p className="text-xs font-medium text-amber-700 dark:text-amber-300">Articles Premium</p>
                            <p className="text-lg font-bold text-amber-800 dark:text-amber-200">
                              {premiumItems} <span className="text-sm font-normal">luxe</span>
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Premium CTA */}
            <div className="group relative">
              <Link
                href="/dashboard/add"
                className="inline-flex items-center gap-4 bg-gradient-to-r from-[#D29587] via-[#B36B5E] to-[#D29587] hover:from-[#B36B5E] hover:via-[#D29587] hover:to-[#B36B5E] text-white font-bold text-sm sm:text-base px-8 py-5 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-1"
              >
                <div className="p-2 bg-white/20 rounded-2xl">
                  <FaStore className="text-lg" />
                </div>
                <div>
                  <div className="font-black">Vends tes articles</div>
                  <div className="text-xs opacity-90">Inscription gratuite</div>
                </div>
                <div className="bg-white/20 px-3 py-1.5 rounded-full text-xs font-bold">
                  ✨ Nouveau
                </div>
              </Link>
            </div>
          </div>
        </section>

        {/* Quick Actions Premium Bar */}
        {products.length > 0 && (
          <section className="backdrop-blur-xl bg-white/60 dark:bg-[#1a1a1a]/60 border border-gray-200/50 dark:border-gray-700/50 p-6 rounded-3xl shadow-lg">
            <div className="flex flex-wrap items-center justify-between gap-6">
              <div className="flex items-center gap-6">
                <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <div className="w-2 h-2 bg-[#D29587] rounded-full animate-pulse"></div>
                  Actions rapides
                </h3>

                <div className="flex flex-wrap gap-3">
                  <button className="group flex items-center gap-2 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 text-blue-800 dark:text-blue-200 px-4 py-2.5 rounded-xl border border-blue-200 dark:border-blue-700 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-all duration-300 hover:scale-105">
                    <FaSort className="text-sm" />
                    <span className="text-sm font-medium">Trier</span>
                  </button>

                  <button className="group flex items-center gap-2 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 text-green-800 dark:text-green-200 px-4 py-2.5 rounded-xl border border-green-200 dark:border-green-700 hover:bg-green-100 dark:hover:bg-green-900/30 transition-all duration-300 hover:scale-105">
                    <FaShare className="text-sm" />
                    <span className="text-sm font-medium">Partager</span>
                  </button>

                  <button className="group flex items-center gap-2 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 text-purple-800 dark:text-purple-200 px-4 py-2.5 rounded-xl border border-purple-200 dark:border-purple-700 hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-all duration-300 hover:scale-105">
                    <FaEye className="text-sm" />
                    <span className="text-sm font-medium">Vue liste</span>
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-6 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-2">
                  <FaShoppingBag className="text-[#D29587]" />
                  <span className="font-medium">{products.length} articles</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaGem className="text-amber-500" />
                  <span className="font-medium">{totalValue.toLocaleString()} FCFA</span>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Main Content */}
        {products.length === 0 ? (
          /* Empty State Premium */
          <div className="text-center py-20 space-y-12">

            {/* Animated Heart */}
            <div className="relative w-40 h-40 mx-auto">
              <div className="absolute inset-0 bg-gradient-to-r from-[#D29587]/20 via-[#FBCFC2]/20 to-[#D29587]/20 rounded-full animate-pulse"></div>
              <div className="absolute inset-8 bg-white dark:bg-[#1a1a1a] rounded-full flex items-center justify-center border-4 border-gray-100 dark:border-gray-700">
                <FaHeart className="text-5xl text-gray-300 dark:text-gray-600 animate-pulse" />
              </div>
              <div className="absolute top-4 right-4 w-4 h-4 bg-[#D29587] rounded-full animate-ping"></div>
              <div className="absolute bottom-6 left-6 w-3 h-3 bg-[#FBCFC2] rounded-full animate-ping animation-delay-200"></div>
            </div>

            <div className="space-y-6">
              <h2 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white">
                Ta collection attend tes premiers coups de cœur
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
                Explore notre marketplace et ajoute tes articles préférés en cliquant sur le cœur ❤️
              </p>
            </div>

            {/* CTA Section */}
            <div className="space-y-8">
              <Link
                href="/"
                className="group inline-flex items-center gap-4 bg-gradient-to-r from-gray-900 to-black dark:from-gray-700 dark:to-gray-900 text-white font-bold px-10 py-5 rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-1"
              >
                <div className="p-3 bg-white/10 rounded-2xl group-hover:bg-white/20 transition-colors">
                  <FaSearch className="text-xl" />
                </div>
                <div>
                  <div className="text-lg font-black">Découvrir les articles</div>
                  <div className="text-sm opacity-80">+1000 produits disponibles</div>
                </div>
              </Link>

              {/* Categories Preview */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto">
                {[
                  { icon: "👔", name: "Mode", desc: "Vêtements tendance" },
                  { icon: "📱", name: "Tech", desc: "Électronique" },
                  { icon: "🏠", name: "Maison", desc: "Décoration" },
                  { icon: "⚽", name: "Sport", desc: "Équipements" }
                ].map((cat, idx) => (
                  <div key={idx} className="group bg-white/80 dark:bg-[#1a1a1a]/80 backdrop-blur-sm p-4 rounded-2xl border border-gray-200 dark:border-gray-700 hover:bg-white dark:hover:bg-[#1a1a1a] transition-all duration-300 cursor-pointer hover:scale-105">
                    <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">{cat.icon}</div>
                    <p className="font-bold text-gray-900 dark:text-white text-sm">{cat.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{cat.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Become Seller Premium Section */}
            <div className="mt-20 max-w-4xl mx-auto">
              <div className="relative bg-gradient-to-r from-[#D29587] via-[#B36B5E] to-[#D29587] p-1 rounded-3xl shadow-2xl">
                <div className="bg-white dark:bg-[#121212] p-10 rounded-3xl">
                  <div className="text-center space-y-8">
                    <div className="relative">
                      <div className="w-20 h-20 bg-gradient-to-r from-[#D29587] to-[#B36B5E] rounded-3xl flex items-center justify-center mx-auto shadow-lg">
                        <FaCrown className="text-3xl text-white" />
                      </div>
                      <div className="absolute -top-2 -right-2 w-8 h-8 bg-amber-400 rounded-full flex items-center justify-center">
                        <span className="text-xs">✨</span>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-[#D29587] to-[#B36B5E] bg-clip-text text-transparent">
                        Deviens vendeur Sangse
                      </h3>
                      <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
                        Transforme tes objets en revenus ! Rejoins notre communauté de vendeurs et commence à gagner dès aujourd'hui.
                      </p>
                    </div>

                    <div className="grid sm:grid-cols-3 gap-6">
                      {[
                        { icon: FaGift, title: "Gratuit", desc: "Inscription sans frais", color: "green" },
                        { icon: FaUsers, title: "Communauté", desc: "Milliers d'acheteurs", color: "blue" },
                        { icon: FaShieldAlt, title: "Sécurisé", desc: "Transactions protégées", color: "purple" }
                      ].map((feature, idx) => (
                        <div key={idx} className="space-y-3">
                          <div className={`w-16 h-16 bg-gradient-to-r ${feature.color === 'green' ? 'from-green-500 to-emerald-600' :
                              feature.color === 'blue' ? 'from-blue-500 to-indigo-600' :
                                'from-purple-500 to-pink-600'
                            } rounded-2xl flex items-center justify-center mx-auto`}>
                            <feature.icon className="text-2xl text-white" />
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 dark:text-white">{feature.title}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{feature.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <Link
                      href="/dashboard/add"
                      className="inline-flex items-center gap-4 bg-gradient-to-r from-[#D29587] to-[#B36B5E] hover:from-[#B36B5E] hover:to-[#D29587] text-white font-bold px-10 py-5 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-105"
                    >
                      <FaStore className="text-xl" />
                      <span>Commencer à vendre</span>
                      <div className="bg-white/20 px-3 py-1 rounded-full text-xs">
                        Nouveau
                      </div>
                    </Link>

                    <div className="bg-gradient-to-r from-[#D29587]/10 to-[#B36B5E]/10 p-4 rounded-2xl border border-[#D29587]/20">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        <strong className="text-[#D29587]">+2000</strong> vendeurs actifs nous font confiance
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Products Grid Premium */
          <div className="space-y-8">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {products.map((product, index) => (
                <div
                  key={product.id}
                  className="opacity-0 animate-fade-in-up"
                  style={{
                    animationDelay: `${index * 100}ms`,
                    animationFillMode: 'forwards'
                  }}
                >
                  <ProductCard product={product} userId={id} />
                </div>
              ))}
            </div>

            {/* Bottom CTA */}
            <div className="text-center py-16">
              <div className="backdrop-blur-xl bg-gradient-to-r from-[#D29587]/5 via-[#FBCFC2]/5 to-[#D29587]/5 border border-[#D29587]/20 p-10 rounded-3xl max-w-4xl mx-auto">
                <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-6">
                  🎯 Continue ton shopping !
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto text-lg">
                  Tu as du goût ! Découvre encore plus d'articles similaires ou partage tes propres trouvailles.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    href="/"
                    className="inline-flex items-center gap-3 bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-white font-semibold px-8 py-4 rounded-2xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-[#222] transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                  >
                    <FaSearch className="text-lg" />
                    Découvrir plus d'articles
                  </Link>

                  <Link
                    href="/dashboard/add"
                    className="inline-flex items-center gap-3 bg-gradient-to-r from-[#D29587] to-[#B36B5E] text-white font-semibold px-8 py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                  >
                    <FaStore className="text-lg" />
                    Vendre mes articles
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out forwards;
        }
        
        .animation-delay-200 {
          animation-delay: 200ms;
        }
      `}</style>
    </main>
  )
}