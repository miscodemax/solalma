"use client";

import { useState } from "react";
import Stack from "react-stackai";

export default function FloatingChat() {
    const [open, setOpen] = useState(false);

    return (
        <>
            {/* Bouton flottant en bas à droite */}
            {!open && (
                <button
                    onClick={() => setOpen(true)}
                    className="fixed bottom-5 right-5 bg-yellow-500 hover:bg-yellow-600 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg z-50"
                >
                    🛍️
                </button>
            )}

            {/* Chat ouvert */}
            {open && (
                <div className="fixed bottom-5 right-5 w-80 h-[500px] z-50">
                    <div className="flex justify-end">
                        <button
                            onClick={() => setOpen(false)}
                            className="bg-red-500 hover:bg-red-600 text-white rounded-full px-2 py-1 mb-1"
                        >
                            ✕
                        </button>
                    </div>
                    <Stack
                        project="https://www.stack-ai.com/embed/0a7c38cb-efcb-4763-a1ce-52f09f9f8dab/0b999669-1767-46da-9e9a-193be5d1a4b9/68dbdee98451de57f2126d98"
                    />
                </div>
            )}
        </>
    );
}
