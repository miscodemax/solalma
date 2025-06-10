// app/(products)/ProductList.tsx
import { cookies } from "next/headers"
import { createServerClient } from "@supabase/ssr"
import { supabaseUrl, supabaseKey } from "@/lib/supabase"
import ProductCard from "./product-card"

export default async function ProductList({ products }) {
    const cookieStore = await cookies()
    const supabase = createServerClient(supabaseUrl, supabaseKey, {
        cookies: {
            get: (name) => cookieStore.get(name)?.value,
        },
    })
    const { data: { user } } = await supabase.auth.getUser()

    return (
        <div>
            {products.map(product => (
                <ProductCard
                    key={product.id}
                    product={product}
                    userId={user?.id}
                />
            ))}
        </div>
    )
}
