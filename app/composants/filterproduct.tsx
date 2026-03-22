"use client";
import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { createClient } from "@/lib/supabase";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  MapPin,
  Navigation,
  Loader2,
  X,
  Crosshair,
  AlertTriangle,
  Heart,
  SlidersHorizontal,
  ChevronDown,
  Sparkles,
  Truck,
} from "lucide-react";
import ProductCard from "./product-card";
import BackToTopButton from "./BackToTopButton";
import { ProductCardSkeletonGrid } from "./skeletonComponents";
import PopularProductsCarousel from "./popularProductsCaroussel";
import PriceFilter from "./pricefilter";
import ShareAllSocialButton from "./shareAllSocialButton";

// ─── Localités Sénégal ───────────────────────────────────────────────────────
const SENEGAL_LOCATIONS = [
  { name: "Dakar", lat: 14.6928, lng: -17.4467 },
  { name: "Plateau", lat: 14.6708, lng: -17.4395 },
  { name: "Médina", lat: 14.6765, lng: -17.4515 },
  { name: "Yoff", lat: 14.7539, lng: -17.4731 },
  { name: "Sacré-Coeur", lat: 14.7306, lng: -17.464 },
  { name: "Almadies", lat: 14.7447, lng: -17.5264 },
  { name: "Ngor", lat: 14.7587, lng: -17.518 },
  { name: "Ouakam", lat: 14.7289, lng: -17.4922 },
  { name: "Point E", lat: 14.7019, lng: -17.4644 },
  { name: "Mermoz", lat: 14.7089, lng: -17.4558 },
  { name: "Fann", lat: 14.7056, lng: -17.4739 },
  { name: "Liberté", lat: 14.7086, lng: -17.4656 },
  { name: "HLM", lat: 14.7085, lng: -17.452 },
  { name: "Grand Dakar", lat: 14.7089, lng: -17.4495 },
  { name: "Pikine", lat: 14.7549, lng: -17.3985 },
  { name: "Guédiawaye", lat: 14.7692, lng: -17.4056 },
  { name: "Parcelles Assainies", lat: 14.7642, lng: -17.4314 },
  { name: "Rufisque", lat: 14.7167, lng: -17.2667 },
  { name: "Thiès", lat: 14.7886, lng: -16.926 },
  { name: "Kaolack", lat: 14.1592, lng: -16.0729 },
  { name: "Saint-Louis", lat: 16.0179, lng: -16.4817 },
  { name: "Mbour", lat: 14.4198, lng: -16.9639 },
  { name: "Diourbel", lat: 14.6574, lng: -16.2335 },
  { name: "Ziguinchor", lat: 12.5681, lng: -16.2717 },
];

// ─── Types ────────────────────────────────────────────────────────────────────
interface UserSignals {
  likedCategories: Record<string, number>; // catégorie → nb de likes
  likedSellerIds: Set<string>; // vendeurs suivis
  followedSellerIds: Set<string>; // abonnements
}

interface ScoredProduct {
  product: any;
  score: number;
  distance: number | null;
}

const PAGE_SIZE = 12;

