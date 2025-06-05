"use client"

import { useState } from "react"
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
    DialogDescription
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
    const ranges: { label: string; range: [number, number] | null }[] = [
        { label: "Tous les prix", range: null },
        { label: "500 - 3 000 FCFA", range: [500, 3000] },
        { label: "3 000 - 7 000 FCFA", range: [3000, 7000] },
        { label: "7 000 - 10 000 FCFA", range: [7000, 10000] },
        { label: "10 000 - 15 000 FCFA", range: [10000, 15000] },
        { label: "15 000 - 20 000 FCFA", range: [15000, 20000] },
        { label: "Plus de 20 000 FCFA", range: [20001, Infinity] },
    ]

    function handleSelect(index: number) {
        onSelect(index)
        onChange(ranges[index].range)
    }

    return (
        <div className="p-6 bg-white rounded-3xl shadow-lg max-w-md mx-auto">
            <h3 className="text-xl font-semibold text-[#D29587] mb-4 text-center">
                Quel est ton budget ?
            </h3>
            <p className="text-center text-gray-600 mb-6 text-sm sm:text-base">
                Choisis une fourchette de prix pour filtrer les articles adaptés à ton budget.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
                {ranges.map(({ label }, i) => (
                    <button
                        key={label}
                        onClick={() => handleSelect(i)}
                        type="button"
                        className={`px-5 py-2 rounded-full font-medium text-sm sm:text-base transition-shadow duration-300
              ${selectedIndex === i
                                ? "bg-[#D29587] text-white shadow-lg"
                                : "bg-[#F5F3F1] text-[#5A5A5A] hover:bg-[#D29587] hover:text-white"
                            }
              focus:outline-none focus:ring-4 focus:ring-[#D29587]/50`}
                        aria-pressed={selectedIndex === i}
                        aria-label={`Filtrer par prix : ${label}`}
                    >
                        {label}
                    </button>
                ))}
            </div>
        </div>
    )
}

export default function FilteredProducts({ products, search }: { products: Product[], search: string }) {
  const [priceRange, setPriceRange] = useState<[number, number] | null>(null)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [open, setOpen] = useState(false)

  const searchLower = search.toLowerCase()
  console.log(searchLower);
  

  const filteredProducts = products
    .filter(p =>
      (!search || p.title.toLowerCase().includes(searchLower) || p.description.toLowerCase().includes(searchLower)) &&
      (!priceRange || (p.price >= priceRange[0] && p.price <= priceRange[1]))
    )

  function handlePriceChange(range: [number, number] | null) {
    setPriceRange(range)
  }

  function handleSelect(index: number) {
    setSelectedIndex(index)
  }

  return (
    <main className="w-full overflow-x-hidden bg-[#FAF6F4] dark:bg-black min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 space-y-14">

        {/* Bouton pour ouvrir le modal */}
        <div className="text-center">
          <Dialog open={open} onOpenChange={setOpen}>
            <div className="text-center space-y-2">
              <p className="text-sm text-gray-600">
                💡 Filtre les produits selon ton budget préféré
              </p>

              <DialogTrigger asChild>
                <button
                  type="button"
                  className="px-6 py-3 bg-[#D29587] dark:bg-black text-white rounded-xl font-semibold shadow-md hover:bg-[#bb7d72] transition flex items-center justify-center gap-2"
                >
                  💰 Choisir ton budget
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-2.5 0-4 1.5-4 4s1.5 4 4 4 4-1.5 4-4-1.5-4-4-4z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 2v2m0 16v2m10-10h-2M4 12H2m15.364-7.364l-1.414 1.414M6.05 17.95l-1.414 1.414m0-13.828l1.414 1.414m11.314 11.314l1.414 1.414" />
                  </svg>
                </button>
              </DialogTrigger>
            </div>

            <DialogContent className="max-w-lg rounded-3xl p-8">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold mb-4 text-[#D29587] text-center">
                  Choisis ta fourchette de prix
                </DialogTitle>
                <DialogDescription className="sr-only">
                  Sélectionne une fourchette de prix pour filtrer les produits
                </DialogDescription>
              </DialogHeader>

              <PriceFilter
                onChange={handlePriceChange}
                selectedIndex={selectedIndex}
                onSelect={handleSelect}
              />

              <DialogFooter className="mt-6 flex justify-center gap-4">
                <DialogClose asChild>
                  <button
                    type="button"
                    className="px-6 py-2 bg-[#D29587] dark:bg-black text-white rounded-xl font-semibold hover:bg-[#bb7d72] transition"
                  >
                    Valider
                  </button>
                </DialogClose>
                <DialogClose asChild>
                  <button
                    type="button"
                    className="px-6 py-2 bg-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-400 transition"
                  >
                    Annuler
                  </button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Produits filtrés */}
        <section>
          {filteredProducts.length === 0 ? (
            <p className="text-center text-gray-500 text-lg">
              Aucun produit trouvé pour ta recherche.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-7">
              {filteredProducts.map((product) => (
                <Link
                  key={product.id}
                  href={`/product/${product.id}`}
                  className="group block rounded-3xl overflow-hidden shadow-lg bg-white dark:bg-black border border-[#E6E3DF] transition-transform transform hover:scale-[1.03] hover:shadow-2xl"
                >
                  <div className="relative w-full h-52 sm:h-60">
                    <Image
                      src={product.image_url || "/placeholder.jpg"}
                      alt={product.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    />
                  </div>
                  <div className="p-5 space-y-2">
                    <h2 className="text-lg font-semibold text-[#333] truncate">
                      {product.title}
                    </h2>
                    <p className="text-sm text-[#555] line-clamp-2">{product.description}</p>
                    <p className="mt-3 font-bold text-[#D29587] text-lg">
                      {product.price.toLocaleString()} FCFA
                    </p>
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

