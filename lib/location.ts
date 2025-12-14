import { Geolocation } from "@capacitor/geolocation";
import { Capacitor } from "@capacitor/core";

export async function getCurrentPositionSafe(): Promise<{
  lat: number;
  lng: number;
} | null> {
  try {
    // MOBILE
    if (Capacitor.isNativePlatform()) {
      const perm = await Geolocation.requestPermissions();
      if (perm.location !== "granted") return null;

      const pos = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
      });

      return {
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
      };
    }

    // WEB
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) return resolve(null);

      navigator.geolocation.getCurrentPosition(
        (pos) =>
          resolve({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          }),
        () => resolve(null),
        { enableHighAccuracy: true, timeout: 10000 }
      );
    });
  } catch {
    return null;
  }
}
