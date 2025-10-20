"use client"

import { useState } from 'react'
import Image from 'next/image'
import { TrendingUp } from 'lucide-react'

interface ProductImage3DProps {
  src: string
  alt: string
  isNew?: boolean
  priority?: boolean
}

export default function ProductImage3D({ 
  src, 
  alt, 
  isNew = false,
  priority = false 
}: ProductImage3DProps) {
  const [rotation, setRotation] = useState({ x: 0, y: 0 })
  const [isHovered, setIsHovered] = useState(false)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget
    const rect = card.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const centerX = rect.width / 2
    const centerY = rect.height / 2
    const rotateX = ((y - centerY) / centerY) * -10
    const rotateY = ((x - centerX) / centerX) * 10
    
    setRotation({ x: rotateX, y: rotateY })
  }

  const handleMouseLeave = () => {
    setRotation({ x: 0, y: 0 })
    setIsHovered(false)
  }

  return (
    <div 
      className="relative group cursor-pointer"
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      style={{ perspective: '1000px' }}
    >
      <div
        className="relative overflow-hidden rounded-3xl transition-all duration-300 ease-out"
        style={{
          transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) scale(${isHovered ? 1.05 : 1})`,
          transformStyle: 'preserve-3d',
          boxShadow: isHovered 
            ? '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 40px rgba(246, 196, 69, 0.3)' 
            : '0 10px 25px -5px rgba(0, 0, 0, 0.1)'
        }}
      >
        {/* Badge Nouveau */}
        {isNew && (
          <div className="absolute top-4 left-4 z-20 bg-gradient-to-r from-[#F6C445] to-orange-500 text-[#1C2B49] px-4 py-2 rounded-full text-sm font-bold shadow-lg flex items-center gap-2 animate-pulse">
            <TrendingUp size={16} />
            Nouveau
          </div>
        )}
        
        {/* Image principale */}
        <div className="relative aspect-square bg-gray-100 dark:bg-gray-800">
          <Image 
            src={src} 
            alt={alt}
            fill
            className="object-cover"
            priority={priority}
            sizes="(max-width: 768px) 100vw, 50vw"
          />
          
          {/* Overlay gradient au hover */}
          <div 
            className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{ transform: 'translateZ(20px)' }}
          />
        </div>

        {/* Reflet lumineux */}
        <div 
          className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
          style={{
            transform: `translateZ(30px) translateX(${rotation.y * 2}px) translateY(${rotation.x * 2}px)`
          }}
        />
      </div>
    </div>
  )
}