"use client"
import { useEffect, useState } from "react"
import {
  Dialog, DialogContent
} from "@/components/ui/dialog"
import { Filter, Share2, ShoppingBag, Gift, ArrowUp, X, Users, Zap } from "lucide-react"
import ProductCard from "./product-card"

// Skeleton Components
function ProductCardSkeleton() {
  return (
    <div className="relative group">
      <div className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse overflow-hidden" />
      <div className="mt-3 space-y-2">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-lg w-2/3 animate-pulse" />
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-lg w-1/3 animate-pulse" />
      </div>
    </div>
  )
}

function ProductCardSkeletonGrid({ count }: { count: number }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  )
}

// PriceFilter (palette épurée)
function PriceFilter({
  onChange, selectedIndex, onSelect, onClose
}: {
  onChange: (range: [number, number] | null) => void
  selectedIndex: number
  onSelect: (index: number) => void
  onClose: () => void
}) {
  const ranges = [
    { label: "Tous les prix", range: null, tip: "Tous les produits", emoji: "💎" },
    { label: "500 - 3K", range: [500, 3000], tip: "Petits prix", emoji: "🛍️" },
    { label: "3K - 7K", range: [3000, 7000], tip: "Bon rapport", emoji: "✨" },
    { label: "7K - 10K", range: [7000, 10000], tip: "Style équilibré", emoji: "🌟" },
    { label: "10K - 15K", range: [10000, 15000], tip: "Qualité assurée", emoji: "💫" },
    { label: "15K - 20K", range: [15000, 20000], tip: "Premium", emoji: "👑" },
    { label: "20K+", range: [20001, Infinity], tip: "Coup de cœur", emoji: "❤️" },
  ]

  return (
    <div className="p-5">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 text-center">Budget 💰</h3>
      <div className="grid grid-cols-2 gap-3 mb-6">
        {ranges.map(({ label, emoji }, i) => (
          <button
            key={i}
            onClick={() => { onSelect(i); onChange(ranges[i].range) }}
            className={`p-3 rounded-xl text-sm transition font-medium border ${selectedIndex === i
                ? "bg-green-500 text-white shadow border-green-500"
                : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-green-50 border-gray-200"
              }`}
          >
            <div className="text-base mb-1">{emoji}</div>
            <div className="font-semibold">{label}</div>
          </button>
        ))}
      </div>

      <div className="flex gap-3">
        <button
          onClick={onClose}
          className="flex-1 py-3 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 transition"
        >
          Appliquer
        </button>
        <button
          onClick={() => { onSelect(0); onChange(null); onClose() }}
          className="px-4 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-200 dark:hover:bg-gray-700 transition"
        >
          Reset
        </button>
      </div>
    </div>
  )
}

export default function FilteredProducts({ products = [], userId = "demo" }) {
  const mockProducts = [
    { id: 1, title: "Robe Hijab Moderne Premium", description: "Élégante et confortable", price: 15000, image_url: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400" },
    { id: 2, title: "Set Skincare Glow", description: "Routine peau éclatante", price: 8500, image_url: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400" },
  ]

  const displayProducts = products.length > 0 ? products : mockProducts

  const [priceRange, setPriceRange] = useState<[number, number] | null>(null)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [filterOpen, setFilterOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  const BRAND = {
    green: "#25A18E",
    gray: "#F9FAFB",
    text: "#111827"
  }

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 900)
    return () => clearTimeout(t)
  }, [])

  const filteredProducts = displayProducts.filter(
    p => !priceRange || (p.price >= priceRange[0] && p.price <= priceRange[1])
  )

  return (
    <div className="min-h-screen pt-6" style={{ backgroundColor: BRAND.gray }}>
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-200">
        <div className="px-4 py-3 max-w-7xl mx-auto flex items-center justify-between gap-4">
          <button
            onClick={() => setFilterOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 bg-white text-gray-700 font-medium hover:bg-green-50 transition"
          >
            <Filter size={16} />
            <span>{selectedIndex === 0 ? "Tous les prix" : "Filtré"}</span>
            {priceRange && <Zap size={12} className="text-green-500" />}
          </button>

          <button
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-500 text-white font-semibold hover:bg-green-600 transition"
          >
            <Share2 size={16} />
            <span>Partager</span>
            <Gift size={14} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 max-w-7xl mx-auto">
        {loading ? (
          <ProductCardSkeletonGrid count={6} />
        ) : filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <ShoppingBag size={40} className="text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900">Aucun produit</h3>
            <p className="text-gray-600 text-sm mb-4">Essaie un autre budget</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 py-6">
            {filteredProducts.map(p => (
              <ProductCard key={p.id} product={p} userId={userId} />
            ))}
          </div>
        )}
      </div>

      {/* Filter dialog */}
      <Dialog open={filterOpen} onOpenChange={setFilterOpen}>
        <DialogContent className="w-[95vw] max-w-md mx-auto rounded-2xl p-0 overflow-hidden border-0">
          <PriceFilter
            onChange={(r) => { setPriceRange(r); setFilterOpen(false) }}
            selectedIndex={selectedIndex}
            onSelect={setSelectedIndex}
            onClose={() => setFilterOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
