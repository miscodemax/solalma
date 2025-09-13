'use client'

import { useState, useMemo } from "react"
import { FiFilter } from "react-icons/fi"
import ProductCard from "@/app/composants/product-card"
import PriceFilter from "@/app/composants/pricefilter"

// Type pour les produits
interface Product {
  id: string
  title: string
  price: number
  // Ajoutez d'autres propriétés selon votre structure
  [key: string]: any
}



export default function ProductsWithFilter({ products }: { products: Product[] }) {
  const [showFilter, setShowFilter] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [priceRange, setPriceRange] = useState<[number, number] | null>(null)

  // Filtrer les produits selon le prix
  const filteredProducts = useMemo(() => {
    if (!priceRange) return products

    return products.filter(product => {
      const price = product.price
      return price >= priceRange[0] && price <= priceRange[1]
    })
  }, [products, priceRange])

  const handlePriceChange = (range: [number, number] | null) => {
    setPriceRange(range)
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-20 h-20 mx-auto bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
          <span className="text-2xl">📦</span>
        </div>
        <p className="text-lg font-semibold text-gray-600 dark:text-gray-400">
          Aucun produit pour le moment
        </p>
      </div>
    )
  }

  return (
    <>
      {/* Barre de filtre */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <span>{filteredProducts.length} produit{filteredProducts.length !== 1 ? 's' : ''}</span>
          {priceRange && (
            <span className="bg-[#F4B400]/10 text-[#F4B400] px-2 py-1 rounded-full text-xs font-medium">
              {priceRange[1] === Infinity ? `${priceRange[0].toLocaleString()}+ FCFA` : `${priceRange[0].toLocaleString()} - ${priceRange[1].toLocaleString()} FCFA`}
            </span>
          )}
        </div>

        <button
          onClick={() => setShowFilter(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-[#F4B400] to-[#FFD766] text-white px-4 py-2 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
        >
          <FiFilter className="w-4 h-4" />
          Filtrer
        </button>
      </div>

      {/* Grille de produits */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {/* Message si aucun produit trouvé avec les filtres */}
      {filteredProducts.length === 0 && priceRange && (
        <div className="text-center py-12">
          <div className="w-20 h-20 mx-auto bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
            <span className="text-2xl">🔍</span>
          </div>
          <p className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">
            Aucun produit trouvé
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mb-4">
            Essaie un autre filtre de prix
          </p>
          <button
            onClick={() => {
              setPriceRange(null)
              setSelectedIndex(0)
            }}
            className="bg-gradient-to-r from-[#F4B400] to-[#FFD766] text-white px-4 py-2 rounded-xl font-semibold hover:scale-105 transition-all duration-300"
          >
            Voir tous les produits
          </button>
        </div>
      )}

      {/* Modal de filtre de prix */}
      {showFilter && (
        <PriceFilter
          onChange={handlePriceChange}
          selectedIndex={selectedIndex}
          onSelect={setSelectedIndex}
          onClose={() => setShowFilter(false)}
        />
      )}
    </>
  )
}