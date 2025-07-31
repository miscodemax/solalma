import { cookies } from "next/headers"
import { createServerClient } from "@supabase/ssr"
import { supabaseUrl, supabaseKey } from "@/lib/supabase"
import ProductList from "./composants/productlist"

type Props = {
  searchParams: {
    category?: string
    q?: string
  }
}

export default async function HomePage({ searchParams }: Props) {
  const cookieStore = await cookies()
  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      get: (name) => cookieStore.get(name)?.value,
    },
  })

  const category = searchParams.category || ''

  // Requête avec jointure + comptage des likes
  let query = supabase
    .from('product')
    .select(`
      *,
      product_like(count)
    `)
    .order('product_like.count', { ascending: false }) // Tri par nombre de likes
    .order('created_at', { ascending: false })         // Tri par produit récent


  if (category) {
    query = query.ilike('category', `%${category}%`)
  }

  const { data: products, error } = await query

  if (error) {
    return (
      <p className="text-red-500 text-center mt-10">
        Erreur : {error.message}
      </p>
    )
  }

  return <ProductList products={products} />
}
