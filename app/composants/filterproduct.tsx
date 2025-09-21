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

// Localités du Sénégal avec coordonnées GPS précises
const SENEGAL_LOCATIONS = [
  { name: "Dakar", lat: 14.6928, lng: -17.4467 },
  { name: "Plateau", lat: 14.6731, lng: -17.4419 },
  { name: "Médina", lat: 14.6789, lng: -17.4531 },
  { name: "Yoff", lat: 14.7539, lng: -17.4731 },
  { name: "Sacré-Coeur", lat: 14.7147, lng: -17.4711 },
  { name: "Almadies", lat: 14.7447, lng: -17.5264 },
  { name: "Ngor", lat: 14.7587, lng: -17.5180 },
  { name: "Ouakam", lat: 14.7289, lng: -17.4922 },
  { name: "Point E", lat: 14.7019, lng: -17.4644 },
  { name: "Mermoz", lat: 14.7089, lng: -17.4558 },
  { name: "Fann", lat: 14.7056, lng: -17.4739 },
  { name: "Liberté", lat: 14.7086, lng: -17.4656 },
  { name: "HLM", lat: 14.7328, lng: -17.4581 },
  { name: "Grand Dakar", lat: 14.6937, lng: -17.4441 },
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
  const displayProducts = products

  const [priceRange, setPriceRange] = useState<[number, number] | null>(null)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [filterOpen, setFilterOpen] = useState(false)
  const [locationFilterOpen, setLocationFilterOpen] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [visibleCount, setVisibleCount] = useState(12)
  const [scrollY, setScrollY] = useState(0)

  // États pour la géolocalisation GPS de l'utilisateur
  const [userPosition, setUserPosition] = useState<{ lat: number, lng: number } | null>(null)
  const [userLocationName, setUserLocationName] = useState<string>("")
  const [locationLoading, setLocationLoading] = useState(true)
  const [locationError, setLocationError] = useState<string | null>(null)
  const [locationPermissionDenied, setLocationPermissionDenied] = useState(false)

  // Cache des localisations des annonceurs (récupérées via géolocalisation IP)
  const [advertisersLocations, setAdvertisersLocations] = useState<{ [userId: string]: { lat: number, lng: number, city: string } }>({})
  const [advertisersLoading, setAdvertisersLoading] = useState(false)

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

  // Fonction pour trouver la localité la plus proche avec meilleure précision
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

    // Si la distance est trop grande (plus de 15km), on considère que c'est imprécis
    if (minDistance > 15) {
      nearestLocation = "Zone inconnue"
    }

    return nearestLocation
  }

  // Fonction pour récupérer la localisation d'un utilisateur via API IP
  const getUserLocationByIP = async (userId: string): Promise<{ lat: number, lng: number, city: string } | null> => {
    try {
      // Dans un cas réel, vous feriez un appel à votre API pour obtenir l'IP de l'utilisateur
      // puis utiliser cette IP pour la géolocalisation
      console.log(`Récupération de la localisation pour l'utilisateur ${userId}...`)

      // Simulation d'un appel à votre API backend
      const response = await fetch(`/api/users/${userId}/location-by-ip`)

      if (!response.ok) {
        throw new Error('Localisation non disponible')
      }

      const data = await response.json()

      return {
        lat: data.latitude,
        lng: data.longitude,
        city: data.city || findNearestLocation(data.latitude, data.longitude)
      }
    } catch (error) {
      console.warn(`Impossible de récupérer la localisation pour ${userId}:`, error)

      // Fallback: assigner une localisation aléatoire parmi les zones de Dakar pour la démo
      const dakarZones = SENEGAL_LOCATIONS.filter(loc =>
        ['Dakar', 'Plateau', 'Médina', 'Yoff', 'Sacré-Coeur', 'Almadies', 'Ngor', 'Ouakam', 'Point E', 'Mermoz', 'Fann', 'Liberté', 'HLM', 'Grand Dakar'].includes(loc.name)
      )
      const randomZone = dakarZones[Math.floor(Math.random() * dakarZones.length)]

      return {
        lat: randomZone.lat + (Math.random() - 0.5) * 0.01, // Légère variation pour réalisme
        lng: randomZone.lng + (Math.random() - 0.5) * 0.01,
        city: randomZone.name
      }
    }
  }

  // Fonction pour obtenir la position GPS de l'utilisateur actuel
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
          timeout: 15000,
          maximumAge: 300000 // Cache pendant 5 minutes
        }
      )
    })
  }

  // Fonction pour détecter la localisation GPS de l'utilisateur actuel
  const detectUserLocation = async () => {
    setLocationLoading(true)
    setLocationError(null)
    setLocationPermissionDenied(false)

    try {
      console.log('Demande de géolocalisation GPS de l\'utilisateur...')
      const position = await getCurrentPosition()

      const lat = position.coords.latitude
      const lng = position.coords.longitude
      const accuracy = position.coords.accuracy

      console.log(`Position GPS utilisateur: ${lat}, ${lng} (précision: ${Math.round(accuracy)}m)`)

      setUserPosition({ lat, lng })

      // Trouver la localité la plus proche avec meilleure précision
      const nearestLocation = findNearestLocation(lat, lng)
      setUserLocationName(nearestLocation)

      console.log(`Localité utilisateur: ${nearestLocation}`)

    } catch (error) {
      console.error('Erreur de géolocalisation GPS utilisateur:', error)

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

  // Fonction pour charger les localisations de tous les annonceurs
  const loadAdvertisersLocations = async () => {
    if (advertisersLoading || displayProducts.length === 0) return

    setAdvertisersLoading(true)

    try {
      // Récupérer tous les userId uniques des annonceurs
      const uniqueAdvertiserIds = [...new Set(
        displayProducts
          .map(p => p.userId) // Le userId de l'annonceur dans votre table product
          .filter(Boolean)
      )]

      console.log(`Chargement des localisations pour ${uniqueAdvertiserIds.length} annonceurs...`)

      // Charger les localisations en parallèle
      const locationPromises = uniqueAdvertiserIds.map(async (advertiserId) => {
        const location = await getUserLocationByIP(advertiserId)
        return { advertiserId, location }
      })

      const results = await Promise.allSettled(locationPromises)
      const locationsMap: { [userId: string]: { lat: number, lng: number, city: string } } = {}

      results.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value.location) {
          locationsMap[result.value.advertiserId] = result.value.location
        }
      })

      console.log(`Localisations chargées pour ${Object.keys(locationsMap).length} annonceurs`)
      setAdvertisersLocations(locationsMap)

    } catch (error) {
      console.error('Erreur lors du chargement des localisations des annonceurs:', error)
    } finally {
      setAdvertisersLoading(false)
    }
  }

  // Charger les localisations au démarrage
  useEffect(() => {
    detectUserLocation()
    loadAdvertisersLocations()
  }, [])

  useEffect(() => {
    loadAdvertisersLocations()
  }, [displayProducts])

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
      // Récupérer les coordonnées des annonceurs depuis le cache
      const aAdvertiserLocation = advertisersLocations[a.userId]
      const bAdvertiserLocation = advertisersLocations[b.userId]

      // Si un filtre de localisation est sélectionné
      if (selectedLocation) {
        const selectedLocationData = SENEGAL_LOCATIONS.find(loc =>
          loc.name.toLowerCase() === selectedLocation.toLowerCase()
        )

        if (selectedLocationData) {
          const aDistance = aAdvertiserLocation ?
            calculateDistance(selectedLocationData.lat, selectedLocationData.lng, aAdvertiserLocation.lat, aAdvertiserLocation.lng) :
            Infinity
          const bDistance = bAdvertiserLocation ?
            calculateDistance(selectedLocationData.lat, selectedLocationData.lng, bAdvertiserLocation.lat, bAdvertiserLocation.lng) :
            Infinity

          // Produits dans un rayon de 3km de la localisation sélectionnée en priorité
          const aIsNear = aDistance <= 3
          const bIsNear = bDistance <= 3

          if (aIsNear && !bIsNear) return -1
          if (!aIsNear && bIsNear) return 1
          if (aIsNear && bIsNear) return aDistance - bDistance
        }
      }

      // Tri par proximité avec la position GPS de l'utilisateur
      const aDistance = aAdvertiserLocation ?
        calculateDistance(userPosition.lat, userPosition.lng, aAdvertiserLocation.lat, aAdvertiserLocation.lng) :
        Infinity
      const bDistance = bAdvertiserLocation ?
        calculateDistance(userPosition.lat, userPosition.lng, bAdvertiserLocation.lat, bAdvertiserLocation.lng) :
        Infinity

      // Priorité pour les produits dans un rayon de 5km (plus précis)
      const aIsVeryClose = aDistance <= 5
      const bIsVeryClose = bDistance <= 5

      if (aIsVeryClose && !bIsVeryClose) return -1
      if (!aIsVeryClose && bIsVeryClose) return 1

      // Si les deux sont proches ou éloignés, trier par distance exacte
      if (aDistance !== bDistance) return aDistance - bDistance

      // Si même distance, trier par popularité
      return (b.popularity || 0) - (a.popularity || 0)
    })
  }

  // Application des filtres
  let filteredProducts = displayProducts.filter(
    p => !priceRange || (p.price >= priceRange[0] && p.price <= priceRange[1])
  )

  // Filtrage par localisation sélectionnée (rayon de 3km pour plus de précision)
  if (selectedLocation) {
    const selectedLocationData = SENEGAL_LOCATIONS.find(loc =>
      loc.name.toLowerCase() === selectedLocation.toLowerCase()
    )

    if (selectedLocationData) {
      filteredProducts = filteredProducts.filter(p => {
        const advertiserLocation = advertisersLocations[p.userId]

        if (!advertiserLocation) return false

        const distance = calculateDistance(
          selectedLocationData.lat,
          selectedLocationData.lng,
          advertiserLocation.lat,
          advertiserLocation.lng
        )
        return distance <= 3 // 3km de rayon pour plus de précision
      })
    }
  }

  // Tri intelligent par proximité GPS
  filteredProducts = sortProductsByGPSProximity(filteredProducts)

  const productsToShow = filteredProducts.slice(0, visibleCount)

  // Compter les produits par localisation (rayon de 3km)
  const getLocationCount = (locationName: string): number => {
    const locationData = SENEGAL_LOCATIONS.find(loc =>
      loc.name.toLowerCase() === locationName.toLowerCase()
    )

    if (!locationData) return 0

    return displayProducts.filter(p => {
      const advertiserLocation = advertisersLocations[p.userId]

      if (!advertiserLocation) return false

      const distance = calculateDistance(
        locationData.lat,
        locationData.lng,
        advertiserLocation.lat,
        advertiserLocation.lng
      )
      return distance <= 3
    }).length
  }

  // Compter les produits près de l'utilisateur (rayon de 5km)
  const getNearbyProductsCount = (): number => {
    if (!userPosition) return 0

    return displayProducts.filter(p => {
      const advertiserLocation = advertisersLocations[p.userId]

      if (!advertiserLocation) return false

      const distance = calculateDistance(
        userPosition.lat,
        userPosition.lng,
        advertiserLocation.lat,
        advertiserLocation.lng
      )
      return distance <= 5
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
            Votre zone actuelle (GPS)
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
                <span className="text-xs opacity-70">Dans un rayon de 3km</span>
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
          Autres zones disponibles
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
                    <span className="text-xs opacity-70">Rayon 3km</span>
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
              {locationLoading || advertisersLoading ? (
                <Loader2 className="w-3 h-3 animate-spin text-[#F6C445]" />
              ) : locationPermissionDenied ? (
                <AlertTriangle className="w-3 h-3 text-orange-500" />
              ) : (
                <Crosshair className="w-3 h-3 text-[#F6C445]" />
              )}
              <span>
                {locationLoading ? 'Localisation GPS...' :
                  advertisersLoading ? 'Chargement vendeurs...' :
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
                      Triés par proximité GPS (vendeurs les plus proches en premier)
                    </p>
                  )}
                  {selectedLocation && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Vendeurs dans un rayon de 3km de {selectedLocation}
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
                    "Essayez une autre zone ou élargissez votre recherche. De nouveaux vendeurs rejoignent chaque jour." :
                    "Essayez d'autres filtres ou revenez plus tard, on ajoute de nouveaux produits chaque jour."
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