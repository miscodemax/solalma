"use client";

import { useState, useEffect, useTransition } from "react";
import { createClient } from "@/lib/supabase";
import {
  Loader2,
  Star,
  Send,
  MessageCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/fr";

dayjs.extend(relativeTime);
dayjs.locale("fr");

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  buyer_id: string;
  product_id: number | null;
}

interface RatingSellerProps {
  sellerId: string;
  initialAverage: number | null;
  initialCount: number;
}

const REVIEWS_PER_PAGE = 5;

export default function RatingSeller({
  sellerId,
  initialAverage,
  initialCount,
}: RatingSellerProps) {
  const supabase = createClient();

  // ── Auth ────────────────────────────────────────────────────────────────────
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserId(data.user?.id ?? null);
    });
  }, []);

  // ── State avis ──────────────────────────────────────────────────────────────
  const [reviews, setReviews] = useState<Review[]>([]);
  const [avg, setAvg] = useState<number | null>(initialAverage);
  const [count, setCount] = useState(initialCount);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [showAll, setShowAll] = useState(false);

  // ── State formulaire ────────────────────────────────────────────────────────
  const [hoverStar, setHoverStar] = useState(0);
  const [selectedStar, setSelectedStar] = useState(0);
  const [comment, setComment] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // ── Chargement des avis ─────────────────────────────────────────────────────
  const fetchReviews = async () => {
    setLoadingReviews(true);
    const { data } = await supabase
      .from("seller_ratings")
      .select("id, rating, comment, created_at, buyer_id, product_id")
      .eq("seller_id", sellerId)
      .order("created_at", { ascending: false });

    if (data) {
      setReviews(data);
      setCount(data.length);
      if (data.length > 0) {
        const sum = data.reduce((acc, r) => acc + r.rating, 0);
        setAvg(Math.round((sum / data.length) * 10) / 10);
      } else {
        setAvg(null);
      }
    }
    setLoadingReviews(false);
  };

  useEffect(() => {
    fetchReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sellerId]);

  // ── Soumission ──────────────────────────────────────────────────────────────
  const handleSubmit = () => {
    if (!userId) return;
    if (selectedStar === 0) {
      setSubmitError("Choisissez une note.");
      return;
    }
    setSubmitError(null);

    startTransition(async () => {
      const { error } = await supabase.from("seller_ratings").insert({
        seller_id: sellerId,
        buyer_id: userId,
        rating: selectedStar,
        comment: comment.trim() || null,
      });

      if (error) {
        setSubmitError("Erreur lors de l'envoi. Réessayez.");
        return;
      }

      setSubmitSuccess(true);
      setSelectedStar(0);
      setComment("");
      setFormOpen(false);

      await fetchReviews();

      setTimeout(() => setSubmitSuccess(false), 3000);
    });
  };

  // ── Affichage des étoiles (lecture) ────────────────────────────────────────
  const StarDisplay = ({
    rating,
    size = 16,
  }: {
    rating: number;
    size?: number;
  }) => (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <svg
          key={s}
          width={size}
          height={size}
          viewBox="0 0 20 20"
          fill={s <= Math.round(rating) ? "#F6C445" : "none"}
          stroke={s <= Math.round(rating) ? "#F6C445" : "#d1d5db"}
          strokeWidth="1.5"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );

  const visibleReviews = showAll ? reviews : reviews.slice(0, REVIEWS_PER_PAGE);

  return (
    <div className="space-y-5">
      {/* ── Résumé ─────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          {avg !== null && count >= 5 ? (
            <>
              <span className="text-4xl font-black text-[#1C2B49] dark:text-white">
                {avg.toFixed(1)}
              </span>
              <div className="flex flex-col gap-1">
                <StarDisplay rating={avg} size={18} />
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {count} avis
                </span>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <StarDisplay rating={0} size={16} />
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {count < 5
                  ? count === 0
                    ? "Aucun avis pour le moment"
                    : `${count} avis — note visible dès 5 avis`
                  : "Chargement…"}
              </span>
            </div>
          )}
        </div>

        {/* Bouton ouvrir formulaire */}
        {userId && userId !== sellerId && (
          <button
            onClick={() => setFormOpen((p) => !p)}
            className="flex items-center gap-2 px-4 py-2 bg-[#F6C445] hover:bg-[#e5b339] text-[#1C2B49] text-sm font-bold rounded-xl transition-all hover:scale-105 active:scale-95 shadow-md"
          >
            <Star size={15} />
            {formOpen ? "Annuler" : "Laisser un avis"}
          </button>
        )}
        {!userId && (
          <span className="text-xs text-gray-400 dark:text-gray-500 italic">
            Connectez-vous pour laisser un avis
          </span>
        )}
      </div>

      {/* ── Formulaire ─────────────────────────────────────────────────────── */}
      {formOpen && userId && (
        <div className="bg-white dark:bg-[#1a2538] border border-[#F6C445]/30 rounded-2xl p-5 space-y-4 shadow-lg animate-slide-down">
          <h4 className="font-bold text-[#1C2B49] dark:text-white flex items-center gap-2">
            <MessageCircle size={16} className="text-[#F6C445]" />
            Votre avis
          </h4>

          {/* Étoiles interactives */}
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
              Note *
            </p>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  type="button"
                  onMouseEnter={() => setHoverStar(s)}
                  onMouseLeave={() => setHoverStar(0)}
                  onClick={() => setSelectedStar(s)}
                  className="transition-transform hover:scale-125 active:scale-110"
                  aria-label={`${s} étoile${s > 1 ? "s" : ""}`}
                >
                  <svg
                    width={28}
                    height={28}
                    viewBox="0 0 20 20"
                    fill={s <= (hoverStar || selectedStar) ? "#F6C445" : "none"}
                    stroke={
                      s <= (hoverStar || selectedStar) ? "#F6C445" : "#9ca3af"
                    }
                    strokeWidth="1.5"
                    className="transition-all"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </button>
              ))}
              {selectedStar > 0 && (
                <span className="ml-2 text-sm font-semibold text-[#F6C445]">
                  {
                    [
                      "",
                      "Mauvais",
                      "Passable",
                      "Bien",
                      "Très bien",
                      "Excellent",
                    ][selectedStar]
                  }
                </span>
              )}
            </div>
          </div>

          {/* Commentaire */}
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
              Commentaire <span className="text-gray-400">(optionnel)</span>
            </p>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Décrivez votre expérience avec ce vendeur…"
              rows={3}
              maxLength={500}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-[#0f1729] border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-[#1C2B49] dark:text-white placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-[#F6C445]/50 transition-all"
            />
            <div className="text-right text-xs text-gray-400 mt-1">
              {comment.length}/500
            </div>
          </div>

          {submitError && (
            <p className="text-sm text-red-500 dark:text-red-400">
              {submitError}
            </p>
          )}

          <button
            onClick={handleSubmit}
            disabled={isPending || selectedStar === 0}
            className="flex items-center justify-center gap-2 w-full py-3 bg-gradient-to-r from-[#F6C445] to-[#FFD700] text-[#1C2B49] font-bold rounded-xl transition-all hover:scale-[1.02] active:scale-95 shadow-md disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {isPending ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Send size={16} />
            )}
            {isPending ? "Envoi…" : "Publier mon avis"}
          </button>
        </div>
      )}

      {/* Succès */}
      {submitSuccess && (
        <div className="flex items-center gap-2 px-4 py-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl text-sm text-green-700 dark:text-green-300 font-medium animate-slide-down">
          <span>✅</span> Avis publié, merci !
        </div>
      )}

      {/* ── Liste des avis ──────────────────────────────────────────────────── */}
      {loadingReviews ? (
        <div className="flex justify-center py-6">
          <Loader2 className="w-5 h-5 animate-spin text-[#F6C445]" />
        </div>
      ) : reviews.length > 0 ? (
        <div className="space-y-3">
          <h4 className="text-sm font-bold text-[#1C2B49] dark:text-gray-300 flex items-center gap-2">
            <MessageCircle size={14} className="text-[#F6C445]" />
            {count} avis
          </h4>

          {visibleReviews.map((review) => (
            <div
              key={review.id}
              className="bg-gray-50 dark:bg-[#0f1729]/60 border border-gray-100 dark:border-gray-800 rounded-xl p-4 space-y-2 transition-all hover:border-[#F6C445]/30"
            >
              {/* Header : étoiles + date */}
              <div className="flex items-center justify-between flex-wrap gap-2">
                <StarDisplay rating={review.rating} size={14} />
                <span className="text-[11px] text-gray-400 dark:text-gray-500">
                  {dayjs(review.created_at).fromNow()}
                </span>
              </div>

              {/* Commentaire */}
              {review.comment && (
                <p className="text-sm text-[#1C2B49] dark:text-gray-300 leading-relaxed">
                  {review.comment}
                </p>
              )}

              {/* ID acheteur anonymisé */}
              <p className="text-[10px] text-gray-400 dark:text-gray-600">
                Acheteur vérifié · {review.buyer_id.slice(0, 8)}…
              </p>
            </div>
          ))}

          {/* Voir plus / moins */}
          {reviews.length > REVIEWS_PER_PAGE && (
            <button
              onClick={() => setShowAll((p) => !p)}
              className="flex items-center gap-2 w-full justify-center py-2.5 text-sm font-semibold text-[#F6C445] hover:text-[#e5b339] border border-[#F6C445]/30 hover:border-[#F6C445]/60 rounded-xl transition-all hover:bg-[#F6C445]/5"
            >
              {showAll ? (
                <>
                  <ChevronUp size={15} /> Voir moins
                </>
              ) : (
                <>
                  <ChevronDown size={15} /> Voir{" "}
                  {reviews.length - REVIEWS_PER_PAGE} avis de plus
                </>
              )}
            </button>
          )}
        </div>
      ) : (
        <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-4 italic">
          Aucun avis pour ce vendeur — soyez le premier !
        </p>
      )}

      <style jsx>{`
        @keyframes slide-down {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-down {
          animation: slide-down 0.25s ease-out;
        }
      `}</style>
    </div>
  );
}
