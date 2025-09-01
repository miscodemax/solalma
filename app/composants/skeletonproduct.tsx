import React from 'react';

// Composant Skeleton de base avec animation personnalisée
const Skeleton = ({
    className = "",
    variant = "default",
    ...props
}: {
    className?: string;
    variant?: "default" | "shimmer" | "pulse";
    [key: string]: any;
}) => {
    const getAnimationClass = () => {
        switch (variant) {
            case "shimmer":
                return "bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 bg-[length:200%_100%] animate-[shimmer_1.5s_infinite]";
            case "pulse":
                return "animate-pulse bg-gray-200 dark:bg-gray-700";
            default:
                return "animate-pulse bg-gray-200 dark:bg-gray-700";
        }
    };

    return (
        <div
            className={`rounded ${getAnimationClass()} ${className}`}
            {...props}
        />
    );
};

// Skeleton pour ProductCard - exactement les mêmes dimensions
const ProductCardSkeleton = () => {
    return (
        <div className="group relative w-full h-[480px] flex flex-col overflow-hidden rounded-3xl bg-white dark:bg-[#121212] border border-[#E5E7EB] dark:border-[#374151] shadow-[0_4px_24px_0_rgba(0,0,0,0.06)] dark:shadow-[0_4px_32px_0_rgba(0,0,0,0.4)]">

            {/* Shimmer border effect - comme dans l'original */}
            <div className="absolute inset-0 rounded-3xl opacity-30 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-transparent via-gray-300/20 dark:via-gray-600/20 to-transparent animate-pulse"></div>
            </div>

            {/* Image container - hauteur fixe 280px */}
            <div className="relative w-full h-[280px] overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-[#1e1e1e] dark:to-[#2a2a2a]">
                {/* Image skeleton avec effet shimmer */}
                <Skeleton
                    variant="shimmer"
                    className="w-full h-full rounded-none"
                />

                {/* Badge nombre d'images - skeleton */}
                <div className="absolute top-3 left-3">
                    <Skeleton className="w-12 h-6 rounded-xl" />
                </div>

                {/* Like button - skeleton */}
                <div className="absolute top-3 right-3">
                    <Skeleton className="w-16 h-8 rounded-xl" />
                </div>

                {/* Badge premium - skeleton (conditionnel) */}
                <div className="absolute top-14 left-3">
                    <Skeleton className="w-20 h-6 rounded-xl" />
                </div>

                {/* Quick actions - skeleton (hover effect) */}
                <div className="absolute bottom-3 left-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <Skeleton className="flex-1 h-9 rounded-xl" />
                    <Skeleton className="w-9 h-9 rounded-xl" />
                </div>
            </div>

            {/* Content section - hauteur fixe 200px */}
            <div className="relative flex-1 h-[200px] flex flex-col justify-between p-5 bg-white dark:bg-[#121212]">

                {/* Title section */}
                <div className="mb-2">
                    <div className="min-h-[3rem] space-y-2">
                        <Skeleton className="w-full h-4 rounded" />
                        <Skeleton className="w-3/4 h-4 rounded" />
                    </div>
                </div>

                {/* Description */}
                <div className="mb-4 flex-1">
                    <div className="space-y-2">
                        <Skeleton className="w-full h-3 rounded" />
                        <Skeleton className="w-5/6 h-3 rounded" />
                    </div>
                </div>

                {/* Footer section */}
                <div className="mt-auto space-y-3">
                    {/* Prix et CTA */}
                    <div className="flex items-end justify-between">
                        <div className="flex flex-col gap-1">
                            <Skeleton className="w-20 h-6 rounded" />
                            <Skeleton className="w-8 h-3 rounded" />
                        </div>
                        <Skeleton className="w-20 h-9 rounded-xl" />
                    </div>

                    {/* Stats bar */}
                    <div className="flex items-center justify-between pt-2 border-t border-[#E5E7EB] dark:border-gray-700">
                        <Skeleton className="w-12 h-3 rounded" />
                        <div className="flex items-center gap-3">
                            <Skeleton className="w-8 h-3 rounded" />
                            <Skeleton className="w-6 h-3 rounded" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Micro interactions - points décoratifs */}
            <div className="absolute top-4 left-4 w-2 h-2 bg-gray-300/30 dark:bg-gray-600/30 rounded-full animate-pulse"></div>
            <div className="absolute bottom-4 right-4 w-1.5 h-1.5 bg-gray-300/40 dark:bg-gray-600/40 rounded-full animate-pulse delay-200"></div>
        </div>
    );
};

// Grid de skeleton pour plusieurs produits
const ProductCardSkeletonGrid = ({ count = 8 }: { count?: number }) => {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {Array.from({ length: count }).map((_, index) => (
                <ProductCardSkeleton key={index} />
            ))}
        </div>
    );
};

