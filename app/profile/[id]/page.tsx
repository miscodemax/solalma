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


  // Récupération de la note moyenne du vendeur
  const { data: ratingsData } = await supabase
    .from("ratings_sellers")
    .select("rating")
    .eq("seller_id", id)

  const ratings = ratingsData?.map((r) => r.rating) || []
  const averageRating =
    ratings.length > 0 ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1) : null


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
          {ratings.length > 0 ? (
            <p className="text-sm text-yellow-600 mt-2">
              ⭐ Note moyenne du vendeur : <span className="font-semibold">{averageRating} / 5</span>
            </p>
          ) : (
            <p className="text-sm text-gray-400 mt-2">⭐ Aucun avis pour l’instant</p>
          )}


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
              <Link
                key={product.id}
                href={`/product/${product.id}`}
                className="border rounded-lg p-3 hover:shadow-md transition bg-white"
              >
                <div className="w-full h-40 relative mb-2">
                  <Image
                    src={
                      product.image_url ||
                      "https://icons.veryicon.com/png/o/miscellaneous/standard/avatar-15.png"
                    }
                    alt={product.title}
                    fill
                    className="rounded-md object-cover"
                  />
                </div>
                <h3 className="font-semibold truncate">{product.title}</h3>
                <p className="text-sm text-gray-500">{product.price} FCFA</p>
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
