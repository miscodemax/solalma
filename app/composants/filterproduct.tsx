"use client"

import { useEffect, useState } from "react"
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
import {
  HoverCard,
  HoverCardTrigger,
  HoverCardContent
} from "@/components/ui/hover-card"
import ProductCard from "./product-card"

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
    { label: "Tous les prix", range: null, tip: "Tous les produits, sans restriction 💫" },
    { label: "500 - 3 000 FCFA", range: [500, 3000], tip: "Petits prix, grandes trouvailles 🧴" },
    { label: "3 000 - 7 000 FCFA", range: [3000, 7000], tip: "Idéal pour tester sans se ruiner 💅" },
    { label: "7 000 - 10 000 FCFA", range: [7000, 10000], tip: "Un équilibre parfait ✨" },
    { label: "10 000 - 15 000 FCFA", range: [10000, 15000], tip: "Qualité et style assurés 🌟" },
    { label: "15 000 - 20 000 FCFA", range: [15000, 20000], tip: "Des pièces premium 😍" },
    { label: "Plus de 20 000 FCFA", range: [20001, Infinity], tip: "Pour les coups de cœur ❤️" },
  ]

  return (
    <div className="p-5 bg-white dark:bg-[#121212] rounded-3xl shadow-xl border border-[#f3e8e4] dark:border-[#2a2a2a]">
      <h3 className="text-center text-xl font-bold text-[#D29587] dark:text-[#FBCFC2] mb-1">
        Ton budget ?
      </h3>
      <p className="text-center text-gray-600 dark:text-gray-300 text-sm mb-5">
        Choisis une fourchette pour filtrer les merveilles 💸
      </p>
      <div className="flex flex-wrap justify-center gap-2">
        {ranges.map(({ label, tip }, i) => (
          <HoverCard key={label}>
            <HoverCardTrigger asChild>
              <button
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
            </HoverCardTrigger>
            <HoverCardContent className="bg-white dark:bg-[#2c2c2c] border border-[#FBCFC2] dark:border-[#D29587] text-sm text-[#5A5A5A] dark:text-gray-300 rounded-xl shadow-md w-64">
              {tip}
            </HoverCardContent>
          </HoverCard>
        ))}
      </div>
    </div>
  )
}

export default function FilteredProducts({ products, userId }: { products: Product[], userId: string }) {
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

  const handleShare = () => {
    const message = encodeURIComponent("Coucou ! 🌸 Découvre cette nouvelle plateforme de mode féminine, hijabs, skincare et + : https://sangse.shop — rejoins-nous !")
    const whatsappUrl = `https://wa.me/?text=${message}`
    window.open(whatsappUrl, '_blank')
  }

  return (
    <main className="w-full bg-[#FAF6F4] dark:bg-black min-h-screen pb-16 pt-5 px-4 sm:px-6 transition-colors duration-300">
      <div className="pt-4 max-w-64">
        <button
          onClick={handleShare}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#D29587] to-pink-400 text-white font-semibold shadow-lg hover:scale-105 transition-transform"
        >
          💌 Invite une amie 🤫
        </button>
        <p className="mt-1 text-center text-xs text-gray-500 italic">
          Fais-lui découvrir ta nouvelle boutique secrète... 🌸
        </p>
      </div>

      {showOnboarding && (
        <div className="text-center mb-10 mt-8">
          <div className="bg-[#FDF1EE] dark:bg-[#2c2c2c] border border-[#FBCFC2] dark:border-[#D29587] rounded-2xl p-6 shadow-md max-w-2xl mx-auto">
            <h3 className="text-xl font-semibold text-[#D29587] dark:text-[#FBCFC2] mb-2">
              Tu veux gagner des revenus depuis chez toi ? 🧕📱
            </h3>
            <p className="text-sm text-[#5C5C5C] dark:text-gray-300 mb-5">
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

      {/* Filter trigger */}
      <div className="text-center mb-8">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <button type="button" className="px-6 py-3 bg-[#D29587] dark:bg-[#FBCFC2] text-white dark:text-black rounded-full font-semibold shadow-md hover:bg-[#bb7d72] dark:hover:bg-[#f3b9a9] transition">
              💰 Filtrer par budget
            </button>
          </DialogTrigger>
          <DialogContent className="w-[95%] sm:max-w-md rounded-2xl p-6 dark:bg-[#1b1b1b] dark:text-white">
            <DialogHeader>
              <DialogTitle className="text-xl text-center text-[#D29587] dark:text-[#FBCFC2] font-bold mb-3">
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
                <button type="button" className="px-5 py-2 bg-[#D29587] dark:bg-[#FBCFC2] text-white dark:text-black rounded-lg font-semibold hover:bg-[#bb7d72] dark:hover:bg-[#f3b9a9] transition">
                  Valider
                </button>
              </DialogClose>
              <DialogClose asChild>
                <button type="button" className="px-5 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-white rounded-lg font-semibold hover:bg-gray-400 dark:hover:bg-gray-500 transition">
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
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} userId={userId} />
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
