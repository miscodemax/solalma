// app/(products)/ProductList.tsx
import { cookies } from "next/headers"
import { createServerClient } from "@supabase/ssr"
import { supabaseUrl, supabaseKey } from "@/lib/supabase"
import FilteredProducts from "./filterproduct"

export default async function ProductList({ products }) {
    const cookieStore = await cookies()
    const supabase = createServerClient(supabaseUrl, supabaseKey, {
        cookies: {
            get: (name) => cookieStore.get(name)?.value,
        },
    })

    const { data: { user } } = await supabase.auth.getUser()
    let id = null
    if (user) {
        id = user.id
    }

    
    return (
        <div>

            <FilteredProducts products={products || []} userId={id} />

        </div>
    )
}
