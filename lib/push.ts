import { PushNotifications } from "@capacitor/push-notifications";
import { Capacitor } from "@capacitor/core";
import { createClient } from "@/lib/supabase";

async function savePushToken(userId: string, token: string) {
  const supabase = createClient();

  const { error } = await supabase.from("push_tokens").upsert({
    user_id: userId,
    token,
    platform: Capacitor.getPlatform(),
  });

  if (error) {
    console.error("❌ Erreur sauvegarde token:", error);
  } else {
    console.log("✅ Token sauvegardé");
  }
}

/**
 * Initialise les notifications push
 * 👉 à appeler UNE SEULE FOIS (login / app start)
 */
export async function initPush(userId: string) {
  if (!Capacitor.isNativePlatform()) {
    console.log("🌍 Web : push ignoré");
    return;
  }

  // 1️⃣ Demande permission
  const perm = await PushNotifications.requestPermissions();
  if (perm.receive !== "granted") {
    console.log("❌ Permission refusée");
    return;
  }

  // 2️⃣ Enregistrement device
  await PushNotifications.register();

  // 3️⃣ Récupération token
  PushNotifications.addListener("registration", async (token) => {
    console.log("📲 Push token:", token.value);
    await savePushToken(userId, token.value);
  });

  // 4️⃣ Réception notification (foreground)
  PushNotifications.addListener("pushNotificationReceived", (notif) => {
    console.log("📩 Notification reçue:", notif);
  });
}
