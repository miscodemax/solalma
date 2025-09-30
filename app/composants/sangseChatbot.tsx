"use client";

import { useState } from "react";

type Message = {
    sender: "user" | "bot";
    text: string;
};

export default function SangseChatBot() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);

    // URL API Stack AI
    const STACK_AI_URL =
        "https://api.stack-ai.com/inference/v0/run/0a7c38cb-efcb-4763-a1ce-52f09f9f8dab/68dbdee98451de57f2126d98";

    // Ton token Stack AI
    const API_KEY = "Bearer 0b999669-1767-46da-9e9a-193be5d1a4b9";

    const sendMessage = async () => {
        if (!input.trim()) return;

        // Ajouter le message utilisateur
        setMessages([...messages, { sender: "user", text: input }]);
        setInput("");
        setLoading(true);

        try {
            const response = await fetch(STACK_AI_URL, {
                method: "POST",
                headers: {
                    Authorization: API_KEY,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    "in-0": input,
                    user_id: "test_user_1",
                }),
            });

            const data = await response.json();

            // Ajouter la réponse du bot
            setMessages((prev) => [...prev, { sender: "bot", text: data["out-0"] }]);
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
        <div className="max-w-md mx-auto border rounded-lg p-4 shadow-lg bg-white">
            <div className="h-64 overflow-y-auto mb-4 space-y-2">
                {messages.map((msg, idx) => (
                    <div
                        key={idx}
                        className={`p-2 rounded ${msg.sender === "user" ? "bg-blue-100 text-right" : "bg-green-100 text-left"
                            }`}
                    >
                        {msg.text}
                    </div>
                ))}
                {loading && <div className="text-gray-500">Le bot réfléchit...</div>}
            </div>

            <div className="flex gap-2">
                <input
                    className="flex-1 border rounded p-2"
                    type="text"
                    placeholder="Écris ta question..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                />
                <button
                    onClick={sendMessage}
                    className="bg-blue-500 text-white px-4 rounded hover:bg-blue-600"
                >
                    Envoyer
                </button>
            </div>
        </div>
    );
}
