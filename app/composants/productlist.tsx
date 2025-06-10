// app/(products)/ProductList.tsx
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { supabaseUrl, supabaseKey } from "@/lib/supabase";
import FilteredProducts from "./filterproduct";

export default async function ProductList({ products }) {
    const cookieStore = await cookies();
    const supabase = createServerClient(supabaseUrl, supabaseKey, {
        cookies: {
            get: (name) => cookieStore.get(name)?.value,
        },
    });

    const { data: { user } } = await supabase.auth.getUser();
    let id = null
    if (user) {
        id = user.id
    }

    // 🔥 Étape clé : récupérer tous les likes pour les produits affichés

    const { data: likesData } = await supabase
        .from("product_like")
        .select("*");

    // ✅ Compter le nombre de likes par produit
    const likeCounts: Record<number, number> = {};
    for (const like of likesData || []) {
        if (likeCounts[like.product_id]) {
            likeCounts[like.product_id]++;
        } else {
            likeCounts[like.product_id] = 1;
        }
    }

    // 🧠 Ajouter les likes aux produits
    const productsWithLikes = products.map((product) => ({
        ...product,
        likes: likeCounts[product.id] || 0,
    }));

    return (
        <div>
            <FilteredProducts products={productsWithLikes} userId={id} />
        </div>
    );
}
