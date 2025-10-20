"use client"

import { useState } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, TrendingUp } from 'lucide-react'
import ProductImage3D from './ProductImage3D'

interface EnhancedProductCarouselProps {
  images: string[]
  productTitle: string
  isNew?: boolean
}

export default function EnhancedProductCarousel({ 
  images, 
  productTitle, 
  isNew = false 
}: EnhancedProductCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  const next = () => setCurrentIndex((currentIndex + 1) % images.length)
  const prev = () => setCurrentIndex((currentIndex - 1 + images.length) % images.length)

  return (
    <div className="space-y-4">
      {/* Image principale avec effet 3D */}
      <ProductImage3D 
        src={images[currentIndex]} 
        alt={`${productTitle} - Image ${currentIndex + 1}`}
        isNew={isNew}
        priority={currentIndex === 0}
      />
      
      {/* Navigation et compteur */}
      {images.length > 1 && (
        <>
          <div className="flex justify-between items-center px-2">
            <button
              onClick={prev}
              className="p-3 bg-white/90 dark:bg-[#1C2B49]/90 hover:bg-white dark:hover:bg-[#1C2B49] rounded-full shadow-lg transition-all hover:scale-110 group"
              aria-label="Image précédente"
            >
              <ChevronLeft className="text-gray-800 dark:text-white group-hover:text-[#F6C445]" size={20} />
            </button>
            
            <span className="text-sm font-medium text-[#1C2B49] dark:text-gray-300 bg-white/80 dark:bg-[#1C2B49]/80 px-4 py-2 rounded-full">
              {currentIndex + 1} / {images.length}
            </span>
            
            <button
              onClick={next}
              className="p-3 bg-white/90 dark:bg-[#1C2B49]/90 hover:bg-white dark:hover:bg-[#1C2B49] rounded-full shadow-lg transition-all hover:scale-110 group"
              aria-label="Image suivante"
            >
              <ChevronRight className="text-gray-800 dark:text-white group-hover:text-[#F6C445]" size={20} />
            </button>
          </div>

          {/* Miniatures */}
          <div className="grid grid-cols-4 gap-3">
            {images.slice(0, 4).map((img, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`
                  relative aspect-square rounded-2xl overflow-hidden 
                  transition-all duration-300
                  ${idx === currentIndex 
                    ? 'ring-4 ring-[#F6C445] scale-105 shadow-lg' 
                    : 'opacity-70 hover:opacity-100 hover:scale-105 shadow-md'
                  }
                `}
                aria-label={`Voir image ${idx + 1}`}
              >
                <Image 
                  src={img} 
                  alt={`${productTitle} - Miniature ${idx + 1}`} 
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 25vw, 12vw"
                />
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}