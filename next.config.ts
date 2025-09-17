// @ts-nocheck
import withPWA from "next-pwa";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true, // ⚠️ à désactiver quand tu seras prêt à corriger les erreurs TS
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
    unoptimized: true, // ⚠️ utile pour le dev, mais en prod je recommande de l’enlever
  },
};

export default withPWA({
  dest: "public",   // service worker dans /public
  register: true,   // auto-register
  skipWaiting: true // active le nouveau SW sans attendre
})(nextConfig);
