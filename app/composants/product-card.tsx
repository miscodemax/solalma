'use client'

import Link from "next/link"
import Image from "next/image"
import LikeButton from "./likeButton"

// 1. Le type Product a été enrichi pour inclure les informations de stock et de promotion.
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
    // On considère par défaut que le produit est en stock si la propriété n'est pas définie.
    const inStock = product.in_stock !== false;
    const hasPromo = inStock && product.has_promo && product.promo_price;

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

    const economy = hasPromo ? product.price - (product.promo_price || 0) : 0;

    return (
        // 2. Gestion de l'état "Rupture de stock" sur la carte entière.
        <article className={`group relative w-full flex flex-col overflow-hidden rounded-2xl bg-gradient-to-br from-white to-gray-50/50 dark:from-[#1C2B49] dark:to-[#162041] border border-gray-200/60 dark:border-gray-700/50 hover:border-[#F6C445]/30 dark:hover:border-[#F6C445]/40 transition-all duration-500 backdrop-blur-sm 
            ${!inStock ? 'grayscale opacity-75 hover:shadow-none hover:-translate-y-0' : 'hover:shadow-2xl hover:shadow-[#F6C445]/10 dark:hover:shadow-[#F6C445]/20 hover:-translate-y-1'}`}>
            
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out pointer-events-none" />

            <div className="relative w-full aspect-square overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
                <Link href={`/product/${product.id}`} className={`block w-full h-full ${!inStock ? 'pointer-events-none' : ''}`}>
                    <Image
                        src={firstImage}
                        alt={product.title}
                        fill
                        className={`object-cover transition-all duration-500 ${inStock ? 'group-hover:scale-105 group-active:scale-110' : ''}`}
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        priority={false}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/15 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400" />
                </Link>

                {/* 3. Overlay et badge pour la rupture de stock */}
                {!inStock && (
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-20">
                        <div className="flex items-center gap-2 px-4 py-2 border-2 border-white/20 bg-white/10 rounded-xl">
                            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" /></svg>
                            <span className="font-bold text-white text-sm">RUPTURE DE STOCK</span>
                        </div>
                    </div>
                )}

                {/* Badge PROMO */}
                {hasPromo && (
                    <div className="absolute top-2 left-2 z-20">
                        <div className="px-2 py-1 rounded-md text-[10px] font-bold text-white bg-gradient-to-r from-red-500 to-orange-500 shadow-lg">
                            -{product.promo_percentage}%
                        </div>
                    </div>
                )}
                
                {isNew && !hasPromo && (
                     <div className="absolute top-2 left-2 z-20"> {/* ... code du badge NEW ... */} </div>
                )}
                
                {/* ... autres badges ... */}
                <div className="absolute top-2 right-2 z-10">{/* ... code du LikeButton ... */}</div>
                {imageCount > 1 && (<div className="absolute bottom-2 right-2 z-10">{/* ... code du compteur d'images ... */}</div>)}
            </div>

            <div className="flex-1 p-3 sm:p-4 space-y-2.5 sm:space-y-3">
                <Link href={`/product/${product.id}`} className={`block group/title ${!inStock ? 'pointer-events-none' : ''}`}>
                    <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 leading-tight line-clamp-2 group-hover/title:text-[#F6C445] transition-colors duration-300">
                        {product.title}
                    </h3>
                </Link>

                {product.zone && (<p className="text-[10px] sm:text-xs font-medium text-[#F6C445] dark:text-[#FFD700]">{product.zone}</p>)}
                <p className="hidden sm:block text-xs text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed">{product.description}</p>

                <div className="flex items-end justify-between pt-1 sm:pt-2">
                    {/* 4. Affichage du prix : conditionnel s'il y a une promotion ou non. */}
                    {hasPromo ? (
                        <div className="flex flex-col">
                            <div className="flex items-baseline gap-2">
                                <span className="text-base font-black text-red-500 dark:text-orange-400">
                                    {product.promo_price?.toLocaleString()} FCFA
                                </span>
                                <span className="text-xs font-medium text-gray-500 dark:text-gray-400 line-through">
                                    {product.price.toLocaleString()} FCFA
                                </span>
                            </div>
                            <span className="text-[10px] text-green-600 dark:text-green-400 font-semibold">
                                Économisez {economy.toLocaleString()} FCFA
                            </span>
                        </div>
                    ) : (
                        <div className="flex flex-col">
                            <span className="text-base font-black text-gray-900 dark:text-gray-100 group-hover:text-[#F6C445] transition-colors duration-300">
                                {product.price.toLocaleString()}
                            </span>
                            <span className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">
                                FCFA
                            </span>
                        </div>
                    )}

                    <Link
                        href={`/product/${product.id}`}
                        // 5. Style du bouton désactivé en cas de rupture de stock.
                        className={`relative px-3 py-2 sm:px-4 sm:py-2 rounded-xl text-[10px] sm:text-xs font-bold transition-all duration-300 transform group/btn overflow-hidden touch-manipulation
                        ${!inStock 
                            ? 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 pointer-events-none' 
                            : 'text-[#1C2B49] bg-gradient-to-r from-[#F6C445] to-[#FFD700] hover:from-[#FFD700] hover:to-[#F6C445] active:from-[#F6C445] active:to-[#FFD700] shadow-md hover:shadow-lg hover:shadow-[#F6C445]/25 hover:scale-105 active:scale-95'}`}
                    >
                        <span className="relative z-10 flex items-center gap-1">Voir
                            <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3 transition-transform duration-300 group-hover/btn:translate-x-0.5 group-active/btn:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                        </span>
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover/btn:translate-x-full group-active/btn:translate-x-full transition-transform duration-400" />
                    </Link>
                </div>
            </div>

            <div className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#F6C445]/60 to-transparent transform transition-transform duration-400 origin-center ${inStock ? 'scale-x-0 group-hover:scale-x-100 group-active:scale-x-100' : 'scale-x-0'}`} />
            <div className="absolute inset-0 rounded-2xl ring-2 ring-[#F6C445]/50 ring-offset-2 ring-offset-white dark:ring-offset-[#1C2B49] opacity-0 focus-within:opacity-100 transition-opacity duration-300 pointer-events-none" />
        </article>
    )
}