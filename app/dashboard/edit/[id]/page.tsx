import { createClient } from '@/lib/supabase'
import EditProductForm from '../../add/edit-product-form'
import { notFound } from 'next/navigation'

export default async function EditPage(context: { params: any }) {
    const supabase = createClient()
    const productId = Number(context.params.id)

    console.log('Received id:', context.params.id, 'Parsed id:', typeof(productId))

    if (isNaN(productId)) {
        console.log('Invalid product id')
        return notFound()
    }

    const { data: product, error } = await supabase
        .from('product')
        .select('*')
        .eq('id', productId)
        .single()

    console.log('Product:', product)
    console.log('Error:', error)

    if (!product || error) {
        console.log('Product not found or error occurred')
        return notFound()
    }

    return (
        <div className="p-6 dark:bg-black">
            <h1 className="text-2xl font-bold mb-6">Modifier le produit</h1>
            <EditProductForm product={product} />
        </div>
    )
}

