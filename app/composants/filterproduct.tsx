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



export default function FilteredProducts({ products = [], userId = 'demo' }) {
  // Mock data pour la démo
  const mockProducts = [
    { id: 1, title: 'Robe Hijab Moderne Premium', description: 'Robe élégante et confortable pour toutes occasions', price: 15000, image_url: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400' },
    { id: 2, title: 'Set Skincare Glow', description: 'Routine complète pour une peau éclatante', price: 8500, image_url: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400' },
    { id: 3, title: 'Hijab Satin Luxe', description: 'Voile premium en satin doux', price: 4200, image_url: 'https://images.unsplash.com/photo-1583292650898-7d22cd27ca6f?w=400' },
    { id: 4, title: 'Kaftan Brodé Main', description: 'Pièce unique artisanale', price: 25000, image_url: 'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=400' },
    { id: 5, title: "Sérum Anti-âge Bio", description: 'Formule naturelle et efficace', price: 12000, image_url: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400' },
    { id: 6, title: 'Abaya Casual Chic', description: 'Style décontracté pour le quotidien', price: 18000, image_url: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=400' }
  ]

  const displayProducts = products.length > 0 ? products : mockProducts

  const [priceRange, setPriceRange] = useState(null)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [filterOpen, setFilterOpen] = useState(false)
  const [showOnboarding, setShowOnboarding] = useState(true)
  const [loading, setLoading] = useState(true)
  const [displayedCount, setDisplayedCount] = useState(8)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [showScrollToTop, setShowScrollToTop] = useState(false)

  // Respecter palette Sangse
  const BRAND = {
    blue: '#1E3A8A',
    orange: '#F97316',
    gray: '#F3F4F6',
    green: '#10B981',
    black: '#111827'
  }

  // loader simulation
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 900)
    return () => clearTimeout(timer)
  }, [])

  // scroll to top visibility
  useEffect(() => {
    const handleScroll = () => setShowScrollToTop(window.scrollY > 400)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // adapt initial displayedCount by screen size (desktop shows more items without touching product card size)
  useEffect(() => {
    const setByWidth = () => {
      const w = window.innerWidth
      if (w >= 1024) setDisplayedCount(12)
      else if (w >= 768) setDisplayedCount(9)
      else setDisplayedCount(8)
    }
    setByWidth()
    window.addEventListener('resize', setByWidth)
    return () => window.removeEventListener('resize', setByWidth)
  }, [])

  const dismissOnboarding = () => setShowOnboarding(false)

  const filteredProducts = displayProducts.filter(p => !priceRange || (p.price >= priceRange[0] && p.price <= priceRange[1]))
  const displayedProducts = filteredProducts.slice(0, displayedCount)
  const hasMoreProducts = filteredProducts.length > displayedCount

  useEffect(() => {
    // when changing filters, reset count to a sensible number for the current viewport
    const w = window.innerWidth
    setDisplayedCount(w >= 1024 ? 12 : w >= 768 ? 9 : 8)
  }, [priceRange])

  const handleLoadMore = () => {
    setIsLoadingMore(true)
    setTimeout(() => {
      setDisplayedCount(prev => Math.min(prev + 6, filteredProducts.length))
      setIsLoadingMore(false)
    }, 700)
  }

  const handleShare = () => {
    const message = encodeURIComponent("Coucou ! 🌸 Découvre Sangse : https://sangse.shop — rejoins-nous !")
    window.open(`https://wa.me/?text=${message}`, '_blank')
  }

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })

  const getFilterLabel = () => {
    if (selectedIndex === 0) return 'Tous les prix'
    const ranges = [null, '500-3K', '3K-7K', '7K-10K', '10K-15K', '15K-20K', '20K+']
    return ranges[selectedIndex]
  }

  return (
    <div className="min-h-screen pt-6" style={{ backgroundColor: BRAND.gray }}>
      {/* Sticky header */}
      <div className="sticky top-0 z-40 bg-white/98 backdrop-blur-sm border-b border-gray-200 shadow-sm">
        <div className="px-4 py-3 max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Left - actions (mobile compressed) */}
          <div className="flex-1 sm:hidden flex gap-2">
            <button onClick={handleShare} className="flex-1 h-11 rounded-xl font-semibold shadow-md flex items-center justify-center gap-2 text-white" style={{ background: `linear-gradient(90deg, ${BRAND.blue}, ${BRAND.orange})` }}>
              <Share2 size={16} />
              <span className="text-sm">Invite une amie</span>
              <Gift size={14} className="animate-pulse" />
            </button>

            <button onClick={() => setFilterOpen(true)} className="flex-1 h-11 rounded-xl font-semibold shadow-sm flex items-center justify-center gap-2 border border-gray-200 bg-white text-gray-700">
              <Filter size={16} />
              <span className="truncate text-sm">{getFilterLabel()}</span>
              {priceRange && <Zap size={12} className="text-green-500" />}
            </button>
          </div>

          {/* Desktop actions */}
          <div className="hidden sm:flex items-center justify-between w-full">
            <div className="flex gap-3">
              <button onClick={handleShare} className="flex items-center gap-3 px-5 py-3 rounded-xl font-semibold shadow-lg text-white" style={{ background: `linear-gradient(90deg, ${BRAND.blue}, ${BRAND.orange})` }}>
                <Share2 size={18} />
                <span>Invite une amie</span>
                <Gift size={16} className="animate-pulse" />
              </button>

              <button onClick={() => setFilterOpen(true)} className="flex items-center gap-3 px-5 py-3 rounded-xl font-semibold shadow-sm bg-white border border-gray-200 text-gray-700">
                <Filter size={18} />
                <span>Filtrer par prix</span>
                {priceRange && <Zap size={14} className="text-green-500" />}
              </button>
            </div>

            {/* simple search placeholder (keeps header balanced) */}
            <div className="hidden lg:flex items-center gap-3">
              <div className="text-sm text-gray-600">Marché • Mode • Beauté</div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 pb-20 max-w-7xl mx-auto">
        {/* Onboarding - plus vivant avec emojis (respect palette) */}
        {showOnboarding && (
          <div className="mt-4 mb-6">
            <div className="relative rounded-2xl p-5 shadow-xl overflow-hidden" style={{ background: `linear-gradient(135deg, ${BRAND.blue}, ${BRAND.orange})`, color: 'white' }}>
              <div className="absolute -top-6 -right-6 w-20 h-20 bg-white/10 rounded-full animate-pulse" />
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                      <Users size={20} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold">Vends facilement 🚀</h3>
                      <p className="text-white/90 text-sm">Ouvre ta boutique et commence à vendre aujourd'hui</p>
                    </div>
                  </div>

                  <button onClick={dismissOnboarding} className="w-7 h-7 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors">
                    <X size={16} />
                  </button>
                </div>

                <p className="text-white/95 text-sm mb-4 leading-relaxed">Crée ta boutique en moins de 2 minutes. 📱 Prends des photos, fixe ton prix et partage sur WhatsApp.</p>

                <div className="flex gap-3">
                  <button onClick={dismissOnboarding} className="flex-1 py-3 rounded-xl font-bold shadow-lg text-sm" style={{ background: '#ffffff', color: BRAND.blue }}>
                    ✅ Commencer
                  </button>
                  <button onClick={() => { window.scrollTo({ top: 600, behavior: 'smooth' }) }} className="py-3 px-4 rounded-xl font-semibold text-sm" style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.18)', color: 'white' }}>
                    ℹ️ En savoir plus
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Results header */}
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold" style={{ color: BRAND.black }}>{priceRange ? `${filteredProducts.length} produits` : 'Nos coups de cœur'}</h2>
            {filteredProducts.length > 0 && (
              <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">{displayedCount}/{filteredProducts.length}</div>
            )}
          </div>
          {priceRange && (
            <button onClick={() => { setPriceRange(null); setSelectedIndex(0) }} className="mt-2 text-sm text-blue-700 hover:text-blue-800 transition-colors">✨ Voir tous les produits</button>
          )}
        </div>

        {/* Products grid - mobile: Vinted-like (2 cols). Desktop: compact grid without changing card size */}
        {loading ? (
          <ProductCardSkeletonGrid count={8} />
        ) : filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-4">
              <ShoppingBag size={28} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold" style={{ color: BRAND.black }}>Aucun produit trouvé</h3>
            <p className="text-gray-600 max-w-sm text-sm mb-4">Essaie un autre budget ou découvre tous nos produits</p>
            <button onClick={() => { setPriceRange(null); setSelectedIndex(0) }} className="px-6 py-3 rounded-xl font-semibold text-white" style={{ background: `linear-gradient(90deg, ${BRAND.blue}, ${BRAND.orange})` }}>🔄 Voir tous les produits</button>
          </div>
        ) : (
          <>
            {/* Center grid and constrain width so cards don't stretch too large on wide desktop */}
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-10">
              {displayedProducts.map((product, index) => (
                <div key={product.id} className="w-full flex justify-center">
                  {/* wrapped to avoid full-bleed stretching; ProductCard internal size stays untouched */}
                  <div className="w-full max-w-[320px]">
                    <ProductCard product={product} userId={userId} index={index} />
                  </div>
                </div>
              ))}
            </div>

            {/* Load more button */}
            {hasMoreProducts && (
              <div className="text-center space-y-3">
                <button onClick={handleLoadMore} disabled={isLoadingMore} className="relative w-full max-w-sm mx-auto h-12 rounded-2xl font-semibold text-white" style={{ background: `linear-gradient(90deg, ${BRAND.blue}, ${BRAND.orange})` }}>
                  <div className="relative z-10 flex items-center justify-center gap-2">
                    {isLoadingMore ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span className="text-sm">Chargement...</span>
                      </>
                    ) : (
                      <>
                        <span>✨</span>
                        <span className="text-sm">Voir {Math.min(6, filteredProducts.length - displayedCount)} produits de plus</span>
                        <span>🛍️</span>
                      </>
                    )}
                  </div>
                </button>

                <p className="text-xs text-gray-500">Encore plein de pépites à découvrir ! 💎</p>
              </div>
            )}

            {/* End message */}
            {!hasMoreProducts && filteredProducts.length > 8 && (
              <div className="text-center py-6">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-xl">🎉</span>
                </div>
                <h3 className="text-base font-semibold" style={{ color: BRAND.black }}>Tu as tout vu !</h3>
                <p className="text-gray-600 text-sm mb-3">Reviens bientôt pour nos nouveautés</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Floating scroll to top */}
      {showScrollToTop && (
        <button onClick={scrollToTop} className="fixed bottom-20 right-4 w-10 h-10 rounded-full shadow-lg flex items-center justify-center z-30" style={{ background: `linear-gradient(90deg, ${BRAND.blue}, ${BRAND.orange})`, color: 'white' }}>
          <ArrowUp size={16} />
        </button>
      )}

      {/* Price filter dialog */}
      <Dialog open={filterOpen} onOpenChange={setFilterOpen}>
        <DialogContent className="w-[95vw] max-w-md mx-auto rounded-2xl p-0 overflow-hidden border-0 shadow-2xl">
          <div style={{ backgroundColor: BRAND.gray }}>
            <PriceFilter onChange={(range) => { setPriceRange(range); setFilterOpen(false) }} selectedIndex={selectedIndex} onSelect={setSelectedIndex} onClose={() => setFilterOpen(false)} />
          </div>
        </DialogContent>
      </Dialog>

      <style jsx>{`
        .animate-pulse { animation: pulse 2s cubic-bezier(0.4,0,0.6,1) infinite; }
        @keyframes pulse { 0%,100%{opacity:1}50%{opacity:.7} }
      `}</style>
    </div>
  )
}
