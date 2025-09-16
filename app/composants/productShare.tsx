"use client";

import { Share2, ShoppingBag, MessageCircle, Facebook, Twitter, Mail } from "lucide-react";

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

export default function ProductShareButton({ product, className = "", children, ...props }: Props) {
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
            url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(productUrl)}&quote=${encodeURIComponent(shareText)}`,
        },
        {
            name: "Twitter",
            icon: Twitter,
            url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`,
        },
        {
            name: "Email",
            icon: Mail,
            url: `mailto:?subject=${encodeURIComponent(product.title + " - Sangse.shop")}&body=${encodeURIComponent(shareText)}`,
        },
    ];

    const handleShare = async () => {
        try {
            // ✅ Cas 1 : Mobile → API Web Share
            if (navigator.share) {
                await navigator.share({
                    title: `${product.title} - Sangse.shop`,
                    text: shareText,
                    url: productUrl,
                });
                return;
            }

            // ❌ Cas 2 : Desktop → choix manuel
            let options = "Choisis un réseau :\n\n";
            socialNetworks.forEach((s, i) => {
                options += `${i + 1}. ${s.name}\n`;
            });

            const choice = prompt(options);
            const index = Number(choice) - 1;

            if (index >= 0 && index < socialNetworks.length) {
                window.open(socialNetworks[index].url, "_blank");
                return;
            }

            // 🚨 Cas 3 : Copier le lien
            await navigator.clipboard.writeText(`${shareText}\n${productUrl}`);
            alert("📋 Lien copié ! Colle-le où tu veux pour partager ce produit.");
        } catch (error) {
            console.error("Erreur lors du partage:", error);
            alert("Impossible de partager automatiquement. Voici le lien : " + productUrl);
        }
    };

    const defaultClassName = `flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold
    bg-gradient-to-r from-blue-500 to-blue-600 text-white
    hover:from-blue-600 hover:to-blue-700
    transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95`;

    return (
        <button
            onClick={handleShare}
            className={`${defaultClassName} ${className}`}
            {...props}
        >
            <Share2 size={16} />
            <span>{children || "Partager"}</span>
            <ShoppingBag size={14} className="animate-pulse" />
        </button>
    );
}
