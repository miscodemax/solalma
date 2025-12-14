"use client"
import { useEffect, useState, useCallback, useMemo } from "react"
import {
  Dialog, DialogContent
} from "@/components/ui/dialog"
import {
  Filter, ShoppingBag, Zap, Star, MapPin, Navigation, Loader2, X,
  Crosshair, AlertTriangle, Heart, Search, SlidersHorizontal,
  ChevronDown, CheckCircle, Clock, Truck, Sparkles
} from "lucide-react"
import ProductCard from "./product-card"
import BackToTopButton from "./BackToTopButton"
import {
  ProductCardSkeletonGrid
} from './skeletonComponents'
import PriceFilter from "./pricefilter"
import ShareAllSocialButton from "./shareAllSocialButton"

// Localités du Sénégal avec coordonnées GPS précises
const SENEGAL_LOCATIONS = [
  { name: "Dakar", lat: 14.6928, lng: -17.4467 },
  { name: "Plateau", lat: 14.6708, lng: -17.4395 },
  { name: "Médina", lat: 14.6765, lng: -17.4515 },
  { name: "Yoff", lat: 14.7539, lng: -17.4731 },
  { name: "Sacré-Coeur", lat: 14.7306, lng: -17.4640 },
  { name: "Almadies", lat: 14.7447, lng: -17.5264 },
  { name: "Ngor", lat: 14.7587, lng: -17.5180 },
  { name: "Ouakam", lat: 14.7289, lng: -17.4922 },
  { name: "Point E", lat: 14.7019, lng: -17.4644 },
  { name: "Mermoz", lat: 14.7089, lng: -17.4558 },
  { name: "Fann", lat: 14.7056, lng: -17.4739 },
  { name: "Liberté", lat: 14.7086, lng: -17.4656 },
  { name: "HLM", lat: 14.7085, lng: -17.4520 },
  { name: "Grand Dakar", lat: 14.7089, lng: -17.4495 },
  { name: "Pikine", lat: 14.7549, lng: -17.3985 },
  { name: "Guédiawaye", lat: 14.7692, lng: -17.4056 },
  { name: "Parcelles Assainies", lat: 14.7642, lng: -17.4314 },
  { name: "Rufisque", lat: 14.7167, lng: -17.2667 },
  { name: "Thiès", lat: 14.7886, lng: -16.9260 },
  { name: "Kaolack", lat: 14.1592, lng: -16.0729 },
  { name: "Saint-Louis", lat: 16.0179, lng: -16.4817 },
  { name: "Mbour", lat: 14.4198, lng: -16.9639 },
  { name: "Diourbel", lat: 14.6574, lng: -16.2335 },
  { name: "Ziguinchor", lat: 12.5681, lng: -16.2717 }
]

