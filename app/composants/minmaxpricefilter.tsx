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
        if (minPrice && maxPrice) {
            return `${formatNumber(minPrice)} - ${formatNumber(maxPrice)} FCFA`
        }
        if (minPrice) return `Dès ${formatNumber(minPrice)} FCFA`
        if (maxPrice) return `Max ${formatNumber(maxPrice)} FCFA`
        return "Budget"
    }

    const hasActiveFilter = minPrice || maxPrice

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Bouton déclencheur avec icône */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`
                    flex items-center gap-2.5 px-4 py-2.5 rounded-full text-sm font-medium
                    transition-all duration-300 border backdrop-blur-sm
                    ${hasActiveFilter
                        ? 'bg-gradient-to-r from-[#F4B400] to-[#E6A200] text-white border-[#F4B400] shadow-lg shadow-[#F4B400]/25 scale-105'
                        : 'bg-white/90 dark:bg-[#2A2A2A]/90 text-[#1C1C1C] dark:text-white border-gray-200 dark:border-gray-600 hover:border-[#F4B400]/50 hover:shadow-md dark:hover:border-gray-500'
                    }
                    group
                `}
            >
                {/* Icône prix */}
                <svg
                    className={`w-4 h-4 transition-all duration-200 ${hasActiveFilter ? 'scale-110' : 'group-hover:scale-105'}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>

                <span className="whitespace-nowrap">{formatDisplayText()}</span>

                {hasActiveFilter && (
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                )}

                <svg
                    className={`w-4 h-4 transition-all duration-300 ${isOpen ? 'rotate-180' : 'group-hover:rotate-12'}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {/* Dropdown avec animation */}
            {isOpen && (
                <div className="absolute top-full mt-3 right-0 bg-white/95 dark:bg-[#2A2A2A]/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 p-5 w-80 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="space-y-5">
                        {/* En-tête avec reset */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-gradient-to-r from-[#F4B400] to-[#E6A200] rounded-full"></div>
                                <h3 className="text-sm font-semibold text-[#1C1C1C] dark:text-white">
                                    Définir mon budget
                                </h3>
                            </div>
                            {hasActiveFilter && (
                                <button
                                    onClick={handleReset}
                                    className="text-xs text-gray-500 hover:text-[#F4B400] transition-colors duration-200 font-medium"
                                >
                                    Tout effacer
                                </button>
                            )}
                        </div>

                        {/* Inputs prix avec design amélioré */}
                        <div className="space-y-3">
                            <div className="flex items-end gap-3">
                                <div className="flex-1">
                                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                                        Prix minimum
                                    </label>
                                    <div className="relative group">
                                        <input
                                            type="number"
                                            value={tempMin}
                                            onChange={(e) => setTempMin(e.target.value)}
                                            placeholder="0"
                                            className="w-full pl-3 pr-12 py-3 text-sm border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#F4B400]/20 focus:border-[#F4B400] bg-white dark:bg-[#1C1C1C] text-[#1C1C1C] dark:text-white transition-all duration-200 group-hover:border-gray-300"
                                            min="0"
                                        />
                                        <span className="absolute right-3 top-3 text-xs font-medium text-gray-500">FCFA</span>
                                    </div>
                                </div>

                                <div className="flex-shrink-0 pb-3">
                                    <div className="w-6 h-px bg-gradient-to-r from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-500"></div>
                                </div>

                                <div className="flex-1">
                                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                                        Prix maximum
                                    </label>
                                    <div className="relative group">
                                        <input
                                            type="number"
                                            value={tempMax}
                                            onChange={(e) => setTempMax(e.target.value)}
                                            placeholder="Illimité"
                                            className="w-full pl-3 pr-12 py-3 text-sm border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#F4B400]/20 focus:border-[#F4B400] bg-white dark:bg-[#1C1C1C] text-[#1C1C1C] dark:text-white transition-all duration-200 group-hover:border-gray-300"
                                            min={tempMin || "0"}
                                        />
                                        <span className="absolute right-3 top-3 text-xs font-medium text-gray-500">FCFA</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Suggestions populaires améliorées */}
                        <div>
                            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-3">
                                🔥 Gammes populaires
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                                {[
                                    { label: "Moins de 50K", min: "", max: "50000", icon: "💰" },
                                    { label: "50K - 200K", min: "50000", max: "200000", icon: "🛍️" },
                                    { label: "200K - 500K", min: "200000", max: "500000", icon: "⭐" },
                                    { label: "Plus de 500K", min: "500000", max: "", icon: "💎" }
                                ].map((suggestion, index) => (
                                    <button
                                        key={index}
                                        onClick={() => handleQuickSelect(suggestion.min, suggestion.max)}
                                        className="flex items-center gap-2 px-3 py-2.5 text-xs font-medium rounded-xl bg-gray-50 dark:bg-[#1C1C1C] text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-[#F4B400] hover:to-[#E6A200] hover:text-white transition-all duration-200 hover:scale-105 hover:shadow-md group"
                                    >
                                        <span className="group-hover:scale-110 transition-transform">{suggestion.icon}</span>
                                        <span>{suggestion.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Boutons d'action avec design premium */}
                        <div className="flex items-center gap-3 pt-2">
                            <button
                                onClick={() => setIsOpen(false)}
                                className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors duration-200 rounded-xl hover:bg-gray-50 dark:hover:bg-[#1C1C1C]"
                            >
                                Fermer
                            </button>
                            <button
                                onClick={handleApply}
                                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-[#F4B400] to-[#E6A200] text-white text-sm font-semibold rounded-xl hover:shadow-lg hover:shadow-[#F4B400]/30 transition-all duration-200 hover:scale-105"
                            >
                                Appliquer
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}