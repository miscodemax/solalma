import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@/lib/supabase";
import { supabaseUrl, supabaseKey } from "@/lib/supabase";
import ProductList from "./composants/productlist";
import { Suspense } from "react";
import ProductSkeletonDemo from "./composants/skeletonproduct";

type Props = {
  searchParams: {
    category?: string;
    q?: string;
  };
};

export default async function HomePage({ searchParams }: Props) {
  const cookieStore = await cookies();
  const supabase = createClient();

  const category = searchParams.category || "";

  // Requête avec jointure + comptage des likes
  let query = supabase
    .from("product")
    .select(
      `
    *,
    product_like(count)
  `
    )
    .order("created_at", { ascending: false }); // OK

  if (category) {
    query = query.ilike("category", `%${category}%`);
  }

  const { data: products, error } = await query;

  if (error) {
    return (
      <p className="text-red-500 text-center mt-10">Erreur : {error.message}</p>
    );
  }

  // ✅ Tri côté JavaScript
  const sorted = [...(products || [])].sort((a, b) => {
    const likesA = a.product_like?.length || 0;
    const likesB = b.product_like?.length || 0;
    return likesB - likesA; // Descendant
  });

  return (
    <Suspense fallback={<ProductSkeletonDemo />}>
      <ProductList products={sorted} />
    </Suspense>
  );
}
