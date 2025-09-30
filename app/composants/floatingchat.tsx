"use client";
import { useState, useRef, useEffect } from "react";
import SangseChatBot from "./sangseChatbot";

export default function FloatingChat() {
    const [open, setOpen] = useState(false);
    const chatRef = useRef<HTMLDivElement>(null);

    // Fermer le chat si clic à l'extérieur
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (chatRef.current && !chatRef.current.contains(event.target as Node)) {
                setOpen(false);
            }
        };
        if (open) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [open]);

    return (
        <>
            {/* Icône flottante personnalisée */}
            <button
                onClick={() => setOpen(!open)}
                className={`fixed bottom-5 right-5 w-16 h-16 flex items-center justify-center rounded-full shadow-xl z-50 transition-all duration-300 ${open ? "bg-yellow-600" : "bg-yellow-500"} hover:bg-yellow-600 hover:shadow-2xl`}
            >
                <span className="text-white text-2xl">💬</span>
                {/* Animation de notification (optionnel) */}
                {!open && (
                    <span className="absolute top-0 right-0 block h-3 w-3 rounded-full bg-red-500 animate-pulse"></span>
                )}
            </button>

            {/* Chat flottant avec animation */}
            {open && (
                <div
                    ref={chatRef}
                    className="fixed bottom-24 right-5 w-80 h-[500px] z-50 transition-all duration-300 ease-in-out transform"
                >
                    <SangseChatBot />
                </div>
            )}
        </>
    );
}
