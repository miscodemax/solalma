"use client"

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

            {/* Effet de brillance au survol */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out pointer-events-none" />

            {/* Container Image avec overlay gradient */}
            <div className="relative w-full aspect-square overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
                <Link href={`/product/${product.id}`} className="block w-full h-full">
                    <Image
                        src={firstImage}
                        alt={product.title}
                        fill
                        className="object-cover transition-all duration-700 group-hover:scale-110 group-hover:rotate-1"
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    />
                    {/* Overlay gradient subtil */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </Link>

                {/* Badge Nouveau - Position prioritaire */}
                {isNew && (
                    <div className="absolute top-3 left-3 z-20">
                        <div className="relative px-3 py-1.5 rounded-full text-xs font-bold text-white bg-gradient-to-r from-emerald-500 to-teal-600 shadow-lg animate-pulse">
                            <span className="relative z-10 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
                                NOUVEAU
                            </span>
                            {/* Effet de lueur */}
                            <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full blur-sm opacity-75 animate-pulse" />
                        </div>
                    </div>
                )}

                {/* Badge Premium - Repositionné si nouveau produit */}
                {product.price > 50000 && (
                    <div className={`absolute ${isNew ? 'top-14 left-3' : 'top-3 left-3'} z-10`}>
                        <div className="relative px-3 py-1 rounded-full text-xs font-bold text-[#1C2B49] bg-gradient-to-r from-[#F6C445] to-[#FFD700] shadow-lg">
                            <span className="flex items-center gap-1">
                                <span className="text-[10px]">✨</span>
                                PREMIUM
                            </span>
                            {/* Effet de lueur dorée */}
                            <div className="absolute inset-0 bg-gradient-to-r from-[#F6C445]/50 to-[#FFD700]/50 rounded-full blur-md opacity-50" />
                        </div>
                    </div>
                )}

                {/* Bouton Like avec animation */}
                <div className="absolute top-3 right-3 z-10">
                    <div className="flex items-center gap-1.5 px-3 py-2 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md rounded-full shadow-lg border border-white/20 dark:border-gray-700/20 transition-all duration-300 group-hover:scale-105">
                        <LikeButton productId={product.id} userId={userId} />
                        {product.likes && product.likes > 0 && (
                            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 min-w-[20px] text-center">
                                {product.likes > 999 ? "999+" : product.likes}
                            </span>
                        )}
                    </div>
                </div>

                {/* Compteur d'images avec style moderne */}
                {imageCount > 1 && (
                    <div className="absolute bottom-3 right-3 z-10">
                        <div className="flex items-center gap-1 px-2.5 py-1.5 bg-black/80 backdrop-blur-sm text-white rounded-full text-xs font-medium border border-white/10">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {imageCount}
                        </div>
                    </div>
                )}
            </div>

            {/* Section infos avec meilleur espacement */}
            <div className="flex-1 p-4 space-y-3">
                <Link href={`/product/${product.id}`} className="block group/title">
                    <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 leading-snug line-clamp-2 group-hover/title:text-[#F6C445] transition-colors duration-300">
                        {product.title}
                    </h3>
                </Link>

                <p className="hidden sm:block text-xs text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed">
                    {product.description}
                </p>

                {/* Prix et bouton avec animations */}
                <div className="flex items-center justify-between pt-2">
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
                        className="relative px-4 py-2 rounded-xl text-xs font-bold text-[#1C2B49] bg-gradient-to-r from-[#F6C445] to-[#FFD700] hover:from-[#FFD700] hover:to-[#F6C445] transition-all duration-300 shadow-md hover:shadow-lg hover:shadow-[#F6C445]/30 hover:scale-105 active:scale-95 group/btn overflow-hidden"
                    >
                        <span className="relative z-10 flex items-center gap-1">
                            Voir
                            <svg className="w-3 h-3 transition-transform duration-300 group-hover/btn:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </span>
                        {/* Effet de brillance sur le bouton */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-500" />
                    </Link>
                </div>
            </div>

            {/* Indicateur de statut en bas */}
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#F6C445]/20 via-[#F6C445]/60 to-[#F6C445]/20 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-center" />
        </article>
    )
}