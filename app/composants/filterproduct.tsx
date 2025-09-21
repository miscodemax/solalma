"use client"
import { useEffect, useState } from "react"
import {
  Dialog, DialogContent
} from "@/components/ui/dialog"
import { Filter, ShoppingBag, Zap, Star, MapPin, Navigation, Loader2, X, Crosshair, AlertTriangle } from "lucide-react"
import ProductCard from "./product-card"
import BackToTopButton from "./BackToTopButton"
import {
  ProductCardSkeletonGrid
} from './skeletonComponents'
import PopularProductsCarousel from "./popularProductsCaroussel"
import PriceFilter from "./pricefilter"
import ShareAllSocialButton from "./shareAllSocialButton"

// Localités communes au Sénégal avec coordonnées approximatives
const SENEGAL_LOCATIONS = [
  { name: "Dakar", lat: 14.6928, lng: -17.4467 },
  { name: "Pikine", lat: 14.7549, lng: -17.3985 },
  { name: "Guédiawaye", lat: 14.7692, lng: -17.4056 },
  { name: "Rufisque", lat: 14.7167, lng: -17.2667 },
  { name: "Thiès", lat: 14.7886, lng: -16.9260 },
  { name: "Kaolack", lat: 14.1592, lng: -16.0729 },
  { name: "Saint-Louis", lat: 16.0179, lng: -16.4817 },
  { name: "Mbour", lat: 14.4198, lng: -16.9639 },
  { name: "Diourbel", lat: 14.6574, lng: -16.2335 },
  { name: "Ziguinchor", lat: 12.5681, lng: -16.2717 },
  { name: "Louga", lat: 15.6181, lng: -16.2264 },
  { name: "Tambacounda", lat: 13.7671, lng: -13.6681 },
  { name: "Kolda", lat: 12.8939, lng: -14.9417 },
  { name: "Fatick", lat: 14.3347, lng: -16.4123 },
  { name: "Kaffrine", lat: 14.1058, lng: -15.5500 },
  { name: "Kédougou", lat: 12.5571, lng: -12.1750 },
  { name: "Matam", lat: 15.6558, lng: -13.2533 },
  { name: "Sédhiou", lat: 12.7081, lng: -15.5564 },
  { name: "Grand Dakar", lat: 14.6937, lng: -17.4441 },
  { name: "Parcelles Assainies", lat: 14.7642, lng: -17.4314 },
  { name: "Almadies", lat: 14.7447, lng: -17.5264 },
  { name: "Ngor", lat: 14.7587, lng: -17.5180 },
  { name: "Yoff", lat: 14.7539, lng: -17.4731 },
  { name: "Ouakam", lat: 14.7289, lng: -17.4922 },
  { name: "Point E", lat: 14.7019, lng: -17.4644 },
  { name: "Mermoz", lat: 14.7089, lng: -17.4558 },
  { name: "Sacré-Coeur", lat: 14.7147, lng: -17.4711 },
  { name: "Plateau", lat: 14.6731, lng: -17.4419 },
  { name: "Médina", lat: 14.6789, lng: -17.4531 }
]

