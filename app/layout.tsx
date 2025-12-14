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
import ClientPushGate from "./composants/ClientPushGate";

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
    "Sangse - Marketplace sénégalaise | Mode, Beauté, Électronique & Artisanat",
  description:
    "Découvrez Sangse, la marketplace sénégalaise où style et innovation se rencontrent. Mode homme, femme et enfant, soins, maquillage, accessoires, artisanat et gadgets électroniques — trouvez tout ce que vous aimez au même endroit.",
  metadataBase: new URL("https://sangse.shop"),
  icons: { icon: "/favicon.png" },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: "https://sangse.shop",
    siteName: "Sangse",
    title:
      "Sangse - Marketplace sénégalaise | Mode, Beauté, Électronique & Artisanat",
    description:
      "Achetez et vendez sur Sangse, la marketplace moderne du Sénégal. Mode pour tous, soins cosmétiques, artisanat local, accessoires et gadgets électroniques ✨.",
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
      "Sangse - Marketplace sénégalaise | Mode, Beauté, Électronique & Artisanat",
    description:
      "Sangse, la nouvelle marketplace du Sénégal : vêtements, soins, artisanat, accessoires et électroniques au meilleur prix. Achetez et vendez facilement 🌍.",
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
            <ClientPushGate />
            <Navbar products={products} />
            {/* Main avec padding bottom */}
            <main className="flex-grow pb-10 md:pb-0">
              {children}
              <Toaster />
            </main>
            <SimplePWAInstall />
            <BottomNavbar />
            <Footer />
          </ThemeProvider>
        </Suspense>
      </body>
    </html>
  );
}
