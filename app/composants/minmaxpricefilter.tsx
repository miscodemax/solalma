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

    // Fermer le dropdown quand on clique ailleurs
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false)
                // Appliquer les filtres au moment de la fermeture
                setMinPrice(tempMin)
                setMaxPrice(tempMax)
            }
        }

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside)
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [isOpen, tempMin, tempMax, setMinPrice, setMaxPrice])

    const handleApply = () => {
        setMinPrice(tempMin)
        setMaxPrice(tempMax)
        setIsOpen(false)
    }

    const handleReset = () => {
        setTempMin("")
        setTempMax("")
        setMinPrice("")
        setMaxPrice("")
        setIsOpen(false)
    }

    const formatDisplayText = () => {
        if (!minPrice && !maxPrice) return "Prix"
        if (minPrice && maxPrice) return `${minPrice}€ - ${maxPrice}€`
        if (minPrice) return `À partir de ${minPrice}€`
        if (maxPrice) return `Jusqu'à ${maxPrice}€`
        return "Prix"
    }

    const hasActiveFilter = minPrice || maxPrice

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Bouton déclencheur */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`
          flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium
          transition-all duration-200 border
          ${hasActiveFilter
                        ? 'bg-[#F4B400] text-white border-[#F4B400] shadow-md'
                        : 'bg-white dark:bg-[#2A2A2A] text-[#1C1C1C] dark:text-white border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }
        `}
            >
                <span>{formatDisplayText()}</span>
                <svg
                    className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute top-full mt-2 right-0 bg-white dark:bg-[#2A2A2A] rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 w-72 z-50">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-semibold text-[#1C1C1C] dark:text-white">
                                Fourchette de prix
                            </h3>
                            {hasActiveFilter && (
                                <button
                                    onClick={handleReset}
                                    className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                                >
                                    Effacer
                                </button>
                            )}
                        </div>

                        {/* Inputs prix */}
                        <div className="flex items-center gap-3">
                            <div className="flex-1">
                                <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                                    Prix min
                                </label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        value={tempMin}
                                        onChange={(e) => setTempMin(e.target.value)}
                                        placeholder="0"
                                        className="w-full px-3 py-2 pr-6 text-sm border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#F4B400]/20 focus:border-[#F4B400] bg-white dark:bg-[#1C1C1C] text-[#1C1C1C] dark:text-white transition-all"
                                        min="0"
                                    />
                                    <span className="absolute right-2 top-2 text-xs text-gray-400">€</span>
                                </div>
                            </div>

                            <div className="flex-shrink-0 w-3 h-px bg-gray-300 dark:bg-gray-600 mt-5"></div>

                            <div className="flex-1">
                                <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                                    Prix max
                                </label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        value={tempMax}
                                        onChange={(e) => setTempMax(e.target.value)}
                                        placeholder="∞"
                                        className="w-full px-3 py-2 pr-6 text-sm border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#F4B400]/20 focus:border-[#F4B400] bg-white dark:bg-[#1C1C1C] text-[#1C1C1C] dark:text-white transition-all"
                                        min={tempMin || "0"}
                                    />
                                    <span className="absolute right-2 top-2 text-xs text-gray-400">€</span>
                                </div>
                            </div>
                        </div>

                        {/* Suggestions de prix populaires */}
                        <div>
                            <label className="block text-xs text-gray-600 dark:text-gray-400 mb-2">
                                Suggestions populaires
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {[
                                    { label: "0€ - 50€", min: "0", max: "50" },
                                    { label: "50€ - 200€", min: "50", max: "200" },
                                    { label: "200€ - 500€", min: "200", max: "500" },
                                    { label: "500€+", min: "500", max: "" }
                                ].map((suggestion, index) => (
                                    <button
                                        key={index}
                                        onClick={() => {
                                            setTempMin(suggestion.min)
                                            setTempMax(suggestion.max)
                                        }}
                                        className="px-3 py-1.5 text-xs rounded-full bg-gray-100 dark:bg-[#1C1C1C] text-gray-700 dark:text-gray-300 hover:bg-[#F4B400] hover:text-white transition-all duration-200"
                                    >
                                        {suggestion.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Boutons d'action */}
                        <div className="flex items-center gap-2 pt-2">
                            <button
                                onClick={() => setIsOpen(false)}
                                className="flex-1 px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={handleApply}
                                className="flex-1 px-4 py-2 bg-[#F4B400] text-white text-sm font-medium rounded-lg hover:bg-[#E6A200] transition-colors"
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

