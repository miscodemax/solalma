import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const { prompt, user_id } = await req.json();

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
            Tu es un assistant d'achat pour Sangse Shop, marketplace sénégalais.
            Réponds en français, de façon amicale et concise (max 3 phrases).
            Si le client demande un produit, propose le lien direct (ex: https://sangse.shop/product/123).
            Question : "${prompt}"
          `,
                    user_id,
                }),
            }
        );

        const data = await response.json();
        return NextResponse.json({ answer: data["out-0"] || "Désolé, je n’ai pas compris." });
    } catch (err) {
        console.error("Erreur API:", err);
        return NextResponse.json(
            { answer: "⚠️ Une erreur est survenue. Veuillez réessayer plus tard." },
            { status: 500 }
        );
    }
}
