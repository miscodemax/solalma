// app/profile/[id]/page.tsx
import { createClient } from '@/lib/supabase'
import Image from 'next/image'
import Link from 'next/link'

export default async function UserProfilePage({ params }) {
  const supabase = createClient()
  const { id } = params

  // Récupérer le profil utilisateur
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('username, avatar_url, bio')
    .eq('id', id)
    .single()

  if (!profile || profileError) {
    return <p className="p-4 text-center text-red-500">Profil introuvable.</p>
  }

  // Récupérer les produits liés à cet utilisateur
  const { data: products } = await supabase
    .from('products')
    .select('*')
    .eq('user_id', id) // ⚠️ adapte ce champ selon ta colonne FK dans "products"
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Profil utilisateur */}
      <div className="flex items-center gap-4 mb-6">
        <div className="w-20 h-20 relative">
          <Image
            src={profile.avatar_url || '/default-avatar.png'}
            alt="Avatar"
            fill
            className="rounded-full object-cover"
          />
        </div>
        <div>
          <h1 className="text-2xl font-bold">{profile.username || 'Utilisateur'}</h1>
          <p className="text-gray-600">{profile.bio || 'Pas de biographie disponible.'}</p>
        </div>
      </div>

      {/* Produits de l'utilisateur */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Produits en vente</h2>

        {products && products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map(product => (
              <Link
                key={product.id}
                href={`/product/${product.id}`}
                className="border rounded-lg p-4 hover:shadow-md transition"
              >
                <div className="w-full h-40 relative mb-2">
                  <Image
                    src={product.image_url || '/placeholder.jpg'}
                    alt={product.title}
                    fill
                    className="rounded-md object-cover"
                  />
                </div>
                <h3 className="font-semibold">{product.title}</h3>
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
