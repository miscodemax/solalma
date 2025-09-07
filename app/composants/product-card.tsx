import Link from "next/link";
import Image from "next/image";
import LikeButton from "./likeButton";

type Product = {
    id: number;
    title: string;
    description: string;
    price: number;
    image_url: string | string[] | null;
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
    // Extraire la première image du tableau ou utiliser l'image unique
    const getFirstImage = (imageUrl: string | string[] | null): string => {
        if (!imageUrl) return "/placeholder.jpg";

        if (Array.isArray(imageUrl)) {
            const firstValidImage = imageUrl.find(img => img && img.trim() !== '');
            return firstValidImage || "/placeholder.jpg";
        }

        return imageUrl || "/placeholder.jpg";
    };

    // Compter le nombre total d'images pour l'indicateur
    const getImageCount = (imageUrl: string | string[] | null): number => {
        if (!imageUrl) return 0;
        if (Array.isArray(imageUrl)) {
            return imageUrl.filter(img => img && img.trim() !== '').length;
        }
        return 1;
    };

    const firstImage = getFirstImage(product.image_url);
    const imageCount = getImageCount(product.image_url);

    return (
        <article className="group relative w-full flex flex-col overflow-hidden rounded-2xl md:rounded-3xl bg-white dark:bg-gray-900 shadow-sm hover:shadow-xl dark:shadow-gray-900/20 transition-all duration-300 hover:-translate-y-0.5 border border-gray-100 dark:border-gray-800">

            {/* Image container - Responsive aspect ratio */}
            <div className="relative w-full aspect-square md:aspect-[4/5] overflow-hidden bg-gray-50 dark:bg-gray-800">
                <Link
                    href={`/product/${product.id}`}
                    className="block w-full h-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-2xl"
                    aria-label={`Voir les détails de ${product.title}`}
                >
                    <Image
                        src={firstImage}
                        alt={product.title}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        priority={false}
                    />

                    {/* Subtle overlay on hover */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
                </Link>

                {/* Image counter badge */}
                {imageCount > 1 && (
                    <div className="absolute top-2 left-2 md:top-3 md:left-3">
                        <div className="flex items-center gap-1 px-2 py-1 md:px-2.5 md:py-1.5 bg-black/75 backdrop-blur-sm text-white rounded-lg text-xs font-medium shadow-sm">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2-2z" />
                            </svg>
                            <span>{imageCount}</span>
                        </div>
                    </div>
                )}

                {/* Like button - Mobile optimized */}
                <div className="absolute top-2 right-2 md:top-3 md:right-3">
                    <div className="flex items-center gap-1.5 px-2 py-1.5 md:px-2.5 md:py-2 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm rounded-lg shadow-sm transition-all duration-200 hover:bg-white dark:hover:bg-gray-900 active:scale-95">
                        <LikeButton productId={product.id} userId={userId} />
                        {product.likes && product.likes > 0 && (
                            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 min-w-[1ch] text-center">
                                {product.likes > 99 ? '99+' : product.likes}
                            </span>
                        )}
                    </div>
                </div>

                {/* Premium badge */}
                {product.price > 50000 && (
                    <div className="absolute top-12 left-2 md:top-14 md:left-3">
                        <div className="px-2 py-1 bg-gradient-to-r from-amber-400 to-amber-500 text-amber-900 rounded-lg text-xs font-bold shadow-sm">
                            ✨ Premium
                        </div>
                    </div>
                )}

                {/* Mobile-first quick action - Only on larger screens */}
                <div className="hidden md:block absolute inset-x-3 bottom-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                    <Link
                        href={`/product/${product.id}`}
                        className="block w-full px-4 py-2.5 bg-white/95 backdrop-blur-sm rounded-xl text-sm font-semibold text-gray-900 text-center shadow-lg hover:bg-white transition-all duration-200 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        {imageCount > 1 ? `Voir ${imageCount} photos` : 'Voir les détails'}
                    </Link>
                </div>
            </div>

            {/* Content section - Mobile optimized spacing */}
            <div className="flex-1 p-3 md:p-4 space-y-3">

                {/* Title - Improved mobile typography */}
                <div>
                    <Link
                        href={`/product/${product.id}`}
                        className="block focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
                    >
                        <h3 className="text-sm md:text-base font-semibold text-gray-900 dark:text-white leading-tight line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">
                            {product.title}
                        </h3>
                    </Link>
                </div>

                {/* Description - Hidden on mobile to save space */}
                <div className="hidden sm:block">
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed">
                        {product.description}
                    </p>
                </div>

                {/* Price and CTA section - Mobile optimized */}
                <div className="flex items-center justify-between pt-2">
                    <div className="flex flex-col">
                        <div className="flex items-baseline gap-1">
                            <span className="text-lg md:text-xl font-bold text-gray-900 dark:text-white">
                                {product.price.toLocaleString()}
                            </span>
                            <span className="text-xs md:text-sm text-gray-500 dark:text-gray-400 font-medium">
                                FCFA
                            </span>
                        </div>
                    </div>

                    {/* Mobile-first CTA button */}
                    <Link
                        href={`/product/${product.id}`}
                        className="group/btn relative overflow-hidden rounded-xl bg-blue-600 hover:bg-blue-700 px-3 py-2 md:px-4 md:py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:shadow-md active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                        <span className="relative">Voir</span>
                    </Link>
                </div>

                {/* Stats bar - Simplified for mobile */}
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-100 dark:border-gray-800">
                    <span className="font-mono opacity-60">
                        #{product.id.toString().padStart(4, '0')}
                    </span>

                    <div className="flex items-center gap-3">
                        {/* Image count indicator for mobile */}
                        <div className="md:hidden">
                            {imageCount > 1 && (
                                <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2-2z" />
                                    </svg>
                                    <span className="font-medium">{imageCount}</span>
                                </span>
                            )}
                        </div>

                        {/* Likes indicator */}
                        {product.likes && product.likes > 0 && (
                            <span className="flex items-center gap-1">
                                <svg className="w-3 h-3 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd"
                                        d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                                        clipRule="evenodd" />
                                </svg>
                                <span className="font-medium">{product.likes > 99 ? '99+' : product.likes}</span>
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Hover indicator - Desktop only */}
            <div className="hidden md:block absolute top-3 left-3 w-1.5 h-1.5 bg-blue-500/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </article>
    );
}