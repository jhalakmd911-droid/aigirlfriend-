"use client";

import { useState, useEffect } from "react";

interface SettingsPageProps {
  onNavigate?: (tab: string) => void;
}

const SETTINGS_ITEMS = [
  { id: "profile", icon: "👤", title: "Profile", subtitle: "Edit your profile", color: "#FF2D95" },
  { id: "character", icon: "🎭", title: "Character", subtitle: "Change your AI girlfriend", color: "#8B5CF6" },
  { id: "voice", icon: "🎙️", title: "Voice & Audio", subtitle: "Voice settings", color: "#22D3EE" },
  { id: "chat", icon: "💬", title: "Chat Settings", subtitle: "Message preferences", color: "#F59E0B" },
  { id: "privacy", icon: "🔒", title: "Privacy & Security", subtitle: "PIN, privacy, data", color: "#10B981" },
  { id: "data", icon: "🗂️", title: "Data Management", subtitle: "Manage your data", color: "#EF4444" },
  { id: "export", icon: "📤", title: "Export Chat History", subtitle: "Download your conversations", color: "#6366F1" },
  { id: "import", icon: "📥", title: "Import Chat History", subtitle: "Restore from backup", color: "#EC4899" },
  { id: "about", icon: "ℹ️", title: "About", subtitle: "App information", color: "#9CA3AF" },
] as const;

