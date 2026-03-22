import ProductCard from "../composants/product-card";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { supabaseUrl, supabaseKey } from "@/lib/supabase";
import AuthModal from "../composants/auth-modal";
import Link from "next/link";
import FollowButton from "../composants/FollowButton";
import {
  computeSellerRank,
  computeSellerBadges,
  rankLabel,
  rankColor,
  nextRankThreshold,
  type SellerStats,
} from "@/lib/sellerRank";
import {
  FaHeart,
  FaStore,
  FaShoppingBag,
  FaSearch,
  FaFilter,
  FaStar,
  FaCrown,
  FaGift,
  FaChartLine,
  FaUsers,
  FaShieldAlt,
  FaShare,
  FaSort,
  FaEye,
  FaFire,
  FaGem,
} from "react-icons/fa";

export default async function FavoritesPage() {
  const cookieStore = await cookies();
  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: { get: (name) => cookieStore.get(name)?.value },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F9F9F9] to-[#F3F4F6] dark:from-[#1C1C1C] dark:to-[#2a2a2a]">
        <AuthModal />
      </div>
    );
  }

  const { data: likes } = await supabase
    .from("product_like")
    .select("*")
    .eq("user_id", user.id);
  const productIds = likes?.map((l) => l.product_id) ?? [];

  let products: any[] = [];
  if (productIds.length > 0) {
    const { data } = await supabase
      .from("product")
      .select("*")
      .in("id", productIds);
    products = data || [];
  }

  const sellerIds = [
    ...new Set(products.map((p) => p.user_id).filter(Boolean)),
  ];

  const { data: sellerProfiles } =
    sellerIds.length > 0
      ? await supabase
          .from("profiles")
          .select("id, username, avatar_url, full_name, is_verified")
          .in("id", sellerIds)
      : { data: [] };

  const { data: currentFollows } = await supabase
    .from("follows")
    .select("following_id")
    .eq("follower_id", user.id);
  const followedIds = new Set(
    (currentFollows ?? []).map((f) => f.following_id),
  );

  const { data: followerCounts } =
    sellerIds.length > 0
      ? await supabase
          .from("follows")
          .select("following_id")
          .in("following_id", sellerIds)
      : { data: [] };
  const followerCountMap: Record<string, number> = {};
  (followerCounts ?? []).forEach(({ following_id }) => {
    followerCountMap[following_id] = (followerCountMap[following_id] ?? 0) + 1;
  });

  // ── Avis par vendeur ────────────────────────────────────────────────────────
  const { data: allRatings } =
    sellerIds.length > 0
      ? await supabase
          .from("seller_ratings")
          .select("seller_id, rating")
          .in("seller_id", sellerIds)
      : { data: [] };

  const ratingMap: Record<string, { sum: number; count: number }> = {};
  (allRatings ?? []).forEach(({ seller_id, rating }) => {
    if (!ratingMap[seller_id]) ratingMap[seller_id] = { sum: 0, count: 0 };
    ratingMap[seller_id].sum += rating;
    ratingMap[seller_id].count++;
  });

  const sellerMap = Object.fromEntries(
    (sellerProfiles ?? []).map((s: any) => {
      const rd = ratingMap[s.id] ?? { sum: 0, count: 0 };
      const avgRating = rd.count > 0 ? rd.sum / rd.count : 0;
      const stats: SellerStats = {
        reviewCount: rd.count,
        avgRating,
        totalSales: rd.count,
        responseRateH24: false,
        fastDelivery: false,
        fairPricing: false,
        isAdminVerified: s.is_verified ?? false,
      };
      const rank = computeSellerRank(stats);
      const badges = computeSellerBadges(stats);
      const colors = rankColor(rank);
      const next = nextRankThreshold(rank);
      return [
        s.id,
        {
          ...s,
          isFollowed: followedIds.has(s.id),
          followerCount: followerCountMap[s.id] ?? 0,
          reviewCount: rd.count,
          avgRating,
          rank,
          rankLabel: rankLabel(rank),
          badges,
          colors,
          nextThreshold: next,
        },
      ];
    }),
  );

  const id = user?.id || null;
  const totalValue = products.reduce((sum, p) => sum + (p.price || 0), 0);
  const categories = [...new Set(products.map((p) => p.category))].length;
  const avgPrice = products.length > 0 ? totalValue / products.length : 0;
  const premiumItems = products.filter((p) => p.price > 50000).length;

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#F9F9F9] via-white to-[#F3F4F6] dark:from-[#1C1C1C] dark:via-[#2a2a2a] dark:to-[#1C1C1C] relative overflow-hidden pt-9">
      <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, #F4B400 1px, transparent 1px), radial-gradient(circle at 75% 75%, #FFD766 1px, transparent 1px)`,
            backgroundSize: "24px 24px",
          }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 py-8 space-y-10">
        {/* Header */}
        <section className="relative">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
            <div className="flex-1 space-y-6">
              <div className="relative">
                <div className="absolute -top-4 -left-4 w-8 h-8 bg-gradient-to-r from-[#F4B400] to-[#FFD766] rounded-full blur-sm opacity-60 animate-pulse" />
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black bg-gradient-to-r from-[#F4B400] via-[#FFD766] to-[#F4B400] bg-clip-text text-transparent leading-tight">
                  Mes Favoris
                </h1>
                <div className="absolute -bottom-2 left-0 w-24 h-1 bg-gradient-to-r from-[#F4B400] to-transparent rounded-full" />
                {products.length > 0 && (
                  <div className="absolute -top-3 -right-3 bg-gradient-to-r from-[#F4B400] to-[#FFD766] text-white text-sm font-bold px-3 py-1.5 rounded-2xl shadow-lg animate-bounce">
                    {products.length}
                  </div>
                )}
              </div>
              <p className="text-lg text-[#1C1C1C] dark:text-gray-300 font-light max-w-2xl leading-relaxed">
                Collection personnelle de tes articles préférés sur Sangse
                Marketplace
              </p>

              {products.length > 0 && (
                <div className="flex flex-wrap gap-4">
                  <div className="group relative">
                    <div className="backdrop-blur-xl bg-white/90 dark:bg-[#2a2a2a]/90 border border-gray-200 dark:border-gray-600 px-6 py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer hover:scale-105 hover:border-[#F4B400]/30">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-r from-[#F4B400] to-[#FFD766] rounded-xl">
                          <FaChartLine className="text-white text-sm" />
                        </div>
                        <div>
                          <p className="text-xs font-medium text-[#1C1C1C] dark:text-gray-400">
                            Valeur collection
                          </p>
                          <p className="text-lg font-bold text-[#1C1C1C] dark:text-white">
                            {totalValue.toLocaleString()}{" "}
                            <span className="text-sm font-normal text-gray-500">
                              FCFA
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="absolute left-0 top-full mt-3 w-80 bg-white dark:bg-[#2a2a2a] rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-600 p-6 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-30">
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="p-3 bg-gradient-to-r from-[#F4B400] to-[#FFD766] rounded-2xl">
                            <FaGem className="text-white text-lg" />
                          </div>
                          <div>
                            <h4 className="font-bold text-[#1C1C1C] dark:text-white">
                              Analyse de collection
                            </h4>
                            <p className="text-sm text-gray-500">
                              Insights détaillés
                            </p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-[#F4B400]/10 p-4 rounded-2xl border border-[#F4B400]/30">
                            <p className="text-xs text-[#F4B400] font-medium mb-1">
                              Valeur totale
                            </p>
                            <p className="font-black text-xl text-[#1C1C1C] dark:text-white">
                              {totalValue.toLocaleString()}
                            </p>
                            <p className="text-xs text-gray-400">FCFA</p>
                          </div>
                          <div className="bg-[#FFD766]/10 p-4 rounded-2xl border border-[#FFD766]/30">
                            <p className="text-xs text-[#FFD766] font-medium mb-1">
                              Prix moyen
                            </p>
                            <p className="font-black text-xl text-[#1C1C1C] dark:text-white">
                              {Math.round(avgPrice).toLocaleString()}
                            </p>
                            <p className="text-xs text-gray-400">FCFA</p>
                          </div>
                        </div>
                        {premiumItems > 0 && (
                          <div className="bg-[#8B5E34]/10 p-4 rounded-2xl border border-[#8B5E34]/30">
                            <div className="flex items-center gap-2 mb-1">
                              <FaFire className="text-[#8B5E34]" />
                              <span className="text-sm font-semibold text-[#1C1C1C] dark:text-white">
                                Collection Premium
                              </span>
                            </div>
                            <p className="text-xs text-gray-500">
                              {premiumItems} articles premium dans ta collection
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="group relative">
                    <div className="backdrop-blur-xl bg-white/90 dark:bg-[#2a2a2a]/90 border border-gray-200 dark:border-gray-600 px-6 py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer hover:scale-105">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-r from-[#FFD766] to-[#F4B400] rounded-xl">
                          <FaFilter className="text-white text-sm" />
                        </div>
                        <div>
                          <p className="text-xs font-medium text-[#1C1C1C] dark:text-gray-400">
                            Catégories
                          </p>
                          <p className="text-lg font-bold text-[#1C1C1C] dark:text-white">
                            {categories}{" "}
                            <span className="text-sm font-normal text-gray-500">
                              types
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="absolute left-0 top-full mt-3 w-72 bg-white dark:bg-[#2a2a2a] rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-600 p-6 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-30">
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="p-3 bg-gradient-to-r from-[#FFD766] to-[#F4B400] rounded-2xl">
                            <FaStar className="text-white text-lg" />
                          </div>
                          <div>
                            <h4 className="font-bold text-[#1C1C1C] dark:text-white">
                              Tes préférences
                            </h4>
                            <p className="text-sm text-gray-500">
                              Par catégorie
                            </p>
                          </div>
                        </div>
                        <div className="space-y-2">
                          {[...new Set(products.map((p) => p.category))]
                            .slice(0, 4)
                            .map((cat, idx) => {
                              const count = products.filter(
                                (p) => p.category === cat,
                              ).length;
                              return (
                                <div key={idx} className="space-y-1">
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-[#1C1C1C] dark:text-gray-300">
                                      {cat || "Non catégorisé"}
                                    </span>
                                    <span className="text-xs bg-[#F4B400]/10 text-[#F4B400] px-2 py-0.5 rounded-full font-bold border border-[#F4B400]/20">
                                      {count}
                                    </span>
                                  </div>
                                  <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1.5">
                                    <div
                                      className="bg-gradient-to-r from-[#F4B400] to-[#FFD766] h-1.5 rounded-full"
                                      style={{
                                        width: `${Math.round((count / products.length) * 100)}%`,
                                      }}
                                    />
                                  </div>
                                </div>
                              );
                            })}
                        </div>
                      </div>
                    </div>
                  </div>

                  {premiumItems > 0 && (
                    <div className="backdrop-blur-xl bg-[#8B5E34]/10 border border-[#8B5E34]/40 px-6 py-4 rounded-2xl shadow-lg hover:scale-105 transition-all duration-300">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-[#8B5E34] rounded-xl">
                          <FaCrown className="text-white text-sm" />
                        </div>
                        <div>
                          <p className="text-xs font-medium text-[#1C1C1C] dark:text-gray-300">
                            Articles Premium
                          </p>
                          <p className="text-lg font-bold text-[#1C1C1C] dark:text-white">
                            {premiumItems}{" "}
                            <span className="text-sm font-normal">luxe</span>
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <Link
              href="/dashboard/products"
              className="inline-flex items-center gap-4 bg-gradient-to-r from-[#F4B400] via-[#FFD766] to-[#F4B400] hover:from-[#FFD766] hover:to-[#F4B400] text-white font-bold text-sm sm:text-base px-8 py-5 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 hover:-translate-y-1"
            >
              <div className="p-2 bg-white/20 rounded-2xl">
                <FaStore className="text-lg" />
              </div>
              <div>
                <div className="font-black">Vends tes articles</div>
                <div className="text-xs opacity-90">Inscription gratuite</div>
              </div>
              <div className="bg-[#8B5E34]/80 text-white px-3 py-1.5 rounded-full text-xs font-bold">
                ✨ Nouveau
              </div>
            </Link>
          </div>
        </section>

        {/* ── VENDEURS avec rangs & badges ────────────────────────────────────── */}
        {products.length > 0 && sellerIds.length > 0 && (
          <section className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-[#F4B400] rounded-full animate-pulse" />
              <h2 className="text-xl font-bold text-[#1C1C1C] dark:text-white">
                Vendeurs de tes favoris
              </h2>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {sellerIds.length} boutique{sellerIds.length > 1 ? "s" : ""}
              </span>
            </div>

            <div
              className="flex gap-4 overflow-x-auto pb-3"
              style={{ scrollbarWidth: "none" }}
            >
              {sellerIds.map((sellerId) => {
                const seller = sellerMap[sellerId];
                if (!seller) return null;
                const sellerProductCount = products.filter(
                  (p) => p.user_id === sellerId,
                ).length;
                const c = seller.colors;

                return (
                  <div
                    key={sellerId}
                    className="flex-shrink-0 w-60 bg-white dark:bg-[#2a2a2a] border border-gray-200 dark:border-gray-700 rounded-2xl p-4 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col gap-3"
                  >
                    {/* Avatar + nom */}
                    <Link
                      href={`/seller/${sellerId}`}
                      className="flex items-center gap-3 group"
                    >
                      <div className="relative flex-shrink-0">
                        {seller.avatar_url ? (
                          <img
                            src={seller.avatar_url}
                            alt={seller.username ?? ""}
                            className="w-12 h-12 rounded-full object-cover border-2 border-[#F4B400]/30 group-hover:border-[#F4B400] transition-colors"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#F4B400] to-[#FFD766] flex items-center justify-center">
                            <span className="text-white font-bold text-lg">
                              {(seller.username ??
                                seller.full_name ??
                                "?")[0].toUpperCase()}
                            </span>
                          </div>
                        )}
                        {/* Point coloré = rang */}
                        <div
                          className={`absolute -bottom-1 -right-1 w-4 h-4 ${c.dot} rounded-full border-2 border-white dark:border-[#2a2a2a]`}
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-sm text-[#1C1C1C] dark:text-white truncate group-hover:text-[#F4B400] transition-colors">
                          {seller.full_name ?? seller.username ?? "Vendeur"}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          @{seller.username ?? "profil"}
                        </p>
                      </div>
                    </Link>

                    {/* Pill de rang */}
                    <div
                      className={`inline-flex items-center gap-1.5 self-start px-2.5 py-1 rounded-full text-xs font-bold border ${c.bg} ${c.text} ${c.border}`}
                    >
                      <span className="text-[10px]">
                        {seller.rank === "verifie"
                          ? "✅"
                          : seller.rank === "elite"
                            ? "👑"
                            : seller.rank === "expert"
                              ? "⭐"
                              : seller.rank === "fiable"
                                ? "🛡️"
                                : seller.rank === "actif"
                                  ? "🟢"
                                  : "🔘"}
                      </span>
                      {seller.rankLabel}
                    </div>

                    {/* Note — masquée si < 5 avis */}
                    {seller.reviewCount >= 5 ? (
                      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <svg
                              key={star}
                              className={`w-3 h-3 ${star <= Math.round(seller.avgRating) ? "text-[#F4B400]" : "text-gray-300 dark:text-gray-600"}`}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                        <span className="font-medium">
                          {seller.avgRating.toFixed(1)}
                        </span>
                        <span>({seller.reviewCount} avis)</span>
                      </div>
                    ) : (
                      <p className="text-[10px] text-gray-400 italic">
                        {seller.reviewCount === 0
                          ? "Pas encore d'avis"
                          : `${seller.reviewCount} avis — note non publiée`}
                      </p>
                    )}

                    {/* Badges */}
                    {seller.badges.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {seller.badges.slice(0, 3).map((badge: any) => (
                          <span
                            key={badge.id}
                            title={badge.description}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600 cursor-help"
                          >
                            <span>{badge.icon}</span>
                            {badge.label}
                          </span>
                        ))}
                        {seller.badges.length > 3 && (
                          <span className="text-[10px] text-gray-400 self-center">
                            +{seller.badges.length - 3}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Progression rang — seulement si nouveau et pas encore à 5 avis */}
                    {seller.rank === "nouveau" && seller.nextThreshold && (
                      <div className="text-[10px] text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-xl px-2.5 py-2 space-y-1">
                        <p className="font-medium text-gray-500">
                          Prochain rang : {rankLabel(seller.nextThreshold.rank)}
                        </p>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1">
                          <div
                            className="bg-[#F4B400] h-1 rounded-full transition-all"
                            style={{
                              width: `${Math.min(100, (seller.reviewCount / seller.nextThreshold.minReviews) * 100)}%`,
                            }}
                          />
                        </div>
                        <p>
                          {seller.nextThreshold.minReviews - seller.reviewCount}{" "}
                          avis manquants
                        </p>
                      </div>
                    )}

                    {/* Stats */}
                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <FaShoppingBag className="text-[#F4B400]" />
                        {sellerProductCount} favori
                        {sellerProductCount > 1 ? "s" : ""}
                      </span>
                      <span className="flex items-center gap-1">
                        <FaUsers className="text-[#F4B400]" />
                        {seller.followerCount} abonné
                        {seller.followerCount > 1 ? "s" : ""}
                      </span>
                    </div>

                    <FollowButton
                      followerId={user.id}
                      followingId={sellerId}
                      initialFollowed={seller.isFollowed}
                    />
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Quick Actions */}
        {products.length > 0 && (
          <section className="backdrop-blur-xl bg-white/80 dark:bg-[#2a2a2a]/80 border border-gray-200 dark:border-gray-600 p-6 rounded-3xl shadow-lg">
            <div className="flex flex-wrap items-center justify-between gap-6">
              <div className="flex items-center gap-6">
                <h3 className="font-bold text-[#1C1C1C] dark:text-white flex items-center gap-2">
                  <div className="w-2 h-2 bg-[#F4B400] rounded-full animate-pulse" />
                  Actions rapides
                </h3>
                <div className="flex flex-wrap gap-3">
                  <button className="flex items-center gap-2 bg-[#F4B400]/10 text-[#F4B400] px-4 py-2.5 rounded-xl border border-[#F4B400]/20 hover:bg-[#F4B400]/20 transition-all hover:scale-105">
                    <FaSort className="text-sm" />
                    <span className="text-sm font-medium">Trier</span>
                  </button>
                  <button className="flex items-center gap-2 bg-[#FFD766]/10 text-[#FFD766] px-4 py-2.5 rounded-xl border border-[#FFD766]/20 hover:bg-[#FFD766]/20 transition-all hover:scale-105">
                    <FaShare className="text-sm" />
                    <span className="text-sm font-medium">Partager</span>
                  </button>
                  <button className="flex items-center gap-2 bg-[#8B5E34]/10 text-[#8B5E34] px-4 py-2.5 rounded-xl border border-[#8B5E34]/20 hover:bg-[#8B5E34]/20 transition-all hover:scale-105">
                    <FaEye className="text-sm" />
                    <span className="text-sm font-medium">Vue liste</span>
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-6 text-sm text-[#1C1C1C] dark:text-gray-400">
                <div className="flex items-center gap-2">
                  <FaShoppingBag className="text-[#F4B400]" />
                  <span className="font-medium">
                    {products.length} articles
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <FaGem className="text-[#8B5E34]" />
                  <span className="font-medium">
                    {totalValue.toLocaleString()} FCFA
                  </span>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Grille / état vide */}
        {products.length === 0 ? (
          <div className="text-center py-20 space-y-12">
            <div className="relative w-40 h-40 mx-auto">
              <div className="absolute inset-0 bg-gradient-to-r from-[#F4B400]/20 via-[#FFD766]/20 to-[#F4B400]/20 rounded-full animate-pulse" />
              <div className="absolute inset-8 bg-white dark:bg-[#2a2a2a] rounded-full flex items-center justify-center border-4 border-gray-200 dark:border-gray-600">
                <FaHeart className="text-5xl text-gray-300 dark:text-gray-600 animate-pulse" />
              </div>
              <div className="absolute top-4 right-4 w-4 h-4 bg-[#F4B400] rounded-full animate-ping" />
              <div className="absolute bottom-6 left-6 w-3 h-3 bg-[#FFD766] rounded-full animate-ping" />
            </div>
            <div className="space-y-4">
              <h2 className="text-3xl sm:text-4xl font-black text-[#1C1C1C] dark:text-white">
                Ta collection attend tes premiers coups de cœur
              </h2>
              <p className="text-lg text-[#1C1C1C] dark:text-gray-400 max-w-2xl mx-auto">
                Explore notre marketplace et ajoute tes articles préférés en
                cliquant sur le cœur ❤️
              </p>
            </div>
            <Link
              href="/"
              className="group inline-flex items-center gap-4 bg-[#1C1C1C] dark:bg-gray-700 text-white font-bold px-10 py-5 rounded-3xl shadow-2xl hover:scale-105 hover:-translate-y-1 transition-all duration-500"
            >
              <div className="p-3 bg-white/10 rounded-2xl group-hover:bg-white/20 transition-colors">
                <FaSearch className="text-xl" />
              </div>
              <div>
                <div className="text-lg font-black">Découvrir les articles</div>
                <div className="text-sm opacity-80">
                  +50 produits disponibles
                </div>
              </div>
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {products.map((product, index) => (
                <div key={product.id + index}>
                  <ProductCard product={product} userId={id} />
                </div>
              ))}
            </div>
            <div className="text-center py-16">
              <div className="backdrop-blur-xl bg-[#F4B400]/5 border border-[#F4B400]/20 p-10 rounded-3xl max-w-4xl mx-auto">
                <h3 className="text-2xl sm:text-3xl font-bold text-[#1C1C1C] dark:text-white mb-6">
                  🎯 Continue ton shopping !
                </h3>
                <p className="text-gray-500 mb-8 max-w-2xl mx-auto text-lg">
                  Tu as du goût ! Découvre encore plus d&apos;articles ou
                  partage tes propres trouvailles.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    href="/"
                    className="inline-flex items-center gap-3 bg-white dark:bg-[#2a2a2a] text-[#1C1C1C] dark:text-white font-semibold px-8 py-4 rounded-2xl border border-gray-200 dark:border-gray-600 hover:bg-gray-50 transition-all shadow-lg hover:scale-105"
                  >
                    <FaSearch className="text-lg" /> Découvrir plus
                    d&apos;articles
                  </Link>
                  <Link
                    href="/dashboard/add"
                    className="inline-flex items-center gap-3 bg-gradient-to-r from-[#F4B400] to-[#FFD766] text-white font-semibold px-8 py-4 rounded-2xl shadow-lg hover:scale-105 transition-all"
                  >
                    <FaStore className="text-lg" /> Vendre mes articles
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