export default function FilteredProducts({ products = [], userId = "demo" }) {
  // États principaux
  const [priceRange, setPriceRange] = useState(null)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [filterOpen, setFilterOpen] = useState(false)
  const [locationFilterOpen, setLocationFilterOpen] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState(null)
  const [loading, setLoading] = useState(true)
  const [visibleCount, setVisibleCount] = useState(12)
  const [scrollY, setScrollY] = useState(0)
  const [searchTerm, setSearchTerm] = useState("")

  // États pour la géolocalisation (OPTIONNELLE)
  const [userPosition, setUserPosition] = useState(null)
  const [userLocationName, setUserLocationName] = useState("")
  const [locationLoading, setLocationLoading] = useState(false)
  const [locationError, setLocationError] = useState(null)
  const [locationEnabled, setLocationEnabled] = useState(false)

  // Fonction pour calculer la distance entre deux points GPS (formule Haversine)
  const calculateDistance = useCallback((lat1, lng1, lat2, lng2) => {
    const R = 6371
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLng = (lng2 - lng1) * Math.PI / 180
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }, [])

  // Fonction pour trouver la localité la plus proche
  const findNearestLocation = useCallback((lat, lng) => {
    let nearestLocation = "Position inconnue"
    let minDistance = Infinity

    SENEGAL_LOCATIONS.forEach(location => {
      const distance = calculateDistance(lat, lng, location.lat, location.lng)
      if (distance < minDistance) {
        minDistance = distance
        nearestLocation = location.name
      }
    })

    if (minDistance > 15) {
      nearestLocation = "Zone inconnue"
    }

    return nearestLocation
  }, [calculateDistance])

  // Fonction pour obtenir la position GPS de l'utilisateur
  const getCurrentPosition = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('La géolocalisation n\'est pas supportée'))
        return
      }

      navigator.geolocation.getCurrentPosition(
        resolve,
        reject,
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 300000
        }
      )
    })
  }

  // Fonction pour détecter la localisation GPS de l'utilisateur (ACTIVÉE PAR L'UTILISATEUR)
  const detectUserLocation = useCallback(async () => {
    setLocationLoading(true)
    setLocationError(null)

    try {
      const position = await getCurrentPosition()
      const lat = position.coords.latitude
      const lng = position.coords.longitude

      setUserPosition({ lat, lng })
      const nearestLocation = findNearestLocation(lat, lng)
      setUserLocationName(nearestLocation)
      setLocationEnabled(true)

    } catch (error) {
      console.error('Erreur de géolocalisation:', error)

      if (error.code === 1) {
        setLocationError('Permission refusée')
      } else if (error.code === 2) {
        setLocationError('Position indisponible')
      } else if (error.code === 3) {
        setLocationError('Timeout')
      } else {
        setLocationError('Erreur de géolocalisation')
      }

      setLocationEnabled(false)
    } finally {
      setLocationLoading(false)
    }
  }, [findNearestLocation])

  // Tri intelligent des produits par proximité (SI GPS ACTIVÉ)
  const sortedProducts = useMemo(() => {
    let filtered = products.filter(p => {
      const matchesSearch = !searchTerm ||
        p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesPrice = !priceRange || (p.price >= priceRange[0] && p.price <= priceRange[1])

      return matchesSearch && matchesPrice
    })

    // Filtrage par localisation sélectionnée
    if (selectedLocation) {
      const selectedLocationData = SENEGAL_LOCATIONS.find(loc =>
        loc.name.toLowerCase() === selectedLocation.toLowerCase()
      )

      if (selectedLocationData) {
        filtered = filtered.filter(p => {
          if (!p.latitude || !p.longitude) return p.zone === selectedLocation

          const distance = calculateDistance(
            selectedLocationData.lat,
            selectedLocationData.lng,
            p.latitude,
            p.longitude
          )
          return distance <= 5
        })
      } else {
        filtered = filtered.filter(p => p.zone === selectedLocation)
      }
    }

    // Tri par proximité GPS si position utilisateur disponible ET activée
    if (locationEnabled && userPosition) {
      filtered.sort((a, b) => {
        const aDistance = (a.latitude && a.longitude) ?
          calculateDistance(userPosition.lat, userPosition.lng, a.latitude, a.longitude) :
          Infinity
        const bDistance = (b.latitude && b.longitude) ?
          calculateDistance(userPosition.lat, userPosition.lng, b.latitude, b.longitude) :
          Infinity

        const aVeryClose = aDistance <= 2
        const bVeryClose = bDistance <= 2

        if (aVeryClose && !bVeryClose) return -1
        if (!aVeryClose && bVeryClose) return 1

        const aClose = aDistance <= 10
        const bClose = bDistance <= 10

        if (aClose && !bClose) return -1
        if (!aClose && bClose) return 1

        if (aDistance !== bDistance) return aDistance - bDistance

        return (b.popularity || 0) - (a.popularity || 0)
      })
    }

    return filtered
  }, [products, searchTerm, priceRange, selectedLocation, userPosition, locationEnabled, calculateDistance])

  // Compter les produits par zone
  const getLocationCount = useCallback((locationName) => {
    const locationData = SENEGAL_LOCATIONS.find(loc =>
      loc.name.toLowerCase() === locationName.toLowerCase()
    )

    if (!locationData) {
      return products.filter(p => p.zone === locationName).length
    }

    return products.filter(p => {
      if (p.latitude && p.longitude) {
        const distance = calculateDistance(
          locationData.lat,
          locationData.lng,
          p.latitude,
          p.longitude
        )
        return distance <= 5
      }
      return p.zone === locationName
    }).length
  }, [products, calculateDistance])

  // Compter les produits près de l'utilisateur
  const nearbyProductsCount = useMemo(() => {
    if (!locationEnabled || !userPosition) return 0

    return products.filter(p => {
      if (!p.latitude || !p.longitude) return false

      const distance = calculateDistance(
        userPosition.lat,
        userPosition.lng,
        p.latitude,
        p.longitude
      )
      return distance <= 5
    }).length
  }, [products, userPosition, locationEnabled, calculateDistance])

  // Zones avec des produits disponibles
  const availableZones = useMemo(() => {
    const zones = new Set()
    products.forEach(p => {
      if (p.zone) zones.add(p.zone)

      if (p.latitude && p.longitude) {
        const nearestZone = findNearestLocation(p.latitude, p.longitude)
        zones.add(nearestZone)
      }
    })

    return SENEGAL_LOCATIONS.filter(loc => zones.has(loc.name))
      .map(loc => ({ ...loc, count: getLocationCount(loc.name) }))
      .filter(loc => loc.count > 0)
      .sort((a, b) => b.count - a.count)
  }, [products, findNearestLocation, getLocationCount])

  // Effects
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800)
    return () => clearTimeout(timer)
  }, [])

  // Infinite scroll avec intersection observer
  useEffect(() => {
    if (loading || visibleCount >= sortedProducts.length) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount(prev => Math.min(prev + 12, sortedProducts.length))
        }
      },
      { threshold: 0.5, rootMargin: '200px' }
    )

    const sentinel = document.getElementById('scroll-sentinel')
    if (sentinel) observer.observe(sentinel)

    return () => observer.disconnect()
  }, [loading, visibleCount, sortedProducts.length])

  const productsToShow = sortedProducts.slice(0, visibleCount)

  // Composant pour le filtre de localisation
  const LocationFilter = () => (
    <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-3xl max-h-[80vh] overflow-y-auto">
      <div className="flex items-center justify-between mb-4 sm:mb-6 sticky top-0 bg-white dark:bg-gray-800 pb-2 z-10">
        <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100">
          Choisir une zone
        </h3>
        <button
          onClick={() => setLocationFilterOpen(false)}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
        >
          <X size={20} className="text-gray-500" />
        </button>
      </div>

      {/* Option "Toutes les zones" */}
      <button
        onClick={() => {
          setSelectedLocation(null)
          setLocationFilterOpen(false)
        }}
        className={`w-full flex items-center justify-between p-3 sm:p-4 rounded-xl mb-3 transition-all touch-manipulation ${!selectedLocation
          ? 'bg-[#F6C445]/10 border-2 border-[#F6C445] text-[#F6C445] shadow-md'
          : 'bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300'
          }`}
      >
        <div className="flex items-center gap-3">
          <Sparkles size={18} />
          <span className="font-medium">Toutes les zones</span>
        </div>
        <span className="text-sm bg-gray-100 dark:bg-gray-600 px-2 py-1 rounded-full">
          {products.length}
        </span>
      </button>

      {/* Bouton activer GPS */}
      {!locationEnabled && (
        <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
          <div className="flex items-start gap-3 mb-3">
            <div className="p-2 bg-blue-500 rounded-full">
              <Navigation size={16} className="text-white" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                Activer la géolocalisation
              </h4>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Trouvez les produits les plus proches de vous
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              detectUserLocation()
            }}
            disabled={locationLoading}
            className="w-full py-2.5 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {locationLoading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Détection en cours...</span>
              </>
            ) : (
              <>
                <Crosshair size={16} />
                <span>Activer mon GPS</span>
              </>
            )}
          </button>
          {locationError && (
            <p className="text-xs text-red-600 dark:text-red-400 mt-2 text-center">
              {locationError === 'Permission refusée' && 'Veuillez autoriser la géolocalisation dans les paramètres'}
              {locationError !== 'Permission refusée' && locationError}
            </p>
          )}
        </div>
      )}

      {/* Zone actuelle de l'utilisateur */}
      {locationEnabled && userPosition && userLocationName && (
        <div className="mb-4">
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-2 px-2 font-medium flex items-center gap-2">
            <Crosshair size={14} className="text-green-500" />
            <span>Votre position GPS</span>
          </p>
          <button
            onClick={() => {
              setSelectedLocation(userLocationName)
              setLocationFilterOpen(false)
            }}
            className={`w-full flex items-center justify-between p-3 sm:p-4 rounded-xl mb-3 transition-all touch-manipulation ${selectedLocation === userLocationName
              ? 'bg-[#F6C445]/10 border-2 border-[#F6C445] text-[#F6C445] shadow-md'
              : 'bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800'
              }`}
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <Crosshair size={18} className="text-green-600" />
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              </div>
              <div className="text-left">
                <span className="font-medium block">{userLocationName}</span>
                <span className="text-xs opacity-70">Rayon de 5km</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-sm bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 px-2 py-1 rounded-full font-medium">
                {nearbyProductsCount}
              </span>
            </div>
          </button>
          <button
            onClick={() => {
              setLocationEnabled(false)
              setUserPosition(null)
              setUserLocationName("")
            }}
            className="w-full text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors py-2"
          >
            Désactiver le GPS
          </button>
        </div>
      )}

      {/* Autres zones populaires */}
      {availableZones.filter(zone => zone.name !== userLocationName).length > 0 && (
        <div className="space-y-2">
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-2 px-2 font-medium">
            🏘️ Zones populaires
          </p>
          {availableZones
            .filter(zone => zone.name !== userLocationName)
            .slice(0, 10)
            .map((zone) => (
              <button
                key={zone.name}
                onClick={() => {
                  setSelectedLocation(zone.name)
                  setLocationFilterOpen(false)
                }}
                className={`w-full flex items-center justify-between p-3 rounded-xl transition-all touch-manipulation ${selectedLocation === zone.name
                  ? 'bg-[#F6C445]/10 border-2 border-[#F6C445] text-[#F6C445] shadow-md'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
              >
                <div className="flex items-center gap-3">
                  <MapPin size={16} />
                  <div className="text-left">
                    <span className="block font-medium">{zone.name}</span>
                    <span className="text-xs opacity-70">Rayon 5km</span>
                  </div>
                </div>
                <span className="text-sm bg-gray-100 dark:bg-gray-600 px-2 py-1 rounded-full">
                  {zone.count}
                </span>
              </button>
            ))}
        </div>
      )}
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F8F9FB] via-white to-[#F8F9FB] dark:from-[#111827] dark:via-[#1C2B49] dark:to-[#111827]">

      {/* Header mobile-first épuré */}
      <div
        className="sticky top-0 z-40 bg-white/90 dark:bg-[#1C2B49]/90 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 shadow-sm"
        style={{ transform: `translateY(${Math.min(scrollY * 0.05, 10)}px)` }}
      >
        <div className="px-3 sm:px-4 py-3 sm:py-4 max-w-7xl mx-auto">

          {/* Stats compactes */}
          <div className="flex items-center justify-center gap-3 sm:gap-4 mb-3 text-xs text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-1.5">
              <ShoppingBag size={14} className="text-[#F6C445]" />
              <span>{sortedProducts.length} produits</span>
            </div>

            {locationEnabled && userPosition && nearbyProductsCount > 0 && (
              <>
                <div className="w-1 h-1 bg-gray-400 rounded-full" />
                <div className="flex items-center gap-1.5">
                  <Crosshair size={14} className="text-green-500" />
                  <span>{nearbyProductsCount} près de vous</span>
                </div>
              </>
            )}
          </div>

          {/* Actions horizontales */}
          <div className="flex items-center gap-2 sm:gap-3">

            {/* Filtre prix */}
            <button
              onClick={() => setFilterOpen(true)}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl border transition-all duration-300 hover:scale-105 active:scale-95 shadow-sm touch-manipulation text-sm font-medium ${priceRange
                ? 'border-[#F6C445] bg-[#F6C445]/10 text-[#F6C445]'
                : 'border-gray-200 dark:border-gray-600 bg-white/90 dark:bg-gray-800/90 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
            >
              <SlidersHorizontal size={16} />
              <span className="hidden sm:inline">Prix</span>
              {priceRange && <div className="w-1.5 h-1.5 bg-[#F6C445] rounded-full animate-pulse" />}
            </button>

            {/* Filtre localisation */}
            <button
              onClick={() => setLocationFilterOpen(true)}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl border transition-all duration-300 hover:scale-105 active:scale-95 shadow-sm touch-manipulation text-sm font-medium min-w-0 flex-1 ${selectedLocation
                ? 'border-[#F6C445] bg-[#F6C445]/10 text-[#F6C445]'
                : 'border-gray-200 dark:border-gray-600 bg-white/90 dark:bg-gray-800/90 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
            >
              <MapPin size={16} className="flex-shrink-0" />
              <span className="truncate">
                {selectedLocation || "Zone"}
              </span>
              <ChevronDown size={14} className="flex-shrink-0 opacity-70" />
              {selectedLocation && <div className="w-1.5 h-1.5 bg-[#F6C445] rounded-full animate-pulse flex-shrink-0" />}
            </button>

            {/* Bouton partage */}
            <ShareAllSocialButton className="p-2 sm:p-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white/90 dark:bg-gray-800/90 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300 hover:scale-105 active:scale-95 shadow-sm">
              <Heart size={16} />
            </ShareAllSocialButton>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-3 sm:px-4 max-w-7xl mx-auto pt-4 sm:pt-6">
        {loading ? (
          <ProductCardSkeletonGrid count={12} />
        ) : (
          <>
            {/* Section principale avec header */}
            <div className="mb-4 sm:mb-6">
              <div className="flex items-start justify-between mb-4 gap-4">
                <div className="min-w-0 flex-1">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                    {selectedLocation ? (
                      <span className="flex items-center gap-2">
                        <MapPin size={20} className="text-[#F6C445] flex-shrink-0" />
                        <span className="truncate">{selectedLocation}</span>
                      </span>
                    ) : locationEnabled && userPosition ? (
                      <span className="flex items-center gap-2">
                        <Crosshair size={20} className="text-[#F6C445] flex-shrink-0" />
                        <span className="truncate">Près de vous</span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Sparkles size={20} className="text-[#F6C445] flex-shrink-0" />
                        <span>Tous les produits</span>
                      </span>
                    )}
                  </h2>

                  {/* Sous-titre informatif */}
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <span>{sortedProducts.length} article{sortedProducts.length > 1 ? 's' : ''}</span>
                    {!selectedLocation && locationEnabled && userPosition && (
                      <>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Navigation size={12} />
                          <span>Triés par proximité</span>
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Bouton clear filters */}
                {(priceRange || selectedLocation || searchTerm) && (
                  <button
                    onClick={() => {
                      setPriceRange(null)
                      setSelectedLocation(null)
                      setSearchTerm("")
                      setSelectedIndex(0)
                    }}
                    className="text-xs sm:text-sm text-[#F6C445] hover:text-[#E2AE32] font-medium transition-colors duration-300 px-3 py-1.5 bg-[#F6C445]/10 rounded-lg hover:bg-[#F6C445]/20 flex-shrink-0"
                  >
                    Effacer
                  </button>
                )}
              </div>
            </div>

            {sortedProducts.length === 0 ? (
              /* État vide */}
              <div className="flex flex-col items-center justify-center py-16 sm:py-24 text-center px-4">
                <div className="relative mb-6">
                  <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                    <ShoppingBag size={32} className="text-gray-400" />
                  </div>
                </div>

                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  Aucun produit trouvé
                </h3>

                <p className="text-gray-600 dark:text-gray-400 text-sm mb-6 max-w-sm">
                  {selectedLocation ?
                    `Aucun produit disponible à ${selectedLocation} pour le moment.` :
                    "Essayez d'ajuster vos filtres ou revenez plus tard."
                  }
                </p>

                <button
                  onClick={() => {
                    setPriceRange(null)
                    setSelectedLocation(null)
                    setSearchTerm("")
                  }}
                  className="px-6 py-3 bg-[#F6C445] text-[#1C2B49] font-semibold rounded-xl hover:bg-[#E2AE32] transition-all duration-300 hover:scale-105"
                >
                  Réinitialiser les filtres
                </button>
              </div>
            ) : (
              <>
                {/* Grille de produits optimisée */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
                  {productsToShow.map((product, index) => {
                    let distance = null
                    if (locationEnabled && userPosition && product.latitude && product.longitude) {
                      distance = calculateDistance(
                        userPosition.lat,
                        userPosition.lng,
                        product.latitude,
                        product.longitude
                      )
                    }

                    return (
                      <div
                        key={product.id}
                        className="animate-fade-in-up"
                        style={{
                          animationDelay: `${(index % 12) * 30}ms`,
                          animationFillMode: 'both'
                        }}
                      >
                        {distance !== null && distance <= 2 && (
                          <div className="absolute top-2 right-2 z-10 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full shadow-md flex items-center gap-1">
                            <Crosshair size={10} />
                            <span>{distance.toFixed(1)}km</span>
                          </div>
                        )}

                        <ProductCard
                          product={{
                            ...product,
                            distance: distance
                          }}
                          userId={userId}
                        />
                      </div>
                    )
                  })}
                </div>

                {/* Sentinel pour infinite scroll + skeleton */}
                {visibleCount < sortedProducts.length && (
                  <div id="scroll-sentinel" className="py-8">
                    <ProductCardSkeletonGrid count={4} />
                  </div>
                )}

                {/* Message fin de liste */}
                {visibleCount >= sortedProducts.length && sortedProducts.length > 12 && (
                  <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                    <CheckCircle size={24} className="mx-auto mb-2 text-[#F6C445]" />
                    <p className="text-sm">Vous avez vu tous les produits</p>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>

      {/* Dialogs */}

      {/* Filtre prix */}
      <Dialog open={filterOpen} onOpenChange={setFilterOpen}>
        <DialogContent className="w-[95vw] max-w-md mx-auto rounded-3xl p-0 overflow-hidden border-0 shadow-2xl">
          <PriceFilter
            onChange={(r) => {
              setPriceRange(r);
              setFilterOpen(false);
            }}
            selectedIndex={selectedIndex}
            onSelect={setSelectedIndex}
            onClose={() => setFilterOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Filtre localisation */}
      <Dialog open={locationFilterOpen} onOpenChange={setLocationFilterOpen}>
        <DialogContent className="w-[95vw] max-w-md mx-auto rounded-3xl p-0 overflow-hidden border-0 shadow-2xl max-h-[90vh]">
          <LocationFilter />
        </DialogContent>
      </Dialog>

      {/* Back to top */}
      <BackToTopButton />

      {/* Styles CSS */}
      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        
        @keyframes fade-in-up {
          0% {
            opacity: 0;
            transform: translateY(20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }
        
        .touch-manipulation {
          touch-action: manipulation;
          -webkit-tap-highlight-color: transparent;
        }
        
        .overflow-y-auto::-webkit-scrollbar {
          width: 4px;
        }
        
        .overflow-y-auto::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.1);
          border-radius: 2px;
        }
        
        .overflow-y-auto::-webkit-scrollbar-thumb {
          background: #F6C445;
          border-radius: 2px;
        }
        
        .overflow-y-auto::-webkit-scrollbar-thumb:hover {
          background: #E2AE32;
        }
        
        @media (max-width: 640px) {
          .hover\\:scale-105:hover {
            transform: none;
          }
          
          .hover\\:scale-105:active {
            transform: scale(0.98);
          }
          
          button {
            min-height: 44px;
          }
        }
        
        button:focus-visible {
          outline: 2px solid #F6C445;
          outline-offset: 2px;
        }
        
        input:focus-visible {
          outline: 2px solid #F6C445;
          outline-offset: 2px;
        }
        
        * {
          transition-property: background-color, border-color, color, fill, stroke, opacity, box-shadow, transform;
          transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
          transition-duration: 150ms;
        }
      `}</style>
    </div>
  )
}