// Skeleton avec variation aléatoire pour plus de réalisme
const ProductCardSkeletonVariant = () => {
    // Largeurs aléatoires pour plus de réalisme
    const titleWidths = ['w-full', 'w-5/6', 'w-3/4', 'w-4/5'];
    const descWidths = ['w-full', 'w-5/6', 'w-4/5'];
    const priceWidths = ['w-16', 'w-20', 'w-24'];

    const randomTitleWidth = titleWidths[Math.floor(Math.random() * titleWidths.length)];
    const randomDescWidth = descWidths[Math.floor(Math.random() * descWidths.length)];
    const randomPriceWidth = priceWidths[Math.floor(Math.random() * priceWidths.length)];

    return (
        <div className="group relative w-full h-[480px] flex flex-col overflow-hidden rounded-3xl bg-white dark:bg-[#121212] border border-[#E5E7EB] dark:border-[#374151] shadow-[0_4px_24px_0_rgba(0,0,0,0.06)] dark:shadow-[0_4px_32px_0_rgba(0,0,0,0.4)]">

            {/* Image container */}
            <div className="relative w-full h-[280px] overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-[#1e1e1e] dark:to-[#2a2a2a]">
                <Skeleton variant="shimmer" className="w-full h-full rounded-none" />

                {/* Badges avec probabilité */}
                {Math.random() > 0.6 && (
                    <div className="absolute top-3 left-3">
                        <Skeleton className="w-12 h-6 rounded-xl" />
                    </div>
                )}

                <div className="absolute top-3 right-3">
                    <Skeleton className={`${Math.random() > 0.5 ? 'w-16' : 'w-10'} h-8 rounded-xl`} />
                </div>

                {Math.random() > 0.8 && (
                    <div className="absolute top-14 left-3">
                        <Skeleton className="w-20 h-6 rounded-xl" />
                    </div>
                )}
            </div>

            {/* Content section */}
            <div className="relative flex-1 h-[200px] flex flex-col justify-between p-5 bg-white dark:bg-[#121212]">

                {/* Title avec variation */}
                <div className="mb-2">
                    <div className="min-h-[3rem] space-y-2">
                        <Skeleton className={`${randomTitleWidth} h-4 rounded`} />
                        <Skeleton className="w-2/3 h-4 rounded" />
                    </div>
                </div>

                {/* Description avec variation */}
                <div className="mb-4 flex-1">
                    <div className="space-y-2">
                        <Skeleton className={`${randomDescWidth} h-3 rounded`} />
                        <Skeleton className="w-4/5 h-3 rounded" />
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-auto space-y-3">
                    <div className="flex items-end justify-between">
                        <div className="flex flex-col gap-1">
                            <Skeleton className={`${randomPriceWidth} h-6 rounded`} />
                            <Skeleton className="w-8 h-3 rounded" />
                        </div>
                        <Skeleton className="w-20 h-9 rounded-xl" />
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-[#E5E7EB] dark:border-gray-700">
                        <Skeleton className="w-12 h-3 rounded" />
                        <div className="flex items-center gap-3">
                            {Math.random() > 0.5 && <Skeleton className="w-8 h-3 rounded" />}
                            {Math.random() > 0.3 && <Skeleton className="w-6 h-3 rounded" />}
                        </div>
                    </div>
                </div>
            </div>

            {/* Micro interactions */}
            <div className="absolute top-4 left-4 w-2 h-2 bg-gray-300/30 dark:bg-gray-600/30 rounded-full animate-pulse"></div>
            <div className="absolute bottom-4 right-4 w-1.5 h-1.5 bg-gray-300/40 dark:bg-gray-600/40 rounded-full animate-pulse delay-200"></div>
        </div>
    );
};

// Grid avec variations pour plus de réalisme
const ProductCardSkeletonGridVariant = ({ count = 8 }: { count?: number }) => {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {Array.from({ length: count }).map((_, index) => (
                <ProductCardSkeletonVariant key={index} />
            ))}
        </div>
    );
};

// Exemple d'utilisation avec CSS personnalisé pour l'animation shimmer
const ProductSkeletonDemo = () => {
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const timer = setTimeout(() => {
            setLoading(false);
        }, 3000);
        return () => clearTimeout(timer);
    }, []);

    const resetLoading = () => {
        setLoading(true);
        setTimeout(() => setLoading(false), 2000);
    };

    return (
        <div className="min-h-screen bg-[#FAF6F4] dark:bg-black p-6">
            {/* Style CSS pour l'animation shimmer */}
            <style jsx>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>

            <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        Skeleton Loader ProductCard
                    </h1>
                    <button
                        onClick={resetLoading}
                        className="px-6 py-3 bg-[#6366F1] text-white rounded-full font-semibold shadow-md hover:bg-[#4F46E5] transition"
                    >
                        {loading ? 'Chargement...' : 'Recharger'}
                    </button>
                </div>

                {loading ? (
                    <div className="space-y-8">
                        <div>
                            <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
                                Version Standard
                            </h2>
                            <ProductCardSkeletonGrid count={5} />
                        </div>

                        <div>
                            <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
                                Version avec Variations
                            </h2>
                            <ProductCardSkeletonGridVariant count={5} />
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                            Contenu chargé !
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400">
                            Ici s'afficheraient vos vrais ProductCard
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductSkeletonDemo;

// Export des composants individuels
export {
    ProductCardSkeleton,
    ProductCardSkeletonGrid,
    ProductCardSkeletonVariant,
    ProductCardSkeletonGridVariant
};