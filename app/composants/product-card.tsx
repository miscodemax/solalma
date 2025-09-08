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
        <article className="group relative w-full flex flex-col overflow-hidden rounded-xl bg-white border border-gray-200 hover:shadow-md transition-all duration-300">
            {/* Image */}
            <div className="relative w-full aspect-square overflow-hidden bg-gray-50">
                <Link href={`/product/${product.id}`} className="block w-full h-full">
                    <Image
                        src={firstImage}
                        alt={product.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    />
                </Link>

                {/* Like */}
                <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 bg-white/90 rounded-lg shadow-sm">
                    <LikeButton productId={product.id} userId={userId} />
                    {product.likes && product.likes > 0 && (
                        <span className="text-[11px] font-medium text-gray-600">
                            {product.likes > 99 ? "99+" : product.likes}
                        </span>
                    )}
                </div>

                {/* Image count */}
                {imageCount > 1 && (
                    <div className="absolute bottom-2 right-2 text-[11px] px-2 py-0.5 bg-black/60 text-white rounded-md">
                        {imageCount} photos
                    </div>
                )}

                {/* Premium badge */}
                {product.price > 50000 && (
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md text-[11px] font-semibold text-amber-900 bg-amber-200">
                        ✨ Premium
                    </div>
                )}
            </div>

            {/* Infos */}
            <div className="flex-1 p-3 space-y-2">
                <Link href={`/product/${product.id}`}>
                    <h3 className="text-sm font-semibold text-gray-900 leading-snug line-clamp-2 group-hover:text-green-600 transition-colors">
                        {product.title}
                    </h3>
                </Link>

                <p className="hidden sm:block text-xs text-gray-600 line-clamp-2">
                    {product.description}
                </p>

                <div className="flex items-center justify-between pt-1">
                    <span className="text-sm font-bold text-gray-900">
                        {product.price.toLocaleString()}{" "}
                        <span className="text-[10px] text-gray-500">FCFA</span>
                    </span>

                    <Link
                        href={`/product/${product.id}`}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-green-500 hover:bg-green-600 transition"
                    >
                        Voir
                    </Link>
                </div>
            </div>
        </article>
    );
}
