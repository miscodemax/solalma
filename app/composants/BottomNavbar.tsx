'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { HomeIcon, User, Heart, ShoppingBag } from 'lucide-react'
import { createClient } from '@/lib/supabase'

export default function BottomNavbar() {
  const [user, setUser] = useState<any>(null)
  const pathname = usePathname()
  const supabase = createClient()

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    fetchUser()
  }, [])

  const navItems = [
    {
      href: '/',
      icon: HomeIcon,
      label: 'Accueil',
      active: pathname === '/'
    },
    {
      href: '/dashboard/products',
      icon: ShoppingBag,
      label: 'Mes produits',
      active: pathname === '/dashboard/products'
    },
    {
      href: '/favoris',
      icon: Heart,
      label: 'Favoris',
      active: pathname === '/favoris'
    },
    {
      href: user ? `/profile/${user.id}` : '/auth/login',
      icon: User,
      label: 'Profil',
      active: pathname.startsWith('/profile/')
    }
  ]

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-black/95 backdrop-blur-md border-t border-gray-200 dark:border-gray-800 shadow-lg">
      <div className="flex items-center justify-around py-2 px-4 max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center min-w-[60px] py-2 px-1 rounded-lg transition-all duration-200 ${
                item.active
                  ? 'text-[#6366F1] bg-[#F5E6CC]/80 dark:bg-[#1a1a1a] transform scale-105'
                  : 'text-gray-600 dark:text-gray-400 hover:text-[#6366F1] hover:bg-[#F5E6CC]/50 dark:hover:bg-[#1a1a1a]/50'
              }`}
            >
              <Icon size={20} className="mb-1" />
              <span className="text-xs font-medium leading-tight">{item.label}</span>
              {item.active && (
                <div className="absolute -top-1 w-1 h-1 bg-[#6366F1] rounded-full animate-pulse" />
              )}
            </Link>
          )
        })}
      </div>
      
      {/* Indicateur visuel pour l'élément actif */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#6366F1] to-transparent opacity-60" />
    </div>
  )
}