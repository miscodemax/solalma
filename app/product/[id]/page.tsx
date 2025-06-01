
import { cookies } from "next/headers"
import { createServerClient } from "@supabase/ssr"
import { supabaseUrl, supabaseKey } from "../../../lib/supabase"
//import { createClient } from '@/lib/supabase'
import Image from 'next/image'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import dayjs from 'dayjs'


/*type Props = {
  params: {
    id: string
  }
}*/

export default async function ProductDetailPage({ params }: any) {


    // 🔒 Vérifie si l'utilisateur est connecté
    const cookieStore = await cookies()
    const supabase = createServerClient(supabaseUrl, supabaseKey, {
        cookies: {
            get: (name) => cookieStore.get(name)?.value,
        },
    })

    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
        redirect("/signin")
    }

    //const supabaseProduct = createClient()
    // 📦 Récupérer produit
    const { data: product } = await supabase
        .from('product')
        .select('*')
        .eq('id', Number(params.id))
        .single()

    if (error || !product) {
        notFound()
    }

    // 🆕 Déterminer si le produit est une nouveauté
    const isNew =
        product.created_at &&
        dayjs(product.created_at).isAfter(dayjs().subtract(7, 'day'))

    // 🔁 Récupérer produits similaires
    const { data: similarProducts } = await supabase
        .from('product')
        .select('*')
        .eq('category', product.category)
        .neq('id', product.id)
        .limit(6)

    const whatsappClean = product.whatsapp_number?.replace(/\D/g, '')
    const whatsappLink = whatsappClean ? `https://wa.me/${whatsappClean}` : null

    return (
        <div className="max-w-6xl mx-auto px-4 py-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
                {/* Image */}
                <div className="relative w-full h-[520px] rounded-2xl overflow-hidden shadow border border-[#E6E3DF] group cursor-zoom-in">
                    <Image
                        src={product.image_url || '/placeholder.jpg'}
                        alt={product.title}
                        fill
                        className="object-cover transition-transform duration-700 ease-in-out group-hover:scale-[1.15]"
                        priority
                    />
                </div>

                {/* Infos produit */}
                <div className="space-y-5">
                    <h1 className="text-4xl font-extrabold text-[#333]">{product.title}</h1>

                    {isNew && (
                        <span className="inline-block bg-[#D29587]/20 text-[#D29587] px-4 py-1 rounded-full text-sm font-medium">
                            🆕 Nouveauté
                        </span>
                    )}

                    <p className="text-md font-semibold text-[#D29587] uppercase tracking-wide">
                        Catégorie : {product.category || 'Non spécifiée'}
                    </p>



                    <p className="text-3xl font-bold text-[#D29587]">
                        {product.price.toLocaleString()} FCFA
                    </p>

                    {whatsappLink ? (
                        <a
                            href={whatsappLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block mt-6 px-8 py-4 bg-green-500 text-white font-semibold rounded-xl hover:bg-green-600 transition"
                        >
                            <svg className="inline-block w-6 h-6 mr-2 -mt-1" fill="currentColor" viewBox="0 0 24 24">
                                <path d="..." />
                            </svg>
                            Contacter le vendeur
                        </a>
                    ) : (
                        <p className="mt-6 text-red-500 font-semibold">Numéro WhatsApp non disponible</p>
                    )}
                </div>
                <p className="text-lg text-[#555] leading-relaxed whitespace-pre-line">
                    {product.description}
                </p>
            </div>

            {/* Produits similaires */}
            {similarProducts && similarProducts.length > 0 && (
                <section className="mt-16">
                    <h2 className="text-2xl font-bold text-[#333] mb-6">Produits similaires</h2>
                    <div className="flex space-x-6 overflow-x-auto scrollbar-thin scrollbar-thumb-[#D29587]/70 scrollbar-track-transparent">
                        {similarProducts.map((p) => (
                            <Link
                                key={p.id}
                                href={`/product/${p.id}`}
                                className="min-w-[220px] bg-white border border-[#E6E3DF] rounded-2xl shadow hover:shadow-md transition p-4 flex flex-col cursor-pointer"
                            >
                                <div className="relative w-full h-40 rounded-lg overflow-hidden mb-3">
                                    <Image
                                        src={p.image_url || '/placeholder.jpg'}
                                        alt={p.title}
                                        fill
                                        className="object-cover"
                                        sizes="(max-width: 640px) 100vw, 220px"
                                    />
                                </div>
                                <h3 className="font-semibold text-[#333] truncate">{p.title}</h3>
                                <p className="text-[#D29587] font-bold mt-auto">{p.price.toLocaleString()} FCFA</p>
                            </Link>
                        ))}
                    </div>
                </section>
            )}
        </div>
    )
}
