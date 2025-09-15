"use client"
import { useState, useMemo } from "react"
import ProductCard from "@/app/composants/product-card"
import CategoryFilter from "@/app/composants/categoriefilter"
import MinMaxPriceFilter from "./minmaxpricefilter"
import { FaBox } from "react-icons/fa"

type Product = {
    id: number
    title: string
    description: string
    price: number
    image_url: string | null
    user_id: string
    category: string
    likes?: number
}

export default function ProductGallery({
    products,
    userId,
}: {
    products: Product[]
    userId?: string
}) {
    const [category, setCategory] = useState<string | null>(null)
    const [minPrice, setMinPrice] = useState("")
    const [maxPrice, setMaxPrice] = useState("")

    const filtered = useMemo(() => {
        let filtered = [...products]
        if (category) filtered = filtered.filter((p) => p.category === category)
        if (minPrice) filtered = filtered.filter((p) => Number(p.price) >= Number(minPrice))
        if (maxPrice) filtered = filtered.filter((p) => Number(p.price) <= Number(maxPrice))
        return filtered
    }, [products, category, minPrice, maxPrice])

    return (
        <>
            {/* Filtres */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
                <CategoryFilter selectedCategory={category} onSelect={setCategory} />
                <MinMaxPriceFilter
                    minPrice={minPrice}
                    maxPrice={maxPrice}
                    setMinPrice={setMinPrice}
                    setMaxPrice={setMaxPrice}
                />
            </div>

            {/* Produits */}
            {filtered.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {filtered.map((product) => (
                        <ProductCard key={product.id} product={product} userId={userId} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-14 bg-[#F9F9F9] dark:bg-[#1C1C1C] rounded-3xl shadow-inner">
                    <div className="w-20 h-20 mx-auto mb-4 bg-[#FFD766]/40 rounded-full flex items-center justify-center">
                        <FaBox className="w-8 h-8 text-[#F4B400]" />
                    </div>
                    <h3 className="text-lg font-semibold text-[#1C1C1C] dark:text-white mb-2">
                        Aucun produit trouvé
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                        Essayez d’autres filtres ou revenez plus tard ✨
                    </p>
                </div>
            )}
        </>
    )
}
