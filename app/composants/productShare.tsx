"use client";

import { useState } from "react";
import {
    Share2,
    ShoppingBag,
    MessageCircle,
    Facebook,
    Twitter,
    Mail,
    Copy,
    X,
} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Product {
    id: string | number;
    title: string;
    price: number;
    description?: string;
}

interface Props {
    product: Product;
    className?: string;
    children?: React.ReactNode;
}

export default function ProductShareButton({
    product,
    className = "",
    children,
    ...props
}: Props) {
    const [open, setOpen] = useState(false);
    const [copied, setCopied] = useState(false);

    const productUrl = `https://sangse.shop/product/${product.id}`;

    // Message plus court et optimisé pour WhatsApp
    const whatsappText = `🔥 ${product.title} à ${product.price.toLocaleString()} FCFA
    
${product.description ? `✨ ${product.description.substring(0, 100)}...` : '✨ Article en excellente condition'}

🛍️ Voir sur SangSé Shop : ${productUrl}`;

    // Message pour les autres plateformes
    const generalText = `🔥 Regarde ce ${product.title} à ${product.price.toLocaleString()} FCFA sur SangSé Shop !

${product.description ? `✨ ${product.description}` : '✨ Article en excellente condition'}

🛍️ Achète maintenant sur la plateforme de vente en ligne du Sénégal !`;

    const socialNetworks = [
        {
            name: "WhatsApp",
            icon: MessageCircle,
            url: `https://wa.me/?text=${encodeURIComponent(whatsappText)}`,
            color: "text-green-600",
            bgColor: "hover:bg-green-50",
        },
        {
            name: "Facebook",
            icon: Facebook,
            url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(productUrl)}`,
            color: "text-blue-600",
            bgColor: "hover:bg-blue-50",
        },
        {
            name: "Twitter",
            icon: Twitter,
            url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(generalText)}&url=${encodeURIComponent(productUrl)}`,
            color: "text-blue-400",
            bgColor: "hover:bg-blue-50",
        },
        {
            name: "Email",
            icon: Mail,
            url: `mailto:?subject=${encodeURIComponent(
                product.title + " - SangSé Shop"
            )}&body=${encodeURIComponent(generalText + "\n\n" + productUrl)}`,
            color: "text-gray-600",
            bgColor: "hover:bg-gray-50",
        },
    ];

    const handleShareClick = async () => {
        // Test du Web Share API natif
        if (navigator.share) {
            try {
                await navigator.share({
                    title: `${product.title} - SangSé Shop`,
                    text: generalText,
                    url: productUrl,
                });
                return;
            } catch (e) {
                console.error("Partage annulé ou erreur:", e);
            }
        }
        setOpen(true);
    };

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(productUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            // Fallback pour les navigateurs qui ne supportent pas clipboard API
            const textArea = document.createElement('textarea');
            textArea.value = productUrl;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const defaultClassName = `flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold
  bg-gradient-to-r from-[#F6C445] to-[#FFD700] text-[#1C2B49]
  hover:from-[#FFD700] hover:to-[#F6C445]
  transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95`;

    return (
        <>
            <button
                onClick={handleShareClick}
                className={cn(defaultClassName, className)}
                {...props}
            >
                <Share2 size={16} />
                <span>{children || "Partager"}</span>
                <ShoppingBag size={14} className="animate-pulse" />
            </button>

            {/* Modal */}
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="max-w-sm rounded-2xl border border-yellow-200">
                    <DialogHeader className="flex flex-row items-center justify-between">
                        <DialogTitle className="text-lg font-bold text-[#1C2B49]">
                            Partager ce produit 🚀
                        </DialogTitle>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setOpen(false)}
                            className="rounded-full hover:bg-yellow-50"
                        >
                            <X className="w-5 h-5 text-gray-600" />
                        </Button>
                    </DialogHeader>

                    <DialogDescription className="text-sm text-gray-500">
                        Choisis une plateforme pour partager ce bon plan :
                    </DialogDescription>

                    {/* Aperçu du produit */}
                    <div className="bg-gradient-to-r from-[#F6C445]/10 to-[#FFD700]/10 p-3 rounded-xl border border-yellow-200 mb-4">
                        <h4 className="font-bold text-[#1C2B49] text-sm line-clamp-1">
                            {product.title}
                        </h4>
                        <p className="text-[#F6C445] font-bold">
                            {product.price.toLocaleString()} FCFA
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 py-2">
                        {socialNetworks.map(({ name, icon: Icon, url, color, bgColor }) => (
                            <Button
                                key={name}
                                variant="outline"
                                onClick={() => {
                                    window.open(url, "_blank", "noopener,noreferrer");
                                    setOpen(false);
                                }}
                                className={`flex items-center gap-2 rounded-xl border-gray-200 transition-colors ${bgColor}`}
                            >
                                <Icon className={`w-5 h-5 ${color}`} />
                                <span className="text-gray-700">{name}</span>
                            </Button>
                        ))}
                    </div>

                    <DialogFooter>
                        <Button
                            onClick={handleCopy}
                            className="w-full flex items-center gap-2 rounded-xl 
              bg-gradient-to-r from-[#F6C445] to-[#FFD700] text-[#1C2B49]
              hover:from-[#FFD700] hover:to-[#F6C445] transition-all shadow-md"
                        >
                            <Copy className="w-4 h-4" />
                            {copied ? "Lien copié ✔" : "Copier le lien"}
                        </Button>
                    </DialogFooter>

                    {/* Info sur les métadonnées */}
                    <p className="text-xs text-gray-400 text-center mt-2">
                        💡 L'image et les infos s'afficheront automatiquement sur WhatsApp
                    </p>
                </DialogContent>
            </Dialog>
        </>
    );
}