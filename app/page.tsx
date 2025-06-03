import { cookies } from "next/headers"
import { createServerClient } from "@supabase/ssr"
import { supabaseUrl, supabaseKey } from "@/lib/supabase"
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'


type Props = {
  searchParams: { category?: string }
}
 
export default async function HomePage({ searchParams }: Props) {
  const cookieStore = await cookies()
  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      get: (name) => cookieStore.get(name)?.value,
    },
  })

  const category = searchParams.category || ''

  // Étape 1 : récupère TOUS les produits
  const query = supabase.from('product').select('*')
  if (category) {
    query.ilike('category', category)
  }

  const { data: products, error } = await query
  if (error) {
    return (
      <p className="text-red-500 text-center mt-10">
        Erreur : {error.message}
      </p>
    )
  }

  
  return (
    <main className="w-full overflow-x-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-12">
        {/* CTA Section */}
        <section className="bg-[#FAF6F4] border border-[#E6E3DF] rounded-2xl p-4 sm:p-6 text-center shadow-sm mx-auto w-full max-w-md sm:max-w-xl">
          <h2 className="text-lg sm:text-2xl font-bold text-[#D29587] mb-2 sm:mb-3">
            Tu as des articles à vendre ?
          </h2>
          <p className="text-gray-600 mb-4 text-sm sm:text-base">
            Rejoins notre communauté et donne une seconde vie à tes vêtements, hijabs, produits skincare...
          </p>
          <Link
            href="/dashboard/add"
            className="inline-flex items-center justify-center gap-2 bg-[#D29587] text-white font-semibold px-4 py-2 rounded-xl text-sm sm:text-base shadow hover:bg-[#bb7d72] transition"
          >
            Commencer à vendre <ArrowRight size={18} />
          </Link>
        </section>

        {/* Produits */}
        <section>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6">
            {products.map((product) => (
              <Link key={product.id} href={`/product/${product.id}`} className="group block">
                <div className="bg-white border border-[#E6E3DF] rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition duration-300 w-full">
                  <div className="relative w-full h-48 sm:h-56">
                    <Image
                      src={product.image_url || '/placeholder.jpg'}
                      alt={product.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105 group-hover:rotate-1"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    />
                  </div>
                  <div className="p-3 sm:p-4 space-y-1">
                    <h2 className="text-sm sm:text-base font-semibold text-[#333] truncate">
                      {product.title}
                    </h2>
                    <p className="text-xs sm:text-sm text-[#777] line-clamp-2">
                      {product.description}
                    </p>
                    <p className="mt-1 font-bold text-[#D29587] text-sm sm:text-base">
                      {product.price} FCFA
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}
