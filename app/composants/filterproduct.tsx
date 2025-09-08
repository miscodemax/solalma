"use client"
import { useEffect, useState } from "react"
import {
  Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle,
  DialogFooter, DialogClose, DialogDescription
} from "@/components/ui/dialog"
import {
  HoverCard, HoverCardTrigger, HoverCardContent
} from "@/components/ui/hover-card"
import { Info, HelpCircle, Filter, Share2, Heart, ShoppingBag, Star, Zap, TrendingUp, Users, Gift, ArrowUp, X } from "lucide-react"

// Skeleton Components
function ProductCardSkeleton() {
  return (
    <div className="relative group">
      <div className="aspect-square bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-2xl animate-pulse overflow-hidden">
        {/* Skeleton shimmer effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full animate-pulse-slow" />
      </div>
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

// Enhanced ProductCard Component
function ProductCard({ product, userId, index }: { product: Product, userId: string, index: number }) {
  const [isLiked, setIsLiked] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)

  return (
    <div
      className="group relative bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-700 hover:-translate-y-1 border border-gray-100 dark:border-gray-800 animate-fade-in-scale"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {/* Enhanced trending badge */}
      <div className="absolute top-2 left-2 z-10">
        <div className="flex items-center gap-1 bg-gradient-to-r from-pink-500 to-rose-400 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-md backdrop-blur-sm">
          <TrendingUp size={8} className="animate-pulse" />
          HOT
        </div>
      </div>

      {/* Enhanced heart button */}
      <button
        onClick={() => setIsLiked(!isLiked)}
        className="absolute top-2 right-2 z-10 w-7 h-7 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-all duration-300 border border-gray-100 dark:border-gray-700"
      >
        <Heart
          size={14}
          className={`transition-all duration-300 ${isLiked ? 'fill-red-500 text-red-500 scale-110' : 'text-gray-600 dark:text-gray-300'}`}
        />
      </button>

      {/* Enhanced image with better overlay */}
      <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
        <img
          src={product.image_url || '/placeholder-image.jpg'}
          alt={product.title}
          className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105"
          onLoad={() => setImageLoaded(true)}
        />

        {/* Improved quick action overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-end justify-center pb-4">
          <div className="transform translate-y-6 group-hover:translate-y-0 transition-transform duration-500">
            <button className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm text-gray-900 dark:text-white px-4 py-2 rounded-xl font-semibold shadow-xl flex items-center gap-2 hover:scale-105 transition-all duration-300 text-sm border border-gray-200 dark:border-gray-700">
              <ShoppingBag size={14} />
              Voir
            </button>
          </div>
        </div>

        {/* Enhanced shimmer effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1200" />
      </div>

      {/* Improved content layout */}
      <div className="p-3">
        <h3 className="font-semibold text-gray-900 dark:text-white text-sm leading-tight mb-2 line-clamp-2 group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors duration-300">
          {product.title}
        </h3>

        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-base font-bold text-gray-900 dark:text-white">
              {product.price.toLocaleString()}
              <span className="text-xs font-normal text-gray-500 ml-1">FCFA</span>
            </span>
            <div className="flex items-center gap-1">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={9} className="fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <span className="text-xs text-gray-500">4.8</span>
            </div>
          </div>

          <button className="w-7 h-7 bg-gradient-to-r from-pink-500 to-rose-400 text-white rounded-xl flex items-center justify-center shadow-md hover:scale-110 transition-all duration-300 hover:shadow-lg">
            <ShoppingBag size={12} />
          </button>
        </div>
      </div>
    </div>
  )
}

type Product = {
  id: number
  title: string
  description: string
  price: number
  image_url: string | null
}

