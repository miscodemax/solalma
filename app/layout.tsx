import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Footer from "./composants/footer";
import Navbar from "./composants/navbar";
import BottomNavbar from "./composants/BottomNavbar";
import { Toaster } from "@/components/ui/sonner";
import { Suspense } from 'react';
import { ThemeProvider } from "./composants/theme-provider";
import { createClient } from "@/lib/supabase";
import SimplePWAInstall from "./composants/pwaInstallPrompt";

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
      { url: "https://sangse.shop/favicon.png", width: 512, height: 512, alt: "Sangse - Marketplace au Sénégal", type: "image/png" }
    ],
  },
  twitter: {
    card: "summary_large_image",
    title:
      "Sangse - Marketplace Mode Féminine abordable | Vêtements, Hijabs & Accessoires tendance",
    description:
      "Achetez et vendez vos vêtements, hijabs et accessoires facilement sur Sangse. La nouvelle marketplace mode au Sénégal ✨.",
    images: [
      { url: "https://sangse.shop/favicon.png", width: 512, height: 512, alt: "Sangse - Marketplace au Sénégal", type: "image/png" }
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
}: Readonly<{ children: React.ReactNode }>) {

  const supabase = createClient();
  const { data: products } = await supabase.from("product").select("*");

  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#000000" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen overflow-x-hidden`}>
        <Suspense fallback={<div>Chargement...</div>}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <Navbar products={products} />

            <main className="flex-grow pt-7 pb-10 md:pb-0">
              {children}
              <Toaster />
            </main>

            <SimplePWAInstall />
            <BottomNavbar />
            <Footer />

            {/* Bouton WhatsApp flottant */}
            <a
              href="https://wa.me/221784721487"
              target="_blank"
              rel="noopener noreferrer"
              className="fixed bottom-5 right-5 z-50 w-16 h-16 bg-green-500 rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
              aria-label="Contacter le support WhatsApp"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="white"
                className="w-8 h-8"
              >
                <path d="M20.52 3.48A11.85 11.85 0 0012 0C5.37 0 0 5.37 0 12a11.88 11.88 0 001.64 6.02L0 24l6.17-1.62A11.87 11.87 0 0012 24c6.63 0 12-5.37 12-12 0-3.2-1.25-6.22-3.48-8.52zM12 21c-2 0-3.89-.55-5.53-1.59l-.39-.24-3.66.96.97-3.57-.25-.38A9.95 9.95 0 012 12c0-5.52 4.48-10 10-10s10 4.48 10 10-4.48 10-10 10zm5.23-7.77c-.27-.14-1.6-.79-1.84-.88s-.43-.13-.62.13-.71.88-.87 1.06-.32.2-.59.07a7.38 7.38 0 01-2.17-1.34 8.2 8.2 0 01-1.52-1.88c-.16-.27 0-.41.12-.55.12-.13.27-.32.4-.48.13-.16.18-.27.27-.45.09-.18.05-.34-.03-.48-.08-.13-.62-1.5-.85-2.06-.22-.54-.45-.46-.62-.47-.16 0-.34-.01-.52-.01s-.48.07-.73.34c-.24.27-.93.91-.93 2.22s.95 2.57 1.08 2.75c.13.18 1.85 2.83 4.48 3.96.63.27 1.12.43 1.5.55.63.2 1.2.17 1.65.1.5-.08 1.6-.65 1.83-1.28.22-.63.22-1.17.16-1.28-.06-.11-.23-.18-.5-.32z" />
              </svg>
            </a>
          </ThemeProvider>
        </Suspense>
      </body>
    </html>
  );
}
