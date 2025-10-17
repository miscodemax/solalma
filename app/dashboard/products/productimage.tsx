'use client'

import Image from 'next/image'
import { useState } from 'react'
import { ImageOff } from 'lucide-react'

type ProductImageProps = {
  src: string | null
  alt: string
  outOfStock?: boolean
}

export default function ProductImage({ src, alt, outOfStock = false }: ProductImageProps) {
  const [imgSrc, setImgSrc] = useState(src || '/placeholder.png')
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  const handleError = () => {
    setImgSrc('/placeholder.png')
    setIsLoading(false)
    setHasError(true)
  }

  const handleLoad = () => {
    setIsLoading(false)
  }

  return (
    <div className="w-full aspect-[4/3] relative overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900">
      {/* Loading shimmer effect */}
      {isLoading && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 dark:via-white/10 to-transparent animate-shimmer" 
          style={{
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.5s infinite'
          }}
        />
      )}

      {/* Image principale */}
      <Image
        src={imgSrc || '/placeholder.png'}
        alt={alt}
        fill
        priority={false}
        className={`object-cover transition-all duration-700 ease-out
          ${isLoading ? 'scale-110 blur-sm opacity-0' : 'scale-100 blur-0 opacity-100'}
          ${outOfStock ? 'grayscale-[70%] opacity-60' : ''}
          group-hover:scale-110
        `}
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        onError={handleError}
        onLoad={handleLoad}
        quality={90}
      />

      {/* Overlay gradient subtil */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent pointer-events-none" />

      {/* Effet de brillance au hover */}
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/0 to-transparent group-hover:via-white/20 transition-all duration-700 -translate-x-full group-hover:translate-x-full pointer-events-none" />

      {/* Icône d'erreur si l'image ne charge pas */}
      {hasError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-slate-100 dark:bg-slate-800">
          <div className="p-4 rounded-full bg-slate-200 dark:bg-slate-700">
            <ImageOff size={32} className="text-slate-400 dark:text-slate-500" />
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Image non disponible</p>
        </div>
      )}

      {/* Bordure interne subtile */}
      <div className="absolute inset-0 ring-1 ring-inset ring-black/5 dark:ring-white/5 pointer-events-none" />

      <style jsx>{`
        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
      `}</style>
    </div>
  )
}