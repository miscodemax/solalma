"use client";

import { getCurrentPositionSafe } from "@/lib/location";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import Image from "next/image";
import ImageUploader from "./imageuploader";
import { ChevronLeft, MapPin } from "lucide-react";

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
  const [success, setSuccess] = useState(false);

  const router = useRouter();
  const supabase = createClient();

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
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

  const handleAddImages = (urls: string[]) =>
    setImages((prev) => [...prev, ...urls].slice(0, 5));

  const handleRemoveImage = (index: number) =>
    setImages((prev) => prev.filter((_, i) => i !== index));

  const handleSetMainImage = (index: number) => {
    setImages((prev) => {
      const newImages = [...prev];
      const [selected] = newImages.splice(index, 1);
      return [selected, ...newImages];
    });
  };

  const findNearestLocation = (lat: number, lng: number) => {
    let nearest = SENEGAL_LOCATIONS[0];
    let minDistance = Infinity;

    SENEGAL_LOCATIONS.forEach((loc) => {
      const distance = Math.sqrt(
        Math.pow(loc.lat - lat, 2) + Math.pow(loc.lng - lng, 2)
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    // Validation
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
        (loc) => loc.name === form.zone
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

      setSuccess(true);
      setTimeout(() => router.push("/dashboard/products"), 1500);
    } catch (err: any) {
      setError(err.message || "Erreur lors de la création");
    } finally {
      setLoading(false);
    }
  };

  return (
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
      <div className="max-w-4xl mx-auto px-4 py-6 pb-24">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Messages */}
          {error && (
            <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
              <p className="text-sm text-red-700 dark:text-red-200">{error}</p>
            </div>
          )}

          {success && (
            <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
              <p className="text-sm text-green-700 dark:text-green-200">
                ✅ Produit publié avec succès !
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
              maxImages={5}
              currentImageCount={images.length}
            />

            {images.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mt-4">
                {images.map((img, idx) => (
                  <div
                    key={idx}
                    className="relative aspect-square rounded-lg overflow-hidden border-2 border-gray-200 dark:border-gray-600"
                  >
                    <Image
                      src={img}
                      alt={`Photo ${idx + 1}`}
                      fill
                      className="object-cover"
                    />
                    {idx === 0 && (
                      <div className="absolute top-1 left-1 bg-[#F4B400] text-white text-[10px] font-bold px-2 py-0.5 rounded">
                        Principale
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/0 hover:bg-black/50 transition-colors flex items-center justify-center gap-1">
                      {idx !== 0 && (
                        <button
                          type="button"
                          onClick={() => handleSetMainImage(idx)}
                          className="opacity-0 hover:opacity-100 bg-white text-gray-900 text-xs px-2 py-1 rounded"
                        >
                          ★
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        className="opacity-0 hover:opacity-100 bg-red-500 text-white text-xs px-2 py-1 rounded"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
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
                <span>✓</span>
                Position détectée : {form.zone}
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

            {/* Prix de gros */}
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

      {/* Bouton de soumission fixe */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4 z-40">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full px-6 py-3.5 rounded-lg bg-[#F4B400] hover:bg-[#E9961A] text-white font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Publication...</span>
              </>
            ) : (
              "Publier mon article"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
