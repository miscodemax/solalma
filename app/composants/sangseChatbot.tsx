"use client";
import { useState, useRef, useEffect } from "react";

type Message = {
    sender: "user" | "bot";
    text: string;
    loading?: boolean;
};

export default function SangseChatBot() {
    const [messages, setMessages] = useState<Message[]>([
        {
            sender: "bot",
            text: "👋 **Bonjour et bienvenue sur Sangse Shop !**\nJe suis votre assistant personnel. Dites-moi ce que vous cherchez (ex: *une robe à 5 000 FCFA*), et je vous aiderai à trouver le produit parfait ! 😊",
        },
    ]);
    const [input, setInput] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Scroll automatique vers le bas
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Appel à l'API Stack AI
    const queryStackAI = async (prompt: string) => {
        try {
            const response = await fetch(
                "https://api.stack-ai.com/inference/v0/run/0a7c38cb-efcb-4763-a1ce-52f09f9f8dab/68dbdee98451de57f2126d98",
                {
                    method: "POST",
                    headers: {
                        Authorization: "Bearer 0b999669-1767-46da-9e9a-193be5d1a4b9",
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        "in-0": `
              Tu es un assistant d'achat intelligent pour Sangse Shop, le marketplace sénégalais.
              **Règles :**
              - Réponds en français, avec un ton amical et professionnel.
              - Si le client demande un produit, propose-lui des options avec des liens directs (ex: https://sangse.shop/product/123).
              - Si le budget ou les détails sont flous, demande des précisions.
              - Utilise des emojis pour rendre la conversation vivante.
              - Limite tes réponses à 3 phrases max pour rester clair.

              **Question du client :** "${prompt}"
            `,
                        user_id: "sangse_user_" + Math.random().toString(36).substring(2, 9),
                    }),
                }
            );
            const data = await response.json();
            return data["out-0"] || "Désolé, je n’ai pas trouvé de réponse adaptée. Pouvez-vous préciser ?";
        } catch (error) {
            console.error("Erreur API:", error);
            return "⚠️ Une erreur est survenue. Veuillez réessayer plus tard.";
        }
    };

    // Envoi du message
    const sendMessage = async () => {
        if (!input.trim()) return;
        setMessages((prev) => [...prev, { sender: "user", text: input }]);
        setInput("");
        setLoading(true);

        const botResponse = await queryStackAI(input);
        setMessages((prev) => [...prev, { sender: "bot", text: botResponse }]);
        setLoading(false);
    };

    return (
        <div className="flex flex-col h-[500px] w-full max-w-md bg-white rounded-xl shadow-xl overflow-hidden border-2 border-yellow-500">
            {/* En-tête personnalisé */}
            <div className="bg-yellow-500 text-white p-4 text-center font-bold shadow-md">
                <h2 className="text-xl">🛍️ **Sangse Shop Assistant**</h2>
                <p className="text-xs mt-1">Votre guide d’achat intelligent 24/7</p>
            </div>

            {/* Zone de messages */}
            <div className="flex-1 p-4 overflow-y-auto bg-gray-50 space-y-3">
                {messages.map((msg, idx) => (
                    <div
                        key={idx}
                        className={`max-w-[85%] p-3 rounded-lg shadow-sm break-words ${msg.sender === "user"
                                ? "ml-auto bg-yellow-500 text-white rounded-br-none animate-slideInFromRight"
                                : "mr-auto bg-white text-gray-800 border border-gray-200 rounded-bl-none animate-slideInFromLeft"
                            }`}
                    >
                        {msg.sender === "bot" && (
                            <div className="flex items-start gap-2">
                                <span className="text-yellow-500">🤖</span>
                                <span className="whitespace-pre-wrap">{msg.text}</span>
                            </div>
                        )}
                        {msg.sender === "user" && (
                            <div className="flex items-start gap-2 justify-end">
                                <span className="whitespace-pre-wrap">{msg.text}</span>
                                <span className="text-yellow-500">👤</span>
                            </div>
                        )}
                    </div>
                ))}
                {loading && (
                    <div className="flex justify-center py-2">
                        <div className="flex items-center gap-2 text-gray-500">
                            <div className="animate-spin h-5 w-5 border-2 border-yellow-500 border-t-transparent rounded-full"></div>
                            <span>Le bot réfléchit...</span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Zone d'input */}
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
                    {loading ? <span className="animate-pulse">...</span> : "Envoyer"}
                </button>
            </div>
        </div>
    );
}
