'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import {
  HomeIcon,
  ShoppingCart,
  User,
  Info,
  Menu,
  X,
  LogOut,
} from 'lucide-react'
import TextLogo from './textLogo'
import { createClient } from '@/lib/supabase'
import Image from 'next/image'

const categories = ['Vetement', 'Artisanat', 'Maquillage', 'Soins et astuces']

const navLinks = [
  { href: '/', label: 'Accueil', icon: HomeIcon },
  { href: '/dashboard/add', label: 'Vendre', icon: ShoppingCart },
  { href: '/dashboard/products', label: 'Mes produits', icon: User },
  { href: '/about', label: 'À propos', icon: Info },
]

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [sessionUser, setSessionUser] = useState<any>(null)
  const [profile, setProfile] = useState<{ avatar_url: string } | null>(null)

  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setSessionUser(user)
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('avatar_url')
          .eq('id', user.id)
          .single()
        setProfile(data)
      }
    }

    fetchUser()
  }, [])

  const handleCategorySelect = (category: string) => {
    router.push(`/?category=${encodeURIComponent(category)}`)
    setIsMobileMenuOpen(false)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.refresh()
  }

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 text-2xl font-bold text-[#D29587] hover:opacity-80">
          🌸 <TextLogo />
        </Link>

        {/* Menu hamburger mobile */}
        <button
          className="md:hidden text-gray-700"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>

        {/* Navigation Desktop */}
        <nav className="hidden md:flex items-center space-x-8">
          {navLinks.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-1 text-gray-700 hover:text-[#D29587] font-medium transition ${pathname === href ? 'text-[#D29587] font-semibold' : ''}`}
            >
              <Icon size={18} />
              {label}
            </Link>
          ))}

          {/* Profil utilisateur */}
          {sessionUser && (
            <div className="relative">
              <Image
                src={profile?.avatar_url || 'https://icons.veryicon.com/png/o/miscellaneous/standard/avatar-15.png'}
                alt="Profil"
                width={36}
                height={36}
                className="rounded-full border border-gray-300 cursor-pointer"
                onClick={() => router.push(`/profile/${sessionUser.id}`)}
              />
            </div>
          )}
        </nav>
      </div>

      {/* Catégories Desktop visibles */}
      <div className="hidden md:flex justify-center space-x-4 py-2 border-t border-gray-100 bg-[#FDF7F5]">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => handleCategorySelect(cat)}
            className="text-sm text-gray-700 hover:text-[#D29587] font-medium transition"
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Menu mobile */}
      {isMobileMenuOpen && (
        <div className="md:hidden px-4 pb-4">
          <div className="flex flex-col space-y-4 mt-4">
            {/* Catégories */}
            <div>
              <p className="text-sm font-semibold text-gray-600 mb-2">Catégories</p>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => handleCategorySelect(cat)}
                  className="text-left w-full text-gray-700 hover:text-[#D29587] transition"
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Navigation */}
            <div>
              <p className="text-sm font-semibold text-gray-600 mb-2">Navigation</p>
              {navLinks.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-2 text-gray-700 hover:text-[#D29587] transition ${pathname === href ? 'text-[#D29587] font-semibold' : ''}`}
                >
                  <Icon size={18} />
                  {label}
                </Link>
              ))}
            </div>

            {/* Profil mobile */}
            {sessionUser && (
              <div className="border-t pt-4">
                <Link
                  href={`/profile/${sessionUser.id}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-2 text-gray-700 hover:text-[#D29587] transition"
                >
                  <User size={18} /> Voir mon profil
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-red-600 mt-2"
                >
                  <LogOut size={18} /> Déconnexion
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
