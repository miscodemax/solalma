import React from "react";
import { Share2, ShoppingBag, MessageCircle, Facebook, Twitter, Mail } from "lucide-react";

const ProductShareButton = ({ product, className = "", children, ...props }) => {
    const shareText = `🔥 Regarde ce ${product.title} à ${product.price.toLocaleString()} FCFA sur Sangse.shop !
  
✨ ${product.description || "Article en excellente condition"}

🛍️ Achète maintenant sur la plateforme de vente en ligne du Sénégal !

👆 Clique ici : https://sangse.shop/product/${product.id}

#SangseShop #Shopping #Senegal #BonPlan`;

    const productUrl = `https://sangse.shop/product/${product.id}`;

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

    const handleShare = async () => {
        try {
            // ✅ Mobile → partage natif
            if (navigator.share) {
                await navigator.share({
                    title: `${product.title} - Sangse.shop`,
                    text: shareText,
                    url: productUrl,
                });
                return;
            }

            // ❌ Pas d'API → fallback social
            const choice = confirm("Voulez-vous partager via WhatsApp ? (Annuler pour voir d'autres options)");
            if (choice) {
                window.open(socialNetworks[0].url, "_blank");
            } else {
                // petite sélection rapide
                const otherChoice = confirm("Facebook (OK) ou Twitter (Annuler) ?");
                const selected = otherChoice ? socialNetworks[1] : socialNetworks[2];
                window.open(selected.url, "_blank");
            }
        } catch (error) {
            console.error("Erreur lors du partage:", error);

            // 🚨 Fallback ultime : copier dans le presse-papier
            try {
                await navigator.clipboard.writeText(`${shareText}\n${productUrl}`);
                alert("📋 Lien copié ! Colle-le où tu veux pour partager ce produit.");
            } catch (error) {
                alert(error + "Impossible de copier, mais voici le lien : " + productUrl);
            }
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
};

export default ProductShareButton;
