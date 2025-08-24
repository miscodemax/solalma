'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { Swiper, SwiperSlide } from 'swiper/react'
import { FreeMode, Navigation, Thumbs, Pagination } from 'swiper/modules'
import { FaExpand, FaHeart, FaTimes, FaChevronLeft, FaChevronRight } from 'react-icons/fa'
import { HiSparkles } from 'react-icons/hi2'
import 'swiper/css'
import 'swiper/css/free-mode'
import 'swiper/css/navigation'
import 'swiper/css/thumbs'
import 'swiper/css/pagination'

interface ProductImageCarouselProps {
  images?: string[]
  productTitle?: string
  isNew?: boolean
}

export default function ProductImageCarousel({
  images = [],
  productTitle = 'Produit',
  isNew = false,
}: ProductImageCarouselProps) {
  const [thumbsSwiper, setThumbsSwiper] = useState<any>(null)
  const [isZoomed, setIsZoomed] = useState(false)
  const [zoomIndex, setZoomIndex] = useState(0)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isLiked, setIsLiked] = useState(false)
  const [imageErrors, setImageErrors] = useState<{ [key: number]: boolean }>({})
  const mainSwiperRef = useRef<any>(null)

  // Filtrer + fallback si vide
  const validImages =
    images?.filter(img => typeof img === 'string' && img.trim() !== '')?.length > 0
      ? images.filter(img => typeof img === 'string' && img.trim() !== '')
      : ['/placeholder.jpg']

  useEffect(() => {
    setImageErrors({})
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [images])

  const handleImageError = (index: number) => {
    setImageErrors(prev => ({ ...prev, [index]: true }))
  }

  const openZoom = (index: number) => {
    setZoomIndex(index)
    setIsZoomed(true)
    document.body.style.overflow = 'hidden'
  }

  const closeZoom = () => {
    setIsZoomed(false)
    document.body.style.overflow = 'unset'
  }

  const toggleLike = () => setIsLiked(prev => !prev)

  const nextSlide = () => mainSwiperRef.current?.slideNext()
  const prevSlide = () => mainSwiperRef.current?.slidePrev()

  return (
    <div className="w-full space-y-4">
      {/* CARROUSEL PRINCIPAL */}
      <div className="relative group">
        <Swiper
          onSwiper={(swiper) => (mainSwiperRef.current = swiper)}
          loop={validImages.length > 1}
          spaceBetween={0}
          thumbs={{ swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null }}
          onSlideChange={(swiper) => setCurrentSlide(swiper.realIndex)}
          modules={[FreeMode, Navigation, Thumbs, Pagination]}
          className="rounded-2xl shadow-lg overflow-hidden w-full"
          pagination={{ clickable: true, dynamicBullets: true }}
        >
          {validImages.map((img, index) => {
            const showError = imageErrors[index]
            return (
              <SwiperSlide key={index}>
                <div
                  className="relative w-full aspect-[4/5] bg-white dark:bg-gray-100 cursor-pointer overflow-hidden"
                  onClick={() => openZoom(index)}
                >
                  {!showError ? (
                    <Image
                      src={img || '/placeholder.jpg'}
                      alt={`${productTitle || 'Produit'} - Image ${index + 1}`}
                      fill
                      className="object-contain transition-transform duration-300 hover:scale-105"
                      priority={index === 0}
                      quality={85}
                      onError={() => handleImageError(index)}
                      sizes="100vw"
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-200">
                      <p className="text-xs text-gray-500">Image non disponible</p>
                    </div>
                  )}

                  {/* BADGE NOUVEAU */}
                  {isNew && (
                    <div className="absolute top-3 left-3 z-20 flex items-center bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-3 py-1.5 rounded-full text-xs font-semibold shadow-md">
                      <HiSparkles className="mr-1.5 text-sm" />
                      Nouveau
                    </div>
                  )}

                  {/* ACTIONS */}
                  <div className="absolute top-3 right-3 flex flex-col gap-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleLike()
                      }}
                      className="bg-white/95 backdrop-blur-sm p-2.5 rounded-full shadow-md hover:scale-110 transition-all duration-200"
                    >
                      <FaHeart className={`text-sm transition-colors ${isLiked ? 'text-blue-500' : 'text-gray-400 hover:text-blue-400'}`} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        openZoom(index)
                      }}
                      className="bg-white/95 backdrop-blur-sm p-2.5 rounded-full shadow-md hover:scale-110 transition-all duration-200"
                    >
                      <FaExpand className="text-gray-600 text-sm" />
                    </button>
                  </div>

                  {/* FLECHES */}
                  {validImages.length > 1 && (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          prevSlide()
                        }}
                        className="absolute left-3 top-1/2 -translate-y-1/2 z-20 bg-white/90 hover:bg-white p-2.5 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110"
                      >
                        <FaChevronLeft className="text-gray-700 text-sm" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          nextSlide()
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 z-20 bg-white/90 hover:bg-white p-2.5 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110"
                      >
                        <FaChevronRight className="text-gray-700 text-sm" />
                      </button>
                    </>
                  )}
                </div>
              </SwiperSlide>
            )
          })}
        </Swiper>

        {/* INDICATEUR */}
        {validImages.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 bg-black/60 text-white px-3 py-1 rounded-full text-xs font-medium">
            {currentSlide + 1} / {validImages.length}
          </div>
        )}
      </div>

      {/* MINIATURES */}
      {validImages.length > 1 && (
        <Swiper
          onSwiper={setThumbsSwiper}
          spaceBetween={8}
          slidesPerView={4}
          freeMode
          watchSlidesProgress
          modules={[FreeMode, Thumbs]}
          breakpoints={{ 480: { slidesPerView: 5 }, 640: { slidesPerView: 6 } }}
          className="!px-0"
        >
          {validImages.map((img, index) => (
            <SwiperSlide key={index} className="cursor-pointer">
              <div
                className={`relative w-full aspect-square rounded-lg overflow-hidden border-2 transition-all duration-200 ${currentSlide === index
                  ? 'border-indigo-500 shadow-md scale-105'
                  : 'border-gray-200 hover:border-gray-300 dark:border-gray-600 dark:hover:border-gray-500'
                  }`}
                onClick={() => mainSwiperRef.current?.slideTo(index)}
              >
                {!imageErrors[index] ? (
                  <Image
                    src={img || '/placeholder.jpg'}
                    alt={`${productTitle || 'Produit'} - Miniature ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="80px"
                    onError={() => handleImageError(index)}
                    unoptimized
                  />
                ) : (
                  <div className="w-full h-full bg-gray-100 dark:bg-gray-200 flex items-center justify-center">
                    <p className="text-gray-400 text-xs">X</p>
                  </div>
                )}
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      )}

      {/* MODAL ZOOM */}
      {isZoomed && (
        <div
          className={`fixed inset-0 z-[9999] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 transition-all duration-300 ${isZoomed ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
            }`}
          onClick={closeZoom}
        >
          <div
            className={`relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-4xl max-h-[90vh] overflow-hidden transform transition-all duration-300 ${isZoomed ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
              }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* BOUTON FERMER */}
            <button
              onClick={closeZoom}
              className="absolute top-4 right-4 z-[10000] bg-black/20 hover:bg-black/30 p-2 rounded-full transition-all hover:scale-110 backdrop-blur-sm"
            >
              <FaTimes className="text-white text-lg" />
            </button>

            {/* SWIPER ZOOM */}
            <div className="w-full h-full min-h-[400px] max-h-[80vh]">
              <Swiper
                initialSlide={zoomIndex}
                spaceBetween={20}
                navigation={{
                  nextEl: '.swiper-button-next-zoom',
                  prevEl: '.swiper-button-prev-zoom'
                }}
                loop={validImages.length > 1}
                modules={[Navigation]}
                className="w-full h-full"
              >
                {validImages.map((img, index) => {
                  const showError = imageErrors[index]
                  return (
                    <SwiperSlide key={index} className="flex items-center justify-center p-8">
                      {!showError ? (
                        <div className="relative w-full h-full max-w-3xl max-h-[70vh]">
                          <Image
                            src={img || '/placeholder.jpg'}
                            alt={`${productTitle || 'Produit'} - Zoom ${index + 1}`}
                            fill
                            className="object-contain"
                            priority={index === zoomIndex}
                            quality={95}
                            sizes="(max-width: 768px) 90vw, 800px"
                            unoptimized
                          />
                        </div>
                      ) : (
                        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-12 text-center">
                          <p className="text-gray-500 dark:text-gray-400">Image non disponible</p>
                        </div>
                      )}
                    </SwiperSlide>
                  )
                })}
              </Swiper>

              {/* FLECHES ZOOM */}
              {validImages.length > 1 && (
                <>
                  <button className="swiper-button-prev-zoom absolute left-4 top-1/2 -translate-y-1/2 z-[10000] bg-black/20 hover:bg-black/30 p-3 rounded-full transition-all hover:scale-110 backdrop-blur-sm">
                    <FaChevronLeft className="text-white text-lg" />
                  </button>
                  <button className="swiper-button-next-zoom absolute right-4 top-1/2 -translate-y-1/2 z-[10000] bg-black/20 hover:bg-black/30 p-3 rounded-full transition-all hover:scale-110 backdrop-blur-sm">
                    <FaChevronRight className="text-white text-lg" />
                  </button>
                </>
              )}
            </div>

            {/* TITRE ET INDICATEUR */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-6">
              <div className="flex justify-between items-center text-white">
                <h3 className="font-medium text-lg truncate pr-4">
                  {productTitle || 'Produit'}
                </h3>
                <span className="text-sm opacity-80">
                  {zoomIndex + 1} / {validImages.length}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}