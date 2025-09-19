"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaWhatsapp, FaShieldAlt, FaCheckCircle, FaExclamationTriangle, FaTimes, FaInfoCircle } from "react-icons/fa";
import { HiPhone } from "react-icons/hi2";

interface ContactProps {
    whatsappLink?: string;
    phoneNumber?: string;
    sellerName?: string;
    productTitle?: string;
}

const securityTips = [
    {
        icon: FaShieldAlt,
        title: "Paiement sécurisé",
        description: "Privilégiez la remise en main propre. Évitez les virements à l'avance.",
        color: "text-green-500"
    },
    {
        icon: FaExclamationTriangle,
        title: "Vérifiez le produit",
        description: "Demandez des photos supplémentaires et testez avant l'achat.",
        color: "text-orange-500"
    },
    {
        icon: HiPhone,
        title: "Lieu de rencontre",
        description: "Choisissez un endroit public, bien éclairé et fréquenté.",
        color: "text-blue-500"
    },
];

export default function ProductContact({ whatsappLink, phoneNumber, sellerName = "le vendeur", productTitle }: ContactProps) {
    const [open, setOpen] = useState(false);
    const [method, setMethod] = useState<"whatsapp" | "phone" | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const hasContactMethods = whatsappLink || phoneNumber;

    const handleClick = (type: "whatsapp" | "phone") => {
        setMethod(type);
        setOpen(true);
    };

    const handleConfirm = async () => {
        setIsLoading(true);

        // Simulation d'un délai pour l'UX
        await new Promise(resolve => setTimeout(resolve, 800));

        setOpen(false);
        setIsLoading(false);

        if (method === "whatsapp" && whatsappLink) {
            window.open(whatsappLink, "_blank", "noopener,noreferrer");
        }
        if (method === "phone" && phoneNumber) {
            window.open(`tel:${phoneNumber}`, "_self");
        }
    };

    const getMethodDetails = () => {
        if (method === "whatsapp") {
            return {
                title: "Contacter via WhatsApp",
                description: `Vous allez être redirigé vers WhatsApp pour discuter avec ${sellerName}`,
                icon: FaWhatsapp,
                color: "text-green-500"
            };
        } else {
            return {
                title: "Appeler le vendeur",
                description: `Vous allez appeler ${sellerName} au ${phoneNumber}`,
                icon: HiPhone,
                color: "text-blue-500"
            };
        }
    };

    if (!hasContactMethods) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-gray-100 to-gray-200 border-2 border-dashed border-gray-300 text-gray-600 px-8 py-12 rounded-2xl text-center space-y-3"
            >
                <FaInfoCircle className="text-4xl mx-auto text-gray-400" />
                <h3 className="font-semibold text-lg">Contact non disponible</h3>
                <p className="text-sm opacity-75">Aucune méthode de contact n'a été fournie par le vendeur</p>
            </motion.div>
        );
    }

    return (
        <div className="space-y-4">
            {/* En-tête */}
            <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-[#1C2B49] mb-2">Contacter le vendeur</h3>
                <p className="text-gray-600 text-sm">Choisissez votre méthode de contact préférée</p>
            </div>

            {/* Boutons de contact */}
            <div className="grid gap-4">
                {whatsappLink && (
                    <motion.button
                        onClick={() => handleClick("whatsapp")}
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        className="group bg-gradient-to-r from-green-500 via-green-600 to-emerald-600 hover:from-green-600 hover:via-green-700 hover:to-emerald-700 text-white font-bold text-lg px-8 py-6 rounded-2xl flex items-center justify-center gap-4 shadow-lg hover:shadow-xl transition-all duration-200 relative overflow-hidden"
                    >
                        <motion.div
                            className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-200"
                        />
                        <FaWhatsapp className="text-2xl group-hover:scale-110 transition-transform duration-200" />
                        <div className="text-left">
                            <div>Discuter sur WhatsApp</div>
                            <div className="text-sm opacity-90 font-normal">Réponse rapide garantie</div>
                        </div>
                    </motion.button>
                )}

                {phoneNumber && (
                    <motion.button
                        onClick={() => handleClick("phone")}
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        className="group bg-gradient-to-r from-[#1C2B49] to-[#2A3B5C] hover:from-[#2A3B5C] hover:to-[#1C2B49] text-white font-bold text-lg px-8 py-6 rounded-2xl flex items-center justify-center gap-4 shadow-lg hover:shadow-xl transition-all duration-200 relative overflow-hidden"
                    >
                        <motion.div
                            className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-200"
                        />
                        <HiPhone className="text-2xl group-hover:scale-110 transition-transform duration-200" />
                        <div className="text-left">
                            <div>Appeler maintenant</div>
                            <div className="text-sm opacity-90 font-normal">Contact direct immédiat</div>
                        </div>
                    </motion.button>
                )}
            </div>

            {/* Popup conseils amélioré */}
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setOpen(false)}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-white rounded-3xl border-2 border-yellow-300 p-6 max-w-md w-full mx-4 relative shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Bouton fermer */}
                            <button
                                onClick={() => setOpen(false)}
                                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <FaTimes className="w-5 h-5" />
                            </button>

                            {/* Header avec icône du method */}
                            <div className="text-center mb-6">
                                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-yellow-100 to-yellow-200 mb-4`}>
                                    {method && React.createElement(getMethodDetails().icon, {
                                        className: `text-2xl ${getMethodDetails().color}`
                                    })}
                                </div>
                                <h2 className="text-xl font-bold text-[#1C2B49] mb-2">
                                    {getMethodDetails().title}
                                </h2>
                                <p className="text-gray-600 text-sm">
                                    {getMethodDetails().description}
                                </p>
                            </div>

                            {/* Conseils de sécurité */}
                            <div className="space-y-3 mb-6">
                                <h4 className="font-semibold text-[#1C2B49] text-sm flex items-center gap-2">
                                    <FaShieldAlt className="text-yellow-500" />
                                    Conseils de sécurité
                                </h4>
                                {securityTips.map((tip, idx) => (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.1 }}
                                        className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                                    >
                                        <tip.icon className={`${tip.color} w-5 h-5 shrink-0 mt-0.5`} />
                                        <div>
                                            <h5 className="font-semibold text-[#1C2B49] text-sm">{tip.title}</h5>
                                            <p className="text-gray-600 text-xs leading-relaxed">{tip.description}</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            {/* Boutons d'action */}
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setOpen(false)}
                                    className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-200 text-gray-600 font-medium hover:bg-gray-50 hover:border-gray-300 transition-all duration-200"
                                    disabled={isLoading}
                                >
                                    Annuler
                                </button>
                                <button
                                    onClick={handleConfirm}
                                    disabled={isLoading}
                                    className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-[#F6C445] to-[#FFD700] hover:from-[#FFD700] hover:to-[#F6C445] text-[#1C2B49] font-bold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {isLoading ? (
                                        <motion.div
                                            animate={{ rotate: 360 }}
                                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                            className="w-4 h-4 border-2 border-[#1C2B49] border-t-transparent rounded-full"
                                        />
                                    ) : (
                                        <FaCheckCircle className="w-4 h-4" />
                                    )}
                                    {isLoading ? "Redirection..." : "Confirmer"}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}