
'use server'
import { cookies } from "next/headers"
import { createServerClient } from "@supabase/ssr"
import { supabaseUrl, supabaseKey } from "@/lib/supabase"
import Link from "next/link"
import Image from "next/image"
import LikeButton from "./likeButton"

type Product = {
    id: number
    title: string
    description: string
    price: number
    image_url: string | null
    user_id: string
}

export default async function ProductCard({ product }: { product: Product }) {
    const cookieStore = await cookies()
    const supabase = createServerClient(supabaseUrl, supabaseKey, {
        cookies: {
            get: (name) => cookieStore.get(name)?.value,
        },
    })
    const { data: { user } } = await supabase.auth.getUser()
    return (
        <Link
            href={`/product/${product.id}`}
            className="group rounded-xl overflow-hidden bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#2a2a2a] hover:shadow-lg transition-all"
        >
            <div className="relative w-full aspect-[4/5]">
                <Image
                    src={product.image_url || "/placeholder.jpg"}
                    alt={product.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="(max-width: 768px) 50vw, 20vw"
                />
            </div>
            <div className="p-3 space-y-1">
                <h2 className="text-sm font-semibold text-[#222] dark:text-white truncate">
                    {product.title}
                </h2>
                <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2">
                    {product.description}
                </p>
                <div className="flex justify-between items-center mt-1">
                    <span className="text-sm font-bold text-[#D29587] dark:text-[#FBCFC2]">
                        {product.price.toLocaleString()} FCFA
                    </span>
                    {user && (
                        <LikeButton productId={product.id} userId={user.id} />
                    )}
                </div>
            </div>
        </Link>
    )
}
