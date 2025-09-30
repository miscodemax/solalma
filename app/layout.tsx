import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Footer from "./composants/footer";
import Navbar from "./composants/navbar";
import BottomNavbar from "./composants/BottomNavbar";
import { Toaster } from "@/components/ui/sonner";
import { Suspense } from "react";
import { ThemeProvider } from "./composants/theme-provider";
import { createClient } from "@/lib/supabase";
import SimplePWAInstall from "./composants/pwaInstallPrompt";
import FloatingChat from "./composants/floatingchat";// ← Import du chat flottant

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title:
    "Sangse - Marketplace Mode Féminine abordable | Vêtements, Hijabs & Accessoires tendance",
  description:
    "Découvrez Sangse, la marketplace sénégalaise dédiée à la mode à prix abordable. Vêtements stylés, hijabs colorés, maquillage et accessoires tendance, livrés rapidement partout au Sénégal.",
  metadataBase: new URL("https://sangse.shop"),
  icons: { icon: "/favicon.png" },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: "https://sangse.shop",
    siteName: "Sangse",
    title:
      "Sangse - Marketplace Mode Féminine abordable | Vêtements, Hijabs & Accessoires tendance",
    description:
      "Achetez et vendez vos vêtements, hijabs et accessoires facilement sur Sangse. La nouvelle marketplace mode au Sénégal ✨.",
    images: [
      {
        url: "https://sangse.shop/favicon.png",
        width: 512,
        height: 512,
        alt: "Sangse - Marketplace au Sénégal",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title:
      "Sangse - Marketplace Mode Féminine abordable | Vêtements, Hijabs & Accessoires tendance",
    description:
      "Achetez et vendez vos vêtements, hijabs et accessoires facilement sur Sangse. La nouvelle marketplace mode au Sénégal ✨.",
    images: [
      {
        url: "https://sangse.shop/favicon.png",
        width: 512,
        height: 512,
        alt: "Sangse - Marketplace au Sénégal",
        type: "image/png",
      },
    ],
    creator: "@sangse",
  },
  other: {
    "og:image:alt": "Sangse - Marketplace au Sénégal",
    "og:image:type": "image/png",
    "og:image:width": "512",
    "og:image:height": "512",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = createClient();
  const { data: products } = await supabase.from("product").select("*");

  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#000000" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen overflow-x-hidden`}
      >
        <Suspense fallback={<div>Chargement...</div>}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <Navbar products={products} />

            {/* Main avec padding bottom */}
            <main className="flex-grow pt-7 pb-10 md:pb-0">
              {children}
              <Toaster />
            </main>

            <SimplePWAInstall />

            <BottomNavbar />

            <Footer />

            {/* Chat flottant visible sur toutes les pages */}
            <FloatingChat />
          </ThemeProvider>
        </Suspense>
      </body>
    </html>
  );
}
