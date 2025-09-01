// @ts-nocheck
import type { NextConfig } from "next";
import withPWA from "next-pwa";

const nextConfig: NextConfig = {
  typescript: {
    // ❌ Ignore les erreurs TypeScript au build
    ignoreBuildErrors: true,
  },
  images: {
    domains: [
      "icons.veryicon.com",
      "bdeahexcoljgxdpbxvve.supabase.co",
      "via.placeholder.com",
      "images.unsplash.com",
      "cdn.pixabay.com",
      "placekitten.com",
    ],
    unoptimized: true, // désactive complètement l’optimisation
  },
};

// ✅ Ajout PWA
export default withPWA({
  dest: "public", // génère le service worker dans /public
  register: true,
  skipWaiting: true,
})(nextConfig);
