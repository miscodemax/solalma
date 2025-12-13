"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "../../../lib/supabase";
import Loader from "@/app/loading";

export const dynamic = "force-dynamic";

export default function AuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const redirectTo = searchParams.get("redirect") || "/";

      if (session) {
        console.log("Session found, redirecting to:", redirectTo);
        router.replace(redirectTo);
      } else {
        console.log("No session found, redirecting to /register");
        router.replace("/register");
      }
    };

    checkSession();
  }, [router, searchParams]);

  return (
    <div className="flex justify-center items-center min-h-screen">
      <Loader />
    </div>
  );
}
