'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    FaMapMarkerAlt,
    FaExpand,
    FaCompress,
    FaTimes,
    FaDirections,
    FaShare,
    FaMapMarkedAlt,
    FaRoute,
    FaClock,
    FaCar,
    FaWalking,
    FaBicycle,
    FaLocationArrow,
    FaInfoCircle
} from 'react-icons/fa'

interface ProductLocationMapProps {
    productTitle?: string
    latitude?: number
    longitude?: number
    address?: string
}

interface Coordinates {
    lat: number
    lng: number
}

interface RouteInfo {
    distance: number
    duration: number
    geometry: any
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
    const userMarkerRef = useRef<any>(null)
    const routeLayerRef = useRef<any>(null)

    const [isMapLoaded, setIsMapLoaded] = useState(false)
    const [isFullscreen, setIsFullscreen] = useState(false)
    const [userLocation, setUserLocation] = useState<Coordinates | null>(null)
    const [productLocation, setProductLocation] = useState<Coordinates | null>(null)
    const [distance, setDistance] = useState<number | null>(null)
    const [isLocating, setIsLocating] = useState(false)
    const [locationError, setLocationError] = useState<string | null>(null)
    const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null)
    const [isLoadingRoute, setIsLoadingRoute] = useState(false)
    const [travelMode, setTravelMode] = useState<'driving' | 'walking' | 'cycling'>('driving')
    const [showRoutePanel, setShowRoutePanel] = useState(false)

    // Fonction pour calculer la distance (Haversine)
    const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
        const R = 6371
        const dLat = (lat2 - lat1) * Math.PI / 180
        const dLon = (lon2 - lon1) * Math.PI / 180
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2)
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
        return R * c
    }

    // Obtenir l'itinéraire avec OSRM
    const getRoute = async (mode: 'driving' | 'walking' | 'cycling' = 'driving') => {
        if (!userLocation || !productLocation) return

        setIsLoadingRoute(true)
        setTravelMode(mode)

        try {
            const profile = mode === 'driving' ? 'car' : mode === 'walking' ? 'foot' : 'bike'
            const url = `https://router.project-osrm.org/route/v1/${profile}/${userLocation.lng},${userLocation.lat};${productLocation.lng},${productLocation.lat}?overview=full&geometries=geojson`

            const response = await fetch(url)
            const data = await response.json()

            if (data.code === 'Ok' && data.routes.length > 0) {
                const route = data.routes[0]
                setRouteInfo({
                    distance: route.distance / 1000, // en km
                    duration: route.duration / 60, // en minutes
                    geometry: route.geometry
                })

                // Dessiner l'itinéraire sur la carte
                if (mapInstanceRef.current && routeLayerRef.current) {
                    mapInstanceRef.current.removeLayer(routeLayerRef.current)
                }

                if (mapInstanceRef.current) {
                    const L = (window as any).L
                    const routeLayer = L.geoJSON(route.geometry, {
                        style: {
                            color: '#F6C445',
                            weight: 6,
                            opacity: 0.8,
                            lineJoin: 'round',
                            lineCap: 'round'
                        }
                    }).addTo(mapInstanceRef.current)

                    routeLayerRef.current = routeLayer

                    // Ajuster la vue pour montrer tout l'itinéraire
                    const bounds = routeLayer.getBounds()
                    mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50] })
                }

                setShowRoutePanel(true)
            }
        } catch (error) {
            console.error('Erreur lors de la récupération de l\'itinéraire:', error)
        } finally {
            setIsLoadingRoute(false)
        }
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
                maximumAge: 300000
            }
        )
    }

    // Charger Leaflet
    useEffect(() => {
        const loadLeaflet = async () => {
            if (typeof window === 'undefined') return

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

    // Initialiser la carte
    useEffect(() => {
        if (!isMapLoaded || !mapRef.current || mapInstanceRef.current) return

        const L = (window as any).L
        if (!L) return

        const defaultLat = latitude || 14.7167
        const defaultLng = longitude || -17.4677

        setProductLocation({ lat: defaultLat, lng: defaultLng })

        const map = L.map(mapRef.current, {
            center: [defaultLat, defaultLng],
            zoom: 15,
            zoomControl: false,
            attributionControl: false
        })

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 19
        }).addTo(map)

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

        const marker = L.marker([defaultLat, defaultLng], { icon: customIcon }).addTo(map)

        const popupContent = `
      <div class="custom-popup">
        <h3 class="popup-title">${productTitle}</h3>
        ${address ? `<p class="popup-address">📍 ${address}</p>` : ''}
      </div>
    `

        marker.bindPopup(popupContent, {
            maxWidth: 250,
            className: 'custom-leaflet-popup'
        })

        L.control.zoom({
            position: 'topright'
        }).addTo(map)

        mapInstanceRef.current = map
        markerRef.current = marker

        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove()
                mapInstanceRef.current = null
            }
        }
    }, [isMapLoaded, latitude, longitude, productTitle, address])

    // Ajouter le marqueur utilisateur
    useEffect(() => {
        if (!userLocation || !mapInstanceRef.current) return

        const L = (window as any).L
        const map = mapInstanceRef.current

        if (userMarkerRef.current) {
            map.removeLayer(userMarkerRef.current)
        }

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

        const userMarker = L.marker([userLocation.lat, userLocation.lng], { icon: userIcon }).addTo(map)
        userMarker.bindPopup(`
      <div class="custom-popup">
        <h3 class="popup-title">📍 Votre position</h3>
        ${distance ? `<p class="popup-distance">Distance: ${formatDistance(distance)}</p>` : ''}
      </div>
    `)

        userMarkerRef.current = userMarker

        if (productLocation && !routeInfo) {
            const group = L.featureGroup([markerRef.current, userMarker])
            map.fitBounds(group.getBounds().pad(0.1))
        }
    }, [userLocation, distance, productLocation, routeInfo])

    const formatDistance = (dist: number): string => {
        if (dist < 1) {
            return `${Math.round(dist * 1000)} m`
        }
        return `${dist.toFixed(1)} km`
    }

    const formatDuration = (minutes: number): string => {
        if (minutes < 60) {
            return `${Math.round(minutes)} min`
        }
        const hours = Math.floor(minutes / 60)
        const mins = Math.round(minutes % 60)
        return `${hours}h ${mins}min`
    }

    const clearRoute = () => {
        if (routeLayerRef.current && mapInstanceRef.current) {
            mapInstanceRef.current.removeLayer(routeLayerRef.current)
            routeLayerRef.current = null
        }
        setRouteInfo(null)
        setShowRoutePanel(false)

        // Réajuster la vue
        if (userLocation && productLocation && mapInstanceRef.current) {
            const L = (window as any).L
            const group = L.featureGroup([markerRef.current, userMarkerRef.current])
            mapInstanceRef.current.fitBounds(group.getBounds().pad(0.1))
        }
    }

    const shareLocation = () => {
        if (!productLocation) return

        const shareUrl = `https://www.openstreetmap.org/?mlat=${productLocation.lat}&mlon=${productLocation.lng}&zoom=15`
        if (navigator.share) {
            navigator.share({
                title: productTitle,
                text: `Localisation de ${productTitle}`,
                url: shareUrl
            })
        } else {
            navigator.clipboard.writeText(shareUrl)
            alert('Lien copié dans le presse-papier!')
        }
    }

    if (!isMapLoaded) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-[#1C2B49]/70 p-8 rounded-3xl border border-[#E5E7EB] shadow-xl"
            >
                <div className="flex items-center justify-center h-64">
                    <div className="flex flex-col items-center gap-4">
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="w-12 h-12 border-4 border-[#F6C445] border-t-transparent rounded-full"
                        />
                        <p className="text-[#1C2B49] dark:text-white font-medium">Chargement de la carte...</p>
                    </div>
                </div>
            </motion.div>
        )
    }

    return (
        <>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-[#1C2B49]/70 p-6 rounded-3xl border border-[#E5E7EB] shadow-xl"
            >
                {/* En-tête */}
                <div className="flex items-center justify-between mb-6">
                    <motion.h3
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        className="font-black text-xl text-[#1C2B49] dark:text-[#F6C445] flex items-center gap-2"
                    >
                        <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                        >
                            <FaMapMarkerAlt className="text-[#F6C445]" />
                        </motion.div>
                        Localisation
                    </motion.h3>

                    <div className="flex items-center gap-2">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={getUserLocation}
                            disabled={isLocating}
                            className="bg-[#F6C445] hover:bg-[#F6C445]/80 text-[#1C2B49] px-4 py-2 rounded-xl font-medium transition disabled:opacity-50 flex items-center gap-2"
                        >
                            {isLocating ? (
                                <>
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                        className="w-4 h-4 border-2 border-[#1C2B49] border-t-transparent rounded-full"
                                    />
                                    Localisation...
                                </>
                            ) : (
                                <>
                                    <FaLocationArrow />
                                    Ma position
                                </>
                            )}
                        </motion.button>

                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={shareLocation}
                            className="bg-[#1C2B49] hover:bg-[#2a3b60] text-white p-3 rounded-xl transition"
                        >
                            <FaShare />
                        </motion.button>

                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setIsFullscreen(true)}
                            className="bg-[#1C2B49] hover:bg-[#2a3b60] text-white p-3 rounded-xl transition"
                        >
                            <FaExpand />
                        </motion.button>
                    </div>
                </div>

                {/* Erreur de localisation */}
                <AnimatePresence>
                    {locationError && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-xl mb-4 flex items-center gap-2"
                        >
                            <FaInfoCircle />
                            {locationError}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Info distance */}
                <AnimatePresence>
                    {distance && !routeInfo && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="bg-[#F6C445]/20 border border-[#F6C445]/30 text-[#1C2B49] dark:text-[#F6C445] px-4 py-3 rounded-xl mb-4 flex items-center justify-between"
                        >
                            <div className="flex items-center gap-2">
                                <FaMapMarkedAlt />
                                <strong>Distance à vol d'oiseau:</strong> {formatDistance(distance)}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Boutons mode de transport */}
                <AnimatePresence>
                    {userLocation && !routeInfo && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="mb-4 flex gap-2"
                        >
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => getRoute('driving')}
                                disabled={isLoadingRoute}
                                className="flex-1 bg-[#F6C445] hover:bg-[#F6C445]/80 text-[#1C2B49] px-4 py-3 rounded-xl font-medium transition disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                <FaCar /> Voiture
                            </motion.button>

                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => getRoute('walking')}
                                disabled={isLoadingRoute}
                                className="flex-1 bg-[#1C2B49] hover:bg-[#2a3b60] text-white px-4 py-3 rounded-xl font-medium transition disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                <FaWalking /> À pied
                            </motion.button>

                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => getRoute('cycling')}
                                disabled={isLoadingRoute}
                                className="flex-1 bg-[#1C2B49] hover:bg-[#2a3b60] text-white px-4 py-3 rounded-xl font-medium transition disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                <FaBicycle /> Vélo
                            </motion.button>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Panneau d'itinéraire */}
                <AnimatePresence>
                    {showRoutePanel && routeInfo && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="bg-gradient-to-r from-[#F6C445]/20 to-[#F6C445]/10 border-2 border-[#F6C445] rounded-xl p-4 mb-4"
                        >
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2 text-[#1C2B49] dark:text-[#F6C445] font-bold">
                                    <FaRoute />
                                    Itinéraire {travelMode === 'driving' ? '🚗' : travelMode === 'walking' ? '🚶' : '🚴'}
                                </div>
                                <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={clearRoute}
                                    className="text-red-500 hover:text-red-600"
                                >
                                    <FaTimes />
                                </motion.button>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex items-center gap-2 text-[#1C2B49] dark:text-white">
                                    <FaMapMarkedAlt className="text-[#F6C445]" />
                                    <div>
                                        <div className="text-xs opacity-70">Distance</div>
                                        <div className="font-bold">{formatDistance(routeInfo.distance)}</div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 text-[#1C2B49] dark:text-white">
                                    <FaClock className="text-[#F6C445]" />
                                    <div>
                                        <div className="text-xs opacity-70">Durée</div>
                                        <div className="font-bold">{formatDuration(routeInfo.duration)}</div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Carte */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    <div
                        ref={mapRef}
                        className="w-full h-96 rounded-2xl overflow-hidden shadow-lg border-2 border-[#F6C445]/20"
                    />
                </motion.div>

                {/* Adresse */}
                {address && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="mt-4 p-4 bg-[#F6C445]/10 rounded-xl"
                    >
                        <p className="text-sm text-[#1C2B49] dark:text-gray-200 flex items-center gap-2">
                            <FaMapMarkerAlt className="text-[#F6C445]" />
                            <strong>Adresse:</strong> {address}
                        </p>
                    </motion.div>
                )}
            </motion.div>

            {/* Modal plein écran */}
            <AnimatePresence>
                {isFullscreen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/90 z-50 flex flex-col"
                    >
                        <motion.div
                            initial={{ y: -50 }}
                            animate={{ y: 0 }}
                            className="flex items-center justify-between p-4 bg-white dark:bg-[#1C2B49]"
                        >
                            <h2 className="text-xl font-bold text-[#1C2B49] dark:text-white flex items-center gap-2">
                                <FaMapMarkerAlt className="text-[#F6C445]" />
                                {productTitle}
                            </h2>
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => setIsFullscreen(false)}
                                className="bg-red-500 hover:bg-red-600 text-white p-3 rounded-xl transition"
                            >
                                <FaTimes />
                            </motion.button>
                        </motion.div>
                        <div className="flex-1">
                            <div ref={mapRef} className="w-full h-full" />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Styles CSS */}
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
          box-shadow: 0 4px 15px rgba(246, 196, 69, 0.5);
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
          border: 3px solid #F6C445;
          border-radius: 50%;
          animation: pulse 2s infinite;
          opacity: 0.7;
        }
        
        .user-marker {
          position: relative;
        }
        
        .user-pin {
          width: 20px;
          height: 20px;
          background: #22c55e;
          border: 3px solid white;
          border-radius: 50%;
          position: relative;
          box-shadow: 0 4px 15px rgba(34, 197, 94, 0.5);
        }
        
        .user-pulse {
          position: absolute;
          top: -5px;
          left: -5px;
          width: 30px;
          height: 30px;
          border: 3px solid #22c55e;
          border-radius: 50%;
          animation: pulse 2s infinite;
          opacity: 0.5;
        }
        
        @keyframes pulse {
          0% {
            transform: scale(1);
            opacity: 0.7;
          }
          50% {
            transform: scale(1.3);
            opacity: 0.3;
          }
          100% {
            transform: scale(1.6);
            opacity: 0;
          }
        }
        
        .custom-leaflet-popup .leaflet-popup-content-wrapper {
          background: white;
          border-radius: 16px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.2);
          border: 3px solid #F6C445;
          padding: 4px;
        }
        
        .custom-leaflet-popup .leaflet-popup-tip {
          background: #F6C445;
        }
        
        .custom-popup {
          padding: 12px;
        }
        
        .popup-title {
          font-size: 16px;
          font-weight: bold;
          color: #1C2B49;
          margin: 0 0 8px 0;
        }
        
        .popup-address {
          font-size: 13px;
          color: #666;
          margin: 0 0 8px 0;
        }
        
        .popup-distance {
          font-size: 14px;
          color: #F6C445;
          font-weight: bold;
          margin: 0;
        }
      `}</style>
        </>
    )
}

export default ProductLocationMap