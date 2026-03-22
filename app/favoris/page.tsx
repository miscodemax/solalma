import ProductCard from "../composants/product-card";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { supabaseUrl, supabaseKey } from "@/lib/supabase";
import AuthModal from "../composants/auth-modal";
import Link from "next/link";
import FollowButton from "../composants/FollowButton";
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
    cookies: {
      get: (name) => cookieStore.get(name)?.value,
    },
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

  // Récupère les likes
  const { data: likes } = await supabase
    .from("product_like")
    .select("*")
    .eq("user_id", user.id);

  const productIds = likes?.map((like) => like.product_id);

  // Récupère les produits likés
  let products: any[] = [];
  if (productIds && productIds.length > 0) {
    const { data } = await supabase
      .from("product")
      .select("*")
      .in("id", productIds);
    products = data || [];
  }

  // Récupère les vendeurs uniques des produits likés
  const sellerIds = [
    ...new Set(products.map((p) => p.user_id).filter(Boolean)),
  ];

  // Profils des vendeurs
  const { data: sellerProfiles } =
    sellerIds.length > 0
      ? await supabase
          .from("profiles")
          .select("id, username, avatar_url, full_name")
          .in("id", sellerIds)
      : { data: [] };

  // Abonnements actuels de l'utilisateur
  const { data: currentFollows } = await supabase
    .from("follows")
    .select("following_id")
    .eq("follower_id", user.id);

  const followedIds = new Set(
    (currentFollows ?? []).map((f) => f.following_id),
  );

  // Nombre d'abonnés par vendeur
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

  // Map vendeur_id → profil enrichi
  const sellerMap = Object.fromEntries(
    (sellerProfiles ?? []).map((s) => [
      s.id,
      {
        ...s,
        isFollowed: followedIds.has(s.id),
        followerCount: followerCountMap[s.id] ?? 0,
      },
    ]),
  );

  const id = user?.id || null;

  // Statistiques
  const totalValue = products.reduce((sum, p) => sum + (p.price || 0), 0);
  const categories = [...new Set(products.map((p) => p.category))].length;
  const avgPrice = products.length > 0 ? totalValue / products.length : 0;
  const premiumItems = products.filter((p) => p.price > 50000).length;

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#F9F9F9] via-white to-[#F3F4F6] dark:from-[#1C1C1C] dark:via-[#2a2a2a] dark:to-[#1C1C1C] relative overflow-hidden pt-9">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, #F4B400 1px, transparent 1px), 
                             radial-gradient(circle at 75% 75%, #FFD766 1px, transparent 1px)`,
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
                  {/* Stat valeur */}
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
                            <p className="text-sm text-gray-500 dark:text-gray-400">
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

                  {/* Stat catégories */}
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
                              const pct = Math.round(
                                (count / products.length) * 100,
                              );
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
                                      style={{ width: `${pct}%` }}
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
                    <div className="backdrop-blur-xl bg-[#8B5E34]/10 border border-[#8B5E34]/40 px-6 py-4 rounded-2xl shadow-lg hover:scale-105 transition-all duration-300 cursor-default">
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

        {/* ── SECTION VENDEURS LIKÉS ─────────────────────────────────────────── */}
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

            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
              {sellerIds.map((sellerId) => {
                const seller = sellerMap[sellerId];
                if (!seller) return null;
                const sellerProductCount = products.filter(
                  (p) => p.user_id === sellerId,
                ).length;

                return (
                  <div
                    key={sellerId}
                    className="flex-shrink-0 w-56 bg-white dark:bg-[#2a2a2a] border border-gray-200 dark:border-gray-700 rounded-2xl p-4 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                  >
                    {/* Avatar + nom */}
                    <Link
                      href={`/seller/${sellerId}`}
                      className="flex items-center gap-3 mb-4 group"
                    >
                      <div className="relative">
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
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white dark:border-[#2a2a2a]" />
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

                    {/* Stats */}
                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-4">
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

                    {/* Bouton abonnement */}
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

        {/* Grille produits / état vide */}
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
            <div className="space-y-8">
              <Link
                href="/"
                className="group inline-flex items-center gap-4 bg-[#1C1C1C] dark:bg-gray-700 text-white font-bold px-10 py-5 rounded-3xl shadow-2xl hover:scale-105 hover:-translate-y-1 transition-all duration-500"
              >
                <div className="p-3 bg-white/10 rounded-2xl group-hover:bg-white/20 transition-colors">
                  <FaSearch className="text-xl" />
                </div>
                <div>
                  <div className="text-lg font-black">
                    Découvrir les articles
                  </div>
                  <div className="text-sm opacity-80">
                    +50 produits disponibles
                  </div>
                </div>
              </Link>
              <div className="mt-20 max-w-4xl mx-auto">
                <div className="relative bg-gradient-to-r from-[#F4B400] via-[#FFD766] to-[#F4B400] p-1 rounded-3xl shadow-2xl">
                  <div className="bg-white dark:bg-[#2a2a2a] p-10 rounded-3xl text-center space-y-8">
                    <div className="relative w-20 h-20 mx-auto">
                      <div className="w-20 h-20 bg-gradient-to-r from-[#F4B400] to-[#FFD766] rounded-3xl flex items-center justify-center shadow-lg">
                        <FaCrown className="text-3xl text-white" />
                      </div>
                      <div className="absolute -top-2 -right-2 w-8 h-8 bg-[#8B5E34] rounded-full flex items-center justify-center">
                        <span className="text-xs text-white">✨</span>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-3xl font-black bg-gradient-to-r from-[#F4B400] to-[#FFD766] bg-clip-text text-transparent mb-3">
                        Deviens vendeur Sangse
                      </h3>
                      <p className="text-lg text-gray-500 max-w-2xl mx-auto">
                        Transforme tes objets en revenus ! Rejoins notre
                        communauté de vendeurs.
                      </p>
                    </div>
                    <div className="grid sm:grid-cols-3 gap-6">
                      {[
                        {
                          icon: FaGift,
                          label: "Gratuit",
                          desc: "Inscription sans frais",
                          bg: "from-[#F4B400] to-[#F4B400]",
                        },
                        {
                          icon: FaUsers,
                          label: "Communauté",
                          desc: "Milliers d'acheteurs",
                          bg: "from-[#FFD766] to-[#FFD766]",
                        },
                        {
                          icon: FaShieldAlt,
                          label: "Sécurisé",
                          desc: "Transactions protégées",
                          bg: "from-[#8B5E34] to-[#8B5E34]",
                        },
                      ].map((f, i) => (
                        <div key={i} className="space-y-3">
                          <div
                            className={`w-16 h-16 bg-gradient-to-r ${f.bg} rounded-2xl flex items-center justify-center mx-auto`}
                          >
                            <f.icon className="text-2xl text-white" />
                          </div>
                          <div>
                            <p className="font-bold text-[#1C1C1C] dark:text-white">
                              {f.label}
                            </p>
                            <p className="text-sm text-gray-400">{f.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <Link
                      href="/dashboard/add"
                      className="inline-flex items-center gap-4 bg-gradient-to-r from-[#F4B400] to-[#FFD766] text-white font-bold px-10 py-5 rounded-3xl shadow-xl hover:scale-105 transition-all"
                    >
                      <FaStore className="text-xl" />
                      <span>Commencer à vendre</span>
                    </Link>
                    <p className="text-sm text-gray-400">
                      <strong className="text-[#F4B400]">+2000</strong> vendeurs
                      actifs nous font confiance
                    </p>
                  </div>
                </div>
              </div>
            </div>
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
