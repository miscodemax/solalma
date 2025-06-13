import Link from "next/link";
import Image from "next/image";
import LikeButton from "./likeButton";

type Product = {
    id: number;
    title: string;
    description: string;
    price: number;
    image_url: string | null;
    user_id: string;
    likes?: number;
};

export default async function ProductCard({
    product,
    userId,
}: {
    product: Product;
    userId?: string;
}) {
    return (
        <div className="group rounded-2xl overflow-hidden bg-gradient-to-b from-white/90 to-[#f8f6f4] dark:from-[#232323] dark:to-[#18181b] border border-[#f1ebe5] dark:border-[#232326] shadow-[0_4px_20px_0_rgba(90,80,60,0.08)] hover:shadow-[0_8px_32px_0_rgba(90,80,60,0.18)] transition-all duration-300 relative flex flex-col">
            <div className="relative w-full aspect-[4/5] bg-[#f5f5f5] dark:bg-[#222]">
                <Link href={`/product/${product.id}`} className="block w-full h-full">
                    <Image
                        src={product.image_url || "/placeholder.jpg"}
                        alt={product.title}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105 group-hover:brightness-95 rounded-b-none"
                        sizes="(max-width: 768px) 50vw, 20vw"
                        priority
                    />
                </Link>
                {/* Like + Count in corner */}
                <div className="absolute top-2 right-2 bg-white/80 dark:bg-[#191919]/80 backdrop-blur-md px-2 py-1 rounded-full flex items-center gap-1 text-[13px] text-gray-800 dark:text-white shadow-md transition-all">
                    <LikeButton productId={product.id} userId={userId} />
                    <span className="text-xs font-medium">{product.likes}</span>
                </div>
            </div>

            <div className="flex-1 flex flex-col justify-between p-4 gap-2">
                <h2 className="text-base font-bold text-[#191818] dark:text-white truncate transition-colors group-hover:text-[#D29587] group-hover:dark:text-[#FBCFC2]">
                    {product.title}
                </h2>
                <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2 leading-snug">
                    {product.description}
                </p>
                <div className="flex items-center justify-between mt-2">
                    <span className="text-base font-extrabold text-[#D29587] dark:text-[#FBCFC2] tracking-tight drop-shadow-sm">
                        {product.price.toLocaleString()} <span className="font-normal">FCFA</span>
                    </span>
                    <Link
                        href={`/product/${product.id}`}
                        className="rounded-full px-3 py-1 bg-[#FBE9E3] text-[#B36B5E] text-xs font-semibold shadow hover:bg-[#D29587]/90 hover:text-white transition hidden sm:block"
                    >
                        Voir détail
                    </Link>
                </div>
            </div>
            {/* Subtle border highlight on hover */}
            <div className="absolute inset-0 pointer-events-none rounded-2xl border-2 border-transparent group-hover:border-[#D29587] group-hover:shadow-lg transition-all duration-200"></div>
        </div>
    );
}