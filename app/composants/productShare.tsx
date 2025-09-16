import React from 'react';
import { Share2, ShoppingBag } from 'lucide-react';

const ProductShareButton = ({ product, className = "", children, ...props }) => {
    const handleShare = async () => {
        const shareText = `🔥 Regarde ce ${product.title} à ${product.price.toLocaleString()} FCFA sur Sangse.shop !\n\n✨ ${product.description || 'Article en excellente condition'}\n\n🛍️ Achète maintenant sur la plateforme de vente en ligne du Sénégal !\n\n👆 Clique ici : https://sangse.shop/product/${product.id}\n\n#SangseShop #Shopping #Senegal #BonPlan`;

        try {
            // Vérifier si l'API Web Share est disponible (mobile principalement)
            if (navigator.share) {
                await navigator.share({
                    title: `${product.title} - Sangse.shop`,
                    text: shareText,
                    url: `https://sangse.shop/product/${product.id}`
                });
            } else {
                // Fallback pour desktop - copier dans le presse-papier
                await navigator.clipboard.writeText(shareText);

                // Afficher une notification de succès
                alert("📋 Message copié ! Colle-le où tu veux pour partager ce produit avec tes amis !");
            }
        } catch (error) {
            console.error("Erreur lors du partage:", error);

            // Fallback ultime - ouvrir les réseaux sociaux populaires
            const encodedText = encodeURIComponent(shareText);
            const productUrl = `https://sangse.shop/product/${product.id}`;
            const shareOptions = [
                { name: "WhatsApp", url: `https://wa.me/?text=${encodedText}` },
                { name: "Facebook", url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(productUrl)}&quote=${encodedText}` },
                { name: "Twitter", url: `https://twitter.com/intent/tweet?text=${encodedText}` }
            ];

            const choice = confirm("Choisir un réseau social pour partager ?\n\n1. OK pour WhatsApp\n2. Annuler pour voir d'autres options");

            if (choice) {
                window.open(shareOptions[0].url, '_blank');
            } else {
                // Afficher les autres options
                const otherChoice = confirm("Facebook (OK) ou Twitter (Annuler) ?");
                const selectedOption = otherChoice ? shareOptions[1] : shareOptions[2];
                window.open(selectedOption.url, '_blank');
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