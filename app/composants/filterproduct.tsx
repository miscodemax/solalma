"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
  DialogDescription,
} from "@/components/ui/dialog"

type Product = {
  id: number
  title: string
  description: string
  price: number
  image_url: string | null
}

function PriceFilter({
  onChange,
  selectedIndex,
  onSelect,
}: {
  onChange: (range: [number, number] | null) => void
  selectedIndex: number
  onSelect: (index: number) => void
}) {
  const ranges = [
    { label: "Tous les prix", range: null },
    { label: "500 - 3 000 FCFA", range: [500, 3000] },
    { label: "3 000 - 7 000 FCFA", range: [3000, 7000] },
    { label: "7 000 - 10 000 FCFA", range: [7000, 10000] },
    { label: "10 000 - 15 000 FCFA", range: [10000, 15000] },
    { label: "15 000 - 20 000 FCFA", range: [15000, 20000] },
    { label: "Plus de 20 000 FCFA", range: [20001, Infinity] },
  ]

  return (
    <div className="p-4 bg-white dark:bg-[#121212] rounded-2xl shadow-md">
      <h3 className="text-center text-lg font-semibold text-[#D29587] dark:text-[#FBCFC2]">
        Ton budget ?
      </h3>
      <p className="text-center text-gray-600 dark:text-gray-300 text-sm mb-3">
        Sélectionne une fourchette 💸
      </p>
      <div className="flex flex-wrap justify-center gap-2">
        {ranges.map(({ label }, i) => (
          <button
            key={label}
            onClick={() => {
              onSelect(i)
              onChange(ranges[i].range)
            }}
            className={`px-4 py-2 rounded-full text-sm font-medium transition
              ${selectedIndex === i
                ? "bg-[#D29587] text-white shadow"
                : "bg-[#F5F3F1] text-[#5A5A5A] hover:bg-[#D29587] hover:text-white dark:bg-[#2c2c2c] dark:text-gray-300"
              } focus:outline-none focus:ring-2 focus:ring-[#D29587]/50`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  )
}

export default function FilteredProducts({ products }: { products: Product[] }) {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<Product[]>([])
  const [priceRange, setPriceRange] = useState<[number, number] | null>(null)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [open, setOpen] = useState(false)
  const [showOnboarding, setShowOnboarding] = useState(false)

  useEffect(() => {
    const alreadyVisited = localStorage.getItem("onboardingSeen")
    if (!alreadyVisited) setShowOnboarding(true)
  }, [])

  const dismissOnboarding = () => {
    localStorage.setItem("onboardingSeen", "true")
    setShowOnboarding(false)
  }

  const filteredProducts = products.filter(
    (p) => !priceRange || (p.price >= priceRange[0] && p.price <= priceRange[1])
  )

  const handleSearchInput = (value: string) => {
    setSearchQuery(value)
    if (value.trim() === "") return setSearchResults([])
    const results = products.filter((p) =>
      p.title.toLowerCase().includes(value.toLowerCase())
    )
    setSearchResults(results.slice(0, 5))
  }

  return (
    <main className="w-full bg-[#FAF6F4] dark:bg-black min-h-screen pb-12 pt-5 px-4 sm:px-6">
      {showOnboarding && (
        <div className="text-center mb-8 mt-6">
          <div className="bg-[#FDF1EE] dark:bg-[#2c2c2c] border border-[#FBCFC2] dark:border-[#D29587] rounded-2xl p-5 shadow-md max-w-2xl mx-auto">
            <h3 className="text-lg sm:text-xl font-semibold text-[#D29587] dark:text-[#FBCFC2] mb-1">
              Tu veux gagner des revenus supplementaires depuis chez toi ? 🧕📱
            </h3>
            <p className="text-sm text-[#5C5C5C] dark:text-gray-300 mb-4">
              Ouvre ta boutique gratuitement et commence à vendre en quelques clics. C’est simple, rapide et sans engagement.
            </p>
            <Link
              href="/dashboard/add"
              onClick={dismissOnboarding}
              className="inline-block px-6 py-3 bg-[#D29587] dark:bg-[#FBCFC2] text-white dark:text-black font-semibold rounded-full hover:bg-[#bb7d72] dark:hover:bg-[#f3b9a9] transition shadow"
            >
              🎉 Commencer à vendre
            </Link>
          </div>
        </div>
      )}


      {/* Search bar */}
      <div className="relative max-w-md mx-auto mb-6">
        <input
          type="text"
          placeholder="🔍 Rechercher un produit..."
          value={searchQuery}
          onChange={(e) => handleSearchInput(e.target.value)}
          className="w-full px-5 py-3 rounded-full border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-[#D29587] dark:bg-[#1a1a1a] dark:text-white"
        />
        {searchResults.length > 0 && (
          <div className="absolute z-10 mt-2 w-full bg-white dark:bg-[#1a1a1a] shadow-lg rounded-xl border border-gray-200 dark:border-gray-700">
            {searchResults.map((product) => (
              <Link
                key={product.id}
                href={`/product/${product.id}`}
                className="block px-4 py-3 hover:bg-[#F5F3F1] dark:hover:bg-[#2c2c2c] transition text-sm text-[#333] dark:text-white"
              >
                {product.title}
              </Link>
            ))}
          </div>
        )}
      </div>


      {/* Filter trigger */}
      <div className="text-center mb-8">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <button className="px-6 py-3 bg-[#D29587] dark:bg-[#FBCFC2] text-white dark:text-black rounded-full font-semibold shadow-md hover:bg-[#bb7d72] dark:hover:bg-[#f3b9a9] transition">
              💰 Filtrer par budget
            </button>
          </DialogTrigger>
          <DialogContent className="w-[95%] sm:max-w-md rounded-2xl p-6 dark:bg-[#1b1b1b] dark:text-white">
            <DialogHeader>
              <DialogTitle className="text-xl text-center text-[#D29587] dark:text-[#FBCFC2] font-bold mb-2">
                Choisis ta fourchette de prix
              </DialogTitle>
              <DialogDescription className="sr-only">
                Sélectionne un budget
              </DialogDescription>
            </DialogHeader>
            <PriceFilter
              onChange={setPriceRange}
              selectedIndex={selectedIndex}
              onSelect={setSelectedIndex}
            />
            <DialogFooter className="mt-6 flex justify-center gap-3">
              <DialogClose asChild>
                <button className="px-5 py-2 bg-[#D29587] dark:bg-[#FBCFC2] text-white dark:text-black rounded-lg font-semibold hover:bg-[#bb7d72] dark:hover:bg-[#f3b9a9] transition">
                  Valider
                </button>
              </DialogClose>
              <DialogClose asChild>
                <button className="px-5 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-white rounded-lg font-semibold hover:bg-gray-400 dark:hover:bg-gray-500 transition">
                  Annuler
                </button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Products */}
      <section>
        {filteredProducts.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-300 text-base mt-10">
            Aucun produit ne correspond à ta recherche 😕
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filteredProducts.map((product) => (
              <Link
                key={product.id}
                href={`/product/${product.id}`}
                className="group rounded-xl overflow-hidden bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#2a2a2a] hover:shadow-lg transition-all"
              >
                <div className="relative w-full aspect-[4/5]">
                  <Image
                    src={product.image_url || "/placeholder.jpg"}
                    alt={product.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="(max-width: 768px) 50vw, 20vw"
                  />
                </div>
                <div className="p-3 space-y-1">
                  <h2 className="text-sm font-semibold text-[#222] dark:text-white truncate">
                    {product.title}
                  </h2>
                  <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2">
                    {product.description}
                  </p>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-sm font-bold text-[#D29587] dark:text-[#FBCFC2]">
                      {product.price.toLocaleString()} FCFA
                    </span>

                  </div>
                </div>
              </Link>
            ))}
          </div>

        )}
      </section>
    </main>
  )
}
