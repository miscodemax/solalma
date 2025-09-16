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

    const shareText = `🔥 Regarde ce ${product.title} à ${product.price.toLocaleString()} FCFA sur Sangse.shop !
  
✨ ${product.description || "Article en excellente condition"}

🛍️ Achète maintenant sur la plateforme de vente en ligne du Sénégal !

👆 Clique ici : ${productUrl}

#SangseShop #Shopping #Senegal #BonPlan`;

    const socialNetworks = [
        {
            name: "WhatsApp",
            icon: MessageCircle,
            url: `https://wa.me/?text=${encodeURIComponent(shareText)}`,
        },
        {
            name: "Facebook",
            icon: Facebook,
            url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                productUrl
            )}&quote=${encodeURIComponent(shareText)}`,
        },
        {
            name: "Twitter",
            icon: Twitter,
            url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(
                shareText
            )}`,
        },
        {
            name: "Email",
            icon: Mail,
            url: `mailto:?subject=${encodeURIComponent(
                product.title + " - Sangse.shop"
            )}&body=${encodeURIComponent(shareText)}`,
        },
    ];

    const handleShareClick = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: `${product.title} - Sangse.shop`,
                    text: shareText,
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
        await navigator.clipboard.writeText(`${shareText}\n${productUrl}`);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
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
                            Partager ce produit
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

                    <div className="grid grid-cols-2 gap-3 py-4">
                        {socialNetworks.map(({ name, icon: Icon, url }) => (
                            <Button
                                key={name}
                                variant="outline"
                                onClick={() => window.open(url, "_blank")}
                                className="flex items-center gap-2 rounded-xl border-yellow-300 text-[#1C2B49] hover:bg-yellow-100 transition"
                            >
                                <Icon className="w-5 h-5" />
                                {name}
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
                </DialogContent>
            </Dialog>
        </>
    );
}
