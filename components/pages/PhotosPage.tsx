"use client";

import { useState, useEffect, useRef } from "react";

interface Photo {
  id: string;
  data: string;
  date: string;
  favorite: boolean;
}

const STORAGE_KEY = "user_photos";

export default function PhotosPage() {
  const [activeTab, setActiveTab] = useState<"gallery" | "received" | "favorites">("gallery");
  const [photos, setPhotos] = useState<Photo[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // লোড
  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setPhotos(JSON.parse(saved));
      } catch (e) {}
    }
  }, []);

  // সেভ
  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(photos));
  }, [photos]);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert("ছবির সাইজ ২ MB এর কম হতে হবে");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const newPhoto: Photo = {
        id: Date.now().toString(),
        data: reader.result as string,
        date: new Date().toLocaleString("bn-BD", {
          year: "numeric",
          month: "short",
          day: "numeric",
        }),
        favorite: false,
      };
      setPhotos((prev) => [newPhoto, ...prev]);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const toggleFavorite = (id: string) => {
    setPhotos((prev) =>
      prev.map((p) => (p.id === id ? { ...p, favorite: !p.favorite } : p))
    );
  };

  const deletePhoto = (id: string) => {
    if (!confirm("ছবিটি মুছে ফেলবেন?")) return;
    setPhotos((prev) => prev.filter((p) => p.id !== id));
  };

  const filteredPhotos =
    activeTab === "favorites" ? photos.filter((p) => p.favorite) : photos;

  const tabs = [
    { id: "gallery", label: "Gallery" },
    { id: "received", label: "Received" },
    { id: "favorites", label: "Favorites" },
  ] as const;

  return (
    <div style={{ padding: "20px 0" }}>
      {/* Header */}
      <div style={{ marginBottom: "20px" }}>
        <h1
          className="gradient-text"
          style={{ fontSize: "28px", fontWeight: 800, marginBottom: "6px" }}
        >
          Photos
        </h1>
        <p style={{ fontSize: "13px", color: "var(--muted)" }}>
          Your shared memories and photos
        </p>
      </div>

      {/* Tabs */}
      <div
        style={{
          display: "flex",
          gap: "8px",
          marginBottom: "20px",
          overflowX: "auto",
          paddingBottom: "4px",
        }}
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={activeTab === tab.id ? "btn btn-primary" : "btn btn-secondary"}
            style={{
              padding: "10px 22px",
              minHeight: "38px",
              fontSize: "13px",
              borderRadius: "22px",
              whiteSpace: "nowrap",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Empty State / Photo Grid */}
      {filteredPhotos.length === 0 ? (
        <div
          className="card"
          style={{ padding: "60px 20px", textAlign: "center" }}
        >
          <div
            style={{
              width: "80px",
              height: "80px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #FF2D95, #8B5CF6)",
              display: "grid",
              placeItems: "center",
              fontSize: "36px",
              margin: "0 auto 20px",
              boxShadow: "0 0 30px rgba(255,45,149,0.4)",
            }}
          >
            🖼️
          </div>
          <h3
            style={{ fontSize: "16px", color: "#fff", marginBottom: "8px" }}
          >
            {activeTab === "favorites" ? "No Favorites Yet" : "No Photos Yet"}
          </h3>
          <p
            style={{
              fontSize: "13px",
              color: "var(--muted)",
              marginBottom: "20px",
            }}
          >
            {activeTab === "favorites"
              ? "আপনার পছন্দের ছবিগুলো এখানে দেখতে পাবেন।"
              : "Photos you share with your AI companion will appear here."}
          </p>
          {activeTab !== "favorites" && (
            <>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={handleUpload}
              />
              <button
                className="btn btn-primary"
                onClick={() => fileInputRef.current?.click()}
                style={{ padding: "12px 32px", fontSize: "14px" }}
              >
                📤 Upload Photos
              </button>
            </>
          )}
        </div>
      ) : (
        <>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: "10px",
              marginBottom: "20px",
            }}
          >
            {filteredPhotos.map((photo) => (
              <div
                key={photo.id}
                className="card"
                style={{
                  padding: "8px",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <img
                  src={photo.data}
                  alt="photo"
                  style={{
                    width: "100%",
                    height: "160px",
                    objectFit: "cover",
                    borderRadius: "14px",
                    marginBottom: "6px",
                  }}
                />
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "0 4px",
                  }}
                >
                  <span
                    style={{
                      fontSize: "10px",
                      color: "var(--muted)",
                    }}
                  >
                    {photo.date}
                  </span>
                  <div style={{ display: "flex", gap: "6px" }}>
                    <button
                      onClick={() => toggleFavorite(photo.id)}
                      style={{
                        background: "transparent",
                        border: "none",
                        fontSize: "16px",
                        cursor: "pointer",
                        padding: 0,
                      }}
                      title="Favorite"
                    >
                      {photo.favorite ? "❤️" : "🤍"}
                    </button>
                    <button
                      onClick={() => deletePhoto(photo.id)}
                      style={{
                        background: "transparent",
                        border: "none",
                        fontSize: "14px",
                        cursor: "pointer",
                        padding: 0,
                      }}
                      title="Delete"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={handleUpload}
          />
          <button
            className="btn btn-primary"
            onClick={() => fileInputRef.current?.click()}
            style={{ width: "100%", padding: "14px", fontSize: "14px" }}
          >
            📤 Upload Photos
          </button>
        </>
      )}
    </div>
  );
}
