'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, User, Heart, ShoppingBag, Plus } from 'lucide-react'
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
            icon: Home,
            label: 'Accueil',
            active: pathname === '/' || pathname.startsWith('/?category=')
        },
        {
            href: '/favoris',
            icon: Heart,
            label: 'Favoris',
            active: pathname === '/favoris'
        },
        {
            href: '/dashboard/add',
            icon: Plus,
            label: 'Vendre',
            isCenter: true,
            active: pathname === '/dashboard/add'
        },
        {
            href: '/dashboard/products',
            icon: ShoppingBag,
            label: 'Produits',
            active: pathname.includes('/dashboard/products')
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

            <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-[#1E293B]/95 backdrop-blur-xl border-t border-gray-200/50 dark:border-gray-700/50 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] dark:shadow-[0_-4px_20px_rgba(0,0,0,0.3)]">
                <div className="grid grid-cols-5 px-2 py-3 safe-area-inset-bottom relative">
                    {navItems.map((item, index) => {
                        const Icon = item.icon
                        const isActive = item.active
                        const isCenter = item.isCenter

                        // Bouton central spécial
                        if (isCenter) {
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className="flex items-center justify-center relative"
                                >
                                    <div className="absolute -top-7 flex flex-col items-center">
                                        {/* Bouton circulaire élevé */}
                                        <div className={`relative group ${
                                            isActive ? 'scale-105' : ''
                                        }`}>
                                            {/* Ombre portée */}
                                            <div className="absolute inset-0 bg-[#F4B400] rounded-full blur-xl opacity-40 scale-110" />
                                            
                                            {/* Bouton principal */}
                                            <div className={`relative w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 ${
                                                isActive
                                                    ? 'bg-gradient-to-br from-[#F4B400] to-[#E5A600] shadow-lg shadow-[#F4B400]/40'
                                                    : 'bg-gradient-to-br from-[#F4B400] to-[#E5A600] shadow-lg shadow-[#F4B400]/30 active:scale-95 active:shadow-md'
                                            }`}>
                                                {/* Anneau de bordure */}
                                                <div className="absolute inset-0 rounded-full border-4 border-white dark:border-[#1E293B]" />
                                                
                                                {/* Icône */}
                                                <Icon 
                                                    size={26} 
                                                    className="text-white drop-shadow-md relative z-10 group-active:scale-90 transition-transform"
                                                    strokeWidth={2.5}
                                                />
                                                
                                                {/* Effet de pulsation pour l'état actif */}
                                                {isActive && (
                                                    <div className="absolute inset-0 rounded-full border-2 border-[#F4B400] animate-ping opacity-20" />
                                                )}
                                            </div>
                                        </div>
                                        
                                        {/* Label sous le bouton */}
                                        <span className={`text-[11px] font-semibold mt-2 transition-colors duration-200 ${
                                            isActive 
                                                ? 'text-[#F4B400]' 
                                                : 'text-gray-700 dark:text-gray-300'
                                        }`}>
                                            {item.label}
                                        </span>
                                    </div>
                                </Link>
                            )
                        }

                        // Autres boutons
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`group relative flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all duration-200 ${
                                    isActive
                                        ? 'text-[#F4B400]'
                                        : 'text-gray-500 dark:text-gray-400 active:scale-90'
                                }`}
                            >
                                {/* Background actif subtil */}
                                {isActive && (
                                    <div className="absolute inset-0 bg-[#F4B400]/10 dark:bg-[#F4B400]/15 rounded-xl scale-105" />
                                )}

                                {/* Icône */}
                                <div className={`relative mb-1.5 transition-transform duration-200 ${
                                    isActive ? 'scale-110' : 'group-active:scale-90'
                                }`}>
                                    <Icon
                                        size={24}
                                        strokeWidth={isActive ? 2.5 : 2}
                                        className="transition-all duration-200"
                                    />

                                    {/* Lueur pour l'état actif */}
                                    {isActive && (
                                        <div className="absolute inset-0 bg-[#F4B400] blur-md opacity-20 rounded-full scale-150" />
                                    )}
                                </div>

                                {/* Label */}
                                <span className={`text-[11px] font-medium leading-tight transition-all duration-200 ${
                                    isActive
                                        ? 'text-[#F4B400] font-semibold'
                                        : 'text-gray-600 dark:text-gray-400'
                                }`}>
                                    {item.label}
                                </span>

                                {/* Point indicateur actif */}
                                {isActive && (
                                    <div className="absolute -bottom-1 w-1 h-1 bg-[#F4B400] rounded-full" />
                                )}

                                {/* Effet de feedback tactile */}
                                <div className="absolute inset-0 rounded-xl transition-all duration-100 group-active:bg-gray-100 dark:group-active:bg-gray-800/50" />
                            </Link>
                        )
                    })}
                </div>

                {/* Support safe area */}
                <div className="pb-safe bg-white/95 dark:bg-[#1E293B]/95" />
            </div>
        </>
    )
}