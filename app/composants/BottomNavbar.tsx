'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { HomeIcon, User, Heart, ShoppingBag, Info } from 'lucide-react'
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
            active: pathname === '/' || pathname.startsWith('/?category=')
        },
        {
            href: '/dashboard/products',
            icon: ShoppingBag,
            label: 'Produits',
            active: pathname.includes('/dashboard/products') || pathname.includes('/dashboard/add')
        },
        {
            href: '/favoris',
            icon: Heart,
            label: 'Favoris',
            active: pathname === '/favoris'
        },
        {
            href: '/about',
            icon: Info,
            label: 'À propos',
            active: pathname === '/about'
        },
        {
            href: user ? `/profile/${user.id}` : '/auth/login',
            icon: User,
            label: 'Profil',
            active: pathname.startsWith('/profile/') || (!user && pathname.includes('/auth/'))
        }
    ]

    return (
        <>
            {/* Safe area spacer pour iPhone avec encoche */}
            <div className="md:hidden h-20 w-full" />

            <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/98 dark:bg-[#1E293B]/98 backdrop-blur-xl border-t border-gray-100 dark:border-gray-800 shadow-2xl">
                {/* Ligne indicatrice en haut */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-gray-300 dark:bg-gray-600 rounded-full opacity-60" />

                <div className="grid grid-cols-5 px-2 py-2 safe-area-inset-bottom">
                    {navItems.map((item) => {
                        const Icon = item.icon
                        const isActive = item.active

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`group relative flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all duration-300 ease-out ${isActive
                                    ? 'text-[#F4B400] transform -translate-y-1'
                                    : 'text-gray-500 dark:text-gray-400 hover:text-[#F4B400] active:scale-95'
                                    }`}
                            >
                                {/* Badge favoris */}
                                {item.href === '/favoris' && (
                                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#F4B400] text-[#1E293B] text-[10px] font-bold rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        3
                                    </div>
                                )}

                                {/* Background actif */}
                                {isActive && (
                                    <div className="absolute inset-0 bg-[#F4B400]/15 dark:bg-[#F4B400]/20 rounded-xl scale-110 opacity-100 animate-pulse" />
                                )}

                                {/* Icône */}
                                <div className={`relative mb-1 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-105 group-active:scale-95'
                                    }`}>
                                    <Icon
                                        size={22}
                                        className={`transition-all duration-300 ${isActive ? 'drop-shadow-sm' : ''
                                            }`}
                                    />

                                    {isActive && (
                                        <div className="absolute inset-0 bg-[#F4B400] blur-sm opacity-20 rounded-full" />
                                    )}
                                </div>

                                {/* Label */}
                                <span className={`text-[11px] font-medium leading-tight tracking-tight transition-all duration-300 ${isActive
                                    ? 'text-[#F4B400] font-semibold'
                                    : 'text-gray-600 dark:text-gray-400 group-hover:text-gray-800 dark:group-hover:text-gray-200'
                                    }`}>
                                    {item.label}
                                </span>

                                {/* Point indicateur actif */}
                                {isActive && (
                                    <div className="absolute -bottom-1 w-1.5 h-1.5 bg-[#F4B400] rounded-full animate-bounce" />
                                )}

                                {/* Effet tactile */}
                                <div className="absolute inset-0 rounded-xl transition-all duration-150 group-active:bg-gray-200/50 dark:group-active:bg-gray-700/50 group-active:scale-95" />
                            </Link>
                        )
                    })}
                </div>

                {/* Barre d’indicateur */}
                <div
                    className="absolute bottom-0 h-0.5 bg-[#F4B400] transition-all duration-300 ease-out rounded-full"
                    style={{
                        left: `${(navItems.findIndex(item => item.active) * 20) + 10}%`,
                        width: '10%',
                        transform: 'translateX(-50%)'
                    }}
                />

                {/* Support safe area */}
                <div className="pb-safe bg-white/98 dark:bg-[#1E293B]/98" />
            </div>
        </>
    )
}
