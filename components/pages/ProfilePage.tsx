"use client";

import { useState, useEffect, useRef } from "react";
import {
  getPhoto,
  savePhoto,
  resetPhoto,
  fileToBase64,
} from "@/lib/characterPhotos";

interface ProfilePageProps {
  characterId: string;
  onNavigate: (tab: string, characterId?: string) => void;
  onBack: () => void;
}

interface Character {
  id: string;
  name: string;
  icon: string;
  subtitle: string;
  description: string;
}

const characters: Character[] = [
  {
    id: "jan",
    name: "Jan",
    icon: "💫",
    subtitle: "Girlfriend & Assistant",
    description: "Your loving girlfriend and personal assistant. Always here for you with warmth and care.",
  },
  {
    id: "lily",
    name: "Lily",
    icon: "💼",
    subtitle: "Business Manager",
    description: "Professional business manager. Tracks your income, expenses, and gives smart business advice.",
  },
  {
    id: "emma",
    name: "Emma",
    icon: "💕",
    subtitle: "Romantic Girlfriend",
    description: "Your deeply romantic girlfriend. Expresses love, cares about you, and makes you feel special.",
  },
  {
    id: "javed",
    name: "Javed",
    icon: "🤖",
    subtitle: "Personal Assistant",
    description: "Like JARVIS — smart, professional, and protective. Your trusted digital guardian.",
  },
  {
    id: "ayat",
    name: "Ayat",
    icon: "✨",
    subtitle: "Creative & Social",
    description: "Your creative daughter and social media expert. Full of energy and ideas.",
  },
];

const emojiOptions = ["💫", "💼", "💕", "🤖", "✨", "🌸", "🌙", "🎀", "🦋", "⭐", "🌟", "💐"];

