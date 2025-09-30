"use client";

import { useState } from "react";
import SangseChatBot from "./sangseChatbot";// ton composant chatbot

export default function FloatingChat() {
    const [open, setOpen] = useState(false);

    return (
        <>
            {/* Icône flottante */}
            <button
                onClick={() => setOpen(!open)}
                className="fixed bottom-5 right-5 bg-blue-500 text-white p-4 rounded-full shadow-lg hover:bg-blue-600 z-50"
            >
                💬
            </button>

            {/* Chat flottant */}
            {open && (
                <div className="fixed bottom-20 right-5 w-80 h-[500px] z-50">
                    <SangseChatBot />
                </div>
            )}
        </>
    );
}
