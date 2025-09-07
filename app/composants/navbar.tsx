'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import {
  DropdownMenu, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  HomeIcon, ShoppingCart, User,
  Info, Menu, X, LogOut, Heart, ShoppingBag, Search as SearchIcon, Bell, MessageSquare
} from 'lucide-react'
import { ThemeToggle } from './theme-toggle'
import TextLogo from './textLogo'
import { createClient } from '@/lib/supabase'
import Image from 'next/image'
import Search from './search'

const categories = [
  { label: 'vetement', tip: 'Découvre nos habits tendances pour tous les styles !', emoji: '👗' },
  { label: 'artisanat', tip: 'Des pièces uniques faites main, pour offrir ou se faire plaisir.', emoji: '🎨' },
  { label: 'maquillage', tip: 'Sublime-toi grâce à notre sélection de makeup.', emoji: '💄' },
  { label: 'soins_et_astuces', tip: 'Prends soin de toi avec nos produits naturels et conseils.', emoji: '🧴' },
  { label: 'electronique', tip: 'Encore plus de style avec notre gamme d\'appareil electronique', emoji: '📱' },
]

const navLinks = [
  { href: '/', icon: HomeIcon, label: 'Accueil', tip: 'Retour à la page principale', category: 'main' },
  { href: '/dashboard/add', icon: ShoppingCart, label: 'Vendre', tip: 'Dépose un produit ou ouvre ta boutique', category: 'sell' },
  { href: '/dashboard/products', icon: ShoppingBag, label: 'Mes produits', tip: 'Gère tes articles mis en vente', category: 'manage' },
  { href: '/favoris', icon: Heart, label: 'Favoris', tip: 'Retrouve tes coups de cœur', category: 'main' },
  { href: '/about', icon: Info, label: 'À propos', tip: 'En savoir plus sur Sangse.shop', category: 'info' },
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
  const [isSearchFocused, setIsSearchFocused] = useState(false)
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
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.body.style.overflow = 'unset'
    }
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
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
        ? 'bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl shadow-lg border-b border-gray-200/50 dark:border-gray-800/50'
        : 'bg-white/80 dark:bg-gray-900/80 backdrop-blur-md'
        }`}>

        {/* Main navbar container */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6">

          {/* Top row - Mobile optimized layout */}
          <div className="flex items-center justify-between h-16">

            {/* Logo - Mobile optimized */}
            <Link href="/" className="flex items-center gap-2 group shrink-0">
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full opacity-0 group-hover:opacity-20 blur transition-opacity duration-300" />
                <ShoppingBag className="relative w-7 h-7 text-blue-600 dark:text-blue-400 transition-transform group-hover:scale-110" />
              </div>
              <div className="hidden sm:block">
                <TextLogo />
              </div>
            </Link>

            {/* Desktop navigation */}
            <div className="hidden lg:flex items-center gap-1 xl:gap-2">
              {navLinks.filter(link => link.category === 'main').map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 hover:scale-105 ${pathname === href
                    ? 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/20 shadow-sm'
                    : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                    }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{label}</span>
                </Link>
              ))}
            </div>

            {/* Search bar - Enhanced mobile */}
            <div className="flex-1 max-w-md mx-4 lg:mx-8">
              <div className={`relative transition-all duration-300 ${isSearchFocused ? 'scale-105' : ''
                }`}>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl opacity-0 transition-opacity duration-300 peer-focus:opacity-100" />
                <div className="relative bg-gray-50 dark:bg-gray-800/50 rounded-2xl overflow-hidden border border-gray-200/50 dark:border-gray-700/50 hover:border-blue-300 dark:hover:border-blue-600 transition-colors duration-200">
                  <Search
                    products={products}
                    onFocus={() => setIsSearchFocused(true)}
                    onBlur={() => setIsSearchFocused(false)}
                  />
                </div>
              </div>
            </div>

            {/* Right side actions */}
            <div className="flex items-center gap-2">

              {/* Desktop actions */}
              <div className="hidden lg:flex items-center gap-2">
                {/* Sell button - Prominent */}
                <Link
                  href="/dashboard/add"
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-semibold shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>Vendre</span>
                </Link>

                {/* Notifications */}
                <button className="p-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-xl transition-all duration-200 hover:scale-105 relative">
                  <Bell className="w-5 h-5" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white dark:border-gray-900" />
                </button>

                {/* Messages */}
                <button className="p-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-xl transition-all duration-200 hover:scale-105">
                  <MessageSquare className="w-5 h-5" />
                </button>

                <ThemeToggle />

                {/* User avatar */}
                {user && (
                  <DropdownMenu>
                    <DropdownMenuTrigger className="focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-full">
                      <div className="relative group">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full opacity-0 group-hover:opacity-100 blur transition-opacity duration-300" />
                        <Image
                          src={avatar || 'https://icons.veryicon.com/png/o/miscellaneous/standard/avatar-15.png'}
                          alt="Profile"
                          width={36}
                          height={36}
                          className="relative rounded-full border-2 border-white dark:border-gray-800 shadow-sm"
                        />
                      </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuItem onClick={() => router.push(`/profile/${user.id}`)}>
                        <User className="w-4 h-4 mr-2" /> Voir mon profil
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => router.push('/dashboard/products')}>
                        <ShoppingBag className="w-4 h-4 mr-2" /> Mes produits
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => router.push('/favoris')}>
                        <Heart className="w-4 h-4 mr-2" /> Mes favoris
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                        <LogOut className="w-4 h-4 mr-2" /> Déconnexion
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>

              {/* Mobile menu button - Enhanced design */}
              <div className="lg:hidden flex items-center gap-2">
                <ThemeToggle />
                <button
                  onClick={() => setOpen(!open)}
                  className={`relative p-2 rounded-xl transition-all duration-300 ${open
                    ? 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400'
                    : 'bg-gray-50 text-gray-600 dark:bg-gray-800/50 dark:text-gray-300 hover:bg-blue-50 hover:text-blue-600'
                    }`}
                  aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
                >
                  <div className="relative w-6 h-6">
                    <Menu className={`absolute inset-0 w-6 h-6 transition-all duration-300 ${open ? 'rotate-180 opacity-0 scale-50' : 'rotate-0 opacity-100 scale-100'
                      }`} />
                    <X className={`absolute inset-0 w-6 h-6 transition-all duration-300 ${open ? 'rotate-0 opacity-100 scale-100' : '-rotate-180 opacity-0 scale-50'
                      }`} />
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Categories bar - Enhanced design */}
          <div className="hidden lg:flex items-center gap-1 py-3 border-t border-gray-100 dark:border-gray-800/50 overflow-x-auto scrollbar-none">
            <button
              onClick={resetCategory}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 hover:scale-105 shrink-0 ${!category
                ? 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/20 shadow-sm'
                : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                }`}
            >
              <span className="text-base">🏷️</span>
              <span>Tout voir</span>
            </button>
            {categories.map((cat) => (
              <button
                key={cat.label}
                onClick={() => handleCategory(cat.label)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 hover:scale-105 shrink-0 ${category === cat.label
                  ? 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/20 shadow-sm'
                  : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                  }`}
              >
                <span className="text-base">{cat.emoji}</span>
                <span className="capitalize">{cat.label.replace('_', ' ')}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Mobile menu overlay */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" onClick={() => setOpen(false)}>
          <div
            ref={mobileMenuRef}
            className="absolute right-0 top-0 h-full w-full max-w-sm bg-white dark:bg-gray-900 shadow-2xl overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Menu header */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <ShoppingBag className="w-8 h-8 text-blue-600" />
                  <TextLogo />
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* User info mobile */}
              {user && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                  <Image
                    src={avatar || 'https://icons.veryicon.com/png/o/miscellaneous/standard/avatar-15.png'}
                    alt="Profile"
                    width={40}
                    height={40}
                    className="rounded-full border-2 border-blue-200 dark:border-blue-800"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 dark:text-white truncate">Mon compte</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Gérer mon profil</p>
                  </div>
                </div>
              )}
            </div>

            {/* Navigation sections */}
            <div className="p-6 space-y-8">

              {/* Quick actions */}
              <div>
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-4">Actions rapides</h3>
                <div className="space-y-2">
                  <Link
                    href="/dashboard/add"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    <span className="font-medium">Vendre un produit</span>
                  </Link>
                  <Link
                    href="/favoris"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 p-3 bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 rounded-xl transition-colors"
                  >
                    <Heart className="w-5 h-5" />
                    <span className="font-medium">Mes favoris</span>
                  </Link>
                </div>
              </div>

              {/* Navigation */}
              <div>
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-4">Navigation</h3>
                <div className="space-y-1">
                  {navLinks.map(({ href, label, icon: Icon }) => (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setOpen(false)}
                      className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-200 ${pathname === href
                        ? 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/20'
                        : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                        }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{label}</span>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Categories */}
              <div>
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-4">Catégories</h3>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={resetCategory}
                    className={`flex items-center gap-2 p-3 rounded-xl text-sm font-medium transition-all duration-200 ${!category
                      ? 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/20'
                      : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                      }`}
                  >
                    <span className="text-lg">🏷️</span>
                    <span>Tout</span>
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat.label}
                      onClick={() => handleCategory(cat.label)}
                      className={`flex items-center gap-2 p-3 rounded-xl text-sm font-medium transition-all duration-200 ${category === cat.label
                        ? 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/20'
                        : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                        }`}
                    >
                      <span className="text-lg">{cat.emoji}</span>
                      <span className="capitalize text-xs">{cat.label.replace('_', ' ')}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Account actions */}
              {user && (
                <div className="border-t border-gray-200 dark:border-gray-800 pt-6">
                  <div className="space-y-2">
                    <Link
                      href={`/profile/${user.id}`}
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-3 p-3 text-gray-600 dark:text-gray-300 hover:text-blue-600 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-xl transition-all duration-200"
                    >
                      <User className="w-5 h-5" />
                      <span className="font-medium">Mon profil</span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 p-3 w-full text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all duration-200"
                    >
                      <LogOut className="w-5 h-5" />
                      <span className="font-medium">Déconnexion</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Spacer for fixed navbar */}
      <div className="h-16 lg:h-28" />
    </>
  )
}