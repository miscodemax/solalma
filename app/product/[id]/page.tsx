'use client'

import { useState } from 'react'
import Image from 'next/image'
import { FaChevronLeft, FaChevronRight, FaExpand, FaTimes, FaHeart, FaUserCheck } from 'react-icons/fa'
import { HiSparkles } from 'react-icons/hi2'

interface ProductGalleryProps {
  images: string[]
  productTitle: string
  isNew?: boolean
}

export default function ProductGallery({ images, productTitle, isNew }: ProductGalleryProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isZoomOpen, setIsZoomOpen] = useState(false)

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length)
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  const goToImage = (index: number) => {
    setCurrentImageIndex(index)
  }

  return (
    <>
      <div className="space-y-4">
        {/* Image principale avec navigation */}
        <div className="relative group">
          {/* Effet de halo coloré autour de l'image */}
          <div className="absolute -inset-4 bg-gradient-to-r from-[#D29587]/20 via-[#E6B8A2]/20 to-[#D29587]/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

          {/* Container principal de l'image */}
          <div className="relative w-full h-[600px] rounded-3xl overflow-hidden shadow-2xl bg-white/50 backdrop-blur-sm border border-white/20">
            <Image
              src={images[currentImageIndex]}
              alt={`${productTitle} - Image ${currentImageIndex + 1}`}
              fill
              className="object-cover transition-all duration-700 ease-out group-hover:scale-105"
              priority
            />

            {/* Overlay gradiant subtil */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

            {/* Badges flottants */}
            <div className="absolute top-6 left-6 flex flex-col gap-3">
              {isNew && (
                <div className="flex items-center bg-gradient-to-r from-green-400 to-emerald-500 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg animate-bounce">
                  <HiSparkles className="mr-2 text-base" />
                  Nouveau
                </div>
              )}

              <div className="flex items-center bg-gradient-to-r from-[#D29587] to-[#E6B8A2] text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                <FaUserCheck className="mr-2" />
                Contact direct
              </div>
            </div>

            {/* Boutons d'action */}
            <div className="absolute top-6 right-6 flex flex-col gap-3">
              {/* Bouton coeur */}
              <button className="bg-white/90 backdrop-blur-md p-3 rounded-full shadow-lg hover:bg-white hover:scale-110 transition-all duration-300 group">
                <FaHeart className="text-gray-400 group-hover:text-red-500 transition-colors text-lg" />
              </button>

              {/* Bouton zoom */}
              <button
                onClick={() => setIsZoomOpen(true)}
                className="bg-white/90 backdrop-blur-md p-3 rounded-full shadow-lg hover:bg-white hover:scale-110 transition-all duration-300 group"
              >
                <FaExpand className="text-gray-600 group-hover:text-[#D29587] transition-colors text-lg" />
              </button>
            </div>

            {/* Navigation arrows - Affichées seulement s'il y a plusieurs images */}
            {images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-md p-3 rounded-full shadow-lg hover:bg-white hover:scale-110 transition-all duration-300 opacity-0 group-hover:opacity-100"
                >
                  <FaChevronLeft className="text-gray-700 text-lg" />
                </button>

                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-md p-3 rounded-full shadow-lg hover:bg-white hover:scale-110 transition-all duration-300 opacity-0 group-hover:opacity-100"
                >
                  <FaChevronRight className="text-gray-700 text-lg" />
                </button>
              </>
            )}

            {/* Indicateur du nombre d'images */}
            {images.length > 1 && (
              <div className="absolute bottom-6 left-6 bg-black/70 backdrop-blur-md text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg">
                {currentImageIndex + 1} / {images.length}
              </div>
            )}

            {/* Indicateur de disponibilité */}
            <div className="absolute bottom-6 right-6 bg-green-500/90 backdrop-blur-md text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-300 rounded-full mr-2 animate-pulse"></div>
                Disponible
              </div>
            </div>
          </div>

          {/* Effet de reflet sous l'image */}
          <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 w-3/4 h-8 bg-gradient-to-r from-transparent via-[#D29587]/10 to-transparent blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        </div>

        {/* Miniatures - Affichées seulement s'il y a plusieurs images */}
        {images.length > 1 && (
          <div className="flex gap-3 overflow-x-auto pb-2">
            {images.map((image, index) => (
              <button
                key={index}
                onClick={() => goToImage(index)}
                className={`relative flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden transition-all duration-300 ${index === currentImageIndex
                    ? 'ring-3 ring-[#D29587] ring-offset-2 ring-offset-white scale-110 shadow-lg'
                    : 'hover:scale-105 opacity-70 hover:opacity-100'
                  }`}
              >
                <Image
                  src={image}
                  alt={`${productTitle} - Miniature ${index + 1}`}
                  fill
                  className="object-cover"
                />

                {/* Overlay pour l'image active */}
                {index === currentImageIndex && (
                  <div className="absolute inset-0 bg-[#D29587]/20"></div>
                )}
              </button>
            ))}
          </div>
        )}

        {/* Indicateurs en points (style moderne) */}
        {images.length > 1 && (
          <div className="flex justify-center gap-2 pt-2">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => goToImage(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${index === currentImageIndex
                    ? 'bg-[#D29587] w-8'
                    : 'bg-gray-300 hover:bg-gray-400'
                  }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modal de zoom plein écran */}
      {isZoomOpen && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full h-full flex items-center justify-center">
            {/* Bouton fermer */}
            <button
              onClick={() => setIsZoomOpen(false)}
              className="absolute top-6 right-6 bg-white/10 backdrop-blur-md text-white p-3 rounded-full hover:bg-white/20 transition-all duration-300 z-10"
            >
              <FaTimes className="text-xl" />
            </button>

            {/* Image en plein écran */}
            <div className="relative w-full h-full max-w-6xl max-h-[90vh]">
              <Image
                src={images[currentImageIndex]}
                alt={`${productTitle} - Vue agrandie`}
                fill
                className="object-contain"
                quality={100}
              />
            </div>

            {/* Navigation dans le modal - si plusieurs images */}
            {images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-6 top-1/2 -translate-y-1/2 bg-white/10 backdrop-blur-md text-white p-4 rounded-full hover:bg-white/20 transition-all duration-300"
                >
                  <FaChevronLeft className="text-2xl" />
                </button>

                <button
                  onClick={nextImage}
                  className="absolute right-6 top-1/2 -translate-y-1/2 bg-white/10 backdrop-blur-md text-white p-4 rounded-full hover:bg-white/20 transition-all duration-300"
                >
                  <FaChevronRight className="text-2xl" />
                </button>
              </>
            )}

            {/* Indicateur de position dans le modal */}
            {images.length > 1 && (
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-md text-white px-6 py-3 rounded-full text-lg font-medium">
                {currentImageIndex + 1} / {images.length}
              </div>
            )}

            {/* Miniatures en bas du modal */}
            {images.length > 1 && images.length <= 10 && (
              <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex gap-2 bg-black/30 backdrop-blur-md p-3 rounded-2xl">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => goToImage(index)}
                    className={`relative w-12 h-12 rounded-lg overflow-hidden transition-all duration-300 ${index === currentImageIndex
                        ? 'ring-2 ring-white scale-110'
                        : 'opacity-60 hover:opacity-100 hover:scale-105'
                      }`}
                  >
                    <Image
                      src={image}
                      alt={`Miniature ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}