'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import {
  DropdownMenu, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { HomeIcon, ShoppingCart, User, Info, Menu, X, LogOut } from 'lucide-react'
import { ThemeToggle } from './theme-toggle'
import TextLogo from './textLogo'
import { createClient } from '@/lib/supabase'
import Image from 'next/image'

const categories = ['Vetement', 'artisanat', 'maquillage', 'soins_et_astuces']
const navLinks = [
  { href: '/', icon: HomeIcon, label: 'Accueil' },
  { href: '/dashboard/add', icon: ShoppingCart, label: 'Vendre' },
  { href: '/dashboard/products', icon: User, label: 'Mes produits' },
  { href: '/about', icon: Info, label: 'À propos' },
]

export default function Navbar() {
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

  const handleShare = () => {
    const message = encodeURIComponent("Coucou ! 🌸 Découvre cette nouvelle plateforme de mode féminine, hijabs, skincare et + : https://sangse.shop — rejoins-nous !");
    const whatsappUrl = `https://wa.me/?text=${message}`
    window.open(whatsappUrl, '_blank')
  }


  return (
    <nav className="sticky top-0 z-50 bg-white dark:bg-black shadow-md">
      <div className="flex items-center justify-between px-4 py-3 max-w-7xl mx-auto">
        <Link href="/" className="flex items-center gap-1 text-xl font-bold text-[#D29587]">
          🌸 <TextLogo />
        </Link>

        <div className="flex items-center gap-4 md:hidden">
          <button
            onClick={handleShare}
            className="text-sm font-medium text-[#D29587] hover:underline"
          >
            📲 Inviter une amie
          </button>

          <ThemeToggle />
          <button onClick={() => setOpen(!open)} className="text-gray-700">
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        <div className="hidden md:flex items-center gap-6">
          {navLinks.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href}
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

      {/* Catégories défilantes mobile + desktop */}
      <div className="flex overflow-x-auto gap-4 px-4 py-2 border-t text-sm font-medium bg-white dark:bg-black">
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
                onClick={() => setOpen(false)}
                className={`flex items-center gap-2 py-1 ${pathname === href ? 'text-[#D29587]' : 'text-gray-700 hover:text-[#D29587]'
                  }`}
              >
                <Icon size={16} />
                {label}
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
