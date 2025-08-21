'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { FaChevronLeft, FaChevronRight, FaExpand, FaTimes, FaHeart, FaUserCheck } from 'react-icons/fa'
import { HiSparkles } from 'react-icons/hi2'

interface ProductImageCarouselProps {
  images: string[]
  productTitle: string
  isNew?: boolean
}

export default function ProductImageCarousel({ 
  images, 
  productTitle, 
  isNew = false 
}: ProductImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isZoomed, setIsZoomed] = useState(false)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying || images.length <= 1) return

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === images.length - 1 ? 0 : prevIndex + 1
      )
    }, 4000)

    return () => clearInterval(interval)
  }, [isAutoPlaying, images.length])

  const goToPrevious = () => {
    setCurrentIndex(currentIndex === 0 ? images.length - 1 : currentIndex - 1)
    setIsAutoPlaying(false)
  }

  const goToNext = () => {
    setCurrentIndex(currentIndex === images.length - 1 ? 0 : currentIndex + 1)
    setIsAutoPlaying(false)
  }

  const goToSlide = (index: number) => {
    setCurrentIndex(index)
    setIsAutoPlaying(false)
  }

  const openZoom = () => {
    setIsZoomed(true)
    setIsAutoPlaying(false)
  }

  const closeZoom = () => {
    setIsZoomed(false)
  }

  // Touch handlers for mobile swipe
  const minSwipeDistance = 50

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance

    if (isLeftSwipe) {
      goToNext()
    } else if (isRightSwipe) {
      goToPrevious()
    }
  }

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') goToPrevious()
      if (e.key === 'ArrowRight') goToNext()
      if (e.key === 'Escape') closeZoom()
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [currentIndex])

  if (!images || images.length === 0) {
    return (
      <div className="relative w-full h-[600px] rounded-3xl overflow-hidden bg-gray-200 dark:bg-gray-800 flex items-center justify-center">
        <p className="text-gray-500 dark:text-gray-400">Aucune image disponible</p>
      </div>
    )
  }

  return (
    <>
      {/* Carousel Principal */}
      <div className="space-y-6">
        <div className="relative group">
          {/* Effet de halo coloré */}
          <div className="absolute -inset-4 bg-gradient-to-r from-[#D29587]/20 via-[#E6B8A2]/20 to-[#D29587]/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

          {/* Container principal */}
          <div 
            className="relative w-full h-[600px] rounded-3xl overflow-hidden shadow-2xl bg-white/50 backdrop-blur-sm border border-white/20 cursor-pointer"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
            onClick={openZoom}
          >
            {/* Image principale */}
            <Image
              src={images[currentIndex] || "/placeholder.jpg"}
              alt={`${productTitle} - Image ${currentIndex + 1}`}
              fill
              className="object-cover transition-all duration-1000 ease-out group-hover:scale-110"
              priority={currentIndex === 0}
              quality={90}
            />

            {/* Overlay gradiant */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

            {/* Badges flottants */}
            <div className="absolute top-6 left-6 flex flex-col gap-3 z-20">
              {isNew && (
                <div className="flex items-center bg-gradient-to-r from-green-400 to-emerald-500 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg animate-pulse">
                  <HiSparkles className="mr-2 text-base" />
                  Nouveau
                </div>
              )}

              <div className="flex items-center bg-gradient-to-r from-[#D29587] to-[#E6B8A2] text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                <FaUserCheck className="mr-2" />
                Contact direct
              </div>

              {/* Compteur d'images */}
              {images.length > 1 && (
                <div className="bg-black/60 text-white px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm">
                  {currentIndex + 1} / {images.length}
                </div>
              )}
            </div>

            {/* Boutons de navigation */}
            {images.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    goToPrevious()
                  }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 p-3 rounded-full shadow-lg backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 z-20"
                  aria-label="Image précédente"
                >
                  <FaChevronLeft className="text-lg" />
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    goToNext()
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 p-3 rounded-full shadow-lg backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 z-20"
                  aria-label="Image suivante"
                >
                  <FaChevronRight className="text-lg" />
                </button>
              </>
            )}

            {/* Boutons action en haut à droite */}
            <div className="absolute top-6 right-6 flex flex-col gap-3 z-20">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  // Logique pour ajouter aux favoris
                }}
                className="bg-white/90 backdrop-blur-md p-3 rounded-full shadow-lg hover:bg-white hover:scale-110 transition-all duration-300 group/heart"
                aria-label="Ajouter aux favoris"
              >
                <FaHeart className="text-gray-400 group-hover/heart:text-red-500 transition-colors text-lg" />
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation()
                  openZoom()
                }}
                className="bg-white/90 backdrop-blur-md p-3 rounded-full shadow-lg hover:bg-white hover:scale-110 transition-all duration-300"
                aria-label="Agrandir l'image"
              >
                <FaExpand className="text-gray-600 text-lg" />
              </button>
            </div>

            {/* Indicateurs de progression */}
            {images.length > 1 && (
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20">
                {images.map((_, index) => (
                  <button
                    key={index}
                    onClick={(e) => {
                      e.stopPropagation()
                      goToSlide(index)
                    }}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      index === currentIndex
                        ? 'w-8 bg-white shadow-lg'
                        : 'w-2 bg-white/50 hover:bg-white/80'
                    }`}
                    aria-label={`Aller à l'image ${index + 1}`}
                  />
                ))}
              </div>
            )}

            {/* Indicateur de disponibilité */}
            <div className="absolute bottom-6 right-6 bg-green-500/90 backdrop-blur-md text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg z-20">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-300 rounded-full mr-2 animate-pulse"></div>
                Disponible
              </div>
            </div>
          </div>

          {/* Effet de reflet */}
          <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 w-3/4 h-8 bg-gradient-to-r from-transparent via-[#D29587]/10 to-transparent blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        </div>

        {/* Miniatures (thumbnails) */}
        {images.length > 1 && (
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {images.map((image, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`relative flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden transition-all duration-300 ${
                  index === currentIndex
                    ? 'ring-3 ring-[#D29587] ring-offset-2 ring-offset-white dark:ring-offset-gray-900 scale-110 shadow-lg'
                    : 'hover:scale-105 opacity-70 hover:opacity-100'
                }`}
              >
                <Image
                  src={image || "/placeholder.jpg"}
                  alt={`${productTitle} - Miniature ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="80px"
                />
                {index === currentIndex && (
                  <div className="absolute inset-0 bg-[#D29587]/20"></div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Modal Zoom */}
      {isZoomed && (
        <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4">
          <div className="relative max-w-7xl max-h-full w-full h-full flex items-center justify-center">
            {/* Bouton fermer */}
            <button
              onClick={closeZoom}
              className="absolute top-6 right-6 bg-white/20 hover:bg-white/30 text-white p-3 rounded-full backdrop-blur-sm transition-all duration-300 hover:scale-110 z-50"
              aria-label="Fermer le zoom"
            >
              <FaTimes className="text-xl" />
            </button>

            {/* Navigation dans le zoom */}
            {images.length > 1 && (
              <>
                <button
                  onClick={goToPrevious}
                  className="absolute left-6 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-4 rounded-full backdrop-blur-sm transition-all duration-300 hover:scale-110 z-40"
                  aria-label="Image précédente"
                >
                  <FaChevronLeft className="text-2xl" />
                </button>

                <button
                  onClick={goToNext}
                  className="absolute right-6 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-4 rounded-full backdrop-blur-sm transition-all duration-300 hover:scale-110 z-40"
                  aria-label="Image suivante"
                >
                  <FaChevronRight className="text-2xl" />
                </button>
              </>
            )}

            {/* Image zoomée */}
            <div className="relative w-full h-full flex items-center justify-center">
              <Image
                src={images[currentIndex] || "/placeholder.jpg"}
                alt={`${productTitle} - Image ${currentIndex + 1} (zoomée)`}
                fill
                className="object-contain"
                priority
                quality={100}
              />
            </div>

            {/* Indicateurs en bas */}
            {images.length > 1 && (
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 bg-black/50 px-6 py-3 rounded-full backdrop-blur-sm">
                {images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToSlide(index)}
                    className={`h-3 rounded-full transition-all duration-300 ${
                      index === currentIndex
                        ? 'w-10 bg-white'
                        : 'w-3 bg-white/50 hover:bg-white/80'
                    }`}
                    aria-label={`Aller à l'image ${index + 1}`}
                  />
                ))}
              </div>
            )}

            {/* Compteur d'images */}
            <div className="absolute top-6 left-6 bg-black/50 text-white px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm">
              {currentIndex + 1} / {images.length}
            </div>
          </div>
        </div>
      )}

      {/* Instructions utilisateur (masquées après quelques secondes) */}
      {images.length > 1 && (
        <div className="text-center text-sm text-gray-500 dark:text-gray-400 mt-2">
          <p className="flex items-center justify-center gap-2">
            <span>🖱️ Cliquez pour agrandir</span>
            <span className="hidden sm:inline">• ⌨️ Utilisez ←→ pour naviguer</span>
            <span className="sm:hidden">• 👆 Glissez pour naviguer</span>
          </p>
        </div>
      )}

      <style jsx global>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </>
  )
}