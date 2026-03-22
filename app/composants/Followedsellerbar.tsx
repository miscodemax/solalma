"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import Image from "next/image";
import Link from "next/link";

interface SellerStory {
  id: string;
  username: string | null;
  avatar_url: string | null;
  hasNewProduct: boolean; // produit posté dans les dernières 48h
  latestProductId: number | null;
}

export default function FollowedSellersBar({ userId }: { userId?: string }) {
  const supabase = createClient();
  const [sellers, setSellers] = useState<SellerStory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId || userId === "demo") {
      setLoading(false);
      return;
    }

    async function load() {
      // 1. Vendeurs suivis
      const { data: follows } = await supabase
        .from("follows")
        .select("following_id")
        .eq("follower_id", userId);

      if (!follows || follows.length === 0) {
        setLoading(false);
        return;
      }

      const ids = follows.map((f) => f.following_id);

      // 2. Profils
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, username, avatar_url")
        .in("id", ids);

      // 3. Produits récents (< 48h) des vendeurs suivis
      const since = new Date(Date.now() - 48 * 3_600_000).toISOString();
      const { data: recentProducts } = await supabase
        .from("product")
        .select("id, user_id, created_at")
        .in("user_id", ids)
        .gte("created_at", since)
        .order("created_at", { ascending: false });

      // Map user_id → dernier produit
      const latestMap: Record<string, number> = {};
      (recentProducts ?? []).forEach((p) => {
        if (!latestMap[p.user_id]) latestMap[p.user_id] = p.id;
      });

      const result: SellerStory[] = (profiles ?? []).map((p) => ({
        id: p.id,
        username: p.username,
        avatar_url: p.avatar_url,
        hasNewProduct: !!latestMap[p.id],
        latestProductId: latestMap[p.id] ?? null,
      }));

      // Les vendeurs avec nouveau produit en premier
      result.sort((a, b) => Number(b.hasNewProduct) - Number(a.hasNewProduct));

      setSellers(result);
      setLoading(false);
    }

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  // Ne rien afficher si pas d'abonnements ou pas connecté
  if (loading || sellers.length === 0) return null;

  return (
    <div className="mb-5">
      {/* Label discret */}
      <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 mb-2 px-1 uppercase tracking-wider">
        Abonnements
      </p>

      <div
        className="flex gap-3 overflow-x-auto pb-1"
        style={{ scrollbarWidth: "none" }}
      >
        {sellers.map((seller) => {
          const href =
            seller.hasNewProduct && seller.latestProductId
              ? `/product/${seller.latestProductId}`
              : `/profile/${seller.id}`;

          return (
            <Link
              key={seller.id}
              href={href}
              className="flex flex-col items-center gap-1.5 flex-shrink-0 group"
            >
              {/* Avatar avec anneau */}
              <div
                className={`relative rounded-full p-[2.5px] ${
                  seller.hasNewProduct
                    ? "bg-gradient-to-tr from-[#F6C445] via-[#FFD700] to-[#F4A500]"
                    : "bg-gray-200 dark:bg-gray-700"
                }`}
              >
                <div className="rounded-full bg-white dark:bg-[#131313] p-[2px]">
                  {seller.avatar_url ? (
                    <Image
                      src={seller.avatar_url}
                      alt={seller.username ?? "Vendeur"}
                      width={52}
                      height={52}
                      className="w-[52px] h-[52px] rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-[52px] h-[52px] rounded-full bg-gradient-to-br from-[#F6C445] to-[#FFD700] flex items-center justify-center">
                      <span className="text-white font-bold text-lg">
                        {(seller.username ?? "?")[0].toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>

                {/* Point rouge "nouveau" */}
                {seller.hasNewProduct && (
                  <div className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-red-500 rounded-full border-2 border-white dark:border-[#131313] animate-pulse" />
                )}
              </div>

              {/* Nom tronqué */}
              <span
                className={`text-[10px] w-[60px] text-center truncate leading-tight ${
                  seller.hasNewProduct
                    ? "font-bold text-[#1C1C1C] dark:text-white"
                    : "text-gray-500 dark:text-gray-400"
                }`}
              >
                {seller.username ?? "Vendeur"}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
