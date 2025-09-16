import React, { useState } from 'react';
import { Share2, X, MessageCircle, Facebook, Twitter, Mail, Copy, Check } from 'lucide-react';

const SocialShareButton = ({
    shareText,
    shareUrl,
    title = "Partager",
    className = ""
}) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [copied, setCopied] = useState(false);

    const handleNativeShare = async () => {
        try {
            if (navigator.share) {
                await navigator.share({
                    title: title,
                    text: shareText,
                    url: shareUrl
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

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(shareText);
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
            url: `https://wa.me/?text=${encodeURIComponent(shareText)}`
        },
        {
            name: "Facebook",
            icon: Facebook,
            color: "bg-blue-600 hover:bg-blue-700",
            url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`
        },
        {
            name: "Twitter",
            icon: Twitter,
            color: "bg-sky-500 hover:bg-sky-600",
            url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`
        },
        {
            name: "Email",
            icon: Mail,
            color: "bg-gray-600 hover:bg-gray-700",
            url: `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(shareText)}`
        }
    ];

    const ShareModal = () => (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-gray-800">Partager</h3>
                    <button
                        onClick={() => setIsModalOpen(false)}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X size={20} className="text-gray-500" />
                    </button>
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
                                className={`${network.color} text-white p-4 rounded-xl font-medium flex items-center gap-3 transition-all hover:scale-105 active:scale-95`}
                                onClick={() => setIsModalOpen(false)}
                            >
                                <IconComponent size={20} />
                                <span>{network.name}</span>
                            </a>
                        );
                    })}
                </div>

                {/* Copy Option */}
                <div className="border-t pt-4">
                    <button
                        onClick={copyToClipboard}
                        className={`w-full p-3 rounded-xl font-medium flex items-center justify-center gap-3 transition-all ${copied
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                            }`}
                    >
                        {copied ? <Check size={20} /> : <Copy size={20} />}
                        <span>{copied ? 'Copié !' : 'Copier le message'}</span>
                    </button>
                </div>
            </div>
        </div>
    );

    const defaultClassName = "bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-xl flex items-center gap-2 font-semibold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105";

    return (
        <>
            <button
                onClick={handleMainShare}
                className={`${defaultClassName} ${className}`}
            >
                <Share2 className="w-5 h-5" />
                Partager sur les réseaux
            </button>

            {isModalOpen && <ShareModal />}
        </>
    );
};



export default SocialShareButton;