"use client"
import { useEffect, useState } from "react"
import {
  Dialog, DialogContent
} from "@/components/ui/dialog"
import { Filter, ShoppingBag, Zap, Star, MapPin, Navigation, Loader2, X } from "lucide-react"
import ProductCard from "./product-card"
import BackToTopButton from "./BackToTopButton"
import {
  ProductCardSkeletonGrid
} from './skeletonComponents'
import PopularProductsCarousel from "./popularProductsCaroussel"
import PriceFilter from "./pricefilter"
import ShareAllSocialButton from "./shareAllSocialButton"

// Localités communes au Sénégal
const SENEGAL_LOCATIONS = [
  "Dakar", "Pikine", "Guédiawaye", "Rufisque", "Thiès", "Kaolack",
  "Saint-Louis", "Mbour", "Diourbel", "Ziguinchor", "Louga", "Tambacounda",
  "Kolda", "Fatick", "Kaffrine", "Kédougou", "Matam", "Sédhiou",
  "Grand Dakar", "Parcelles Assainies", "Almadies", "Ngor", "Yoff",
  "Ouakam", "Point E", "Mermoz", "Sacré-Coeur", "Plateau", "Médina",
  "Liberté", "HLM", "Colobane", "Sicap", "Fann", "Gibraltar"
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

  // États pour la géolocalisation
  const [userLocation, setUserLocation] = useState<string>("")
  const [locationLoading, setLocationLoading] = useState(true)
  const [locationError, setLocationError] = useState<string | null>(null)
  const [detectedCity, setDetectedCity] = useState<string>("")
  const [detectedCountry, setDetectedCountry] = useState<string>("")

  // Fonction pour détecter la localisation via IP
  const detectUserLocation = async () => {
    setLocationLoading(true)
    setLocationError(null)

    try {
      // Utilisation d'une API gratuite de géolocalisation IP
      const response = await fetch('https://ipapi.co/json/')

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération de la localisation')
      }

      const data = await response.json()

      console.log('Données de localisation:', data) // Pour debug

      if (data.error) {
        throw new Error(data.reason || 'Erreur de géolocalisation')
      }

      const city = data.city || ""
      const country = data.country_name || ""
      const region = data.region || ""

      setDetectedCity(city)
      setDetectedCountry(country)

      // Pour le Sénégal, on utilise la ville, sinon on utilise le pays
      if (country.toLowerCase().includes('senegal') || country.toLowerCase().includes('sénégal')) {
        setUserLocation(city || region || 'Dakar')
      } else {
        setUserLocation(city || country || 'International')
      }

    } catch (error) {
      console.error('Erreur de géolocalisation:', error)
      setLocationError(error.message)
      setUserLocation('Dakar') // Localisation par défaut
    } finally {
      setLocationLoading(false)
    }
  }

  // Détecter la localisation au chargement
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

  // Fonction pour calculer la priorité par localisation
  const sortProductsByLocation = (products) => {
    return products.sort((a, b) => {
      // Si un filtre de localisation est sélectionné, on filtre d'abord
      if (selectedLocation) {
        const aMatchesFilter = a.advertiserLocation?.toLowerCase().includes(selectedLocation.toLowerCase())
        const bMatchesFilter = b.advertiserLocation?.toLowerCase().includes(selectedLocation.toLowerCase())

        if (aMatchesFilter && !bMatchesFilter) return -1
        if (!aMatchesFilter && bMatchesFilter) return 1
        if (!aMatchesFilter && !bMatchesFilter) return 0
      }

      // Priorité par localisation de l'utilisateur (détectée automatiquement)
      if (userLocation) {
        const aMatchesUserLocation = a.advertiserLocation?.toLowerCase().includes(userLocation.toLowerCase())
        const bMatchesUserLocation = b.advertiserLocation?.toLowerCase().includes(userLocation.toLowerCase())

        if (aMatchesUserLocation && !bMatchesUserLocation) return -1
        if (!aMatchesUserLocation && bMatchesUserLocation) return 1
      }

      // Si même priorité de localisation, trier par popularité ou date
      return (b.popularity || 0) - (a.popularity || 0)
    })
  }

  // Application des filtres
  let filteredProducts = displayProducts.filter(
    p => !priceRange || (p.price >= priceRange[0] && p.price <= priceRange[1])
  )

  // Filtrage par localisation sélectionnée
  if (selectedLocation) {
    filteredProducts = filteredProducts.filter(p =>
      p.advertiserLocation?.toLowerCase().includes(selectedLocation.toLowerCase())
    )
  }

  // Tri intelligent par localisation
  filteredProducts = sortProductsByLocation(filteredProducts)

  const productsToShow = filteredProducts.slice(0, visibleCount)

  // Compter les produits par localisation
  const getLocationCount = (location) => {
    if (!location) return 0
    return displayProducts.filter(p =>
      p.advertiserLocation?.toLowerCase().includes(location.toLowerCase())
    ).length
  }

  // Compter les produits de la localisation de l'utilisateur
  const userLocationCount = getLocationCount(userLocation)

  // Composant pour le filtre de localisation
  const LocationFilter = () => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl max-h-96 overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
          Choisir une localisation
        </h3>
        <button
          onClick={() => setLocationFilterOpen(false)}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
        >
          <X size={20} className="text-gray-500" />
        </button>
      </div>

      {/* Option "Toutes les localisations" */}
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
          <span className="font-medium">Toutes les localisations</span>
        </div>
        <span className="text-sm opacity-70">
          {displayProducts.length} produits
        </span>
      </button>

      {/* Localisation détectée (prioritaire) */}
      {userLocation && (
        <div className="mb-4">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 px-2">
            📍 Votre localisation détectée
          </p>
          <button
            onClick={() => {
              setSelectedLocation(userLocation)
              setLocationFilterOpen(false)
            }}
            className={`w-full flex items-center justify-between p-4 rounded-xl mb-2 transition-all ${selectedLocation === userLocation
                ? 'bg-[#F6C445]/10 border-2 border-[#F6C445] text-[#F6C445]'
                : 'bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800'
              }`}
          >
            <div className="flex items-center gap-3">
              <Navigation size={20} />
              <span className="font-medium">{userLocation}</span>
              {detectedCountry && (
                <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 px-2 py-1 rounded-full">
                  Auto
                </span>
              )}
            </div>
            <span className="text-sm opacity-70">
              {userLocationCount} produits
            </span>
          </button>
        </div>
      )}

      {/* Autres localisations */}
      <div className="space-y-1">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 px-2">
          🗺️ Autres localisations
        </p>
        {SENEGAL_LOCATIONS
          .filter(loc => loc !== userLocation)
          .map((location) => {
            const count = getLocationCount(location)
            if (count === 0) return null

            return (
              <button
                key={location}
                onClick={() => {
                  setSelectedLocation(location)
                  setLocationFilterOpen(false)
                }}
                className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${selectedLocation === location
                    ? 'bg-[#F6C445]/10 border-2 border-[#F6C445] text-[#F6C445]'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
              >
                <div className="flex items-center gap-3">
                  <MapPin size={16} />
                  <span>{location}</span>
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
          {/* Stats bar avec info localisation */}
          <div className="flex items-center justify-center gap-4 mb-3 text-xs text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span>{displayProducts.length} produits disponibles</span>
            </div>
            <div className="w-1 h-1 bg-gray-400 rounded-full" />
            <div className="flex items-center gap-1">
              {locationLoading ? (
                <Loader2 className="w-3 h-3 animate-spin text-[#F6C445]" />
              ) : (
                <Navigation className="w-3 h-3 text-[#F6C445]" />
              )}
              <span>
                {locationLoading ? 'Localisation...' :
                  locationError ? 'Localisation indisponible' :
                    `${userLocationCount} près de vous (${userLocation})`}
              </span>
            </div>
            <div className="w-1 h-1 bg-gray-400 rounded-full" />
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 text-[#F6C445] fill-[#F6C445]" />
              <span>Livraison rapide</span>
            </div>
          </div>

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
                    {selectedLocation ? `Produits à ${selectedLocation}` :
                      userLocation ? `Recommandés près de ${userLocation}` :
                        "Tous les produits"}
                    {filteredProducts.length > 0 && (
                      <span className="ml-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                        ({filteredProducts.length})
                      </span>
                    )}
                  </h2>
                  {!selectedLocation && userLocation && !locationLoading && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      🎯 Produits proches de votre localisation en premier
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
                    `Aucun produit trouvé à ${selectedLocation} 📍` :
                    "Aucun produit trouvé 😔"
                  }
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-6 max-w-md">
                  {selectedLocation ?
                    "Essaie une autre zone ou reviens plus tard, on ajoute de nouveaux vendeurs chaque jour ! 🌟" :
                    "Essaie un autre budget ou reviens plus tard, on ajoute de nouveaux produits chaque jour ! ✨"
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
                  Voir tous les produits 🛍️
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