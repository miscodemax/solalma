"use client";

import { useEffect } from "react";
import { initPush } from "@/lib/push";

export default function PushInit({ userId }: { userId: string }) {
  useEffect(() => {
    if (!userId) return;
    console.log("🔔 Initialisation push pour", userId);
    initPush(userId);
  }, [userId]);

  return null;
}
