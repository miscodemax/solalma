'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { Swiper, SwiperSlide } from 'swiper/react'
import { FreeMode, Navigation, Thumbs, Autoplay, Pagination } from 'swiper/modules'
import { FaExpand, FaHeart, FaTimes, FaChevronLeft, FaChevronRight } from 'react-icons/fa'
import { HiSparkles } from 'react-icons/hi2'
import 'swiper/css'
import 'swiper/css/free-mode'
import 'swiper/css/navigation'
import 'swiper/css/thumbs'
import 'swiper/css/pagination'

interface ProductImageCarouselProps {
  images: string[]
  productTitle: string
  isNew?: boolean
}

export default function ProductImageCarousel({
  images,
  productTitle,
  isNew = false,
}: ProductImageCarouselProps) {
  const [thumbsSwiper, setThumbsSwiper] = useState<any>(null)
  const [isZoomed, setIsZoomed] = useState(false)
  const [zoomIndex, setZoomIndex] = useState(0)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isLiked, setIsLiked] = useState(false)
  const [imageErrors, setImageErrors] = useState<{ [key: number]: boolean }>({})
  const mainSwiperRef = useRef<any>(null)

  // Filtrer les images valides
  const validImages = images?.filter(img => img && img.trim() !== '') || []

  useEffect(() => {
    // Reset des erreurs quand les images changent
    setImageErrors({})
  }, [images])

  if (!validImages || validImages.length === 0) {
    return (
      <div className="w-full">
        {/* Image principale placeholder */}
        <div className="relative w-full aspect-square max-w-[500px] mx-auto rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center shadow-sm">
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Aucune image disponible</p>
          </div>
        </div>
      </div>
    )
  }

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

  const toggleLike = () => setIsLiked(!isLiked)

  const nextSlide = () => {
    if (mainSwiperRef.current) {
      mainSwiperRef.current.slideNext()
    }
  }

  const prevSlide = () => {
    if (mainSwiperRef.current) {
      mainSwiperRef.current.slidePrev()
    }
  }

  return (
    <div className="w-full max-w-[500px] mx-auto space-y-4">
      {/* CARROUSEL PRINCIPAL */}
      <div className="relative group">
        <Swiper
          onSwiper={(swiper) => {
            mainSwiperRef.current = swiper
          }}
          loop={validImages.length > 1}
          spaceBetween={0}
          thumbs={{ swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null }}
          onSlideChange={(swiper) => setCurrentSlide(swiper.realIndex)}
          modules={[FreeMode, Navigation, Thumbs, Pagination]}
          className="rounded-2xl shadow-lg overflow-hidden"
          pagination={{
            clickable: true,
            dynamicBullets: true,
          }}
        >
          {validImages.map((img, index) => (
            <SwiperSlide key={index}>
              <div
                className="relative w-full aspect-square bg-white dark:bg-gray-100 cursor-pointer overflow-hidden"
                onClick={() => openZoom(index)}
              >
                {!imageErrors[index] ? (
                  <Image
                    src={img}
                    alt={`${productTitle} - Image ${index + 1}`}
                    fill
                    className="object-contain transition-transform duration-300 hover:scale-105"
                    priority={index === 0}
                    quality={85}
                    onError={() => handleImageError(index)}
                    sizes="(max-width: 768px) 100vw, 500px"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-200">
                    <div className="text-center">
                      <svg className="w-12 h-12 mx-auto mb-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                      <p className="text-xs text-gray-500">Image non disponible</p>
                    </div>
                  </div>
                )}

                {/* BADGES */}
                <div className="absolute top-3 left-3 z-20">
                  {isNew && (
                    <div className="flex items-center bg-gradient-to-r from-emerald-400 to-teal-500 text-white px-3 py-1.5 rounded-full text-xs font-semibold shadow-md">
                      <HiSparkles className="mr-1.5 text-sm" />
                      Nouveau
                    </div>
                  )}
                </div>

                {/* ACTIONS */}
                <div className="absolute top-3 right-3 flex flex-col gap-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleLike()
                    }}
                    className="bg-white/95 backdrop-blur-sm p-2.5 rounded-full shadow-md hover:scale-110 transition-all duration-200"
                  >
                    <FaHeart className={`text-sm transition-colors ${isLiked ? 'text-red-500' : 'text-gray-400 hover:text-red-400'}`} />
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

                {/* NAVIGATION ARROWS */}
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
          ))}
        </Swiper>

        {/* INDICATEUR D'IMAGES */}
        {validImages.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 bg-black/60 text-white px-3 py-1 rounded-full text-xs font-medium">
            {currentSlide + 1} / {validImages.length}
          </div>
        )}
      </div>

      {/* MINIATURES */}
      {validImages.length > 1 && (
        <div className="relative">
          <Swiper
            onSwiper={setThumbsSwiper}
            spaceBetween={8}
            slidesPerView={4}
            freeMode={true}
            watchSlidesProgress={true}
            modules={[FreeMode, Thumbs]}
            breakpoints={{
              480: {
                slidesPerView: 5,
              },
              640: {
                slidesPerView: 6,
              },
            }}
            className="!px-0"
          >
            {validImages.map((img, index) => (
              <SwiperSlide key={index} className="cursor-pointer">
                <div
                  className={`relative w-full aspect-square rounded-lg overflow-hidden border-2 transition-all duration-200 ${currentSlide === index
                      ? 'border-blue-500 shadow-md scale-105'
                      : 'border-gray-200 hover:border-gray-300 dark:border-gray-600 dark:hover:border-gray-500'
                    }`}
                  onClick={() => {
                    if (mainSwiperRef.current) {
                      mainSwiperRef.current.slideTo(index)
                    }
                  }}
                >
                  {!imageErrors[index] ? (
                    <Image
                      src={img}
                      alt={`${productTitle} - Miniature ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="80px"
                      onError={() => handleImageError(index)}
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-100 dark:bg-gray-200 flex items-center justify-center">
                      <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      )}

      {/* MODAL ZOOM */}
      {isZoomed && (
        <div className="fixed inset-0 z-[9999] bg-black/95 flex items-center justify-center transition-all duration-300">
          {/* HEADER */}
          <div className="absolute top-0 left-0 right-0 z-[10000] bg-gradient-to-b from-black/80 to-transparent p-6">
            <div className="flex justify-between items-center">
              <h3 className="text-white font-medium text-lg truncate pr-4">
                {productTitle}
              </h3>
              <button
                onClick={closeZoom}
                className="bg-white/20 hover:bg-white/30 p-3 rounded-full transition-all hover:scale-110 flex-shrink-0"
              >
                <FaTimes className="text-white text-xl" />
              </button>
            </div>
          </div>

          {/* CARROUSEL ZOOM */}
          <Swiper
            initialSlide={zoomIndex}
            spaceBetween={20}
            navigation={{
              nextEl: '.swiper-button-next-zoom',
              prevEl: '.swiper-button-prev-zoom',
            }}
            loop={validImages.length > 1}
            modules={[Navigation]}
            className="w-full h-full max-w-[95vw] max-h-[95vh]"
          >
            {validImages.map((img, index) => (
              <SwiperSlide key={index} className="flex items-center justify-center p-16">
                {!imageErrors[index] ? (
                  <Image
                    src={img}
                    alt={`${productTitle} - Zoom Image ${index + 1}`}
                    width={1000}
                    height={1000}
                    className="object-contain max-h-full max-w-full"
                    priority={index === zoomIndex}
                    quality={95}
                  />
                ) : (
                  <div className="bg-gray-800 rounded-lg p-12 text-center">
                    <svg className="w-16 h-16 mx-auto mb-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <p className="text-gray-400">Image non disponible</p>
                  </div>
                )}
              </SwiperSlide>
            ))}
          </Swiper>

          {/* NAVIGATION ZOOM */}
          {validImages.length > 1 && (
            <>
              <button className="swiper-button-prev-zoom absolute left-6 top-1/2 -translate-y-1/2 z-[10000] bg-white/20 hover:bg-white/30 p-4 rounded-full transition-all hover:scale-110">
                <FaChevronLeft className="text-white text-xl" />
              </button>
              <button className="swiper-button-next-zoom absolute right-6 top-1/2 -translate-y-1/2 z-[10000] bg-white/20 hover:bg-white/30 p-4 rounded-full transition-all hover:scale-110">
                <FaChevronRight className="text-white text-xl" />
              </button>
            </>
          )}

          {/* FOOTER */}
          <div className="absolute bottom-0 left-0 right-0 z-[10000] bg-gradient-to-t from-black/80 to-transparent p-6">
            <div className="text-center text-white/80 text-sm">
              Image {zoomIndex + 1} sur {validImages.length}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}