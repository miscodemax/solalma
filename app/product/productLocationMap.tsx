// app/composants/ProductLocationMap.tsx

'use client'

import { useEffect, useRef, useState } from 'react'
import { FaMapMarkerAlt, FaExpand, FaCompress, FaTimes, FaDirections, FaShare } from 'react-icons/fa'

interface ProductLocationMapProps {
    productTitle?: string
    latitude?: number
    longitude?: number
    address?: string
}

// Interface pour les coordonnées
interface Coordinates {
    lat: number
    lng: number
}

const ProductLocationMap: React.FC<ProductLocationMapProps> = ({
    productTitle = "Produit",
    latitude,
    longitude,
    address
}) => {
    const mapRef = useRef<HTMLDivElement>(null)
    const mapInstanceRef = useRef<any>(null)
    const markerRef = useRef<any>(null)
    const [isMapLoaded, setIsMapLoaded] = useState(false)
    const [isFullscreen, setIsFullscreen] = useState(false)
    const [userLocation, setUserLocation] = useState<Coordinates | null>(null)
    const [productLocation, setProductLocation] = useState<Coordinates | null>(null)
    const [distance, setDistance] = useState<number | null>(null)
    const [isLocating, setIsLocating] = useState(false)
    const [locationError, setLocationError] = useState<string | null>(null)

    // Fonction pour calculer la distance entre deux points (formule de Haversine)
    const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
        const R = 6371 // Rayon de la Terre en km
        const dLat = (lat2 - lat1) * Math.PI / 180
        const dLon = (lon2 - lon1) * Math.PI / 180
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2)
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
        return R * c
    }

    // Obtenir la localisation de l'utilisateur
    const getUserLocation = () => {
        if (!navigator.geolocation) {
            setLocationError("La géolocalisation n'est pas supportée par ce navigateur")
            return
        }

        setIsLocating(true)
        setLocationError(null)

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const userCoords = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                }
                setUserLocation(userCoords)

                // Calculer la distance si on a la localisation du produit
                if (productLocation) {
                    const dist = calculateDistance(
                        userCoords.lat,
                        userCoords.lng,
                        productLocation.lat,
                        productLocation.lng
                    )
                    setDistance(dist)
                }

                setIsLocating(false)
            },
            (error) => {
                let errorMessage = "Impossible d'obtenir votre localisation"
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        errorMessage = "Autorisation de géolocalisation refusée"
                        break
                    case error.POSITION_UNAVAILABLE:
                        errorMessage = "Localisation indisponible"
                        break
                    case error.TIMEOUT:
                        errorMessage = "Délai d'attente dépassé"
                        break
                }
                setLocationError(errorMessage)
                setIsLocating(false)
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 300000 // 5 minutes
            }
        )
    }

    // Charger Leaflet dynamiquement
    useEffect(() => {
        const loadLeaflet = async () => {
            if (typeof window === 'undefined') return

            // Charger les CSS et JS de Leaflet
            const link = document.createElement('link')
            link.rel = 'stylesheet'
            link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
            document.head.appendChild(link)

            const script = document.createElement('script')
            script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
            script.onload = () => {
                setIsMapLoaded(true)
            }
            document.head.appendChild(script)
        }

        loadLeaflet()
    }, [])

    // Initialiser la carte une fois Leaflet chargé
    useEffect(() => {
        if (!isMapLoaded || !mapRef.current || mapInstanceRef.current) return

        const L = (window as any).L
        if (!L) return

        // Coordonnées par défaut (Dakar, Sénégal)
        const defaultLat = latitude || 14.7167
        const defaultLng = longitude || -17.4677

        setProductLocation({ lat: defaultLat, lng: defaultLng })

        // Initialiser la carte
        const map = L.map(mapRef.current, {
            center: [defaultLat, defaultLng],
            zoom: 15,
            zoomControl: false,
            attributionControl: false
        })

        // Ajouter les tuiles OpenStreetMap
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 19
        }).addTo(map)

        // Créer une icône personnalisée
        const customIcon = L.divIcon({
            html: `
        <div class="custom-marker">
          <div class="marker-pin"></div>
          <div class="marker-pulse"></div>
        </div>
      `,
            iconSize: [30, 30],
            iconAnchor: [15, 30],
            className: 'custom-div-icon'
        })

        // Ajouter le marqueur
        const marker = L.marker([defaultLat, defaultLng], { icon: customIcon }).addTo(map)

        // Popup personnalisé
        const popupContent = `
      <div class="custom-popup">
        <h3 class="popup-title">${productTitle}</h3>
        ${address ? `<p class="popup-address">📍 ${address}</p>` : ''}
        <div class="popup-actions">
          <button onclick="window.openDirections(${defaultLat}, ${defaultLng})" class="popup-btn directions-btn">
            🧭 Itinéraire
          </button>
          <button onclick="window.shareLocation(${defaultLat}, ${defaultLng})" class="popup-btn share-btn">
            📤 Partager
          </button>
        </div>
      </div>
    `

        marker.bindPopup(popupContent, {
            maxWidth: 250,
            className: 'custom-leaflet-popup'
        })

        // Contrôles de zoom personnalisés
        const zoomControl = L.control.zoom({
            position: 'topright'
        }).addTo(map)

        mapInstanceRef.current = map
        markerRef.current = marker

            // Fonctions globales pour les boutons de popup
            ; (window as any).openDirections = (lat: number, lng: number) => {
                const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`
                window.open(url, '_blank')
            }

            ; (window as any).shareLocation = (lat: number, lng: number) => {
                const shareUrl = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}&zoom=15`
                if (navigator.share) {
                    navigator.share({
                        title: productTitle,
                        text: `Localisation de ${productTitle}`,
                        url: shareUrl
                    })
                } else {
                    navigator.clipboard.writeText(shareUrl)
                    // Vous pourriez ajouter une notification toast ici
                }
            }

        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove()
                mapInstanceRef.current = null
            }
        }
    }, [isMapLoaded, latitude, longitude, productTitle, address])

    // Ajouter le marqueur utilisateur quand la position est obtenue
    useEffect(() => {
        if (!userLocation || !mapInstanceRef.current) return

        const L = (window as any).L
        const map = mapInstanceRef.current

        // Icône pour l'utilisateur
        const userIcon = L.divIcon({
            html: `
        <div class="user-marker">
          <div class="user-pin"></div>
          <div class="user-pulse"></div>
        </div>
      `,
            iconSize: [20, 20],
            iconAnchor: [10, 20],
            className: 'user-div-icon'
        })

        // Ajouter le marqueur utilisateur
        const userMarker = L.marker([userLocation.lat, userLocation.lng], { icon: userIcon }).addTo(map)
        userMarker.bindPopup(`
      <div class="custom-popup">
        <h3 class="popup-title">Votre position</h3>
        <p class="popup-distance">📏 Distance: ${distance ? `${distance.toFixed(1)} km` : 'Calcul...'}</p>
      </div>
    `)

        // Ajuster la vue pour inclure les deux marqueurs
        if (productLocation) {
            const group = L.featureGroup([markerRef.current, userMarker])
            map.fitBounds(group.getBounds().pad(0.1))
        }
    }, [userLocation, distance, productLocation])

    const toggleFullscreen = () => {
        setIsFullscreen(!isFullscreen)
    }

    const formatDistance = (dist: number): string => {
        if (dist < 1) {
            return `${Math.round(dist * 1000)} m`
        }
        return `${dist.toFixed(1)} km`
    }

    if (!isMapLoaded) {
        return (
            <div className="bg-white dark:bg-[#1C2B49]/70 p-8 rounded-3xl border border-[#E5E7EB] shadow-xl">
                <div className="flex items-center justify-center h-64">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-12 h-12 border-4 border-[#F6C445] border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-[#1C2B49] dark:text-white font-medium">Chargement de la carte...</p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <>
            <div className="bg-white dark:bg-[#1C2B49]/70 p-8 rounded-3xl border border-[#E5E7EB] shadow-xl">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="font-black text-xl text-[#1C2B49] dark:text-[#F6C445] flex items-center gap-2">
                        <FaMapMarkerAlt className="text-[#F6C445]" />
                        Localisation
                    </h3>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={getUserLocation}
                            disabled={isLocating}
                            className="bg-[#F6C445] hover:bg-[#F6C445]/80 text-[#1C2B49] px-4 py-2 rounded-xl font-medium transition disabled:opacity-50 flex items-center gap-2"
                        >
                            {isLocating ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-[#1C2B49] border-t-transparent rounded-full animate-spin"></div>
                                    Localisation...
                                </>
                            ) : (
                                <>
                                    🎯 Ma position
                                </>
                            )}
                        </button>
                        <button
                            onClick={toggleFullscreen}
                            className="bg-[#1C2B49] hover:bg-[#2a3b60] text-white p-3 rounded-xl transition"
                        >
                            <FaExpand />
                        </button>
                    </div>
                </div>

                {locationError && (
                    <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-xl mb-4">
                        ⚠️ {locationError}
                    </div>
                )}

                {distance && (
                    <div className="bg-[#F6C445]/20 border border-[#F6C445]/30 text-[#1C2B49] dark:text-[#F6C445] px-4 py-3 rounded-xl mb-4 flex items-center gap-2">
                        📏 <strong>Distance:</strong> {formatDistance(distance)}
                    </div>
                )}

                <div
                    ref={mapRef}
                    className="w-full h-64 rounded-2xl overflow-hidden shadow-lg border-2 border-[#F6C445]/20"
                />

                {address && (
                    <div className="mt-4 p-4 bg-[#F6C445]/10 rounded-xl">
                        <p className="text-sm text-[#1C2B49] dark:text-gray-200">
                            📍 <strong>Adresse:</strong> {address}
                        </p>
                    </div>
                )}
            </div>

            {/* Modal plein écran */}
            {isFullscreen && (
                <div className="fixed inset-0 bg-black/90 z-50 flex flex-col">
                    <div className="flex items-center justify-between p-4 bg-white dark:bg-[#1C2B49]">
                        <h2 className="text-xl font-bold text-[#1C2B49] dark:text-white">
                            Localisation - {productTitle}
                        </h2>
                        <button
                            onClick={toggleFullscreen}
                            className="bg-red-500 hover:bg-red-600 text-white p-3 rounded-xl transition"
                        >
                            <FaTimes />
                        </button>
                    </div>
                    <div className="flex-1">
                        <div
                            ref={mapRef}
                            className="w-full h-full"
                        />
                    </div>
                </div>
            )}

            {/* Styles CSS injectés */}
            <style jsx global>{`
        .custom-marker {
          position: relative;
        }
        
        .marker-pin {
          width: 30px;
          height: 30px;
          background: #F6C445;
          border: 3px solid #1C2B49;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          position: relative;
        }
        
        .marker-pin::after {
          content: '';
          width: 12px;
          height: 12px;
          background: #1C2B49;
          border-radius: 50%;
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) rotate(45deg);
        }
        
        .marker-pulse {
          position: absolute;
          top: -5px;
          left: -5px;
          width: 40px;
          height: 40px;
          border: 2px solid #F6C445;
          border-radius: 50%;
          animation: pulse 2s infinite;
          opacity: 0.6;
        }
        
        .user-marker {
          position: relative;
        }
        
        .user-pin {
          width: 20px;
          height: 20px;
          background: #22c55e;
          border: 2px solid white;
          border-radius: 50%;
          position: relative;
        }
        
        .user-pulse {
          position: absolute;
          top: -5px;
          left: -5px;
          width: 30px;
          height: 30px;
          border: 2px solid #22c55e;
          border-radius: 50%;
          animation: pulse 2s infinite;
          opacity: 0.4;
        }
        
        @keyframes pulse {
          0% {
            transform: scale(1);
            opacity: 0.6;
          }
          50% {
            transform: scale(1.2);
            opacity: 0.3;
          }
          100% {
            transform: scale(1.4);
            opacity: 0;
          }
        }
        
        .custom-leaflet-popup .leaflet-popup-content-wrapper {
          background: white;
          border-radius: 12px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.2);
          border: 2px solid #F6C445;
        }
        
        .custom-popup {
          padding: 8px;
        }
        
        .popup-title {
          font-size: 16px;
          font-weight: bold;
          color: #1C2B49;
          margin: 0 0 8px 0;
        }
        
        .popup-address {
          font-size: 14px;
          color: #666;
          margin: 0 0 12px 0;
        }
        
        .popup-distance {
          font-size: 14px;
          color: #F6C445;
          font-weight: bold;
          margin: 0;
        }
        
        .popup-actions {
          display: flex;
          gap: 8px;
        }
        
        .popup-btn {
          padding: 6px 12px;
          border: none;
          border-radius: 8px;
          font-size: 12px;
          font-weight: bold;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .directions-btn {
          background: #1C2B49;
          color: white;
        }
        
        .directions-btn:hover {
          background: #2a3b60;
        }
        
        .share-btn {
          background: #F6C445;
          color: #1C2B49;
        }
        
        .share-btn:hover {
          background: #f5c13b;
        }
      `}</style>
        </>
    )
}

export default ProductLocationMap