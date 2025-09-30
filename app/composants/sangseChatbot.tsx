"use client";

import { useState, useRef, useEffect } from "react";

type Message = {
    sender: "user" | "bot";
    text: string;
};

export default function SangseChatBot() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const STACK_AI_URL =
        "https://api.stack-ai.com/inference/v0/run/0a7c38cb-efcb-4763-a1ce-52f09f9f8dab/68dbdee98451de57f2126d98";

    const API_KEY = "Bearer 0b999669-1767-46da-9e9a-193be5d1a4b9";

    // Scroll automatique vers le dernier message
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const sendMessage = async () => {
        if (!input.trim()) return;

        const userMessage = input;
        setMessages((prev) => [...prev, { sender: "user", text: userMessage }]);
        setInput("");
        setLoading(true);

        try {
            // Enrichir le prompt pour obtenir de meilleures réponses
            const prompt = `
        Tu es un vendeur virtuel amical sur Sangse, le marketplace sénégalais.
        Aide le client à trouver des produits selon son budget et style.
        Donne toujours le lien du produit sous la forme https://sangse.shop/product/[id] si tu peux.
        Question du client: "${userMessage}"
      `;

            const response = await fetch(STACK_AI_URL, {
                method: "POST",
                headers: {
                    Authorization: API_KEY,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    "in-0": prompt,
                    user_id: "test_user_1",
                }),
            });

            const data = await response.json();

            setMessages((prev) => [
                ...prev,
                { sender: "bot", text: data["out-0"] || "Désolé, je n'ai pas compris." },
            ]);
        } catch (err) {
            console.error(err);
            setMessages((prev) => [
                ...prev,
                { sender: "bot", text: "Erreur : impossible de contacter Stack AI." },
            ]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full border rounded-lg shadow-lg bg-white">
            <div className="flex-1 p-4 overflow-y-auto space-y-3">
                {messages.map((msg, idx) => (
                    <div
                        key={idx}
                        className={`max-w-[80%] p-2 rounded-lg break-words ${msg.sender === "user"
                                ? "ml-auto bg-blue-100 text-right animate-fadeIn"
                                : "mr-auto bg-green-100 text-left animate-fadeIn"
                            }`}
                    >
                        {msg.text}
                    </div>
                ))}
                {loading && <div className="text-gray-500">Le bot réfléchit...</div>}
                <div ref={messagesEndRef}></div>
            </div>

            <div className="flex p-3 border-t bg-gray-50 gap-2">
                <input
                    type="text"
                    value={input}
                    placeholder="Écris ta question..."
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                    className="flex-1 border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <button
                    onClick={sendMessage}
                    className="bg-blue-500 text-white px-4 rounded hover:bg-blue-600 transition-colors"
                    disabled={loading}
                >
                    Envoyer
                </button>
            </div>
        </div>
    );
}
