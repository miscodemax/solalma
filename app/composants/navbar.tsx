'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import {
  DropdownMenu, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import {
  Home, ShoppingCart, User, X, LogOut, Heart, ShoppingBag,
  Search as SearchIcon, Plus, Settings, Menu
} from 'lucide-react'
import { ThemeToggle } from './theme-toggle'
import TextLogo from './textLogo'
import { createClient } from '@/lib/supabase'
import Image from 'next/image'
import Search from './search'

const categories = [
  { label: 'vetement', emoji: '👗', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  { label: 'artisanat', emoji: '🧶', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' },
  { label: 'maquillage', emoji: '💋', color: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400' },
  { label: 'soins_et_astuces', emoji: '🧴', color: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400' },
  { label: 'electronique', emoji: '💻', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  { label: 'accessoire', emoji: '🕶️', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' },
  { label: 'chaussure', emoji: '👠', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
  { label: 'otaku', emoji: '🎌', color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400' },
]

const navLinks = [
  { href: '/', icon: Home, label: 'Accueil', badge: null },
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
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const category = searchParams.get('category')
  const supabase = createClient()
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
    const handleScroll = () => setScrolled(window.scrollY > 5)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = 'unset'
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
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
        scrolled
          ? 'bg-white/98 dark:bg-gray-900/98 shadow-md'
          : 'bg-white dark:bg-gray-900'
        } border-b border-gray-200 dark:border-gray-800`}>

        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
          {/* Main bar */}
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group flex-shrink-0">
              <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-all group-hover:scale-105">
                <ShoppingBag className="w-4 h-4 text-white" />
              </div>
              <span className="hidden sm:block font-bold text-lg bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                <TextLogo />
              </span>
            </Link>

           

            {/* Desktop navigation */}
            <div className="hidden lg:flex items-center gap-1 flex-shrink-0">
              {navLinks.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                    pathname === href
                      ? 'text-yellow-600 bg-yellow-50 dark:text-yellow-400 dark:bg-yellow-900/30 shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{label}</span>
                </Link>
              ))}
            </div>

            {/* Search */}
            <div className="flex-1 max-w-lg mx-3 sm:mx-6">
              <div ref={searchRef} className="relative">
                {searchExpanded || typeof window !== 'undefined' && window.innerWidth >= 640 ? (
                  <div className="relative">
                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <div className="pl-10 pr-3 py-2 bg-gray-50 dark:bg-gray-800/70 rounded-xl border border-gray-200 dark:border-gray-700 focus-within:border-yellow-500 focus-within:ring-2 focus-within:ring-yellow-500/20 transition-all">
                      <Search products={products} />
                    </div>
                    <button
                      onClick={() => setSearchExpanded(false)}
                      className="sm:hidden absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setSearchExpanded(true)}
                    className="sm:hidden w-9 h-9 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  >
                    <SearchIcon className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                  </button>
                )}
              </div>
            </div>

            {/* Right actions */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {/* Sell button */}
              <Link href="/dashboard/add">
                <Button className="h-9 px-4 text-sm font-semibold bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white rounded-xl shadow-md hover:shadow-lg transition-all hover:scale-105">
                  <Plus className="w-4 h-4 mr-1.5" />
                  <span className="hidden sm:inline">Vendre</span>
                </Button>
              </Link>

              {/* Theme toggle - Desktop only */}
              <div className="hidden lg:block">
                <ThemeToggle />
              </div>

              {/* User menu - Desktop */}
              {user && (
                <DropdownMenu>
                  <DropdownMenuTrigger className="hidden lg:block focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 rounded-xl">
                    <div className="relative group">
                      <Image
                        src={avatar || 'https://icons.veryicon.com/png/o/miscellaneous/standard/avatar-15.png'}
                        alt="Profile"
                        width={36}
                        height={36}
                        className="rounded-xl border-2 border-gray-200 dark:border-gray-700 group-hover:border-yellow-400 transition-all shadow-sm"
                      />
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full" />
                    </div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-52 p-2 border-0 shadow-xl rounded-xl">
                    <DropdownMenuItem onClick={() => router.push(`/profile/${user.id}`)} className="rounded-lg p-2.5 text-sm cursor-pointer">
                      <User className="w-4 h-4 mr-2.5" /> Mon profil
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push('/dashboard/products')} className="rounded-lg p-2.5 text-sm cursor-pointer">
                      <ShoppingBag className="w-4 h-4 mr-2.5" /> Mes produits
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push('/favoris')} className="rounded-lg p-2.5 text-sm cursor-pointer">
                      <Heart className="w-4 h-4 mr-2.5" /> Favoris
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push('/settings')} className="rounded-lg p-2.5 text-sm cursor-pointer">
                      <Settings className="w-4 h-4 mr-2.5" /> Paramètres
                    </DropdownMenuItem>
                    <div className="border-t my-2" />
                    <DropdownMenuItem onClick={handleLogout} className="rounded-lg p-2.5 text-sm text-red-600 focus:text-red-600 cursor-pointer">
                      <LogOut className="w-4 h-4 mr-2.5" /> Déconnexion
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              {/* Mobile menu button */}
              <button
                onClick={() => setOpen(!open)}
                className="lg:hidden p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Categories bar */}
          <div className="overflow-x-auto scrollbar-hide -mx-3 px-3 lg:-mx-6 lg:px-6">
            <div className="flex items-center gap-2 py-2.5 min-w-max">
              <button
                onClick={resetCategory}
                className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition-all hover:scale-105 ${
                  !category
                    ? 'text-white bg-gradient-to-r from-yellow-500 to-yellow-600 shadow-md'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
              >
                <span>🏷️</span>
                <span>Tout</span>
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.label}
                  onClick={() => handleCategory(cat.label)}
                  className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition-all hover:scale-105 ${
                    category === cat.label
                      ? `${cat.color} shadow-md ring-2 ring-offset-1 ring-current/20`
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                >
                  <span>{cat.emoji}</span>
                  <span className="capitalize">{cat.label.replace('_', ' ')}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-[100] lg:hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setOpen(false)} />
          
          <div className="absolute top-0 right-0 w-full max-w-sm h-full bg-white dark:bg-gray-900 shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-gray-800 dark:to-gray-800">
              <div className="flex items-center gap-3">
                {user && (
                  <Image
                    src={avatar || 'https://icons.veryicon.com/png/o/miscellaneous/standard/avatar-15.png'}
                    alt="Profile"
                    width={40}
                    height={40}
                    className="rounded-xl border-2 border-white shadow-md"
                  />
                )}
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white text-sm">
                    {user?.user_metadata?.full_name || 'Invité'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
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
            <div className="flex flex-col h-full overflow-y-auto pb-20">
              {/* Quick sell button */}
              <div className="p-4 border-b border-gray-100 dark:border-gray-800">
                <Link
                  href="/dashboard/add"
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-center gap-2 w-full py-3 px-5
                           bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700
                           text-white rounded-xl font-bold shadow-lg hover:shadow-xl
                           transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Plus className="w-5 h-5" />
                  Vendre un article
                </Link>
              </div>

              {/* Navigation */}
              <div className="p-3 space-y-1">
                {navLinks.map(({ href, label, icon: Icon }) => (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setOpen(false)}
                    className={`flex items-center gap-3 p-3 rounded-xl font-medium transition-all hover:scale-[1.02] active:scale-[0.98] ${
                      pathname === href
                        ? 'text-yellow-600 bg-yellow-50 dark:text-yellow-400 dark:bg-yellow-900/30 shadow-md'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{label}</span>
                  </Link>
                ))}
              </div>

              {/* Categories */}
              <div className="p-3 border-t border-gray-100 dark:border-gray-800">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 px-3 mb-2">
                  Catégories
                </h3>
                <div className="space-y-1">
                  {categories.map((cat) => (
                    <button
                      key={cat.label}
                      onClick={() => handleCategory(cat.label)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl font-medium transition-all hover:scale-[1.02] active:scale-[0.98] ${
                        category === cat.label
                          ? `${cat.color} shadow-md`
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                        }`}
                    >
                      <span className="text-lg">{cat.emoji}</span>
                      <span className="capitalize">{cat.label.replace('_', ' ')}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Bottom section */}
              {user && (
                <div className="mt-auto p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full p-3 rounded-xl text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 font-medium transition-all hover:scale-[1.02] active:scale-[0.98]"
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
      <div className="h-[110px] sm:h-[120px]" />

      <style jsx global>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </>
  )
}