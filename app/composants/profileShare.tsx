import React, { useState } from 'react';
import { Share2, X, MessageCircle, Facebook, Twitter, Mail, Copy, Check, User, Star, Package } from 'lucide-react';

const ProfileShare = ({ profile, profileId, className = "" }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [copied, setCopied] = useState(false);

    const profileUrl = `https://sangse.shop/profile/${profileId}`;
    const shareText = `🔗 Découvre la boutique de ${profile.username} sur Sangse.shop : ${profileUrl}`;
    const detailedShareText = `🛍️ Découvre la boutique de ${profile.username} sur Sangse.shop !\n\n⭐ ${profile.rating || '5.0'}/5 étoiles\n📦 ${profile.productsCount || 'Plusieurs'} produits disponibles\n🇸🇳 Vendeur au Sénégal\n\n👉 ${profileUrl}\n\n#SangseShop #BoutiqueEnLigne #Senegal`;

    const handleNativeShare = async () => {
        try {
            if (navigator.share) {
                await navigator.share({
                    title: `Boutique de ${profile.username} - Sangse.shop`,
                    text: shareText,
                    url: profileUrl
                });
                return true;
            }
        } catch (error) {
            console.error('Erreur partage natif:', error);
        }
        return false;
    };

    const handleMainShare = async () => {
        const shared = await handleNativeShare();
        if (!shared) {
            setIsModalOpen(true);
        }
    };

    const copyToClipboard = async (text = shareText) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            console.error('Erreur copie:', error);
        }
    };

    const socialNetworks = [
        {
            name: "WhatsApp",
            icon: MessageCircle,
            color: "bg-green-500 hover:bg-green-600",
            url: `https://wa.me/?text=${encodeURIComponent(detailedShareText)}`
        },
        {
            name: "Facebook",
            icon: Facebook,
            color: "bg-blue-600 hover:bg-blue-700",
            url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(profileUrl)}&quote=${encodeURIComponent(detailedShareText)}`
        },
        {
            name: "Twitter",
            icon: Twitter,
            color: "bg-sky-500 hover:bg-sky-600",
            url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(detailedShareText)}`
        },
        {
            name: "Email",
            icon: Mail,
            color: "bg-gray-600 hover:bg-gray-700",
            url: `mailto:?subject=${encodeURIComponent(`Boutique de ${profile.username} - Sangse.shop`)}&body=${encodeURIComponent(detailedShareText)}`
        }
    ];

    const ShareModal = () => (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-gray-800">Partager cette boutique</h3>
                    <button
                        onClick={() => setIsModalOpen(false)}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                {/* Profile Preview */}
                <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border">
                    <div className="flex items-center gap-3 mb-3">
                        {profile.avatar ? (
                            <img
                                src={profile.avatar}
                                alt={profile.username}
                                className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-md"
                            />
                        ) : (
                            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                                <User size={24} className="text-white" />
                            </div>
                        )}
                        <div>
                            <h4 className="font-bold text-gray-800">{profile.username}</h4>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                                {profile.rating && (
                                    <div className="flex items-center gap-1">
                                        <Star size={14} className="text-yellow-500 fill-current" />
                                        <span>{profile.rating}/5</span>
                                    </div>
                                )}
                                {profile.productsCount && (
                                    <div className="flex items-center gap-1">
                                        <Package size={14} />
                                        <span>{profile.productsCount} produits</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    {profile.bio && (
                        <p className="text-sm text-gray-600 line-clamp-2">{profile.bio}</p>
                    )}
                </div>

                {/* Social Networks Grid */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                    {socialNetworks.map((network) => {
                        const IconComponent = network.icon;
                        return (
                            <a
                                key={network.name}
                                href={network.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`${network.color} text-white p-3 rounded-xl font-medium flex items-center gap-3 transition-all hover:scale-105 active:scale-95`}
                                onClick={() => setIsModalOpen(false)}
                            >
                                <IconComponent size={20} />
                                <span>{network.name}</span>
                            </a>
                        );
                    })}
                </div>

                {/* Copy Options */}
                <div className="border-t pt-4 space-y-2">
                    <button
                        onClick={() => copyToClipboard(detailedShareText)}
                        className={`w-full p-3 rounded-xl font-medium flex items-center justify-center gap-3 transition-all ${copied
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                            }`}
                    >
                        {copied ? <Check size={20} /> : <Copy size={20} />}
                        <span>{copied ? 'Message copié !' : 'Copier le message complet'}</span>
                    </button>

                    <button
                        onClick={() => copyToClipboard(profileUrl)}
                        className="w-full p-2 rounded-lg font-medium flex items-center justify-center gap-2 text-sm bg-gray-50 hover:bg-gray-100 text-gray-600 transition-colors"
                    >
                        <Copy size={16} />
                        <span>Copier juste le lien</span>
                    </button>
                </div>
            </div>
        </div>
    );

    const defaultClassName = "bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white px-6 py-3 rounded-xl flex items-center gap-2 font-semibold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 cursor-pointer";

    return (
        <>
            <button
                onClick={handleMainShare}
                className={`${defaultClassName} ${className}`}
            >
                <Share2 className="w-5 h-5" />
                Partager la boutique
            </button>

            {isModalOpen && <ShareModal />}
        </>
    );
};

// Composant CopyButton amélioré (pour remplacer l'ancien)
const CopyButton = ({ text, platform = "Copier", className = "" }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            console.error('Erreur copie:', error);
        }
    };

    return (
        <button
            onClick={handleCopy}
            className={`bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-xl flex items-center gap-2 font-semibold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 ${className}`}
        >
            {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
            {copied ? 'Copié !' : platform}
        </button>
    );
};



export { ProfileShare, CopyButton };
export default ProfileShare;