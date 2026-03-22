// lib/sellerRank.ts
// ─────────────────────────────────────────────────────────────────────────────
// Système de rangs et badges vendeurs de Sangse Marketplace
// Règle fondamentale : aucun badge n'est attribué sans au moins 5 avis
// ─────────────────────────────────────────────────────────────────────────────

export type SellerRank =
  | "nouveau"
  | "actif"
  | "fiable"
  | "expert"
  | "elite"
  | "verifie";

export interface SellerStats {
  reviewCount: number; // nb d'avis reçus
  avgRating: number; // note moyenne (1–5)
  totalSales: number; // nb de ventes (optionnel — utilise reviewCount comme proxy)
  responseRateH24: boolean; // répond en < 24h
  fastDelivery: boolean; // livraisons rapides signalées
  fairPricing: boolean; // prix cohérents avec la catégorie
  isAdminVerified: boolean; // validation manuelle par l'équipe Sangse
}

export interface SellerBadge {
  id: string;
  label: string;
  description: string;
  color: "teal" | "blue" | "purple" | "amber" | "coral" | "gray";
  icon: string; // emoji servant d'icône dans l'UI
  requiredRank: SellerRank; // rang minimum pour afficher ce badge
}

// ─── Seuils des rangs ────────────────────────────────────────────────────────
const RANK_THRESHOLDS: Record<
  SellerRank,
  { minReviews: number; minAvg: number }
> = {
  nouveau: { minReviews: 0, minAvg: 0 },
  actif: { minReviews: 5, minAvg: 3.5 },
  fiable: { minReviews: 15, minAvg: 4.0 },
  expert: { minReviews: 30, minAvg: 4.3 },
  elite: { minReviews: 50, minAvg: 4.5 },
  verifie: { minReviews: 50, minAvg: 4.5 }, // + validation admin obligatoire
};

// Ordre des rangs pour la comparaison
const RANK_ORDER: SellerRank[] = [
  "nouveau",
  "actif",
  "fiable",
  "expert",
  "elite",
  "verifie",
];

/**
 * Calcule le rang d'un vendeur à partir de ses statistiques.
 * Le rang "verifie" est le seul qui nécessite une validation manuelle.
 */
export function computeSellerRank(stats: SellerStats): SellerRank {
  const { reviewCount, avgRating, isAdminVerified } = stats;

  // Rang "verifie" — doit avoir le rang Elite ET la validation admin
  if (
    isAdminVerified &&
    reviewCount >= RANK_THRESHOLDS.elite.minReviews &&
    avgRating >= RANK_THRESHOLDS.elite.minAvg
  ) {
    return "verifie";
  }

  // Rangs automatiques — du plus élevé au plus bas
  if (
    reviewCount >= RANK_THRESHOLDS.elite.minReviews &&
    avgRating >= RANK_THRESHOLDS.elite.minAvg
  )
    return "elite";
  if (
    reviewCount >= RANK_THRESHOLDS.expert.minReviews &&
    avgRating >= RANK_THRESHOLDS.expert.minAvg
  )
    return "expert";
  if (
    reviewCount >= RANK_THRESHOLDS.fiable.minReviews &&
    avgRating >= RANK_THRESHOLDS.fiable.minAvg
  )
    return "fiable";
  if (
    reviewCount >= RANK_THRESHOLDS.actif.minReviews &&
    avgRating >= RANK_THRESHOLDS.actif.minAvg
  )
    return "actif";

  return "nouveau";
}

/**
 * Retourne les badges mérités par un vendeur.
 * RÈGLE STRICTE : aucun badge si reviewCount < 5, quelles que soient les autres stats.
 */
