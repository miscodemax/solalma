import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Footer from "./composants/footer";
import Navbar from "./composants/navbar";
import { Toaster } from "@/components/ui/sonner"
import { Suspense } from 'react'
import { ThemeProvider } from "./composants/theme-provider";
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {


  return (
    <html lang="fr">
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
            <Navbar />
            <main className="flex-grow">


              {children}

              <Toaster />


            </main>
            <Footer />
          </ThemeProvider>
        </Suspense>
      </body>
    </html >
  );
}
