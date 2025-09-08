import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Footer from "./composants/footer";
import Navbar from "./composants/navbar";
import BottomNavbar from "./composants/BottomNavbar";
import { Toaster } from "@/components/ui/sonner"
import { Suspense } from 'react'
import { ThemeProvider } from "./composants/theme-provider";
// import Script from "next/script";
import { createClient } from "@/lib/supabase";
import SimplePWAInstall from "./composants/pwaInstallPrompt";
//import { SessionContextProvider } from "@supabase/auth-helpers-react";
//import { createClient } from "./lib/supabase"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sangse - Marketplace Mode Féminine abordable | Vêtements, Hijabs & Accessoires tendance",
  description: "Découvrez Sangse, la marketplace dédiée à la mode féminine à prix abordable. Trouvez des vêtements stylés, hijabs colorés, maquillage et accessoires tendance, livrés rapidement.",
  icons: {
    icon: "/favicon.png", // <- lien vers le favicon
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  const supabase = createClient()
  const {
    data: products

  } = await supabase
    .from("product")
    .select("*")


  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        {/* Script d'injection de Botpress */}
        {/* <Script src="https://cdn.botpress.cloud/webchat/v3.0/inject.js" />
        <Script src="https://files.bpcontent.cloud/2025/06/08/22/20250608224703-TFXKL5BC.js" /> */}

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

            {/* Main avec padding bottom pour éviter que le bottom navbar cache le contenu */}
            <main className="flex-grow pb-20 md:pb-0">
              {children}
              <Toaster />
            </main>

            <SimplePWAInstall />

            {/* Bottom navbar pour mobile uniquement */}
            <BottomNavbar />

            <Footer />
          </ThemeProvider>
        </Suspense>
      </body>
    </html >
  );
}