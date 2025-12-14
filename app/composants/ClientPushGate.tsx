"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase";
import { initPush } from "@/lib/push";

export default function ClientPushGate() {
  const supabase = createClient();

  useEffect(() => {
    let cancelled = false;

    async function run() {
      const { data } = await supabase.auth.getUser();
      if (!data?.user || cancelled) return;

      console.log("🔔 Push init global pour", data.user.id);
      initPush(data.user.id);
    }

    run();

    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
