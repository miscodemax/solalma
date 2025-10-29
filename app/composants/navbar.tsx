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

        <div className="max-w-7xl mx-auto px-3 sm:px-4">
          {/* Main bar - Compact */}
          <div className="flex items-center justify-between h-14">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-1.5 group flex-shrink-0">
              <div className="w-7 h-7 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-lg flex items-center justify-center shadow group-hover:shadow-lg transition-all">
                <ShoppingBag className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="hidden sm:block font-bold text-base bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                Shop
              </span>
            </Link>

            {/* Desktop navigation - Compact */}
            <div className="hidden lg:flex items-center gap-1 flex-shrink-0">
              {navLinks.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    pathname === href
                      ? 'text-yellow-600 bg-yellow-50 dark:text-yellow-400 dark:bg-yellow-900/30'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span className="hidden xl:inline">{label}</span>
                </Link>
              ))}
            </div>

            {/* Search - Expandable on mobile, always visible on desktop */}
            <div className="flex-1 max-w-md mx-2 sm:mx-4">
              <div ref={searchRef} className="relative">
                {searchExpanded || typeof window !== 'undefined' && window.innerWidth >= 640 ? (
                  <div className="relative">
                    <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                    <div className="pl-8 pr-2 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 focus-within:border-yellow-500 focus-within:ring-1 focus-within:ring-yellow-500 transition-all">
                      <Search products={products} />
                    </div>
                    <button
                      onClick={() => setSearchExpanded(false)}
                      className="sm:hidden absolute right-2 top-1/2 -translate-y-1/2 p-1"
                    >
                      <X className="w-3.5 h-3.5 text-gray-400" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setSearchExpanded(true)}
                    className="sm:hidden w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center"
                  >
                    <SearchIcon className="w-3.5 h-3.5 text-gray-600 dark:text-gray-300" />
                  </button>
                )}
              </div>
            </div>

            {/* Right actions - Compact */}
            <div className="flex items-center gap-1.5 flex-shrink-0">
              {/* Sell button - Compact */}
              <Link href="/dashboard/add">
                <Button className="h-8 px-3 text-xs font-semibold bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg shadow-sm">
                  <Plus className="w-3.5 h-3.5 lg:mr-1" />
                  <span className="hidden lg:inline">Vendre</span>
                </Button>
              </Link>

              {/* Theme toggle - Desktop only */}
              <div className="hidden lg:block">
                <ThemeToggle />
              </div>

              {/* User menu - Desktop */}
              {user && (
                <DropdownMenu>
                  <DropdownMenuTrigger className="hidden lg:block focus:outline-none">
                    <Image
                      src={avatar || 'https://icons.veryicon.com/png/o/miscellaneous/standard/avatar-15.png'}
                      alt="Profile"
                      width={32}
                      height={32}
                      className="rounded-lg border border-gray-200 dark:border-gray-700 hover:border-yellow-400 transition-all"
                    />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 p-1">
                    <DropdownMenuItem onClick={() => router.push(`/profile/${user.id}`)} className="rounded-md text-xs py-2">
                      <User className="w-3.5 h-3.5 mr-2" /> Mon profil
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push('/dashboard/products')} className="rounded-md text-xs py-2">
                      <ShoppingBag className="w-3.5 h-3.5 mr-2" /> Mes produits
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push('/favoris')} className="rounded-md text-xs py-2">
                      <Heart className="w-3.5 h-3.5 mr-2" /> Favoris
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push('/settings')} className="rounded-md text-xs py-2">
                      <Settings className="w-3.5 h-3.5 mr-2" /> Paramètres
                    </DropdownMenuItem>
                    <div className="border-t my-1" />
                    <DropdownMenuItem onClick={handleLogout} className="rounded-md text-xs py-2 text-red-600">
                      <LogOut className="w-3.5 h-3.5 mr-2" /> Déconnexion
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              {/* Mobile menu button */}
              <button
                onClick={() => setOpen(!open)}
                className="lg:hidden p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Categories bar - Compact */}
          <div className="overflow-x-auto scrollbar-hide -mx-3 px-3">
            <div className="flex items-center gap-1 py-2 min-w-max">
              <button
                onClick={resetCategory}
                className={`flex-shrink-0 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                  !category
                    ? 'text-white bg-yellow-500 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
              >
                Tout
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.label}
                  onClick={() => handleCategory(cat.label)}
                  className={`flex-shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                    category === cat.label
                      ? `${cat.color} shadow-sm`
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                >
                  <span className="text-sm">{cat.emoji}</span>
                  <span className="hidden sm:inline capitalize">{cat.label.replace('_', ' ')}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-[100] lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          
          <div className="absolute top-0 right-0 w-80 h-full bg-white dark:bg-gray-900 shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-2">
                {user && (
                  <Image
                    src={avatar || 'https://icons.veryicon.com/png/o/miscellaneous/standard/avatar-15.png'}
                    alt="Profile"
                    width={32}
                    height={32}
                    className="rounded-lg"
                  />
                )}
                <div className="text-sm">
                  <p className="font-semibold">{user?.user_metadata?.full_name || 'Invité'}</p>
                  <p className="text-xs text-gray-500">{user?.email || 'Non connecté'}</p>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="flex flex-col h-full overflow-y-auto">
              <div className="p-3 space-y-1">
                {navLinks.map(({ href, label, icon: Icon }) => (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setOpen(false)}
                    className={`flex items-center gap-3 p-3 rounded-lg text-sm font-medium transition-all ${
                      pathname === href
                        ? 'text-yellow-600 bg-yellow-50 dark:text-yellow-400 dark:bg-yellow-900/30'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </Link>
                ))}
              </div>

              {/* Categories */}
              <div className="p-3 border-t border-gray-200 dark:border-gray-800">
                <h3 className="text-xs font-semibold uppercase text-gray-500 mb-2 px-3">Catégories</h3>
                <div className="space-y-1">
                  {categories.map((cat) => (
                    <button
                      key={cat.label}
                      onClick={() => handleCategory(cat.label)}
                      className={`w-full flex items-center gap-2 p-2.5 rounded-lg text-sm font-medium transition-all ${
                        category === cat.label
                          ? `${cat.color}`
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                        }`}
                    >
                      <span className="text-base">{cat.emoji}</span>
                      <span className="capitalize">{cat.label.replace('_', ' ')}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Bottom */}
              {user && (
                <div className="mt-auto p-3 border-t border-gray-200 dark:border-gray-800">
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full p-3 rounded-lg text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 font-medium"
                  >
                    <LogOut className="w-4 h-4" />
                    Se déconnecter
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Spacer - Réduit */}
      <div className="h-[104px]" />

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