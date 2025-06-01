'use client'

import Image from 'next/image'
import { useState } from 'react'

type ProductImageProps = {
  src: string | null
  alt: string
}

export default function ProductImage({ src, alt }: ProductImageProps) {
  const [imgSrc, setImgSrc] = useState(src || '/placeholder.png')

  return (
    <div className="w-full aspect-[4/3] relative overflow-hidden rounded-2xl shadow-sm border bg-white group">
      <Image
        src={imgSrc || '/placeholder.png'}
        alt={alt}
        fill
        className="object-cover transition-transform duration-300 ease-in-out group-hover:scale-105"
        sizes="(max-width: 768px) 100vw, 33vw"
        onError={() => setImgSrc('/placeholder.png')}
      />
    </div>
  )
}
