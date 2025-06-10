import Link from "next/link";
import Image from "next/image";
import LikeButton from "./likeButton";
import { createClient } from "@/lib/supabase";

type Product = {
    id: number;
    title: string;
    description: string;
    price: number;
    image_url: string | null;
    user_id: string;
};

export default async function ProductCard({
    product,
    userId,
}: {
    product: Product;
    userId?: string;
}) {
    const supabase = createClient()
    const { data: likes } = await supabase
        .from("product_like")
        .select("*")
        .eq("product_id", product.id)

    const numberLike = likes?.length ?? 0;

    return (
        <div className="group rounded-xl overflow-hidden bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#2a2a2a] hover:shadow-lg transition-all">
            <Link href={`/product/${product.id}`}>
                <div className="relative w-full aspect-[4/5]">
                    <Image
                        src={product.image_url || "/placeholder.jpg"}
                        alt={product.title}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        sizes="(max-width: 768px) 50vw, 20vw"
                    />
                </div>
            </Link>
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
                    <LikeButton productId={product.id} userId={userId} />
                    <span>{numberLike}</span>
                </div>
            </div>
        </div>
    );
}