// ─── Haversine ────────────────────────────────────────────────────────────────
function haversine(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ─── Algorithme de scoring ────────────────────────────────────────────────────
/**
 * Score d'un produit (0–100) combinant :
 *   - Proximité GPS           (0–35 pts) — priorité principale
 *   - Préférences catégorie   (0–20 pts) — likes de l'user
 *   - Vendeur suivi/aimé      (0–15 pts) — abonnements
 *   - Note vendeur            (0–10 pts) — moyenne des ratings
 *   - Popularité produit      (0–10 pts) — vues du produit
 *   - Likes produit           (0–10 pts) — nombre de likes reçus
 *   - Fraîcheur               (0–5  pts) — boost pour les nouveaux
 */
function scoreProduct(
  product: any,
  userPos: { lat: number; lng: number } | null,
  signals: UserSignals,
  sellerRatings: Record<string, number>, // seller_id → moyenne rating
  productLikeCounts: Record<number, number>, // product_id → count
): ScoredProduct {
  let score = 0;
  let distance: number | null = null;

  // 1. PROXIMITÉ (35 pts max)
  if (userPos && product.latitude && product.longitude) {
    distance = haversine(
      userPos.lat,
      userPos.lng,
      product.latitude,
      product.longitude,
    );
    if (distance <= 1) score += 35;
    else if (distance <= 3) score += 30;
    else if (distance <= 5) score += 25;
    else if (distance <= 10) score += 18;
    else if (distance <= 20) score += 10;
    else if (distance <= 50) score += 5;
    // > 50km → 0 pt de proximité
  } else {
    // Pas de coordonnées → score neutre, pas pénalisé
    score += 5;
  }

  // 2. PRÉFÉRENCES CATÉGORIE (20 pts max)
  const cat = product.category;
  if (cat && signals.likedCategories[cat]) {
    const catLikes = signals.likedCategories[cat];
    const totalLikes = Object.values(signals.likedCategories).reduce(
      (s, v) => s + v,
      0,
    );
    const ratio = totalLikes > 0 ? catLikes / totalLikes : 0;
    score += Math.round(ratio * 20);
  }

  // 3. VENDEUR SUIVI OU AIMÉ (15 pts max)
  const sellerId = product.user_id;
  if (signals.followedSellerIds.has(sellerId)) score += 15;
  else if (signals.likedSellerIds.has(sellerId)) score += 8;

  // 4. NOTE VENDEUR (10 pts max)
  const avgRating = sellerRatings[sellerId];
  if (avgRating != null) {
    score += Math.round((avgRating / 5) * 10);
  }

  // 5. VUES PRODUIT / POPULARITÉ (10 pts max)
  const views = product.clicks ?? 0;
  if (views > 500) score += 10;
  else if (views > 200) score += 7;
  else if (views > 50) score += 4;
  else if (views > 10) score += 2;

  // 6. LIKES PRODUIT (10 pts max)
  const likes = productLikeCounts[product.id] ?? 0;
  if (likes > 100) score += 10;
  else if (likes > 50) score += 7;
  else if (likes > 20) score += 5;
  else if (likes > 5) score += 3;
  else if (likes > 0) score += 1;

  // 7. FRAÎCHEUR (5 pts max) — boost si < 48h
  if (product.created_at) {
    const ageHours =
      (Date.now() - new Date(product.created_at).getTime()) / 3_600_000;
    if (ageHours < 6) score += 5;
    else if (ageHours < 24) score += 3;
    else if (ageHours < 48) score += 1;
  }

  // Petite part d'aléatoire (±2 pts) pour éviter le feed figé
  score += Math.random() * 4 - 2;

  return { product, score: Math.max(0, Math.min(100, score)), distance };
}

// ─── Composant principal ──────────────────────────────────────────────────────
export default function FilteredProducts({
  products = [],
  userId = "demo",
}: {
  products: any[];
  userId?: string;
}) {
  const supabase = createClient();

  // Filtres
  const [priceRange, setPriceRange] = useState<[number, number] | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [locationFilterOpen, setLocationFilterOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Scroll infini
  const [page, setPage] = useState(1);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // UI
  const [loading, setLoading] = useState(true);
  const [scrollY, setScrollY] = useState(0);

  // Géolocalisation
  const [userPosition, setUserPosition] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [userLocationName, setUserLocationName] = useState("Dakar");
  const [locationLoading, setLocationLoading] = useState(true);
  const [locationPermissionDenied, setLocationPermissionDenied] =
    useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Signaux utilisateur (chargés depuis Supabase)
  const [signals, setSignals] = useState<UserSignals>({
    likedCategories: {},
    likedSellerIds: new Set(),
    followedSellerIds: new Set(),
  });
  const [sellerRatings, setSellerRatings] = useState<Record<string, number>>(
    {},
  );
  const [productLikeCounts, setProductLikeCounts] = useState<
    Record<number, number>
  >({});
  const [signalsLoaded, setSignalsLoaded] = useState(false);

  // ── Chargement des signaux utilisateur ─────────────────────────────────────
  useEffect(() => {
    if (!userId || userId === "demo") {
      setSignalsLoaded(true);
      return;
    }

    async function loadSignals() {
      try {
        // 1. Likes produits de l'utilisateur → catégories préférées + vendeurs
        const { data: userLikes } = await supabase
          .from("likes")
          .select("product_id")
          .eq("user_id", userId);

        const likedProductIds = (userLikes ?? []).map((l) => l.product_id);

        // Récupérer les produits likés pour connaître leurs catégories / vendeurs
        const likedProductDetails =
          likedProductIds.length > 0
            ? products.filter((p) => likedProductIds.includes(p.id))
            : [];

        const likedCategories: Record<string, number> = {};
        const likedSellerIds = new Set<string>();
        likedProductDetails.forEach((p) => {
          if (p.category) {
            likedCategories[p.category] =
              (likedCategories[p.category] ?? 0) + 1;
          }
          if (p.user_id) likedSellerIds.add(p.user_id);
        });

        // 2. Abonnements (following)
        const { data: follows } = await supabase
          .from("follows")
          .select("following_id")
          .eq("follower_id", userId);

        const followedSellerIds = new Set<string>(
          (follows ?? []).map((f) => f.following_id),
        );

        setSignals({ likedCategories, likedSellerIds, followedSellerIds });

        // 3. Moyenne des ratings par vendeur
        const { data: ratings } = await supabase
          .from("seller_ratings")
          .select("seller_id, rating");

        const ratingMap: Record<string, { sum: number; count: number }> = {};
        (ratings ?? []).forEach(({ seller_id, rating }) => {
          if (!ratingMap[seller_id])
            ratingMap[seller_id] = { sum: 0, count: 0 };
          ratingMap[seller_id].sum += rating;
          ratingMap[seller_id].count += 1;
        });
        const avgRatings: Record<string, number> = {};
        Object.entries(ratingMap).forEach(([id, { sum, count }]) => {
          avgRatings[id] = sum / count;
        });
        setSellerRatings(avgRatings);

        // 4. Nombre de likes par produit
        const { data: allLikes } = await supabase
          .from("likes")
          .select("product_id");

        const likeCounts: Record<number, number> = {};
        (allLikes ?? []).forEach(({ product_id }) => {
          likeCounts[product_id] = (likeCounts[product_id] ?? 0) + 1;
        });
        setProductLikeCounts(likeCounts);
      } catch (e) {
        console.error("Erreur chargement signaux:", e);
      } finally {
        setSignalsLoaded(true);
      }
    }

    loadSignals();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  // ── Géolocalisation ─────────────────────────────────────────────────────────
  const findNearestLocation = useCallback((lat: number, lng: number) => {
    let nearest = "Dakar";
    let minDist = Infinity;
    SENEGAL_LOCATIONS.forEach((loc) => {
      const d = haversine(lat, lng, loc.lat, loc.lng);
      if (d < minDist) {
        minDist = d;
        nearest = loc.name;
      }
    });
    return minDist > 15 ? "Zone inconnue" : nearest;
  }, []);

  const detectUserLocation = useCallback(async () => {
    setLocationLoading(true);
    setLocationError(null);
    setLocationPermissionDenied(false);
    try {
      const pos = await new Promise<GeolocationPosition>((res, rej) =>
        navigator.geolocation
          ? navigator.geolocation.getCurrentPosition(res, rej, {
              enableHighAccuracy: true,
              timeout: 15000,
              maximumAge: 300000,
            })
          : rej(new Error("not supported")),
      );
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;
      setUserPosition({ lat, lng });
      setUserLocationName(findNearestLocation(lat, lng));
    } catch (err: any) {
      if (err?.code === 1) setLocationPermissionDenied(true);
      setLocationError("GPS indisponible");
      setUserPosition({ lat: 14.6928, lng: -17.4467 });
      setUserLocationName("Dakar");
    } finally {
      setLocationLoading(false);
    }
  }, [findNearestLocation]);

  useEffect(() => {
    detectUserLocation();
  }, [detectUserLocation]);

  // ── Feed trié par score ─────────────────────────────────────────────────────
  const scoredFeed = useMemo<ScoredProduct[]>(() => {
    // Filtres de base
    let filtered = products.filter((p) => {
      const matchesPrice =
        !priceRange || (p.price >= priceRange[0] && p.price <= priceRange[1]);

      if (!matchesPrice) return false;

      if (selectedLocation) {
        const locData = SENEGAL_LOCATIONS.find(
          (l) => l.name.toLowerCase() === selectedLocation.toLowerCase(),
        );
        if (locData) {
          if (p.latitude && p.longitude) {
            return (
              haversine(locData.lat, locData.lng, p.latitude, p.longitude) <= 5
            );
          }
          return p.zone === selectedLocation;
        }
        return p.zone === selectedLocation;
      }

      return true;
    });

    // Scoring
    const scored = filtered.map((p) =>
      scoreProduct(p, userPosition, signals, sellerRatings, productLikeCounts),
    );

    // Tri décroissant
    scored.sort((a, b) => b.score - a.score);

    return scored;
  }, [
    products,
    priceRange,
    selectedLocation,
    userPosition,
    signals,
    sellerRatings,
    productLikeCounts,
  ]);

  // ── Scroll infini via IntersectionObserver ──────────────────────────────────
  const visibleItems = useMemo(
    () => scoredFeed.slice(0, page * PAGE_SIZE),
    [scoredFeed, page],
  );

  const hasMore = page * PAGE_SIZE < scoredFeed.length;

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isFetchingMore) {
          setIsFetchingMore(true);
          // Petit délai pour simuler un chargement fluide
          setTimeout(() => {
            setPage((p) => p + 1);
            setIsFetchingMore(false);
          }, 400);
        }
      },
      { rootMargin: "200px" },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, isFetchingMore]);

  // Remise à zéro quand les filtres changent
  useEffect(() => {
    setPage(1);
  }, [priceRange, selectedLocation]);

  // ── Stats ───────────────────────────────────────────────────────────────────
  const nearbyCount = useMemo(() => {
    if (!userPosition) return 0;
    return products.filter(
      (p) =>
        p.latitude &&
        p.longitude &&
        haversine(
          userPosition.lat,
          userPosition.lng,
          p.latitude,
          p.longitude,
        ) <= 5,
    ).length;
  }, [products, userPosition]);

  const availableZones = useMemo(() => {
    const zones = new Set<string>();
    products.forEach((p) => {
      if (p.zone) zones.add(p.zone);
      if (p.latitude && p.longitude)
        zones.add(findNearestLocation(p.latitude, p.longitude));
    });
    return SENEGAL_LOCATIONS.filter((loc) => zones.has(loc.name))
      .map((loc) => ({
        ...loc,
        count: products.filter((p) => {
          if (p.latitude && p.longitude)
            return haversine(loc.lat, loc.lng, p.latitude, p.longitude) <= 5;
          return p.zone === loc.name;
        }).length,
      }))
      .filter((z) => z.count > 0)
      .sort((a, b) => b.count - a.count);
  }, [products, findNearestLocation]);

  // ── Effets UI ───────────────────────────────────────────────────────────────
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // ── LocationFilter (sous-composant) ────────────────────────────────────────
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

      <button
        onClick={() => {
          setSelectedLocation(null);
          setLocationFilterOpen(false);
        }}
        className={`w-full flex items-center justify-between p-3 sm:p-4 rounded-xl mb-3 transition-all touch-manipulation ${
          !selectedLocation
            ? "bg-[#F6C445]/10 border-2 border-[#F6C445] text-[#F6C445]"
            : "bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 text-gray-700 dark:text-gray-300"
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

      {userPosition && !locationLoading && (
        <div className="mb-4">
          <p className="text-xs text-gray-500 mb-2 px-2 font-medium">
            🎯 Votre zone (GPS)
          </p>
          <button
            onClick={() => {
              setSelectedLocation(userLocationName);
              setLocationFilterOpen(false);
            }}
            className={`w-full flex items-center justify-between p-3 rounded-xl mb-3 transition-all ${
              selectedLocation === userLocationName
                ? "bg-[#F6C445]/10 border-2 border-[#F6C445] text-[#F6C445]"
                : "bg-green-50 dark:bg-green-900/20 hover:bg-green-100 text-green-700 border border-green-200"
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
              <span className="text-sm bg-green-100 text-green-600 px-2 py-1 rounded-full">
                {nearbyCount}
              </span>
              <div className="text-xs text-green-600 mt-1">GPS</div>
            </div>
          </button>
        </div>
      )}

      <div className="space-y-2">
        <p className="text-xs text-gray-500 mb-2 px-2 font-medium">
          🏘️ Zones populaires
        </p>
        {availableZones
          .filter((z) => z.name !== userLocationName)
          .slice(0, 10)
          .map((zone) => (
            <button
              key={zone.name}
              onClick={() => {
                setSelectedLocation(zone.name);
                setLocationFilterOpen(false);
              }}
              className={`w-full flex items-center justify-between p-3 rounded-xl transition-all touch-manipulation ${
                selectedLocation === zone.name
                  ? "bg-[#F6C445]/10 border-2 border-[#F6C445] text-[#F6C445]"
                  : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
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
    </div>
  );

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F8F9FB] via-white to-[#F8F9FB] dark:from-[#111827] dark:via-[#1C2B49] dark:to-[#111827]">
      {/* Header sticky */}
      <div
        className="sticky top-0 z-40 bg-white/90 dark:bg-[#1C2B49]/90 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 shadow-sm"
        style={{ transform: `translateY(${Math.min(scrollY * 0.05, 10)}px)` }}
      >
        <div className="px-3 sm:px-4 py-3 sm:py-4 max-w-7xl mx-auto">
          {/* Stats */}
          <div className="flex items-center justify-center gap-2 sm:gap-4 mb-3 text-xs text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
              <span>{products.length} produits</span>
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
              <span>
                {locationLoading
                  ? "Localisation..."
                  : locationPermissionDenied
                    ? "GPS requis"
                    : `${nearbyCount} près (${userLocationName})`}
              </span>
            </div>
            <div className="w-1 h-1 bg-gray-400 rounded-full hidden sm:block" />
            <div className="flex items-center gap-1">
              <Truck className="w-3 h-3 text-[#F6C445]" />
              <span className="hidden sm:inline">Livraison rapide</span>
            </div>
          </div>

          {/* Alerte GPS */}
          {locationPermissionDenied && (
            <div className="mb-3 p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 rounded-xl">
              <div className="flex items-center gap-2 text-xs sm:text-sm text-orange-700 dark:text-orange-300">
                <AlertTriangle size={16} className="flex-shrink-0" />
                <span className="flex-1">
                  Activez le GPS pour voir les produits près de vous
                </span>
                <button
                  onClick={detectUserLocation}
                  className="text-[#F6C445] font-medium px-2 py-1 bg-white dark:bg-gray-800 rounded-lg"
                >
                  Activer
                </button>
              </div>
            </div>
          )}

          {/* Barre de filtres */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setFilterOpen(true)}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl border transition-all duration-300 hover:scale-105 active:scale-95 shadow-sm touch-manipulation text-sm font-medium ${
                priceRange
                  ? "border-[#F6C445] bg-[#F6C445]/10 text-[#F6C445]"
                  : "border-gray-200 dark:border-gray-600 bg-white/90 dark:bg-gray-800/90 text-gray-700 dark:text-gray-300"
              }`}
            >
              <SlidersHorizontal size={16} />
              <span className="hidden sm:inline">Prix</span>
              {priceRange && (
                <div className="w-1.5 h-1.5 bg-[#F6C445] rounded-full animate-pulse" />
              )}
            </button>

            <button
              onClick={() => setLocationFilterOpen(true)}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl border transition-all duration-300 hover:scale-105 active:scale-95 shadow-sm touch-manipulation text-sm font-medium min-w-0 flex-1 ${
                selectedLocation
                  ? "border-[#F6C445] bg-[#F6C445]/10 text-[#F6C445]"
                  : "border-gray-200 dark:border-gray-600 bg-white/90 dark:bg-gray-800/90 text-gray-700 dark:text-gray-300"
              }`}
            >
              <MapPin size={16} className="flex-shrink-0" />
              <span className="truncate">
                {selectedLocation || (locationLoading ? "..." : "Zone")}
              </span>
              <ChevronDown size={14} className="flex-shrink-0 opacity-70" />
              {selectedLocation && (
                <div className="w-1.5 h-1.5 bg-[#F6C445] rounded-full flex-shrink-0" />
              )}
            </button>

            <ShareAllSocialButton className="p-2 sm:p-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white/90 dark:bg-gray-800/90 text-gray-700 dark:text-gray-300 transition-all hover:scale-105 active:scale-95 shadow-sm">
              <Heart size={16} />
            </ShareAllSocialButton>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="px-3 sm:px-4 max-w-7xl mx-auto pt-4 sm:pt-6">
        {loading || !signalsLoaded ? (
          <div className="space-y-6 sm:space-y-8">
            <div className="h-24 sm:h-32 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-2xl animate-pulse" />
            <ProductCardSkeletonGrid count={4} />
          </div>
        ) : (
          <>
            <div className="mb-6">
              <PopularProductsCarousel products={products} />
            </div>

            {/* Header résultats */}
            <div className="mb-4 sm:mb-6">
              <div className="flex items-start justify-between mb-4 gap-4">
                <div className="min-w-0 flex-1">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                    {selectedLocation ? (
                      <span className="flex items-center gap-2">
                        <MapPin
                          size={20}
                          className="text-[#F6C445] flex-shrink-0"
                        />
                        <span className="truncate">{selectedLocation}</span>
                      </span>
                    ) : userPosition ? (
                      <span className="flex items-center gap-2">
                        <Crosshair
                          size={20}
                          className="text-[#F6C445] flex-shrink-0"
                        />
                        <span className="truncate">
                          Près de {userLocationName}
                        </span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Sparkles
                          size={20}
                          className="text-[#F6C445] flex-shrink-0"
                        />
                        <span>Pour vous</span>
                      </span>
                    )}
                  </h2>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <span>
                      {scoredFeed.length} produit
                      {scoredFeed.length > 1 ? "s" : ""}
                    </span>
                    {!selectedLocation && userPosition && !locationLoading && (
                      <>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Navigation size={12} />
                          <span>Triés par proximité & préférences</span>
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {(priceRange || selectedLocation) && (
                  <button
                    onClick={() => {
                      setPriceRange(null);
                      setSelectedLocation(null);
                      setSelectedIndex(0);
                    }}
                    className="text-xs sm:text-sm text-[#F6C445] hover:text-[#E2AE32] font-medium px-3 py-1.5 bg-[#F6C445]/10 rounded-lg hover:bg-[#F6C445]/20 flex-shrink-0"
                  >
                    Effacer
                  </button>
                )}
              </div>
            </div>

            {/* Grille produits */}
            {scoredFeed.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center px-4">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-2xl flex items-center justify-center mb-4">
                  <Sparkles size={24} className="text-gray-400" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">
                  Aucun produit trouvé
                </h3>
                <p className="text-gray-500 text-sm mb-6 max-w-xs">
                  Essayez une autre zone ou modifiez vos filtres.
                </p>
                <button
                  onClick={() => {
                    setPriceRange(null);
                    setSelectedLocation(null);
                  }}
                  className="px-6 py-3 bg-gradient-to-r from-[#F6C445] to-[#FFD700] text-[#1C2B49] font-bold rounded-xl"
                >
                  Voir tous les produits
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 pb-8">
                  {visibleItems.map(({ product, score, distance }, index) => (
                    <div
                      key={`${product.id}-${index}`}
                      className="animate-fade-in-up relative"
                      style={{
                        animationDelay: `${(index % PAGE_SIZE) * 40}ms`,
                        animationFillMode: "both",
                      }}
                    >
                      {/* Badge proximité */}
                      {distance !== null && distance <= 2 && (
                        <div className="absolute -top-1 -right-1 z-10 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full shadow-lg flex items-center gap-1">
                          <Crosshair size={8} />
                          <span>{distance.toFixed(1)}km</span>
                        </div>
                      )}

                      {/* Badge "Pour vous" — top scores non-géo */}
                      {score >= 60 && (distance === null || distance > 2) && (
                        <div className="absolute top-2 left-2 z-10 bg-[#F6C445] text-[#1C2B49] text-xs px-2 py-0.5 rounded-full shadow font-bold">
                          ⭐ Top
                        </div>
                      )}

                      <ProductCard
                        product={{ ...product, distance }}
                        userId={userId}
                      />
                    </div>
                  ))}
                </div>

                {/* Sentinel pour l'IntersectionObserver */}
                <div ref={sentinelRef} className="h-4" />

                {/* Loader bas de page */}
                {isFetchingMore && (
                  <div className="flex justify-center py-8">
                    <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400">
                      <Loader2 className="w-5 h-5 animate-spin text-[#F6C445]" />
                      <span className="text-sm">Chargement...</span>
                    </div>
                  </div>
                )}

                {/* Fin du feed */}
                {!hasMore && scoredFeed.length > PAGE_SIZE && (
                  <div className="flex flex-col items-center py-10 text-center">
                    <div className="w-10 h-10 bg-[#F6C445]/10 rounded-full flex items-center justify-center mb-3">
                      <Sparkles size={18} className="text-[#F6C445]" />
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Vous avez tout vu — {scoredFeed.length} produits
                    </p>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>

      {/* Dialogs */}
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

      <Dialog open={locationFilterOpen} onOpenChange={setLocationFilterOpen}>
        <DialogContent className="w-[95vw] max-w-md mx-auto rounded-3xl p-0 overflow-hidden border-0 shadow-2xl max-h-[90vh]">
          <LocationFilter />
        </DialogContent>
      </Dialog>

      <BackToTopButton />

      <style jsx>{`
        @keyframes fade-in-up {
          0% {
            opacity: 0;
            transform: translateY(16px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .touch-manipulation {
          touch-action: manipulation;
          -webkit-tap-highlight-color: transparent;
        }
        .overflow-y-auto::-webkit-scrollbar {
          width: 4px;
        }
        .overflow-y-auto::-webkit-scrollbar-thumb {
          background: #f6c445;
          border-radius: 2px;
        }
        button:focus-visible {
          outline: 2px solid #f6c445;
          outline-offset: 2px;
        }
      `}</style>
    </div>
  );
}
