"use client"
import { useState } from "react"
import Image from 'next/image'
import Link from 'next/link'

type Product = {
  id: number
  title: string
  description: string
  price: number
  image_url: string | null
}

function PriceFilter({
  onChange,
}: {
  onChange: (range: [number, number] | null) => void
}) {
  const ranges: { label: string; range: [number, number] | null }[] = [
    { label: "Tous les prix", range: null },
    { label: "500 - 3 000 FCFA", range: [500, 3000] },
    { label: "3 000 - 7 000 FCFA", range: [3000, 7000] },
    { label: "7 000 - 10 000 FCFA", range: [7000, 10000] },
    { label: "10 000 - 15 000 FCFA", range: [10000, 15000] },
    { label: "15 000 - 20 000 FCFA", range: [15000, 20000] },
    { label: "Plus de 20 000 FCFA", range: [20001, Infinity] },
  ]

  const [selectedIndex, setSelectedIndex] = useState(0)

  function handleSelect(index: number) {
    setSelectedIndex(index)
    onChange(ranges[index].range)
  }

  return (
    <div className="flex flex-wrap gap-2 mb-6 justify-center">
      {ranges.map(({ label }, i) => (
        <button
          key={label}
          className={`px-3 py-1 rounded-full border transition 
            ${
              selectedIndex === i
                ? "bg-[#D29587] text-white border-[#D29587]"
                : "border-gray-300 text-gray-700 hover:bg-gray-100"
            }`}
          onClick={() => handleSelect(i)}
          type="button"
        >
          {label}
        </button>
      ))}
    </div>
  )
}

export default function FilteredProducts({ products }: { products: Product[] }) {
  const [priceRange, setPriceRange] = useState<[number, number] | null>(null)

  const filteredProducts = priceRange
    ? products.filter((p) => p.price >= priceRange[0] && p.price <= priceRange[1])
    : products

  return (
    <main className="w-full overflow-x-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-12">
        {/* CTA Section */}
        <section className="bg-[#FAF6F4] border border-[#E6E3DF] rounded-2xl p-4 sm:p-6 text-center shadow-sm mx-auto w-full max-w-md sm:max-w-xl">
          <h2 className="text-lg sm:text-2xl font-bold text-[#D29587] mb-2 sm:mb-3">
            Tu as des articles à vendre ?
          </h2>
          <p className="text-gray-600 mb-4 text-sm sm:text-base">
            Rejoins notre communauté et donne une seconde vie à tes vêtements, hijabs, produits skincare...
          </p>
          <Link
            href="/dashboard/add"
            className="inline-flex items-center justify-center gap-2 bg-[#D29587] text-white font-semibold px-4 py-2 rounded-xl text-sm sm:text-base shadow hover:bg-[#bb7d72] transition"
          >
            Commencer à vendre
          </Link>
        </section>

        {/* Filtre prix */}
        <PriceFilter onChange={setPriceRange} />

        {/* Produits filtrés */}
        <section>
          {filteredProducts.length === 0 ? (
            <p className="text-center text-gray-500">Aucun produit trouvé dans cette fourchette de prix.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6">
              {filteredProducts.map((product) => (
                <Link key={product.id} href={`/product/${product.id}`} className="group block">
                  <div className="bg-white border border-[#E6E3DF] rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition duration-300 w-full">
                    <div className="relative w-full h-48 sm:h-56">
                      <Image
                        src={product.image_url || '/placeholder.jpg'}
                        alt={product.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105 group-hover:rotate-1"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      />
                    </div>
                    <div className="p-3 sm:p-4 space-y-1">
                      <h2 className="text-sm sm:text-base font-semibold text-[#333] truncate">
                        {product.title}
                      </h2>
                      <p className="text-xs sm:text-sm text-[#777] line-clamp-2">
                        {product.description}
                      </p>
                      <p className="mt-1 font-bold text-[#D29587] text-sm sm:text-base">
                        {product.price.toLocaleString()} FCFA
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
