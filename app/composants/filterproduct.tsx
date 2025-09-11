"use client"
import { useEffect, useState, useRef } from "react"
import {
  Dialog, DialogContent
} from "@/components/ui/dialog"
import { Filter, Share2, ShoppingBag, Gift, Zap, ArrowUp, Heart, TrendingUp, Star, ChevronLeft, ChevronRight, Flame } from "lucide-react"
import ProductCard from "./product-card"

// Skeleton Components
function ProductCardSkeleton() {
  return (
    <div className="relative group">
      <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-2xl animate-pulse overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-shimmer" />
      </div>
      <div className="mt-3 space-y-2">
        <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-lg animate-pulse" />
        <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-lg w-2/3 animate-pulse" />
        <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-lg w-1/3 animate-pulse" />
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

// Carrousel moderne et spectaculaire pour les produits populaires
function PopularProductsCarousel({ products }: { products: any[] }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const carouselRef = useRef<HTMLDivElement>(null)

  // Trier par likes et prendre les top produits
  const popularProducts = products
    .filter(p => p.likes && p.likes > 0)
    .sort((a, b) => (b.likes || 0) - (a.likes || 0))
    .slice(0, 8)

  // Auto-play avec pause au hover
  useEffect(() => {
    if (!isAutoPlaying || popularProducts.length <= 1) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % popularProducts.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [isAutoPlaying, popularProducts.length])

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % popularProducts.length)
  }

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + popularProducts.length) % popularProducts.length)
  }

  if (popularProducts.length === 0) return null

  return (
    <div className="mb-8">
      {/* Header du carrousel */}
      <div className="flex items-center justify-between mb-4 px-1">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Flame className="w-6 h-6 text-[#F6C445] animate-pulse" />
            <div className="absolute inset-0 bg-[#F6C445]/30 rounded-full blur-md animate-ping" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            Tendances 🔥
          </h2>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <TrendingUp className="w-4 h-4" />
          <span className="hidden sm:inline">Les plus aimés</span>
          <span className="sm:hidden">{popularProducts.length}</span>
        </div>
      </div>

      {/* Carrousel container spectaculaire */}
      <div
        className="relative group"
        onMouseEnter={() => setIsAutoPlaying(false)}
        onMouseLeave={() => setIsAutoPlaying(true)}
      >
        {/* Navigation buttons */}
        <button
          onClick={prevSlide}
          className="absolute left-3 top-1/2 -translate-y-1/2 z-30 w-11 h-11 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md rounded-full shadow-xl border border-white/20 dark:border-gray-700/20 flex items-center justify-center text-gray-700 dark:text-gray-300 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 active:scale-95 hover:bg-[#F6C445] hover:text-[#1C2B49]"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <button
          onClick={nextSlide}
          className="absolute right-3 top-1/2 -translate-y-1/2 z-30 w-11 h-11 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md rounded-full shadow-xl border border-white/20 dark:border-gray-700/20 flex items-center justify-center text-gray-700 dark:text-gray-300 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 active:scale-95 hover:bg-[#F6C445] hover:text-[#1C2B49]"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Carrousel content - Images pleine largeur */}
        <div
          ref={carouselRef}
          className="overflow-hidden rounded-3xl shadow-2xl relative"
        >
          <div
            className="flex transition-transform duration-700 ease-out"
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {popularProducts.map((product, index) => (
              <div key={product.id} className="flex-shrink-0 w-full relative group/slide">
                {/* Image de fond pleine largeur */}
                <div className="relative h-48 sm:h-64 md:h-72 overflow-hidden">
                  <img
                    src={Array.isArray(product.image_url) ? product.image_url[0] : product.image_url}
                    alt={product.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover/slide:scale-110"
                  />

                  {/* Overlay gradient sophistiqué */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/40" />

                  {/* Effet de brillance au hover */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/slide:translate-x-full transition-transform duration-1000 ease-out" />

                  {/* Badge trending top */}
                  <div className="absolute top-4 right-4 flex items-center gap-2">
                    <div className="flex items-center gap-1 px-3 py-1.5 bg-red-500/90 backdrop-blur-sm text-white rounded-full text-xs font-bold">
                      <Heart className="w-3 h-3 fill-white animate-pulse" />
                      <span>{product.likes}</span>
                    </div>
                    <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center animate-bounce">
                      <Flame className="w-4 h-4 text-white" />
                    </div>
                  </div>

                  {/* Badge "TRENDING" en diagonale */}
                  <div className="absolute top-0 left-0">
                    <div className="bg-gradient-to-r from-[#F6C445] to-[#FFD700] text-[#1C2B49] px-6 py-2 font-black text-xs transform -rotate-45 -translate-x-4 translate-y-6 shadow-lg">
                      TRENDING
                    </div>
                  </div>
                </div>

                {/* Contenu overlay en bas */}
                <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6">
                  <div className="space-y-3">
                    {/* Titre et description */}
                    <div className="space-y-2">
                      <h3 className="font-black text-white text-lg sm:text-xl leading-tight line-clamp-2 drop-shadow-lg">
                        {product.title}
                      </h3>
                      <p className="hidden sm:block text-white/90 text-sm line-clamp-2 drop-shadow-md">
                        {product.description}
                      </p>
                    </div>

                    {/* Prix et CTA */}
                    <div className="flex items-end justify-between gap-4">
                      <div className="space-y-1">
                        <div className="text-2xl sm:text-3xl font-black text-[#F6C445] drop-shadow-lg">
                          {product.price.toLocaleString()}
                          <span className="text-sm sm:text-base font-bold text-[#FFD700] ml-1">FCFA</span>
                        </div>
                        <div className="text-xs text-white/80 font-medium">
                          Prix exceptionnel 🔥
                        </div>
                      </div>

                      {/* CTA spectaculaire */}
                      <button
                        onClick={() => window.location.href = `/product/${product.id}`}
                        className="group/cta relative px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-[#F6C445] to-[#FFD700] text-[#1C2B49] font-black rounded-2xl shadow-xl hover:shadow-2xl hover:shadow-[#F6C445]/30 transition-all duration-300 hover:scale-110 active:scale-95 text-sm sm:text-base overflow-hidden"
                      >
                        <span className="relative z-10 flex items-center gap-2">
                          <span>Acheter</span>
                          <svg className="w-4 h-4 transition-transform duration-300 group-hover/cta:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7l5 5-5 5M6 12h12" />
                          </svg>
                        </span>
                        {/* Effet de brillance sur le bouton */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover/cta:translate-x-full transition-transform duration-500" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Effet de particules au hover (mobile-friendly) */}
                <div className="absolute inset-0 pointer-events-none opacity-0 group-hover/slide:opacity-100 transition-opacity duration-500">
                  {[...Array(6)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute w-1 h-1 bg-[#F6C445] rounded-full animate-ping"
                      style={{
                        left: `${20 + i * 15}%`,
                        top: `${30 + i * 10}%`,
                        animationDelay: `${i * 200}ms`,
                        animationDuration: '2s'
                      }}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Dots indicateurs stylés */}
        <div className="flex justify-center items-center gap-2 mt-4">
          {popularProducts.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`transition-all duration-300 ${index === currentIndex
                ? 'w-8 h-3 bg-gradient-to-r from-[#F6C445] to-[#FFD700] rounded-full shadow-lg'
                : 'w-3 h-3 bg-gray-300 dark:bg-gray-600 rounded-full hover:bg-gray-400 dark:hover:bg-gray-500 hover:scale-110'
                }`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

// Composant Back to Top



function BackToTopButton() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const toggleVisibility = () => {
      setIsVisible(window.scrollY > 300)
    }

    window.addEventListener("scroll", toggleVisibility)
    return () => window.removeEventListener("scroll", toggleVisibility)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    })
  }

  return (
    <button
      onClick={scrollToTop}
      aria-label="Retour en haut"
      className={`fixed bottom-4 right-4 z-40 flex items-center justify-center w-10 h-10 rounded-full bg-white/80 text-[#1C2B49] shadow-md backdrop-blur-md border border-gray-200 transition-all duration-300 ${isVisible
        ? "opacity-100 scale-100"
        : "opacity-0 scale-0 pointer-events-none"
        } hover:bg-white hover:shadow-lg active:scale-95`}
    >
      <ArrowUp className="w-4 h-4" />
    </button>
  )
}


// PriceFilter amélioré
function PriceFilter({
  onChange, selectedIndex, onSelect, onClose
}: {
  onChange: (range: [number, number] | null) => void
  selectedIndex: number
  onSelect: (index: number) => void
  onClose: () => void
}) {
  const ranges = [
    { label: "Tous les prix", range: null, emoji: "💎", desc: "Voir tout" },
    { label: "500 - 3K", range: [500, 3000], emoji: "🛍️", desc: "Petit budget" },
    { label: "3K - 7K", range: [3000, 7000], emoji: "✨", desc: "Abordable" },
    { label: "7K - 10K", range: [7000, 10000], emoji: "🌟", desc: "Qualité" },
    { label: "10K - 15K", range: [10000, 15000], emoji: "💫", desc: "Premium" },
    { label: "15K - 20K", range: [15000, 20000], emoji: "👑", desc: "Haut de gamme" },
    { label: "20K+", range: [20001, Infinity], emoji: "❤️", desc: "Luxe" },
  ]

  return (
    <div className="p-6 bg-white dark:bg-gray-900">
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Choisis ton budget 💰
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Trouve les produits parfaits pour toi
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-6">
        {ranges.map(({ label, emoji, desc }, i) => (
          <button
            key={i}
            onClick={() => { onSelect(i); onChange(ranges[i].range) }}
            className={`p-4 rounded-xl text-sm transition-all duration-300 font-medium border group ${selectedIndex === i
              ? "bg-gradient-to-r from-[#F6C445] to-[#FFD700] text-[#1C2B49] shadow-lg border-[#F6C445] scale-105"
              : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border-gray-200 dark:border-gray-700 hover:scale-102"
              }`}
          >
            <div className="text-lg mb-1 group-hover:animate-bounce">{emoji}</div>
            <div className="font-bold mb-1">{label}</div>
            <div className="text-xs opacity-75">{desc}</div>
          </button>
        ))}
      </div>

      <div className="flex gap-3">
        <button
          onClick={onClose}
          className="flex-1 py-3 rounded-xl font-bold text-[#1C2B49] bg-gradient-to-r from-[#F6C445] to-[#FFD700] hover:from-[#FFD700] hover:to-[#F6C445] transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
        >
          Appliquer les filtres ✨
        </button>
        <button
          onClick={() => { onSelect(0); onChange(null); onClose() }}
          className="px-6 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-300 hover:scale-105 active:scale-95"
        >
          Reset
        </button>
      </div>
    </div>
  )
}

export default function FilteredProducts({ products = [], userId = "demo" }) {
  const displayProducts = products

  const [priceRange, setPriceRange] = useState<[number, number] | null>(null)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [filterOpen, setFilterOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [visibleCount, setVisibleCount] = useState(12)
  const [scrollY, setScrollY] = useState(0)

  // Effet de scroll pour les animations
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1200)
    return () => clearTimeout(t)
  }, [])

  const filteredProducts = displayProducts.filter(
    p => !priceRange || (p.price >= priceRange[0] && p.price <= priceRange[1])
  )

  const productsToShow = filteredProducts.slice(0, visibleCount)

  return (
    <div className="min-h-screen bg-gradient-to-b pt-5 from-[#F8F9FB] via-white to-[#F8F9FB] dark:from-[#111827] dark:via-[#1C2B49] dark:to-[#111827]">

      {/* Header avec effet parallax */}
      <div
        className="sticky top-0 z-40 bg-white/80 dark:bg-[#1C2B49]/80 backdrop-blur-lg border-b border-gray-200/50 dark:border-gray-700/50"
        style={{ transform: `translateY(${scrollY * 0.1}px)` }}
      >
        <div className="px-4 py-4 max-w-7xl mx-auto">
          {/* Stats bar */}
          <div className="flex items-center justify-center gap-4 mb-3 text-xs text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span>{displayProducts.length} produits disponibles</span>
            </div>
            <div className="w-1 h-1 bg-gray-400 rounded-full" />
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 text-[#F6C445] fill-[#F6C445]" />
              <span>Livraison rapide</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between gap-4">
            <button
              onClick={() => setFilterOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300 hover:scale-105 active:scale-95 shadow-sm"
            >
              <Filter size={16} />
              <span>{selectedIndex === 0 ? "Filtrer" : "Filtré"}</span>
              {priceRange && <Zap size={12} className="text-[#F6C445] animate-pulse" />}
            </button>

            <button
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold bg-gradient-to-r from-[#F6C445] to-[#FFD700] text-[#1C2B49] hover:from-[#FFD700] hover:to-[#F6C445] transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
            >
              <Share2 size={16} />
              <span>Partager</span>
              <Gift size={14} className="animate-bounce" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 max-w-7xl mx-auto pt-6">
        {loading ? (
          <div className="space-y-8">
            {/* Skeleton carrousel */}
            <div className="h-32 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-2xl animate-pulse" />
            <ProductCardSkeletonGrid count={6} />
          </div>
        ) : (
          <>
            {/* Carrousel des produits populaires */}
            <PopularProductsCarousel products={displayProducts} />

            {/* Section principale */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  Tous les produits
                  {filteredProducts.length > 0 && (
                    <span className="ml-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                      ({filteredProducts.length})
                    </span>
                  )}
                </h2>

                {priceRange && (
                  <button
                    onClick={() => { setPriceRange(null); setSelectedIndex(0) }}
                    className="text-sm text-[#F6C445] hover:text-[#E2AE32] font-medium transition-colors duration-300"
                  >
                    Effacer les filtres
                  </button>
                )}
              </div>
            </div>

            {filteredProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="relative mb-6">
                  <ShoppingBag size={48} className="text-gray-400 animate-bounce" />
                  <div className="absolute inset-0 bg-gray-400/20 rounded-full blur-xl animate-pulse" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  Aucun produit trouvé 😔
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-6 max-w-md">
                  Essaie un autre budget ou reviens plus tard, on ajoute de nouveaux produits chaque jour ! ✨
                </p>
                <button
                  onClick={() => { setPriceRange(null); setSelectedIndex(0) }}
                  className="px-6 py-3 bg-gradient-to-r from-[#F6C445] to-[#FFD700] text-[#1C2B49] font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
                >
                  Voir tous les produits 🛍️
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pb-8">
                  {productsToShow.map((p, index) => (
                    <div
                      key={p.id}
                      className="animate-fade-in-up"
                      style={{
                        animationDelay: `${index * 100}ms`,
                        animationFillMode: 'both'
                      }}
                    >
                      <ProductCard product={p} userId={userId} />
                    </div>
                  ))}
                </div>

                {/* Bouton Voir plus avec compteur */}
                {visibleCount < filteredProducts.length && (
                  <div className="flex flex-col items-center pb-12">
                    <div className="text-center mb-4">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {visibleCount} sur {filteredProducts.length} produits affichés
                      </p>
                      <div className="w-64 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mx-auto">
                        <div
                          className="h-2 bg-gradient-to-r from-[#F6C445] to-[#FFD700] rounded-full transition-all duration-500"
                          style={{ width: `${(visibleCount / filteredProducts.length) * 100}%` }}
                        />
                      </div>
                    </div>

                    <button
                      onClick={() => setVisibleCount(visibleCount + 12)}
                      className="group px-8 py-4 bg-gradient-to-r from-[#F6C445] to-[#FFD700] text-[#1C2B49] font-bold rounded-2xl shadow-lg hover:shadow-2xl hover:shadow-[#F6C445]/20 transition-all duration-300 hover:scale-105 active:scale-95 relative overflow-hidden"
                    >
                      <span className="relative z-10 flex items-center gap-2">
                        Découvrir plus de produits
                        <div className="w-5 h-5 border-2 border-[#1C2B49] border-t-transparent rounded-full animate-spin group-hover:animate-none" />
                      </span>
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                    </button>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>

      {/* Filter dialog */}
      <Dialog open={filterOpen} onOpenChange={setFilterOpen}>
        <DialogContent className="w-[95vw] max-w-md mx-auto rounded-3xl p-0 overflow-hidden border-0 shadow-2xl">
          <PriceFilter
            onChange={(r) => { setPriceRange(r); setFilterOpen(false) }}
            selectedIndex={selectedIndex}
            onSelect={setSelectedIndex}
            onClose={() => setFilterOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Back to top button */}
      <BackToTopButton />

      {/* CSS pour les animations */}
      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes fade-in-up {
          0% {
            opacity: 0;
            transform: translateY(20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out;
        }
        .hover\\:scale-102:hover {
          transform: scale(1.02);
        }
      `}</style>
    </div>
  )
}