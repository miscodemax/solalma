'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import {
  DropdownMenu, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  HomeIcon, ShoppingCart, User, Menu, X, LogOut, Heart, ShoppingBag,
  Search as SearchIcon, Plus, Bell, MessageCircle, Settings
} from 'lucide-react'
import { ThemeToggle } from './theme-toggle'
import TextLogo from './textLogo'
import { createClient } from '@/lib/supabase'
import Image from 'next/image'
import Search from './search'

const categories = [
  { label: 'vetement', emoji: '👗', color: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400' },
  { label: 'artisanat', emoji: '🎨', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' },
  { label: 'maquillage', emoji: '💄', color: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400' },
  { label: 'soins_et_astuces', emoji: '🧴', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  { label: 'electronique', emoji: '📱', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  { label: 'accessoire', emoji: '💎', color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400' },
  { label: 'chaussure', emoji: '👟', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' },
]

const navLinks = [
  { href: '/', icon: HomeIcon, label: 'Accueil', badge: null },
  { href: '/about', icon: ShoppingCart, label: 'À propos', badge: null },
  { href: '/dashboard/products', icon: ShoppingBag, label: 'Mes produits', badge: null },
  { href: '/favoris', icon: Heart, label: 'Favoris', badge: null },
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
  const [searchExpanded, setSearchExpanded] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [avatar, setAvatar] = useState('')
  const [scrolled, setScrolled] = useState(false)
  const [categoriesExpanded, setCategoriesExpanded] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const category = searchParams.get('category')
  const supabase = createClient()
  const mobileMenuRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLDivElement>(null)

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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setSearchExpanded(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
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
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
        ? 'bg-white/98 dark:bg-gray-900/98 backdrop-blur-xl shadow-lg border-b border-gray-200/50 dark:border-gray-700/30'
        : 'bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg'
        }`}>

        <div className="max-w-7xl mx-auto px-3 sm:px-6">
          {/* Top bar - Mobile */}
          <div className="lg:hidden flex items-center justify-between h-16 relative">
            {/* Logo mobile */}
            <Link href="/" className="flex items-center gap-2 group z-10">
              <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all group-hover:scale-105">
                <ShoppingBag className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-lg bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                Shop
              </span>
            </Link>

            {/* Search bar mobile - Expandable */}
            <div
              ref={searchRef}
              className={`absolute left-1/2 transform -translate-x-1/2 transition-all duration-300 ${searchExpanded
                ? 'w-[calc(100%-140px)] bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700'
                : 'w-10 h-10'
                }`}
            >
              {searchExpanded ? (
                <div className="p-3">
                  <div className="relative">
                    <Search products={products} />
                    <button
                      onClick={() => setSearchExpanded(false)}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setSearchExpanded(true)}
                  className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  <SearchIcon className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                </button>
              )}
            </div>

            {/* Right actions mobile */}
            <div className="flex items-center gap-2">
              {/* Notifications */}
              <button className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors">
                <Bell className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  2
                </span>
              </button>

              {/* Menu button */}
              <button
                onClick={() => setOpen(!open)}
                className={`relative p-2 rounded-xl transition-all duration-200 ${open
                  ? 'bg-red-100 dark:bg-red-900/30'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
              >
                <div className="w-6 h-6 relative">
                  <div className={`absolute top-1 left-0 w-6 h-0.5 bg-current transition-all duration-300 ${open ? 'rotate-45 translate-y-2.5' : ''
                    }`} />
                  <div className={`absolute top-2.5 left-0 w-6 h-0.5 bg-current transition-all duration-300 ${open ? 'opacity-0' : ''
                    }`} />
                  <div className={`absolute top-4 left-0 w-6 h-0.5 bg-current transition-all duration-300 ${open ? '-rotate-45 -translate-y-2.5' : ''
                    }`} />
                </div>
              </button>
            </div>
          </div>

          {/* Desktop layout */}
          <div className="hidden lg:flex items-center justify-between h-18 py-3">
            {/* Logo desktop */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all group-hover:scale-105">
                <ShoppingBag className="w-5 h-5 text-white" />
              </div>
              <TextLogo />
            </Link>

            {/* Desktop navigation */}
            <div className="flex items-center gap-1">
              {navLinks.map(({ href, label, icon: Icon, badge }) => (
                <Link
                  key={href}
                  href={href}
                  className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${pathname === href
                    ? 'text-yellow-600 bg-yellow-50 dark:text-yellow-400 dark:bg-yellow-900/30 shadow-md'
                    : 'text-gray-600 dark:text-gray-300 hover:text-yellow-600 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                    }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{label}</span>
                  {badge && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {badge}
                    </span>
                  )}
                </Link>
              ))}
            </div>

            {/* Search desktop */}
            <div className="flex-1 max-w-md mx-8">
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <SearchIcon className="w-4 h-4 text-gray-400 group-focus-within:text-yellow-500" />
                </div>
                <div className="pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800/70 rounded-2xl border border-gray-200/50 dark:border-gray-700/50 hover:border-yellow-400 dark:hover:border-yellow-500 focus-within:border-yellow-500 focus-within:ring-2 focus-within:ring-yellow-500/20 transition-all">
                  <Search products={products} />
                </div>
              </div>
            </div>

            {/* Right actions desktop */}
            <div className="flex items-center gap-3">
              {/* Sell button */}
              <Link
                href="/dashboard/add"
                className="group relative flex items-center gap-2 px-6 py-2.5 
                         bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700
                         text-white rounded-2xl font-semibold shadow-lg hover:shadow-xl
                         transition-all duration-200 hover:scale-105 overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                <Plus className="w-4 h-4 relative z-10" />
                <span className="relative z-10">Vendre</span>
              </Link>



              <ThemeToggle />

              {/* User profile */}
              {user && (
                <DropdownMenu>
                  <DropdownMenuTrigger className="focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 rounded-2xl">
                    <div className="relative group">
                      <Image
                        src={avatar || 'https://icons.veryicon.com/png/o/miscellaneous/standard/avatar-15.png'}
                        alt="Profile"
                        width={40}
                        height={40}
                        className="rounded-2xl border-2 border-gray-200 dark:border-gray-700 group-hover:border-yellow-400 transition-all duration-200 shadow-md"
                      />
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full" />
                    </div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 p-2 border-0 shadow-2xl rounded-2xl">
                    <DropdownMenuItem onClick={() => router.push(`/profile/${user.id}`)} className="rounded-xl p-3">
                      <User className="w-4 h-4 mr-3" /> Mon profil
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push('/dashboard/products')} className="rounded-xl p-3">
                      <ShoppingBag className="w-4 h-4 mr-3" /> Mes produits
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push('/favoris')} className="rounded-xl p-3">
                      <Heart className="w-4 h-4 mr-3" /> Favoris
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push('/settings')} className="rounded-xl p-3">
                      <Settings className="w-4 h-4 mr-3" /> Paramètres
                    </DropdownMenuItem>
                    <div className="border-t my-2" />
                    <DropdownMenuItem onClick={handleLogout} className="rounded-xl p-3 text-red-600 focus:text-red-600">
                      <LogOut className="w-4 h-4 mr-3" /> Déconnexion
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>

          {/* Categories bar */}
          <div className="hidden lg:block border-t border-gray-100 dark:border-gray-800/50 py-3">
            <div className="flex items-center gap-2">
              <button
                onClick={resetCategory}
                className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-medium transition-all duration-200 hover:scale-105 ${!category
                  ? 'text-white bg-gradient-to-r from-yellow-500 to-yellow-600 shadow-lg'
                  : 'text-gray-600 dark:text-gray-300 hover:text-yellow-600 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                  }`}
              >
                🏷️ Toutes les catégories
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.label}
                  onClick={() => handleCategory(cat.label)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-medium transition-all duration-200 hover:scale-105 ${category === cat.label
                    ? `${cat.color} shadow-lg ring-2 ring-offset-2 ring-current/20`
                    : 'text-gray-600 dark:text-gray-300 hover:text-yellow-600 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                    }`}
                >
                  <span className="text-base">{cat.emoji}</span>
                  <span className="capitalize">{cat.label.replace('_', ' & ')}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Mobile categories */}
          <div className="lg:hidden border-t border-gray-100 dark:border-gray-800/50 py-3">
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1">
              <button
                onClick={resetCategory}
                className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-medium transition-all duration-200 ${!category
                  ? 'text-white bg-gradient-to-r from-yellow-500 to-yellow-600 shadow-lg'
                  : 'text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800'
                  }`}
              >
                🏷️ Tout
              </button>
              {categories.slice(0, 4).map((cat) => (
                <button
                  key={cat.label}
                  onClick={() => handleCategory(cat.label)}
                  className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-medium transition-all duration-200 ${category === cat.label
                    ? `${cat.color} shadow-lg`
                    : 'text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800'
                    }`}
                >
                  <span>{cat.emoji}</span>
                  <span className="capitalize">{cat.label.split('_')[0]}</span>
                </button>
              ))}
              <button
                onClick={() => setCategoriesExpanded(!categoriesExpanded)}
                className="flex-shrink-0 px-4 py-2 rounded-2xl text-sm font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                +{categories.length - 4}
              </button>
            </div>
          </div>

        </div>
      </nav>

      {/* Mobile drawer overlay */}
      {open && (
        <div className="fixed inset-0 z-[100] lg:hidden">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-all duration-300"
            onClick={() => setOpen(false)}
          />

          {/* Sliding drawer */}
          <div className="absolute top-0 right-0 w-full max-w-sm h-full bg-white dark:bg-gray-900 shadow-2xl transform transition-transform duration-300 ease-out">

            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-gray-800 dark:to-gray-800">
              <div className="flex items-center gap-3">
                {user && (
                  <Image
                    src={avatar || 'https://icons.veryicon.com/png/o/miscellaneous/standard/avatar-15.png'}
                    alt="Profile"
                    width={40}
                    height={40}
                    className="rounded-2xl border-2 border-white shadow-md"
                  />
                )}
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {user?.user_metadata?.full_name || 'Invité'}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {user?.email || 'Non connecté'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="p-2 rounded-xl hover:bg-white/50 dark:hover:bg-gray-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex flex-col h-full">

              {/* Quick sell button */}
              <div className="p-4 border-b border-gray-100 dark:border-gray-800">
                <Link
                  href="/dashboard/add"
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-center gap-3 w-full py-4 px-6
                           bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700
                           text-white rounded-2xl font-bold shadow-xl hover:shadow-2xl
                           transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Plus className="w-5 h-5" />
                  Vendre un article
                </Link>
              </div>

              {/* Navigation */}
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {navLinks.map(({ href, label, icon: Icon, badge }) => (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setOpen(false)}
                    className={`flex items-center gap-4 p-4 rounded-2xl font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] ${pathname === href
                      ? 'text-yellow-600 bg-yellow-50 dark:text-yellow-400 dark:bg-yellow-900/30 shadow-lg'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`}
                  >
                    <div className="relative">
                      <Icon className="w-6 h-6" />
                      {badge && (
                        <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                          {badge}
                        </span>
                      )}
                    </div>
                    <span className="text-base">{label}</span>
                  </Link>
                ))}

                {/* Categories in mobile drawer */}
                <div className="pt-6">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 px-4 mb-3">
                    Catégories
                  </h3>
                  <div className="space-y-1">
                    {categories.map((cat) => (
                      <button
                        key={cat.label}
                        onClick={() => handleCategory(cat.label)}
                        className={`w-full flex items-center gap-3 p-3 rounded-2xl text-left font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] ${category === cat.label
                          ? `${cat.color} shadow-lg`
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                          }`}
                      >
                        <span className="text-xl">{cat.emoji}</span>
                        <span className="capitalize">{cat.label.replace('_', ' & ')}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom section */}
              {user && (
                <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full p-4 rounded-2xl text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <LogOut className="w-5 h-5" />
                    Se déconnecter
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Spacer */}
      <div className="h-16 lg:h-24" />

      {/* Styles */}
      <style jsx global>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        
        @keyframes slideInRight {
          from { 
            transform: translateX(100%); 
            opacity: 0;
          }
          to { 
            transform: translateX(0); 
            opacity: 1;
          }
        }
        
        .animate-slide-in {
          animation: slideInRight 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }

        /* Smooth scrolling for horizontal categories */
        .categories-scroll {
          scroll-behavior: smooth;
          -webkit-overflow-scrolling: touch;
        }

        /* Enhanced hover states */
        .nav-item-hover {
          transition: all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }
        
        .nav-item-hover:hover {
          transform: translateY(-1px);
        }
        
        .nav-item-hover:active {
          transform: translateY(0);
        }
      `}</style>
    </>
  )
}