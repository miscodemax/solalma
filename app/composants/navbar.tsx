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
  Search as SearchIcon, Settings
} from 'lucide-react'
import { ThemeToggle } from './theme-toggle'
import TextLogo from './textLogo'
import { createClient } from '@/lib/supabase'
import Image from 'next/image'

const categories = [
  { label: 'vetement', emoji: '👗', color: 'from-pink-400 to-rose-600' },
  { label: 'artisanat', emoji: '🎨', color: 'from-purple-400 to-indigo-600' },
  { label: 'maquillage', emoji: '💄', color: 'from-red-400 to-pink-600' },
  { label: 'soins_et_astuces', emoji: '🧴', color: 'from-green-400 to-teal-600' },
  { label: 'electronique', emoji: '📱', color: 'from-blue-400 to-cyan-600' },
  { label: 'accessoire', emoji: '💎', color: 'from-yellow-400 to-orange-600' },
  { label: 'chaussure', emoji: '👟', color: 'from-gray-400 to-slate-600' },
]

const navLinks = [
  { href: '/', icon: HomeIcon, label: 'Accueil', color: 'text-blue-600' },
  { href: '/about', icon: User, label: 'À propos', color: 'text-green-600' },
  { href: '/dashboard/products', icon: ShoppingBag, label: 'Mes produits', color: 'text-purple-600' },
  { href: '/favoris', icon: Heart, label: 'Favoris', color: 'text-red-600' },
]

