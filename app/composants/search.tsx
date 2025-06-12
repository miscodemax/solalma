'use client'

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"

type Product = {
  id: number
  title: string
  description: string
  price: number
  image_url: string | null
}

export default function Search({ products }: { products: Product[] }) {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<Product[]>([])

  const handleSearchInput = (value: string) => {
    setSearchQuery(value)
    if (value.trim() === "") return setSearchResults([])
    const results = products.filter((p) =>
      p.title.toLowerCase().includes(value.toLowerCase())
    )
    setSearchResults(results.slice(0, 6)) // Show top 6
  }

  return (
    <div className="relative max-w-md w-full mx-auto">
      <input
        type="text"
        placeholder="🔍 Rechercher un produit"
        value={searchQuery}
        onChange={(e) => handleSearchInput(e.target.value)}
        className="w-full px-5 py-3 rounded-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#1a1a1a] text-sm text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#D29587] transition"
      />

      <AnimatePresence>
        {searchResults.length > 0 && (
          <motion.div
            className="absolute z-20 mt-2 w-full bg-white dark:bg-[#1a1a1a] shadow-xl rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
          >
            {searchResults.map((product) => (
              <Link
                key={product.id}
                href={`/product/${product.id}`}
                className="flex items-center gap-3 px-4 py-3 hover:bg-[#F5F3F1] dark:hover:bg-[#2c2c2c] transition"
              >
                <div className="w-12 h-12 flex-shrink-0 relative">
                  <Image
                    src={product.image_url || "/placeholder.jpg"}
                    alt={product.title}
                    fill
                    className="object-cover rounded-md"
                  />
                </div>
                <div className="flex flex-col text-sm">
                  <span className="font-medium text-[#333] dark:text-white truncate">
                    {product.title}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {product.price.toLocaleString()} FCFA
                  </span>
                </div>
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
