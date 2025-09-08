"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { FaHeart, FaStore, FaBoxOpen } from "react-icons/fa"
import { motion } from "framer-motion"

export default function FavoritesPage() {
  const [products, setProducts] = useState<any[]>([])

  useEffect(() => {
    // Exemple fetch (à remplacer par ton vrai fetch Supabase)
    const mockProducts = [
      { id: 1, name: "Sac élégant", price: "25 000 CFA" },
      { id: 2, name: "Chaussures modernes", price: "35 000 CFA" },
      { id: 3, name: "Robe tendance", price: "45 000 CFA" },
    ]
    setProducts(mockProducts)
  }, [])

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#FAFAFA] via-white to-[#F5E6CC] dark:from-[#1C2B49] dark:via-[#24344F] dark:to-[#1C2B49] relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.05]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, #A8D5BA 1px, transparent 1px),
                             radial-gradient(circle at 75% 75%, #F6C445 1px, transparent 1px)`,
            backgroundSize: "24px 24px",
          }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 py-8 space-y-12">
        {/* Header */}
        <section className="relative">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
            <div className="flex-1 space-y-6">
              <div className="relative">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black bg-gradient-to-r from-[#F6C445] via-[#A8D5BA] to-[#1C2B49] bg-clip-text text-transparent leading-tight">
                  Mes Favoris
                </h1>
                <div className="absolute -bottom-2 left-0 w-24 h-1 bg-gradient-to-r from-[#F6C445] to-transparent rounded-full"></div>
                {products.length > 0 && (
                  <div className="absolute -top-3 -right-3 bg-gradient-to-r from-[#F6C445] to-[#A8D5BA] text-white text-sm font-bold px-3 py-1.5 rounded-2xl shadow-lg animate-bounce">
                    {products.length}
                  </div>
                )}
              </div>
              <p className="text-lg text-[#374151] dark:text-gray-300 font-light max-w-2xl leading-relaxed">
                Collection personnelle de tes articles préférés sur Sangsé Marketplace
              </p>
              <Link
                href="/dashboard/add"
                className="inline-flex items-center gap-4 bg-gradient-to-r from-[#1C2B49] via-[#F6C445] to-[#A8D5BA] hover:from-[#F6C445] hover:via-[#A8D5BA] hover:to-[#1C2B49] text-white font-bold text-sm sm:text-base px-8 py-5 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-1"
              >
                <div className="p-2 bg-white/20 rounded-2xl">
                  <FaStore className="text-lg" />
                </div>
                <div>
                  <div className="font-black">Vends tes articles</div>
                  <div className="text-xs opacity-90">Inscription gratuite</div>
                </div>
                <div className="bg-[#F6C445]/90 text-[#1C2B49] px-3 py-1.5 rounded-full text-xs font-bold">
                  ✨ Nouveau
                </div>
              </Link>
            </div>
          </div>
        </section>

        {/* Stats Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <motion.div
            whileHover={{ scale: 1.03 }}
            className="p-6 rounded-3xl bg-gradient-to-br from-[#F6C445] to-[#A8D5BA] shadow-lg text-white"
          >
            <FaHeart className="text-2xl mb-3" />
            <h3 className="font-bold text-lg">Favoris totaux</h3>
            <p className="text-2xl font-black">{products.length}</p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.03 }}
            className="p-6 rounded-3xl bg-gradient-to-br from-[#1C2B49] to-[#24344F] shadow-lg text-white"
          >
            <FaStore className="text-2xl mb-3" />
            <h3 className="font-bold text-lg">Boutiques suivies</h3>
            <p className="text-2xl font-black">5</p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.03 }}
            className="p-6 rounded-3xl bg-gradient-to-br from-[#A8D5BA] to-[#F5E6CC] shadow-lg text-[#1C2B49]"
          >
            <FaBoxOpen className="text-2xl mb-3" />
            <h3 className="font-bold text-lg">Articles achetés</h3>
            <p className="text-2xl font-black">12</p>
          </motion.div>
        </section>

        {/* Products Grid */}
        {products.length > 0 ? (
          <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((p) => (
              <motion.div
                key={p.id}
                whileHover={{ scale: 1.03 }}
                className="bg-white dark:bg-[#24344F] rounded-2xl shadow-md overflow-hidden group hover:shadow-xl transition-all"
              >
                <div className="aspect-square bg-gradient-to-br from-[#F6C445]/30 to-[#A8D5BA]/30 flex items-center justify-center">
                  <span className="text-4xl">👜</span>
                </div>
                <div className="p-4">
                  <h4 className="font-semibold text-[#1C2B49] dark:text-white">
                    {p.name}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{p.price}</p>
                </div>
              </motion.div>
            ))}
          </section>
        ) : (
          /* Empty State */
          <section className="text-center py-20">
            <div className="mx-auto w-20 h-20 bg-[#F6C445]/20 rounded-full flex items-center justify-center mb-6">
              <FaHeart className="text-[#F6C445] text-3xl" />
            </div>
            <h3 className="text-2xl font-bold text-[#1C2B49] dark:text-white mb-2">
              Aucun favori pour le moment
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Explore nos catégories et ajoute des articles à ta liste de favoris.
            </p>
            <Link
              href="/products"
              className="inline-block bg-gradient-to-r from-[#F6C445] to-[#A8D5BA] text-[#1C2B49] font-bold px-6 py-3 rounded-2xl shadow-md hover:shadow-lg transition-all"
            >
              Parcourir les produits
            </Link>
          </section>
        )}
      </div>
    </main>
  )
}
