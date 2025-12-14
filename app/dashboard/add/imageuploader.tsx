"use client";

import React, { useRef, useState } from "react";
import { createClient } from "@/lib/supabase";
import { Loader2, X, Camera } from "lucide-react";
import { Capacitor } from "@capacitor/core";
import { takePhotoAsFile } from "@/lib/camera";

interface ImageUploaderProps {
  onUpload: (urls: string[]) => void;
  maxImages?: number;
  currentImageCount?: number;
}

export default function ImageUploader({
  onUpload,
  maxImages = 10,
  currentImageCount = 0,
}: ImageUploaderProps) {
  const [localUrls, setLocalUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);
  const supabase = createClient();

  /* ---------------------------------- */
  /* Utils                              */
  /* ---------------------------------- */

  const compressImage = async (file: File): Promise<File> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = document.createElement("img");
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let { width, height } = img;

          const maxSize = 1920;
          if (width > maxSize || height > maxSize) {
            const ratio = width > height ? maxSize / width : maxSize / height;
            width *= ratio;
            height *= ratio;
          }

          canvas.width = width;
          canvas.height = height;
          canvas.getContext("2d")?.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              if (!blob) return resolve(file);
              resolve(
                new File([blob], file.name.replace(/\..+$/, ".webp"), {
                  type: "image/webp",
                })
              );
            },
            "image/webp",
            0.85
          );
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  /* ---------------------------------- */
  /* Upload logic                       */
  /* ---------------------------------- */

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const remaining = maxImages - (currentImageCount + localUrls.length);
    const toUpload = Array.from(files).slice(0, remaining);

    if (toUpload.length === 0) {
      setError(`Maximum ${maxImages} images`);
      return;
    }

    setUploading(true);
    setError("");

    const newUrls: string[] = [];

    for (const file of toUpload) {
      try {
        if (!file.type.startsWith("image/")) continue;

        const finalFile =
          file.size > 500 * 1024 ? await compressImage(file) : file;

        const filename = `${crypto.randomUUID()}.webp`;

        const { error: uploadError } = await supabase.storage
          .from("product")
          .upload(filename, finalFile, {
            cacheControl: "3600",
            upsert: false,
          });

        if (uploadError) throw uploadError;

        const { data } = supabase.storage
          .from("product")
          .getPublicUrl(filename);

        newUrls.push(data.publicUrl);
      } catch (err) {
        console.error(err);
        setError("Erreur lors de l’upload");
      }
    }

    if (newUrls.length > 0) {
      const updated = [...localUrls, ...newUrls];
      setLocalUrls(updated);
      onUpload(updated); // 🔥 synchro parent
    }

    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (cameraInputRef.current) cameraInputRef.current.value = "";
  };

  /* ---------------------------------- */
  /* Camera (Web + Mobile)              */
  /* ---------------------------------- */

  const handleCameraClick = async () => {
    if (Capacitor.isNativePlatform()) {
      const file = await takePhotoAsFile();
      if (!file) return;

      const fakeList = {
        0: file,
        length: 1,
        item: () => file,
      } as FileList;

      handleFiles(fakeList);
    } else {
      cameraInputRef.current?.click();
    }
  };

  const handleRemove = (index: number) => {
    const updated = localUrls.filter((_, i) => i !== index);
    setLocalUrls(updated);
    onUpload(updated); // 🔥 synchro parent
  };

  const canAddMore = currentImageCount + localUrls.length < maxImages;

  /* ---------------------------------- */
  /* Render                             */
  /* ---------------------------------- */

  return (
    <div className="space-y-4">
      {canAddMore && (
        <div className="border-2 border-dashed rounded-lg p-6 text-center">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => handleFiles(e.target.files)}
            className="hidden"
          />
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={(e) => handleFiles(e.target.files)}
            className="hidden"
          />

          {uploading ? (
            <Loader2 className="mx-auto animate-spin text-yellow-500" />
          ) : (
            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="border rounded-lg px-4 py-2"
              >
                Choisir des images
              </button>
              <button
                type="button"
                onClick={handleCameraClick}
                className="border rounded-lg px-4 py-2 flex items-center justify-center gap-2"
              >
                <Camera size={16} /> Prendre une photo
              </button>
            </div>
          )}
        </div>
      )}

      {localUrls.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
          {localUrls.map((url, index) => (
            <div
              key={url}
              className="relative aspect-square rounded-lg overflow-hidden group"
            >
              <img src={url} className="w-full h-full object-cover" />

              {index === 0 && (
                <span className="absolute top-1 left-1 bg-yellow-500 text-white text-[10px] px-2 py-0.5 rounded">
                  Principale
                </span>
              )}

              <button
                type="button"
                onClick={() => handleRemove(index)}
                className="absolute top-1 right-1 bg-red-500 text-white w-6 h-6 rounded-full opacity-0 group-hover:opacity-100"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {error && (
        <p className="text-sm text-red-600 bg-red-50 p-2 rounded">{error}</p>
      )}
    </div>
  );
}
