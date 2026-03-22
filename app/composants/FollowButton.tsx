"use client";

import { useState, useTransition } from "react";
import { createClient } from "@/lib/supabase";
import { FaUserCheck, FaUserPlus } from "react-icons/fa";
import { Loader2 } from "lucide-react";

interface FollowButtonProps {
  followerId: string;
  followingId: string;
  initialFollowed: boolean;
  /** Taille du bouton. Par défaut "md" */
  size?: "sm" | "md";
  /** Callback optionnel après toggle */
  onToggle?: (isFollowed: boolean) => void;
}

export default function FollowButton({
  followerId,
  followingId,
  initialFollowed,
  size = "md",
  onToggle,
}: FollowButtonProps) {
  const supabase = createClient();
  const [isFollowed, setIsFollowed] = useState(initialFollowed);
  const [isPending, startTransition] = useTransition();

  const toggle = () => {
    // UI optimiste — on bascule immédiatement
    const next = !isFollowed;
    setIsFollowed(next);

    startTransition(async () => {
      try {
        if (next) {
          // Abonnement
          const { error } = await supabase.from("follows").insert({
            follower_id: followerId,
            following_id: followingId,
          });
          if (error) throw error;
        } else {
          // Désabonnement
          const { error } = await supabase
            .from("follows")
            .delete()
            .eq("follower_id", followerId)
            .eq("following_id", followingId);
          if (error) throw error;
        }
        onToggle?.(next);
      } catch (err) {
        // Rollback en cas d'erreur
        console.error("Erreur follow:", err);
        setIsFollowed(!next);
      }
    });
  };

  const sizeClasses =
    size === "sm" ? "text-xs px-3 py-1.5 gap-1.5" : "text-sm px-4 py-2.5 gap-2";

  if (isFollowed) {
    return (
      <button
        onClick={toggle}
        disabled={isPending}
        className={`w-full flex items-center justify-center ${sizeClasses} rounded-xl font-semibold transition-all duration-300
          bg-[#F4B400]/10 text-[#F4B400] border border-[#F4B400]/30
          hover:bg-red-50 hover:text-red-500 hover:border-red-200
          dark:hover:bg-red-900/20 dark:hover:text-red-400 dark:hover:border-red-800
          active:scale-95`}
        title="Se désabonner"
      >
        {isPending ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <>
            <FaUserCheck className="flex-shrink-0" />
            <span className="group-hover:hidden">Abonné·e</span>
          </>
        )}
      </button>
    );
  }

  return (
    <button
      onClick={toggle}
      disabled={isPending}
      className={`w-full flex items-center justify-center ${sizeClasses} rounded-xl font-semibold transition-all duration-300
        bg-gradient-to-r from-[#F4B400] to-[#FFD766] text-white
        hover:from-[#FFD766] hover:to-[#F4B400]
        shadow-md hover:shadow-lg hover:shadow-[#F4B400]/20
        active:scale-95`}
    >
      {isPending ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <>
          <FaUserPlus className="flex-shrink-0" />
          <span>S&apos;abonner</span>
        </>
      )}
    </button>
  );
}
