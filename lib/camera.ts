import { Camera, CameraResultType, CameraSource } from "@capacitor/camera";
import { Capacitor } from "@capacitor/core";

export async function takePhotoAsFile() {
  if (!Capacitor.isNativePlatform()) {
    return null; // fallback web géré ailleurs
  }

  const photo = await Camera.getPhoto({
    quality: 80,
    allowEditing: false,
    resultType: CameraResultType.Uri,
    source: CameraSource.Camera,
  });

  return photo;
}