function PriceFilter({
  onChange, selectedIndex, onSelect, onClose
}: {
  onChange: (range: [number, number] | null) => void
  selectedIndex: number
  onSelect: (index: number) => void
  onClose: () => void
}) {
  const ranges = [
    { label: "Tous les prix", range: null, tip: "Tous les produits, sans restriction 💫", emoji: "💎" },
    { label: "500 - 3K", range: [500, 3000], tip: "Petits prix, grandes trouvailles 🧴", emoji: "🛍️" },
    { label: "3K - 7K", range: [3000, 7000], tip: "Idéal pour tester sans se ruiner 💅", emoji: "✨" },
    { label: "7K - 10K", range: [7000, 10000], tip: "Un équilibre parfait ✨", emoji: "🌟" },
    { label: "10K - 15K", range: [10000, 15000], tip: "Qualité et style assurés 🌟", emoji: "💫" },
    { label: "15K - 20K", range: [15000, 20000], tip: "Des pièces premium 😍", emoji: "👑" },
    { label: "20K+", range: [20001, Infinity], tip: "Pour les coups de cœur ❤️", emoji: "💎" },
  ]

  return (
    <div className="p-5">
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          Quel est ton budget ? 💰
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Trouve les pépites parfaites pour ton porte-monnaie
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-6">
        {ranges.map(({ label, tip, emoji }, i) => (
          <button
            key={i}
            onClick={() => {
              onSelect(i)
              onChange(ranges[i].range)
            }}
            className={`relative p-3 rounded-xl text-sm font-medium transition-all duration-300 group ${selectedIndex === i
              ? "bg-gradient-to-r from-pink-500 to-rose-400 text-white shadow-lg scale-105"
              : "bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-pink-500 hover:to-rose-400 hover:text-white hover:scale-105"
              }`}
          >
            <div className="text-base mb-1">{emoji}</div>
            <div className="font-semibold text-xs">{label}</div>

            <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gray-900 dark:bg-gray-700 text-white text-xs px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap z-20">
              {tip}
            </div>
          </button>
        ))}
      </div>

      <div className="flex gap-3">
        <button
          onClick={onClose}
          className="flex-1 py-3 bg-gradient-to-r from-pink-500 to-rose-400 text-white rounded-xl font-semibold hover:from-pink-600 hover:to-rose-500 transition-all duration-300 shadow-lg hover:shadow-xl text-sm"
        >
          Appliquer ✨
        </button>
        <button
          onClick={() => {
            onSelect(0)
            onChange(null)
            onClose()
          }}
          className="px-4 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-300 text-sm"
        >
          Reset
        </button>
      </div>
    </div>
  )
}

