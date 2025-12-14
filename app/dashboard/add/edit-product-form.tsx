"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import Image from "next/image";
import { ChevronLeft, X } from "lucide-react";

type Props = {
  product: {
    id: number;
    title: string;
    price: number;
    description: string;
    images: string[];
    whatsapp_number?: string;
    category?: string;
    zone?: string;
    has_wholesale?: boolean;
    wholesale_price?: number;
    min_wholesale_qty?: number;
  };
};

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
  "Dakar",
  "Plateau",
  "Médina",
  "Yoff",
  "Sacré-Coeur",
  "Almadies",
  "Ngor",
  "Ouakam",
  "Point E",
  "Mermoz",
  "Fann",
  "Liberté",
  "HLM",
  "Grand Dakar",
  "Pikine",
  "Guédiawaye",
  "Parcelles Assainies",
  "Rufisque",
  "Thiès",
  "Kaolack",
  "Saint-Louis",
  "Mbour",
  "Diourbel",
  "Ziguinchor",
];

export default function EditProductForm({ product }: Props) {
  const [form, setForm] = useState({
    title: product.title,
    price: product.price.toString(),
    description: product.description,
    whatsappNumber: product.whatsapp_number?.replace("+221", "") || "",
    category: product.category || "",
    zone: product.zone || "",
    hasWholesale: product.has_wholesale || false,
    wholesalePrice: product.wholesale_price?.toString() || "",
    minWholesaleQty: product.min_wholesale_qty?.toString() || "",
  });

  const [images, setImages] = useState<string[]>(product.images || []);
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);
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

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const validFiles: File[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.size > 10 * 1024 * 1024) {
        setError("Une ou plusieurs images sont trop volumineuses (max 10MB)");
        continue;
      }
      if (!file.type.startsWith("image/")) {
        setError("Seules les images sont acceptées");
        continue;
      }
      validFiles.push(file);
    }

    setNewImageFiles((prev) =>
      [...prev, ...validFiles].slice(0, 5 - images.length)
    );
    e.target.value = "";
  };

  const handleRemoveExistingImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRemoveNewImage = (index: number) => {
    setNewImageFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSetMainImage = (index: number) => {
    setImages((prev) => {
      const newImages = [...prev];
      const [selected] = newImages.splice(index, 1);
      return [selected, ...newImages];
    });
  };

  const uploadNewImages = async (): Promise<string[]> => {
    if (newImageFiles.length === 0) return [];

    setUploadingImages(true);
    const uploadedUrls: string[] = [];

    try {
      for (const file of newImageFiles) {
        const fileExt = file.name.split(".").pop();
        const fileName = `${Date.now()}-${Math.random()
          .toString(36)
          .substring(2, 8)}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("product")
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage
          .from("product")
          .getPublicUrl(fileName);
        uploadedUrls.push(data.publicUrl);
      }

      return uploadedUrls;
    } catch (err) {
      throw new Error("Erreur lors de l'upload des images");
    } finally {
      setUploadingImages(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    // Validation
    if (images.length === 0 && newImageFiles.length === 0) {
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
      // Upload des nouvelles images
      const newUploadedUrls = await uploadNewImages();
      const allImages = [...images, ...newUploadedUrls];

      if (allImages.length === 0) {
        setError("Aucune image disponible");
        setLoading(false);
        return;
      }

      // Mise à jour du produit
      const { error: updateError } = await supabase
        .from("product")
        .update({
          title: form.title.trim(),
          price: parseFloat(form.price),
          description: form.description.trim(),
          image_url: allImages[0],
          whatsapp_number: fullNumber,
          category: form.category,
          zone: form.zone,
          has_wholesale: form.hasWholesale,
          wholesale_price: form.hasWholesale
            ? parseFloat(form.wholesalePrice)
            : null,
          min_wholesale_qty: form.hasWholesale
            ? parseInt(form.minWholesaleQty)
            : null,
        })
        .eq("id", product.id);

      if (updateError) throw updateError;

      // Mise à jour des images supplémentaires
      await supabase
        .from("product_images")
        .delete()
        .eq("product_id", product.id);

      if (allImages.length > 1) {
        const additionalImages = allImages.slice(1).map((imageUrl) => ({
          product_id: product.id,
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
      setError(err.message || "Erreur lors de la modification");
    } finally {
      setLoading(false);
    }
  };

  const totalImages = images.length + newImageFiles.length;

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
            Modifier ton article
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
                ✅ Produit modifié avec succès !
              </p>
            </div>
          )}

          {/* Photos */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Modifie tes photos ({totalImages}/5)
            </p>

            {/* Images existantes */}
            {(images.length > 0 || newImageFiles.length > 0) && (
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mb-4">
                {images.map((img, idx) => (
                  <div
                    key={`existing-${idx}`}
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
                        onClick={() => handleRemoveExistingImage(idx)}
                        className="opacity-0 hover:opacity-100 bg-red-500 text-white text-xs px-2 py-1 rounded"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))}

                {newImageFiles.map((file, idx) => (
                  <div
                    key={`new-${idx}`}
                    className="relative aspect-square rounded-lg overflow-hidden border-2 border-green-400 dark:border-green-600"
                  >
                    <Image
                      src={URL.createObjectURL(file)}
                      alt={`Nouvelle ${idx + 1}`}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute top-1 left-1 bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                      Nouvelle
                    </div>
                    <div className="absolute inset-0 bg-black/0 hover:bg-black/50 transition-colors flex items-center justify-center">
                      <button
                        type="button"
                        onClick={() => handleRemoveNewImage(idx)}
                        className="opacity-0 hover:opacity-100 bg-red-500 text-white p-2 rounded-full"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Bouton ajouter des images */}
            {totalImages < 5 && (
              <label className="block w-full cursor-pointer">
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 hover:border-[#F4B400] hover:bg-[#F4B400]/5 transition-colors text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    + Ajouter des photos ({5 - totalImages} restantes)
                  </p>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageSelect}
                  className="hidden"
                />
              </label>
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
                Description
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

          {/* Zone */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <label className="block">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                Zone *
              </span>
              <select
                name="zone"
                value={form.zone}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-[#F4B400] bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">Sélectionner une zone</option>
                {SENEGAL_LOCATIONS.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </label>
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
            disabled={loading || uploadingImages}
            className="w-full px-6 py-3.5 rounded-lg bg-[#F4B400] hover:bg-[#E9961A] text-white font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading || uploadingImages ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>
                  {uploadingImages ? "Upload en cours..." : "Modification..."}
                </span>
              </>
            ) : (
              "Sauvegarder les modifications"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
