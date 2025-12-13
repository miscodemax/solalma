import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.sangse.app",
  appName: "sangse",
  webDir: "out",
  server: {
    url: "https://solalma.vercel.app", // ou ton domaine
    cleartext: true,
  },
};

export default config;