export default function FilteredProducts({ products = [], userId = "demo" }: { products?: Product[], userId?: string }) {
  // Mock data pour la démo
  const mockProducts: Product[] = [
    {
      id: 1,
      title: "Robe Hijab Moderne Premium",
      description: "Robe élégante et confortable pour toutes occasions",
      price: 15000,
      image_url: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400"
    },
    {
      id: 2,
      title: "Set Skincare Glow",
      description: "Routine complète pour une peau éclatante",
      price: 8500,
      image_url: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400"
    },
    {
      id: 3,
      title: "Hijab Satin Luxe",
      description: "Voile premium en satin doux",
      price: 4200,
      image_url: "https://images.unsplash.com/photo-1583292650898-7d22cd27ca6f?w=400"
    },
    {
      id: 4,
      title: "Kaftan Brodé Main",
      description: "Pièce unique artisanale",
      price: 25000,
      image_url: "https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=400"
    },
    {
      id: 5,
      title: "Sérum Anti-âge Bio",
      description: "Formule naturelle et efficace",
      price: 12000,
      image_url: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400"
    },
    {
      id: 6,
      title: "Abaya Casual Chic",
      description: "Style décontracté pour le quotidien",
      price: 18000,
      image_url: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=400"
    }
  ]

  const displayProducts = products.length > 0 ? products : mockProducts

  const [priceRange, setPriceRange] = useState<[number, number] | null>(null)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [filterOpen, setFilterOpen] = useState(false)
  const [showOnboarding, setShowOnboarding] = useState(true)
  const [loading, setLoading] = useState(true)
  const [displayedCount, setDisplayedCount] = useState(8)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [showScrollToTop, setShowScrollToTop] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1200)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollToTop(window.scrollY > 400)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const dismissOnboarding = () => {
    setShowOnboarding(false)
  }

  const filteredProducts = displayProducts.filter(p =>
    !priceRange || (p.price >= priceRange[0] && p.price <= priceRange[1])
  )

  const displayedProducts = filteredProducts.slice(0, displayedCount)
  const hasMoreProducts = filteredProducts.length > displayedCount

  useEffect(() => {
    setDisplayedCount(8)
  }, [priceRange])

  const handleLoadMore = () => {
    setIsLoadingMore(true)
    setTimeout(() => {
      setDisplayedCount(prev => Math.min(prev + 6, filteredProducts.length))
      setIsLoadingMore(false)
    }, 800)
  }

  const handleShare = () => {
    const message = encodeURIComponent("Coucou ! 🌸 Découvre cette nouvelle plateforme de mode féminine, hijabs, skincare et + : https://sangse.shop — rejoins-nous !")
    window.open(`https://wa.me/?text=${message}`, "_blank")
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const getFilterLabel = () => {
    if (selectedIndex === 0) return "Tous les prix"
    const ranges = [
      null, "500-3K", "3K-7K", "7K-10K", "10K-15K", "15K-20K", "20K+"
    ]
    return ranges[selectedIndex]
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-25 via-white to-rose-25 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      {/* Sticky header with improved mobile layout */}
      <div className="sticky top-0 z-40 bg-white/98 dark:bg-gray-900/98 backdrop-blur-xl border-b border-gray-100 dark:border-gray-800 shadow-sm">
        <div className="px-3 py-3">
          {/* Mobile version - Horizontal alignment */}
          <div className="flex gap-2 sm:hidden">
            <button
              onClick={handleShare}
              className="flex-1 h-11 bg-gradient-to-r from-pink-500 via-rose-400 to-pink-500 text-white rounded-xl font-semibold shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] text-sm"
            >
              <Share2 size={16} />
              <span>Invite une amie</span>
              <Gift size={14} className="animate-pulse" />
            </button>

            <button
              onClick={() => setFilterOpen(true)}
              className="flex-1 h-11 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-semibold shadow-sm hover:shadow-md transition-all duration-300 flex items-center justify-center gap-2 hover:border-pink-300 dark:hover:border-pink-600 text-sm"
            >
              <Filter size={16} />
              <span className="truncate">{getFilterLabel()}</span>
              {priceRange && <Zap size={12} className="text-pink-500" />}
            </button>
          </div>

          {/* Desktop version */}
          <div className="hidden sm:flex items-center justify-between gap-4">
            <button
              onClick={handleShare}
              className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-400 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              <Share2 size={18} />
              <span>Invite une amie</span>
              <Gift size={16} className="animate-pulse" />
            </button>

            <button
              onClick={() => setFilterOpen(true)}
              className="flex items-center gap-3 px-6 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-semibold shadow-sm hover:shadow-md transition-all duration-300 hover:border-pink-300"
            >
              <Filter size={18} />
              <span>Filtrer par prix</span>
              {priceRange && <Zap size={14} className="text-pink-500" />}
            </button>
          </div>
        </div>
      </div>

      <div className="px-3 pb-20">
        {/* Enhanced onboarding */}
        {showOnboarding && (
          <div className="mt-4 mb-6">
            <div className="relative bg-gradient-to-br from-pink-500 via-rose-400 to-pink-600 text-white rounded-2xl p-5 shadow-xl overflow-hidden animate-slide-in-down">
              <div className="absolute -top-4 -right-4 w-16 h-16 bg-white/10 rounded-full animate-pulse" />
              <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-white/10 rounded-full animate-pulse" />

              <div className="relative z-10">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                      <Users size={20} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold">Gagne de l'argent ! 💰</h3>
                      <p className="text-white/90 text-sm">Depuis chez toi, facilement</p>
                    </div>
                  </div>
                  <button
                    onClick={dismissOnboarding}
                    className="w-7 h-7 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>

                <p className="text-white/95 text-sm mb-4 leading-relaxed">
                  Ouvre ta boutique <span className="font-semibold">gratuitement</span> et commence à vendre en quelques clics.
                </p>

                <button
                  onClick={dismissOnboarding}
                  className="w-full py-3 bg-white text-pink-600 rounded-xl font-bold hover:bg-gray-50 transition-all duration-300 shadow-lg hover:shadow-xl text-sm"
                >
                  🚀 Commencer à vendre
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Compact stats */}
        <div className="grid grid-cols-3 gap-2 mb-6">
          <div className="bg-white dark:bg-gray-900 rounded-xl p-3 text-center shadow-sm border border-gray-100 dark:border-gray-800">
            <div className="text-lg font-bold text-pink-600 dark:text-pink-400">2.4K+</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Produits</div>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl p-3 text-center shadow-sm border border-gray-100 dark:border-gray-800">
            <div className="text-lg font-bold text-rose-600 dark:text-rose-400">850+</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Clientes</div>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl p-3 text-center shadow-sm border border-gray-100 dark:border-gray-800">
            <div className="text-lg font-bold text-purple-600 dark:text-purple-400">4.9★</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Satisfaction</div>
          </div>
        </div>

        {/* Results header */}
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {priceRange ? `${filteredProducts.length} produits` : 'Nos coups de cœur'}
            </h2>
            {filteredProducts.length > 0 && (
              <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">
                {displayedCount}/{filteredProducts.length}
              </div>
            )}
          </div>
          {priceRange && (
            <button
              onClick={() => {
                setPriceRange(null)
                setSelectedIndex(0)
              }}
              className="mt-2 text-sm text-pink-600 dark:text-pink-400 hover:text-pink-700 dark:hover:text-pink-300 transition-colors"
            >
              ✨ Voir tous les produits
            </button>
          )}
        </div>

        {/* Products grid */}
        {loading ? (
          <ProductCardSkeletonGrid count={8} />
        ) : filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in">
            <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-full flex items-center justify-center mb-4">
              <ShoppingBag size={28} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Aucun produit trouvé
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4 max-w-sm text-sm">
              Essaie un autre budget ou découvre tous nos produits
            </p>
            <button
              onClick={() => {
                setPriceRange(null)
                setSelectedIndex(0)
              }}
              className="px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-400 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
            >
              🔄 Voir tous les produits
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3 mb-10">
              {displayedProducts.map((product, index) => (
                <ProductCard key={product.id} product={product} userId={userId} index={index} />
              ))}
            </div>

            {/* Load more button */}
            {hasMoreProducts && (
              <div className="text-center space-y-3">
                <button
                  onClick={handleLoadMore}
                  disabled={isLoadingMore}
                  className="group relative w-full max-w-sm mx-auto h-12 bg-gradient-to-r from-pink-500 to-rose-400 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-500 hover:scale-105 disabled:opacity-75 disabled:cursor-not-allowed overflow-hidden"
                >
                  <div className="relative z-10 flex items-center justify-center gap-2">
                    {isLoadingMore ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span className="text-sm">Chargement...</span>
                      </>
                    ) : (
                      <>
                        <span className="group-hover:animate-bounce">✨</span>
                        <span className="text-sm">Voir {Math.min(6, filteredProducts.length - displayedCount)} produits de plus</span>
                        <span className="group-hover:animate-bounce">🛍️</span>
                      </>
                    )}
                  </div>

                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                </button>

                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Encore plein de pépites à découvrir ! 💎
                </p>
              </div>
            )}

            {/* End message */}
            {!hasMoreProducts && filteredProducts.length > 8 && (
              <div className="text-center py-6 animate-fade-in">
                <div className="w-12 h-12 bg-gradient-to-br from-pink-100 to-rose-100 dark:from-pink-900 dark:to-rose-900 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-xl">🎉</span>
                </div>
                <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2">
                  Tu as tout vu !
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                  Reviens bientôt pour nos nouveautés
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Floating scroll to top */}
      {showScrollToTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-20 right-4 w-10 h-10 bg-gradient-to-r from-pink-500 to-rose-400 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 flex items-center justify-center z-30 animate-bounce-in"
        >
          <ArrowUp size={16} />
        </button>
      )}

      {/* Enhanced price filter dialog */}
      <Dialog open={filterOpen} onOpenChange={setFilterOpen}>
        <DialogContent className="w-[95vw] max-w-md mx-auto rounded-2xl p-0 overflow-hidden border-0 shadow-2xl">
          <div className="bg-gradient-to-br from-pink-50 to-rose-50 dark:from-gray-900 dark:to-gray-800">
            <PriceFilter
              onChange={(range) => {
                setPriceRange(range)
                setFilterOpen(false)
              }}
              selectedIndex={selectedIndex}
              onSelect={setSelectedIndex}
              onClose={() => setFilterOpen(false)}
            />
          </div>
        </DialogContent>
      </Dialog>

      <style jsx>{`
        @keyframes fade-in-scale {
          from {
            opacity: 0;
            transform: scale(0.9) translateY(20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        
        @keyframes slide-in-down {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes bounce-in {
          from {
            opacity: 0;
            transform: scale(0.3);
          }
          50% {
            opacity: 1;
            transform: scale(1.1);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        @keyframes pulse-slow {
          0%, 100% {
            transform: translateX(-100%);
          }
          50% {
            transform: translateX(100%);
          }
        }
        
        .animate-fade-in-scale {
          animation: fade-in-scale 0.6s ease-out both;
        }
        
        .animate-slide-in-down {
          animation: slide-in-down 0.5s ease-out;
        }
        
        .animate-fade-in {
          animation: fade-in 0.4s ease-out;
        }
        
        .animate-bounce-in {
          animation: bounce-in 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }
        
        .animate-pulse-slow {
          animation: pulse-slow 2s ease-in-out infinite;
        }
        
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        /* Custom scrollbar for webkit browsers */
        ::-webkit-scrollbar {
          width: 6px;
        }
        
        ::-webkit-scrollbar-track {
          background: transparent;
        }
        
        ::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #ec4899, #f43f5e);
          border-radius: 10px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #db2777, #e11d48);
        }
        
        /* Smooth focus styles */
        button:focus-visible {
          outline: 2px solid #ec4899;
          outline-offset: 2px;
        }
        
        /* Enhanced hover effects */
        .group:hover .group-hover\\:scale-105 {
          transform: scale(1.05);
        }
        
        .group:hover .group-hover\\:translate-y-0 {
          transform: translateY(0);
        }
        
        /* Better touch targets for mobile */
        @media (max-width: 640px) {
          button {
            min-height: 44px;
          }
        }
        
        /* Improved gradient backgrounds */
        .bg-gradient-to-br {
          background-attachment: fixed;
        }
        
        /* Loading animation improvements */
        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: .7;
          }
        }
        
        /* Enhanced backdrop blur */
        .backdrop-blur-xl {
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
        }
        
        .backdrop-blur-sm {
          backdrop-filter: blur(4px);
          -webkit-backdrop-filter: blur(4px);
        }
        
        /* Better shadow variations */
        .shadow-soft {
          box-shadow: 0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04);
        }
        
        /* Improved text rendering */
        * {
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }
        
        /* Better dark mode transitions */
        .dark * {
          transition: background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease;
        }
        
        /* Custom pink variations for better UX */
        .text-pink-25 { color: #fef7f7; }
        .bg-pink-25 { background-color: #fef7f7; }
        .from-pink-25 { --tw-gradient-from: #fef7f7; }
        .to-rose-25 { --tw-gradient-to: #fef2f2; }
        
        /* Performance optimizations */
        .gpu-accelerated {
          transform: translate3d(0, 0, 0);
          will-change: transform;
        }
        
        /* Improved touch feedback */
        .active\\:scale-\\[0\\.98\\]:active {
          transform: scale(0.98);
        }
        
        /* Better loading states */
        .loading-shimmer {
          background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
        }
        
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
    </div>
  )
}