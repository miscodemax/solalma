import { cookies } from "next/headers"
import { createServerClient } from "@supabase/ssr"
import { supabaseUrl, supabaseKey } from "../../../lib/supabase"
import Link from "next/link"
import ProductImage from "./productimage"
import DeleteButton from "./deletebutton"
import { Store, TrendingUp, Package, Star, Plus, Search, Filter, Grid } from "lucide-react"
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

  // Calculer les statistiques
  const totalProducts = products.length
  const totalValue = products.reduce((sum, product) => sum + (parseFloat(product.price) || 0), 0)
  const recentProducts = products.filter(p => {
    const createdAt = new Date(p.created_at)
    const lastWeek = new Date()
    lastWeek.setDate(lastWeek.getDate() - 7)
    return createdAt >= lastWeek
  }).length

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F9F6F1] via-[#FDF8F3] to-[#F5F1EC] dark:from-[#0a0a0a] dark:via-[#111111] dark:to-[#0f0f0f] relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 left-10 w-32 h-32 bg-[#D29587]/20 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-48 h-48 bg-[#E8B4A6]/20 rounded-full blur-xl animate-bounce" style={{ animationDuration: '6s' }}></div>
        <div className="absolute bottom-32 left-1/4 w-40 h-40 bg-[#D29587]/10 rounded-full blur-2xl animate-ping" style={{ animationDuration: '4s' }}></div>
      </div>

      <div className="relative z-10 px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <BackButton />

          {/* Header Hero Section */}
          <div className="mb-12">
            <div className="relative bg-gradient-to-r from-[#D29587] to-[#E8B4A6] dark:from-[#8B5A4A] dark:to-[#A66B5B] p-8 rounded-3xl shadow-2xl overflow-hidden">
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>

              <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                  <div className="bg-white/20 backdrop-blur-sm p-4 rounded-2xl shadow-lg">
                    <Store className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-4xl font-black text-white mb-2 tracking-tight">
                      Votre Empire Commercial 👑
                    </h1>
                    <p className="text-white/90 text-lg font-medium">
                      Dirigez votre boutique avec style et panache !
                    </p>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="flex gap-4">
                  <div className="bg-white/20 backdrop-blur-sm p-4 rounded-xl text-center min-w-[80px]">
                    <div className="text-2xl font-bold text-white">{totalProducts}</div>
                    <div className="text-white/80 text-sm">Produits</div>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm p-4 rounded-xl text-center min-w-[120px]">
                    <div className="text-2xl font-bold text-white">{totalValue.toLocaleString()}</div>
                    <div className="text-white/80 text-sm">FCFA</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Dashboard Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <div className="bg-white/80 dark:bg-[#1a1a1a]/80 backdrop-blur-sm border border-[#E6E3DF]/50 dark:border-[#333]/50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center gap-4">
                <div className="bg-gradient-to-r from-[#D29587] to-[#E8B4A6] p-3 rounded-xl shadow-md">
                  <Package className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-[#6B6B6B] dark:text-[#aaa]">Total Produits</p>
                  <p className="text-2xl font-bold text-[#1E1E1E] dark:text-white">{totalProducts}</p>
                </div>
              </div>
            </div>

            <div className="bg-white/80 dark:bg-[#1a1a1a]/80 backdrop-blur-sm border border-[#E6E3DF]/50 dark:border-[#333]/50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center gap-4">
                <div className="bg-gradient-to-r from-[#52C41A] to-[#73D13D] p-3 rounded-xl shadow-md">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-[#6B6B6B] dark:text-[#aaa]">Nouveaux (7j)</p>
                  <p className="text-2xl font-bold text-[#1E1E1E] dark:text-white">{recentProducts}</p>
                </div>
              </div>
            </div>

            <div className="bg-white/80 dark:bg-[#1a1a1a]/80 backdrop-blur-sm border border-[#E6E3DF]/50 dark:border-[#333]/50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center gap-4">
                <div className="bg-gradient-to-r from-[#FAAD14] to-[#FFC53D] p-3 rounded-xl shadow-md">
                  <Star className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-[#6B6B6B] dark:text-[#aaa]">Valeur Totale</p>
                  <p className="text-2xl font-bold text-[#1E1E1E] dark:text-white">{totalValue.toLocaleString()} FCFA</p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Bar */}
          <div className="bg-white/80 dark:bg-[#1a1a1a]/80 backdrop-blur-sm border border-[#E6E3DF]/50 dark:border-[#333]/50 rounded-2xl p-6 mb-8 shadow-lg">
            <div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
              {/* Search and Filters */}
              <div className="flex flex-1 gap-3">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#6B6B6B] dark:text-[#aaa]" />
                  <input
                    type="text"
                    placeholder="Rechercher vos produits..."
                    className="w-full pl-10 pr-4 py-3 bg-[#F9F6F1]/50 dark:bg-[#2a2a2a]/50 border border-[#E6E3DF] dark:border-[#333] rounded-xl text-[#1E1E1E] dark:text-white placeholder-[#6B6B6B] dark:placeholder-[#aaa] focus:outline-none focus:ring-2 focus:ring-[#D29587]/50 focus:border-[#D29587] transition-all"
                  />
                </div>
                <button className="px-4 py-3 bg-[#F9F6F1] dark:bg-[#2a2a2a] border border-[#E6E3DF] dark:border-[#333] rounded-xl hover:bg-[#D29587] hover:text-white hover:border-[#D29587] transition-all duration-200 group">
                  <Filter className="w-4 h-4 group-hover:scale-110 transition-transform" />
                </button>
                <button className="px-4 py-3 bg-[#F9F6F1] dark:bg-[#2a2a2a] border border-[#E6E3DF] dark:border-[#333] rounded-xl hover:bg-[#D29587] hover:text-white hover:border-[#D29587] transition-all duration-200 group">
                  <Grid className="w-4 h-4 group-hover:scale-110 transition-transform" />
                </button>
              </div>

              {/* Add Product Button */}
              <Link
                href="/dashboard/add"
                className="bg-gradient-to-r from-[#D29587] to-[#E8B4A6] hover:from-[#c37f71] hover:to-[#d9a394] text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 font-semibold group flex items-center gap-2 hover:-translate-y-0.5"
              >
                <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-200" />
                Créer un produit
              </Link>
            </div>
          </div>

          {/* Products Grid */}
          {products.length === 0 ? (
            <div className="text-center py-20">
              <div className="bg-white/80 dark:bg-[#1a1a1a]/80 backdrop-blur-sm border border-[#E6E3DF]/50 dark:border-[#333]/50 rounded-3xl p-12 shadow-lg max-w-lg mx-auto">
                <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-[#D29587]/20 to-[#E8B4A6]/20 rounded-full flex items-center justify-center">
                  <Package className="w-16 h-16 text-[#D29587]" />
                </div>
                <h3 className="text-2xl font-bold text-[#1E1E1E] dark:text-white mb-4">
                  Votre vitrine vous attend ! ✨
                </h3>
                <p className="text-[#6B6B6B] dark:text-[#aaa] mb-8 leading-relaxed">
                  Commencez à bâtir votre empire commercial en ajoutant votre premier produit.
                  Chaque grande boutique commence par un seul article !
                </p>
                <Link
                  href="/dashboard/add"
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-[#D29587] to-[#E8B4A6] hover:from-[#c37f71] hover:to-[#d9a394] text-white px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 font-semibold hover:-translate-y-0.5"
                >
                  <Plus className="w-5 h-5" />
                  Ajouter mon premier produit
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product, index) => (
                <div
                  key={product.id}
                  className="group bg-white/80 dark:bg-[#1a1a1a]/80 backdrop-blur-sm border border-[#E6E3DF]/50 dark:border-[#333]/50 rounded-2xl shadow-lg hover:shadow-2xl overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:rotate-1"
                  style={{
                    animationDelay: `${index * 100}ms`,
                  }}
                >
                  {/* Product Image Container */}
                  <div className="relative overflow-hidden rounded-t-2xl">
                    <ProductImage
                      src={product.image_url}
                      alt={product.title}
                      className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                    />

                    {/* Overlay with quick actions */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
                      <Link href={`/dashboard/edit/${product.id}`}>
                        <button className="bg-white/90 hover:bg-white text-[#D29587] p-2 rounded-full shadow-lg transform scale-0 group-hover:scale-100 transition-transform duration-200 hover:scale-110">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                      </Link>
                    </div>

                    {/* New badge for recent products */}
                    {recentProducts > 0 && new Date(product.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) && (
                      <div className="absolute top-3 left-3 bg-gradient-to-r from-[#52C41A] to-[#73D13D] text-white text-xs font-bold px-2 py-1 rounded-full shadow-md">
                        ✨ Nouveau
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-lg font-bold text-[#1E1E1E] dark:text-white group-hover:text-[#D29587] transition-colors line-clamp-1">
                        {product.title}
                      </h3>
                    </div>

                    <p className="text-xs text-[#999] dark:text-[#888] mb-3 flex items-center gap-1">
                      📅 Ajouté le {new Date(product.created_at).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </p>

                    <p className="text-sm text-[#6B6B6B] dark:text-[#bbb] mb-4 line-clamp-2 leading-relaxed">
                      {product.description}
                    </p>

                    {/* Price and Actions */}
                    <div className="flex items-center justify-between">
                      <div className="bg-gradient-to-r from-[#D29587] to-[#E8B4A6] bg-clip-text text-transparent">
                        <span className="text-xl font-black">
                          {parseFloat(product.price).toLocaleString()} FCFA
                        </span>
                      </div>

                      <div className="flex gap-2">
                        <Link href={`/dashboard/edit/${product.id}`}>
                          <button className="text-[#D29587] hover:text-white border-2 border-[#D29587] hover:bg-[#D29587] px-3 py-1.5 rounded-lg text-sm font-semibold transition-all duration-200 hover:scale-105 hover:shadow-md">
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

          {/* Bottom motivational section */}
          {products.length > 0 && (
            <div className="mt-16 text-center">
              <div className="bg-gradient-to-r from-[#D29587]/10 to-[#E8B4A6]/10 dark:from-[#8B5A4A]/10 dark:to-[#A66B5B]/10 backdrop-blur-sm border border-[#D29587]/20 rounded-3xl p-8 max-w-2xl mx-auto">
                <h3 className="text-2xl font-bold text-[#1E1E1E] dark:text-white mb-4">
                  🎉 Félicitations, entrepreneur !
                </h3>
                <p className="text-[#6B6B6B] dark:text-[#aaa] leading-relaxed">
                  Votre boutique grandit jour après jour. Continuez à ajouter des produits
                  et regardez votre empire commercial prospérer !
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}