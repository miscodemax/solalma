import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { supabaseUrl, supabaseKey } from "@/lib/supabase";
import Image from "next/image";
import Link from "next/link";
import CopyButton from "@/app/composants/sharebutton";
import {
  FaWhatsapp,
  FaStar,
  FaBox,
  FaHeart,
  FaEye,
  FaUsers,
} from "react-icons/fa";
import BackButton from "@/app/composants/back-button";
import { Suspense } from "react";
import ProductGallery from "@/app/composants/productgallery";
import Loader from "@/app/loading";
import SocialShareButton from "@/app/composants/profileShare";
import FollowButton from "@/app/composants/FollowButton";
import {
  computeSellerRank,
  computeSellerBadges,
  rankLabel,
  rankColor,
  nextRankThreshold,
  type SellerStats,
  type SellerBadge,
} from "@/lib/sellerRank";

export async function generateMetadata({ params }: { params: { id: string } }) {
  const { id } = params;
  const cookieStore = await cookies();
  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: { get: (name) => cookieStore.get(name)?.value },
  });
  const { data: profile } = await supabase
    .from("profiles")
    .select("username, avatar_url, bio")
    .eq("id", id)
    .single();

  const title = profile?.username
    ? `Boutique de ${profile.username} — Sangse.shop`
    : "Profil vendeur — Sangse.shop";
  const description =
    profile?.bio || "Découvrez cette boutique sur Sangse Marketplace.";
  const image = profile?.avatar_url?.startsWith("https")
    ? profile.avatar_url
    : `https://sangse.shop${profile?.avatar_url || "/favicon.png"}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://sangse.shop/profile/${id}`,
      siteName: "Sangse.shop",
      images: [{ url: image, width: 1200, height: 630 }],
      type: "website",
    },
  };
}

// ── Badge color map ─────────────────────────────────────────────────────────
const BADGE_COLORS: Record<string, string> = {
  teal: "bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800",
  blue: "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800",
  purple:
    "bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800",
  amber:
    "bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800",
  coral:
    "bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800",
  gray: "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-600",
};

// ── Rang banner gradient ─────────────────────────────────────────────────────
const RANK_BANNER: Record<string, string> = {
  nouveau: "from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800",
  actif: "from-teal-400 to-teal-600",
  fiable: "from-blue-400 to-blue-600",
  expert: "from-purple-500 to-purple-700",
  elite: "from-amber-400 to-yellow-500",
  verifie: "from-orange-400 to-red-500",
};

