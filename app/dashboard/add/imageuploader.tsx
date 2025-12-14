"use client";

import React, { useState, useRef } from "react";
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
  maxImages = 5,
  currentImageCount = 0,
}: ImageUploaderProps) {
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);
  const supabase = createClient();

  const compressImage = async (file: File): Promise<File> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = document.createElement("img");
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;

          const maxSize = 1920;
          if (width > maxSize || height > maxSize) {
            if (width > height) {
              height = (height / width) * maxSize;
              width = maxSize;
            } else {
              width = (width / height) * maxSize;
              height = maxSize;
            }
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              if (blob) {
                const compressedFile = new File(
                  [blob],
                  file.name.replace(/\.[^/.]+$/, ".webp"),
                  { type: "image/webp" }
                );
                resolve(compressedFile);
              } else {
                resolve(file);
              }
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

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const remaining = maxImages - (currentImageCount + uploadedUrls.length);
    const toUpload = Array.from(files).slice(0, remaining);

    if (toUpload.length === 0) {
      setError(`Maximum ${maxImages} images`);
      setTimeout(() => setError(""), 3000);
      return;
    }

    setUploading(true);
    setError("");

    const newUrls: string[] = [];

    for (const file of toUpload) {
      const isImage =
        file.type?.startsWith("image/") ||
        file.name.match(/\.(jpg|jpeg|png|webp)$/i);
      try {
        if (!isImage) {
          throw new Error("Fichier non supporté");
        }

        const compressedFile =
          file.size > 500 * 1024 ? await compressImage(file) : file;

        const ext = compressedFile.name.split(".").pop() || "webp";
        const filename = `${Date.now()}-${Math.random()
          .toString(36)
          .slice(2, 9)}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from("product")
          .upload(filename, compressedFile, {
            cacheControl: "3600",
            upsert: false,
          });

        if (uploadError) throw uploadError;

        const { data } = supabase.storage
          .from("product")
          .getPublicUrl(filename);

        newUrls.push(data.publicUrl);
      } catch (err) {
        console.error("Upload error:", err);
        setError("Erreur lors de l'upload");
      }
    }

    if (newUrls.length > 0) {
      const allUrls = [...uploadedUrls, ...newUrls];
      setUploadedUrls(allUrls);
      onUpload(allUrls);
    }

    setUploading(false);

    if (fileInputRef.current) fileInputRef.current.value = "";
    if (cameraInputRef.current) cameraInputRef.current.value = "";
  };

  const handleRemove = (index: number) => {
    const newUrls = uploadedUrls.filter((_, i) => i !== index);
    setUploadedUrls(newUrls);
    onUpload(newUrls);
  };

  const handleCameraClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // MOBILE (Capacitor)
    if (Capacitor.isNativePlatform()) {
      const file = await takePhotoAsFile();
      if (file) {
        const fakeList = {
          0: file,
          length: 1,
          item: () => file,
        } as FileList;

        await handleFiles(fakeList);
      }
      return;
    }

    // WEB
    cameraInputRef.current?.click();
  };

  const totalImages = currentImageCount + uploadedUrls.length;
  const canAddMore = totalImages < maxImages;

  return (
    <div className="space-y-4">
      {/* Zone d'upload */}
      {canAddMore && (
        <div className="relative w-full rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-[#F4B400] transition-colors">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => handleFiles(e.target.files)}
            disabled={!canAddMore || uploading}
            className="hidden"
          />

          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={(e) => handleFiles(e.target.files)}
            disabled={!canAddMore || uploading}
            className="hidden"
          />

          <div className="p-6 text-center">
            {uploading ? (
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="w-8 h-8 text-[#F4B400] animate-spin" />
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Upload en cours...
                </p>
              </div>
            ) : (
              <>
                <div className="text-4xl mb-3">📸</div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Ajouter des photos ({totalImages}/{maxImages})
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full sm:w-auto px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm text-gray-700 dark:text-gray-300 transition-colors"
                  >
                    Choisir des fichiers
                  </button>

                  <span className="text-xs text-gray-400">ou</span>

                  <button
                    type="button"
                    onClick={handleCameraClick}
                    className="flex items-center gap-2 w-full sm:w-auto px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm text-gray-700 dark:text-gray-300 transition-colors"
                  >
                    <Camera className="w-4 h-4" />
                    Prendre une photo
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Galerie d'images */}
      {uploadedUrls.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
          {uploadedUrls.map((url, index) => (
            <div
              key={index}
              className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 group"
            >
              <img
                src={url}
                alt={`Image ${index + 1}`}
                className="w-full h-full object-cover"
              />

              {index === 0 && (
                <div className="absolute top-1 left-1 bg-[#F4B400] text-white text-[10px] font-bold px-2 py-0.5 rounded">
                  Principale
                </div>
              )}

              <button
                type="button"
                onClick={() => handleRemove(index)}
                className="absolute top-1 right-1 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Message d'erreur */}
      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}
    </div>
  );
}
