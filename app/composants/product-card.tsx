'use client'

import { useState } from 'react'
import Link from "next/link"
import Image from "next/image"
import LikeButton from "./likeButton"

type Product = {
    id: number
    title: string
    description: string
    price: number
    image_url: string | string[] | null
    user_id: string
    zone?: string
    likes?: number
    created_at?: string
    in_stock?: boolean
    has_promo?: boolean
    promo_price?: number
    promo_percentage?: number
}

export default function ProductCard({
    product,
    userId,
}: {
    product: Product
    userId?: string
}) {
    const [imageLoaded, setImageLoaded] = useState(false)
    const inStock = product.in_stock !== false
    const hasPromo = inStock && product.has_promo && product.promo_price

    const getFirstImage = (imageUrl: string | string[] | null): string => {
        if (!imageUrl) return "/placeholder.jpg"
        if (Array.isArray(imageUrl)) {
            const firstValidImage = imageUrl.find((img) => img && img.trim() !== "")
            return firstValidImage || "/placeholder.jpg"
        }
        return imageUrl || "/placeholder.jpg"
    }

    const getImageCount = (imageUrl: string | string[] | null): number => {
        if (!imageUrl) return 0
        if (Array.isArray(imageUrl)) {
            return imageUrl.filter((img) => img && img.trim() !== "").length
        }
        return 1
    }

    const isNewProduct = (createdAt?: string): boolean => {
        if (!createdAt) return false
        const created = new Date(createdAt)
        const now = new Date()
        const diffTime = Math.abs(now.getTime() - created.getTime())
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        return diffDays <= 7
    }

    const firstImage = getFirstImage(product.image_url)
    const imageCount = getImageCount(product.image_url)
    const isNew = isNewProduct(product.created_at)
    const economy = hasPromo ? product.price - (product.promo_price || 0) : 0

    return (
        <article className={`group relative w-full h-full flex flex-col overflow-hidden rounded-3xl transition-all duration-500 backdrop-blur-sm
            ${!inStock 
                ? 'bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 opacity-85' 
                : 'bg-white dark:bg-gradient-to-br dark:from-[#1a1f35] dark:to-[#141929] shadow-lg hover:shadow-2xl hover:shadow-[#F6C445]/15 dark:hover:shadow-[#F6C445]/25'
            }
            border ${!inStock ? 'border-gray-300 dark:border-gray-700' : 'border-gray-100 dark:border-gray-800 hover:border-[#F6C445]/40'}
            ${inStock ? 'hover:-translate-y-2 active:translate-y-0' : ''}`}
        >
            {/* Shine effect sur hover */}
            {inStock && (
                <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/[0.03] to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out pointer-events-none z-10" />
            )}

            {/* Image Container avec skeleton loader */}
            <div className="relative w-full aspect-square overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
                <Link href={`/product/${product.id}`} className={`block w-full h-full ${!inStock ? 'pointer-events-none' : ''}`}>
                    {/* Skeleton loader */}
                    {!imageLoaded && (
                        <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 animate-pulse" />
                    )}
                    
                    <Image
                        src={firstImage}
                        alt={product.title}
                        fill
                        className={`object-cover transition-all duration-700 ${
                            imageLoaded ? 'opacity-100' : 'opacity-0'
                        } ${inStock ? 'group-hover:scale-110 group-hover:rotate-1' : 'grayscale'}`}
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        priority={false}
                        onLoad={() => setImageLoaded(true)}
                    />
                    
                    {/* Gradient overlay subtil */}
                    {inStock && (
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    )}
                </Link>

                {/* Badge Rupture de stock redesigné */}
                {!inStock && (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center z-20">
                        <div className="flex items-center gap-2 px-5 py-3 bg-white/10 border border-white/30 rounded-2xl backdrop-blur-md">
                            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            <span className="font-extrabold text-white text-sm tracking-wide">RUPTURE DE STOCK</span>
                        </div>
                    </div>
                )}

                {/* Badge PROMO moderne avec animation */}
                {hasPromo && (
                    <div className="absolute top-3 left-3 z-20 animate-pulse">
                        <div className="relative px-3 py-1.5 rounded-xl text-xs font-black text-white bg-gradient-to-r from-red-500 via-red-600 to-orange-500 shadow-2xl shadow-red-500/50">
                            <span className="relative z-10">-{product.promo_percentage}%</span>
                            <div className="absolute inset-0 bg-white/20 rounded-xl animate-ping opacity-75" />
                        </div>
                    </div>
                )}
                
                {/* Badge NEW élégant */}
                {isNew && !hasPromo && (
                    <div className="absolute top-3 left-3 z-20">
                        <div className="px-3 py-1.5 rounded-xl text-xs font-black text-white bg-gradient-to-r from-emerald-500 to-teal-500 shadow-lg shadow-emerald-500/40">
                            <span className="flex items-center gap-1">
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                                NOUVEAU
                            </span>
                        </div>
                    </div>
                )}
                
                {/* LikeButton avec meilleur positionnement */}
                <div className="absolute top-3 right-3 z-20 transform transition-transform duration-300 hover:scale-110">
                    <div className="bg-white/90 dark:bg-black/50 backdrop-blur-md rounded-full p-2 shadow-lg">
                        <LikeButton productId={product.id} userId={userId} />
                    </div>
                </div>

                {/* Compteur d'images modernisé */}
                {imageCount > 1 && (
                    <div className="absolute bottom-3 right-3 z-20">
                        <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-black/70 backdrop-blur-md rounded-full">
                            <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span className="text-xs font-bold text-white">{imageCount}</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Contenu de la carte */}
            <div className="flex-1 p-4 sm:p-5 space-y-3">
                <Link href={`/product/${product.id}`} className={`block group/title ${!inStock ? 'pointer-events-none' : ''}`}>
                    <h3 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white leading-snug line-clamp-2 min-h-[2.5rem] group-hover/title:text-[#F6C445] transition-colors duration-300">
                        {product.title}
                    </h3>
                </Link>

                {/* Zone avec icône */}
                {product.zone && (
                    <div className="flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5 text-[#F6C445]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <p className="text-xs font-semibold text-[#F6C445] dark:text-[#FFD700]">{product.zone}</p>
                    </div>
                )}

                {/* Description améliorée */}
                <p className="hidden sm:block text-xs text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed min-h-[2.25rem]">
                    {product.description}
                </p>

                {/* Section prix et bouton */}
                <div className="flex items-end justify-between pt-2 gap-3">
                    {/* Prix avec meilleur design */}
                    {hasPromo ? (
                        <div className="flex flex-col gap-1">
                            <div className="flex items-baseline gap-2">
                                <span className="text-lg sm:text-xl font-black text-red-600 dark:text-orange-500">
                                    {product.promo_price?.toLocaleString()}
                                </span>
                                <span className="text-xs font-semibold text-gray-400 line-through">
                                    {product.price.toLocaleString()}
                                </span>
                            </div>
                            <span className="text-[10px] font-bold text-white bg-green-500 px-2 py-0.5 rounded-md inline-block w-fit">
                                Économie {economy.toLocaleString()} FCFA
                            </span>
                        </div>
                    ) : (
                        <div className="flex flex-col">
                            <span className="text-lg sm:text-xl font-black text-gray-900 dark:text-white">
                                {product.price.toLocaleString()}
                            </span>
                            <span className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 tracking-wider">
                                FCFA
                            </span>
                        </div>
                    )}

                    {/* Bouton CTA amélioré */}
                    <Link
                        href={`/product/${product.id}`}
                        className={`relative px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl text-xs sm:text-sm font-black transition-all duration-300 transform overflow-hidden touch-manipulation flex items-center gap-2
                        ${!inStock 
                            ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed' 
                            : 'text-[#1C2B49] bg-gradient-to-r from-[#F6C445] via-[#FFD700] to-[#F6C445] bg-size-200 bg-pos-0 hover:bg-pos-100 shadow-lg hover:shadow-xl hover:shadow-[#F6C445]/40 hover:scale-105 active:scale-95'
                        }`}
                    >
                        <span className="relative z-10 font-black tracking-wide">VOIR</span>
                        <svg className="relative z-10 w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                        {inStock && (
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                        )}
                    </Link>
                </div>
            </div>

            {/* Barre de focus élégante */}
            {inStock && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#F6C445] to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-center" />
            )}
        </article>
    )
}