"use client";

import { useState, useEffect, useRef } from "react";
import {
  getPhoto,
  savePhoto,
  resetPhoto,
  fileToBase64,
} from "@/lib/characterPhotos";

interface HomePageProps {
  onNavigate: (tab: string) => void;
}

interface Character {
  id: string;
  name: string;
  icon: string;
  subtitle: string;
}

const characters: Character[] = [
  { id: "jan", name: "Jan", icon: "💫", subtitle: "Girlfriend & Assistant" },
  { id: "lily", name: "Lily", icon: "💼", subtitle: "Business Manager" },
  { id: "emma", name: "Emma", icon: "💕", subtitle: "Romantic Girlfriend" },
  { id: "javed", name: "Javed", icon: "🤖", subtitle: "Personal Assistant" },
  { id: "ayat", name: "Ayat", icon: "✨", subtitle: "Creative & Social" },
];

const emojiOptions = ["💫", "💼", "💕", "🤖", "✨", "🌸", "🌙", "🎀", "🦋", "⭐", "🌟", "💐"];

export default function HomePage({ onNavigate }: HomePageProps) {
  const [customNames, setCustomNames] = useState<Record<string, string>>({});
  const [charPhotos, setCharPhotos] = useState<Record<string, string>>({});
  const [showPhotoMenu, setShowPhotoMenu] = useState(false);
  const [showNameMenu, setShowNameMenu] = useState(false);
  const [selectedCharacter, setSelectedCharacter] = useState<string | null>(null);
  const [nameInputValue, setNameInputValue] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Custom Names লোড
  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = localStorage.getItem("customNames");
    if (saved) {
      try {
        setCustomNames(JSON.parse(saved));
      } catch (e) {}
    }
  }, []);

  // Photos লোড
  useEffect(() => {
    if (typeof window === "undefined") return;
    const photos: Record<string, string> = {};
    characters.forEach((c) => {
      photos[c.id] = getPhoto(c.id);
    });
    setCharPhotos(photos);
  }, []);

  const getDisplayName = (id: string): string => {
    return customNames[id] || characters.find((c) => c.id === id)?.name || id;
  };

  const renderPhoto = (charId: string, size: number) => {
    const photo = charPhotos[charId];
    const fallback = characters.find((c) => c.id === charId)?.icon || "💫";

    if (photo && photo.startsWith("data:")) {
      return (
        <img
          src={photo}
          alt={charId}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            borderRadius: "50%",
          }}
        />
      );
    }
    return (
      <span style={{ fontSize: size * 0.5, lineHeight: 1 }}>
        {photo || fallback}
      </span>
    );
  };

  const handleCharacterClick = (id: string) => {
    setSelectedCharacter(id);
    onNavigate("chat");
  };

  const handlePhotoOpen = (id: string) => {
    setSelectedCharacter(id);
    setShowPhotoMenu(true);
  };

  const handleNameOpen = (id: string) => {
    setSelectedCharacter(id);
    setNameInputValue(customNames[id] || "");
    setShowNameMenu(true);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedCharacter) return;
    if (file.size > 1024 * 1024) {
      alert("ছবির সাইজ ১ MB এর কম হতে হবে");
      return;
    }
    try {
      const base64 = await fileToBase64(file);
      savePhoto(selectedCharacter, base64);
      setCharPhotos((prev) => ({ ...prev, [selectedCharacter]: base64 }));
      setShowPhotoMenu(false);
    } catch (err) {
      alert("ছবি লোড করা যায়নি");
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    if (!selectedCharacter) return;
    savePhoto(selectedCharacter, emoji);
    setCharPhotos((prev) => ({ ...prev, [selectedCharacter]: emoji }));
    setShowPhotoMenu(false);
  };

  const handleResetPhoto = () => {
    if (!selectedCharacter) return;
    resetPhoto(selectedCharacter);
    setCharPhotos((prev) => {
      const copy = { ...prev };
      delete copy[selectedCharacter];
      return copy;
    });
    setShowPhotoMenu(false);
  };

  const saveCustomName = () => {
    if (!selectedCharacter) return;
    if (nameInputValue.trim()) {
      const updated = {
        ...customNames,
        [selectedCharacter]: nameInputValue.trim(),
      };
      setCustomNames(updated);
      localStorage.setItem("customNames", JSON.stringify(updated));
    } else {
      const copy = { ...customNames };
      delete copy[selectedCharacter];
      setCustomNames(copy);
      localStorage.setItem("customNames", JSON.stringify(copy));
    }
    setShowNameMenu(false);
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "14px",
        paddingBottom: "20px",
        paddingTop: "20px",
      }}
    >
      {/* Header */}
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "22px 0 18px",
        }}
      >
        <div>
          <div
            className="gradient-text"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "26px",
              fontWeight: 800,
              letterSpacing: "-0.6px",
            }}
          >
            AI Girlfriend
          </div>
          <p
            style={{
              marginTop: "5px",
              fontSize: "13px",
              color: "var(--muted)",
            }}
          >
            Your personal AI companion
          </p>
        </div>

        <div
          style={{
            width: "46px",
            height: "46px",
            borderRadius: "50%",
            border: "1px solid rgba(139,92,246,0.35)",
            display: "grid",
            placeItems: "center",
            background: "linear-gradient(135deg, #FF2D95, #8B5CF6)",
            color: "#ffffff",
            fontSize: "22px",
            boxShadow: "0 10px 30px rgba(255,45,149,0.4)",
          }}
        >
          ♡
        </div>
      </header>

      {/* Hero Section */}
      <section
        className="card"
        style={{
          position: "relative",
          overflow: "hidden",
          padding: "28px 22px 26px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            position: "absolute",
            width: "180px",
            height: "180px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(255,45,149,0.22), transparent 70%)",
            top: "-80px",
            left: "-60px",
          }}
        />
        <div
          style={{
            position: "absolute",
            width: "180px",
            height: "180px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(139,92,246,0.22), transparent 70%)",
            bottom: "-90px",
            right: "-60px",
          }}
        />

        <div
          style={{
            position: "relative",
            width: "90px",
            height: "90px",
            margin: "0 auto 18px",
            borderRadius: "30px",
            display: "grid",
            placeItems: "center",
            background: "linear-gradient(135deg, #FF2D95, #8B5CF6)",
            color: "#ffffff",
            fontSize: "48px",
            boxShadow: "0 0 45px rgba(255,45,149,0.55)",
          }}
        >
          ♡
        </div>

        <h1
          style={{
            position: "relative",
            fontSize: "24px",
            lineHeight: 1.15,
            letterSpacing: "-0.6px",
            color: "#fff",
          }}
        >
          Meet your AI companion
        </h1>

        <p
          style={{
            position: "relative",
            margin: "11px auto 0",
            maxWidth: "360px",
            fontSize: "14px",
            lineHeight: 1.6,
            color: "var(--muted)",
          }}
        >
          Chat, talk, and spend time with a friendly AI companion.
        </p>

        <button
          type="button"
          className="btn btn-primary"
          onClick={() => onNavigate("chat")}
          style={{
            position: "relative",
            marginTop: "22px",
            width: "100%",
            maxWidth: "320px",
            minHeight: "50px",
            fontSize: "15px",
            fontWeight: 700,
          }}
        >
          Start chatting
        </button>
      </section>

      {/* Characters Grid */}
      <section
        style={{
          marginTop: "12px",
        }}
      >
        <h2
          style={{
            fontSize: "16px",
            fontWeight: 700,
            color: "#fff",
            marginBottom: "12px",
            padding: "0 4px",
          }}
        >
          🎭 Your Characters
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "12px",
          }}
        >
          {characters.map((c) => {
            const displayName = getDisplayName(c.id);
            return (
              <div
                key={c.id}
                className="card"
                style={{
                  padding: "16px 12px",
                  textAlign: "center",
                  position: "relative",
                  cursor: "pointer",
                }}
                onClick={() => handleCharacterClick(c.id)}
              >
                {/* Photo Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePhotoOpen(c.id);
                  }}
                  style={{
                    position: "absolute",
                    top: "8px",
                    right: "8px",
                    width: "28px",
                    height: "28px",
                    borderRadius: "50%",
                    background: "rgba(139,92,246,0.35)",
                    border: "1px solid rgba(139,92,246,0.6)",
                    color: "#fff",
                    fontSize: "13px",
                    cursor: "pointer",
                    zIndex: 2,
                    padding: 0,
                    display: "grid",
                    placeItems: "center",
                  }}
                >
                  📷
                </button>

                {/* Name Edit Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNameOpen(c.id);
                  }}
                  style={{
                    position: "absolute",
                    top: "8px",
                    left: "8px",
                    width: "28px",
                    height: "28px",
                    borderRadius: "50%",
                    background: "rgba(255,45,149,0.25)",
                    border: "1px solid rgba(255,45,149,0.5)",
                    color: "#fff",
                    fontSize: "12px",
                    cursor: "pointer",
                    zIndex: 2,
                    padding: 0,
                    display: "grid",
                    placeItems: "center",
                  }}
                >
                  ✏️
                </button>

                {/* Photo */}
                <div
                  style={{
                    width: "80px",
                    height: "80px",
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #FF2D95, #8B5CF6)",
                    display: "grid",
                    placeItems: "center",
                    color: "#ffffff",
                    fontSize: "38px",
                    margin: "0 auto 10px",
                    boxShadow: "0 0 20px rgba(255,45,149,0.5)",
                    overflow: "hidden",
                    border: "2px solid rgba(255,255,255,0.15)",
                    marginTop: "14px",
                  }}
                >
                  {renderPhoto(c.id, 80)}
                </div>

                <h3
                  style={{
                    fontSize: "14px",
                    fontWeight: 700,
                    color: "#fff",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {displayName}
                </h3>
                <p
                  style={{
                    fontSize: "10px",
                    marginTop: "3px",
                    color: "var(--muted)",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {c.subtitle}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Info Section */}
      <section
        className="card"
        style={{
          marginTop: "14px",
          padding: "21px",
        }}
      >
        <h2 style={{ fontSize: "18px", color: "#fff" }}>Your companion</h2>
        <p
          style={{
            marginTop: "7px",
            fontSize: "13px",
            lineHeight: 1.55,
            color: "var(--muted)",
          }}
        >
          Tap a character to start chatting or talking. Long press photo to
          change it. Your data stays on your phone.
        </p>
      </section>

      {/* Photo Modal */}
      {showPhotoMenu && selectedCharacter && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.75)",
            backdropFilter: "blur(8px)",
            display: "grid",
            placeItems: "center",
            zIndex: 100,
            padding: "20px",
          }}
          onClick={() => setShowPhotoMenu(false)}
        >
          <div
            style={{
              background: "rgba(20, 12, 40, 0.98)",
              border: "1px solid rgba(139,92,246,0.4)",
              borderRadius: "20px",
              padding: "24px",
              maxWidth: "400px",
              width: "100%",
              maxHeight: "80vh",
              overflowY: "auto",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3
              style={{
                color: "#fff",
                fontSize: "18px",
                marginBottom: "16px",
              }}
            >
              📷 {getDisplayName(selectedCharacter)}-র ছবি
            </h3>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handlePhotoUpload}
            />

            <div
              style={{
                width: "120px",
                height: "120px",
                borderRadius: "50%",
                margin: "0 auto 20px",
                overflow: "hidden",
                background: "linear-gradient(135deg, #FF2D95, #8B5CF6)",
                display: "grid",
                placeItems: "center",
                border: "3px solid rgba(255,255,255,0.2)",
                boxShadow: "0 0 30px rgba(255,45,149,0.5)",
              }}
            >
              {renderPhoto(selectedCharacter, 120)}
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "10px",
                marginBottom: "16px",
              }}
            >
              <button
                onClick={() => fileInputRef.current?.click()}
                style={{
                  padding: "14px",
                  borderRadius: "12px",
                  background: "linear-gradient(135deg, #FF2D95, #8B5CF6)",
                  color: "#fff",
                  fontSize: "14px",
                  fontWeight: 700,
                  border: "none",
                  cursor: "pointer",
                }}
              >
                📁 Upload
              </button>
              <button
                onClick={handleResetPhoto}
                style={{
                  padding: "14px",
                  borderRadius: "12px",
                  background: "rgba(139,92,246,0.2)",
                  border: "1px solid rgba(139,92,246,0.4)",
                  color: "#fff",
                  fontSize: "14px",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                🔄 Reset
              </button>
            </div>

            <p
              style={{
                fontSize: "12px",
                color: "var(--muted)",
                marginBottom: "12px",
                textAlign: "center",
              }}
            >
              অথবা Emoji বেছে নিন
            </p>

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "8px",
                justifyContent: "center",
                marginBottom: "16px",
              }}
            >
              {emojiOptions.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => handleEmojiSelect(emoji)}
                  style={{
                    width: "44px",
                    height: "44px",
                    borderRadius: "50%",
                    background: "rgba(139,92,246,0.15)",
                    border: "1px solid rgba(139,92,246,0.35)",
                    fontSize: "22px",
                    cursor: "pointer",
                  }}
                >
                  {emoji}
                </button>
              ))}
            </div>

            <p
              style={{
                fontSize: "11px",
                color: "var(--muted)",
                textAlign: "center",
                lineHeight: 1.5,
              }}
            >
              💡 ছবির সাইজ ১ MB এর কম। GIF/WebP সাপোর্ট করে।
            </p>
          </div>
        </div>
      )}

      {/* Name Modal */}
      {showNameMenu && selectedCharacter && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.75)",
            backdropFilter: "blur(8px)",
            display: "grid",
            placeItems: "center",
            zIndex: 100,
            padding: "20px",
          }}
          onClick={() => setShowNameMenu(false)}
        >
          <div
            style={{
              background: "rgba(20, 12, 40, 0.98)",
              border: "1px solid rgba(139,92,246,0.4)",
              borderRadius: "20px",
              padding: "24px",
              maxWidth: "400px",
              width: "100%",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3
              style={{
                color: "#fff",
                fontSize: "18px",
                marginBottom: "16px",
              }}
            >
              ✏️ Change Name
            </h3>

            <p
              style={{
                color: "var(--muted)",
                fontSize: "13px",
                marginBottom: "16px",
              }}
            >
              Current:{" "}
              <strong style={{ color: "#fff" }}>
                {getDisplayName(selectedCharacter)}
              </strong>
            </p>

            <input
              type="text"
              value={nameInputValue}
              onChange={(e) => setNameInputValue(e.target.value)}
              placeholder="New name..."
              style={{
                width: "100%",
                padding: "12px 16px",
                borderRadius: "12px",
                border: "1px solid rgba(139,92,246,0.4)",
                background: "rgba(11,4,32,0.65)",
                color: "#fff",
                fontSize: "14px",
                outline: "none",
                marginBottom: "16px",
              }}
            />

            <div style={{ display: "flex", gap: "10px" }}>
              <button
                onClick={saveCustomName}
                style={{
                  flex: 1,
                  padding: "12px",
                  borderRadius: "12px",
                  background: "linear-gradient(135deg, #FF2D95, #8B5CF6)",
                  color: "#fff",
                  fontSize: "14px",
                  fontWeight: 700,
                  border: "none",
                  cursor: "pointer",
                }}
              >
                ✅ Save
              </button>
              <button
                onClick={() => {
                  setNameInputValue("");
                  saveCustomName();
                }}
                style={{
                  flex: 1,
                  padding: "12px",
                  borderRadius: "12px",
                  background: "rgba(139,92,246,0.2)",
                  border: "1px solid rgba(139,92,246,0.4)",
                  color: "#fff",
                  fontSize: "14px",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                🔄 Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