export function computeSellerBadges(stats: SellerStats): SellerBadge[] {
  const {
    reviewCount,
    avgRating,
    responseRateH24,
    fastDelivery,
    fairPricing,
    isAdminVerified,
  } = stats;

  // Garde absolu — moins de 5 avis = zéro badge
  if (reviewCount < 5) return [];

  const rank = computeSellerRank(stats);
  const rankIndex = RANK_ORDER.indexOf(rank);

  const allBadges: SellerBadge[] = [
    // ── Rang Actif ─────────────────────────────────────────────────────────
    {
      id: "sales_active",
      label: "Ventes actives",
      description: "Vendeur régulièrement actif sur la plateforme",
      color: "teal",
      icon: "🟢",
      requiredRank: "actif",
    },
    {
      id: "reactive_24h",
      label: "Réactif 24h",
      description: "Répond aux acheteurs en moins de 24h",
      color: "teal",
      icon: "⚡",
      requiredRank: "actif",
    },

    // ── Rang Fiable ─────────────────────────────────────────────────────────
    {
      id: "trusted_seller",
      label: "Vendeur sûr",
      description: "Note moyenne ≥ 4.0 sur au moins 15 avis",
      color: "blue",
      icon: "🛡️",
      requiredRank: "fiable",
    },
    {
      id: "fast_delivery",
      label: "Livraison rapide",
      description: "Délais de livraison reconnus par les acheteurs",
      color: "blue",
      icon: "🚀",
      requiredRank: "fiable",
    },

    // ── Rang Expert ─────────────────────────────────────────────────────────
    {
      id: "top_seller",
      label: "Top vendeur",
      description: "Fait partie des meilleurs vendeurs de sa catégorie",
      color: "purple",
      icon: "⭐",
      requiredRank: "expert",
    },
    {
      id: "very_popular",
      label: "Très populaire",
      description: "Produits très likés et vus par la communauté",
      color: "purple",
      icon: "🔥",
      requiredRank: "expert",
    },
    {
      id: "fair_pricing",
      label: "Prix justes",
      description: "Tarification cohérente et compétitive",
      color: "purple",
      icon: "💎",
      requiredRank: "expert",
    },

    // ── Rang Elite ──────────────────────────────────────────────────────────
    {
      id: "elite_seller",
      label: "Vendeur élite",
      description:
        "Note ≥ 4.5 sur au moins 50 avis — le top 1% de la plateforme",
      color: "amber",
      icon: "👑",
      requiredRank: "elite",
    },
    {
      id: "fifty_plus",
      label: "+50 transactions",
      description: "Plus de 50 ventes réussies sur Sangse",
      color: "amber",
      icon: "💫",
      requiredRank: "elite",
    },

    // ── Rang Vérifié — badge unique, validation manuelle ────────────────────
    {
      id: "verified_seller",
      label: "Vendeur vérifié",
      description: "Identité et fiabilité vérifiées par l'équipe Sangse",
      color: "coral",
      icon: "✅",
      requiredRank: "verifie",
    },
  ];

  // Filtrer : ne garder que les badges dont le rang requis est atteint
  const earned = allBadges.filter((badge) => {
    const badgeRankIndex = RANK_ORDER.indexOf(badge.requiredRank);
    if (rankIndex < badgeRankIndex) return false;

    // Badges conditionnels (nécessitent des stats spécifiques en plus du rang)
    if (badge.id === "reactive_24h" && !responseRateH24) return false;
    if (badge.id === "fast_delivery" && !fastDelivery) return false;
    if (badge.id === "fair_pricing" && !fairPricing) return false;
    if (badge.id === "verified_seller" && !isAdminVerified) return false;

    return true;
  });

  return earned;
}

/**
 * Retourne le label français du rang pour l'affichage UI.
 */
export function rankLabel(rank: SellerRank): string {
  const labels: Record<SellerRank, string> = {
    nouveau: "Nouveau",
    actif: "Actif",
    fiable: "Fiable",
    expert: "Expert",
    elite: "Élite",
    verifie: "Vérifié",
  };
  return labels[rank];
}

/**
 * Couleur Tailwind associée à chaque rang (pour les badges, textes, bordures).
 */
export function rankColor(rank: SellerRank): {
  bg: string;
  text: string;
  border: string;
  dot: string;
} {
  const palette: Record<
    SellerRank,
    { bg: string; text: string; border: string; dot: string }
  > = {
    nouveau: {
      bg: "bg-gray-100 dark:bg-gray-700",
      text: "text-gray-500 dark:text-gray-400",
      border: "border-gray-200 dark:border-gray-600",
      dot: "bg-gray-400",
    },
    actif: {
      bg: "bg-teal-50 dark:bg-teal-900/20",
      text: "text-teal-700 dark:text-teal-300",
      border: "border-teal-200 dark:border-teal-800",
      dot: "bg-teal-500",
    },
    fiable: {
      bg: "bg-blue-50 dark:bg-blue-900/20",
      text: "text-blue-700 dark:text-blue-300",
      border: "border-blue-200 dark:border-blue-800",
      dot: "bg-blue-500",
    },
    expert: {
      bg: "bg-purple-50 dark:bg-purple-900/20",
      text: "text-purple-700 dark:text-purple-300",
      border: "border-purple-200 dark:border-purple-800",
      dot: "bg-purple-500",
    },
    elite: {
      bg: "bg-amber-50 dark:bg-amber-900/20",
      text: "text-amber-700 dark:text-amber-300",
      border: "border-amber-200 dark:border-amber-800",
      dot: "bg-amber-500",
    },
    verifie: {
      bg: "bg-orange-50 dark:bg-orange-900/20",
      text: "text-orange-700 dark:text-orange-300",
      border: "border-orange-200 dark:border-orange-800",
      dot: "bg-orange-500",
    },
  };
  return palette[rank];
}

/**
 * Prochain palier à atteindre — utile pour afficher la progression.
 */
export function nextRankThreshold(
  currentRank: SellerRank,
): { rank: SellerRank; minReviews: number; minAvg: number } | null {
  const currentIndex = RANK_ORDER.indexOf(currentRank);
  // "verifie" ne s'obtient pas automatiquement
  const nextAutoRanks = RANK_ORDER.filter((r) => r !== "verifie");
  const nextIndex = nextAutoRanks.indexOf(currentRank) + 1;
  if (nextIndex >= nextAutoRanks.length) return null;
  const nextRank = nextAutoRanks[nextIndex] as SellerRank;
  return { rank: nextRank, ...RANK_THRESHOLDS[nextRank] };
}
