"use client";

// ============================================
// Character Photo System
// localStorage-এ ছবি সেভ করে
// ============================================

export interface CharacterPhoto {
  id: string;
  photo: string; // Base64 data URL or URL
  isAnimated: boolean;
}

const STORAGE_KEY = "characterPhotos";

// ডিফল্ট Emoji (প্রথমবার)
export const defaultPhotos: Record<string, string> = {
  jan: "💫",
  lily: "💼",
  emma: "💕",
  javed: "🤖",
  ayat: "✨",
};

// সব ছবি লোড
export function loadPhotos(): Record<string, string> {
  if (typeof window === "undefined") return {};
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error(e);
  }
  return {};
}

// একটা ছবি সেভ
export function savePhoto(characterId: string, photo: string) {
  if (typeof window === "undefined") return;
  try {
    const photos = loadPhotos();
    photos[characterId] = photo;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(photos));
  } catch (e) {
    console.error(e);
  }
}

// একটা ছবি রিসেট
export function resetPhoto(characterId: string) {
  if (typeof window === "undefined") return;
  try {
    const photos = loadPhotos();
    delete photos[characterId];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(photos));
  } catch (e) {
    console.error(e);
  }
}

// সব ছবি রিসেট
export function resetAllPhotos() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}

// একটা ক্যারেক্টারের ছবি বের করা (custom না থাকলে default)
export function getPhoto(characterId: string): string {
  const photos = loadPhotos();
  if (photos[characterId]) return photos[characterId];
  return defaultPhotos[characterId] || "💫";
}

// ছবি Base64-এ কনভার্ট
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ছবি কি animated?
export function isAnimatedImage(file: File): boolean {
  return (
    file.type === "image/gif" ||
    file.type === "image/webp" ||
    file.name.toLowerCase().endsWith(".gif") ||
    file.name.toLowerCase().endsWith(".webp")
  );
}
