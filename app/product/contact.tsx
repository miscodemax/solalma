"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { FaWhatsapp, FaShieldAlt, FaCheckCircle, FaExclamationTriangle } from "react-icons/fa";
import { HiPhone } from "react-icons/hi2";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";


interface ContactProps {
    whatsappLink?: string;
    phoneNumber?: number;
}

const securityTips = [
    { icon: FaShieldAlt, title: "Paiement sécurisé", description: "Préférez la remise en main propre et évitez les virements à l'avance." },
    { icon: FaExclamationTriangle, title: "Vérifiez le produit", description: "Demandez des photos supplémentaires si nécessaire." },
    { icon: HiPhone, title: "Lieu sûr", description: "Rencontrez le vendeur dans un endroit public et sécurisé." },
];

export default function ProductContact({ whatsappLink, phoneNumber }: ContactProps) {
    const [open, setOpen] = useState(false);
    const [method, setMethod] = useState<"whatsapp" | "phone" | null>(null);

    const handleClick = (type: "whatsapp" | "phone") => {
        setMethod(type);
        setOpen(true);
    };

    const handleConfirm = () => {
        setOpen(false);
        if (method === "whatsapp" && whatsappLink) window.open(whatsappLink, "_blank", "noopener,noreferrer");
        if (method === "phone" && phoneNumber) window.open(`tel:${phoneNumber}`, "_self");
    };

    return (
        <div className="space-y-6">
            {/* Boutons de contact */}
            {whatsappLink ? (
                <motion.button
                    onClick={() => handleClick("whatsapp")}
                    whileHover={{ scale: 1.05 }}
                    className="bg-gradient-to-r from-green-500 via-green-600 to-emerald-600 text-white font-bold text-lg px-8 py-6 rounded-2xl flex items-center justify-center gap-4 shadow-lg"
                >
                    <FaWhatsapp className="text-2xl" />
                    Discuter sur WhatsApp
                </motion.button>
            ) : (
                <div className="bg-gray-200 text-gray-700 px-8 py-6 rounded-2xl text-center">
                    ❌ WhatsApp non disponible
                </div>
            )}

            {phoneNumber ? (
                <motion.button
                    onClick={() => handleClick("phone")}
                    whileHover={{ scale: 1.05 }}
                    className="bg-[#1C2B49] text-white font-bold text-lg px-8 py-6 rounded-2xl flex items-center justify-center gap-4 shadow-lg"
                >
                    <HiPhone className="text-2xl" />
                    Appeler maintenant
                </motion.button>
            ) : null}

            {/* Popup conseils */}
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="max-w-md mx-4 rounded-3xl border-2 border-yellow-300 p-6">
                    <DialogHeader className="text-center mb-4">
                        <DialogTitle className="text-xl font-bold text-[#1C2B49]">Avant de continuer</DialogTitle>
                        <DialogDescription className="text-gray-600 text-sm">
                            Voici quelques conseils pour un achat sécurisé
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-3 mb-6">
                        {securityTips.map((tip, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl"
                            >
                                <tip.icon className="text-[#F6C445] w-6 h-6 shrink-0" />
                                <div>
                                    <h5 className="font-semibold text-[#1C2B49] dark:text-white text-sm">{tip.title}</h5>
                                    <p className="text-gray-600 dark:text-gray-300 text-xs">{tip.description}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>



                    <div className="flex gap-3">
                        <Button variant="outline" onClick={() => setOpen(false)} className="flex-1 rounded-xl border-gray-300 hover:bg-gray-50">
                            Annuler
                        </Button>
                        <Button onClick={handleConfirm} className="flex-1 rounded-xl bg-gradient-to-r from-[#F6C445] to-[#FFD700] text-[#1C2B49] font-bold shadow-lg">
                            <FaCheckCircle className="w-4 h-4 mr-2 inline" />
                            Confirmer
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
