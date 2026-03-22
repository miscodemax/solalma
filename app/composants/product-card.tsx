"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import LikeButton from "./likeButton";
import { createClient } from "@/lib/supabase";

type Product = {
  id: number;
  title: string;
  description: string;
  price: number;
  image_url: string | string[] | null;
  images?: string[];
  user_id: string;
  zone?: string;
  created_at?: string;
  in_stock?: boolean;
  has_promo?: boolean;
  promo_price?: number;
  promo_percentage?: number;
  promo_expiration?: string;
  clicks?: number;
  has_wholesale?: boolean;
  wholesale_price?: number;
  min_wholesale_qty?: number;
  category?: string;
  whatsapp_number?: string;
  latitude?: number;
  longitude?: number;
  restock_date?: string;
  // injectés par le feed
  distance?: number | null;
};

export default function ProductCard({
  product,
  userId,
}: {
  product: Product;
  userId?: string;
}) {
  const supabase = createClient();

  const [imageLoaded, setImageLoaded] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [likeCount, setLikeCount] = useState(0);
  const [viewerCount, setViewerCount] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [justLiked, setJustLiked] = useState(false);
  const slideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const inStock = product.in_stock !== false;
  const hasPromo = inStock && product.has_promo && product.promo_price;
  const economy = hasPromo ? product.price - (product.promo_price || 0) : 0;

  // ── Images ──────────────────────────────────────────────────────────────────
  const allImages: string[] = (() => {
    const list: string[] = [];
    if (Array.isArray(product.images))
      list.push(...product.images.filter(Boolean));
    if (Array.isArray(product.image_url))
      list.push(...(product.image_url as string[]).filter(Boolean));
    else if (typeof product.image_url === "string" && product.image_url)
      list.push(product.image_url);
    const unique = [...new Set(list)];
    return unique.length > 0 ? unique : ["/placeholder.jpg"];
  })();

  // ── Charger le nb de likes + faux "en train de regarder" ────────────────────
  useEffect(() => {
    async function fetchStats() {
      const { count } = await supabase
        .from("product_like")
        .select("*", { count: "exact", head: true })
        .eq("product_id", product.id);
      setLikeCount(count ?? 0);
    }
    fetchStats();
    // Simuler des viewers actifs (1–6) pour le signal social
    setViewerCount(Math.floor(Math.random() * 6) + 1);
  }, [product.id]);

  // ── Slide auto au hover ──────────────────────────────────────────────────────
  useEffect(() => {
    if (isHovered && allImages.length > 1) {
      slideTimer.current = setTimeout(() => {
        setCurrentImageIndex((i) => (i + 1) % allImages.length);
      }, 1200);
    } else {
      setCurrentImageIndex(0);
    }
    return () => {
      if (slideTimer.current) clearTimeout(slideTimer.current);
    };
  }, [isHovered, currentImageIndex, allImages.length]);

  // ── Badges ──────────────────────────────────────────────────────────────────
  const isNew = (() => {
    if (!product.created_at) return false;
    return (
      (Date.now() - new Date(product.created_at).getTime()) / 86_400_000 <= 7
    );
  })();

  const isHot = (product.clicks ?? 0) > 100 || likeCount > 20;
  const isVeryPopular = (product.clicks ?? 0) > 300 || likeCount > 50;

  const promoEndsIn = (() => {
    if (!product.promo_expiration) return null;
    const diff = new Date(product.promo_expiration).getTime() - Date.now();
    if (diff <= 0) return null;
    const h = Math.floor(diff / 3_600_000);
    if (h < 24) return `${h}h`;
    return `${Math.floor(h / 24)}j`;
  })();

  const restockIn = (() => {
    if (inStock || !product.restock_date) return null;
    const diff = new Date(product.restock_date).getTime() - Date.now();
    if (diff <= 0) return null;
    return `${Math.ceil(diff / 86_400_000)}j`;
  })();

  const truncate = (t: string, w: number) => {
    const words = t.split(" ");
    return words.length <= w ? t : words.slice(0, w).join(" ") + "…";
  };

  // ── Formatage clics ──────────────────────────────────────────────────────────
  const fmtClicks = (n: number) =>
    n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);

  return (
    <article
      className={`group relative w-full flex flex-col overflow-hidden rounded-3xl transition-all duration-500
        ${
          !inStock
            ? "bg-gray-100 dark:bg-gray-800/80 opacity-85 border border-gray-300 dark:border-gray-700"
            : "bg-white dark:bg-gradient-to-br dark:from-[#1a1f35] dark:to-[#141929] border border-gray-100 dark:border-gray-800 hover:border-[#F6C445]/50 shadow-md hover:shadow-2xl hover:shadow-[#F6C445]/15 hover:-translate-y-2 active:translate-y-0"
        }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Shine hover */}
      {inStock && (
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/[0.03] to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none z-10" />
      )}

      {/* ── IMAGE ─────────────────────────────────────────────────────────────── */}
      <div className="relative w-full aspect-square overflow-hidden bg-gray-100 dark:bg-gray-800">
        <Link
          href={`/product/${product.id}`}
          className={`block w-full h-full ${!inStock ? "pointer-events-none" : ""}`}
        >
          {!imageLoaded && (
            <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700" />
          )}

          {/* Images avec transition crossfade */}
          {allImages.map((src, i) => (
            <Image
              key={src}
              src={src}
              alt={product.title}
              fill
              className={`object-cover transition-all duration-700 absolute inset-0
                ${i === currentImageIndex ? "opacity-100" : "opacity-0"}
                ${!imageLoaded && i === 0 ? "opacity-0" : ""}
                ${inStock ? "group-hover:scale-105" : "grayscale"}
              `}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              priority={false}
              onLoad={() => i === 0 && setImageLoaded(true)}
            />
          ))}

          {/* Gradient overlay */}
          {inStock && (
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          )}
        </Link>

        {/* Dots navigation images */}
        {allImages.length > 1 && isHovered && (
          <div className="absolute bottom-10 left-0 right-0 flex justify-center gap-1 z-30">
            {allImages.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentImageIndex(i)}
                className={`transition-all duration-300 rounded-full ${i === currentImageIndex ? "w-4 h-1.5 bg-white" : "w-1.5 h-1.5 bg-white/50"}`}
              />
            ))}
          </div>
        )}

        {/* Rupture stock */}
        {!inStock && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex flex-col items-center justify-center z-20 gap-2">
            <div className="flex items-center gap-2 px-4 py-2.5 bg-white/10 border border-white/30 rounded-2xl backdrop-blur-md">
              <svg
                className="w-4 h-4 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
              <span className="font-extrabold text-white text-xs tracking-wide">
                RUPTURE DE STOCK
              </span>
            </div>
            {restockIn && (
              <span className="text-[10px] text-white/70 font-medium">
                Retour dans {restockIn}
              </span>
            )}
          </div>
        )}

        {/* Badge PROMO */}
        {hasPromo && (
          <div className="absolute top-3 left-3 z-20 flex flex-col gap-1">
            <div className="relative px-2.5 py-1 rounded-xl text-xs font-black text-white bg-gradient-to-r from-red-500 to-orange-500 shadow-lg shadow-red-500/40">
              -{product.promo_percentage}%
              <div className="absolute inset-0 bg-white/20 rounded-xl animate-ping opacity-50" />
            </div>
            {promoEndsIn && (
              <div className="px-2 py-0.5 rounded-lg bg-black/70 backdrop-blur-sm text-[9px] font-bold text-orange-300 flex items-center gap-1">
                <span>⏱</span>
                {promoEndsIn} restant
              </div>
            )}
          </div>
        )}

        {/* Badge NEW */}
        {isNew && !hasPromo && (
          <div className="absolute top-3 left-3 z-20 px-2.5 py-1 rounded-xl text-xs font-black text-white bg-gradient-to-r from-emerald-500 to-teal-500 shadow-md shadow-emerald-500/40">
            ✦ NOUVEAU
          </div>
        )}

        {/* Badge 🔥 HOT / POPULAIRE */}
        {isVeryPopular && !hasPromo && !isNew && (
          <div className="absolute top-3 left-3 z-20 px-2.5 py-1 rounded-xl text-xs font-black text-white bg-gradient-to-r from-orange-500 to-red-500 shadow-md shadow-orange-500/40 flex items-center gap-1">
            🔥 POPULAIRE
          </div>
        )}
        {isHot && !isVeryPopular && !hasPromo && !isNew && (
          <div className="absolute top-3 left-3 z-20 px-2.5 py-1 rounded-xl text-xs font-black text-white bg-gradient-to-r from-amber-400 to-orange-400 shadow-md flex items-center gap-1">
            🔥 TENDANCE
          </div>
        )}

        {/* Like button */}
        <div className="absolute top-3 right-3 z-20">
          <div
            className="bg-white/90 dark:bg-black/50 backdrop-blur-md rounded-full p-1.5 shadow-lg transition-transform duration-200 hover:scale-110"
            onClick={() => setJustLiked(true)}
          >
            <LikeButton productId={product.id} userId={userId} />
          </div>
        </div>

        {/* Compteur d'images */}
        {allImages.length > 1 && !isHovered && (
          <div className="absolute bottom-3 right-3 z-20 flex items-center gap-1 px-2 py-1 bg-black/60 backdrop-blur-md rounded-full">
            <svg
              className="w-3 h-3 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span className="text-[10px] font-bold text-white">
              {allImages.length}
            </span>
          </div>
        )}

        {/* Badge distance */}
        {product.distance != null && product.distance <= 10 && (
          <div className="absolute bottom-3 left-3 z-20 flex items-center gap-1 px-2 py-1 bg-green-500/90 backdrop-blur-md rounded-full">
            <svg
              className="w-3 h-3 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
            </svg>
            <span className="text-[10px] font-bold text-white">
              {product.distance.toFixed(1)} km
            </span>
          </div>
        )}

        {/* Barre de popularité en bas de l'image (visible au hover) */}
        {inStock && isHovered && (product.clicks ?? 0) > 0 && (
          <div className="absolute bottom-0 left-0 right-0 z-20 px-3 pb-2 pt-6 bg-gradient-to-t from-black/70 to-transparent">
            <div className="flex items-center justify-between text-[10px] text-white/90 mb-1">
              <span>Popularité</span>
              <span>{fmtClicks(product.clicks ?? 0)} vues</span>
            </div>
            <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#F6C445] to-orange-400 rounded-full transition-all duration-700"
                style={{
                  width: `${Math.min(100, ((product.clicks ?? 0) / 500) * 100)}%`,
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* ── CONTENU ────────────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col p-3 sm:p-4 gap-2">
        {/* Titre */}
        <Link
          href={`/product/${product.id}`}
          className={!inStock ? "pointer-events-none" : ""}
        >
          <h3 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white line-clamp-2 leading-snug min-h-[2.4rem] group-hover:text-[#F6C445] transition-colors duration-300">
            {product.title}
          </h3>
        </Link>

        {/* Zone + catégorie */}
        <div className="flex items-center gap-2 flex-wrap">
          {product.zone && (
            <span className="flex items-center gap-1 text-[10px] font-semibold text-[#F6C445]">
              <svg
                className="w-3 h-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              {product.zone}
            </span>
          )}
          {product.category && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 font-medium capitalize">
              {product.category}
            </span>
          )}
        </div>

        {/* ── Signaux sociaux ─────────────────────────────────────────────────── */}
        <div className="flex items-center gap-3 text-[11px] text-gray-500 dark:text-gray-400">
          {/* Likes */}
          <span className="flex items-center gap-1">
            <svg
              className={`w-3.5 h-3.5 transition-colors ${likeCount > 0 ? "text-red-500 fill-red-500" : "text-gray-400"}`}
              viewBox="0 0 24 24"
              stroke="currentColor"
              fill="none"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
            <span
              className={`font-semibold ${likeCount > 0 ? "text-red-500" : ""}`}
            >
              {likeCount}
            </span>
          </span>

          {/* Vues */}
          {(product.clicks ?? 0) > 0 && (
            <span className="flex items-center gap-1">
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
              <span className="font-semibold">
                {fmtClicks(product.clicks ?? 0)}
              </span>
            </span>
          )}

          {/* Viewers actifs */}
          {inStock && viewerCount > 1 && (
            <span className="flex items-center gap-1 text-green-500 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse inline-block" />
              {viewerCount} regardent
            </span>
          )}
        </div>

        {/* Prix wholesale */}
        {product.has_wholesale &&
          product.wholesale_price &&
          product.min_wholesale_qty && (
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
              <svg
                className="w-3 h-3 text-blue-500 flex-shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                />
              </svg>
              <span className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold">
                Gros dès {product.min_wholesale_qty} pcs —{" "}
                {Number(product.wholesale_price).toLocaleString()} FCFA/u
              </span>
            </div>
          )}

        {/* Section prix + CTA */}
        <div className="flex items-end justify-between gap-2 mt-auto pt-1">
          {/* Prix */}
          {hasPromo ? (
            <div className="flex flex-col gap-0.5">
              <div className="flex items-baseline gap-1.5">
                <span className="text-base sm:text-lg font-black text-red-500 dark:text-orange-400">
                  {Number(product.promo_price).toLocaleString()}
                </span>
                <span className="text-xs text-gray-400 line-through">
                  {product.price.toLocaleString()}
                </span>
              </div>
              <span className="text-[10px] font-bold text-white bg-green-500 px-1.5 py-0.5 rounded-md w-fit">
                -{economy.toLocaleString()} FCFA
              </span>
            </div>
          ) : (
            <div className="flex flex-col">
              <span className="text-base sm:text-lg font-black text-gray-900 dark:text-white">
                {product.price.toLocaleString()}
              </span>
              <span className="text-[10px] font-semibold text-gray-400 tracking-wider">
                FCFA
              </span>
            </div>
          )}

          {/* Bouton VOIR */}
          <Link
            href={`/product/${product.id}`}
            className={`relative flex items-center gap-1.5 px-3 sm:px-4 py-2.5 rounded-2xl text-xs font-black transition-all duration-300 overflow-hidden touch-manipulation
              ${
                !inStock
                  ? "bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed"
                  : "text-[#1C2B49] bg-gradient-to-r from-[#F6C445] to-[#FFD700] shadow-md hover:shadow-xl hover:shadow-[#F6C445]/40 hover:scale-105 active:scale-95"
              }`}
          >
            <span className="relative z-10 tracking-wide">VOIR</span>
            <svg
              className="relative z-10 w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
            {inStock && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            )}
          </Link>
        </div>
      </div>

      {/* Barre accent bas */}
      {inStock && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#F6C445] to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-center" />
      )}
    </article>
  );
}
