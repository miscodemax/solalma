'use client'
import { useEffect, useState, useRef } from "react"
import { Heart, TrendingUp, ChevronLeft, ChevronRight, Flame } from 'lucide-react'



export default function PopularProductsCarousel({ products }: { products: any[] }) {
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
              <div key={product.id + index} className="flex-shrink-0 w-full relative group/slide">
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