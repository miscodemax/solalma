import { cookies } from "next/headers"
import { createServerClient } from "@supabase/ssr"
import { supabaseUrl, supabaseKey } from "@/lib/supabase"
import Image from "next/image"
import Link from "next/link"


export default async function UserProfilePage({ params }: { params: { id: string } }) {
  const cookieStore = await cookies()
  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      get: (name) => cookieStore.get(name)?.value,
    },
  })
  const { id } = params

  // Récupération du profil consulté
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("username, avatar_url, bio")
    .eq("id", id)
    .single()

  // Récupération de l'utilisateur connecté
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Récupération des produits liés
  const { data: products } = await supabase
    .from("product")
    .select("*")
    .eq("user_id", id)
    .order("created_at", { ascending: false })




  if (!profile || profileError) {
    return <p className="p-6 text-center text-red-500 font-semibold">Profil introuvable.</p>
  }

  console.log('userid: ' + user.id + 'id: ' + id);
  console.log('Produits trouvés :', products);


  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Section Profil */}
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
        <div className="w-24 h-24 relative">
          <Image
            src={profile.avatar_url || "/default-avatar.png"}
            alt="Avatar"
            fill
            className="rounded-full object-cover border"
          />
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{profile.username || "Utilisateur"}</h1>
          <p className="text-gray-600">{profile.bio || "Pas de biographie disponible."}</p>

          {/* Bouton modifier (si c'est mon profil) */}
          {user?.id === id && (
            <Link
              href="/profile/update"
              className="inline-block mt-4 px-4 py-2 text-sm bg-[#D29587] text-white rounded hover:bg-[#bb7e70] transition"
            >
              ✏️ Modifier mon profil
            </Link>
          )}
        </div>
      </div>

      {/* Section Produits */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Produits en vente</h2>

        {products && products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
        ) : (
          <p className="text-gray-500">Aucun produit pour l’instant.</p>
        )}
      </div>
    </div>
  )
}
