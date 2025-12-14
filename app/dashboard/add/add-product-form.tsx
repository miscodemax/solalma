"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import Image from "next/image";
import ImageUploader from "./imageuploader";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Camera, MapPin, Smartphone, Info } from "lucide-react";

type Props = { userId: string };

const categories = [
  { value: "vetement", label: "Vêtements", icon: "👗" },
  { value: "soins_et_astuces", label: "Soins", icon: "🧴" },
  { value: "maquillage", label: "Maquillage", icon: "💋" },
  { value: "artisanat", label: "Artisanat", icon: "🧶" },
  { value: "electronique", label: "Électronique", icon: "💻" },
  { value: "accessoire", label: "Accessoires", icon: "🕶️" },
  { value: "chaussure", label: "Chaussures", icon: "👠" },
  { value: "otaku", label: "Otaku", icon: "🎌" },
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
  const router = useRouter();
  const supabase = createClient();

  const [form, setForm] = useState({
    title: "",
    price: "",
    description: "",
    whatsappNumber: "",
    category: "",
    zone: SENEGAL_LOCATIONS[0].name,
    hasWholesale: false,
    wholesalePrice: "",
    minWholesaleQty: "",
  });

  const [images, setImages] = useState<string[]>([]);
  const [useAutoLocation, setUseAutoLocation] = useState(false);
  const [userCoords, setUserCoords] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Gestion de la localisation automatique
  const toggleAutoLocation = () => {
    if (!useAutoLocation) {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            setUserCoords({
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
            });
            setUseAutoLocation(true);
          },
          () =>
            alert(
              "Impossible d'accéder à votre position. Veuillez choisir manuellement."
            )
        );
      }
    } else {
      setUseAutoLocation(false);
      setUserCoords(null);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target;
    const val =
      type === "checkbox" ? (e.target as HTMLInputElement).checked : value;
    setForm((prev) => ({ ...prev, [name]: val }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.price || images.length === 0 || !form.category) {
      setError(
        "Remplis les champs obligatoires (Photos, Titre, Catégorie, Prix)"
      );
      return;
    }

    setLoading(true);
    try {
      const selectedZone = SENEGAL_LOCATIONS.find((l) => l.name === form.zone);
      const finalLat = userCoords?.lat || selectedZone?.lat || 14.6928;
      const finalLng = userCoords?.lng || selectedZone?.lng || -17.4467;

      const { data: product, error: pErr } = await supabase
        .from("product")
        .insert({
          title: form.title,
          price: parseFloat(form.price),
          description: form.description,
          image_url: images[0],
          user_id: userId,
          whatsapp_number: "+221" + form.whatsappNumber,
          category: form.category,
          zone: useAutoLocation ? "Ma position actuelle" : form.zone,
          latitude: finalLat,
          longitude: finalLng,
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

      if (pErr) throw pErr;

      if (images.length > 1) {
        await supabase
          .from("product_images")
          .insert(
            images
              .slice(1)
              .map((url) => ({ product_id: product.id, image_url: url }))
          );
      }

      router.push("/dashboard/products");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#EBEDEE] pb-20">
      {/* Header simple style Vinted */}
      <div className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <button onClick={() => router.back()}>
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-lg font-semibold">Vends ton article</h1>
          <div className="w-6" />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto p-4 space-y-4">
        {/* SECTION PHOTOS */}
        <div className="bg-white p-6 rounded-sm shadow-sm">
          <h2 className="text-gray-500 text-sm font-medium mb-4 uppercase tracking-wider">
            Photos
          </h2>
          <ImageUploader
            onUpload={(urls) => setImages((prev) => [...prev, ...urls])}
            maxImages={5}
            currentImageCount={images.length}
          />
          {images.length > 0 && (
            <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
              {images.map((img, i) => (
                <div
                  key={i}
                  className="relative w-20 h-20 flex-shrink-0 border rounded-md overflow-hidden"
                >
                  <Image
                    src={img}
                    alt="preview"
                    fill
                    className="object-cover"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setImages(images.filter((_, idx) => idx !== i))
                    }
                    className="absolute top-0 right-0 bg-black/50 text-white text-xs p-1"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SECTION TITRE & DESCRIPTION */}
        <div className="bg-white p-6 rounded-sm shadow-sm space-y-4">
          <div>
            <label className="text-sm text-gray-500">Titre</label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="ex: Chemise en soie"
              className="w-full border-b py-2 outline-none focus:border-[#F4B400] transition-colors"
            />
          </div>
          <div>
            <label className="text-sm text-gray-500">Décris ton article</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="ex: porté quelques fois, taille correctement"
              rows={4}
              className="w-full border rounded-md p-3 mt-2 outline-none focus:border-[#F4B400]"
            />
          </div>
        </div>

        {/* SECTION CATEGORIE */}
        <div className="bg-white p-6 rounded-sm shadow-sm">
          <label className="text-sm text-gray-500 block mb-3">Catégorie</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {categories.map((cat) => (
              <button
                key={cat.value}
                type="button"
                onClick={() => setForm((p) => ({ ...p, category: cat.value }))}
                className={`flex flex-col items-center p-3 border rounded-md transition-all ${
                  form.category === cat.value
                    ? "border-[#F4B400] bg-[#F4B400]/5"
                    : "border-gray-100"
                }`}
              >
                <span className="text-2xl mb-1">{cat.icon}</span>
                <span className="text-[10px] font-medium uppercase text-center">
                  {cat.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* SECTION LOCALISATION (Le choix hybride) */}
        <div className="bg-white p-6 rounded-sm shadow-sm">
          <h2 className="text-gray-500 text-sm font-medium mb-4 uppercase tracking-wider">
            Emplacement
          </h2>
          <div className="flex flex-col gap-4">
            <div
              onClick={toggleAutoLocation}
              className={`flex items-center gap-3 p-4 border rounded-md cursor-pointer transition-all ${
                useAutoLocation
                  ? "border-[#F4B400] bg-[#F4B400]/5"
                  : "bg-gray-50"
              }`}
            >
              <MapPin
                className={useAutoLocation ? "text-[#F4B400]" : "text-gray-400"}
              />
              <div className="flex-1">
                <p className="text-sm font-semibold">
                  Utiliser ma position actuelle
                </p>
                <p className="text-xs text-gray-500">
                  {useAutoLocation
                    ? "Position activée"
                    : "Clique pour détecter"}
                </p>
              </div>
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  useAutoLocation ? "border-[#F4B400]" : "border-gray-300"
                }`}
              >
                {useAutoLocation && (
                  <div className="w-2.5 h-2.5 bg-[#F4B400] rounded-full" />
                )}
              </div>
            </div>

            {!useAutoLocation && (
              <div className="space-y-2">
                <label className="text-xs text-gray-400">
                  Ou choisis manuellement :
                </label>
                <select
                  name="zone"
                  value={form.zone}
                  onChange={handleChange}
                  className="w-full p-3 border rounded-md bg-white outline-none"
                >
                  {SENEGAL_LOCATIONS.map((l) => (
                    <option key={l.name} value={l.name}>
                      {l.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* SECTION PRIX & WHATSAPP */}
        <div className="bg-white p-6 rounded-sm shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b pb-4">
            <label className="font-medium">Prix</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                name="price"
                value={form.price}
                onChange={handleChange}
                placeholder="0.00"
                className="text-right font-bold text-lg outline-none w-24"
              />
              <span className="font-bold">FCFA</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Smartphone size={20} className="text-gray-400" />
              <label className="text-sm font-medium">WhatsApp</label>
            </div>
            <div className="flex items-center border rounded-md overflow-hidden">
              <span className="bg-gray-100 px-2 py-2 text-sm text-gray-500 border-r">
                +221
              </span>
              <input
                name="whatsappNumber"
                value={form.whatsappNumber}
                onChange={handleChange}
                placeholder="77..."
                className="px-2 py-2 w-32 outline-none text-sm"
              />
            </div>
          </div>

          <div className="pt-4 border-t">
            <div className="flex items-center justify-between">
              <span className="text-sm">Vendre en gros ?</span>
              <input
                type="checkbox"
                name="hasWholesale"
                checked={form.hasWholesale}
                onChange={handleChange}
                className="w-5 h-5 accent-[#F4B400]"
              />
            </div>
            {form.hasWholesale && (
              <div className="grid grid-cols-2 gap-4 mt-4 animate-in fade-in slide-in-from-top-2">
                <input
                  name="wholesalePrice"
                  value={form.wholesalePrice}
                  onChange={handleChange}
                  placeholder="Prix de gros"
                  className="border p-2 rounded text-sm"
                />
                <input
                  name="minWholesaleQty"
                  value={form.minWholesaleQty}
                  onChange={handleChange}
                  placeholder="Qté min."
                  className="border p-2 rounded text-sm"
                />
              </div>
            )}
          </div>
        </div>

        {error && <p className="text-red-500 text-sm text-center">{error}</p>}

        {/* BOUTON FINAL */}
        <Button
          disabled={loading}
          className="w-full py-6 bg-[#F4B400] hover:bg-[#E9961A] text-white font-bold text-lg rounded-sm shadow-md"
        >
          {loading ? "Publication en cours..." : "Ajouter l'article"}
        </Button>
      </form>
    </div>
  );
}
