'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import {
  DropdownMenu, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  HomeIcon, ShoppingCart, User,
  Info, Menu, X, LogOut, Heart
} from 'lucide-react'
import { ThemeToggle } from './theme-toggle'
import TextLogo from './textLogo'
import { createClient } from '@/lib/supabase'
import Image from 'next/image'
import Search from './search'
import {
  HoverCard,
  HoverCardTrigger,
  HoverCardContent,
} from '@/components/ui/hover-card'

const categories = [
  { label: 'vetement', tip: 'Découvre nos habits tendances pour tous les styles !' },
  { label: 'artisanat', tip: 'Des pièces uniques faites main, pour offrir ou se faire plaisir.' },
  { label: 'maquillage', tip: 'Sublime-toi grâce à notre sélection de makeup.' },
  { label: 'soins_et_astuces', tip: 'Prends soin de toi avec nos produits naturels et conseils.' },
  { label: 'electronique', tip: 'Encore plus de style avec notre gamme d\'appareil elecronique' },

]
const navLinks = [
  { href: '/', icon: HomeIcon, label: 'Accueil', tip: 'Retour à la page principale' },
  { href: '/dashboard/add', icon: ShoppingCart, label: 'Vendre', tip: 'Dépose un produit ou ouvre ta boutique' },
  { href: '/dashboard/products', icon: User, label: 'Mes produits', tip: 'Gère tes articles mis en vente' },
  { href: '/about', icon: Info, label: 'À propos', tip: 'En savoir plus sur Sangse.shop' },
  { href: '/favoris', icon: Heart, label: 'Favoris', tip: 'Retrouve tes coups de cœur' },
]

type Product = {
  id: number
  title: string
  description: string
  price: number
  image_url: string | null
}

