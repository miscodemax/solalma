"use client";

import { useState } from "react";
import {
    Share2,
    MessageCircle,
    Facebook,
    Twitter,
    Mail,
    Copy,
    X,
} from "lucide-react";

interface SocialShareButtonProps {
    shareText: string;
    shareUrl: string;
    title?: string;
    className?: string;
}

export default function SocialShareButton({
    shareText,
    shareUrl,
    title = "Partager",
    className = "",
}: SocialShareButtonProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [copied, setCopied] = useState(false);

    const socialNetworks = [
        {
            name: "WhatsApp",
            icon: MessageCircle,
            color: "bg-green-500 hover:bg-green-600",
            url: `https://wa.me/?text=${encodeURIComponent(
                `${shareText} ${shareUrl}`
            )}`,
        },
        {
            name: "Facebook",
            icon: Facebook,
            color: "bg-blue-600 hover:bg-blue-700",
            url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                shareUrl
            )}&quote=${encodeURIComponent(shareText)}`,
        },
        {
            name: "Twitter",
            icon: Twitter,
            color: "bg-sky-500 hover:bg-sky-600",
            url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(
                `${shareText} ${shareUrl}`
            )}`,
        },
        {
            name: "Email",
            icon: Mail,
            color: "bg-gray-600 hover:bg-gray-700",
            url: `mailto:?subject=${encodeURIComponent(
                title
            )}&body=${encodeURIComponent(`${shareText} ${shareUrl}`)}`,
        },
    ];

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title,
                    text: shareText,
                    url: shareUrl,
                });
                return;
            } catch (err) {
                console.log("Partage annulé", err);
            }
        }
        setIsOpen(true);
    };

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error("Erreur copie", err);
        }
    };

    return (
        <>
            {/* Bouton principal */}
            <button
                onClick={handleShare}
                className={`px-6 py-3 rounded-xl flex items-center gap-2 font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 
        bg-gradient-to-r from-[#F6C445] to-[#FFD700] text-[#1C2B49] ${className}`}
            >
                <Share2 className="w-5 h-5" />
                {title}
            </button>

            {/* Modal fallback */}
            {isOpen && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl border border-yellow-200 animate-in fade-in-50 slide-in-from-bottom-4">
                        {/* Header */}
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-[#1C2B49]">Partager</h3>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-2 hover:bg-yellow-50 rounded-full transition-colors"
                            >
                                <X size={20} className="text-gray-600" />
                            </button>
                        </div>

                        {/* Réseaux */}
                        <div className="grid grid-cols-2 gap-3 mb-6">
                            {socialNetworks.map((n) => {
                                const Icon = n.icon;
                                return (
                                    <a
                                        key={n.name}
                                        href={n.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={`${n.color} text-white p-4 rounded-xl font-medium flex items-center gap-3 shadow-md hover:shadow-lg transition-all hover:scale-105 active:scale-95`}
                                    >
                                        <Icon size={20} />
                                        <span>{n.name}</span>
                                    </a>
                                );
                            })}
                        </div>

                        {/* Copier le lien */}
                        <div className="border-t pt-4">
                            <button
                                onClick={handleCopy}
                                className="w-full p-3 rounded-xl font-medium flex items-center justify-center gap-3 transition-all 
                bg-gradient-to-r from-[#F6C445] to-[#FFD700] text-[#1C2B49] shadow-md hover:shadow-lg hover:scale-105"
                            >
                                <Copy size={20} />
                                {copied ? "✔ Lien copié !" : "Copier le lien"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
