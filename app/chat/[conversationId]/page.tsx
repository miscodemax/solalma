// app/chat/[conversationId]/page.tsx
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import ChatClient from "../chat-client";
import { supabaseUrl, supabaseKey } from "@/lib/supabase";

export default async function ChatPage({ params }) {
  const cookieStore = await cookies();
  // Crée le client Supabase en mode serveur avec gestion sécurisée des cookies
  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      get: (name: string) => cookieStore.get(name)?.value,
    },
  });

  const { data: conversation } = await supabase
    .from("conversations")
    .select(
      `
      id,
      product:product_id(title, image_url),
      buyer_id,
      seller_id
    `
    )
    .eq("id", params.conversationId)
    .single();

  if (!conversation) return <div>Conversation introuvable</div>;

  return <ChatClient conversation={conversation} />;
}