export default function Navbar({ products }: { products: Product[] }) {
  const [open, setOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [avatar, setAvatar] = useState('')
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const category = searchParams.get('category')
  const supabase = createClient()

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('avatar_url')
          .eq('id', user.id)
          .single()
        setAvatar(data?.avatar_url)
      }
    }
    fetchData()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.refresh()
  }

  const handleCategory = (cat: string) => {
    router.push(`/?category=${encodeURIComponent(cat)}`)
    setOpen(false)
  }

  const resetCategory = () => {
    router.push('/')
    setOpen(false)
  }

  return (
    <nav className="sticky top-0 z-50 bg-white/95 dark:bg-black/90 shadow-md backdrop-blur-md transition-colors duration-300">
      {/* Top bar */}
      <div className="flex flex-col md:flex-row items-center justify-between px-4 py-3 max-w-7xl mx-auto w-full gap-2 md:gap-0">
        {/* Logo + mobile menu + theme */}
        <div className="flex items-center justify-between w-full md:w-auto">
          <Link href="/" className="flex items-center gap-1 text-xl font-bold text-[#D29587] group">
            <span className="transition-transform group-hover:scale-110">🌸</span>
            <TextLogo />
          </Link>
          <div className="flex items-center gap-3 md:hidden">
            <ThemeToggle />
            <HoverCard>
              <HoverCardTrigger asChild>
                <button onClick={() => setOpen(!open)} className="text-gray-700 dark:text-gray-200 focus:outline-none px-1" aria-label="Ouvrir ou fermer le menu">
                  {open ? <X size={26} /> : <Menu size={26} />}
                </button>
              </HoverCardTrigger>
              <HoverCardContent side="bottom" className="bg-white dark:bg-[#232323] border border-[#FBCFC2] dark:border-[#D29587] text-xs text-[#5A5A5A] dark:text-gray-300 rounded-xl shadow-md w-56">
                {open ? "Ferme le menu ✖️" : "Ouvre le menu de navigation"}
              </HoverCardContent>
            </HoverCard>
          </div>
        </div>

        {/* Desktop Search */}
        <div className="hidden md:flex flex-1 justify-center px-4 w-full max-w-md">
          <Search products={products} />
        </div>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-4 xl:gap-7">
          {navLinks.map(({ href, label, icon: Icon, tip }) => (
            <HoverCard key={href}>
              <HoverCardTrigger asChild>
                <Link
                  href={href}
                  className={`flex items-center gap-1 text-[15px] font-medium px-2 py-1 rounded transition ${pathname === href ? 'text-[#D29587] bg-[#f9eceb] dark:bg-[#1a1a1a]' : 'text-gray-600 dark:text-gray-200 hover:text-[#D29587] hover:bg-[#f9eceb] dark:hover:bg-[#1a1a1a]'}
                  `}
                  tabIndex={0}
                >
                  <Icon size={17} />
                  {label}
                </Link>
              </HoverCardTrigger>
              <HoverCardContent side="bottom" className="bg-white dark:bg-[#232323] border border-[#FBCFC2] dark:border-[#D29587] text-xs text-[#5A5A5A] dark:text-gray-300 rounded-xl shadow-md w-52">
                {tip}
              </HoverCardContent>
            </HoverCard>
          ))}
          <ThemeToggle />
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger className="focus:outline-none ml-2">
                <Image
                  src={avatar || 'https://icons.veryicon.com/png/o/miscellaneous/standard/avatar-15.png'}
                  alt="avatar"
                  width={34}
                  height={34}
                  className="rounded-full border-2 border-[#FBCFC2] dark:border-[#D29587] hover:scale-105 transition"
                />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => router.push(`/profile/${user.id}`)}>
                  <User size={16} className="mr-2" /> Voir mon profil
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                  <LogOut size={14} className="mr-2" /> Déconnexion
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* Mobile Search */}
      <div className="md:hidden px-4 mt-2">
        <Search products={products} />
      </div>

      {/* Catégories scrollables */}
      <div className="flex overflow-x-auto gap-3 px-2 sm:px-4 py-2 border-t border-[#f9eceb] dark:border-[#222] text-sm font-medium bg-white/95 dark:bg-black/90 scrollbar-thin scrollbar-thumb-[#FBCFC2]/40">
        <HoverCard>
          <HoverCardTrigger asChild>
            <button
              onClick={resetCategory}
              className={`whitespace-nowrap capitalize px-2 py-1 rounded transition min-w-[80px] ${!category ? 'text-[#D29587] border-b-2 border-[#D29587] bg-[#f9eceb] dark:bg-[#151010]' : 'text-gray-600 dark:text-gray-300 hover:text-[#D29587] hover:bg-[#f9eceb] dark:hover:bg-[#151010]'}
              `}
              aria-pressed={!category}
            >
              Voir tout
            </button>
          </HoverCardTrigger>
          <HoverCardContent side="bottom" className="bg-white dark:bg-[#232323] border border-[#FBCFC2] dark:border-[#D29587] text-xs text-[#5A5A5A] dark:text-gray-300 rounded-xl shadow-md w-44">
            Affiche tous les produits, sans filtre de catégorie.
          </HoverCardContent>
        </HoverCard>
        {categories.map((cat) => {
          const active = category === cat.label
          return (
            <HoverCard key={cat.label}>
              <HoverCardTrigger asChild>
                <button
                  onClick={() => handleCategory(cat.label)}
                  className={`whitespace-nowrap capitalize px-2 py-1 rounded transition min-w-[110px] ${active ? 'text-[#D29587] border-b-2 border-[#D29587] bg-[#f9eceb] dark:bg-[#151010]' : 'text-gray-600 dark:text-gray-300 hover:text-[#D29587] hover:bg-[#f9eceb] dark:hover:bg-[#151010]'}
                  `}
                  aria-pressed={active}
                >
                  {cat.label.replace('_', ' ')}
                </button>
              </HoverCardTrigger>
              <HoverCardContent side="bottom" className="bg-white dark:bg-[#232323] border border-[#FBCFC2] dark:border-[#D29587] text-xs text-[#5A5A5A] dark:text-gray-300 rounded-xl shadow-md w-56">
                {cat.tip}
              </HoverCardContent>
            </HoverCard>
          )
        })}
      </div>

      {/* Menu mobile (drawer) */}
      {open && (
        <div className="md:hidden px-4 pb-4 mt-2 space-y-5 animate-fadein-fast rounded-b-2xl bg-white/98 dark:bg-[#191515]/95 shadow-xl border-b border-[#f3e8e4] dark:border-[#2a2a2a]">
          <div>
            <p className="text-xs font-semibold text-gray-400 mb-2">Navigation</p>
            {navLinks.map(({ href, label, icon: Icon, tip }) => (
              <HoverCard key={href}>
                <HoverCardTrigger asChild>
                  <Link
                    href={href}
                    className={`flex items-center gap-2 text-[15px] font-medium px-2 py-2 rounded transition ${pathname === href ? 'text-[#D29587] bg-[#f9eceb]' : 'text-gray-600 dark:text-gray-200 hover:text-[#D29587] hover:bg-[#f9eceb]'}
                    `}
                    onClick={() => setOpen(false)}
                    tabIndex={0}
                  >
                    <Icon size={19} />
                    {label}
                  </Link>
                </HoverCardTrigger>
                <HoverCardContent side="right" className="bg-white dark:bg-[#232323] border border-[#FBCFC2] dark:border-[#D29587] text-xs text-[#5A5A5A] dark:text-gray-300 rounded-xl shadow-md w-52">
                  {tip}
                </HoverCardContent>
              </HoverCard>
            ))}
          </div>

          <div>
            <p className="text-xs font-semibold text-gray-400 mt-4 mb-2">Catégories</p>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => {
                const active = category === cat.label
                return (
                  <HoverCard key={cat.label}>
                    <HoverCardTrigger asChild>
                      <button
                        onClick={() => { handleCategory(cat.label); setOpen(false) }}
                        className={`whitespace-nowrap capitalize px-2 py-1 rounded transition min-w-[100px] ${active ? 'text-[#D29587] border-b-2 border-[#D29587] bg-[#f9eceb] dark:bg-[#151010]' : 'text-gray-600 dark:text-gray-300 hover:text-[#D29587] hover:bg-[#f9eceb] dark:hover:bg-[#151010]'}
                        `}
                        aria-pressed={active}
                      >
                        {cat.label.replace('_', ' ')}
                      </button>
                    </HoverCardTrigger>
                    <HoverCardContent side="right" className="bg-white dark:bg-[#232323] border border-[#FBCFC2] dark:border-[#D29587] text-xs text-[#5A5A5A] dark:text-gray-300 rounded-xl shadow-md w-52">
                      {cat.tip}
                    </HoverCardContent>
                  </HoverCard>
                )
              })}
            </div>
          </div>

          {user && (
            <div className="border-t pt-3 mt-2 flex items-center gap-4">
              <Link
                href={`/profile/${user.id}`}
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 text-gray-700 dark:text-gray-200 hover:text-[#D29587]"
              >
                <User size={17} /> Mon profil
              </Link>
              <button onClick={handleLogout} className="flex items-center gap-2 text-red-600 mt-1">
                <LogOut size={17} /> Déconnexion
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  )
}