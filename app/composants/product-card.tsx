'use client'

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
    zone?: string // Zone ajoutée
    likes?: number
    created_at?: string // Ajouté pour le badge "nouveau"
}

export default function ProductCard({
    product,
    userId,
}: {
    product: Product
    userId?: string
}) {

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

    return (
        <article className="group relative w-full flex flex-col overflow-hidden rounded-2xl bg-gradient-to-br from-white to-gray-50/50 dark:from-[#1C2B49] dark:to-[#162041] border border-gray-200/60 dark:border-gray-700/50 hover:border-[#F6C445]/30 dark:hover:border-[#F6C445]/40 hover:shadow-2xl hover:shadow-[#F6C445]/10 dark:hover:shadow-[#F6C445]/20 transition-all duration-500 hover:-translate-y-1 backdrop-blur-sm">

            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out pointer-events-none" />

            <div className="relative w-full aspect-square overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
                <Link href={`/product/${product.id}`} className="block w-full h-full">
                    <Image
                        src={firstImage}
                        alt={product.title}
                        fill
                        className="object-cover transition-all duration-500 group-hover:scale-105 group-active:scale-110"
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        priority={false}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/15 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400" />
                </Link>

                {isNew && (
                    <div className="absolute top-2 left-2 z-20">
                        <div className="relative group/badge">
                            <div className="relative px-2 py-1 rounded-lg text-[10px] font-semibold text-[#1C2B49] bg-gradient-to-r from-[#F6C445]/95 to-[#FFD700]/95 backdrop-blur-sm shadow-sm border border-[#F6C445]/20">
                                <span className="relative z-10 flex items-center gap-1">
                                    <span className="w-1 h-1 bg-[#1C2B49] rounded-full opacity-70" />
                                    NEW
                                </span>
                            </div>
                            <div className="absolute inset-0 bg-gradient-to-r from-[#F6C445]/30 to-[#FFD700]/30 rounded-lg blur-sm opacity-0 group-hover/badge:opacity-100 animate-pulse transition-opacity duration-300" />
                        </div>
                    </div>
                )}

                {product.price > 20000 && (
                    <div className={`absolute ${isNew ? 'top-9 left-2' : 'top-2 left-2'} z-10`}>
                        <div className="relative px-2 py-1 rounded-lg text-[10px] font-semibold text-[#1C2B49] bg-gradient-to-r from-[#F6C445] to-[#FFD700] shadow-sm">
                            <span className="flex items-center gap-1">
                                <span className="text-[8px]">✨</span>
                                PREMIUM
                            </span>
                            <div className="absolute inset-0 bg-gradient-to-r from-[#F6C445]/20 to-[#FFD700]/20 rounded-lg blur-sm opacity-50" />
                        </div>
                    </div>
                )}

                <div className="absolute top-2 right-2 z-10">
                    <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl shadow-sm border border-white/20 dark:border-gray-700/20 transition-all duration-300 group-hover:scale-105 group-active:scale-95">
                        <LikeButton productId={product.id} userId={userId} />
                        {product.likes && product.likes > 0 && (
                            <span className="text-[10px] font-semibold text-gray-700 dark:text-gray-300 min-w-[16px] text-center">
                                {product.likes > 999 ? "999+" : product.likes}
                            </span>
                        )}
                    </div>
                </div>

                {imageCount > 1 && (
                    <div className="absolute bottom-2 right-2 z-10">
                        <div className="flex items-center gap-1 px-2 py-1 bg-black/75 backdrop-blur-sm text-white rounded-lg text-[10px] font-medium border border-white/10">
                            <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {imageCount}
                        </div>
                    </div>
                )}
            </div>

            <div className="flex-1 p-3 sm:p-4 space-y-2.5 sm:space-y-3">
                <Link href={`/product/${product.id}`} className="block group/title">
                    <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 leading-tight line-clamp-2 group-hover/title:text-[#F6C445] transition-colors duration-300">
                        {product.title}
                    </h3>
                </Link>

                {/* Zone du produit */}
                {product.zone && (
                    <p className="text-[10px] sm:text-xs font-medium text-[#F6C445] dark:text-[#FFD700]">
                        {product.zone}
                    </p>
                )}

                <p className="hidden sm:block text-xs text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed">
                    {product.description}
                </p>

                <div className="flex items-center justify-between pt-1 sm:pt-2">
                    <div className="flex flex-col">
                        <span className="text-base font-black text-gray-900 dark:text-gray-100 group-hover:text-[#F6C445] transition-colors duration-300">
                            {product.price.toLocaleString()}
                        </span>
                        <span className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">
                            FCFA
                        </span>
                    </div>

                    <Link
                        href={`/product/${product.id}`}
                        className="relative px-3 py-2 sm:px-4 sm:py-2 rounded-xl text-[10px] sm:text-xs font-bold text-[#1C2B49] bg-gradient-to-r from-[#F6C445] to-[#FFD700] hover:from-[#FFD700] hover:to-[#F6C445] active:from-[#F6C445] active:to-[#FFD700] transition-all duration-300 shadow-md hover:shadow-lg hover:shadow-[#F6C445]/25 transform hover:scale-105 active:scale-95 group/btn overflow-hidden touch-manipulation"
                    >
                        <span className="relative z-10 flex items-center gap-1">
                            Voir
                            <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3 transition-transform duration-300 group-hover/btn:translate-x-0.5 group-active/btn:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </span>
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover/btn:translate-x-full group-active/btn:translate-x-full transition-transform duration-400" />
                    </Link>
                </div>
            </div>

            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#F6C445]/60 to-transparent transform scale-x-0 group-hover:scale-x-100 group-active:scale-x-100 transition-transform duration-400 origin-center" />
            <div className="absolute inset-0 rounded-2xl ring-2 ring-[#F6C445]/50 ring-offset-2 ring-offset-white dark:ring-offset-[#1C2B49] opacity-0 focus-within:opacity-100 transition-opacity duration-300 pointer-events-none" />
        </article>
    )
}
