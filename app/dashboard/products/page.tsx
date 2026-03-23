"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import Link from "next/link";
import ProductImage from "./productimage";
import DeleteButton from "./deletebutton";
import {
  Store,
  TrendingUp,
  Package,
  Star,
  Plus,
  Search,
  Filter,
  Grid,
  Edit2,
  Calendar,
  Tag,
  Percent,
  Clock,
  Zap,
  X,
  Sparkles,
} from "lucide-react";
import BackButton from "@/app/composants/back-button";
import AuthModal from "@/app/composants/auth-modal";
import ApplyAllPromo from "@/app/composants/applyAllpromo";

export const dynamic = "force-dynamic";

type Product = {
  id: number;
  title: string;
  price: string;
  description: string;
  created_at: string;
  image_url: string;
  user_id: string;
  in_stock?: boolean;
  has_promo?: boolean;
  promo_price?: number;
  promo_percentage?: number;
  promo_expiration?: string;
};

type PromoModalProps = {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onSavePromo: (data: any) => Promise<void>;
};

// ── Helpers ──────────────────────────────────────────────────────────────────
/** Retourne une date ISO locale +Nh à partir de maintenant */
function dateInNHours(n: number): string {
  const d = new Date(Date.now() + n * 3_600_000);
  // Format attendu par datetime-local : "YYYY-MM-DDTHH:mm"
  const pad = (v: number) => String(v).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function PromoModal({
  isOpen,
  onClose,
  product,
  onSavePromo,
}: PromoModalProps) {
  const [promoPrice, setPromoPrice] = useState("");
  // Par défaut : maintenant + 48h
  const [promoExpiration, setPromoExpiration] = useState(dateInNHours(48));
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (product && isOpen) {
      setPromoPrice(product.promo_price?.toString() || "");
      // Si le produit a déjà une date d'expiration on la pré-remplit, sinon 48h par défaut
      setPromoExpiration(
        product.promo_expiration
          ? new Date(product.promo_expiration).toISOString().slice(0, 16)
          : dateInNHours(48),
      );
    }
  }, [product, isOpen]);

  if (!isOpen || !product) return null;

  const originalPrice = parseFloat(product.price);
  const calculatePercentage = () => {
    if (!promoPrice || !originalPrice) return 0;
    const discount =
      ((originalPrice - parseFloat(promoPrice)) / originalPrice) * 100;
    return Math.max(0, Math.min(99, Math.round(discount)));
  };

  const percentage = calculatePercentage();
  const minPrice = originalPrice * 0.01;
  const isValidPromo =
    promoPrice &&
    parseFloat(promoPrice) < originalPrice &&
    parseFloat(promoPrice) >= minPrice;

  const handleSave = async () => {
    if (!isValidPromo) return;
    setIsProcessing(true);
    try {
      await onSavePromo({
        id: product.id,
        has_promo: true,
        promo_price: parseFloat(promoPrice),
        promo_percentage: percentage,
        // ✅ Toujours stocker dans promo_expiration — jamais null sauf retrait manuel
        promo_expiration: promoExpiration || dateInNHours(48),
      });
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRemovePromo = async () => {
    setIsProcessing(true);
    try {
      await onSavePromo({
        id: product.id,
        has_promo: false,
        promo_price: null,
        promo_percentage: null,
        promo_expiration: null,
      });
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Raccourcis durée
  const DURATIONS = [
    { label: "2h", hours: 2 },
    { label: "6h", hours: 6 },
    { label: "24h", hours: 24 },
    { label: "48h", hours: 48 },
    { label: "7j", hours: 168 },
  ];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white dark:bg-[#1a1a1a] rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden animate-slideUp">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 backdrop-blur-sm p-3 rounded-2xl">
                <Tag className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-white">
                  Gestion Promotion
                </h2>
                <p className="text-white/90 text-sm">
                  Boostez vos ventes avec une promo !
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white hover:bg-white/20 p-2 rounded-xl transition-all"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Produit info */}
          <div className="bg-slate-50 dark:bg-[#0f0f0f] p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-700 flex-shrink-0">
                <img
                  src={product.image_url || "/placeholder.png"}
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-slate-900 dark:text-white truncate">
                  {product.title}
                </h3>
                <p className="text-2xl font-black text-orange-500">
                  {originalPrice.toLocaleString()} FCFA
                </p>
              </div>
            </div>
          </div>

          {/* Prix promotionnel */}
          <div className="space-y-2">
            <label className="block text-sm font-bold text-slate-900 dark:text-white">
              💰 Prix Promotionnel
            </label>
            <div className="relative">
              <input
                type="number"
                value={promoPrice}
                onChange={(e) => setPromoPrice(e.target.value)}
                placeholder={`Minimum: ${Math.ceil(minPrice)} FCFA`}
                className="w-full px-4 py-3 bg-white dark:bg-[#0f0f0f] border-2 border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white font-semibold focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                min={minPrice}
                max={originalPrice - 1}
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400 font-bold">
                FCFA
              </span>
            </div>
            {promoPrice && !isValidPromo && (
              <p className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                ⚠️ Le prix promo doit être inférieur au prix original
              </p>
            )}
          </div>

          {/* Aperçu réduction */}
          {isValidPromo && (
            <div className="bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 p-6 rounded-2xl border-2 border-red-200 dark:border-red-800 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full -translate-y-16 translate-x-16" />
              <div className="relative">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-5 h-5 text-red-600 dark:text-red-400" />
                  <span className="text-sm font-bold text-red-900 dark:text-red-100">
                    Aperçu de la promotion
                  </span>
                </div>
                <div className="flex items-end gap-4">
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 line-through">
                      {originalPrice.toLocaleString()} FCFA
                    </p>
                    <p className="text-3xl font-black text-red-600 dark:text-red-400">
                      {parseFloat(promoPrice).toLocaleString()} FCFA
                    </p>
                  </div>
                  <div className="bg-gradient-to-br from-red-500 to-pink-500 text-white px-4 py-2 rounded-xl font-black text-xl shadow-lg">
                    -{percentage}%
                  </div>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">
                  💰 Économie :{" "}
                  {(originalPrice - parseFloat(promoPrice)).toLocaleString()}{" "}
                  FCFA
                </p>
              </div>
            </div>
          )}

          {/* Date expiration */}
          <div className="space-y-3">
            <label className="block text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-orange-500" />
              Durée de la promotion
              <span className="text-xs font-normal text-slate-500 dark:text-slate-400 ml-1">
                (défaut 48h)
              </span>
            </label>

            {/* Raccourcis rapides */}
            <div className="flex flex-wrap gap-2">
              {DURATIONS.map(({ label, hours }) => {
                const val = dateInNHours(hours);
                const isSelected = promoExpiration === val;
                return (
                  <button
                    key={label}
                    type="button"
                    onClick={() => setPromoExpiration(val)}
                    className={`px-4 py-2 rounded-xl text-sm font-bold border-2 transition-all ${
                      isSelected
                        ? "bg-orange-500 border-orange-500 text-white shadow-md"
                        : "bg-white dark:bg-[#0f0f0f] border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-orange-400"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>

            {/* Champ datetime-local pour date précise */}
            <input
              type="datetime-local"
              value={promoExpiration}
              onChange={(e) => setPromoExpiration(e.target.value)}
              min={new Date().toISOString().slice(0, 16)}
              className="w-full px-4 py-3 bg-white dark:bg-[#0f0f0f] border-2 border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white font-semibold focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
            />

            {/* Résumé expiration */}
            {promoExpiration && (
              <p className="text-xs text-orange-600 dark:text-orange-400 font-semibold flex items-center gap-1">
                <Clock size={11} />
                Expire le{" "}
                {new Date(promoExpiration).toLocaleDateString("fr-FR", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            )}
          </div>

          {/* Boutons action */}
          <div className="flex gap-3 pt-4">
            {product.has_promo && (
              <button
                onClick={handleRemovePromo}
                disabled={isProcessing}
                className="flex-1 px-6 py-3 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl font-bold hover:bg-red-200 dark:hover:bg-red-900/50 transition-all disabled:opacity-50"
              >
                {isProcessing ? "Suppression..." : "Retirer la promo"}
              </button>
            )}
            <button
              onClick={handleSave}
              disabled={!isValidPromo || isProcessing}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl font-bold shadow-lg shadow-orange-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Enregistrement...
                </>
              ) : (
                <>
                  <Zap size={18} />
                  {product.has_promo ? "Mettre à jour" : "Activer la promo"}
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}

export default function ProductsPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [updatingIds, setUpdatingIds] = useState<number[]>([]);
  const [promoModalOpen, setPromoModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const fetchData = async () => {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (!user || userError) {
        setUser(null);
        setLoading(false);
        return;
      }
      setUser(user);
      const { data: products, error: productsError } = await supabase
        .from("product")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (productsError) {
        setError(productsError.message);
      } else {
        setProducts(
          (products || []).map((p: any) => ({
            ...p,
            in_stock: typeof p.in_stock === "boolean" ? p.in_stock : true,
            has_promo: p.has_promo || false,
          })),
        );
      }
      setLoading(false);
    };
    fetchData();
  }, [supabase]);

  // Désactive automatiquement les promos expirées
  useEffect(() => {
    const checkExpiredPromos = async () => {
      const now = new Date();
      const expired = products.filter(
        (p) =>
          p.has_promo &&
          p.promo_expiration &&
          new Date(p.promo_expiration) < now,
      );
      for (const p of expired) {
        await supabase
          .from("product")
          .update({
            has_promo: false,
            promo_price: null,
            promo_percentage: null,
            promo_expiration: null,
          })
          .eq("id", p.id);
      }
      if (expired.length > 0) {
        setProducts((prev) =>
          prev.map((p) =>
            expired.some((ep) => ep.id === p.id)
              ? {
                  ...p,
                  has_promo: false,
                  promo_price: undefined,
                  promo_percentage: undefined,
                  promo_expiration: undefined,
                }
              : p,
          ),
        );
      }
    };
    const interval = setInterval(checkExpiredPromos, 60_000);
    checkExpiredPromos();
    return () => clearInterval(interval);
  }, [products, supabase]);

  const isUpdating = (id: number) => updatingIds.includes(id);

  const toggleInStock = async (
    productId: number,
    currentValue: boolean | undefined,
  ) => {
    const newValue = !currentValue;
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, in_stock: newValue } : p)),
    );
    setUpdatingIds((prev) => [...prev, productId]);
    const { error: updateError } = await supabase
      .from("product")
      .update({ in_stock: newValue })
      .eq("id", productId);
    if (updateError) {
      setProducts((prev) =>
        prev.map((p) =>
          p.id === productId ? { ...p, in_stock: !!currentValue } : p,
        ),
      );
      setError(updateError.message);
    }
    setUpdatingIds((prev) => prev.filter((id) => id !== productId));
  };

  const openPromoModal = (product: Product) => {
    setSelectedProduct(product);
    setPromoModalOpen(true);
  };

  const handleSavePromo = async (data: any) => {
    const { error: updateError } = await supabase
      .from("product")
      .update({
        has_promo: data.has_promo,
        promo_price: data.promo_price,
        promo_percentage: data.promo_percentage,
        promo_expiration: data.promo_expiration, // ✅ bonne colonne
      })
      .eq("id", data.id);
    if (updateError) {
      setError(updateError.message);
      throw updateError;
    }
    setProducts((prev) =>
      prev.map((p) =>
        p.id === data.id
          ? {
              ...p,
              has_promo: data.has_promo,
              promo_price: data.promo_price,
              promo_percentage: data.promo_percentage,
              promo_expiration: data.promo_expiration,
            }
          : p,
      ),
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF9F6] dark:bg-black">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
          <p className="text-[#1A1A1A] dark:text-white font-semibold">
            Chargement...
          </p>
        </div>
      </div>
    );
  }

  if (!user)
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF9F6] dark:bg-black">
        <AuthModal />
      </div>
    );
  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500">{error}</p>
      </div>
    );

  const totalProducts = products.length;
  const totalValue = products.reduce(
    (sum, p) => sum + (parseFloat(p.price) || 0),
    0,
  );
  const recentProducts = products.filter(
    (p) => new Date(p.created_at) >= new Date(Date.now() - 7 * 86_400_000),
  ).length;
  const activePromos = products.filter((p) => p.has_promo).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FAF9F6] via-[#F4C430]/5 to-[#FFD55A]/10 dark:from-[#0a0a0a] dark:via-[#111111] dark:to-[#0f0f0f] relative overflow-hidden">
      <div className="absolute inset-0 opacity-30 pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-[#F4C430]/20 rounded-full blur-xl animate-pulse" />
        <div
          className="absolute top-40 right-20 w-48 h-48 bg-[#FFD55A]/20 rounded-full blur-xl animate-bounce"
          style={{ animationDuration: "6s" }}
        />
        <div
          className="absolute bottom-32 left-1/4 w-40 h-40 bg-[#E9961A]/10 rounded-full blur-2xl animate-ping"
          style={{ animationDuration: "4s" }}
        />
      </div>

      <PromoModal
        isOpen={promoModalOpen}
        onClose={() => setPromoModalOpen(false)}
        product={selectedProduct}
        onSavePromo={handleSavePromo}
      />

      <div className="relative z-10 px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <BackButton />

          {/* Header */}
          <div className="mb-12">
            <div className="relative bg-gradient-to-r from-[#F4C430] to-[#E9961A] p-8 rounded-3xl shadow-2xl overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12" />
              <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                  <div className="bg-[#1A1A1A]/20 backdrop-blur-sm p-4 rounded-2xl shadow-lg">
                    <Store className="w-8 h-8 text-[#1A1A1A]" />
                  </div>
                  <div>
                    <h1 className="text-4xl font-black text-[#1A1A1A] mb-2 tracking-tight">
                      Votre Empire Commercial 👑
                    </h1>
                    <p className="text-[#1A1A1A]/90 text-lg font-medium">
                      Dirigez votre boutique avec style et panache !
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="bg-[#1A1A1A]/20 backdrop-blur-sm p-4 rounded-xl text-center min-w-[80px]">
                    <div className="text-2xl font-bold text-[#1A1A1A]">
                      {totalProducts}
                    </div>
                    <div className="text-[#1A1A1A]/80 text-sm">Produits</div>
                  </div>
                  <div className="bg-[#1A1A1A]/20 backdrop-blur-sm p-4 rounded-xl text-center min-w-[120px]">
                    <div className="text-2xl font-bold text-[#1A1A1A]">
                      {totalValue.toLocaleString()}
                    </div>
                    <div className="text-[#1A1A1A]/80 text-sm">FCFA</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
            {[
              {
                icon: Package,
                label: "Total Produits",
                value: totalProducts,
                grad: "from-[#F4C430] to-[#FFD55A]",
                dark: false,
              },
              {
                icon: TrendingUp,
                label: "Nouveaux (7j)",
                value: recentProducts,
                grad: "from-[#E9961A] to-[#F4C430]",
                dark: false,
              },
              {
                icon: Star,
                label: "Valeur Totale",
                value: `${totalValue.toLocaleString()} FCFA`,
                grad: "from-[#FFD55A] to-[#E9961A]",
                dark: false,
              },
            ].map(({ icon: Icon, label, value, grad }) => (
              <div
                key={label}
                className="bg-white/80 dark:bg-[#1a1a1a]/80 backdrop-blur-sm border border-[#F4C430]/20 dark:border-[#333]/50 rounded-2xl p-6 shadow-lg"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`bg-gradient-to-r ${grad} p-3 rounded-xl shadow-md`}
                  >
                    <Icon className="w-6 h-6 text-[#1A1A1A]" />
                  </div>
                  <div>
                    <p className="text-sm text-[#1A1A1A]/70 dark:text-[#aaa]">
                      {label}
                    </p>
                    <p className="text-2xl font-bold text-[#1A1A1A] dark:text-white">
                      {value}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            <div className="bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 backdrop-blur-sm border border-red-200 dark:border-red-800 rounded-2xl p-6 shadow-lg">
              <div className="flex items-center gap-4">
                <div className="bg-gradient-to-r from-red-500 to-pink-500 p-3 rounded-xl shadow-md">
                  <Zap className="w-6 h-6 text-white" fill="currentColor" />
                </div>
                <div>
                  <p className="text-sm text-red-900 dark:text-red-100">
                    Promos Actives
                  </p>
                  <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                    {activePromos}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Bar */}
          <div className="bg-white/80 dark:bg-[#1a1a1a]/80 backdrop-blur-sm border border-[#F4C430]/20 dark:border-[#333]/50 rounded-2xl p-6 mb-8 shadow-lg">
            <div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
              <div className="flex flex-1 gap-3">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#1A1A1A]/70 dark:text-[#aaa]" />
                  <input
                    type="text"
                    placeholder="Rechercher vos produits..."
                    className="w-full pl-10 pr-4 py-3 bg-[#FAF9F6]/50 dark:bg-[#2a2a2a]/50 border border-[#F4C430]/30 dark:border-[#333] rounded-xl text-[#1A1A1A] dark:text-white"
                  />
                </div>
                <button className="px-4 py-3 bg-[#FAF9F6] dark:bg-[#2a2a2a] border border-[#F4C430]/30 dark:border-[#333] rounded-xl text-[#1A1A1A] dark:text-white">
                  <Filter className="w-4 h-4" />
                </button>
                <button className="px-4 py-3 bg-[#FAF9F6] dark:bg-[#2a2a2a] border border-[#F4C430]/30 dark:border-[#333] rounded-xl text-[#1A1A1A] dark:text-white">
                  <Grid className="w-4 h-4" />
                </button>
              </div>
              <ApplyAllPromo />
              <Link
                href="/dashboard/add"
                className="bg-gradient-to-r from-[#F4C430] to-[#E9961A] text-[#1A1A1A] px-6 py-3 rounded-xl shadow-lg font-semibold flex items-center justify-center gap-2 hover:shadow-xl transition-all"
              >
                <Plus className="w-4 h-4" /> Créer un produit
              </Link>
            </div>
          </div>

          {/* Products Grid */}
          {products.length === 0 ? (
            <div className="text-center py-20">
              <div className="bg-white/80 dark:bg-[#1a1a1a]/80 backdrop-blur-sm border border-[#F4C430]/20 dark:border-[#333]/50 rounded-3xl p-12 shadow-lg max-w-lg mx-auto">
                <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-[#F4C430]/20 to-[#E9961A]/20 rounded-full flex items-center justify-center">
                  <Package className="w-16 h-16 text-[#E9961A]" />
                </div>
                <h3 className="text-2xl font-bold text-[#1A1A1A] dark:text-white mb-4">
                  Votre vitrine vous attend ! ✨
                </h3>
                <p className="text-[#1A1A1A]/70 dark:text-[#aaa] mb-8 leading-relaxed">
                  Commencez à bâtir votre empire commercial en ajoutant votre
                  premier produit.
                </p>
                <Link
                  href="/dashboard/add"
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-[#F4C430] to-[#E9961A] text-[#1A1A1A] px-8 py-4 rounded-xl shadow-lg font-semibold hover:shadow-2xl transition-all"
                >
                  <Plus className="w-5 h-5" /> Ajouter mon premier produit
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {products.map((product, index) => {
                const outOfStock = product.in_stock === false;
                const isNew =
                  new Date(product.created_at) >
                  new Date(Date.now() - 7 * 86_400_000);
                const hasActivePromo =
                  product.has_promo &&
                  (!product.promo_expiration ||
                    new Date(product.promo_expiration) > new Date());
                const originalPrice = parseFloat(product.price);
                const displayPrice =
                  hasActivePromo && product.promo_price
                    ? product.promo_price
                    : originalPrice;

                return (
                  <div
                    key={product.id}
                    className={`group relative bg-white dark:bg-[#1a1a1a] rounded-3xl overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-orange-500/10 hover:-translate-y-2 ${outOfStock ? "opacity-80" : ""}`}
                    style={{
                      animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`,
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/0 to-transparent group-hover:via-white/10 transition-all duration-700 -translate-x-full group-hover:translate-x-full pointer-events-none" />

                    {isNew && !hasActivePromo && (
                      <div className="absolute top-4 -right-12 bg-gradient-to-r from-amber-400 via-orange-500 to-amber-400 text-white text-xs font-bold px-14 py-2 rotate-45 shadow-lg z-10 animate-pulse">
                        ✨ NOUVEAU
                      </div>
                    )}

                    <div className="relative h-64 overflow-hidden bg-gradient-to-b from-transparent to-black/5">
                      <ProductImage
                        src={product.image_url}
                        alt={product.title}
                        outOfStock={outOfStock}
                        hasPromo={hasActivePromo}
                        promoPercentage={product.promo_percentage}
                      />
                      {outOfStock && (
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent backdrop-blur-[2px] flex items-center justify-center">
                          <div className="bg-red-500/90 backdrop-blur-md text-white px-6 py-2.5 rounded-full shadow-2xl font-bold text-sm border-2 border-white/20 flex items-center gap-2 animate-bounce">
                            <Package size={16} /> RUPTURE DE STOCK
                          </div>
                        </div>
                      )}
                      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white dark:from-[#1a1a1a] to-transparent" />
                    </div>

                    <div className="p-6 space-y-4">
                      <div className="space-y-2">
                        <h3
                          className={`text-xl font-bold text-slate-900 dark:text-white transition-colors duration-300 group-hover:text-orange-500 ${outOfStock ? "line-through opacity-50" : ""}`}
                        >
                          {product.title}
                        </h3>
                        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                          <Calendar size={14} className="text-orange-400" />
                          <span>
                            Ajouté le{" "}
                            {new Date(product.created_at).toLocaleDateString(
                              "fr-FR",
                              {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                              },
                            )}
                          </span>
                        </div>
                      </div>

                      <p
                        className={`text-sm text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed ${outOfStock ? "opacity-50" : ""}`}
                      >
                        {product.description}
                      </p>

                      {/* Prix */}
                      <div className="space-y-2">
                        {hasActivePromo ? (
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-slate-400 dark:text-slate-500 line-through">
                                {originalPrice.toLocaleString()} FCFA
                              </span>
                              <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-2 py-0.5 rounded-md text-xs font-black">
                                -{product.promo_percentage}%
                              </div>
                            </div>
                            <div className="flex items-end gap-3">
                              <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-pink-500">
                                {displayPrice.toLocaleString()}
                              </div>
                              <span className="text-lg font-bold pb-1 text-red-500">
                                FCFA
                              </span>
                            </div>
                            {product.promo_expiration && (
                              <div className="flex items-center gap-1 text-xs text-red-600 dark:text-red-400">
                                <Clock size={12} />
                                Expire le{" "}
                                {new Date(
                                  product.promo_expiration,
                                ).toLocaleDateString("fr-FR", {
                                  day: "numeric",
                                  month: "short",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="flex items-end gap-3 pt-2">
                            <div
                              className={`text-3xl font-black transition-all duration-300 ${outOfStock ? "text-slate-300 dark:text-slate-600 line-through" : "text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-500"}`}
                            >
                              {originalPrice.toLocaleString()}
                            </div>
                            <span
                              className={`text-lg font-bold pb-1 ${outOfStock ? "text-slate-400" : "text-orange-500"}`}
                            >
                              FCFA
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Toggle stock */}
                      <div className="flex items-center justify-between py-3 px-4 bg-slate-50 dark:bg-[#0f0f0f] rounded-2xl border border-slate-200 dark:border-slate-800">
                        <label className="flex items-center gap-3 cursor-pointer select-none">
                          <div className="relative">
                            <input
                              type="checkbox"
                              checked={!!product.in_stock}
                              onChange={() =>
                                toggleInStock(product.id, product.in_stock)
                              }
                              disabled={isUpdating(product.id)}
                              className="sr-only"
                            />
                            <div
                              className={`w-14 h-7 rounded-full transition-all duration-300 ${product.in_stock ? "bg-gradient-to-r from-emerald-400 to-green-500 shadow-lg shadow-emerald-500/30" : "bg-slate-300 dark:bg-slate-700"}`}
                            />
                            <div
                              className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow-md transform transition-all duration-300 flex items-center justify-center ${product.in_stock ? "translate-x-7" : "translate-x-0"}`}
                            >
                              {isUpdating(product.id) ? (
                                <div className="w-3 h-3 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <div
                                  className={`w-2 h-2 rounded-full ${product.in_stock ? "bg-emerald-500" : "bg-slate-400"}`}
                                />
                              )}
                            </div>
                          </div>
                          <span
                            className={`text-sm font-bold transition-colors ${product.in_stock ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}
                          >
                            {product.in_stock ? "✓ En Stock" : "✕ Rupture"}
                          </span>
                        </label>
                      </div>

                      {/* Bouton promo */}
                      <button
                        onClick={() => openPromoModal(product)}
                        className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-sm transition-all duration-300 hover:scale-[1.02] active:scale-95 ${
                          hasActivePromo
                            ? "bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white shadow-lg shadow-red-500/30"
                            : "bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white shadow-lg shadow-purple-500/30"
                        }`}
                      >
                        {hasActivePromo ? (
                          <>
                            <Zap size={16} fill="currentColor" /> Gérer la promo
                          </>
                        ) : (
                          <>
                            <Tag size={16} /> Créer une promo
                          </>
                        )}
                      </button>

                      {/* Boutons modifier / supprimer */}
                      <div className="flex gap-3">
                        <Link
                          href={`/dashboard/edit/${product.id}`}
                          className="flex-1"
                        >
                          <button className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white px-4 py-3 rounded-xl font-bold text-sm transition-all shadow-lg hover:scale-[1.02] active:scale-95">
                            <Edit2 size={16} /> Modifier
                          </button>
                        </Link>
                        <DeleteButton id={product.id} />
                      </div>

                      {outOfStock && (
                        <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                          <Package
                            size={16}
                            className="text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0"
                          />
                          <p className="text-xs text-red-700 dark:text-red-300 font-medium leading-relaxed">
                            Ce produit n'apparaîtra pas comme disponible jusqu'à
                            remise en stock.
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="absolute inset-0 border-2 border-transparent group-hover:border-orange-500/20 rounded-3xl transition-all duration-500 pointer-events-none" />
                  </div>
                );
              })}
            </div>
          )}

          {products.length > 0 && (
            <div className="mt-16 text-center">
              <div className="bg-gradient-to-r from-[#F4C430]/20 to-[#FFD55A]/10 dark:from-[#F4C430]/10 dark:to-[#E9961A]/10 backdrop-blur-sm border border-[#F4C430]/30 rounded-3xl p-8 max-w-2xl mx-auto">
                <h3 className="text-2xl font-bold text-[#1A1A1A] dark:text-white mb-4">
                  🎉 Félicitations, entrepreneur !
                </h3>
                <p className="text-[#1A1A1A]/70 dark:text-[#aaa] leading-relaxed">
                  Votre boutique grandit jour après jour. Continuez à ajouter
                  des produits et regardez votre empire commercial prospérer !
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
