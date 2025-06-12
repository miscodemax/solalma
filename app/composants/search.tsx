'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'

type Product = {
    id: number
    title: string
    description: string
    price: number
    image_url: string | null
}

export default function Search({ products }: { products: Product[] }) {
    const [searchQuery, setSearchQuery] = useState('')
    const [searchResults, setSearchResults] = useState<Product[]>([])
    const [showResults, setShowResults] = useState(false)
    const router = useRouter()
    const inputRef = useRef<HTMLInputElement>(null)

    const handleSearchInput = (value: string) => {
        setSearchQuery(value)
        if (value.trim() === '') {
            setSearchResults([])
            return
        }
        const results = products.filter((p) =>
            p.title.toLowerCase().includes(value.toLowerCase())
        )
        setSearchResults(results.slice(0, 6))
        setShowResults(true)
    }

    const handleSelectProduct = (id: number) => {
        setShowResults(false)
        setSearchQuery('')
        router.push(`/product/${id}`)
    }

    const handleBlur = () => {
        // Delay to allow link click to register before hiding
        setTimeout(() => setShowResults(false), 100)
    }

    return (
        <div className="relative w-full max-w-full sm:max-w-md mx-auto">
            <input
                ref={inputRef}
                type="text"
                placeholder="🔍 Rechercher un produit"
                value={searchQuery}
                onChange={(e) => handleSearchInput(e.target.value)}
                onFocus={() => searchResults.length > 0 && setShowResults(true)}
                onBlur={handleBlur}
                className="w-full px-4 py-2.5 sm:py-3 text-sm rounded-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#1a1a1a] text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#D29587] transition"
            />

            <AnimatePresence>
                {showResults && searchResults.length > 0 && (
                    <motion.div
                        className="absolute z-20 mt-2 w-full max-h-72 overflow-y-auto bg-white dark:bg-[#1a1a1a] shadow-xl rounded-xl border border-gray-200 dark:border-gray-700"
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 5 }}
                    >
                        {searchResults.map((product) => (
                            <button
                                key={product.id}
                                onClick={() => handleSelectProduct(product.id)}
                                className="w-full text-left flex items-center gap-3 px-4 py-3 hover:bg-[#F5F3F1] dark:hover:bg-[#2c2c2c] transition"
                            >
                                <Link
                                href={'product/' + product.id}
                                >
                                    <div className="w-12 h-12 flex-shrink-0 relative">
                                        <Image
                                            src={product.image_url || '/placeholder.jpg'}
                                            alt={product.title}
                                            fill
                                            className="object-cover rounded-md"
                                        />
                                    </div>
                                    <div className="flex flex-col text-sm overflow-hidden">
                                        <span className="font-medium text-[#333] dark:text-white truncate">
                                            {product.title}
                                        </span>
                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                                            {product.price.toLocaleString()} FCFA
                                        </span>
                                    </div>
                                </Link>

                            </button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
