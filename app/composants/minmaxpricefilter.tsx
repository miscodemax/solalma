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

    useEffect(() => {
        setTempMin(minPrice)
        setTempMax(maxPrice)
    }, [minPrice, maxPrice])

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
        const minVal = tempMin ? parseInt(tempMin.toString().replace(/\s/g, '')) : ""
        const maxVal = tempMax ? parseInt(tempMax.toString().replace(/\s/g, '')) : ""

        if (minVal && maxVal && minVal > maxVal) {
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
            return `${formatNumber(minPrice)} - ${formatNumber(maxPrice)}`
        }
        if (minPrice) return `${formatNumber(minPrice)}+`
        if (maxPrice) return `< ${formatNumber(maxPrice)}`
        return "Budget"
    }

    const hasActiveFilter = minPrice || maxPrice

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Bouton trigger minimaliste */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`
                    flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium
                    transition-all duration-200 border
                    ${hasActiveFilter
                        ? 'bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800'
                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }
                `}
            >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>

                <span className="text-sm">{formatDisplayText()}</span>

                <svg
                    className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {/* Dropdown compact et moderne */}
            {isOpen && (
                <div className="absolute top-full mt-2 left-0 sm:right-0 sm:left-auto w-full sm:w-80 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 z-50 animate-in slide-in-from-top-2 fade-in duration-200">
                    <div className="p-4 space-y-4">
                        {/* Header minimal */}
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                Budget
                            </h3>
                            {hasActiveFilter && (
                                <button
                                    onClick={handleReset}
                                    className="text-xs text-gray-500 hover:text-blue-600 transition-colors"
                                >
                                    Effacer
                                </button>
                            )}
                        </div>

                        {/* Inputs compacts */}
                        <div className="flex items-center gap-3">
                            <div className="flex-1">
                                <input
                                    type="number"
                                    value={tempMin}
                                    onChange={(e) => setTempMin(e.target.value)}
                                    placeholder="Min"
                                    className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                    min="0"
                                />
                            </div>

                            <div className="w-3 h-px bg-gray-300 dark:bg-gray-600"></div>

                            <div className="flex-1">
                                <input
                                    type="number"
                                    value={tempMax}
                                    onChange={(e) => setTempMax(e.target.value)}
                                    placeholder="Max"
                                    className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                    min={tempMin || "0"}
                                />
                            </div>
                        </div>

                        {/* Quick select simplifié */}
                        <div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">Gammes populaires</div>
                            <div className="grid grid-cols-2 gap-2">
                                {[
                                    { label: "< 2K", min: "", max: "2000" },
                                    { label: "2K-7K", min: "2000", max: "7000" },
                                    { label: "7K-15K", min: "7000", max: "15000" },
                                    { label: "> 15K", min: "15000", max: "" }
                                ].map((suggestion, index) => (
                                    <button
                                        key={index}
                                        onClick={() => handleQuickSelect(suggestion.min, suggestion.max)}
                                        className="px-3 py-2 text-xs font-medium rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                                    >
                                        {suggestion.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Actions compactes */}
                        <div className="flex gap-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                            <button
                                onClick={() => setIsOpen(false)}
                                className="flex-1 px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={handleApply}
                                className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
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