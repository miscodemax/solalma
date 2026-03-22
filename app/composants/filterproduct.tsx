"use client";
import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { createClient } from "@/lib/supabase";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  MapPin, Navigation, Loader2, X, Crosshair,
  AlertTriangle, Heart, SlidersHorizontal, ChevronDown, Sparkles, Truck,
} from "lucide-react";
import ProductCard from "./product-card";
import BackToTopButton from "./BackToTopButton";
import { ProductCardSkeletonGrid } from "./skeletonComponents";
import PopularProductsCarousel from "./popularProductsCaroussel";
import PriceFilter from "./pricefilter";
import ShareAllSocialButton from "./shareAllSocialButton";

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

interface UserSignals {
  likedCategories: Record<string, number>;
  likedSellerIds: Set<string>;
  followedSellerIds: Set<string>;
}
interface ScoredProduct { product: any; score: number; distance: number | null; }

const PAGE_SIZE = 12;

function haversine(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function scoreProduct(product: any, userPos: { lat: number; lng: number } | null, signals: UserSignals, sellerRatings: Record<string, number>, productLikeCounts: Record<number, number>): ScoredProduct {
  let score = 0, distance: number | null = null;
  if (userPos && product.latitude && product.longitude) {
    distance = haversine(userPos.lat, userPos.lng, product.latitude, product.longitude);
    if (distance <= 1) score += 35; else if (distance <= 3) score += 30; else if (distance <= 5) score += 25;
    else if (distance <= 10) score += 18; else if (distance <= 20) score += 10; else if (distance <= 50) score += 5;
  } else { score += 5; }
  const cat = product.category;
  if (cat && signals.likedCategories[cat]) {
    const total = Object.values(signals.likedCategories).reduce((s, v) => s + v, 0);
    score += Math.round(total > 0 ? (signals.likedCategories[cat] / total) * 20 : 0);
  }
  const sid = product.user_id;
  if (signals.followedSellerIds.has(sid)) score += 15; else if (signals.likedSellerIds.has(sid)) score += 8;
  const avg = sellerRatings[sid]; if (avg != null) score += Math.round((avg / 5) * 10);
  const v = product.clicks ?? 0;
  if (v > 500) score += 10; else if (v > 200) score += 7; else if (v > 50) score += 4; else if (v > 10) score += 2;
  const lk = productLikeCounts[product.id] ?? 0;
  if (lk > 100) score += 10; else if (lk > 50) score += 7; else if (lk > 20) score += 5; else if (lk > 5) score += 3; else if (lk > 0) score += 1;
  if (product.created_at) {
    const h = (Date.now() - new Date(product.created_at).getTime()) / 3_600_000;
    if (h < 6) score += 5; else if (h < 24) score += 3; else if (h < 48) score += 1;
  }
  score += Math.random() * 4 - 2;
  return { product, score: Math.max(0, Math.min(100, score)), distance };
}

// ── Skeleton card ─────────────────────────────────────────────────────────────
function ProductCardSkeleton() {
  return (
    <div className="rounded-2xl overflow-hidden bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 animate-pulse">
      <div className="aspect-square bg-gray-200 dark:bg-gray-700" />
      <div className="p-3 space-y-2">
        <div className="h-3.5 bg-gray-200 dark:bg-gray-700 rounded-full w-3/4" />
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full w-1/2" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full w-2/3 mt-1" />
      </div>
    </div>
  );
}

export default function FilteredProducts({ products = [], userId = "demo" }: { products: any[]; userId?: string }) {
  const supabase = createClient();

  const [priceRange, setPriceRange] = useState<[number, number] | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [locationFilterOpen, setLocationFilterOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);

  // ── Scroll infini ───────────────────────────────────────────────────────────
  // On garde juste un compteur "combien de produits afficher"
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  // Sentinelle : un seul div en bas du DOM, toujours présent
  const sentinelRef = useRef<HTMLDivElement>(null);
  // Ref pour éviter les déclenchements simultanés sans bloquer le re-render
  const loadingRef = useRef(false);
  // Ref miroir du feed pour y accéder dans le callback stable de l'observer
  const feedRef = useRef<ScoredProduct[]>([]);
  const visibleCountRef = useRef(PAGE_SIZE);

  const [loading, setLoading] = useState(true);
  const [scrollY, setScrollY] = useState(0);

  const [userPosition, setUserPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [userLocationName, setUserLocationName] = useState("Dakar");
  const [locationLoading, setLocationLoading] = useState(true);
  const [locationPermissionDenied, setLocationPermissionDenied] = useState(false);

  const [signals, setSignals] = useState<UserSignals>({ likedCategories: {}, likedSellerIds: new Set(), followedSellerIds: new Set() });
  const [sellerRatings, setSellerRatings] = useState<Record<string, number>>({});
  const [productLikeCounts, setProductLikeCounts] = useState<Record<number, number>>({});
  const [signalsLoaded, setSignalsLoaded] = useState(false);

  // ── Signaux ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!userId || userId === "demo") { setSignalsLoaded(true); return; }
    async function load() {
      try {
        const { data: ul } = await supabase.from("likes").select("product_id").eq("user_id", userId);
        const ids = (ul ?? []).map((l) => l.product_id);
        const lp = ids.length > 0 ? products.filter((p) => ids.includes(p.id)) : [];
        const lc: Record<string, number> = {}; const ls = new Set<string>();
        lp.forEach((p) => { if (p.category) lc[p.category] = (lc[p.category] ?? 0) + 1; if (p.user_id) ls.add(p.user_id); });
        const { data: fl } = await supabase.from("follows").select("following_id").eq("follower_id", userId);
        const fs = new Set<string>((fl ?? []).map((f) => f.following_id));
        setSignals({ likedCategories: lc, likedSellerIds: ls, followedSellerIds: fs });
        const { data: rt } = await supabase.from("seller_ratings").select("seller_id, rating");
        const rm: Record<string, { sum: number; count: number }> = {};
        (rt ?? []).forEach(({ seller_id, rating }) => { if (!rm[seller_id]) rm[seller_id] = { sum: 0, count: 0 }; rm[seller_id].sum += rating; rm[seller_id].count++; });
        const ar: Record<string, number> = {};
        Object.entries(rm).forEach(([id, { sum, count }]) => { ar[id] = sum / count; });
        setSellerRatings(ar);
        const { data: al } = await supabase.from("likes").select("product_id");
        const lk: Record<number, number> = {};
        (al ?? []).forEach(({ product_id }) => { lk[product_id] = (lk[product_id] ?? 0) + 1; });
        setProductLikeCounts(lk);
      } catch (e) { console.error(e); } finally { setSignalsLoaded(true); }
    }
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  // ── Géolocalisation ─────────────────────────────────────────────────────────
  const findNearest = useCallback((lat: number, lng: number) => {
    let n = "Dakar", m = Infinity;
    SENEGAL_LOCATIONS.forEach((l) => { const d = haversine(lat, lng, l.lat, l.lng); if (d < m) { m = d; n = l.name; } });
    return m > 15 ? "Zone inconnue" : n;
  }, []);

  const detectUserLocation = useCallback(async () => {
    setLocationLoading(true); setLocationPermissionDenied(false);
    try {
      const p = await new Promise<GeolocationPosition>((res, rej) =>
        navigator.geolocation ? navigator.geolocation.getCurrentPosition(res, rej, { enableHighAccuracy: true, timeout: 15000, maximumAge: 300000 }) : rej(new Error("not supported"))
      );
      setUserPosition({ lat: p.coords.latitude, lng: p.coords.longitude });
      setUserLocationName(findNearest(p.coords.latitude, p.coords.longitude));
    } catch (e: any) {
      if (e?.code === 1) setLocationPermissionDenied(true);
      setUserPosition({ lat: 14.6928, lng: -17.4467 }); setUserLocationName("Dakar");
    } finally { setLocationLoading(false); }
  }, [findNearest]);

  useEffect(() => { detectUserLocation(); }, [detectUserLocation]);

  // ── Feed scoré ──────────────────────────────────────────────────────────────
  const scoredFeed = useMemo<ScoredProduct[]>(() => {
    let f = products.filter((p) => {
      if (priceRange && (p.price < priceRange[0] || p.price > priceRange[1])) return false;
      if (selectedLocation) {
        const ld = SENEGAL_LOCATIONS.find((l) => l.name.toLowerCase() === selectedLocation.toLowerCase());
        if (ld) { if (p.latitude && p.longitude) return haversine(ld.lat, ld.lng, p.latitude, p.longitude) <= 5; return p.zone === selectedLocation; }
        return p.zone === selectedLocation;
      }
      return true;
    });
    const s = f.map((p) => scoreProduct(p, userPosition, signals, sellerRatings, productLikeCounts));
    s.sort((a, b) => b.score - a.score);
    return s;
  }, [products, priceRange, selectedLocation, userPosition, signals, sellerRatings, productLikeCounts]);

  // Sync refs
  useEffect(() => { feedRef.current = scoredFeed; }, [scoredFeed]);
  useEffect(() => { visibleCountRef.current = visibleCount; }, [visibleCount]);

  // Reset quand le feed change (filtre modifié)
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
    setIsLoadingMore(false);
    loadingRef.current = false;
  }, [scoredFeed]);

  const visibleItems = useMemo(() => scoredFeed.slice(0, visibleCount), [scoredFeed, visibleCount]);
  const hasMore = visibleCount < scoredFeed.length;

  // ── IntersectionObserver — créé UNE SEULE FOIS, stable ──────────────────────
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting) return;
        if (loadingRef.current) return;
        // Vérifier via refs (pas de closure sur state)
        if (visibleCountRef.current >= feedRef.current.length) return;

        loadingRef.current = true;
        setIsLoadingMore(true);

        setTimeout(() => {
          setVisibleCount((prev) => Math.min(prev + PAGE_SIZE, feedRef.current.length));
          setIsLoadingMore(false);
          loadingRef.current = false;
        }, 700);
      },
      // rootMargin élevé = déclenche 500px AVANT que la sentinelle soit visible → chargement anticipé, scroll fluide
      { rootMargin: "500px", threshold: 0 }
    );

    observer.observe(sentinel);
    // On ne détruit JAMAIS l'observer → il reste actif toute la vie du composant
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // [] = créé une seule fois

  // ── Autres effets ───────────────────────────────────────────────────────────
  useEffect(() => { const t = setTimeout(() => setLoading(false), 800); return () => clearTimeout(t); }, []);
  useEffect(() => {
    const h = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  const nearbyCount = useMemo(() => {
    if (!userPosition) return 0;
    return products.filter((p) => p.latitude && p.longitude && haversine(userPosition.lat, userPosition.lng, p.latitude, p.longitude) <= 5).length;
  }, [products, userPosition]);

  const availableZones = useMemo(() => {
    const z = new Set<string>();
    products.forEach((p) => { if (p.zone) z.add(p.zone); if (p.latitude && p.longitude) z.add(findNearest(p.latitude, p.longitude)); });
    return SENEGAL_LOCATIONS.filter((l) => z.has(l.name))
      .map((l) => ({ ...l, count: products.filter((p) => { if (p.latitude && p.longitude) return haversine(l.lat, l.lng, p.latitude, p.longitude) <= 5; return p.zone === l.name; }).length }))
      .filter((z) => z.count > 0).sort((a, b) => b.count - a.count);
  }, [products, findNearest]);

  const LocationFilter = () => (
    <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-3xl max-h-[80vh] overflow-y-auto">
      <div className="flex items-center justify-between mb-4 sticky top-0 bg-white dark:bg-gray-800 pb-2">
        <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100">Choisir une zone</h3>
        <button onClick={() => setLocationFilterOpen(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"><X size={20} className="text-gray-500" /></button>
      </div>
      <button onClick={() => { setSelectedLocation(null); setLocationFilterOpen(false); }} className={`w-full flex items-center justify-between p-3 sm:p-4 rounded-xl mb-3 transition-all ${!selectedLocation ? "bg-[#F6C445]/10 border-2 border-[#F6C445] text-[#F6C445]" : "bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 text-gray-700 dark:text-gray-300"}`}>
        <div className="flex items-center gap-3"><Sparkles size={18} /><span className="font-medium">Toutes les zones</span></div>
        <span className="text-sm bg-gray-100 dark:bg-gray-600 px-2 py-1 rounded-full">{products.length}</span>
      </button>
      {userPosition && !locationLoading && (
        <div className="mb-4">
          <p className="text-xs text-gray-500 mb-2 px-2 font-medium">🎯 Votre zone (GPS)</p>
          <button onClick={() => { setSelectedLocation(userLocationName); setLocationFilterOpen(false); }} className={`w-full flex items-center justify-between p-3 rounded-xl mb-3 transition-all ${selectedLocation === userLocationName ? "bg-[#F6C445]/10 border-2 border-[#F6C445] text-[#F6C445]" : "bg-green-50 dark:bg-green-900/20 hover:bg-green-100 text-green-700 border border-green-200"}`}>
            <div className="flex items-center gap-3"><Crosshair size={18} className="text-green-600" /><div className="text-left"><span className="font-medium block">{userLocationName}</span><span className="text-xs opacity-70">Rayon de 5km</span></div></div>
            <div className="text-right"><span className="text-sm bg-green-100 text-green-600 px-2 py-1 rounded-full">{nearbyCount}</span><div className="text-xs text-green-600 mt-1">GPS</div></div>
          </button>
        </div>
      )}
      <div className="space-y-2">
        <p className="text-xs text-gray-500 mb-2 px-2 font-medium">🏘️ Zones populaires</p>
        {availableZones.filter((z) => z.name !== userLocationName).slice(0, 10).map((zone) => (
          <button key={zone.name} onClick={() => { setSelectedLocation(zone.name); setLocationFilterOpen(false); }} className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${selectedLocation === zone.name ? "bg-[#F6C445]/10 border-2 border-[#F6C445] text-[#F6C445]" : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"}`}>
            <div className="flex items-center gap-3"><MapPin size={16} /><div className="text-left"><span className="block font-medium">{zone.name}</span><span className="text-xs opacity-70">Rayon 5km</span></div></div>
            <span className="text-sm bg-gray-100 dark:bg-gray-600 px-2 py-1 rounded-full">{zone.count}</span>
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F8F9FB] via-white to-[#F8F9FB] dark:from-[#111827] dark:via-[#1C2B49] dark:to-[#111827]">
      {/* Header sticky */}
      <div className="sticky top-0 z-40 bg-white/90 dark:bg-[#1C2B49]/90 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 shadow-sm" style={{ transform: `translateY(${Math.min(scrollY * 0.05, 10)}px)` }}>
        <div className="px-3 sm:px-4 py-3 sm:py-4 max-w-7xl mx-auto">
          <div className="flex items-center justify-center gap-2 sm:gap-4 mb-3 text-xs text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-1"><div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" /><span>{products.length} produits</span></div>
            <div className="w-1 h-1 bg-gray-400 rounded-full hidden sm:block" />
            <div className="flex items-center gap-1">
              {locationLoading ? <Loader2 className="w-3 h-3 animate-spin text-[#F6C445]" /> : locationPermissionDenied ? <AlertTriangle className="w-3 h-3 text-orange-500" /> : <Crosshair className="w-3 h-3 text-[#F6C445]" />}
              <span>{locationLoading ? "Localisation..." : locationPermissionDenied ? "GPS requis" : `${nearbyCount} près (${userLocationName})`}</span>
            </div>
            <div className="w-1 h-1 bg-gray-400 rounded-full hidden sm:block" />
            <div className="flex items-center gap-1"><Truck className="w-3 h-3 text-[#F6C445]" /><span className="hidden sm:inline">Livraison rapide</span></div>
          </div>
          {locationPermissionDenied && (
            <div className="mb-3 p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 rounded-xl">
              <div className="flex items-center gap-2 text-xs sm:text-sm text-orange-700 dark:text-orange-300">
                <AlertTriangle size={16} className="flex-shrink-0" /><span className="flex-1">Activez le GPS pour voir les produits près de vous</span>
                <button onClick={detectUserLocation} className="text-[#F6C445] font-medium px-2 py-1 bg-white dark:bg-gray-800 rounded-lg">Activer</button>
              </div>
            </div>
          )}
          <div className="flex items-center gap-2 sm:gap-3">
            <button onClick={() => setFilterOpen(true)} className={`flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl border transition-all hover:scale-105 active:scale-95 shadow-sm touch-manipulation text-sm font-medium ${priceRange ? "border-[#F6C445] bg-[#F6C445]/10 text-[#F6C445]" : "border-gray-200 dark:border-gray-600 bg-white/90 dark:bg-gray-800/90 text-gray-700 dark:text-gray-300"}`}>
              <SlidersHorizontal size={16} /><span className="hidden sm:inline">Prix</span>
              {priceRange && <div className="w-1.5 h-1.5 bg-[#F6C445] rounded-full animate-pulse" />}
            </button>
            <button onClick={() => setLocationFilterOpen(true)} className={`flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl border transition-all hover:scale-105 active:scale-95 shadow-sm touch-manipulation text-sm font-medium min-w-0 flex-1 ${selectedLocation ? "border-[#F6C445] bg-[#F6C445]/10 text-[#F6C445]" : "border-gray-200 dark:border-gray-600 bg-white/90 dark:bg-gray-800/90 text-gray-700 dark:text-gray-300"}`}>
              <MapPin size={16} className="flex-shrink-0" /><span className="truncate">{selectedLocation || (locationLoading ? "..." : "Zone")}</span><ChevronDown size={14} className="flex-shrink-0 opacity-70" />
              {selectedLocation && <div className="w-1.5 h-1.5 bg-[#F6C445] rounded-full flex-shrink-0" />}
            </button>
            <ShareAllSocialButton className="p-2 sm:p-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white/90 dark:bg-gray-800/90 text-gray-700 dark:text-gray-300 transition-all hover:scale-105 active:scale-95 shadow-sm">
              <Heart size={16} />
            </ShareAllSocialButton>
          </div>
        </div>
      </div>

      {/* Contenu */}
      <div className="px-3 sm:px-4 max-w-7xl mx-auto pt-4 sm:pt-6">
        {loading || !signalsLoaded ? (
          <div className="space-y-6 sm:space-y-8">
            <div className="h-24 sm:h-32 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-2xl animate-pulse" />
            <ProductCardSkeletonGrid count={PAGE_SIZE} />
          </div>
        ) : (
          <>
            <div className="mb-6"><PopularProductsCarousel products={products} /></div>
            <div className="mb-4 sm:mb-6">
              <div className="flex items-start justify-between mb-4 gap-4">
                <div className="min-w-0 flex-1">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                    {selectedLocation ? <span className="flex items-center gap-2"><MapPin size={20} className="text-[#F6C445] flex-shrink-0" /><span className="truncate">{selectedLocation}</span></span>
                      : userPosition ? <span className="flex items-center gap-2"><Crosshair size={20} className="text-[#F6C445] flex-shrink-0" /><span className="truncate">Près de {userLocationName}</span></span>
                      : <span className="flex items-center gap-2"><Sparkles size={20} className="text-[#F6C445] flex-shrink-0" /><span>Pour vous</span></span>}
                  </h2>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <span>{scoredFeed.length} produit{scoredFeed.length > 1 ? "s" : ""}</span>
                    {!selectedLocation && userPosition && !locationLoading && <><span>•</span><span className="flex items-center gap-1"><Navigation size={12} /><span>Triés par proximité & préférences</span></span></>}
                  </div>
                </div>
                {(priceRange || selectedLocation) && (
                  <button onClick={() => { setPriceRange(null); setSelectedLocation(null); setSelectedIndex(0); }} className="text-xs sm:text-sm text-[#F6C445] font-medium px-3 py-1.5 bg-[#F6C445]/10 rounded-lg hover:bg-[#F6C445]/20 flex-shrink-0">
                    Effacer
                  </button>
                )}
              </div>
            </div>

            {scoredFeed.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center px-4">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-2xl flex items-center justify-center mb-4"><Sparkles size={24} className="text-gray-400" /></div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">Aucun produit trouvé</h3>
                <p className="text-gray-500 text-sm mb-6 max-w-xs">Essayez une autre zone ou modifiez vos filtres.</p>
                <button onClick={() => { setPriceRange(null); setSelectedLocation(null); }} className="px-6 py-3 bg-gradient-to-r from-[#F6C445] to-[#FFD700] text-[#1C2B49] font-bold rounded-xl">Voir tous les produits</button>
              </div>
            ) : (
              <>
                {/* Grille — produits réels + skeletons en bas pendant le chargement */}
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
                  {visibleItems.map(({ product, score, distance }, index) => (
                    <div key={`${product.id}-${index}`} className="animate-fade-in-up relative" style={{ animationDelay: `${(index % PAGE_SIZE) * 30}ms`, animationFillMode: "both" }}>
                      {distance !== null && distance <= 2 && (
                        <div className="absolute -top-1 -right-1 z-10 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full shadow-lg flex items-center gap-1">
                          <Crosshair size={8} /><span>{distance.toFixed(1)}km</span>
                        </div>
                      )}
                      {score >= 60 && (distance === null || distance > 2) && (
                        <div className="absolute top-2 left-2 z-10 bg-[#F6C445] text-[#1C2B49] text-xs px-2 py-0.5 rounded-full shadow font-bold">⭐ Top</div>
                      )}
                      <ProductCard product={{ ...product, distance }} userId={userId} />
                    </div>
                  ))}

                  {/* Skeletons pendant le chargement de la prochaine tranche */}
                  {isLoadingMore && Array.from({ length: PAGE_SIZE }).map((_, i) => (
                    <ProductCardSkeleton key={`sk-${i}`} />
                  ))}
                </div>

                {/*
                  SENTINELLE — toujours présente dans le DOM, toujours observée.
                  Elle doit être APRÈS la grille pour que l'observer se déclenche
                  quand l'utilisateur approche de la fin.
                */}
                <div ref={sentinelRef} className="h-1 w-full mt-2" aria-hidden="true" />

                {/* Message fin de feed */}
                {!hasMore && !isLoadingMore && scoredFeed.length > PAGE_SIZE && (
                  <div className="flex flex-col items-center py-10 text-center">
                    <div className="w-10 h-10 bg-[#F6C445]/10 rounded-full flex items-center justify-center mb-3">
                      <Sparkles size={18} className="text-[#F6C445]" />
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Vous avez tout vu — {scoredFeed.length} produits</p>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>

      <Dialog open={filterOpen} onOpenChange={setFilterOpen}>
        <DialogContent className="w-[95vw] max-w-md mx-auto rounded-3xl p-0 overflow-hidden border-0 shadow-2xl">
          <PriceFilter onChange={(r) => { setPriceRange(r); setFilterOpen(false); }} selectedIndex={selectedIndex} onSelect={setSelectedIndex} onClose={() => setFilterOpen(false)} />
        </DialogContent>
      </Dialog>
      <Dialog open={locationFilterOpen} onOpenChange={setLocationFilterOpen}>
        <DialogContent className="w-[95vw] max-w-md mx-auto rounded-3xl p-0 overflow-hidden border-0 shadow-2xl max-h-[90vh]">
          <LocationFilter />
        </DialogContent>
      </Dialog>

      <BackToTopButton />

      <style jsx>{`
        @keyframes fade-in-up { 0% { opacity:0; transform:translateY(12px); } 100% { opacity:1; transform:translateY(0); } }
        .animate-fade-in-up { animation: fade-in-up 0.4s cubic-bezier(0.16,1,0.3,1); }
        .touch-manipulation { touch-action:manipulation; -webkit-tap-highlight-color:transparent; }
        .overflow-y-auto::-webkit-scrollbar { width:4px; }
        .overflow-y-auto::-webkit-scrollbar-thumb { background:#f6c445; border-radius:2px; }
        button:focus-visible { outline:2px solid #f6c445; outline-offset:2px; }
      `}</style>
    </div>
  );
}