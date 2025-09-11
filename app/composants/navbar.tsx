'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import {
  DropdownMenu, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  HomeIcon, ShoppingCart, User, Menu, X, LogOut, Heart, ShoppingBag
} from 'lucide-react'
import { ThemeToggle } from './theme-toggle'
import TextLogo from './textLogo'
import { createClient } from '@/lib/supabase'
import Image from 'next/image'
import Search from './search'

const categories = [
  { label: 'vetement', emoji: '👗' },
  { label: 'artisanat', emoji: '🎨' },
  { label: 'maquillage', emoji: '💄' },
  { label: 'soins_et_astuces', emoji: '🧴' },
  { label: 'electronique', emoji: '📱' },
]

const navLinks = [
  { href: '/', icon: HomeIcon, label: 'Accueil' },
  { href: '/about', icon: ShoppingCart, label: 'à-propos' },
  { href: '/dashboard/products', icon: ShoppingBag, label: 'Mes produits' },
  { href: '/favoris', icon: Heart, label: 'Favoris' },
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
  const [scrolled, setScrolled] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const category = searchParams.get('category')
  const supabase = createClient()
  const mobileMenuRef = useRef<HTMLDivElement>(null)

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

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => { document.body.style.overflow = 'unset' }
  }, [open])

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
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${scrolled
        ? 'bg-white/95 dark:bg-[#0A1A2F]/95 backdrop-blur-lg shadow-sm border-b border-gray-200/20 dark:border-gray-700/20'
        : 'bg-white/90 dark:bg-[#0A1A2F]/90 backdrop-blur-md'
        }`}>

        <div className="max-w-7xl mx-auto px-4">

          {/* Main row */}
          <div className="flex items-center justify-between h-14">

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <ShoppingBag className="w-6 h-6 text-yellow-600 dark:text-yellow-500 transition-transform group-hover:scale-110" />
              <div className="hidden sm:block">
                <TextLogo />
              </div>
            </Link>

            {/* Desktop nav */}
            <div className="hidden lg:flex items-center gap-1">
              {navLinks.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${pathname === href
                    ? 'text-yellow-600 bg-yellow-50 dark:text-yellow-400 dark:bg-yellow-900/30'
                    : 'text-gray-600 dark:text-gray-300 hover:text-yellow-600 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                    }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{label}</span>
                </Link>
              ))}
            </div>

            {/* Search */}
            <div className="flex-1 max-w-sm mx-4 lg:mx-8">
              <div className="bg-gray-50 dark:bg-gray-800/70 rounded-xl border border-gray-200/50 dark:border-gray-700/50 hover:border-yellow-400 dark:hover:border-yellow-500 transition-colors">
                <Search products={products} />
              </div>
            </div>

            {/* Right actions */}
            <div className="flex items-center gap-2">

              {/* Desktop sell button */}
              <Link
                href="/dashboard/add"
                className="hidden lg:flex items-center gap-2 px-4 py-2 
                           bg-yellow-500 hover:bg-yellow-600 
                           text-white rounded-lg font-medium shadow-sm 
                           transition-all hover:scale-105"
              >
                <ShoppingCart className="w-4 h-4" />
                Vendre
              </Link>

              <div className="hidden lg:block">
                <ThemeToggle />
              </div>

              {/* Desktop user */}
              {user && (
                <DropdownMenu>
                  <DropdownMenuTrigger className="hidden lg:block focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 rounded-full">
                    <Image
                      src={avatar || 'https://icons.veryicon.com/png/o/miscellaneous/standard/avatar-15.png'}
                      alt="Profile"
                      width={32}
                      height={32}
                      className="rounded-full border-2 border-gray-200 dark:border-gray-700 hover:border-yellow-400 transition-colors"
                    />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={() => router.push(`/profile/${user.id}`)}>
                      <User className="w-4 h-4 mr-2" /> Mon profil
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push('/dashboard/products')}>
                      <ShoppingBag className="w-4 h-4 mr-2" /> Mes produits
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push('/favoris')}>
                      <Heart className="w-4 h-4 mr-2" /> Favoris
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                      <LogOut className="w-4 h-4 mr-2" /> Déconnexion
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              {/* Mobile menu button */}
              {/* Mobile menu button */}
              <div className="lg:hidden flex items-center gap-1">
                <ThemeToggle />
                <button
                  onClick={() => setOpen(!open)}
                  className={`p-2 rounded-lg transition-all ${open
                    ? 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                    : 'bg-gray-50 text-gray-600 dark:bg-gray-800/70 dark:text-gray-300 hover:bg-yellow-50 hover:text-yellow-600'
                    }`}
                  aria-label={open ? "Fermer" : "Menu"}
                >
                  <div className="relative w-5 h-5">
                    <Menu
                      className={`absolute transition-all duration-200 ${open ? 'rotate-90 opacity-0 scale-75' : 'rotate-0 opacity-100 scale-100'
                        }`}
                    />
                    <X
                      className={`absolute transition-all duration-200 ${open ? 'rotate-0 opacity-100 scale-100' : '-rotate-90 opacity-0 scale-75'
                        }`}
                    />
                  </div>
                </button>
              </div>

              {/* Mobile menu drawer */}
              {open && (
                <div
                  ref={mobileMenuRef}
                  className="fixed inset-0 z-40 lg:hidden"
                >
                  {/* overlay */}
                  <div
                    className="absolute inset-0 bg-black/40"
                    onClick={() => setOpen(false)}
                  />

                  {/* drawer */}
                  <div className="absolute top-0 right-0 w-72 h-full bg-white dark:bg-[#0A1A2F] shadow-xl flex flex-col">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                      <TextLogo />
                      <button
                        onClick={() => setOpen(false)}
                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                      >
                        <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                      </button>
                    </div>

                    {/* Navigation links */}
                    <div className="flex flex-col p-4 gap-2 border-b border-gray-200 dark:border-gray-700">
                      {navLinks.map(({ href, label, icon: Icon }) => (
                        <Link
                          key={href}
                          href={href}
                          onClick={() => setOpen(false)}
                          className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${pathname === href
                            ? 'text-yellow-600 bg-yellow-50 dark:text-yellow-400 dark:bg-yellow-900/30'
                            : 'text-gray-700 dark:text-gray-300 hover:text-yellow-600 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                            }`}
                        >
                          <Icon className="w-4 h-4" />
                          {label}
                        </Link>
                      ))}
                      <Link
                        href="/dashboard/add"
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium bg-yellow-500 hover:bg-yellow-600 text-white transition-all"
                      >
                        <ShoppingCart className="w-4 h-4" />
                        Vendre
                      </Link>
                    </div>

                    {/* Categories */}
                    <div className="flex flex-col p-4 gap-2 overflow-y-auto">
                      <span className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 px-2">Catégories</span>
                      <button
                        onClick={resetCategory}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${!category
                          ? 'text-yellow-600 bg-yellow-50 dark:text-yellow-400 dark:bg-yellow-900/30'
                          : 'text-gray-700 dark:text-gray-300 hover:text-yellow-600 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                          }`}
                      >
                        🏷️ Tout
                      </button>
                      {categories.map((cat) => (
                        <button
                          key={cat.label}
                          onClick={() => handleCategory(cat.label)}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${category === cat.label
                            ? 'text-yellow-600 bg-yellow-50 dark:text-yellow-400 dark:bg-yellow-900/30'
                            : 'text-gray-700 dark:text-gray-300 hover:text-yellow-600 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                            }`}
                        >
                          {cat.emoji} {cat.label.replace('_', ' ')}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* Desktop categories */}
          {/* Categories bar */}
          <div
            className="flex items-center gap-1 py-2 border-t border-gray-100 dark:border-gray-800/50 
             overflow-x-auto scrollbar-hide lg:overflow-visible"
          >
            <button
              onClick={resetCategory}
              className={`flex flex-shrink-0 items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${!category
                ? 'text-yellow-600 bg-yellow-50 dark:text-yellow-400 dark:bg-yellow-900/30'
                : 'text-gray-600 dark:text-gray-300 hover:text-yellow-600 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                }`}
            >
              🏷️ Tout
            </button>
            {categories.map((cat) => (
              <button
                key={cat.label}
                onClick={() => handleCategory(cat.label)}
                className={`flex flex-shrink-0 items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${category === cat.label
                  ? 'text-yellow-600 bg-yellow-50 dark:text-yellow-400 dark:bg-yellow-900/30'
                  : 'text-gray-600 dark:text-gray-300 hover:text-yellow-600 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                  }`}
              >
                {cat.emoji} {cat.label.replace('_', ' ')}
              </button>
            ))}
          </div>

        </div>
      </nav>

      {/* Spacer */}
      <div className="h-14 lg:h-20" />
    </>
  )
}
