"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react"; // Icône flèche

export default function BackButton() {
  const router = useRouter();

  return (
    <Button
      onClick={() => router.back()}
      variant="outline"
      className="flex items-center gap-2 px-4 py-2 rounded-full text-sm hover:bg-pink-100 transition-colors duration-200"
      aria-label="Retour en arrière"
    >
      <ArrowLeft size={18} className="text-pink-600" />
      <span className="text-pink-600 font-medium">Retour</span>
    </Button>
  );
}
