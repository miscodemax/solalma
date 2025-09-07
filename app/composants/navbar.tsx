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
  { href: '/dashboard/add', icon: ShoppingCart, label: 'Vendre' },
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
          ? 'bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg shadow-sm border-b border-gray-200/20 dark:border-gray-700/20'
          : 'bg-white/90 dark:bg-gray-900/90 backdrop-blur-md'
        }`}>

        <div className="max-w-7xl mx-auto px-4">

          {/* Main row */}
          <div className="flex items-center justify-between h-14">

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <ShoppingBag className="w-6 h-6 text-blue-600 dark:text-blue-400 transition-transform group-hover:scale-110" />
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
                      ? 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/30'
                      : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                    }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{label}</span>
                </Link>
              ))}
            </div>

            {/* Search */}
            <div className="flex-1 max-w-sm mx-4 lg:mx-8">
              <div className="bg-gray-50 dark:bg-gray-800/70 rounded-xl border border-gray-200/50 dark:border-gray-700/50 hover:border-blue-300 dark:hover:border-blue-600 transition-colors">
                <Search products={products} />
              </div>
            </div>

            {/* Right actions */}
            <div className="flex items-center gap-2">

              {/* Desktop sell button */}
              <Link
                href="/dashboard/add"
                className="hidden lg:flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow-sm transition-all hover:scale-105"
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
                  <DropdownMenuTrigger className="hidden lg:block focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-full">
                    <Image
                      src={avatar || 'https://icons.veryicon.com/png/o/miscellaneous/standard/avatar-15.png'}
                      alt="Profile"
                      width={32}
                      height={32}
                      className="rounded-full border-2 border-gray-200 dark:border-gray-700 hover:border-blue-300 transition-colors"
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
              <div className="lg:hidden flex items-center gap-1">
                <ThemeToggle />
                <button
                  onClick={() => setOpen(!open)}
                  className={`p-2 rounded-lg transition-all ${open
                      ? 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                      : 'bg-gray-50 text-gray-600 dark:bg-gray-800/70 dark:text-gray-300 hover:bg-blue-50 hover:text-blue-600'
                    }`}
                  aria-label={open ? "Fermer" : "Menu"}
                >
                  <div className="relative w-5 h-5">
                    <Menu className={`absolute transition-all duration-200 ${open ? 'rotate-90 opacity-0 scale-75' : 'rotate-0 opacity-100 scale-100'
                      }`} />
                    <X className={`absolute transition-all duration-200 ${open ? 'rotate-0 opacity-100 scale-100' : '-rotate-90 opacity-0 scale-75'
                      }`} />
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Desktop categories */}
          <div className="hidden lg:flex items-center gap-1 py-2 border-t border-gray-100 dark:border-gray-800/50">
            <button
              onClick={resetCategory}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${!category
                  ? 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/30'
                  : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                }`}
            >
              🏷️ Tout
            </button>
            {categories.map((cat) => (
              <button
                key={cat.label}
                onClick={() => handleCategory(cat.label)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${category === cat.label
                    ? 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/30'
                    : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                  }`}
              >
                {cat.emoji} {cat.label.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/30 backdrop-blur-sm" onClick={() => setOpen(false)}>
          <div
            ref={mobileMenuRef}
            className="absolute right-0 top-0 h-full w-80 max-w-full bg-white dark:bg-gray-900 shadow-xl overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >

            {/* Header */}
            <div className="p-4 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-6 h-6 text-blue-600" />
                  <TextLogo />
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="p-1.5 text-gray-400 hover:text-gray-600 rounded-md"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* User mobile */}
              {user && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <Image
                    src={avatar || 'https://icons.veryicon.com/png/o/miscellaneous/standard/avatar-15.png'}
                    alt="Profile"
                    width={36}
                    height={36}
                    className="rounded-full border-2 border-blue-200 dark:border-blue-700"
                  />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Mon compte</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Gérer mon profil</p>
                  </div>
                </div>
              )}
            </div>

            {/* Menu content */}
            <div className="p-4 space-y-6">

              {/* Quick sell */}
              <Link
                href="/dashboard/add"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 p-3 bg-blue-600 text-white rounded-lg font-medium shadow-sm"
              >
                <ShoppingCart className="w-5 h-5" />
                Vendre un produit
              </Link>

              {/* Navigation */}
              <div className="space-y-1">
                {navLinks.map(({ href, label, icon: Icon }) => (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setOpen(false)}
                    className={`flex items-center gap-3 p-3 rounded-lg font-medium transition-colors ${pathname === href
                        ? 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/30'
                        : 'text-gray-700 dark:text-gray-200 hover:text-blue-600 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                      }`}
                  >
                    <Icon className="w-5 h-5" />
                    {label}
                  </Link>
                ))}
              </div>

              {/* Categories */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Catégories</h3>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={resetCategory}
                    className={`flex items-center gap-2 p-2.5 rounded-lg text-sm font-medium transition-colors ${!category
                        ? 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/30'
                        : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                      }`}
                  >
                    🏷️ Tout
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat.label}
                      onClick={() => handleCategory(cat.label)}
                      className={`flex items-center gap-2 p-2.5 rounded-lg text-sm font-medium transition-colors ${category === cat.label
                          ? 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/30'
                          : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                        }`}
                    >
                      <span>{cat.emoji}</span>
                      <span className="text-xs">{cat.label.replace('_', ' ')}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* User actions */}
              {user && (
                <div className="border-t border-gray-100 dark:border-gray-800 pt-4 space-y-1">
                  <Link
                    href={`/profile/${user.id}`}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 p-3 text-gray-700 dark:text-gray-200 hover:text-blue-600 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-lg transition-colors"
                  >
                    <User className="w-5 h-5" />
                    Mon profil
                  </Link>
                  <button
                    onClick={() => { handleLogout(); setOpen(false) }}
                    className="flex items-center gap-3 p-3 w-full text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                  >
                    <LogOut className="w-5 h-5" />
                    Déconnexion
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Spacer */}
      <div className="h-14 lg:h-20" />
    </>
  )
}