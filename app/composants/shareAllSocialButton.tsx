import React from 'react';
import { Share2, Gift } from 'lucide-react';

const ShareAllSocialButton = ({ className = "", children, ...props }) => {
    const handleShare = async () => {
        const shareText = "🛍️ Salut ! Je viens de découvrir Sangse.shop, la nouvelle plateforme de vente en ligne du Sénégal ! 🇸🇳\n\n✨ Tu peux acheter et vendre facilement comme sur Vinted, mais adapté à nos besoins locaux !\n\n🎁 Rejoins-moi sur sangse.shop et découvre des articles uniques à des prix imbattables. C'est parfait pour dénicher des pépites ou vendre ce que tu n'utilises plus !\n\n👆 Clique ici : https://sangse.shop\n\n#SangseShop #VenteEnLigneSenegal #Shopping";

        try {
            // Vérifier si l'API Web Share est disponible (mobile principalement)
            if (navigator.share) {
                await navigator.share({
                    title: "Sangse.shop - Plateforme de vente en ligne au Sénégal",
                    text: shareText,
                    url: "https://sangse.shop"
                });
            } else {
                // Fallback pour desktop - copier dans le presse-papier
                await navigator.clipboard.writeText(shareText);

                // Afficher une notification de succès
                alert("📋 Message copié ! Colle-le où tu veux pour partager Sangse.shop avec tes amis !");
            }
        } catch (error) {
            console.error("Erreur lors du partage:", error);

            // Fallback ultime - ouvrir les réseaux sociaux populaires
            const encodedText = encodeURIComponent(shareText);
            const shareOptions = [
                { name: "WhatsApp", url: `https://wa.me/?text=${encodedText}` },
                { name: "Facebook", url: `https://www.facebook.com/sharer/sharer.php?u=https://sangse.shop&quote=${encodedText}` },
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
    bg-gradient-to-r from-[#F6C445] to-[#FFD700] text-[#1C2B49]
    hover:from-[#FFD700] hover:to-[#F6C445]
    transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95`;

    return (
        <button
            onClick={handleShare}
            className={`${defaultClassName} ${className}`}
            {...props}
        >
            <Share2 size={16} />
            <span>{children || "Partager"}</span>
            <Gift size={14} className="animate-bounce" />
        </button>
    );
};



export default ShareAllSocialButton;