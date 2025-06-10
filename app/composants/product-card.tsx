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
    console.log(product);

    const supabase = createClient();
    const { data: likes } = await supabase
        .from("product_like")
        .select("*")
        .eq("product_id", product.id);

    const numberLike = likes?.length ?? 0;
    console.log(numberLike);


    return (
        <div className="group rounded-xl overflow-hidden bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#2a2a2a] hover:shadow-lg transition-all">
            <div className="relative w-full aspect-[4/5]">
                <Link href={`/product/${product.id}`}>
                    <Image
                        src={product.image_url || "/placeholder.jpg"}
                        alt={product.title}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        sizes="(max-width: 768px) 50vw, 20vw"
                    />
                </Link>

                {/* Like + Count in corner */}
                <div className="absolute top-2 right-2 bg-white/90 dark:bg-black/50 backdrop-blur-sm px-2 py-1 rounded-full flex items-center gap-1 text-sm text-gray-800 dark:text-white shadow-sm">
                    <LikeButton productId={product.id} userId={userId} />
                    <span className="text-xs">{numberLike}</span>
                </div>
            </div>

            <div className="p-3 space-y-1">
                <h2 className="text-sm font-semibold text-[#222] dark:text-white truncate">
                    {product.title}
                </h2>
                <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2">
                    {product.description}
                </p>
                <span className="text-sm font-bold text-[#D29587] dark:text-[#FBCFC2] block mt-1">
                    {product.price.toLocaleString()} FCFA
                </span>
            </div>
        </div>
    );
}
