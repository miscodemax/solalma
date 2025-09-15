"use client"
import { useState, useEffect, useRef } from 'react'

export default function MinMaxPriceFilter({
    minPrice,
    maxPrice,
    setMinPrice,
    setMaxPrice
}) {
    const [isOpen, setIsOpen] = useState(false)
    const [tempMin, setTempMin] = useState(minPrice)
    const [tempMax, setTempMax] = useState(maxPrice)
    const dropdownRef = useRef(null)

    // Synchroniser les valeurs temporaires avec les props
    useEffect(() => {
        setTempMin(minPrice)
        setTempMax(maxPrice)
    }, [minPrice, maxPrice])

    // Fermer le dropdown quand on clique ailleurs
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false)
            }
        }

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside)
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [isOpen])

    // Bloquer le scroll sur mobile quand le dropdown est ouvert
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = 'unset'
        }

        return () => {
            document.body.style.overflow = 'unset'
        }
    }, [isOpen])

    const formatNumber = (num) => {
        if (!num) return ""
        return new Intl.NumberFormat('fr-FR').format(num)
    }

    const handleApply = () => {
        // Validation des valeurs
        const minVal = tempMin ? parseInt(tempMin.toString().replace(/\s/g, '')) : ""
        const maxVal = tempMax ? parseInt(tempMax.toString().replace(/\s/g, '')) : ""
        
        if (minVal && maxVal && minVal > maxVal) {
            // Inverser si min > max
            setMinPrice(maxVal.toString())
            setMaxPrice(minVal.toString())
        } else {
            setMinPrice(minVal.toString())
            setMaxPrice(maxVal.toString())
        }
        setIsOpen(false)
    }

    const handleReset = () => {
        setTempMin("")
        setTempMax("")
        setMinPrice("")
        setMaxPrice("")
        setIsOpen(false)
    }

    const handleQuickSelect = (min, max) => {
        setTempMin(min)
        setTempMax(max)
        setMinPrice(min)
        setMaxPrice(max)
        setIsOpen(false)
    }

    const formatDisplayText = () => {
        if (!minPrice && !maxPrice) return "Budget"
        
        // Version courte pour mobile
        const isMobile = window.innerWidth < 640
        if (isMobile) {
            if (minPrice && maxPrice) {
                return `${formatNumber(minPrice)}-${formatNumber(maxPrice)}`
            }
            if (minPrice) return `${formatNumber(minPrice)}+`
            if (maxPrice) return `<${formatNumber(maxPrice)}`
        }
        
        // Version complète pour desktop
        if (minPrice && maxPrice) {
            return `${formatNumber(minPrice)} - ${formatNumber(maxPrice)} FCFA`
        }
        if (minPrice) return `Dès ${formatNumber(minPrice)} FCFA`
        if (maxPrice) return `Max ${formatNumber(maxPrice)} FCFA`
        return "Budget"
    }

    const hasActiveFilter = minPrice || maxPrice

    return (
        <>
            <div className="relative" ref={dropdownRef}>
                {/* Bouton déclencheur optimisé mobile */}
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className={`
                        flex items-center gap-2 px-3 sm:px-4 py-2.5 rounded-full text-xs sm:text-sm font-medium
                        transition-all duration-300 border backdrop-blur-sm min-w-0
                        ${hasActiveFilter
                            ? 'bg-gradient-to-r from-[#F4B400] to-[#E6A200] text-white border-[#F4B400] shadow-lg shadow-[#F4B400]/25' 
                            : 'bg-white/90 dark:bg-[#2A2A2A]/90 text-[#1C1C1C] dark:text-white border-gray-200 dark:border-gray-600 hover:border-[#F4B400]/50 hover:shadow-md dark:hover:border-gray-500'
                        }
                        active:scale-95 touch-manipulation
                    `}
                >
                    {/* Icône prix */}
                    <svg 
                        className="w-4 h-4 flex-shrink-0" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                    
                    <span className="truncate min-w-0">{formatDisplayText()}</span>
                    
                    {hasActiveFilter && (
                        <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse flex-shrink-0" />
                    )}
                    
                    <svg
                        className={`w-3 h-3 sm:w-4 sm:h-4 transition-transform duration-300 flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </button>
            </div>

            {/* Overlay mobile fullscreen */}
            {isOpen && (
                <>
                    {/* Backdrop mobile */}
                    <div className="sm:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40" onClick={() => setIsOpen(false)} />
                    
                    {/* Modal mobile bottom sheet */}
                    <div className={`
                        fixed sm:absolute 
                        inset-x-0 bottom-0 sm:inset-auto 
                        sm:top-full sm:mt-3 sm:right-0 sm:left-auto sm:w-80
                        bg-white/98 dark:bg-[#2A2A2A]/98 backdrop-blur-xl 
                        rounded-t-3xl sm:rounded-2xl 
                        shadow-2xl border-t sm:border border-gray-100 dark:border-gray-700 
                        z-50 animate-in 
                        slide-in-from-bottom-full sm:slide-in-from-top-2 
                        sm:fade-in 
                        duration-300 sm:duration-200
                        max-h-[85vh] sm:max-h-none overflow-y-auto
                    `}>
                        {/* Handle mobile (indicateur de glissement) */}
                        <div className="sm:hidden flex justify-center pt-3 pb-2">
                            <div className="w-12 h-1 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                        </div>

                        <div className="p-5 sm:p-5 space-y-6 sm:space-y-5 pb-8 sm:pb-5">
                            {/* En-tête avec reset */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-gradient-to-r from-[#F4B400] to-[#E6A200] rounded-full"></div>
                                    <h3 className="text-base sm:text-sm font-semibold text-[#1C1C1C] dark:text-white">
                                        Définir mon budget
                                    </h3>
                                </div>
                                {hasActiveFilter && (
                                    <button
                                        onClick={handleReset}
                                        className="text-sm sm:text-xs text-gray-500 hover:text-[#F4B400] transition-colors duration-200 font-medium active:scale-95"
                                    >
                                        Effacer
                                    </button>
                                )}
                            </div>

                            {/* Inputs prix avec design mobile-first */}
                            <div className="space-y-4 sm:space-y-3">
                                <div className="flex flex-col sm:flex-row sm:items-end gap-4 sm:gap-3">
                                    <div className="flex-1">
                                        <label className="block text-sm sm:text-xs font-medium text-gray-600 dark:text-gray-400 mb-3 sm:mb-2">
                                            Prix minimum
                                        </label>
                                        <div className="relative group">
                                            <input
                                                type="number"
                                                value={tempMin}
                                                onChange={(e) => setTempMin(e.target.value)}
                                                placeholder="0"
                                                className="w-full pl-4 pr-14 py-4 sm:py-3 text-base sm:text-sm border-2 border-gray-200 dark:border-gray-600 rounded-2xl sm:rounded-xl focus:ring-2 focus:ring-[#F4B400]/20 focus:border-[#F4B400] bg-white dark:bg-[#1C1C1C] text-[#1C1C1C] dark:text-white transition-all duration-200 touch-manipulation"
                                                min="0"
                                                inputMode="numeric"
                                            />
                                            <span className="absolute right-4 sm:right-3 top-4 sm:top-3 text-sm sm:text-xs font-medium text-gray-500">FCFA</span>
                                        </div>
                                    </div>
                                    
                                    <div className="flex-shrink-0 self-center sm:pb-3 flex justify-center">
                                        <div className="w-8 h-px sm:w-6 bg-gradient-to-r from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-500 rotate-90 sm:rotate-0"></div>
                                    </div>
                                    
                                    <div className="flex-1">
                                        <label className="block text-sm sm:text-xs font-medium text-gray-600 dark:text-gray-400 mb-3 sm:mb-2">
                                            Prix maximum
                                        </label>
                                        <div className="relative group">
                                            <input
                                                type="number"
                                                value={tempMax}
                                                onChange={(e) => setTempMax(e.target.value)}
                                                placeholder="Illimité"
                                                className="w-full pl-4 pr-14 py-4 sm:py-3 text-base sm:text-sm border-2 border-gray-200 dark:border-gray-600 rounded-2xl sm:rounded-xl focus:ring-2 focus:ring-[#F4B400]/20 focus:border-[#F4B400] bg-white dark:bg-[#1C1C1C] text-[#1C1C1C] dark:text-white transition-all duration-200 touch-manipulation"
                                                min={tempMin || "0"}
                                                inputMode="numeric"
                                            />
                                            <span className="absolute right-4 sm:right-3 top-4 sm:top-3 text-sm sm:text-xs font-medium text-gray-500">FCFA</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Suggestions populaires optimisées mobile */}
                            <div>
                                <label className="block text-sm sm:text-xs font-medium text-gray-600 dark:text-gray-400 mb-4 sm:mb-3">
                                    🔥 Gammes populaires
                                </label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-2">
                                    {[
                                        { label: "Moins de 2K", min: "", max: "2000", icon: "💰" },
                                        { label: "2K - 7K", min: "2000", max: "7000", icon: "🛍️" },
                                        { label: "7K - 15K", min: "7000", max: "15000", icon: "⭐" },
                                        { label: "Plus de 15K", min: "15000", max: "", icon: "💎" }
                                    ].map((suggestion, index) => (
                                        <button
                                            key={index}
                                            onClick={() => handleQuickSelect(suggestion.min, suggestion.max)}
                                            className="flex items-center gap-3 px-4 py-3.5 sm:py-2.5 text-sm sm:text-xs font-medium rounded-2xl sm:rounded-xl bg-gray-50 dark:bg-[#1C1C1C] text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-[#F4B400] hover:to-[#E6A200] hover:text-white transition-all duration-200 active:scale-95 touch-manipulation"
                                        >
                                            <span className="text-lg sm:text-base">{suggestion.icon}</span>
                                            <span className="flex-1 text-left">{suggestion.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Boutons d'action mobile-first */}
                            <div className="flex items-center gap-3 pt-4 sm:pt-2">
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="flex-1 px-4 py-3.5 sm:py-2.5 text-base sm:text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors duration-200 rounded-2xl sm:rounded-xl hover:bg-gray-50 dark:hover:bg-[#1C1C1C] active:scale-95 touch-manipulation"
                                >
                                    Fermer
                                </button>
                                <button
                                    onClick={handleApply}
                                    className="flex-1 px-4 py-3.5 sm:py-2.5 bg-gradient-to-r from-[#F4B400] to-[#E6A200] text-white text-base sm:text-sm font-semibold rounded-2xl sm:rounded-xl hover:shadow-lg hover:shadow-[#F4B400]/30 transition-all duration-200 active:scale-95 touch-manipulation"
                                >
                                    Appliquer
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </>
    )
}