export default function ProfilePage({ characterId, onNavigate, onBack }: ProfilePageProps) {
  const [customNames, setCustomNames] = useState<Record<string, string>>({});
  const [charPhotos, setCharPhotos] = useState<Record<string, string>>({});
  const [memoryCount, setMemoryCount] = useState(0);
  const [showPhotoMenu, setShowPhotoMenu] = useState(false);
  const [showNameMenu, setShowNameMenu] = useState(false);
  const [nameInputValue, setNameInputValue] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const char = characters.find((c) => c.id === characterId) || characters[0];

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = localStorage.getItem("customNames");
    if (saved) { try { setCustomNames(JSON.parse(saved)); } catch (e) {} }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const photos: Record<string, string> = {};
    characters.forEach((c) => { photos[c.id] = getPhoto(c.id); });
    setCharPhotos(photos);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mem = localStorage.getItem(`memory_${characterId}`);
    if (mem) {
      try { const arr = JSON.parse(mem); setMemoryCount(Array.isArray(arr) ? arr.length : 0); }
      catch (e) { setMemoryCount(0); }
    } else { setMemoryCount(0); }
  }, [characterId]);

  const displayName = customNames[characterId] || char.name;

  const renderPhoto = (size: number) => {
    const photo = charPhotos[characterId];
    const fallback = char.icon;
    if (photo && photo.startsWith("data:")) {
      return <img src={photo} alt={char.name} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }} />;
    }
    return <span style={{ fontSize: size * 0.5, lineHeight: 1 }}>{photo || fallback}</span>;
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 1024 * 1024) { alert("ছবির সাইজ ১ MB এর কম হতে হবে"); return; }
    try {
      const base64 = await fileToBase64(file);
      savePhoto(characterId, base64);
      setCharPhotos((prev) => ({ ...prev, [characterId]: base64 }));
      setShowPhotoMenu(false);
    } catch (err) { alert("ছবি লোড করা যায়নি"); }
  };

  const handleEmojiSelect = (emoji: string) => {
    savePhoto(characterId, emoji);
    setCharPhotos((prev) => ({ ...prev, [characterId]: emoji }));
    setShowPhotoMenu(false);
  };

  const handleResetPhoto = () => {
    resetPhoto(characterId);
    setCharPhotos((prev) => { const copy = { ...prev }; delete copy[characterId]; return copy; });
    setShowPhotoMenu(false);
  };

  const saveCustomName = () => {
    const updated = { ...customNames };
    if (nameInputValue.trim()) {
      updated[characterId] = nameInputValue.trim();
    } else {
      delete updated[characterId];
    }
    setCustomNames(updated);
    localStorage.setItem("customNames", JSON.stringify(updated));
    setShowNameMenu(false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", paddingTop: "20px", paddingBottom: "110px" }}>
      
      {/* Back Button */}
      <button onClick={onBack} className="btn btn-secondary" style={{ alignSelf: "flex-start", padding: "8px 14px", borderRadius: "12px", fontSize: "13px", minHeight: "auto", marginBottom: "20px" }}>
        ← Back
      </button>

      {/* Hero Card */}
      <section className="card" style={{ padding: "32px 20px 26px", textAlign: "center", position: "relative", overflow: "hidden", marginBottom: "16px" }}>
        <div style={{ position: "absolute", width: "220px", height: "220px", borderRadius: "50%", background: "radial-gradient(circle, rgba(255,45,149,0.22), transparent 70%)", top: "-90px", left: "-70px" }} />
        <div style={{ position: "absolute", width: "220px", height: "220px", borderRadius: "50%", background: "radial-gradient(circle, rgba(139,92,246,0.22), transparent 70%)", bottom: "-110px", right: "-70px" }} />

        {/* Photo */}
        <button onClick={() => setShowPhotoMenu(true)} style={{ position: "relative", width: "140px", height: "140px", margin: "0 auto 18px", borderRadius: "50%", background: "linear-gradient(135deg, #FF2D95, #8B5CF6)", display: "grid", placeItems: "center", color: "#fff", fontSize: "60px", boxShadow: "0 0 60px rgba(255,45,149,0.6)", cursor: "pointer", overflow: "hidden", border: "4px solid rgba(255,255,255,0.15)", padding: 0 }}>
          {renderPhoto(140)}
        </button>

        <button onClick={() => setShowPhotoMenu(true)} style={{ position: "absolute", top: "50%", right: "calc(50% - 70px)", transform: "translateY(-50%)", width: "36px", height: "36px", borderRadius: "50%", background: "rgba(20,12,40,0.9)", border: "2px solid rgba(255,255,255,0.2)", color: "#fff", fontSize: "16px", cursor: "pointer", display: "grid", placeItems: "center", zIndex: 2 }}>
          📷
        </button>

        {/* Name */}
        <h1 style={{ fontSize: "26px", fontWeight: 800, color: "#fff", marginBottom: "6px", position: "relative", display: "inline-block" }}>
          {displayName}
          <button onClick={() => { setNameInputValue(customNames[characterId] || ""); setShowNameMenu(true); }} className="btn btn-secondary" style={{ marginLeft: "8px", width: "32px", height: "32px", borderRadius: "50%", fontSize: "14px", padding: 0, minHeight: "auto", verticalAlign: "middle" }}>
            ✏️
          </button>
        </h1>

        <p style={{ fontSize: "13px", color: "#FF2D95", fontWeight: 600, marginBottom: "14px", position: "relative" }}>
          {char.subtitle}
        </p>

        <p style={{ fontSize: "13px", color: "var(--muted)", lineHeight: 1.6, maxWidth: "340px", margin: "0 auto", position: "relative" }}>
          {char.description}
        </p>
      </section>

      {/* Memory Card */}
      <section className="card" style={{ padding: "16px", marginBottom: "16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ width: "42px", height: "42px", borderRadius: "14px", background: "rgba(255,45,149,0.15)", border: "1px solid rgba(255,45,149,0.35)", display: "grid", placeItems: "center", fontSize: "20px" }}>
            🧠
          </div>
          <div>
            <p style={{ fontSize: "14px", fontWeight: 700, color: "#fff" }}>Memory</p>
            <p style={{ fontSize: "12px", color: "var(--muted)", marginTop: "2px" }}>{memoryCount} saved items</p>
          </div>
        </div>
      </section>

      {/* Action Buttons */}
      <section style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
        <button onClick={() => onNavigate("voice", characterId)} className="btn btn-primary" style={{ padding: "22px 16px", borderRadius: "18px", fontSize: "15px", display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "32px" }}>🎤</span>
          Voice Chat
        </button>

        <button onClick={() => onNavigate("chat", characterId)} className="btn btn-secondary" style={{ padding: "22px 16px", borderRadius: "18px", fontSize: "15px", display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "32px" }}>💬</span>
          Text Chat
        </button>
      </section>

      {/* Info Tip */}
      <section className="card" style={{ padding: "14px" }}>
        <p style={{ fontSize: "12px", lineHeight: 1.6, color: "var(--muted)" }}>
          💡 Tap the photo to change it. Tap ✏️ to rename. Your changes are saved on your phone.
        </p>
      </section>

      {/* Photo Modal */}
      {showPhotoMenu && (
        <div className="modal-overlay" onClick={() => setShowPhotoMenu(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ color: "#fff", fontSize: "18px", marginBottom: "16px" }}>📷 {displayName}-র ছবি</h3>
            <input ref={fileInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handlePhotoUpload} />
            <div style={{ width: "120px", height: "120px", borderRadius: "50%", margin: "0 auto 20px", overflow: "hidden", background: "linear-gradient(135deg, #FF2D95, #8B5CF6)", display: "grid", placeItems: "center", border: "3px solid rgba(255,255,255,0.2)", boxShadow: "0 0 30px rgba(255,45,149,0.5)" }}>
              {renderPhoto(120)}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "16px" }}>
              <button onClick={() => fileInputRef.current?.click()} className="btn btn-primary" style={{ padding: "14px" }}>📁 Upload</button>
              <button onClick={handleResetPhoto} className="btn btn-secondary" style={{ padding: "14px" }}>🔄 Reset</button>
            </div>
            <p style={{ fontSize: "12px", color: "var(--muted)", marginBottom: "12px", textAlign: "center" }}>অথবা Emoji বেছে নিন</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", justifyContent: "center", marginBottom: "16px" }}>
              {emojiOptions.map((emoji) => (
                <button key={emoji} onClick={() => handleEmojiSelect(emoji)} style={{ width: "44px", height: "44px", borderRadius: "50%", background: "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.35)", fontSize: "22px", cursor: "pointer" }}>{emoji}</button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Name Modal */}
      {showNameMenu && (
        <div className="modal-overlay" onClick={() => setShowNameMenu(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ color: "#fff", fontSize: "18px", marginBottom: "16px" }}>✏️ Change Name</h3>
            <p style={{ color: "var(--muted)", fontSize: "13px", marginBottom: "16px" }}>Current: <strong style={{ color: "#fff" }}>{displayName}</strong></p>
            <input type="text" value={nameInputValue} onChange={(e) => setNameInputValue(e.target.value)} placeholder="New name..." style={{ width: "100%", padding: "12px 16px", borderRadius: "12px", marginBottom: "16px" }} />
            <div style={{ display: "flex", gap: "10px" }}>
              <button onClick={saveCustomName} className="btn btn-primary" style={{ flex: 1, padding: "12px" }}>✅ Save</button>
              <button onClick={() => { setNameInputValue(""); const updated = { ...customNames }; delete updated[characterId]; setCustomNames(updated); localStorage.setItem("customNames", JSON.stringify(updated)); setShowNameMenu(false); }} className="btn btn-secondary" style={{ flex: 1, padding: "12px" }}>🔄 Reset</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
