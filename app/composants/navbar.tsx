"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    ChevronDown,
    HomeIcon,
    ShoppingCart,
    User,
    Info,
    Menu,
    X,
} from "lucide-react"
import TextLogo from "./textLogo"

const categories = ["Vetement", "artisanat", "maquillage", "soins_et_astuces"]

const navLinks = [
    { href: "/", label: "Accueil", icon: HomeIcon },
    { href: "/dashboard/add", label: "Vendre", icon: ShoppingCart },
    { href: "/dashboard/products", label: "Mes produits", icon: User },
    { href: "/about", label: "À propos", icon: Info },
]

export default function Navbar() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const router = useRouter()
    const pathname = usePathname()

    const handleCategorySelect = (category: string) => {
        router.push(`/?category=${encodeURIComponent(category)}`)
        setIsMobileMenuOpen(false)
    }

    return (
        <header className="bg-white shadow-md sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
                {/* Logo + Accueil */}
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
                    {/* Dropdown catégories */}
                    <DropdownMenu>
                        <DropdownMenuTrigger className="flex items-center gap-1 text-gray-700 font-medium hover:text-[#D29587] transition cursor-pointer">
                            Catégories <ChevronDown size={16} />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            {categories.map((cat) => (
                                <DropdownMenuItem
                                    key={cat}
                                    onClick={() => handleCategorySelect(cat)}
                                    className="cursor-pointer"
                                >
                                    {cat}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Liens dynamiques */}
                    {navLinks.map(({ href, label, icon: Icon }) => (
                        <Link
                            key={href}
                            href={href}
                            className={`flex items-center gap-1 text-gray-700 hover:text-[#D29587] font-medium transition ${pathname === href ? "text-[#D29587] font-semibold" : ""
                                }`}
                        >
                            <Icon size={18} />
                            {label}
                        </Link>
                    ))}
                </nav>
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

                        {/* Liens dynamiques */}
                        <div>
                            <p className="text-sm font-semibold text-gray-600 mb-2">Navigation</p>
                            {navLinks.map(({ href, label, icon: Icon }) => (
                                <Link
                                    key={href}
                                    href={href}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={`flex items-center gap-2 text-gray-700 hover:text-[#D29587] transition ${pathname === href ? "text-[#D29587] font-semibold" : ""
                                        }`}
                                >
                                    <Icon size={18} />
                                    {label}
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </header>
    )
}