export default function SettingsPage({ onNavigate }: SettingsPageProps) {
  const [userName, setUserName] = useState("");
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [showAboutModal, setShowAboutModal] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = localStorage.getItem("user_name");
    if (saved) setUserName(saved);
  }, []);

  const handleSaveName = () => {
    const trimmed = nameInput.trim();
    if (!trimmed) { alert("একটি নাম দিন"); return; }
    setUserName(trimmed);
    localStorage.setItem("user_name", trimmed);
    setShowProfileModal(false);
  };

  const handleItemClick = (id: string) => {
    if (id === "profile") { setNameInput(userName); setShowProfileModal(true); }
    else if (id === "about") { setShowAboutModal(true); }
    else if (id === "privacy") { onNavigate?.("security"); }
    else if (id === "export") { handleExport(); }
    else if (id === "import") { handleImportClick(); }
    else { alert(`${id} সেটিংস শীঘ্রই আসছে`); }
  };

  const handleExport = () => {
    if (typeof window === "undefined") return;
    try {
      const data: Record<string, any> = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          const value = localStorage.getItem(key);
          if (value) { try { data[key] = JSON.parse(value); } catch { data[key] = value; } }
        }
      }
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `ai_girlfriend_backup_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      URL.revokeObjectURL(url);
      alert("✅ Export সম্পূর্ণ! Downloads ফোল্ডারে সেভ হয়েছে।");
    } catch (e) { alert("Export ব্যর্থ হয়েছে"); }
  };

  const handleImportClick = () => {
    const input = document.createElement("input");
    input.type = "file"; input.accept = ".json";
    input.onchange = (e: any) => {
      const file = e.target?.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target?.result as string);
          if (typeof data !== "object") throw new Error("Invalid file");
          if (!confirm("⚠️ Import করলে বর্তমান সব ডেটা মুছে যাবে। চালিয়ে যাবেন?")) return;
          localStorage.clear();
          Object.keys(data).forEach((key) => {
            const value = data[key];
            localStorage.setItem(key, typeof value === "string" ? value : JSON.stringify(value));
          });
          alert("✅ Import সম্পূর্ণ! রিফ্রেশ হচ্ছে...");
          window.location.reload();
        } catch (err) { alert("❌ Import ব্যর্থ: ফাইলটি সঠিক নয়"); }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  return (
    <div style={{ padding: "20px 0" }}>
      <div style={{ marginBottom: "20px" }}>
        <h1 className="gradient-text" style={{ fontSize: "28px", fontWeight: 800, marginBottom: "6px" }}>⚙️ Settings</h1>
        <p style={{ fontSize: "13px", color: "var(--muted)" }}>Manage your app & preferences</p>
      </div>

      <div className="card" style={{ padding: "16px", display: "flex", alignItems: "center", gap: "14px", marginBottom: "20px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", width: "160px", height: "160px", borderRadius: "50%", background: "radial-gradient(circle, rgba(255,45,149,0.18), transparent 70%)", top: "-70px", right: "-60px", pointerEvents: "none" }} />
        <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: "linear-gradient(135deg, #FF2D95, #8B5CF6)", display: "grid", placeItems: "center", fontSize: "24px", boxShadow: "0 0 25px rgba(255,45,149,0.5)", flexShrink: 0, border: "2px solid rgba(255,255,255,0.15)" }}>👤</div>
        <div style={{ flex: 1, minWidth: 0, position: "relative" }}>
          <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#fff", marginBottom: "2px" }}>{userName || "আপনার নাম"}</h3>
          <p style={{ fontSize: "12px", color: "var(--muted)" }}>{userName ? "Tap to edit profile" : "Tap to set your name"}</p>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {SETTINGS_ITEMS.map((item) => (
          <button key={item.id} onClick={() => handleItemClick(item.id)} className="card" style={{ padding: "14px 16px", display: "flex", alignItems: "center", gap: "14px", textAlign: "left", cursor: "pointer", background: "var(--card)", border: "1px solid var(--border)", width: "100%", transition: "all 0.2s ease" }}>
            <div style={{ width: "46px", height: "46px", borderRadius: "14px", background: `linear-gradient(135deg, ${item.color}, ${item.color}88)`, display: "grid", placeItems: "center", fontSize: "20px", flexShrink: 0, boxShadow: `0 6px 18px ${item.color}44` }}>{item.icon}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#fff", marginBottom: "2px" }}>{item.title}</h3>
              <p style={{ fontSize: "11px", color: "var(--muted)", lineHeight: 1.3 }}>{item.subtitle}</p>
            </div>
            <div style={{ fontSize: "20px", color: "var(--muted)", flexShrink: 0 }}>›</div>
          </button>
        ))}
      </div>

      <div style={{ textAlign: "center", marginTop: "30px", fontSize: "11px", color: "var(--muted)", opacity: 0.7 }}>
        AI Girlfriend v1.0.0 • Made with ❤️
      </div>

      {showProfileModal && (
        <div className="modal-overlay" onClick={() => setShowProfileModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ color: "#fff", fontSize: "18px", marginBottom: "8px" }}>👤 আপনার প্রোফাইল</h3>
            <p style={{ color: "var(--muted)", fontSize: "12px", marginBottom: "16px" }}>আপনার নাম লিখুন</p>
            <input type="text" value={nameInput} onChange={(e) => setNameInput(e.target.value)} placeholder="যেমন: Rahim" style={{ width: "100%", padding: "12px 16px", borderRadius: "12px", marginBottom: "16px" }} />
            <div style={{ display: "flex", gap: "10px" }}>
              <button onClick={handleSaveName} className="btn btn-primary" style={{ flex: 1, padding: "12px" }}>✅ Save</button>
              <button onClick={() => setShowProfileModal(false)} className="btn btn-secondary" style={{ flex: 1, padding: "12px" }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {showAboutModal && (
        <div className="modal-overlay" onClick={() => setShowAboutModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div style={{ width: "70px", height: "70px", borderRadius: "20px", background: "linear-gradient(135deg, #FF2D95, #8B5CF6)", display: "grid", placeItems: "center", fontSize: "32px", margin: "0 auto 16px", boxShadow: "0 0 30px rgba(255,45,149,0.5)" }}>❤️</div>
            <h3 style={{ color: "#fff", fontSize: "20px", marginBottom: "6px", textAlign: "center" }}>AI Girlfriend</h3>
            <p style={{ color: "var(--muted)", fontSize: "13px", marginBottom: "6px", textAlign: "center" }}>Your Personal AI Companion</p>
            <p style={{ color: "var(--muted)", fontSize: "11px", marginBottom: "20px", textAlign: "center", opacity: 0.7 }}>Version 1.0.0</p>
            <div style={{ padding: "12px 14px", borderRadius: "12px", background: "rgba(139,92,246,0.12)", border: "1px solid rgba(139,92,246,0.3)", marginBottom: "16px" }}>
              <p style={{ fontSize: "12px", color: "var(--muted)", lineHeight: 1.6, textAlign: "center" }}>Powered by Google Gemini AI<br />5 unique AI characters<br />Chat, Voice, Memory & Photos</p>
            </div>
            <button onClick={() => setShowAboutModal(false)} className="btn btn-primary" style={{ width: "100%", padding: "12px" }}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
