import type { NextConfig } from "next";

const nextConfig: NextConfig = {

  typescript: {
    // ❌ Ignore les erreurs TypeScript au build
    ignoreBuildErrors: true,
  },
  images: {
    domains: ['via.placeholder.com', 'images.unsplash.com', 'cdn.pixabay.com', 'placekitten.com', "bdeahexcoljgxdpbxvve.supabase.co"],
  },
}



export default nextConfig;
