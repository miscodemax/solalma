"use client";

import { useState, useRef, useEffect } from "react";

type Message = { sender: "user" | "bot"; text: string };

export default function SangseChatBot() {
    const [messages, setMessages] = useState<Message[]>([
        {
            sender: "bot",
            text: "👋 Bonjour et bienvenue sur Sangse Shop ! Je suis votre assistant personnel. Dites-moi ce que vous cherchez, et je vous aiderai à trouver le produit parfait ! 😊",
        },
    ]);
    const [input, setInput] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Scroll automatique
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const sendMessage = async () => {
        if (!input.trim()) return;

        const user_id = "session_123"; // fixe pour conserver le contexte
        setMessages((prev) => [...prev, { sender: "user", text: input }]);
        setInput("");
        setLoading(true);

        try {
            const res = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ prompt: input, user_id }),
            });

            const data = await res.json();
            setMessages((prev) => [...prev, { sender: "bot", text: data.answer }]);
        } catch (err) {
            console.error(err);
            setMessages((prev) => [
                ...prev,
                { sender: "bot", text: "⚠️ Impossible de contacter le serveur. Réessayez plus tard." },
            ]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-[500px] w-full max-w-md bg-white rounded-xl shadow-xl overflow-hidden border-2 border-yellow-500">
            {/* Header */}
            <div className="bg-yellow-500 text-white p-4 text-center font-bold shadow-md">
                <h2 className="text-xl">🛍️ Sangse Shop Assistant</h2>
                <p className="text-xs mt-1">Votre guide d’achat intelligent 24/7</p>
            </div>

            {/* Messages */}
            <div className="flex-1 p-4 overflow-y-auto bg-gray-50 space-y-3">
                {messages.map((msg, idx) => (
                    <div
                        key={idx}
                        className={`max-w-[85%] p-3 rounded-lg shadow-sm break-words ${msg.sender === "user"
                                ? "ml-auto bg-yellow-500 text-white rounded-br-none animate-slideInFromRight"
                                : "mr-auto bg-white text-gray-800 border border-gray-200 rounded-bl-none animate-slideInFromLeft"
                            }`}
                    >
                        {msg.text}
                    </div>
                ))}
                {loading && (
                    <div className="flex justify-center py-2 text-gray-500">
                        <div className="animate-spin h-5 w-5 border-2 border-yellow-500 border-t-transparent rounded-full mr-2"></div>
                        Le bot réfléchit...
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="flex p-3 border-t bg-white gap-2">
                <input
                    type="text"
                    value={input}
                    placeholder="Ex: 'Je cherche un boubou élégant à 15 000 FCFA...'"
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                    className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
                <button
                    onClick={sendMessage}
                    disabled={loading}
                    className={`px-4 py-2 rounded-full text-white font-medium transition-colors ${loading ? "bg-yellow-300" : "bg-yellow-500 hover:bg-yellow-600"
                        }`}
                >
                    {loading ? "..." : "Envoyer"}
                </button>
            </div>
        </div>
    );
}
