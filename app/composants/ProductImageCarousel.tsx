'use client'



import { motion, AnimatePresence } from "framer-motion"
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
                  className="relative w-full aspect-[4/3] bg-[#FAFAFA] dark:bg-gray-100 cursor-pointer overflow-hidden"
                  onClick={() => openZoom(index)}
                >
                  {!showError ? (
                    <Image
                      src={img || '/placeholder.jpg'}
                      alt={`${productTitle || 'Produit'} - Image ${index + 1}`}
                      fill
                      className="object-cover transition-transform duration-300 hover:scale-105"
                      priority={index === 0}
                      quality={85}
                      onError={() => handleImageError(index)}
                      sizes="(max-width: 768px) 100vw, 600px"
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-[#E5E7EB] dark:bg-gray-200">
                      <p className="text-xs text-[#374151]">Image non disponible</p>
                    </div>
                  )}

                  {/* BADGE NOUVEAU - Palette Sangse */}
                  {isNew && (
                    <div className="absolute top-3 left-3 z-20 flex items-center bg-gradient-to-r from-[#A8D5BA] to-[#6366F1] text-white px-3 py-1.5 rounded-full text-xs font-semibold shadow-md">
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
                      <FaHeart className={`text-sm transition-colors ${isLiked ? 'text-[#FFD6BA]' : 'text-[#E5E7EB] hover:text-[#6366F1]'}`} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        openZoom(index)
                      }}
                      className="bg-white/95 backdrop-blur-sm p-2.5 rounded-full shadow-md hover:scale-110 transition-all duration-200"
                    >
                      <FaExpand className="text-[#374151] text-sm" />
                    </button>
                  </div>

                  {/* FLECHES - Palette Sangse */}
                  {validImages.length > 1 && (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          prevSlide()
                        }}
                        className="absolute left-3 top-1/2 -translate-y-1/2 z-20 bg-white/90 hover:bg-white p-2.5 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110"
                      >
                        <FaChevronLeft className="text-[#374151] text-sm" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          nextSlide()
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 z-20 bg-white/90 hover:bg-white p-2.5 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110"
                      >
                        <FaChevronRight className="text-[#374151] text-sm" />
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
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 bg-[#374151]/80 text-white px-3 py-1 rounded-full text-xs font-medium">
            {currentSlide + 1} / {validImages.length}
          </div>
        )}
      </div>

      {/* MINIATURES - Palette Sangse */}
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
                  ? 'border-[#6366F1] shadow-md scale-105'
                  : 'border-[#E5E7EB] hover:border-[#A8D5BA] dark:border-gray-600 dark:hover:border-gray-500'
                  }`}
                onClick={() => mainSwiperRef.current?.slideTo(index)}
              >
                {!imageErrors[index] ? (
                  <Image
                    src={img || '/placeholder.jpg'}
                    alt={`${productTitle || 'Produit'} - Miniature ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes='60px'
                    onError={() => handleImageError(index)}
                    unoptimized
                  />
                ) : (
                  <div className="w-full h-full bg-[#E5E7EB] dark:bg-gray-200 flex items-center justify-center">
                    <p className="text-[#374151] text-xs">X</p>
                  </div>
                )}
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      )}



      {/* MODAL ZOOM - Palette Sangse */}
      <AnimatePresence>
        {isZoomed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="fixed inset-0 z-[9999] bg-[#374151]/70 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={closeZoom}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 40 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 40 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }} // cubic-bezier style smooth
              className="relative mt-12 bg-[#FAFAFA] dark:bg-gray-900 rounded-2xl shadow-2xl max-w-4xl max-h-[70vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* BOUTON FERMER */}
              <motion.button
                whileHover={{ scale: 1.15, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={closeZoom}
                className="absolute top-12 right-4 z-[10000] bg-[#374151]/80 hover:bg-[#374151]/90 p-2 rounded-full backdrop-blur-sm"
              >
                <FaTimes className="text-white text-lg" />
              </motion.button>

              {/* SWIPER */}
              <div className="w-full h-full min-h-[400px] max-h-[80vh]">
                <Swiper
                  initialSlide={zoomIndex}
                  spaceBetween={20}
                  navigation={{
                    nextEl: ".swiper-button-next-zoom",
                    prevEl: ".swiper-button-prev-zoom",
                  }}
                  loop={validImages.length > 1}
                  modules={[Navigation]}
                  className="w-full h-full"
                  onSlideChange={(swiper) => setZoomIndex(swiper.realIndex)}
                >
                  {validImages.map((img, index) => (
                    <SwiperSlide
                      key={index}
                      className="flex items-center justify-center p-8"
                    >
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.1, duration: 0.4 }}
                        className="relative w-full h-[70vh] max-w-3xl"
                      >
                        <Image
                          src={img || "/placeholder.jpg"}
                          alt={`${productTitle || "Produit"} - Zoom ${index + 1}`}
                          fill
                          className="object-contain"
                          priority={index === zoomIndex}
                          quality={95}
                          sizes="(max-width: 768px) 90vw, 800px"
                        />
                      </motion.div>
                    </SwiperSlide>
                  ))}
                </Swiper>

                {/* FLECHES */}
                {validImages.length > 1 && (
                  <>
                    <motion.button
                      whileHover={{ scale: 1.2, x: -2 }}
                      whileTap={{ scale: 0.9 }}
                      className="swiper-button-prev-zoom absolute left-4 top-1/2 -translate-y-1/2 z-[10000] bg-[#374151]/80 hover:bg-[#374151]/90 p-3 rounded-full backdrop-blur-sm"
                    >
                      <FaChevronLeft className="text-white text-lg" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.2, x: 2 }}
                      whileTap={{ scale: 0.9 }}
                      className="swiper-button-next-zoom absolute right-4 top-1/2 -translate-y-1/2 z-[10000] bg-[#374151]/80 hover:bg-[#374151]/90 p-3 rounded-full backdrop-blur-sm"
                    >
                      <FaChevronRight className="text-white text-lg" />
                    </motion.button>
                  </>
                )}
              </div>

              {/* TITRE ET INDICATEUR */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.4 }}
                className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#374151]/80 to-transparent p-6"
              >
                <div className="flex justify-between items-center text-white">
                  <h3 className="font-medium text-lg truncate pr-4">
                    {productTitle || "Produit"}
                  </h3>
                  <span className="text-sm opacity-80">
                    {zoomIndex + 1} / {validImages.length}
                  </span>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  )
}