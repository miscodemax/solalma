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
        <div className="group relative w-full h-[480px] flex flex-col overflow-hidden rounded-3xl bg-white dark:bg-[#121212] border border-gray-100 dark:border-[#2a2a2a] shadow-[0_4px_24px_0_rgba(0,0,0,0.06)] dark:shadow-[0_4px_32px_0_rgba(0,0,0,0.4)] hover:shadow-[0_12px_48px_0_rgba(0,0,0,0.12)] dark:hover:shadow-[0_12px_48px_0_rgba(0,0,0,0.6)] transition-all duration-500 ease-out hover:-translate-y-1 hover:scale-[1.02]">

            {/* Animated shimmer border */}
            <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-transparent via-[#D29587]/30 to-transparent animate-pulse"></div>
            </div>

            {/* Image container - hauteur fixe */}
            <div className="relative w-full h-[280px] overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 dark:from-[#1e1e1e] dark:to-[#2a2a2a]">
                <Link href={`/product/${product.id}`} className="block w-full h-full">
                    <Image
                        src={product.image_url || "/placeholder.jpg"}
                        alt={product.title}
                        fill
                        className="object-cover transition-all duration-700 ease-out group-hover:scale-105"
                        sizes="(max-width: 768px) 50vw, 25vw"
                        priority
                    />

                    {/* Overlay subtle pour améliorer la lisibilité sans cacher l'image */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </Link>

                {/* Like button - glassmorphism subtil */}
                <div className="absolute top-3 right-3 backdrop-blur-md bg-white/90 dark:bg-black/70 border border-white/50 dark:border-gray-600/30 rounded-xl px-2.5 py-1.5 flex items-center gap-1.5 shadow-sm transition-all duration-300 hover:bg-white dark:hover:bg-black/80 hover:scale-105">
                    <LikeButton productId={product.id} userId={userId} />
                    {product.likes && product.likes > 0 && (
                        <span className="text-xs font-semibold text-gray-800 dark:text-gray-200">
                            {product.likes}
                        </span>
                    )}
                </div>

                {/* Badge premium plus élégant */}
                {product.price > 50000 && (
                    <div className="absolute top-3 left-3 bg-gradient-to-r from-amber-400 to-amber-500 text-amber-900 rounded-xl px-2.5 py-1 text-xs font-bold shadow-md border border-amber-300">
                        ✨ Premium
                    </div>
                )}

                {/* Quick actions - apparaissent au hover sans overlay opaque */}
                <div className="absolute bottom-3 left-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                    <Link
                        href={`/product/${product.id}`}
                        className="flex-1 backdrop-blur-md bg-white/95 dark:bg-black/85 border border-white/60 dark:border-gray-600/30 rounded-xl px-4 py-2 text-sm font-semibold text-gray-900 dark:text-white text-center shadow-lg hover:bg-white dark:hover:bg-black transition-all duration-200 hover:scale-[1.02]"
                    >
                        Voir détails
                    </Link>
                    <button className="backdrop-blur-md bg-white/95 dark:bg-black/85 border border-white/60 dark:border-gray-600/30 rounded-xl px-3 py-2 shadow-lg hover:bg-white dark:hover:bg-black transition-all duration-200 hover:scale-[1.02]">
                        <svg className="w-4 h-4 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Content section - hauteur fixe pour uniformité */}
            <div className="relative flex-1 h-[200px] flex flex-col justify-between p-5 bg-white dark:bg-[#121212]">

                {/* Title section avec hauteur fixe */}
                <div className="mb-2">
                    <h3 className="text-base font-bold text-gray-900 dark:text-white leading-tight group-hover:text-[#D29587] dark:group-hover:text-[#FBCFC2] transition-colors duration-300 line-clamp-2 min-h-[3rem]">
                        {product.title}
                    </h3>
                </div>

                {/* Description avec hauteur contrôlée */}
                <div className="mb-4 flex-1">
                    <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 leading-relaxed">
                        {product.description}
                    </p>
                </div>

                {/* Footer section - toujours en bas */}
                <div className="mt-auto space-y-3">
                    {/* Prix et CTA */}
                    <div className="flex items-end justify-between">
                        <div className="flex flex-col">
                            <span className="text-lg font-black bg-gradient-to-r from-[#D29587] to-[#B36B5E] bg-clip-text text-transparent">
                                {product.price.toLocaleString()}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium -mt-1">
                                FCFA
                            </span>
                        </div>

                        <Link
                            href={`/product/${product.id}`}
                            className="group/btn relative overflow-hidden rounded-xl bg-gradient-to-r from-[#D29587] to-[#B36B5E] px-4 py-2 text-sm font-semibold text-white shadow-md transition-all duration-300 hover:shadow-lg hover:scale-105 active:scale-95"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-600"></div>
                            <span className="relative">Acheter</span>
                        </Link>
                    </div>

                    {/* Stats bar */}
                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-100 dark:border-gray-700">
                        <span className="font-mono">#{product.id.toString().padStart(4, '0')}</span>
                        <div className="flex items-center gap-3">
                            {product.likes && product.likes > 0 && (
                                <span className="flex items-center gap-1">
                                    <svg className="w-3 h-3 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                                    </svg>
                                    {product.likes}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Micro interactions subtiles */}
            <div className="absolute top-4 left-4 w-2 h-2 bg-[#D29587]/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-pulse"></div>
            <div className="absolute bottom-4 right-4 w-1.5 h-1.5 bg-[#FBCFC2]/30 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700 animate-pulse delay-200"></div>
        </div>
    );
}