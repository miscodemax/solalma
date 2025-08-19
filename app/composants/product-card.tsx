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
        <div className="group relative flex flex-col overflow-hidden rounded-3xl bg-white dark:bg-[#1a1a1a] border border-gray-100 dark:border-[#2a2a2a] shadow-[0_8px_40px_0_rgba(0,0,0,0.04)] dark:shadow-[0_8px_40px_0_rgba(0,0,0,0.3)] hover:shadow-[0_20px_60px_0_rgba(0,0,0,0.15)] dark:hover:shadow-[0_20px_60px_0_rgba(0,0,0,0.5)] transition-all duration-500 ease-out transform hover:-translate-y-2">

            {/* Gradient overlay for depth */}
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-gray-50/30 dark:to-gray-900/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10"></div>

            {/* Animated border glow */}
            <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-20">
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-[#D29587] via-[#FBCFC2] to-[#D29587] p-[1px]">
                    <div className="w-full h-full rounded-3xl bg-white dark:bg-[#1a1a1a]"></div>
                </div>
            </div>

            {/* Image container with advanced effects */}
            <div className="relative w-full aspect-[4/5] overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
                <Link href={`/product/${product.id}`} className="block w-full h-full">
                    <Image
                        src={product.image_url || "/placeholder.jpg"}
                        alt={product.title}
                        fill
                        className="object-cover transition-all duration-700 ease-out group-hover:scale-110 group-hover:brightness-105 group-hover:contrast-105 group-hover:saturate-110"
                        sizes="(max-width: 768px) 50vw, 25vw"
                        priority
                    />

                    {/* Overlay gradient on hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </Link>

                {/* Floating like button with glassmorphism */}
                <div className="absolute top-4 right-4 backdrop-blur-xl bg-white/20 dark:bg-black/20 border border-white/20 dark:border-white/10 rounded-2xl p-2 flex items-center gap-2 shadow-lg transition-all duration-300 hover:bg-white/30 dark:hover:bg-black/30 hover:scale-105">
                    <LikeButton productId={product.id} userId={userId} />
                    {product.likes && product.likes > 0 && (
                        <span className="text-sm font-semibold text-white drop-shadow-lg">
                            {product.likes}
                        </span>
                    )}
                </div>

                {/* Quick view button (appears on hover) */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-4 group-hover:translate-y-0">
                    <Link
                        href={`/product/${product.id}`}
                        className="backdrop-blur-xl bg-white/90 dark:bg-black/80 border border-white/20 dark:border-white/10 rounded-2xl px-6 py-3 text-sm font-semibold text-gray-900 dark:text-white shadow-2xl hover:bg-white dark:hover:bg-black/90 transition-all duration-200 hover:scale-105"
                    >
                        Vue rapide
                    </Link>
                </div>

                {/* Premium badge if price is high */}
                {product.price > 50000 && (
                    <div className="absolute top-4 left-4 bg-gradient-to-r from-yellow-400 to-yellow-600 text-yellow-900 rounded-full px-3 py-1 text-xs font-bold shadow-lg">
                        ✨ Premium
                    </div>
                )}
            </div>

            {/* Content section with improved spacing */}
            <div className="relative flex-1 flex flex-col justify-between p-6 space-y-4 bg-white dark:bg-[#1a1a1a] z-30">

                {/* Title with animated underline */}
                <div className="relative">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white leading-tight group-hover:text-[#D29587] dark:group-hover:text-[#FBCFC2] transition-colors duration-300">
                        {product.title}
                    </h2>
                    <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-[#D29587] to-[#FBCFC2] group-hover:w-full transition-all duration-500 ease-out"></div>
                </div>

                {/* Description with better typography */}
                <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 leading-relaxed">
                    {product.description}
                </p>

                {/* Price and action section */}
                <div className="flex items-center justify-between pt-2">
                    <div className="flex flex-col">
                        <span className="text-xl font-black bg-gradient-to-r from-[#D29587] to-[#B36B5E] bg-clip-text text-transparent">
                            {product.price.toLocaleString()}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                            FCFA
                        </span>
                    </div>

                    {/* CTA Button with advanced styling */}
                    <Link
                        href={`/product/${product.id}`}
                        className="group/btn relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#D29587] to-[#B36B5E] px-4 py-2.5 text-sm font-semibold text-white shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105 active:scale-95"
                    >
                        {/* Button shine effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700"></div>

                        <span className="relative z-10">Voir détails</span>
                    </Link>
                </div>

                {/* Stats bar */}
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-100 dark:border-gray-800">
                    <span>#{product.id}</span>
                    {product.likes && product.likes > 0 && (
                        <span>{product.likes} ♥</span>
                    )}
                </div>
            </div>

            {/* Floating particles effect on hover */}
            <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-[#D29587] rounded-full animate-pulse"></div>
                <div className="absolute top-3/4 right-1/3 w-1 h-1 bg-[#FBCFC2] rounded-full animate-pulse delay-100"></div>
                <div className="absolute bottom-1/4 left-1/3 w-1 h-1 bg-[#D29587] rounded-full animate-pulse delay-200"></div>
            </div>
        </div>
    );
}