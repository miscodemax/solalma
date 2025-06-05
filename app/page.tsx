import { cookies } from "next/headers"
import { createServerClient } from "@supabase/ssr"
import { supabaseUrl, supabaseKey } from "@/lib/supabase"
import FilteredProducts from "./composants/filterproduct"

type Props = {
  searchParams: {
    category?: string
    q?: string  // <-- nouveau paramètre
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
  const q = searchParams.q?.trim() || ''  // <-- récupération du terme de recherche

  // Récupérer les produits
  let query = supabase.from('product').select('*')

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

  return <FilteredProducts products={products || []} search={q} />
}
