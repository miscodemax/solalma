"use client";

import { useState } from "react";
import Stack from "react-stackai";

export default function FloatingChat() {
    const [open, setOpen] = useState(false);

    return (
        <>
            {/* Bouton flottant avec animation */}
            <button
                onClick={() => setOpen(true)}
                className={`fixed bottom-5 right-5 bg-yellow-500 hover:bg-yellow-600 text-white rounded-full w-16 h-16 flex items-center justify-center shadow-lg z-50 transition-transform duration-300 ${open ? "scale-90 opacity-0 pointer-events-none" : "scale-100 opacity-100"
                    }`}
            >
                🛍️
            </button>

            {/* Chat ouvert */}
            <div
                className={`fixed bottom-5 right-5 w-80 h-[500px] z-50 transform transition-all duration-300 ${open ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0 pointer-events-none"
                    }`}
            >
                <div className="flex flex-col h-full rounded-xl shadow-xl overflow-hidden border-2 border-yellow-500 bg-white">
                    {/* Header du chat */}
                    <div className="flex justify-between items-center bg-yellow-500 text-white p-3 font-bold">
                        <span>🛍️ Sangse Chat</span>
                        <button
                            onClick={() => setOpen(false)}
                            className="bg-red-500 hover:bg-red-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold"
                        >
                            ✕
                        </button>
                    </div>

                    {/* Conteneur Stack AI */}
                    <div className="flex-1">
                        <Stack
                            project="https://www.stack-ai.com/embed/0a7c38cb-efcb-4763-a1ce-52f09f9f8dab/0b999669-1767-46da-9e9a-193be5d1a4b9/68dbdee98451de57f2126d98"
                        />
                    </div>
                </div>
            </div>
        </>
    );
}