// Fake search data (à remplacer par ton fetch côté serveur/DB si tu veux des suggestions live)
const demoProducts = [
  { id: 1, title: "Robe d'été fleurie", category: "vetement" },
  { id: 2, title: "Bracelet artisanal", category: "accessoire" },
  { id: 3, title: "Crème hydratante visage", category: "soins_et_astuces" },
  { id: 4, title: "iPhone 14 Pro", category: "electronique" },
  { id: 5, title: "Palette maquillage rainbow", category: "maquillage" },
  { id: 6, title: "Sneakers blanches", category: "chaussure" },
  { id: 7, title: "Sac à main bohème", category: "vetement" },
  // ...etc
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [avatar, setAvatar] = useState('')
  const [scrolled, setScrolled] = useState(false)
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [searchValue, setSearchValue] = useState('')
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [highlighted, setHighlighted] = useState(-1)
  const searchInputRef = useRef<HTMLInputElement>(null)
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

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    if (searchValue.trim().length > 0) {
      // Pour l'exemple, suggestions locales. Remplace par ton fetch asynchrone si besoin.
      const filtered = demoProducts.filter(
        (p) =>
          p.title.toLowerCase().includes(searchValue.trim().toLowerCase())
      )
      setSuggestions(filtered)
      setShowSuggestions(true)
      setHighlighted(-1)
    } else {
      setSuggestions([])
      setShowSuggestions(false)
    }
  }, [searchValue])

  useEffect(() => {
    if (showSuggestions && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [showSuggestions])

  // Fermeture suggestions si clic en dehors
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        searchInputRef.current &&
        !searchInputRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false)
      }
    }
    if (showSuggestions) document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [showSuggestions])

  const onSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchValue.trim() !== '') {
      router.push(`/?search=${encodeURIComponent(searchValue.trim())}`)
      setSearchValue('')
      setShowSuggestions(false)
    }
  }

  const onSuggestionClick = (title: string) => {
    setSearchValue(title)
    router.push(`/?search=${encodeURIComponent(title)}`)
    setShowSuggestions(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlighted(val => Math.min(val + 1, suggestions.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlighted(val => Math.max(val - 1, 0))
    } else if (e.key === 'Enter' && highlighted >= 0 && suggestions[highlighted]) {
      e.preventDefault()
      onSuggestionClick(suggestions[highlighted].title)
    } else if (e.key === 'Escape') {
      setShowSuggestions(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.refresh()
    setOpen(false)
  }

  const handleCategory = (cat: string) => {
    setActiveCategory(cat)
    router.push(`/?category=${encodeURIComponent(cat)}`)
    setOpen(false)
    setTimeout(() => setActiveCategory(null), 300)
  }

  const resetCategory = () => {
    setActiveCategory('all')
    router.push('/')
    setOpen(false)
    setTimeout(() => setActiveCategory(null), 300)
  }

  return (
    <>
      {/* Navigation principale */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
        ? 'bg-white/95 dark:bg-[#0A1A2F]/95 backdrop-blur-xl shadow-lg border-b border-gray-200/30 dark:border-gray-700/30'
        : 'bg-white/90 dark:bg-[#0A1A2F]/90 backdrop-blur-lg'
        }`}>
        <div className="max-w-7xl mx-auto px-2 sm:px-4">
          <div className="flex items-center justify-between h-16 lg:h-18">
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center gap-3 group transition-all duration-200 hover:scale-105"
              onClick={() => setOpen(false)}
            >
              <div className="relative">
                <ShoppingBag className="w-7 h-7 text-yellow-600 dark:text-yellow-400 transition-all duration-200 group-hover:rotate-12" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full animate-pulse opacity-75" />
              </div>
              <div className="hidden sm:block">
                <TextLogo />
              </div>
            </Link>

            {/* Recherche intelligente UX */}
            <div className="flex-1 flex items-center justify-center mx-2">
              <form
                className="relative w-full max-w-xs"
                onSubmit={onSearchSubmit}
                autoComplete="off"
              >
                <input
                  ref={searchInputRef}
                  type="search"
                  value={searchValue}
                  onChange={e => setSearchValue(e.target.value)}
                  placeholder="Rechercher un produit…"
                  className="w-full rounded-full bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 transition placeholder-gray-400 dark:placeholder-gray-500"
                  style={{
                    transition: 'box-shadow 0.2s, border 0.2s',
                    fontWeight: 500
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  onKeyDown={handleKeyDown}
                  aria-autocomplete="list"
                  aria-expanded={showSuggestions}
                  aria-controls="navbar-suggestions"
                  aria-activedescendant={highlighted >= 0 ? `suggestion-${highlighted}` : undefined}
                />
                <SearchIcon className="absolute left-2 top-1/2 -translate-y-1/2 text-yellow-500 w-4 h-4 pointer-events-none" />
                {searchValue && (
                  <button
                    type="button"
                    onClick={() => setSearchValue('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-400 focus:outline-none"
                    tabIndex={0}
                    aria-label="Effacer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
                {/* Suggestions dropdown */}
                {showSuggestions && suggestions.length > 0 && (
                  <ul
                    id="navbar-suggestions"
                    className="absolute left-0 right-0 mt-1 rounded-xl bg-white dark:bg-gray-900 shadow-lg border border-gray-100 dark:border-gray-800 z-30 max-h-56 overflow-auto animate-fade-in"
                  >
                    {suggestions.map((s, i) => (
                      <li
                        key={s.id}
                        id={`suggestion-${i}`}
                        className={`flex items-center gap-2 px-4 py-2 cursor-pointer transition-colors ${highlighted === i
                            ? 'bg-yellow-100 dark:bg-yellow-900/40'
                            : 'hover:bg-gray-50 dark:hover:bg-gray-800/60'
                          }`}
                        onMouseDown={() => onSuggestionClick(s.title)}
                        onMouseEnter={() => setHighlighted(i)}
                        aria-selected={highlighted === i}
                      >
                        <span className="text-lg">{categories.find(c => c.label === s.category)?.emoji || '🛒'}</span>
                        <span className="truncate">{s.title}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </form>
            </div>

            {/* Navigation desktop & actions */}
            <div className="hidden lg:flex items-center gap-2">
              {navLinks.map(({ href, label, icon: Icon, color }) => (
                <Link
                  key={href}
                  href={href}
                  className={`group flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 hover:scale-105 ${pathname === href
                    ? 'text-yellow-600 bg-gradient-to-r from-yellow-50 to-orange-50 dark:text-yellow-400 dark:bg-gradient-to-r dark:from-yellow-900/30 dark:to-orange-900/30 shadow-md'
                    : 'text-gray-600 dark:text-gray-300 hover:text-yellow-600 hover:bg-gray-50 dark:hover:bg-gray-800/60'
                    }`}
                >
                  <Icon className={`w-4 h-4 transition-colors ${pathname === href ? color : ''}`} />
                  <span>{label}</span>
                </Link>
              ))}
            </div>

            {/* Actions à droite */}
            <div className="flex items-center gap-2">
              {/* Bouton vendre desktop */}
              <Link
                href="/dashboard/add"
                className="hidden lg:flex items-center gap-2 px-5 py-2.5 
                           bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 
                           text-white rounded-xl font-medium shadow-lg hover:shadow-xl
                           transition-all duration-200 hover:scale-105 relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-12" />
                <ShoppingCart className="w-4 h-4 relative z-10" />
                <span className="relative z-10">Vendre</span>
              </Link>

              {/* Toggle thème */}
              <div className="hidden lg:block">
                <ThemeToggle />
              </div>

              {/* Profil utilisateur desktop */}
              {user && (
                <DropdownMenu>
                  <DropdownMenuTrigger className="hidden lg:block focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 rounded-full group">
                    <div className="relative">
                      <Image
                        src={avatar || 'https://icons.veryicon.com/png/o/miscellaneous/standard/avatar-15.png'}
                        alt="Profile"
                        width={36}
                        height={36}
                        className="rounded-full border-2 border-gray-200 dark:border-gray-700 group-hover:border-yellow-400 transition-all duration-200 group-hover:scale-110"
                      />
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-800" />
                    </div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-52 mt-2 bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg border border-gray-200/60 dark:border-gray-700/60 shadow-xl">
                    <DropdownMenuItem onClick={() => router.push(`/profile/${user.id}`)} className="group">
                      <User className="w-4 h-4 mr-3 text-blue-600 group-hover:scale-110 transition-transform" />
                      Mon profil
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push('/dashboard/products')} className="group">
                      <ShoppingBag className="w-4 h-4 mr-3 text-purple-600 group-hover:scale-110 transition-transform" />
                      Mes produits
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push('/favoris')} className="group">
                      <Heart className="w-4 h-4 mr-3 text-red-600 group-hover:scale-110 transition-transform" />
                      Favoris
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push('/settings')} className="group">
                      <Settings className="w-4 h-4 mr-3 text-gray-600 group-hover:scale-110 transition-transform" />
                      Paramètres
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleLogout} className="text-red-600 group">
                      <LogOut className="w-4 h-4 mr-3 group-hover:scale-110 transition-transform" />
                      Déconnexion
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              {/* Menu mobile */}
              <div className="lg:hidden flex items-center gap-2">
                <ThemeToggle />
                <button
                  onClick={() => setOpen(!open)}
                  className={`relative p-2.5 rounded-xl transition-all duration-300 overflow-hidden group ${open
                    ? 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400 shadow-lg scale-95'
                    : 'bg-gray-50/80 text-gray-600 dark:bg-gray-800/80 dark:text-gray-300 hover:bg-yellow-50 hover:text-yellow-600 hover:scale-105'
                    }`}
                  aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
                >
                  <div className="relative w-5 h-5">
                    <Menu
                      className={`absolute top-0 left-0 transition-all duration-300 ${open ? 'rotate-45 opacity-0 scale-75' : 'rotate-0 opacity-100 scale-100'
                        }`}
                    />
                    <X
                      className={`absolute top-0 left-0 transition-all duration-300 ${open ? 'rotate-0 opacity-100 scale-100' : '-rotate-45 opacity-0 scale-75'
                        }`}
                    />
                  </div>
                  {!open && (
                    <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-orange-400/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Barre de catégories */}
          <div className="flex items-center gap-2 py-3 border-t border-gray-100/60 dark:border-gray-800/60 overflow-x-auto scrollbar-hide">
            <button
              onClick={resetCategory}
              className={`group flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 relative overflow-hidden ${!category && activeCategory !== 'all'
                ? 'text-yellow-600 bg-gradient-to-r from-yellow-50 to-orange-50 dark:text-yellow-400 dark:from-yellow-900/30 dark:to-orange-900/30 shadow-md'
                : 'text-gray-600 dark:text-gray-300 hover:text-yellow-600 hover:bg-gray-50 dark:hover:bg-gray-800/60'
                } ${activeCategory === 'all' ? 'scale-95 bg-yellow-100 dark:bg-yellow-900/50' : 'hover:scale-105'}`}
            >
              🏷️ Tout
              {(!category || activeCategory === 'all') && (
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-6 h-0.5 bg-yellow-500 rounded-full" />
              )}
            </button>

            {categories.map((cat) => (
              <button
                key={cat.label}
                onClick={() => handleCategory(cat.label)}
                className={`group flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 relative overflow-hidden ${category === cat.label && activeCategory !== cat.label
                  ? `text-white bg-gradient-to-r ${cat.color} shadow-lg`
                  : 'text-gray-600 dark:text-gray-300 hover:text-yellow-600 hover:bg-gray-50 dark:hover:bg-gray-800/60'
                  } ${activeCategory === cat.label ? 'scale-95' : 'hover:scale-105'}`}
              >
                <span className="text-base">{cat.emoji}</span>
                <span className="capitalize">{cat.label.replace('_', ' ')}</span>
                {category === cat.label && activeCategory !== cat.label && (
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-6 h-0.5 bg-white rounded-full" />
                )}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Overlay pour les menus mobiles */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Menu mobile amélioré */}
      {open && (
        <div className="fixed top-0 right-0 w-80 max-w-[85vw] h-full bg-white dark:bg-[#0A1A2F] shadow-2xl z-50 lg:hidden">
          <div className="flex flex-col h-full animate-slide-in-right">
            {/* Header avec profil */}
            <div className="relative p-6 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-b border-gray-200/60 dark:border-gray-700/60">
              <div className="absolute top-4 right-4">
                <button
                  onClick={() => setOpen(false)}
                  className="p-2 rounded-xl hover:bg-white/60 dark:hover:bg-gray-800/60 transition-all duration-200 hover:rotate-90"
                >
                  <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                </button>
              </div>
              {user ? (
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Image
                      src={avatar || 'https://icons.veryicon.com/png/o/miscellaneous/standard/avatar-15.png'}
                      alt="Profile"
                      width={50}
                      height={50}
                      className="rounded-2xl border-3 border-white shadow-lg"
                    />
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white">Bonjour! 👋</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Prêt à vendre?</div>
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <TextLogo />
                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">Bienvenue sur notre plateforme</div>
                </div>
              )}
            </div>
            {/* Actions rapides */}
            <div className="p-4 border-b border-gray-200/60 dark:border-gray-700/60">
              <Link
                href="/dashboard/add"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-12" />
                <ShoppingCart className="w-6 h-6 relative z-10" />
                <div className="relative z-10">
                  <div className="font-semibold">Vendre maintenant</div>
                  <div className="text-sm opacity-90">Gagnez de l'argent facilement</div>
                </div>
              </Link>
            </div>
            {/* Navigation */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-2 mb-6">
                <span className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 px-2">
                  Navigation
                </span>
                {navLinks.map(({ href, label, icon: Icon, color }) => (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setOpen(false)}
                    className={`group flex items-center gap-4 px-4 py-3.5 rounded-2xl text-sm font-medium transition-all duration-200 hover:scale-105 ${pathname === href
                      ? 'text-white bg-gradient-to-r from-yellow-500 to-orange-500 shadow-lg'
                      : 'text-gray-700 dark:text-gray-300 hover:text-yellow-600 hover:bg-gray-50 dark:hover:bg-gray-800/60'
                      }`}
                  >
                    <div className={`p-2 rounded-xl ${pathname === href ? 'bg-white/20' : 'bg-gray-100 dark:bg-gray-800'} group-hover:scale-110 transition-transform`}>
                      <Icon className={`w-5 h-5 ${pathname === href ? 'text-white' : color}`} />
                    </div>
                    <span>{label}</span>
                    {pathname === href && (
                      <div className="ml-auto w-2 h-2 bg-white rounded-full animate-pulse" />
                    )}
                  </Link>
                ))}
              </div>
              {/* Catégories mobiles */}
              <div className="space-y-3">
                <span className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 px-2">
                  Catégories populaires
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {categories.slice(0, 6).map((cat) => (
                    <button
                      key={cat.label}
                      onClick={() => handleCategory(cat.label)}
                      className={`group flex flex-col items-center gap-2 p-3 rounded-2xl text-sm font-medium transition-all duration-200 hover:scale-105 ${category === cat.label
                        ? `text-white bg-gradient-to-br ${cat.color} shadow-lg`
                        : 'text-gray-700 dark:text-gray-300 hover:text-yellow-600 hover:bg-gray-50 dark:hover:bg-gray-800/60'
                        }`}
                    >
                      <span className="text-2xl group-hover:scale-110 transition-transform">{cat.emoji}</span>
                      <span className="text-xs capitalize leading-tight text-center">{cat.label.replace('_', ' ')}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
            {/* Footer du menu */}
            {user && (
              <div className="p-4 border-t border-gray-200/60 dark:border-gray-700/60 bg-gray-50/50 dark:bg-gray-800/30">
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      router.push('/settings')
                      setOpen(false)
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-gray-600 dark:text-gray-300 hover:text-yellow-600 hover:bg-white dark:hover:bg-gray-800 transition-all duration-200"
                  >
                    <Settings className="w-4 h-4" />
                    Paramètres
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 transition-all duration-200"
                  >
                    <LogOut className="w-4 h-4" />
                    Déconnexion
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Spacer */}
      <div className="h-20 lg:h-28" />

      {/* Animations */}
      <style jsx global>{`
        .animate-slide-in-right {
          animation: slideInRight 0.3s cubic-bezier(.77,0,.18,1);
        }
        .animate-fade-in {
          animation: fadein 0.16s cubic-bezier(.77,0,.18,1);
        }
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes fadein {
          from { opacity: 0; transform: translateY(6px);}
          to   { opacity: 1; transform: translateY(0);}
        }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
      `}</style>
    </>
  )
}