export default function FilteredProducts({ products = [], userId = "demo" }) {
  const displayProducts = products

  const [priceRange, setPriceRange] = useState<[number, number] | null>(null)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [filterOpen, setFilterOpen] = useState(false)
  const [locationFilterOpen, setLocationFilterOpen] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [visibleCount, setVisibleCount] = useState(12)
  const [scrollY, setScrollY] = useState(0)

  // États pour la géolocalisation GPS
  const [userPosition, setUserPosition] = useState<{ lat: number, lng: number } | null>(null)
  const [userLocationName, setUserLocationName] = useState<string>("")
  const [locationLoading, setLocationLoading] = useState(true)
  const [locationError, setLocationError] = useState<string | null>(null)
  const [locationPermissionDenied, setLocationPermissionDenied] = useState(false)

  // Fonction pour calculer la distance entre deux points GPS (formule Haversine)
  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371 // Rayon de la Terre en km
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLng = (lng2 - lng1) * Math.PI / 180
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  // Fonction pour trouver la localité la plus proche
  const findNearestLocation = (lat: number, lng: number): string => {
    let nearestLocation = "Position inconnue"
    let minDistance = Infinity

    SENEGAL_LOCATIONS.forEach(location => {
      const distance = calculateDistance(lat, lng, location.lat, location.lng)
      if (distance < minDistance) {
        minDistance = distance
        nearestLocation = location.name
      }
    })

    return nearestLocation
  }

  // Fonction pour obtenir la position GPS
  const getCurrentPosition = (): Promise<GeolocationPosition> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('La géolocalisation n\'est pas supportée par votre navigateur'))
        return
      }

      navigator.geolocation.getCurrentPosition(
        resolve,
        reject,
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // Cache pendant 5 minutes
        }
      )
    })
  }

  // Fonction pour détecter la localisation via GPS
  const detectUserLocation = async () => {
    setLocationLoading(true)
    setLocationError(null)
    setLocationPermissionDenied(false)

    try {
      console.log('Demande de géolocalisation GPS...')
      const position = await getCurrentPosition()

      const lat = position.coords.latitude
      const lng = position.coords.longitude
      const accuracy = position.coords.accuracy

      console.log(`Position GPS détectée: ${lat}, ${lng} (précision: ${Math.round(accuracy)}m)`)

      setUserPosition({ lat, lng })

      // Trouver la localité la plus proche
      const nearestLocation = findNearestLocation(lat, lng)
      setUserLocationName(nearestLocation)

      console.log(`Localité la plus proche: ${nearestLocation}`)

    } catch (error) {
      console.error('Erreur de géolocalisation GPS:', error)

      if (error.code === 1) {
        setLocationPermissionDenied(true)
        setLocationError('Permission de localisation refusée')
      } else if (error.code === 2) {
        setLocationError('Position indisponible')
      } else if (error.code === 3) {
        setLocationError('Timeout de localisation')
      } else {
        setLocationError(error.message || 'Erreur de géolocalisation')
      }

      // Valeurs par défaut (centre de Dakar)
      setUserPosition({ lat: 14.6928, lng: -17.4467 })
      setUserLocationName('Dakar')
    } finally {
      setLocationLoading(false)
    }
  }

  // Demander la permission et détecter la localisation au chargement
  useEffect(() => {
    detectUserLocation()
  }, [])

  // Effet de scroll pour les animations
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1200)
    return () => clearTimeout(t)
  }, [])

  // Fonction pour trier les produits par proximité GPS
  const sortProductsByGPSProximity = (products) => {
    if (!userPosition) return products

    return products.sort((a, b) => {
      // Si un filtre de localisation est sélectionné
      if (selectedLocation) {
        const selectedLocationData = SENEGAL_LOCATIONS.find(loc =>
          loc.name.toLowerCase() === selectedLocation.toLowerCase()
        )

        if (selectedLocationData) {
          const aDistance = a.advertiserLat && a.advertiserLng ?
            calculateDistance(selectedLocationData.lat, selectedLocationData.lng, a.advertiserLat, a.advertiserLng) :
            Infinity
          const bDistance = b.advertiserLat && b.advertiserLng ?
            calculateDistance(selectedLocationData.lat, selectedLocationData.lng, b.advertiserLat, b.advertiserLng) :
            Infinity

          // Produits dans un rayon de 5km de la localisation sélectionnée en priorité
          const aIsNear = aDistance <= 5
          const bIsNear = bDistance <= 5

          if (aIsNear && !bIsNear) return -1
          if (!aIsNear && bIsNear) return 1
          if (aIsNear && bIsNear) return aDistance - bDistance
        }
      }

      // Tri par proximité avec la position GPS de l'utilisateur
      const aDistance = a.advertiserLat && a.advertiserLng ?
        calculateDistance(userPosition.lat, userPosition.lng, a.advertiserLat, a.advertiserLng) :
        Infinity
      const bDistance = b.advertiserLat && b.advertiserLng ?
        calculateDistance(userPosition.lat, userPosition.lng, b.advertiserLat, b.advertiserLng) :
        Infinity

      // Priorité pour les produits dans un rayon de 10km
      const aIsVeryClose = aDistance <= 10
      const bIsVeryClose = bDistance <= 10

      if (aIsVeryClose && !bIsVeryClose) return -1
      if (!aIsVeryClose && bIsVeryClose) return 1

      // Si les deux sont proches ou éloignés, trier par distance
      if (aDistance !== bDistance) return aDistance - bDistance

      // Si même distance, trier par popularité
      return (b.popularity || 0) - (a.popularity || 0)
    })
  }

  // Application des filtres
  let filteredProducts = displayProducts.filter(
    p => !priceRange || (p.price >= priceRange[0] && p.price <= priceRange[1])
  )

  // Filtrage par localisation sélectionnée (rayon de 5km)
  if (selectedLocation && userPosition) {
    const selectedLocationData = SENEGAL_LOCATIONS.find(loc =>
      loc.name.toLowerCase() === selectedLocation.toLowerCase()
    )

    if (selectedLocationData) {
      filteredProducts = filteredProducts.filter(p => {
        if (!p.advertiserLat || !p.advertiserLng) return false
        const distance = calculateDistance(
          selectedLocationData.lat,
          selectedLocationData.lng,
          p.advertiserLat,
          p.advertiserLng
        )
        return distance <= 5 // 5km de rayon
      })
    }
  }

  // Tri intelligent par proximité GPS
  filteredProducts = sortProductsByGPSProximity(filteredProducts)

  const productsToShow = filteredProducts.slice(0, visibleCount)

  // Compter les produits par localisation (rayon de 5km)
  const getLocationCount = (locationName: string): number => {
    if (!userPosition) return 0

    const locationData = SENEGAL_LOCATIONS.find(loc =>
      loc.name.toLowerCase() === locationName.toLowerCase()
    )

    if (!locationData) return 0

    return displayProducts.filter(p => {
      if (!p.advertiserLat || !p.advertiserLng) return false
      const distance = calculateDistance(
        locationData.lat,
        locationData.lng,
        p.advertiserLat,
        p.advertiserLng
      )
      return distance <= 5
    }).length
  }

  // Compter les produits près de l'utilisateur (rayon de 10km)
  const getNearbyProductsCount = (): number => {
    if (!userPosition) return 0

    return displayProducts.filter(p => {
      if (!p.advertiserLat || !p.advertiserLng) return false
      const distance = calculateDistance(
        userPosition.lat,
        userPosition.lng,
        p.advertiserLat,
        p.advertiserLng
      )
      return distance <= 10
    }).length
  }

  const nearbyProductsCount = getNearbyProductsCount()

  // Composant pour le filtre de localisation
  const LocationFilter = () => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl max-h-96 overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
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
        className={`w-full flex items-center justify-between p-4 rounded-xl mb-2 transition-all ${!selectedLocation
            ? 'bg-[#F6C445]/10 border-2 border-[#F6C445] text-[#F6C445]'
            : 'bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300'
          }`}
      >
        <div className="flex items-center gap-3">
          <MapPin size={20} />
          <span className="font-medium">Toutes les zones</span>
        </div>
        <span className="text-sm opacity-70">
          {displayProducts.length} produits
        </span>
      </button>

      {/* Zone actuelle de l'utilisateur */}
      {userPosition && userLocationName && (
        <div className="mb-4">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 px-2">
            📍 Votre zone actuelle (GPS)
          </p>
          <button
            onClick={() => {
              setSelectedLocation(userLocationName)
              setLocationFilterOpen(false)
            }}
            className={`w-full flex items-center justify-between p-4 rounded-xl mb-2 transition-all ${selectedLocation === userLocationName
                ? 'bg-[#F6C445]/10 border-2 border-[#F6C445] text-[#F6C445]'
                : 'bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800'
              }`}
          >
            <div className="flex items-center gap-3">
              <Crosshair size={20} />
              <div className="text-left">
                <span className="font-medium block">{userLocationName}</span>
                <span className="text-xs opacity-70">Dans un rayon de 5km</span>
              </div>
              <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 px-2 py-1 rounded-full">
                GPS
              </span>
            </div>
            <span className="text-sm opacity-70">
              {getLocationCount(userLocationName)}
            </span>
          </button>
        </div>
      )}

      {/* Autres zones */}
      <div className="space-y-1">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 px-2">
          🗺️ Autres zones disponibles
        </p>
        {SENEGAL_LOCATIONS
          .filter(loc => loc.name !== userLocationName)
          .map((location) => {
            const count = getLocationCount(location.name)
            if (count === 0) return null

            return (
              <button
                key={location.name}
                onClick={() => {
                  setSelectedLocation(location.name)
                  setLocationFilterOpen(false)
                }}
                className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${selectedLocation === location.name
                    ? 'bg-[#F6C445]/10 border-2 border-[#F6C445] text-[#F6C445]'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
              >
                <div className="flex items-center gap-3">
                  <MapPin size={16} />
                  <div className="text-left">
                    <span className="block">{location.name}</span>
                    <span className="text-xs opacity-70">Rayon 5km</span>
                  </div>
                </div>
                <span className="text-sm opacity-70">
                  {count}
                </span>
              </button>
            )
          })}
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-b pt-5 from-[#F8F9FB] via-white to-[#F8F9FB] dark:from-[#111827] dark:via-[#1C2B49] dark:to-[#111827]">

      {/* Header avec effet parallax */}
      <div
        className="sticky top-0 z-40 bg-white/80 dark:bg-[#1C2B49]/80 backdrop-blur-lg border-b border-gray-200/50 dark:border-gray-700/50"
        style={{ transform: `translateY(${scrollY * 0.1}px)` }}
      >
        <div className="px-4 py-4 max-w-7xl mx-auto">
          {/* Stats bar avec info localisation GPS */}
          <div className="flex items-center justify-center gap-4 mb-3 text-xs text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span>{displayProducts.length} produits disponibles</span>
            </div>
            <div className="w-1 h-1 bg-gray-400 rounded-full" />
            <div className="flex items-center gap-1">
              {locationLoading ? (
                <Loader2 className="w-3 h-3 animate-spin text-[#F6C445]" />
              ) : locationPermissionDenied ? (
                <AlertTriangle className="w-3 h-3 text-orange-500" />
              ) : (
                <Crosshair className="w-3 h-3 text-[#F6C445]" />
              )}
              <span>
                {locationLoading ? 'Localisation GPS...' :
                  locationPermissionDenied ? 'Permission requise' :
                    locationError ? 'GPS indisponible' :
                      `${nearbyProductsCount} près de vous (${userLocationName})`}
              </span>
            </div>
            <div className="w-1 h-1 bg-gray-400 rounded-full" />
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 text-[#F6C445] fill-[#F6C445]" />
              <span>Livraison rapide</span>
            </div>
          </div>

          {/* Alerte permission */}
          {locationPermissionDenied && (
            <div className="mb-3 p-2 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
              <div className="flex items-center gap-2 text-xs text-orange-700 dark:text-orange-300">
                <AlertTriangle size={14} />
                <span>Activez la localisation pour voir les produits près de vous</span>
                <button
                  onClick={detectUserLocation}
                  className="text-[#F6C445] hover:text-[#E2AE32] font-medium ml-auto"
                >
                  Réessayer
                </button>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              {/* Filtre prix */}
              <button
                onClick={() => setFilterOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300 hover:scale-105 active:scale-95 shadow-sm"
              >
                <Filter size={16} />
                <span>{selectedIndex === 0 ? "Prix" : "Filtré"}</span>
                {priceRange && <Zap size={12} className="text-[#F6C445] animate-pulse" />}
              </button>

              {/* Filtre localisation */}
              <button
                onClick={() => setLocationFilterOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300 hover:scale-105 active:scale-95 shadow-sm"
              >
                <MapPin size={16} />
                <span className="max-w-24 truncate">
                  {selectedLocation || (locationLoading ? "..." : "Zone")}
                </span>
                {selectedLocation && <div className="w-2 h-2 bg-[#F6C445] rounded-full animate-pulse" />}
              </button>
            </div>

            <ShareAllSocialButton>
              Partager SangseShop
            </ShareAllSocialButton>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 max-w-7xl mx-auto pt-6">
        {loading ? (
          <div className="space-y-8">
            {/* Skeleton carrousel */}
            <div className="h-32 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-2xl animate-pulse" />
            <ProductCardSkeletonGrid count={6} />
          </div>
        ) : (
          <>
            {/* Carrousel des produits populaires */}
            <PopularProductsCarousel products={displayProducts} />

            {/* Section principale */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {selectedLocation ? `Zone: ${selectedLocation}` :
                      userPosition ? `Près de ${userLocationName}` :
                        "Tous les produits"}
                    {filteredProducts.length > 0 && (
                      <span className="ml-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                        ({filteredProducts.length})
                      </span>
                    )}
                  </h2>
                  {!selectedLocation && userPosition && !locationLoading && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      🎯 Triés par proximité GPS (vendeurs les plus proches en premier)
                    </p>
                  )}
                  {selectedLocation && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      📍 Vendeurs dans un rayon de 5km de {selectedLocation}
                    </p>
                  )}
                </div>

                {(priceRange || selectedLocation) && (
                  <button
                    onClick={() => {
                      setPriceRange(null)
                      setSelectedLocation(null)
                      setSelectedIndex(0)
                    }}
                    className="text-sm text-[#F6C445] hover:text-[#E2AE32] font-medium transition-colors duration-300"
                  >
                    Effacer tous les filtres
                  </button>
                )}
              </div>
            </div>

            {filteredProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="relative mb-6">
                  <ShoppingBag size={48} className="text-gray-400 animate-bounce" />
                  <div className="absolute inset-0 bg-gray-400/20 rounded-full blur-xl animate-pulse" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  {selectedLocation ?
                    `Aucun vendeur trouvé près de ${selectedLocation}` :
                    "Aucun produit trouvé"
                  }
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-6 max-w-md">
                  {selectedLocation ?
                    "Essaie une autre zone ou élargis ta recherche. De nouveaux vendeurs rejoignent chaque jour !" :
                    "Essaie d'autres filtres ou reviens plus tard, on ajoute de nouveaux produits chaque jour !"
                  }
                </p>
                <button
                  onClick={() => {
                    setPriceRange(null)
                    setSelectedLocation(null)
                    setSelectedIndex(0)
                  }}
                  className="px-6 py-3 bg-gradient-to-r from-[#F6C445] to-[#FFD700] text-[#1C2B49] font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
                >
                  Voir tous les produits
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pb-8">
                  {productsToShow.map((p, index) => (
                    <div
                      key={p.id}
                      className="animate-fade-in-up"
                      style={{
                        animationDelay: `${index * 100}ms`,
                        animationFillMode: 'both'
                      }}
                    >
                      <ProductCard product={p} userId={userId} />
                    </div>
                  ))}
                </div>

                {/* Bouton Voir plus avec compteur */}
                {visibleCount < filteredProducts.length && (
                  <div className="flex flex-col items-center pb-12">
                    <div className="text-center mb-4">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {visibleCount} sur {filteredProducts.length} produits affichés
                      </p>
                      <div className="w-64 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mx-auto">
                        <div
                          className="h-2 bg-gradient-to-r from-[#F6C445] to-[#FFD700] rounded-full transition-all duration-500"
                          style={{ width: `${(visibleCount / filteredProducts.length) * 100}%` }}
                        />
                      </div>
                    </div>

                    <button
                      onClick={() => setVisibleCount(visibleCount + 12)}
                      className="group px-8 py-4 bg-gradient-to-r from-[#F6C445] to-[#FFD700] text-[#1C2B49] font-bold rounded-2xl shadow-lg hover:shadow-2xl hover:shadow-[#F6C445]/20 transition-all duration-300 hover:scale-105 active:scale-95 relative overflow-hidden"
                    >
                      <span className="relative z-10 flex items-center gap-2">
                        Découvrir plus de produits
                        <div className="w-5 h-5 border-2 border-[#1C2B49] border-t-transparent rounded-full animate-spin group-hover:animate-none" />
                      </span>
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                    </button>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>

      {/* Filter dialogs */}

      {/* Prix filter dialog */}
      <Dialog open={filterOpen} onOpenChange={setFilterOpen}>
        <DialogContent className="w-[95vw] max-w-md mx-auto rounded-3xl p-0 overflow-hidden border-0 shadow-2xl">
          <PriceFilter
            onChange={(r) => { setPriceRange(r); setFilterOpen(false) }}
            selectedIndex={selectedIndex}
            onSelect={setSelectedIndex}
            onClose={() => setFilterOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Location filter dialog */}
      <Dialog open={locationFilterOpen} onOpenChange={setLocationFilterOpen}>
        <DialogContent className="w-[95vw] max-w-md mx-auto rounded-3xl p-0 overflow-hidden border-0 shadow-2xl">
          <LocationFilter />
        </DialogContent>
      </Dialog>

      {/* Back to top button */}
      <BackToTopButton />

      {/* CSS pour les animations */}
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
          animation: fade-in-up 0.6s ease-out;
        }
        .hover\\:scale-102:hover {
          transform: scale(1.02);
        }
      `}</style>
    </div>
  )
}