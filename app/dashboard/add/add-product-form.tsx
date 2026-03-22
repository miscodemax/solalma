"use client";

import { getCurrentPositionSafe } from "@/lib/location";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import Image from "next/image";
import ImageUploader from "./imageuploader";
import { ChevronLeft, MapPin, Share2, X, Copy, Check } from "lucide-react";

type Props = { userId: string };

const categories = [
  { value: "vetement", label: "Vêtements" },
  { value: "soins_et_astuces", label: "Soins & Astuces" },
  { value: "maquillage", label: "Maquillage" },
  { value: "artisanat", label: "Artisanat" },
  { value: "electronique", label: "Électronique" },
  { value: "accessoire", label: "Accessoires" },
  { value: "chaussure", label: "Chaussures" },
  { value: "otaku", label: "Otaku" },
];

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

// ── Modal de partage ──────────────────────────────────────────────────────────
function ShareModal({
  productId,
  productTitle,
  productPrice,
  onClose,
  onSkip,
}: {
  productId: number;
  productTitle: string;
  productPrice: string;
  onClose: () => void;
  onSkip: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const productUrl = `https://sangse.shop/product/${productId}`;
  const shareText = `🛍️ ${productTitle} — ${Number(productPrice).toLocaleString()} FCFA\n\nDisponible sur Sangse.shop 👇\n${productUrl}`;

  const handleNativeShare = async () => {
    // Web Share API — ouvre le panneau de partage natif du téléphone
    if (navigator.share) {
      try {
        await navigator.share({
          title: productTitle,
          text: `🛍️ ${productTitle} — ${Number(productPrice).toLocaleString()} FCFA`,
          url: productUrl,
        });
        // Après partage, on ferme et redirige
        onClose();
      } catch (err) {
        // L'user a annulé le partage — on reste sur le modal
        console.log("Partage annulé");
      }
    } else {
      // Fallback si Web Share API non supportée
      handleCopy();
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback pour anciens navigateurs
      const ta = document.createElement("textarea");
      ta.value = shareText;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleWhatsApp = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    // Overlay
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Fond sombre */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onSkip}
      />

      {/* Sheet / modal */}
      <div className="relative w-full sm:max-w-md bg-white dark:bg-[#1e1e1e] rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden animate-slide-up">
        {/* Drag handle mobile */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 bg-gray-300 dark:bg-gray-600 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-4 pb-2">
          <div>
            <h3 className="text-lg font-black text-[#1C1C1C] dark:text-white">
              🎉 Produit publié !
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              Partagez-le pour maximiser vos ventes
            </p>
          </div>
          <button
            onClick={onSkip}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Aperçu produit */}
        <div className="mx-6 my-4 flex items-center gap-3 bg-[#F4B400]/10 border border-[#F4B400]/30 rounded-2xl px-4 py-3">
          <div className="w-10 h-10 bg-[#F4B400]/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <span className="text-xl">🛍️</span>
          </div>
          <div className="min-w-0">
            <p className="font-bold text-sm text-[#1C1C1C] dark:text-white truncate">
              {productTitle}
            </p>
            <p className="text-xs text-[#F4B400] font-semibold">
              {Number(productPrice).toLocaleString()} FCFA
            </p>
          </div>
        </div>

        {/* Actions de partage */}
        <div className="px-6 pb-4 space-y-3">
          {/* Bouton partage natif (Web Share API) — affiché en priorité sur mobile */}
          <button
            onClick={handleNativeShare}
            className="w-full flex items-center justify-center gap-3 py-4 bg-gradient-to-r from-[#F4B400] to-[#FFD700] text-[#1C1C1C] font-bold rounded-2xl shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-95 transition-all"
          >
            <Share2 size={20} />
            Partager maintenant
          </button>

          {/* WhatsApp */}
          <button
            onClick={handleWhatsApp}
            className="w-full flex items-center justify-center gap-3 py-3.5 bg-[#25D366] hover:bg-[#1fb956] text-white font-semibold rounded-2xl shadow-md hover:shadow-lg transition-all hover:scale-[1.02] active:scale-95"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            Partager sur WhatsApp
          </button>

          {/* Copier le lien */}
          <button
            onClick={handleCopy}
            className={`w-full flex items-center justify-center gap-3 py-3.5 border-2 font-semibold rounded-2xl transition-all hover:scale-[1.02] active:scale-95 ${
              copied
                ? "border-green-400 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400"
                : "border-gray-200 dark:border-gray-700 bg-white dark:bg-[#2a2a2a] text-gray-700 dark:text-gray-300 hover:border-[#F4B400]/50"
            }`}
          >
            {copied ? <Check size={18} /> : <Copy size={18} />}
            {copied ? "Lien copié !" : "Copier le lien"}
          </button>
        </div>

        {/* Passer */}
        <div className="px-6 pb-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
          <button
            onClick={onSkip}
            className="w-full py-3 text-sm text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors font-medium"
          >
            Passer, aller à mes produits →
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(40px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
      `}</style>
    </div>
  );
}

// ── Formulaire principal ──────────────────────────────────────────────────────
export default function AddProductForm({ userId }: Props) {
  const [form, setForm] = useState({
    title: "",
    price: "",
    description: "",
    whatsappNumber: "",
    category: "",
    zone: "",
    hasWholesale: false,
    wholesalePrice: "",
    minWholesaleQty: "",
  });
  const [useAutoLocation, setUseAutoLocation] = useState(false);
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ── State modal de partage ──────────────────────────────────────────────────
  const [showShareModal, setShowShareModal] = useState(false);
  const [publishedProductId, setPublishedProductId] = useState<number | null>(
    null,
  );

  const router = useRouter();
  const supabase = createClient();

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setForm((prev) => ({ ...prev, [name]: checked }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleWhatsappChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, "");
    setForm((prev) => ({ ...prev, whatsappNumber: val }));
  };

  const handleAddImages = (urls: string[]) => {
    setImages(urls.slice(0, 10));
  };

  const findNearestLocation = (lat: number, lng: number) => {
    let nearest = SENEGAL_LOCATIONS[0];
    let minDistance = Infinity;
    SENEGAL_LOCATIONS.forEach((loc) => {
      const distance = Math.sqrt(
        Math.pow(loc.lat - lat, 2) + Math.pow(loc.lng - lng, 2),
      );
      if (distance < minDistance) {
        minDistance = distance;
        nearest = loc;
      }
    });
    return nearest;
  };

  const handleDetectLocation = async () => {
    setDetectingLocation(true);
    setError("");
    const coords = await getCurrentPositionSafe();
    if (!coords) {
      setError("Impossible de détecter votre position");
      setDetectingLocation(false);
      return;
    }
    const nearest = findNearestLocation(coords.lat, coords.lng);
    setForm((prev) => ({ ...prev, zone: nearest.name }));
    setUseAutoLocation(true);
    setDetectingLocation(false);
  };

  // ── Redirection après modal ─────────────────────────────────────────────────
  const goToProducts = () => {
    setShowShareModal(false);
    router.push("/dashboard/products");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (images.length === 0) {
      setError("Ajoutez au moins une photo");
      return;
    }
    if (!form.title.trim()) {
      setError("Le titre est requis");
      return;
    }
    if (!form.description.trim()) {
      setError("La description est requise");
      return;
    }
    if (!form.category) {
      setError("Sélectionnez une catégorie");
      return;
    }
    if (!form.zone) {
      setError("Sélectionnez une zone");
      return;
    }
    if (!form.price || parseFloat(form.price) <= 0) {
      setError("Prix invalide");
      return;
    }
    if (form.whatsappNumber.length < 8) {
      setError("Numéro WhatsApp invalide");
      return;
    }

    const fullNumber = "+221" + form.whatsappNumber.trim();
    if (!/^\+221\d{8,9}$/.test(fullNumber)) {
      setError("Numéro WhatsApp invalide");
      return;
    }

    if (form.hasWholesale) {
      if (
        !form.wholesalePrice ||
        parseFloat(form.wholesalePrice) >= parseFloat(form.price)
      ) {
        setError("Le prix de gros doit être inférieur au prix unitaire");
        return;
      }
      if (!form.minWholesaleQty || parseInt(form.minWholesaleQty) < 2) {
        setError("Quantité minimum : 2 unités");
        return;
      }
    }

    setLoading(true);
    try {
      const selectedZone = SENEGAL_LOCATIONS.find(
        (loc) => loc.name === form.zone,
      );
      const finalCoords = selectedZone
        ? { lat: selectedZone.lat, lng: selectedZone.lng }
        : { lat: SENEGAL_LOCATIONS[0].lat, lng: SENEGAL_LOCATIONS[0].lng };

      const { data: productData, error: productError } = await supabase
        .from("product")
        .insert({
          title: form.title.trim(),
          price: parseFloat(form.price),
          description: form.description.trim(),
          image_url: images[0],
          user_id: userId,
          whatsapp_number: fullNumber,
          category: form.category,
          zone: form.zone,
          latitude: finalCoords.lat,
          longitude: finalCoords.lng,
          has_wholesale: form.hasWholesale,
          wholesale_price: form.hasWholesale
            ? parseFloat(form.wholesalePrice)
            : null,
          min_wholesale_qty: form.hasWholesale
            ? parseInt(form.minWholesaleQty)
            : null,
        })
        .select()
        .single();

      if (productError) throw productError;

      if (images.length > 1) {
        const additionalImages = images.slice(1).map((imageUrl) => ({
          product_id: productData.id,
          image_url: imageUrl,
        }));
        const { error: imagesError } = await supabase
          .from("product_images")
          .insert(additionalImages);
        if (imagesError) throw imagesError;
      }

      // ✅ Succès — ouvrir le modal de partage plutôt que rediriger directement
      setPublishedProductId(productData.id);
      setShowShareModal(true);
    } catch (err: any) {
      setError(err.message || "Erreur lors de la création");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <div className="sticky top-0 z-40 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="px-4 py-3 flex items-center max-w-4xl mx-auto">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ChevronLeft
                size={24}
                className="text-gray-700 dark:text-gray-300"
              />
            </button>
            <h1 className="flex-1 text-center text-lg font-semibold text-gray-900 dark:text-white">
              Vends ton article
            </h1>
            <div className="w-10" />
          </div>
        </div>

        {/* Contenu */}
        <div className="max-w-4xl mx-auto px-4 py-6 pb-40">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                <p className="text-sm text-red-700 dark:text-red-200">
                  {error}
                </p>
              </div>
            )}

            {/* Photos */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Attire l'œil des acheteurs : utilise des photos de qualité
              </p>
              <ImageUploader
                onUpload={handleAddImages}
                maxImages={10}
                currentImageCount={images.length}
              />
            </div>

            {/* Titre */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <label className="block">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                  Titre
                </span>
                <input
                  type="text"
                  name="title"
                  placeholder="Ex: Robe Wax taille M"
                  value={form.title}
                  onChange={handleChange}
                  maxLength={60}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-[#F4B400] bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                <p className="text-xs text-gray-500 mt-1 text-right">
                  {form.title.length}/60
                </p>
              </label>
            </div>

            {/* Description */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <label className="block">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                  Décris ton article
                </span>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="État, taille, matière, couleur, défauts éventuels..."
                  maxLength={500}
                  rows={6}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-[#F4B400] bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                />
                <p className="text-xs text-gray-500 mt-1 text-right">
                  {form.description.length}/500
                </p>
              </label>
            </div>

            {/* Catégorie */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <label className="block">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                  Catégorie *
                </span>
                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-[#F4B400] bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">Sélectionner une catégorie</option>
                  {categories.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {/* Localisation */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-start justify-between mb-3">
                <label className="flex-1">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                    Zone *
                  </span>
                  <select
                    name="zone"
                    value={form.zone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-[#F4B400] bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">Choisir manuellement</option>
                    {SENEGAL_LOCATIONS.map((loc) => (
                      <option key={loc.name} value={loc.name}>
                        {loc.name}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <button
                type="button"
                onClick={handleDetectLocation}
                disabled={detectingLocation}
                className="w-full mt-3 px-4 py-2.5 rounded-lg border border-[#F4B400] text-[#F4B400] hover:bg-[#F4B400]/10 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <MapPin size={18} />
                {detectingLocation
                  ? "Détection..."
                  : "Utiliser ma position actuelle"}
              </button>
              {useAutoLocation && form.zone && (
                <p className="text-xs text-green-600 dark:text-green-400 mt-2 flex items-center gap-1">
                  <span>✓</span> Position détectée : {form.zone}
                </p>
              )}
            </div>

            {/* Prix */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <label className="block mb-4">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                  Prix (FCFA)
                </span>
                <input
                  type="number"
                  name="price"
                  placeholder="25000"
                  value={form.price}
                  onChange={handleChange}
                  min={0}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-[#F4B400] bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </label>
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="hasWholesale"
                    checked={form.hasWholesale}
                    onChange={handleChange}
                    className="w-5 h-5 rounded border-gray-300 text-[#F4B400] focus:ring-[#F4B400]"
                  />
                  <div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Proposer un prix de gros
                    </span>
                    <p className="text-xs text-gray-500">
                      Pour les achats en volume
                    </p>
                  </div>
                </label>
                {form.hasWholesale && (
                  <div className="grid grid-cols-2 gap-3 mt-4">
                    <div>
                      <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">
                        Prix gros (FCFA)
                      </label>
                      <input
                        type="number"
                        name="wholesalePrice"
                        placeholder="20000"
                        value={form.wholesalePrice}
                        onChange={handleChange}
                        min={0}
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-[#F4B400] bg-white dark:bg-gray-700 text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">
                        Quantité min.
                      </label>
                      <input
                        type="number"
                        name="minWholesaleQty"
                        placeholder="10"
                        value={form.minWholesaleQty}
                        onChange={handleChange}
                        min={2}
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-[#F4B400] bg-white dark:bg-gray-700 text-sm"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* WhatsApp */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <label className="block">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                  WhatsApp
                </span>
                <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-[#F4B400]">
                  <span className="px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium">
                    +221
                  </span>
                  <input
                    type="tel"
                    name="whatsappNumber"
                    placeholder="771234567"
                    value={form.whatsappNumber}
                    onChange={handleWhatsappChange}
                    maxLength={9}
                    className="flex-1 px-4 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none"
                  />
                </div>
              </label>
            </div>
          </form>
        </div>

        {/* Bouton fixe — inline styles pour forcer le rendu mobile */}
        <div
          style={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 9999,
            background: "#fff",
            borderTop: "1px solid #e5e7eb",
            padding: "12px 16px",
            paddingBottom: "calc(12px + env(safe-area-inset-bottom, 0px))",
          }}
        >
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              width: "100%",
              padding: "16px",
              borderRadius: "12px",
              background: loading ? "#ccc" : "#F4B400",
              color: "#fff",
              fontWeight: "700",
              fontSize: "16px",
              border: "none",
              cursor: loading ? "not-allowed" : "pointer",
              touchAction: "manipulation",
              WebkitTapHighlightColor: "transparent",
            }}
          >
            {loading ? (
              <>
                <div
                  style={{
                    width: 20,
                    height: 20,
                    border: "2px solid white",
                    borderTopColor: "transparent",
                    borderRadius: "50%",
                    animation: "spin 0.7s linear infinite",
                  }}
                />
                Publication...
              </>
            ) : (
              <>
                <Share2 size={18} />
                Publier mon article
              </>
            )}
          </button>
        </div>
      </div>

      {/* Modal de partage — monté après publication réussie */}
      {showShareModal && publishedProductId !== null && (
        <ShareModal
          productId={publishedProductId}
          productTitle={form.title}
          productPrice={form.price}
          onClose={goToProducts}
          onSkip={goToProducts}
        />
      )}
    </>
  );
}
