"use client";
import { useState, useRef, useEffect } from "react";

type Message = {
  sender: "user" | "bot";
  text: string;
};

export default function SangseChatBot() {
  const [messages, setMessages] = useState<Message[]>([
    { sender: "bot", text: "👋 Bonjour ! Je suis votre assistant Sangse Shop. Comment puis-je vous aider à trouver le produit parfait aujourd’hui ? 😊" }
  ]);
  const [input, setInput] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const STACK_AI_URL = "https://api.stack-ai.com/inference/v0/run/0a7c38cb-efcb-4763-a1ce-52f09f9f8dab/68dbdee98451de57f2126d98";
  const API_KEY = "Bearer 0b999669-1767-46da-9e9a-193be5d1a4b9";

  // Scroll automatique
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
      const prompt = `
        Tu es un vendeur virtuel amical et professionnel sur Sangse Shop, le marketplace sénégalais de référence.
        Ton ton est chaleureux, expert et rassurant. Tu utilises des emojis pour rendre la conversation vivante.
        Aide le client à trouver des produits selon son budget, son style et ses besoins.
        Si possible, donne toujours le lien du produit sous la forme : https://sangse.shop/product/[id].
        Réponds en français, avec des phrases courtes et claires.
        Question du client : "${userMessage}"
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
        { sender: "bot", text: data["out-0"] || "Désolé, je n’ai pas bien compris. Pouvez-vous reformuler ? 😕" },
      ]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "⚠️ Oups ! Une erreur est survenue. Veuillez réessayer plus tard." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[500px] w-full max-w-md mx-auto border-2 border-yellow-500 rounded-xl shadow-xl bg-white overflow-hidden">
      {/* En-tête personnalisé */}
      <div className="bg-yellow-500 text-white p-4 text-center font-bold shadow-md">
        <h2 className="text-xl">🛍️ Sangse Shop Assistant</h2>
        <p className="text-xs mt-1">Votre guide d’achat intelligent</p>
      </div>

      {/* Zone de messages */}
      <div className="flex-1 p-4 overflow-y-auto bg-gray-50 space-y-3">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`max-w-[85%] p-3 rounded-lg shadow-sm break-words ${msg.sender === "user"
              ? "ml-auto bg-yellow-500 text-white rounded-br-none animate-slideInFromRight"
              : "mr-auto bg-white text-gray-800 border border-gray-200 rounded-bl-none animate-slideInFromLeft"}`}
          >
            {msg.text}
          </div>
        ))}
        {loading && (
          <div className="flex justify-center py-2">
            <div className="animate-spin h-6 w-6 border-4 border-yellow-500 border-t-transparent rounded-full"></div>
          </div>
        )}
        <div ref={messagesEndRef}></div>
      </div>

      {/* Zone d'input */}
      <div className="flex p-3 border-t bg-white gap-2">
        <input
          type="text"
          value={input}
          placeholder="Ex: 'Je cherche un boubou élégant sous 20 000 FCFA...'"
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400"
        />
        <button
          onClick={sendMessage}
          disabled={loading}
          className={`px-4 py-2 rounded-full text-white font-medium transition-colors ${loading ? "bg-yellow-300" : "bg-yellow-500 hover:bg-yellow-600"}`}
        >
          {loading ? "..." : "Envoyer"}
        </button>
      </div>
    </div>
  );
}
