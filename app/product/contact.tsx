"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  MessageCircle,
  Loader2,
  AlertTriangle,
  Phone,
  ShoppingCart,
  User,
  Package,
  Hash,
  CheckCircle2,
} from "lucide-react";

interface ProductContactProps {
  product: {
    id: string;
    title: string;
    user_id: string; // vendeur
    category: "vetement" | "chaussure" | "autre";
    price: number;
    image_url?: string;
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
  const supabase = createClient();
  const router = useRouter();

  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [step, setStep] = useState(0);

  const [customData, setCustomData] = useState({
    taillePointure: "",
    quantite: 1,
    phone: "",
    name: "",
  });

  const clientDisplayName =
    customerName && customerName.trim() !== "" ? customerName : "Client Sangse";

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

  const { prixTotal, prixUnitaireApplicable, isWholesaleApplied } =
    useMemo(() => {
      const isWholesalePossible =
        product.has_wholesale &&
        product.wholesale_price != null &&
        product.min_wholesale_qty != null;

      const applied =
        isWholesalePossible &&
        customData.quantite >= product.min_wholesale_qty!;

      const unit = applied ? product.wholesale_price! : product.price;

      return {
        prixTotal: unit * customData.quantite,
        prixUnitaireApplicable: unit,
        isWholesaleApplied: applied,
      };
    }, [customData.quantite, product]);

  /* ============================
     MESSAGE PRÉ-ÉCRIT
  ============================ */
  const buildInitialMessage = () => {
    return `Bonjour 👋  
Je suis intéressé par votre produit :

📦 Produit : ${product.title}
${customData.taillePointure ? `📏 Option : ${customData.taillePointure}\n` : ""}
🔢 Quantité : ${customData.quantite}
💰 Budget estimé : ${prixTotal.toLocaleString()} FCFA

Pouvez-vous me confirmer la disponibilité ?`;
  };

  /* ============================
     OUVERTURE CHAT INTERNE
  ============================ */
  const openInternalChat = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("Vous devez être connecté pour contacter le vendeur");
      return;
    }

    // 1. Cherche conversation existante
    const { data: existing } = await supabase
      .from("conversations")
      .select("id")
      .eq("product_id", product.id)
      .eq("buyer_id", user.id)
      .single();

    let conversationId = existing?.id;

    // 2. Sinon créer
    if (!conversationId) {
      const { data: created, error } = await supabase
        .from("conversations")
        .insert({
          product_id: product.id,
          buyer_id: user.id,
          seller_id: product.user_id,
        })
        .select("id")
        .single();

      if (error || !created) {
        alert("Erreur lors de la création du chat");
        return;
      }

      conversationId = created.id;

      // 3. Premier message
      await supabase.from("messages").insert({
        conversation_id: conversationId,
        content: buildInitialMessage(),
      });
    }

    router.push(`/chat/${conversationId}`);
  };

  /* ============================
     FORM STEPS
  ============================ */
  const formSteps: any[] = [];

  if (isClothing || isShoes) {
    formSteps.push({
      title: isClothing
        ? "Choisissez votre taille"
        : "Choisissez votre pointure",
      icon: <Package className="w-5 h-5" />,
      content: (
        <div className="grid grid-cols-3 gap-2">
          {(isClothing ? taillesVetements : pointuresChaussures).map((v) => (
            <button
              key={v}
              onClick={() =>
                setCustomData({ ...customData, taillePointure: v })
              }
              className={`px-4 py-3 rounded-xl border-2 ${
                customData.taillePointure === v
                  ? "bg-yellow-400 text-white border-yellow-400"
                  : "border-gray-200"
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
    title: "Quantité",
    icon: <Hash className="w-5 h-5" />,
    content: (
      <div className="flex items-center justify-center gap-6">
        <button
          onClick={() =>
            customData.quantite > 1 &&
            setCustomData({ ...customData, quantite: customData.quantite - 1 })
          }
          className="w-10 h-10 rounded-full bg-gray-100"
        >
          −
        </button>
        <div className="text-2xl font-bold">{customData.quantite}</div>
        <button
          onClick={() =>
            setCustomData({ ...customData, quantite: customData.quantite + 1 })
          }
          className="w-10 h-10 rounded-full bg-gray-100"
        >
          +
        </button>
      </div>
    ),
  });

  if (!customerName) {
    formSteps.push({
      title: "Votre nom",
      icon: <User className="w-5 h-5" />,
      content: (
        <input
          value={customData.name}
          onChange={(e) =>
            setCustomData({ ...customData, name: e.target.value })
          }
          placeholder="Votre nom"
          className="w-full px-4 py-3 border rounded-xl"
        />
      ),
    });
  }

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
        className="w-full bg-yellow-500 text-white py-4 rounded-2xl font-bold"
      >
        Contacter le vendeur
      </button>

      {/* FORM POPUP */}
      <Dialog open={isPopupOpen} onOpenChange={setIsPopupOpen}>
        <DialogContent className="rounded-3xl">
          <DialogHeader>
            <DialogTitle>{currentStep?.title}</DialogTitle>
          </DialogHeader>

          {currentStep?.content}

          <DialogFooter className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => step > 0 && setStep(step - 1)}
            >
              Précédent
            </Button>

            {isLastStep ? (
              <Button
                onClick={() => {
                  setIsPopupOpen(false);
                  setIsConfirmOpen(true);
                }}
                className="bg-yellow-500 text-black"
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                Continuer
              </Button>
            ) : (
              <Button onClick={() => setStep(step + 1)}>Suivant</Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* CONFIRMATION */}
      <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <DialogContent className="rounded-3xl">
          <h3 className="font-bold text-lg mb-4">
            Confirmer la prise de contact
          </h3>

          <p className="text-sm text-gray-600 mb-6 whitespace-pre-line">
            {buildInitialMessage()}
          </p>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setIsConfirmOpen(false)}>
              Annuler
            </Button>
            <Button
              onClick={async () => {
                setIsConfirmOpen(false);
                await openInternalChat();
              }}
              className="bg-yellow-500 text-black"
            >
              Continuer
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
