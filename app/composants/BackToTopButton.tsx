'use client'
import { ArrowUp } from "lucide-react"
import { useEffect, useState } from "react"

export default function BackToTopButton() {
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        const toggleVisibility = () => {
            setIsVisible(window.scrollY > 300)
        }

        window.addEventListener("scroll", toggleVisibility)
        return () => window.removeEventListener("scroll", toggleVisibility)
    }, [])

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth",
        })
    }

    return (
        <button
            onClick={scrollToTop}
            aria-label="Retour en haut"
            className={`fixed bottom-4 right-4 z-40 flex items-center justify-center w-10 h-10 rounded-full bg-white/80 text-[#1C2B49] shadow-md backdrop-blur-md border border-gray-200 transition-all duration-300 ${isVisible
                ? "opacity-100 scale-100"
                : "opacity-0 scale-0 pointer-events-none"
                } hover:bg-white hover:shadow-lg active:scale-95`}
        >
            <ArrowUp className="w-4 h-4" />
        </button>
    )
}