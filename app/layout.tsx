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
  title: "Sangse - Marketplace Mode Féminine abordable | Vêtements, Hijabs & Accessoires tendance",
  description: "Découvrez Sangse, la marketplace sénégalaise dédiée à la mode à prix abordable. Vêtements stylés, hijabs colorés, maquillage et accessoires tendance, livrés rapidement partout au Sénégal.",
  metadataBase: new URL("https://sangse.shop"),
  icons: { icon: "/favicon.png" },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const { data: products } = await supabase.from("product").select("*");

  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#000000" />
        {/* OneSignal SDK */}
        <script src="https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js" defer></script>
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
          </ThemeProvider>
        </Suspense>

        {/* OneSignal Init Script après interaction */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
      function initOneSignal() {
        if (window.OneSignalInitialized) return;
        window.OneSignalInitialized = true;

        window.OneSignalDeferred = window.OneSignalDeferred || [];
        OneSignalDeferred.push(async function(OneSignal) {
          await OneSignal.init({
            appId: "a0727a81-7f96-4ba9-9c0d-423e9f7f22da",
            notifyButton: { enable: true },
          });

          // Vérifie si l'utilisateur est déjà abonné
          const isPushEnabled = await OneSignal.isPushNotificationsEnabled();
          if (!isPushEnabled) {
            // demande d'autorisation
            await OneSignal.showSlidedownPrompt();
          }

          // Envoi immédiat d'une notification de bienvenue une fois abonné
          OneSignal.on('subscriptionChange', function (isSubscribed) {
            if (isSubscribed) {
              OneSignal.sendSelfNotification(
                "Bienvenue sur SangseShop 🎉",
                "Merci d'avoir accepté les notifications ! Vous serez alerté des nouveautés et promos.",
                window.location.href,
                undefined,
                { actionButtons: [{ id: "shop", text: "Découvrir" }] }
              );
            }
          });
        });
      }

      // Init après scroll ou clic
      window.addEventListener('scroll', initOneSignal, { once: true });
      window.addEventListener('click', initOneSignal, { once: true });
    `,
          }}
        />



      </body>
    </html>
  );
}
