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
import PopularProductsCarousel from "./popularProductsCaroussel"
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
  const [visibleCount, setVisibleCount] = useState(8) // Réduit pour mobile
  const [scrollY, setScrollY] = useState(0)
  const [searchTerm, setSearchTerm] = useState("")

  // États pour la géolocalisation
  const [userPosition, setUserPosition] = useState(null)
  const [userLocationName, setUserLocationName] = useState("")
  const [locationLoading, setLocationLoading] = useState(true)
  const [locationError, setLocationError] = useState(null)
  const [locationPermissionDenied, setLocationPermissionDenied] = useState(false)

  // Fonction pour calculer la distance entre deux points GPS (formule Haversine)
  const calculateDistance = useCallback((lat1, lng1, lat2, lng2) => {
    const R = 6371 // Rayon de la Terre en km
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

  // Fonction pour détecter la localisation GPS de l'utilisateur
  const detectUserLocation = useCallback(async () => {
    setLocationLoading(true)
    setLocationError(null)
    setLocationPermissionDenied(false)

    try {
      const position = await getCurrentPosition()
      const lat = position.coords.latitude
      const lng = position.coords.longitude

      setUserPosition({ lat, lng })
      const nearestLocation = findNearestLocation(lat, lng)
      setUserLocationName(nearestLocation)

    } catch (error) {
      console.error('Erreur de géolocalisation:', error)

      if (error.code === 1) {
        setLocationPermissionDenied(true)
        setLocationError('Permission refusée')
      } else if (error.code === 2) {
        setLocationError('Position indisponible')
      } else if (error.code === 3) {
        setLocationError('Timeout')
      } else {
        setLocationError('Erreur de géolocalisation')
      }

      // Valeur par défaut (centre de Dakar)
      setUserPosition({ lat: 14.6928, lng: -17.4467 })
      setUserLocationName('Dakar')
    } finally {
      setLocationLoading(false)
    }
  }, [findNearestLocation])

  // Tri intelligent des produits par proximité
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
          return distance <= 5 // 5km de rayon
        })
      } else {
        filtered = filtered.filter(p => p.zone === selectedLocation)
      }
    }

    // Tri par proximité GPS si position utilisateur disponible
    if (userPosition) {
      filtered.sort((a, b) => {
        // Calcul des distances
        const aDistance = (a.latitude && a.longitude) ?
          calculateDistance(userPosition.lat, userPosition.lng, a.latitude, a.longitude) :
          Infinity
        const bDistance = (b.latitude && b.longitude) ?
          calculateDistance(userPosition.lat, userPosition.lng, b.latitude, b.longitude) :
          Infinity

        // Priorité pour les produits très proches (< 2km)
        const aVeryClose = aDistance <= 2
        const bVeryClose = bDistance <= 2

        if (aVeryClose && !bVeryClose) return -1
        if (!aVeryClose && bVeryClose) return 1

        // Priorité pour les produits proches (< 10km)
        const aClose = aDistance <= 10
        const bClose = bDistance <= 10

        if (aClose && !bClose) return -1
        if (!aClose && bClose) return 1

        // Si même catégorie de distance, trier par distance exacte
        if (aDistance !== bDistance) return aDistance - bDistance

        // Si même distance, trier par popularité ou date
        return (b.popularity || 0) - (a.popularity || 0)
      })
    }

    return filtered
  }, [products, searchTerm, priceRange, selectedLocation, userPosition, calculateDistance])

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
    if (!userPosition) return 0

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
  }, [products, userPosition, calculateDistance])

  // Zones avec des produits disponibles
  const availableZones = useMemo(() => {
    const zones = new Set()
    products.forEach(p => {
      if (p.zone) zones.add(p.zone)

      // Ajouter aussi les zones basées sur les coordonnées GPS
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
    detectUserLocation()
  }, [detectUserLocation])

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000)
    return () => clearTimeout(timer)
  }, [])

  const productsToShow = sortedProducts.slice(0, visibleCount)

  // Composant pour le filtre de localisation amélioré
  const LocationFilter = () => (
    <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-3xl max-h-[80vh] overflow-y-auto">
      <div className="flex items-center justify-between mb-4 sm:mb-6 sticky top-0 bg-white dark:bg-gray-800 pb-2">
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

      {/* Zone actuelle de l'utilisateur */}
      {userPosition && userLocationName && !locationLoading && (
        <div className="mb-4">
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-2 px-2 font-medium">
            🎯 Votre zone (GPS)
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
              <Crosshair size={18} className="text-green-600" />
              <div className="text-left">
                <span className="font-medium block">{userLocationName}</span>
                <span className="text-xs opacity-70">Rayon de 5km</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-sm bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 px-2 py-1 rounded-full">
                {nearbyProductsCount}
              </span>
              <div className="text-xs text-green-600 mt-1">GPS</div>
            </div>
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
            .slice(0, 10) // Limiter l'affichage sur mobile
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

      {/* Header mobile-first avec effet parallax */}
      <div
        className="sticky top-0 z-40 bg-white/90 dark:bg-[#1C2B49]/90 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 shadow-sm"
        style={{ transform: `translateY(${Math.min(scrollY * 0.05, 10)}px)` }}
      >
        <div className="px-3 sm:px-4 py-3 sm:py-4 max-w-7xl mx-auto">

          {/* Stats compactes pour mobile */}
          <div className="flex items-center justify-center gap-2 sm:gap-4 mb-3 text-xs text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="hidden sm:inline">{products.length} produits</span>
              <span className="sm:hidden">{products.length}</span>
            </div>

            <div className="w-1 h-1 bg-gray-400 rounded-full hidden sm:block" />

            <div className="flex items-center gap-1">
              {locationLoading ? (
                <Loader2 className="w-3 h-3 animate-spin text-[#F6C445]" />
              ) : locationPermissionDenied ? (
                <AlertTriangle className="w-3 h-3 text-orange-500" />
              ) : (
                <Crosshair className="w-3 h-3 text-[#F6C445]" />
              )}
              <span className="hidden sm:inline">
                {locationLoading ? 'Localisation...' :
                  locationPermissionDenied ? 'GPS requis' :
                    locationError ? 'GPS off' :
                      `${nearbyProductsCount} près (${userLocationName})`}
              </span>
              <span className="sm:hidden">
                {locationLoading ? 'GPS...' :
                  locationPermissionDenied ? 'GPS?' :
                    `${nearbyProductsCount}`}
              </span>
            </div>

            <div className="w-1 h-1 bg-gray-400 rounded-full hidden sm:block" />

            <div className="flex items-center gap-1">
              <Truck className="w-3 h-3 text-[#F6C445]" />
              <span className="hidden sm:inline">Livraison rapide</span>
              <span className="sm:hidden">🚀</span>
            </div>
          </div>

          {/* Barre de recherche mobile-friendly */}
          <div className="mb-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un produit..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 sm:py-3 bg-white/80 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#F6C445]/50 focus:border-[#F6C445] transition-all placeholder-gray-500 dark:placeholder-gray-400"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                >
                  <X className="w-3 h-3 text-gray-400" />
                </button>
              )}
            </div>
          </div>

          {/* Alerte permission mobile-optimized */}
          {locationPermissionDenied && (
            <div className="mb-3 p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-xl">
              <div className="flex items-center gap-2 text-xs sm:text-sm text-orange-700 dark:text-orange-300">
                <AlertTriangle size={16} className="flex-shrink-0" />
                <span className="flex-1">Activez le GPS pour les produits près de vous</span>
                <button
                  onClick={detectUserLocation}
                  className="text-[#F6C445] hover:text-[#E2AE32] font-medium px-2 py-1 bg-white dark:bg-gray-800 rounded-lg transition-colors touch-manipulation"
                >
                  GPS
                </button>
              </div>
            </div>
          )}

          {/* Actions horizontales optimisées mobile */}
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
                {selectedLocation || (locationLoading ? "..." : "Zone")}
              </span>
              <ChevronDown size={14} className="flex-shrink-0 opacity-70" />
              {selectedLocation && <div className="w-1.5 h-1.5 bg-[#F6C445] rounded-full animate-pulse flex-shrink-0" />}
            </button>

            {/* Bouton partage compact */}
            <ShareAllSocialButton className="p-2 sm:p-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white/90 dark:bg-gray-800/90 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300 hover:scale-105 active:scale-95 shadow-sm">
              <Heart size={16} />
            </ShareAllSocialButton>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-3 sm:px-4 max-w-7xl mx-auto pt-4 sm:pt-6">
        {loading ? (
          <div className="space-y-6 sm:space-y-8">
            {/* Skeleton carrousel */}
            <div className="h-24 sm:h-32 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-2xl animate-pulse" />
            <ProductCardSkeletonGrid count={4} />
          </div>
        ) : (
          <>
            {/* Carrousel des produits populaires */}
            <div className="mb-6">
              <PopularProductsCarousel products={products} />
            </div>

            {/* Section principale avec header amélioré */}
            <div className="mb-4 sm:mb-6">
              <div className="flex items-start justify-between mb-4 gap-4">
                <div className="min-w-0 flex-1">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                    {selectedLocation ? (
                      <span className="flex items-center gap-2">
                        <MapPin size={20} className="text-[#F6C445] flex-shrink-0" />
                        <span className="truncate">{selectedLocation}</span>
                      </span>
                    ) : userPosition ? (
                      <span className="flex items-center gap-2">
                        <Crosshair size={20} className="text-[#F6C445] flex-shrink-0" />
                        <span className="truncate">Près de {userLocationName}</span>
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
                    <span>{sortedProducts.length} produit{sortedProducts.length > 1 ? 's' : ''}</span>
                    {!selectedLocation && userPosition && !locationLoading && (
                      <>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Navigation size={12} />
                          <span>Par proximité GPS</span>
                        </span>
                      </>
                    )}
                    {searchTerm && (
                      <>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Search size={12} />
                          <span className="truncate max-w-20">{searchTerm}</span>
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Bouton clear filters compact */}
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

            {/* Indicateurs de statut des produits */}
            {sortedProducts.length > 0 && userPosition && !locationLoading && (
              <div className="flex flex-wrap gap-2 mb-4 sm:mb-6">
                {nearbyProductsCount > 0 && (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-full text-xs border border-green-200 dark:border-green-800">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                    <span>{nearbyProductsCount} près de vous (≤5km)</span>
                  </div>
                )}

                {sortedProducts.some(p => !p.latitude || !p.longitude) && (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-full text-xs border border-blue-200 dark:border-blue-800">
                    <Clock size={12} />
                    <span>Livraison express disponible</span>
                  </div>
                )}
              </div>
            )}

            {sortedProducts.length === 0 ? (
              /* État vide amélioré */
              <div className="flex flex-col items-center justify-center py-12 sm:py-20 text-center px-4">
                <div className="relative mb-6">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-2xl flex items-center justify-center mb-4">
                    <ShoppingBag size={24} className="text-gray-400" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-[#F6C445] rounded-full flex items-center justify-center">
                    <X size={12} className="text-white" />
                  </div>
                </div>

                <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  {selectedLocation ?
                    `Aucun produit à ${selectedLocation}` :
                    searchTerm ?
                      "Aucun résultat trouvé" :
                      "Aucun produit disponible"
                  }
                </h3>

                <p className="text-gray-600 dark:text-gray-400 text-sm mb-6 max-w-sm leading-relaxed">
                  {selectedLocation ?
                    "Essayez une autre zone ou élargissez votre recherche. De nouveaux vendeurs rejoignent chaque jour !" :
                    searchTerm ?
                      "Vérifiez l'orthographe ou essayez d'autres mots-clés." :
                      "Revenez bientôt, nous ajoutons régulièrement de nouveaux produits."
                  }
                </p>

                <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm">
                  <button
                    onClick={() => {
                      setPriceRange(null)
                      setSelectedLocation(null)
                      setSearchTerm("")
                      setSelectedIndex(0)
                    }}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-[#F6C445] to-[#FFD700] text-[#1C2B49] font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 touch-manipulation"
                  >
                    Voir tous les produits
                  </button>

                  {selectedLocation && availableZones.length > 0 && (
                    <button
                      onClick={() => setLocationFilterOpen(true)}
                      className="flex-1 px-6 py-3 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium rounded-xl border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300 touch-manipulation"
                    >
                      Autres zones
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <>
                {/* Grille de produits optimisée mobile */}
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 pb-8">
                  {productsToShow.map((product, index) => {
                    // Calcul de la distance pour affichage
                    let distance = null
                    if (userPosition && product.latitude && product.longitude) {
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
                        className="animate-fade-in-up relative group"
                        style={{
                          animationDelay: `${index * 50}ms`,
                          animationFillMode: 'both'
                        }}
                      >
                        {/* Badge de proximité */}
                        {distance !== null && distance <= 2 && (
                          <div className="absolute -top-1 -right-1 z-10 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full shadow-lg flex items-center gap-1">
                            <Crosshair size={8} />
                            <span className="hidden sm:inline">{distance.toFixed(1)}km</span>
                            <span className="sm:hidden">Près</span>
                          </div>
                        )}

                        {/* Badge nouveauté */}
                        {index < 3 && !selectedLocation && !searchTerm && (
                          <div className="absolute top-2 left-2 z-10 bg-[#F6C445] text-[#1C2B49] text-xs px-2 py-1 rounded-full shadow-lg font-bold flex items-center gap-1">
                            <Star size={8} className="fill-current" />
                            <span className="hidden sm:inline">Top</span>
                            <span className="sm:hidden">⭐</span>
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

                {/* Bouton "Voir plus" amélioré avec progression */}
                {visibleCount < sortedProducts.length && (
                  <div className="flex flex-col items-center pb-8 sm:pb-12">
                    <div className="text-center mb-4 w-full max-w-md">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        <span className="font-medium">{visibleCount}</span> sur <span className="font-medium">{sortedProducts.length}</span> produits
                      </p>

                      {/* Barre de progression */}
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-4">
                        <div
                          className="h-2 bg-gradient-to-r from-[#F6C445] to-[#FFD700] rounded-full transition-all duration-500 relative overflow-hidden"
                          style={{ width: `${(visibleCount / sortedProducts.length) * 100}%` }}
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => setVisibleCount(visibleCount + 8)}
                      className="group relative px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-[#F6C445] to-[#FFD700] text-[#1C2B49] font-bold rounded-2xl shadow-lg hover:shadow-2xl hover:shadow-[#F6C445]/20 transition-all duration-300 hover:scale-105 active:scale-95 overflow-hidden touch-manipulation"
                    >
                      <span className="relative z-10 flex items-center gap-2">
                        <span className="hidden sm:inline">Découvrir plus de produits</span>
                        <span className="sm:hidden">Voir plus</span>
                        <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-[#1C2B49] border-t-transparent rounded-full animate-spin group-hover:animate-none transition-all" />
                      </span>
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                    </button>

                    {/* Indicateur de fin proche */}
                    {sortedProducts.length - visibleCount <= 8 && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 flex items-center gap-1">
                        <Sparkles size={10} />
                        Plus que {sortedProducts.length - visibleCount} produits !
                      </p>
                    )}
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>

      {/* Dialogs améliorés */}

      {/* Filtre prix dialog */}
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

      {/* Filtre localisation dialog */}
      <Dialog open={locationFilterOpen} onOpenChange={setLocationFilterOpen}>
        <DialogContent className="w-[95vw] max-w-md mx-auto rounded-3xl p-0 overflow-hidden border-0 shadow-2xl max-h-[90vh]">
          <LocationFilter />
        </DialogContent>
      </Dialog>

      {/* Back to top button */}
      <BackToTopButton />

      {/* Styles CSS améliorés */}
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
        
        @keyframes pulse-glow {
          0%, 100% {
            box-shadow: 0 0 5px rgba(246, 196, 69, 0.3);
          }
          50% {
            box-shadow: 0 0 20px rgba(246, 196, 69, 0.6), 0 0 30px rgba(246, 196, 69, 0.4);
          }
        }
        
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }
        
        .animate-pulse-glow {
          animation: pulse-glow 2s infinite;
        }
        
        /* Optimisations tactiles */
        .touch-manipulation {
          touch-action: manipulation;
          -webkit-tap-highlight-color: transparent;
        }
        
        /* Scrollbar personnalisé */
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
        
        /* Amélioration des interactions sur mobile */
        @media (max-width: 640px) {
          .hover\\:scale-105:hover {
            transform: none;
          }
          
          .hover\\:scale-105:active {
            transform: scale(0.98);
          }
          
          /* Augmenter la taille des zones tactiles */
          button {
            min-height: 44px;
          }
          
          /* Améliorer la lisibilité sur petits écrans */
          .text-xs {
            font-size: 0.75rem;
            line-height: 1.2;
          }
        }
        
        /* Animation pour les badges de proximité */
        @keyframes bounce-in {
          0% {
            opacity: 0;
            transform: scale(0.3);
          }
          50% {
            opacity: 1;
            transform: scale(1.05);
          }
          70% {
            transform: scale(0.9);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        .animate-bounce-in {
          animation: bounce-in 0.6s ease-out;
        }
        
        /* Focus visible pour l'accessibilité */
        button:focus-visible {
          outline: 2px solid #F6C445;
          outline-offset: 2px;
        }
        
        input:focus-visible {
          outline: 2px solid #F6C445;
          outline-offset: 2px;
        }
        
        /* Transition fluide pour le dark mode */
        * {
          transition-property: background-color, border-color, color, fill, stroke, opacity, box-shadow, transform;
          transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
          transition-duration: 150ms;
        }
        
        /* Optimisation des performances */
        .will-change-transform {
          will-change: transform;
        }
        
        .will-change-scroll {
          will-change: scroll-position;
        }
      `}</style>
    </div>
  )
}