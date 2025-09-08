"use client";

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

export default function ProductCard({
    product,
    userId,
}: {
    product: Product;
    userId?: string;
}) {
    const BRAND = {
        blue: "#1E3A8A",
        orange: "#F97316",
    };

    const getFirstImage = (imageUrl: string | string[] | null): string => {
        if (!imageUrl) return "/placeholder.jpg";
        if (Array.isArray(imageUrl)) {
            const firstValidImage = imageUrl.find((img) => img && img.trim() !== "");
            return firstValidImage || "/placeholder.jpg";
        }
        return imageUrl || "/placeholder.jpg";
    };

    const getImageCount = (imageUrl: string | string[] | null): number => {
        if (!imageUrl) return 0;
        if (Array.isArray(imageUrl)) {
            return imageUrl.filter((img) => img && img.trim() !== "").length;
        }
        return 1;
    };

    const firstImage = getFirstImage(product.image_url);
    const imageCount = getImageCount(product.image_url);

    return (
        <article className="group relative w-full flex flex-col overflow-hidden rounded-3xl bg-white shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100">
            {/* Image */}
            <div className="relative w-full aspect-square md:aspect-[4/5] overflow-hidden bg-gray-50">
                <Link
                    href={`/product/${product.id}`}
                    className="block w-full h-full focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 rounded-3xl"
                >
                    <Image
                        src={firstImage}
                        alt={product.title}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    />
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition duration-500" />
                </Link>

                {/* Like */}
                <div className="absolute top-3 right-3">
                    <div className="flex items-center gap-1 px-2 py-1.5 bg-white/90 backdrop-blur-sm rounded-xl shadow-sm hover:scale-105 transition">
                        <LikeButton productId={product.id} userId={userId} />
                        {product.likes && product.likes > 0 && (
                            <span className="text-xs font-semibold text-gray-700">
                                {product.likes > 99 ? "99+" : product.likes}
                            </span>
                        )}
                    </div>
                </div>

                {/* Image count */}
                {imageCount > 1 && (
                    <div className="absolute bottom-3 right-3 text-xs px-2 py-1 bg-black/60 text-white rounded-lg backdrop-blur-sm">
                        {imageCount} photos
                    </div>
                )}

                {/* Premium badge */}
                {product.price > 50000 && (
                    <div className="absolute top-3 left-3 px-2 py-1 rounded-lg text-xs font-bold shadow-sm text-amber-900 bg-gradient-to-r from-amber-300 to-amber-500">
                        ✨ Premium
                    </div>
                )}

                {/* CTA flottant (desktop) */}
                <div className="hidden md:block absolute inset-x-6 bottom-4 opacity-0 group-hover:opacity-100 translate-y-3 group-hover:translate-y-0 transition-all duration-500">
                    <Link
                        href={`/product/${product.id}`}
                        className="block w-full py-2.5 rounded-xl font-semibold text-sm text-white text-center shadow-lg"
                        style={{
                            background: `linear-gradient(90deg, ${BRAND.blue}, ${BRAND.orange})`,
                        }}
                    >
                        {imageCount > 1 ? `Voir ${imageCount} photos` : "Voir les détails"}
                    </Link>
                </div>
            </div>

            {/* Infos */}
            <div className="flex-1 p-4 space-y-3">
                <Link
                    href={`/product/${product.id}`}
                    className="block focus:outline-none focus:ring-2 focus:ring-orange-500 rounded"
                >
                    <h3 className="text-base font-semibold text-gray-900 leading-tight line-clamp-2 group-hover:text-orange-600 transition-colors duration-200">
                        {product.title}
                    </h3>
                </Link>

                <p className="hidden sm:block text-sm text-gray-600 line-clamp-2">
                    {product.description}
                </p>

                <div className="flex items-center justify-between">
                    <div>
                        <span className="text-lg font-bold text-gray-900">
                            {product.price.toLocaleString()}{" "}
                            <span className="text-xs text-gray-500">FCFA</span>
                        </span>
                    </div>

                    <Link
                        href={`/product/${product.id}`}
                        className="px-3 py-2 rounded-lg font-semibold text-sm text-white shadow-md hover:shadow-lg transition transform hover:scale-105"
                        style={{
                            background: `linear-gradient(90deg, ${BRAND.blue}, ${BRAND.orange})`,
                        }}
                    >
                        Voir
                    </Link>
                </div>
            </div>
        </article>
    );
}
