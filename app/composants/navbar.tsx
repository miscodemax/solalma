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

const categories = ['Vetement', 'artisanat', 'maquillage', 'soins_et_astuces']
const navLinks = [
  { href: '/', icon: HomeIcon, label: 'Accueil' },
  { href: '/dashboard/add', icon: ShoppingCart, label: 'Vendre' },
  { href: '/dashboard/products', icon: User, label: 'Mes produits' },
  { href: '/about', icon: Info, label: 'À propos' },
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
  const [user, setUser] = useState(null)
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
    <nav className="sticky top-0 z-50 bg-white dark:bg-black shadow-md">
      <div className="flex flex-col md:flex-row items-center justify-between px-4 py-3 max-w-7xl mx-auto w-full gap-2 md:gap-0">
        {/* Top section: Logo + Search + Nav links */}
        <div className="flex items-center justify-between w-full md:w-auto">
          <Link href="/" className="flex items-center gap-1 text-xl font-bold text-[#D29587]">
            🌸 <TextLogo />
          </Link>

          {/* Mobile menu button */}
          <div className="flex items-center gap-3 md:hidden">
            <ThemeToggle />
            <button onClick={() => setOpen(!open)} className="text-gray-700">
              {open ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Search - Desktop */}
        <div className="hidden md:flex flex-1 justify-center px-4 w-full max-w-md">
          <Search products={products} />
        </div>

        {/* Nav links - Desktop */}
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-1 text-sm font-medium transition ${pathname === href ? 'text-[#D29587]' : 'text-gray-600 hover:text-[#D29587]'
                }`}
            >
              <Icon size={16} />
              {label}
            </Link>
          ))}
          <ThemeToggle />
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger className="focus:outline-none">
                <Image
                  src={avatar || 'https://icons.veryicon.com/png/o/miscellaneous/standard/avatar-15.png'}
                  alt="avatar"
                  width={32}
                  height={32}
                  className="rounded-full border"
                />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => router.push(`/profile/${user.id}`)}>
                  Voir mon profil
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                  <LogOut size={14} className="mr-2" />
                  Déconnexion
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* Search - Mobile */}
      <div className="md:hidden px-4 mt-2">
        <Search products={products} />
      </div>

      {/* Catégories défilantes */}
      <div className="flex overflow-x-auto gap-4 px-4 py-2 border-t text-sm font-medium bg-white dark:bg-black">
        <button
          onClick={resetCategory}
          className={`whitespace-nowrap capitalize px-2 py-1 rounded transition ${!category ? 'text-[#D29587] border-b-2 border-[#D29587]' : 'text-gray-600 hover:text-[#D29587]'
            }`}
        >
          Voir tout
        </button>
        {categories.map((cat) => {
          const active = category === cat
          return (
            <button
              key={cat}
              onClick={() => handleCategory(cat)}
              className={`whitespace-nowrap capitalize px-2 py-1 rounded transition ${active ? 'text-[#D29587] border-b-2 border-[#D29587]' : 'text-gray-600 hover:text-[#D29587]'
                }`}
            >
              {cat.replace('_', ' ')}
            </button>
          )
        })}
      </div>

      {/* Menu mobile */}
      {open && (
        <div className="md:hidden px-4 pb-4 space-y-4">
          <div>
            <p className="text-sm font-semibold text-gray-500">Navigation</p>
            {navLinks.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-1 text-sm font-medium transition ${pathname === href ? 'text-[#D29587]' : 'text-gray-600 hover:text-[#D29587]'
                  }`}
                onClick={() => setOpen(false)}
              >
                <Icon size={18} />
                {label && <span>{label}</span>}
              </Link>
            ))}
          </div>

          {user && (
            <div className="border-t pt-3">
              <Link
                href={`/profile/${user.id}`}
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 text-gray-700 hover:text-[#D29587]"
              >
                <User size={16} /> Mon profil
              </Link>
              <button onClick={handleLogout} className="flex items-center gap-2 text-red-600 mt-2">
                <LogOut size={16} /> Déconnexion
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  )
}
