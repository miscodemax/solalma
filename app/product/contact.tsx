"use client";

import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Package, Hash } from "lucide-react";

interface ProductContactProps {
  product: {
    id: string | number;
    title: string;
    user_id: string;
    category: "vetement" | "chaussure" | "autre";
    price: number;
    image_url?: string;
    images?: string[];
    whatsapp_number?: string;
    has_wholesale?: boolean;
    wholesale_price?: number;
    min_wholesale_qty?: number;
  };
  customerName?: string;
  className?: string;
}

export default function ProductContact({
  product,
  customerName,
  className = "",
}: ProductContactProps) {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [step, setStep] = useState(0);

  const [customData, setCustomData] = useState({
    taillePointure: "",
    quantite: 1,
  });

  const isClothing = product.category === "vetement";
  const isShoes = product.category === "chaussure";

  const taillesVetements = ["XS", "S", "M", "L", "XL", "XXL"];
  const pointuresChaussures = [
    "36",
    "37",
    "38",
    "39",
    "40",
    "41",
    "42",
    "43",
    "44",
  ];

  const { prixTotal, isWholesaleApplied } = useMemo(() => {
    const isWholesalePossible =
      product.has_wholesale &&
      product.wholesale_price != null &&
      product.min_wholesale_qty != null;

    const applied =
      isWholesalePossible && customData.quantite >= product.min_wholesale_qty!;

    const unit = applied ? product.wholesale_price! : product.price;

    return {
      prixTotal: unit * customData.quantite,
      isWholesaleApplied: applied,
    };
  }, [customData.quantite, product]);

  /* ============================
     LIEN PRODUIT
  ============================ */
  const productUrl = `/product/${product.id}`;

  /* ============================
     IMAGE PRINCIPALE
  ============================ */
  const mainImage =
    product.image_url ||
    (product.images && product.images.length > 0 ? product.images[0] : null);

  /* ============================
     MESSAGE WHATSAPP
  ============================ */
  const buildWhatsAppMessage = () => {
    const lines = [
      `Bonjour 👋 Je suis intéressé par votre article :`,
      ``,
      `🛍️ *${product.title}*`,
      customData.taillePointure
        ? `📏 ${isClothing ? "Taille" : "Pointure"} : *${customData.taillePointure}*`
        : "",
      `🔢 Quantité : *${customData.quantite}*`,
      `💰 Budget estimé : *${prixTotal.toLocaleString()} FCFA*${isWholesaleApplied ? " _(prix gros)_" : ""}`,
      ``,
      `🔗 Voir le produit : https://sangse.shop${productUrl}`,
      mainImage ? `🖼️ Photo : ${mainImage}` : "",
      ``,
      `Pouvez-vous confirmer la disponibilité ? Merci !`,
    ];

    return lines.filter((l) => l !== "").join("\n");
  };

  /* ============================
     REDIRECTION WHATSAPP
  ============================ */
  const openWhatsApp = () => {
    const rawNumber = product.whatsapp_number?.replace(/\D/g, "") ?? "";

    if (!rawNumber) {
      alert("Le vendeur n'a pas renseigné de numéro WhatsApp.");
      return;
    }

    const message = buildWhatsAppMessage();
    const encodedMsg = encodeURIComponent(message);
    const url = `https://wa.me/${rawNumber}?text=${encodedMsg}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  /* ============================
     FORM STEPS
  ============================ */
  const formSteps: {
    title: string;
    icon: React.ReactNode;
    content: React.ReactNode;
  }[] = [];

  if (isClothing || isShoes) {
    formSteps.push({
      title: isClothing
        ? "Choisissez votre taille"
        : "Choisissez votre pointure",
      icon: <Package className="w-5 h-5" />,
      content: (
        <div className="grid grid-cols-3 gap-2 py-2">
          {(isClothing ? taillesVetements : pointuresChaussures).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() =>
                setCustomData({ ...customData, taillePointure: v })
              }
              className={`px-4 py-3 rounded-xl border-2 font-medium transition-colors ${
                customData.taillePointure === v
                  ? "bg-yellow-400 text-white border-yellow-400"
                  : "border-gray-200 hover:border-yellow-300"
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      ),
    });
  }

  formSteps.push({
    title: "Quantité souhaitée",
    icon: <Hash className="w-5 h-5" />,
    content: (
      <div className="flex flex-col items-center gap-4 py-4">
        <div className="flex items-center gap-6">
          <button
            type="button"
            onClick={() =>
              customData.quantite > 1 &&
              setCustomData({
                ...customData,
                quantite: customData.quantite - 1,
              })
            }
            className="w-11 h-11 rounded-full bg-gray-100 hover:bg-gray-200 text-xl font-bold transition-colors"
          >
            −
          </button>
          <span className="text-3xl font-bold w-10 text-center">
            {customData.quantite}
          </span>
          <button
            type="button"
            onClick={() =>
              setCustomData({
                ...customData,
                quantite: customData.quantite + 1,
              })
            }
            className="w-11 h-11 rounded-full bg-gray-100 hover:bg-gray-200 text-xl font-bold transition-colors"
          >
            +
          </button>
        </div>

        {/* Prix total estimé */}
        <div className="text-center mt-2">
          <p className="text-sm text-gray-500">Total estimé</p>
          <p className="text-2xl font-bold text-yellow-500">
            {prixTotal.toLocaleString()} FCFA
          </p>
          {isWholesaleApplied && (
            <p className="text-xs text-green-600 mt-1">
              ✅ Prix grossiste appliqué
            </p>
          )}
        </div>
      </div>
    ),
  });

  const currentStep = formSteps[step];
  const isLastStep = step === formSteps.length - 1;

  /* ============================
     RENDER
  ============================ */
  return (
    <div className={className}>
      <button
        onClick={() => {
          setStep(0);
          setIsPopupOpen(true);
        }}
        className="w-full bg-yellow-500 hover:bg-yellow-400 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-colors"
      >
        {/* Icône WhatsApp inline SVG */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-5 h-5"
        >
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
        Contacter le vendeur
      </button>

      {/* ── FORM POPUP ── */}
      <Dialog open={isPopupOpen} onOpenChange={setIsPopupOpen}>
        <DialogContent className="rounded-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {currentStep?.icon}
              {currentStep?.title}
            </DialogTitle>
          </DialogHeader>

          {currentStep?.content}

          <DialogFooter className="flex justify-between gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() =>
                step > 0 ? setStep(step - 1) : setIsPopupOpen(false)
              }
            >
              {step === 0 ? "Annuler" : "Précédent"}
            </Button>

            {isLastStep ? (
              <Button
                onClick={() => {
                  setIsPopupOpen(false);
                  setIsConfirmOpen(true);
                }}
                className="bg-yellow-500 hover:bg-yellow-400 text-white"
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                Continuer
              </Button>
            ) : (
              <Button
                onClick={() => setStep(step + 1)}
                className="bg-yellow-500 hover:bg-yellow-400 text-white"
              >
                Suivant
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── CONFIRMATION → WHATSAPP ── */}
      <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <DialogContent className="rounded-3xl">
          <DialogHeader>
            <DialogTitle>Récapitulatif de votre demande</DialogTitle>
          </DialogHeader>

          {/* Aperçu produit */}
          <div className="flex gap-3 items-center bg-gray-50 rounded-2xl p-3">
            {mainImage && (
              <img
                src={mainImage}
                alt={product.title}
                className="w-16 h-16 object-cover rounded-xl flex-shrink-0"
              />
            )}
            <div>
              <p className="font-semibold text-sm">{product.title}</p>
              {customData.taillePointure && (
                <p className="text-xs text-gray-500">
                  {isClothing ? "Taille" : "Pointure"} :{" "}
                  {customData.taillePointure}
                </p>
              )}
              <p className="text-xs text-gray-500">
                Qté : {customData.quantite}
              </p>
              <p className="text-sm font-bold text-yellow-500 mt-1">
                {prixTotal.toLocaleString()} FCFA
                {isWholesaleApplied && (
                  <span className="text-green-600 text-xs ml-1">
                    (prix gros)
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Aperçu message */}
          <div className="bg-[#ECF8ED] rounded-2xl px-4 py-3 text-sm text-gray-700 whitespace-pre-line leading-relaxed border border-green-100">
            {buildWhatsAppMessage()}
          </div>

          <DialogFooter className="flex justify-between gap-2 pt-2">
            <Button variant="outline" onClick={() => setIsConfirmOpen(false)}>
              Retour
            </Button>
            <Button
              onClick={() => {
                setIsConfirmOpen(false);
                openWhatsApp();
              }}
              className="bg-[#25D366] hover:bg-[#1fb956] text-white font-semibold"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-4 h-4 mr-2"
              >
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Ouvrir WhatsApp
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