export default async function UserProfilePage({
  params,
}: {
  params: { id: string };
}) {
  const cookieStore = await cookies();
  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: { get: (name) => cookieStore.get(name)?.value },
  });
  const { id } = params;

  // ── Données ──────────────────────────────────────────────────────────────────
  // Récupère l'user en premier — les autres requêtes en dépendent
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [
    { data: profile },
    { data: allProducts },
    { data: ratingsData },
    { data: likes },
    { data: followersData },
    { data: currentFollows },
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("username, avatar_url, bio, is_verified")
      .eq("id", id)
      .single(),
    supabase
      .from("product")
      .select("*")
      .eq("user_id", id)
      .order("created_at", { ascending: false }),
    supabase
      .from("seller_ratings")
      .select("rating, comment, created_at, buyer_id")
      .eq("seller_id", id),
    supabase.from("product_like").select("product_id"),
    supabase.from("follows").select("follower_id").eq("following_id", id),
    user
      ? supabase
          .from("follows")
          .select("following_id")
          .eq("follower_id", user.id)
      : Promise.resolve({ data: [] }),
  ]);

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F9F9F9] dark:bg-[#1C1C1C]">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 mx-auto bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
            <span className="text-3xl">😕</span>
          </div>
          <p className="text-lg font-semibold text-red-600 dark:text-red-400">
            Profil introuvable
          </p>
          <Link
            href="/"
            className="inline-block bg-gradient-to-r from-[#F4B400] to-[#FFD766] text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:scale-105 transition-all"
          >
            Retour à l'accueil
          </Link>
        </div>
      </div>
    );
  }

  const products = allProducts ?? [];
  const ratings = (ratingsData ?? []).map((r) => r.rating);
  const reviewCount = ratings.length;
  const avgRating =
    reviewCount > 0 ? ratings.reduce((a, b) => a + b, 0) / reviewCount : 0;
  const totalClicks = products.reduce((sum, p) => sum + (p.clicks ?? 0), 0);
  const profileLikes = (likes ?? []).filter((l) =>
    products.some((p) => p.id === l.product_id),
  );
  const totalLikes = profileLikes.length;
  const followerCount = (followersData ?? []).length;
  const isFollowed = (currentFollows ?? []).some((f) => f.following_id === id);
  const isOwner = user?.id === id;

  // ── Rang & badges ─────────────────────────────────────────────────────────
  const stats: SellerStats = {
    reviewCount,
    avgRating,
    totalSales: reviewCount,
    responseRateH24: false,
    fastDelivery: false,
    fairPricing: false,
    isAdminVerified: (profile as any).is_verified ?? false,
  };
  const rank = computeSellerRank(stats);
  const badges = computeSellerBadges(stats);
  const rLabel = rankLabel(rank);
  const rColor = rankColor(rank);
  const nextThreshold = nextRankThreshold(rank);
  const bannerGrad = RANK_BANNER[rank];
  const progressPct = nextThreshold
    ? Math.min(100, Math.round((reviewCount / nextThreshold.minReviews) * 100))
    : 100;

  // ── Render étoiles ────────────────────────────────────────────────────────
  const renderStars = (r: number) =>
    Array.from({ length: 5 }, (_, i) => (
      <FaStar
        key={i}
        className={`w-3.5 h-3.5 ${i < Math.round(r) ? "text-[#F4B400]" : "text-gray-300 dark:text-gray-600"}`}
      />
    ));

  const fmtNum = (n: number) =>
    n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);

  return (
    <div className="min-h-screen bg-[#F9F9F9] dark:bg-[#131313]">
      {/* ── HERO BANNER ──────────────────────────────────────────────────────── */}
      <div
        className={`relative h-36 sm:h-44 bg-gradient-to-r ${bannerGrad} overflow-hidden`}
      >
        {/* Pattern décoratif */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#F9F9F9] dark:from-[#131313] to-transparent" />
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 -mt-16 pb-16 space-y-6 relative z-10">
        <div className="mb-2">
          <BackButton />
        </div>

        {/* ── CARD PROFIL ───────────────────────────────────────────────────── */}
        <div className="bg-white dark:bg-[#1e1e1e] rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
          {/* Avatar + infos principales */}
          <div className="px-5 sm:px-8 pt-5 pb-6">
            <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-end">
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <div
                  className={`w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-br ${bannerGrad} p-0.5 shadow-xl`}
                >
                  <Image
                    src={profile.avatar_url || "/default-avatar.png"}
                    alt={profile.username ?? "Vendeur"}
                    width={112}
                    height={112}
                    className="rounded-full object-cover w-full h-full border-4 border-white dark:border-[#1e1e1e]"
                  />
                </div>
                {/* Point de rang */}
                <div
                  className={`absolute -bottom-1 -right-1 w-6 h-6 ${rColor.dot} rounded-full border-3 border-white dark:border-[#1e1e1e] shadow-md`}
                />
              </div>

              {/* Nom + rang + badge vérifié */}
              <div className="flex-1 min-w-0 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-black text-[#1C1C1C] dark:text-white truncate">
                    {profile.username}
                  </h1>
                  {rank === "verifie" && (
                    <span
                      className="text-orange-500 text-xl"
                      title="Vendeur vérifié par Sangse"
                    >
                      ✅
                    </span>
                  )}
                </div>

                {/* Pill de rang */}
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${rColor.bg} ${rColor.text} ${rColor.border}`}
                >
                  {rank === "verifie"
                    ? "✅"
                    : rank === "elite"
                      ? "👑"
                      : rank === "expert"
                        ? "⭐"
                        : rank === "fiable"
                          ? "🛡️"
                          : rank === "actif"
                            ? "🟢"
                            : "🔘"}
                  {rLabel}
                </span>

                {/* Bio */}
                {profile.bio && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed max-w-md">
                    {profile.bio}
                  </p>
                )}
              </div>

              {/* CTA Follow / Actions */}
              <div className="flex flex-wrap gap-2 sm:flex-col">
                {!isOwner && user && (
                  <FollowButton
                    followerId={user.id}
                    followingId={id}
                    initialFollowed={isFollowed}
                    size="md"
                  />
                )}
                {isOwner && (
                  <Link
                    href="/profile/update"
                    className="flex items-center gap-2 px-4 py-2.5 bg-[#F4B400] hover:bg-[#e5b339] text-[#1C1C1C] text-sm font-bold rounded-xl transition-all hover:scale-105"
                  >
                    ✏️ Modifier
                  </Link>
                )}
              </div>
            </div>

            {/* ── Stats bar ───────────────────────────────────────────────────── */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
              {/* Abonnés */}
              <div className="flex flex-col items-center gap-0.5 bg-gray-50 dark:bg-[#2a2a2a] rounded-2xl p-3.5 border border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 text-xs mb-1">
                  <FaUsers className="text-[#F4B400] w-3.5 h-3.5" /> Abonnés
                </div>
                <span className="text-2xl font-black text-[#1C1C1C] dark:text-white">
                  {fmtNum(followerCount)}
                </span>
              </div>

              {/* Vues */}
              <div className="flex flex-col items-center gap-0.5 bg-gray-50 dark:bg-[#2a2a2a] rounded-2xl p-3.5 border border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 text-xs mb-1">
                  <FaEye className="text-[#F4B400] w-3.5 h-3.5" /> Vues totales
                </div>
                <span className="text-2xl font-black text-[#1C1C1C] dark:text-white">
                  {fmtNum(totalClicks)}
                </span>
              </div>

              {/* Likes */}
              <div className="flex flex-col items-center gap-0.5 bg-gray-50 dark:bg-[#2a2a2a] rounded-2xl p-3.5 border border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 text-xs mb-1">
                  <FaHeart className="text-red-500 w-3.5 h-3.5" /> Likes
                </div>
                <span className="text-2xl font-black text-[#1C1C1C] dark:text-white">
                  {fmtNum(totalLikes)}
                </span>
              </div>

              {/* Articles */}
              <div className="flex flex-col items-center gap-0.5 bg-gray-50 dark:bg-[#2a2a2a] rounded-2xl p-3.5 border border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 text-xs mb-1">
                  <FaBox className="text-[#F4B400] w-3.5 h-3.5" /> Articles
                </div>
                <span className="text-2xl font-black text-[#1C1C1C] dark:text-white">
                  {products.length}
                </span>
              </div>
            </div>

            {/* ── Note vendeur ─────────────────────────────────────────────────── */}
            {reviewCount >= 5 ? (
              <div className="mt-4 flex items-center gap-3 bg-[#F4B400]/8 dark:bg-[#F4B400]/10 border border-[#F4B400]/25 rounded-2xl px-4 py-3">
                <div className="flex items-center gap-1">
                  {renderStars(avgRating)}
                </div>
                <span className="font-black text-lg text-[#1C1C1C] dark:text-white">
                  {avgRating.toFixed(1)}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  ({reviewCount} avis)
                </span>
              </div>
            ) : reviewCount > 0 ? (
              <p className="mt-4 text-xs text-gray-400 dark:text-gray-500 italic">
                {reviewCount} avis — note visible à partir de 5 avis
              </p>
            ) : null}

            {/* ── Badges ──────────────────────────────────────────────────────── */}
            {badges.length > 0 && (
              <div className="mt-5 space-y-2">
                <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Badges obtenus
                </p>
                <div className="flex flex-wrap gap-2">
                  {badges.map((badge: SellerBadge) => (
                    <span
                      key={badge.id}
                      title={badge.description}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border cursor-help transition-transform hover:scale-105 ${BADGE_COLORS[badge.color]}`}
                    >
                      <span className="text-sm">{badge.icon}</span>
                      {badge.label}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* ── Progression vers prochain rang ──────────────────────────────── */}
            {nextThreshold && rank !== "elite" && (
              <div className="mt-5 bg-gray-50 dark:bg-[#2a2a2a] rounded-2xl px-4 py-3 space-y-2 border border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500 dark:text-gray-400 font-medium">
                    Prochain rang :{" "}
                    <span
                      className={`font-bold ${rankColor(nextThreshold.rank).text}`}
                    >
                      {rankLabel(nextThreshold.rank)}
                    </span>
                  </span>
                  <span className="text-gray-400 dark:text-gray-500">
                    {reviewCount}/{nextThreshold.minReviews} avis
                  </span>
                </div>
                <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full bg-gradient-to-r ${bannerGrad} rounded-full transition-all duration-700`}
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
                {reviewCount < nextThreshold.minReviews && (
                  <p className="text-[10px] text-gray-400 dark:text-gray-500">
                    {nextThreshold.minReviews - reviewCount} avis de plus
                    nécessaires
                  </p>
                )}
              </div>
            )}

            {/* ── Partage & actions owner ──────────────────────────────────────── */}
            <div className="mt-5 flex flex-wrap gap-2 pt-4 border-t border-gray-100 dark:border-gray-800">
              <SocialShareButton
                shareText={`🔗 Découvre la boutique de ${profile.username} sur Sangse.shop : https://sangse.shop/profile/${id}`}
                shareUrl={`https://sangse.shop/profile/${id}`}
                title="Boutique Sangse.shop"
              />
              <CopyButton
                text={`https://sangse.shop/profile/${id}`}
                platform="Copier le lien"
              />
              {isOwner && (
                <Link
                  href="/dashboard/products"
                  className="flex items-center gap-2 px-4 py-2 bg-[#1C1C1C] dark:bg-white text-white dark:text-[#1C1C1C] text-sm font-bold rounded-xl hover:scale-105 transition-all shadow-md"
                >
                  📦 Gérer mes produits
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* ── COLLECTION ──────────────────────────────────────────────────────── */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-[#1C1C1C] dark:text-white flex items-center gap-3">
              <div
                className={`w-1 h-7 bg-gradient-to-b ${bannerGrad} rounded-full`}
              />
              Collection de {profile.username}
            </h2>
            {products.length > 0 && (
              <span
                className={`bg-gradient-to-r ${bannerGrad} text-white px-3 py-1 rounded-full text-sm font-bold shadow`}
              >
                {products.length} articles
              </span>
            )}
          </div>
          <Suspense fallback={<Loader />}>
            <ProductGallery products={products} userId={user?.id} />
          </Suspense>
        </section>

        {/* ── CTA contact ──────────────────────────────────────────────────────── */}
        {!isOwner && products.length > 0 && (
          <div
            className={`bg-gradient-to-r ${bannerGrad} rounded-3xl p-6 text-center text-white shadow-xl`}
          >
            <h3 className="text-xl font-black mb-2">💝 Un coup de cœur ?</h3>
            <p className="mb-4 opacity-90 text-sm">
              Contactez {profile.username} directement via WhatsApp pour
              commander
            </p>
            <a
              href={`https://wa.me/?text=${encodeURIComponent(`Bonjour ${profile.username} ! J'ai vu votre boutique sur Sangse.shop 😊`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-white text-[#1C1C1C] px-6 py-3 rounded-xl font-bold hover:bg-gray-100 hover:shadow-lg transition-all hover:scale-105"
            >
              <FaWhatsapp className="w-5 h-5 text-green-500" />
              Contacter maintenant
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
