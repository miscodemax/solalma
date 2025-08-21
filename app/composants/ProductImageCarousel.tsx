'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Swiper, SwiperSlide } from 'swiper/react'
import { FreeMode, Navigation, Thumbs, Autoplay } from 'swiper/modules'
import { FaExpand, FaHeart } from 'react-icons/fa'
import { HiSparkles } from 'react-icons/hi2'
import 'swiper/css'
import 'swiper/css/free-mode'
import 'swiper/css/navigation'
import 'swiper/css/thumbs'

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

  if (!images || images.length === 0) {
    return (
      <div className="w-full h-[600px] rounded-3xl bg-gray-200 dark:bg-gray-800 flex items-center justify-center">
        <p className="text-gray-500 dark:text-gray-400">Aucune image disponible</p>
      </div>
    )
  }

  return (
    <div className="w-full space-y-6">
      {/* SLIDE PRINCIPAL */}
      <Swiper
        loop={true}
        spaceBetween={10}
        navigation={true}
        autoplay={{ delay: 4000, disableOnInteraction: false }}
        thumbs={{ swiper: thumbsSwiper }}
        modules={[FreeMode, Navigation, Thumbs, Autoplay]}
        className="rounded-3xl shadow-xl"
      >
        {images.map((img, index) => (
          <SwiperSlide key={index}>
            <div className="relative w-full h-[600px] rounded-3xl overflow-hidden">
              <Image
                src={img || '/placeholder.jpg'}
                alt={`${productTitle} - Image ${index + 1}`}
                fill
                className="object-cover"
                priority={index === 0}
                quality={90}
              />

              {/* BADGES */}
              <div className="absolute top-6 left-6 flex flex-col gap-3 z-20">
                {isNew && (
                  <div className="flex items-center bg-gradient-to-r from-green-400 to-emerald-500 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg animate-pulse">
                    <HiSparkles className="mr-2 text-base" />
                    Nouveau
                  </div>
                )}
              </div>

              {/* ACTIONS (favoris + zoom) */}
              <div className="absolute top-6 right-6 flex flex-col gap-3 z-20">
                <button className="bg-white/90 backdrop-blur-md p-3 rounded-full shadow-lg hover:scale-110 transition-all">
                  <FaHeart className="text-gray-400 hover:text-red-500 transition-colors text-lg" />
                </button>
                <button className="bg-white/90 backdrop-blur-md p-3 rounded-full shadow-lg hover:scale-110 transition-all">
                  <FaExpand className="text-gray-600 text-lg" />
                </button>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* MINIATURES */}
      {images.length > 1 && (
        <Swiper
          onSwiper={setThumbsSwiper}
          spaceBetween={10}
          slidesPerView={6}
          freeMode={true}
          watchSlidesProgress={true}
          modules={[FreeMode, Thumbs]}
          className="!px-2"
        >
          {images.map((img, index) => (
            <SwiperSlide key={index} className="cursor-pointer">
              <div className="relative w-full h-20 rounded-xl overflow-hidden">
                <Image
                  src={img || '/placeholder.jpg'}
                  alt={`${productTitle} - Miniature ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      )}
    </div>
  )
}
