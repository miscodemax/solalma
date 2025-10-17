'use client'

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase"
import Link from "next/link"
import ProductImage from "./productimage"
import DeleteButton from "./deletebutton"
import { Store, TrendingUp, Package, Star, Plus, Search, Filter, Grid, Edit2, Calendar } from "lucide-react"
import BackButton from "@/app/composants/back-button"
import AuthModal from "@/app/composants/auth-modal"

type Product = {
  id: number
  title: string
  price: string
  description: string
  created_at: string
  image_url: string
  user_id: string
  in_stock?: boolean
}

export default function ProductsPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [products, setProducts] = useState<Product[]>([])
  const [error, setError] = useState<string | null>(null)
  const [updatingIds, setUpdatingIds] = useState<number[]>([]) // track toggles in flight
  const supabase = createClient()

  useEffect(() => {
    const fetchData = async () => {
      const {
        data: { user },
        error: userError
      } = await supabase.auth.getUser()

      if (!user || userError) {
        setUser(null)
        setLoading(false)
        return
      }

      setUser(user)

      const { data: products, error: productsError } = await supabase
        .from("product")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (productsError) {
        setError(productsError.message)
      } else {
        // ensure in_stock defaults to true if undefined (for backward compatibility)
        setProducts((products || []).map((p: any) => ({ ...p, in_stock: typeof p.in_stock === 'boolean' ? p.in_stock : true })))
      }

      setLoading(false)
    }

    fetchData()
  }, [supabase])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF9F6] dark:bg-black">
        <p className="text-[#1A1A1A] dark:text-white">Chargement...</p>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF9F6] dark:bg-black">
        <AuthModal />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF9F6] dark:bg-black">
        <p className="text-red-500">{error}</p>
      </div>
    )
  }

  const totalProducts = products.length
  const totalValue = products.reduce((sum, product) => sum + (parseFloat(product.price) || 0), 0)
  const recentProducts = products.filter(p => {
    const createdAt = new Date(p.created_at)
    const lastWeek = new Date()
    lastWeek.setDate(lastWeek.getDate() - 7)
    return createdAt >= lastWeek
  }).length

  const isUpdating = (id: number) => updatingIds.includes(id)

  const toggleInStock = async (productId: number, currentValue: boolean | undefined) => {
    const newValue = !currentValue
    // optimistic UI
    setProducts(prev => prev.map(p => p.id === productId ? { ...p, in_stock: newValue } : p))
    setUpdatingIds(prev => [...prev, productId])

    const { error: updateError } = await supabase
      .from("product")
      .update({ in_stock: newValue })
      .eq("id", productId)

    if (updateError) {
      // rollback optimistic change on error
      setProducts(prev => prev.map(p => p.id === productId ? { ...p, in_stock: !!currentValue } : p))
      setError(updateError.message)
    }

    setUpdatingIds(prev => prev.filter(id => id !== productId))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FAF9F6] via-[#F4C430]/5 to-[#FFD55A]/10 dark:from-[#0a0a0a] dark:via-[#111111] dark:to-[#0f0f0f] relative overflow-hidden">
      {/* Animated Background Elements - Palette Safran */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 left-10 w-32 h-32 bg-[#F4C430]/20 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-48 h-48 bg-[#FFD55A]/20 rounded-full blur-xl animate-bounce" style={{ animationDuration: '6s' }}></div>
        <div className="absolute bottom-32 left-1/4 w-40 h-40 bg-[#E9961A]/10 rounded-full blur-2xl animate-ping" style={{ animationDuration: '4s' }}></div>
      </div>

      <div className="relative z-10 px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <BackButton />

          {/* Header Hero Section - Palette Safran */}
          <div className="mb-12">
            <div className="relative bg-gradient-to-r from-[#F4C430] to-[#E9961A] dark:from-[#F4C430] dark:to-[#E9961A] p-8 rounded-3xl shadow-2xl overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>

              <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                  <div className="bg-[#1A1A1A]/20 backdrop-blur-sm p-4 rounded-2xl shadow-lg">
                    <Store className="w-8 h-8 text-[#1A1A1A]" />
                  </div>
                  <div>
                    <h1 className="text-4xl font-black text-[#1A1A1A] mb-2 tracking-tight">
                      Votre Empire Commercial 👑
                    </h1>
                    <p className="text-[#1A1A1A]/90 text-lg font-medium">
                      Dirigez votre boutique avec style et panache !
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="bg-[#1A1A1A]/20 backdrop-blur-sm p-4 rounded-xl text-center min-w-[80px]">
                    <div className="text-2xl font-bold text-[#1A1A1A]">{totalProducts}</div>
                    <div className="text-[#1A1A1A]/80 text-sm">Produits</div>
                  </div>
                  <div className="bg-[#1A1A1A]/20 backdrop-blur-sm p-4 rounded-xl text-center min-w-[120px]">
                    <div className="text-2xl font-bold text-[#1A1A1A]">{totalValue.toLocaleString()}</div>
                    <div className="text-[#1A1A1A]/80 text-sm">FCFA</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Dashboard Stats - Palette Safran */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <div className="bg-white/80 dark:bg-[#1a1a1a]/80 backdrop-blur-sm border border-[#F4C430]/20 dark:border-[#333]/50 rounded-2xl p-6 shadow-lg">
              <div className="flex items-center gap-4">
                <div className="bg-gradient-to-r from-[#F4C430] to-[#FFD55A] p-3 rounded-xl shadow-md">
                  <Package className="w-6 h-6 text-[#1A1A1A]" />
                </div>
                <div>
                  <p className="text-sm text-[#1A1A1A]/70 dark:text-[#aaa]">Total Produits</p>
                  <p className="text-2xl font-bold text-[#1A1A1A] dark:text-white">{totalProducts}</p>
                </div>
              </div>
            </div>

            <div className="bg-white/80 dark:bg-[#1a1a1a]/80 backdrop-blur-sm border border-[#F4C430]/20 dark:border-[#333]/50 rounded-2xl p-6 shadow-lg">
              <div className="flex items-center gap-4">
                <div className="bg-gradient-to-r from-[#E9961A] to-[#F4C430] p-3 rounded-xl shadow-md">
                  <TrendingUp className="w-6 h-6 text-[#1A1A1A]" />
                </div>
                <div>
                  <p className="text-sm text-[#1A1A1A]/70 dark:text-[#aaa]">Nouveaux (7j)</p>
                  <p className="text-2xl font-bold text-[#1A1A1A] dark:text-white">{recentProducts}</p>
                </div>
              </div>
            </div>

            <div className="bg-white/80 dark:bg-[#1a1a1a]/80 backdrop-blur-sm border border-[#F4C430]/20 dark:border-[#333]/50 rounded-2xl p-6 shadow-lg">
              <div className="flex items-center gap-4">
                <div className="bg-gradient-to-r from-[#FFD55A] to-[#E9961A] p-3 rounded-xl shadow-md">
                  <Star className="w-6 h-6 text-[#1A1A1A]" />
                </div>
                <div>
                  <p className="text-sm text-[#1A1A1A]/70 dark:text-[#aaa]">Valeur Totale</p>
                  <p className="text-2xl font-bold text-[#1A1A1A] dark:text-white">{totalValue.toLocaleString()} FCFA</p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Bar - Palette Safran */}
          <div className="bg-white/80 dark:bg-[#1a1a1a]/80 backdrop-blur-sm border border-[#F4C430]/20 dark:border-[#333]/50 rounded-2xl p-6 mb-8 shadow-lg">
            <div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
              <div className="flex flex-1 gap-3">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#1A1A1A]/70 dark:text-[#aaa]" />
                  <input
                    type="text"
                    placeholder="Rechercher vos produits..."
                    className="w-full pl-10 pr-4 py-3 bg-[#FAF9F6]/50 dark:bg-[#2a2a2a]/50 border border-[#F4C430]/30 dark:border-[#333] rounded-xl text-[#1A1A1A] dark:text-white"
                  />
                </div>
                <button className="px-4 py-3 bg-[#FAF9F6] dark:bg-[#2a2a2a] border border-[#F4C430]/30 dark:border-[#333] rounded-xl text-[#1A1A1A] dark:text-white">
                  <Filter className="w-4 h-4" />
                </button>
                <button className="px-4 py-3 bg-[#FAF9F6] dark:bg-[#2a2a2a] border border-[#F4C430]/30 dark:border-[#333] rounded-xl text-[#1A1A1A] dark:text-white">
                  <Grid className="w-4 h-4" />
                </button>
              </div>

              <Link
                href="/dashboard/add"
                className="bg-gradient-to-r from-[#F4C430] to-[#E9961A] text-[#1A1A1A] px-6 py-3 rounded-xl shadow-lg font-semibold flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Créer un produit
              </Link>
            </div>
          </div>

          {/* Products Grid - Palette Safran */}
          {products.length === 0 ? (
            <div className="text-center py-20">
              <div className="bg-white/80 dark:bg-[#1a1a1a]/80 backdrop-blur-sm border border-[#F4C430]/20 dark:border-[#333]/50 rounded-3xl p-12 shadow-lg max-w-lg mx-auto">
                <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-[#F4C430]/20 to-[#E9961A]/20 rounded-full flex items-center justify-center">
                  <Package className="w-16 h-16 text-[#E9961A]" />
                </div>
                <h3 className="text-2xl font-bold text-[#1A1A1A] dark:text-white mb-4">
                  Votre vitrine vous attend ! ✨
                </h3>
                <p className="text-[#1A1A1A]/70 dark:text-[#aaa] mb-8 leading-relaxed">
                  Commencez à bâtir votre empire commercial en ajoutant votre premier produit.
                </p>
                <Link
                  href="/dashboard/add"
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-[#F4C430] to-[#E9961A] text-[#1A1A1A] px-8 py-4 rounded-xl shadow-lg font-semibold"
                >
                  <Plus className="w-5 h-5" />
                  Ajouter mon premier produit
                </Link>
              </div>
            </div>
          ) : (
           <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50/30 to-amber-50/20 dark:from-[#0a0a0a] dark:via-[#1a1a1a] dark:to-[#0f0f0f] p-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product, index) => {
            const outOfStock = product.in_stock === false;
            const isNew = new Date(product.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
            
            return (
              <div
                key={product.id}
                className={`group relative bg-white dark:bg-[#1a1a1a] rounded-3xl overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-orange-500/10 hover:-translate-y-2 ${
                  outOfStock ? 'opacity-80' : ''
                }`}
                style={{ 
                  animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`,
                }}
              >
                {/* Effet de brillance au hover */}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/0 to-transparent group-hover:via-white/10 transition-all duration-700 -translate-x-full group-hover:translate-x-full pointer-events-none" />
                
                {/* Badge coin supérieur avec effet 3D */}
                {isNew && (
                  <div className="absolute top-4 -right-12 bg-gradient-to-r from-amber-400 via-orange-500 to-amber-400 text-white text-xs font-bold px-14 py-2 rotate-45 shadow-lg z-10 animate-pulse">
                    ✨ NOUVEAU
                  </div>
                )}

                {/* Image container avec overlay gradient */}
                <div className="relative h-64 overflow-hidden bg-gradient-to-b from-transparent to-black/5">
                  <ProductImage
                    src={product.image_url}
                    alt={product.title}
                    outOfStock={outOfStock}
                  />
                  
                  {/* Overlay en rupture de stock avec effet glassmorphism */}
                  {outOfStock && (
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent backdrop-blur-[2px] flex items-center justify-center">
                      <div className="bg-red-500/90 backdrop-blur-md text-white px-6 py-2.5 rounded-full shadow-2xl font-bold text-sm border-2 border-white/20 flex items-center gap-2 animate-bounce">
                        <Package size={16} />
                        RUPTURE DE STOCK
                      </div>
                    </div>
                  )}

                  {/* Gradient overlay bottom */}
                  <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white dark:from-[#1a1a1a] to-transparent" />
                </div>

                {/* Contenu de la carte */}
                <div className="p-6 space-y-4">
                  {/* Titre avec effet hover */}
                  <div className="space-y-2">
                    <h3 className={`text-xl font-bold text-slate-900 dark:text-white transition-colors duration-300 group-hover:text-orange-500 ${
                      outOfStock ? 'line-through opacity-50' : ''
                    }`}>
                      {product.title}
                    </h3>
                    
                    {/* Date avec icône */}
                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                      <Calendar size={14} className="text-orange-400" />
                      <span>Ajouté le {new Date(product.created_at).toLocaleDateString('fr-FR', { 
                        day: 'numeric', 
                        month: 'long', 
                        year: 'numeric' 
                      })}</span>
                    </div>
                  </div>

                  {/* Description avec limitation de lignes */}
                  <p className={`text-sm text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed ${
                    outOfStock ? 'opacity-50' : ''
                  }`}>
                    {product.description}
                  </p>

                  {/* Prix avec animation */}
                  <div className="flex items-end gap-3 pt-2">
                    <div className={`text-3xl font-black transition-all duration-300 ${
                      outOfStock 
                        ? 'text-slate-300 dark:text-slate-600 line-through' 
                        : 'text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-500 group-hover:from-orange-600 group-hover:to-amber-600'
                    }`}>
                      {parseFloat(product.price).toLocaleString()}
                    </div>
                    <span className={`text-lg font-bold pb-1 ${
                      outOfStock ? 'text-slate-400' : 'text-orange-500'
                    }`}>
                      FCFA
                    </span>
                  </div>

                  {/* Toggle stock avec design moderne */}
                  <div className="flex items-center justify-between py-3 px-4 bg-slate-50 dark:bg-[#0f0f0f] rounded-2xl border border-slate-200 dark:border-slate-800">
                    <label className="flex items-center gap-3 cursor-pointer select-none">
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={!!product.in_stock}
                          onChange={() => toggleInStock(product.id, product.in_stock)}
                          disabled={isUpdating(product.id)}
                          className="sr-only"
                        />
                        <div className={`w-14 h-7 rounded-full transition-all duration-300 ${
                          product.in_stock 
                            ? 'bg-gradient-to-r from-emerald-400 to-green-500 shadow-lg shadow-emerald-500/30' 
                            : 'bg-slate-300 dark:bg-slate-700'
                        }`} />
                        <div className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow-md transform transition-all duration-300 flex items-center justify-center ${
                          product.in_stock ? 'translate-x-7' : 'translate-x-0'
                        }`}>
                          {isUpdating(product.id) ? (
                            <div className="w-3 h-3 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <div className={`w-2 h-2 rounded-full ${
                              product.in_stock ? 'bg-emerald-500' : 'bg-slate-400'
                            }`} />
                          )}
                        </div>
                      </div>
                      <span className={`text-sm font-bold transition-colors ${
                        product.in_stock 
                          ? 'text-emerald-600 dark:text-emerald-400' 
                          : 'text-red-600 dark:text-red-400'
                      }`}>
                        {product.in_stock ? '✓ En Stock' : '✕ Rupture'}
                      </span>
                    </label>
                  </div>

                  {/* Boutons d'action avec effet hover sophistiqué */}
                  <div className="flex gap-3 pt-2">
                    <button className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white px-4 py-3 rounded-xl font-bold text-sm transition-all duration-300 shadow-lg shadow-orange-500/30 hover:shadow-xl hover:shadow-orange-500/40 hover:scale-[1.02] active:scale-95">
                      <Edit2 size={16} />
                      Modifier
                    </button>
                    <DeleteButton id={product.id} />
                  </div>

                  {/* Message rupture de stock */}
                  {outOfStock && (
                    <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                      <Package size={16} className="text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-red-700 dark:text-red-300 font-medium leading-relaxed">
                        Ce produit n'apparaîtra pas comme disponible pour les acheteurs jusqu'à ce qu'il soit remis en stock.
                      </p>
                    </div>
                  )}
                </div>

                {/* Bordure animée au hover */}
                <div className="absolute inset-0 border-2 border-transparent group-hover:border-orange-500/20 rounded-3xl transition-all duration-500 pointer-events-none" />
              </div>
            );
          })}
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  
          )}

          {products.length > 0 && (
            <div className="mt-16 text-center">
              <div className="bg-gradient-to-r from-[#F4C430]/20 to-[#FFD55A]/10 dark:from-[#F4C430]/10 dark:to-[#E9961A]/10 backdrop-blur-sm border border-[#F4C430]/30 rounded-3xl p-8 max-w-2xl mx-auto">
                <h3 className="text-2xl font-bold text-[#1A1A1A] dark:text-white mb-4">
                  🎉 Félicitations, entrepreneur !
                </h3>
                <p className="text-[#1A1A1A]/70 dark:text-[#aaa] leading-relaxed">
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