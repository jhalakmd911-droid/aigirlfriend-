"use client";

import { useState, useEffect, useRef } from "react";
import { getPhoto, savePhoto, fileToBase64 } from "@/lib/characterPhotos";

interface UpdateInfo {
  version: string;
  date: string;
  message: string;
  sha: string;
}

interface Character {
  id: string;
  name: string;
  icon: string;
  color: string;
  defaultPhoto: string;
}

const characters: Character[] = [
  { id: "jan", name: "Jan", icon: "💫", color: "#FF2D95", defaultPhoto: "/images/Jan2-8404588.png" },
  { id: "lily", name: "Lily", icon: "💼", color: "#8B5CF6", defaultPhoto: "/images/Lile2-8059037.jpg" },
  { id: "emma", name: "Emma", icon: "💕", color: "#EC4899", defaultPhoto: "/images/Emma-stuff-ai-generated-8494624.jpg" },
  { id: "javed", name: "Mira", icon: "🤖", color: "#10B981", defaultPhoto: "/images/Mira2-8296163.jpg" },
  { id: "ayat", name: "Nadia", icon: "✨", color: "#F59E0B", defaultPhoto: "/images/Nadia007-ai-generated-8822022.jpg" },
];

const REPO = "jhalakmd911-droid/aigirlfriend-";

export default function UpdatePage() {
  const [currentVersion] = useState("1.0.0");
  const [latestUpdate, setLatestUpdate] = useState<UpdateInfo | null>(null);
  const [checking, setChecking] = useState(true);
  const [hasUpdate, setHasUpdate] = useState(false);
  const [error, setError] = useState("");
  const [storageUsed, setStorageUsed] = useState(0);
  const [charPhotos, setCharPhotos] = useState<Record<string, string>>({});
  const [customNames, setCustomNames] = useState<Record<string, string>>({});
  const [memoryCounts, setMemoryCounts] = useState<Record<string, number>>({});
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [uploadingFor, setUploadingFor] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const backupInputRef = useRef<HTMLInputElement>(null);

  // Check for updates from GitHub
  useEffect(() => {
    const checkForUpdates = async () => {
      try {
        const res = await fetch(`https://api.github.com/repos/${REPO}/commits?per_page=1`);
        if (!res.ok) throw new Error("GitHub API error");
        const data = await res.json();

        if (data && data.length > 0) {
          const commit = data[0];
          const commitDate = new Date(commit.commit.author.date);
          const lastCheckedKey = "aigirlfriend_last_update_check";
          const lastChecked = localStorage.getItem(lastCheckedKey);

          const info: UpdateInfo = {
            version: commit.sha.slice(0, 7),
            date: commitDate.toLocaleString("en-US", {
              year: "numeric", month: "short", day: "numeric",
              hour: "2-digit", minute: "2-digit",
            }),
            message: commit.commit.message.split("\n")[0],
            sha: commit.sha,
          };

          setLatestUpdate(info);
          if (lastChecked !== commit.sha) setHasUpdate(true);
        }
      } catch (err: any) {
        setError(err.message || "Failed to check updates");
      } finally {
        setChecking(false);
      }
    };
    checkForUpdates();
  }, []);

  // Load local data
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Storage
    let total = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        const value = localStorage.getItem(key) || "";
        total += key.length + value.length;
      }
    }
    setStorageUsed(total);

    // Custom names
    const names = localStorage.getItem("customNames");
    if (names) { try { setCustomNames(JSON.parse(names)); } catch (e) {} }

    // Memory counts
    const counts: Record<string, number> = {};
    characters.forEach((c) => {
      const mem = localStorage.getItem(`memory_${c.id}`);
      if (mem) {
        try { const arr = JSON.parse(mem); counts[c.id] = Array.isArray(arr) ? arr.length : 0; }
        catch (e) { counts[c.id] = 0; }
      } else { counts[c.id] = 0; }
    });
    setMemoryCounts(counts);

    // Photos
    const photos: Record<string, string> = {};
    characters.forEach((c) => { photos[c.id] = getPhoto(c.id); });
    setCharPhotos(photos);
  }, []);

  const getCharImage = (charId: string): string => {
    const custom = charPhotos[charId];
    if (custom && custom.startsWith("data:")) return custom;
    const found = characters.find((c) => c.id === charId);
    return found?.defaultPhoto || "/images/Jan2-8404588.png";
  };

  const getDisplayName = (charId: string): string => {
    return customNames[charId] || characters.find((c) => c.id === charId)?.name || "";
  };

  const handleUpdate = () => {
    if (latestUpdate) localStorage.setItem("aigirlfriend_last_update_check", latestUpdate.sha);
    window.location.reload();
  };

  const handleCheckAgain = () => {
    setChecking(true);
    setError("");
    setHasUpdate(false);
    window.location.reload();
  };

  // Photo upload for a character
  const handlePhotoClick = (charId: string) => {
    setUploadingFor(charId);
    fileInputRef.current?.click();
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !uploadingFor) return;
    if (file.size > 1024 * 1024) {
      alert("ছবির সাইজ ১ MB এর কম হতে হবে");
      setUploadingFor(null);
      return;
    }
    try {
      const base64 = await fileToBase64(file);
      savePhoto(uploadingFor, base64);
      setCharPhotos((prev) => ({ ...prev, [uploadingFor]: base64 }));
      alert("✅ ছবি সফলভাবে পরিবর্তন হয়েছে!");
    } catch (err) {
      alert("❌ ছবি লোড করা যায়নি");
    } finally {
      setUploadingFor(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleExport = () => {
    if (typeof window === "undefined") return;
    try {
      const data: Record<string, any> = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          const value = localStorage.getItem(key);
          if (value) {
            try { data[key] = JSON.parse(value); }
            catch { data[key] = value; }
          }
        }
      }
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `ai_girlfriend_backup_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      alert("✅ Export সম্পূর্ণ! Downloads ফোল্ডারে সেভ হয়েছে।");
    } catch (e) { alert("Export ব্যর্থ হয়েছে"); }
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
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
    if (backupInputRef.current) backupInputRef.current.value = "";
  };

  const handleClearAll = () => {
    if (typeof window === "undefined") return;
    localStorage.clear();
    alert("✅ সব ডেটা মুছে ফেলা হয়েছে।");
    window.location.reload();
  };

  const formatBytes = (bytes: number): string => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / 1024 / 1024).toFixed(2) + " MB";
  };

  return (
    <div
      style={{
        height: "100dvh",
        background: "#05030d",
        paddingBottom: "78px",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={handlePhotoUpload}
      />
      <input
        ref={backupInputRef}
        type="file"
        accept=".json"
        style={{ display: "none" }}
        onChange={handleImport}
      />

      {/* Glows */}
      <div style={{ position: "absolute", width: "260px", height: "260px", borderRadius: "50%", background: "radial-gradient(circle, rgba(255,45,149,0.20), transparent 70%)", top: "-80px", left: "-100px", zIndex: 0, pointerEvents: "none" }} />
      <div style={{ position: "absolute", width: "260px", height: "260px", borderRadius: "50%", background: "radial-gradient(circle, rgba(99,102,241,0.20), transparent 70%)", bottom: "-40px", right: "-110px", zIndex: 0, pointerEvents: "none" }} />

      <div
        style={{
          position: "relative",
          zIndex: 2,
          width: "100%",
          maxWidth: "480px",
          margin: "0 auto",
          padding: "14px 12px 0",
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
          height: "100%",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px", paddingLeft: "2px" }}>
          <div>
            <h1
              style={{
                fontSize: "22px",
                fontWeight: 900,
                margin: 0,
                lineHeight: 1.05,
                letterSpacing: "-0.5px",
                background: "linear-gradient(90deg, #FF2D95 0%, #C84CFF 60%, #8B5CF6 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Updates
            </h1>
            <p style={{ margin: "3px 0 0", fontSize: "10px", color: "rgba(200,200,230,0.7)" }}>
              Manage app & data
            </p>
          </div>
          <button
            onClick={handleCheckAgain}
            disabled={checking}
            style={{
              width: "42px",
              height: "42px",
              borderRadius: "50%",
              padding: 0,
              border: "none",
              background: "linear-gradient(135deg, #FF2D95, #8B5CF6)",
              color: "#fff",
              fontSize: "18px",
              cursor: checking ? "wait" : "pointer",
              boxShadow: "0 0 20px rgba(255,45,149,0.5)",
              display: "grid",
              placeItems: "center",
            }}
            title="Check Update"
          >
            {checking ? "⏳" : "↻"}
          </button>
        </div>

        {/* Scrollable content */}
        <div style={{ flex: 1, overflowY: "auto", paddingRight: "2px", paddingBottom: "8px" }}>

          {/* Update State */}
          {checking && (
            <div
              style={{
                padding: "20px",
                borderRadius: "14px",
                background: "rgba(20,12,40,0.7)",
                border: "1px solid rgba(139,92,246,0.4)",
                marginBottom: "10px",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: "32px", marginBottom: "8px" }}>⏳</div>
              <p style={{ color: "#fff", fontSize: "13px", fontWeight: 700, margin: 0 }}>
                Checking for updates...
              </p>
            </div>
          )}

          {!checking && error && (
            <div
              style={{
                padding: "16px",
                borderRadius: "14px",
                background: "rgba(239,68,68,0.12)",
                border: "1px solid rgba(239,68,68,0.4)",
                marginBottom: "10px",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: "28px", marginBottom: "6px" }}>⚠️</div>
              <p style={{ color: "#fff", fontSize: "12px", fontWeight: 700, margin: 0, marginBottom: "3px" }}>
                আপডেট চেক করা যায়নি
              </p>
              <p style={{ color: "rgba(200,200,230,0.65)", fontSize: "10px", margin: 0 }}>{error}</p>
            </div>
          )}

          {!checking && !error && hasUpdate && latestUpdate && (
            <div
              style={{
                padding: "14px",
                borderRadius: "14px",
                background: "linear-gradient(145deg, rgba(40,15,60,0.85), rgba(20,10,40,0.9))",
                border: "1px solid rgba(255,77,185,0.55)",
                boxShadow: "0 0 22px rgba(255,45,149,0.22)",
                marginBottom: "10px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "10px" }}>
                <div
                  style={{
                    width: "46px",
                    height: "46px",
                    borderRadius: "13px",
                    background: "linear-gradient(135deg, #FF2D95, #8B5CF6)",
                    display: "grid",
                    placeItems: "center",
                    fontSize: "24px",
                    flexShrink: 0,
                    boxShadow: "0 0 18px rgba(255,45,149,0.5)",
                  }}
                >
                  🚀
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ color: "#fff", fontSize: "13px", fontWeight: 800, margin: 0 }}>
                    নতুন আপডেট পাওয়া গেছে
                  </p>
                  <p style={{ color: "rgba(200,200,230,0.65)", fontSize: "10px", margin: "2px 0 0" }}>
                    v{currentVersion} → <span style={{ color: "#FF2D95", fontWeight: 800 }}>{latestUpdate.version}</span>
                  </p>
                </div>
              </div>
              <button
                onClick={handleUpdate}
                style={{
                  width: "100%",
                  padding: "11px",
                  borderRadius: "12px",
                  border: "none",
                  background: "linear-gradient(90deg, #FF2D95 0%, #8B5CF6 100%)",
                  color: "#fff",
                  fontSize: "13px",
                  fontWeight: 800,
                  cursor: "pointer",
                  boxShadow: "0 6px 20px rgba(255,45,149,0.45)",
                }}
              >
                ⚡ এখন আপডেট করুন
              </button>
            </div>
          )}

          {!checking && !error && !hasUpdate && latestUpdate && (
            <div
              style={{
                padding: "14px",
                borderRadius: "14px",
                background: "rgba(34,197,94,0.08)",
                border: "1px solid rgba(34,197,94,0.4)",
                marginBottom: "10px",
                display: "flex",
                alignItems: "center",
                gap: "12px",
              }}
            >
              <div
                style={{
                  width: "46px",
                  height: "46px",
                  borderRadius: "13px",
                  background: "linear-gradient(135deg, #22c55e, #16a34a)",
                  display: "grid",
                  placeItems: "center",
                  fontSize: "24px",
                  flexShrink: 0,
                  boxShadow: "0 0 18px rgba(34,197,94,0.5)",
                }}
              >
                ✓
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ color: "#fff", fontSize: "13px", fontWeight: 800, margin: 0 }}>
                  আপনি আপ-টু-ডেট!
                </p>
                <p style={{ color: "rgba(200,200,230,0.65)", fontSize: "10px", margin: "2px 0 0" }}>
                  {latestUpdate.version} • {latestUpdate.date}
                </p>
              </div>
            </div>
          )}

          {/* Storage Usage */}
          <div
            style={{
              padding: "12px",
              borderRadius: "14px",
              background: "rgba(20,12,40,0.7)",
              border: "1px solid rgba(139,92,246,0.4)",
              marginBottom: "10px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <p style={{ color: "#fff", fontSize: "12px", fontWeight: 800, margin: 0, display: "flex", alignItems: "center", gap: "6px" }}>
                💾 Storage
              </p>
              <span style={{ fontSize: "15px", fontWeight: 900, color: "#FF2D95" }}>{formatBytes(storageUsed)}</span>
            </div>
            <div style={{ height: "4px", borderRadius: "2px", background: "rgba(255,255,255,0.1)", overflow: "hidden" }}>
              <div style={{ height: "100%", width: "35%", background: "linear-gradient(90deg, #FF2D95, #8B5CF6)", borderRadius: "2px" }} />
            </div>
          </div>

          {/* Character Data with Photo Upload */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px", paddingLeft: "4px" }}>
            <p style={{ color: "#fff", fontSize: "12px", fontWeight: 800, margin: 0 }}>
              👥 Character Data
            </p>
            <span style={{ color: "rgba(200,200,230,0.6)", fontSize: "9px" }}>
              ছবি বদলাতে ট্যাপ করুন
            </span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "5px", marginBottom: "12px" }}>
            {characters.map((c) => (
              <div
                key={c.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "7px 10px",
                  borderRadius: "10px",
                  background: "rgba(20,12,40,0.65)",
                  border: `1px solid ${c.color}33`,
                }}
              >
                <button
                  onClick={() => handlePhotoClick(c.id)}
                  style={{
                    width: "34px",
                    height: "34px",
                    borderRadius: "50%",
                    overflow: "hidden",
                    display: "grid",
                    placeItems: "center",
                    background: `linear-gradient(135deg, ${c.color}, ${c.color}aa)`,
                    border: `1.5px solid ${c.color}`,
                    flexShrink: 0,
                    padding: 0,
                    cursor: "pointer",
                    position: "relative",
                  }}
                  title="ছবি পরিবর্তন করুন"
                >
                  <img
                    src={getCharImage(c.id)}
                    alt={c.name}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    onError={(e) => {
                      const el = e.currentTarget as HTMLImageElement;
                      el.style.display = "none";
                      const parent = el.parentElement;
                      if (parent && !parent.dataset.fb) {
                        parent.dataset.fb = "1";
                        parent.textContent = c.icon;
                      }
                    }}
                  />
                  <span
                    style={{
                      position: "absolute",
                      bottom: "-1px",
                      right: "-1px",
                      background: "#FF2D95",
                      width: "14px",
                      height: "14px",
                      borderRadius: "50%",
                      display: "grid",
                      placeItems: "center",
                      fontSize: "8px",
                      border: "1.5px solid #05030d",
                    }}
                  >
                    ✏️
                  </span>
                </button>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ color: "#fff", fontSize: "12px", fontWeight: 700, margin: 0 }}>
                    {getDisplayName(c.id)}
                  </p>
                  <p style={{ color: "rgba(200,200,230,0.5)", fontSize: "9px", margin: "1px 0 0" }}>
                    {charPhotos[c.id]?.startsWith("data:") ? "কাস্টম ছবি" : c.subtitle || "ডিফল্ট ছবি"}
                  </p>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    padding: "3px 9px",
                    borderRadius: "10px",
                    background: `${c.color}22`,
                    border: `1px solid ${c.color}55`,
                  }}
                >
                  <span style={{ fontSize: "11px" }}>🧠</span>
                  <span style={{ fontSize: "11px", fontWeight: 800, color: "#fff" }}>
                    {memoryCounts[c.id] || 0}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Data Management */}
          <p style={{ color: "#fff", fontSize: "12px", fontWeight: 800, margin: "0 0 8px 4px" }}>
            📁 Data Management
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px", marginBottom: "6px" }}>
            <button
              onClick={handleExport}
              style={{
                padding: "12px 8px",
                borderRadius: "12px",
                border: "none",
                background: "linear-gradient(135deg, #FF2D95, #8B5CF6)",
                color: "#fff",
                fontSize: "12px",
                fontWeight: 800,
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "4px",
                boxShadow: "0 5px 16px rgba(255,45,149,0.4)",
              }}
            >
              <span style={{ fontSize: "18px" }}>📤</span>
              Export
            </button>
            <button
              onClick={() => backupInputRef.current?.click()}
              style={{
                padding: "12px 8px",
                borderRadius: "12px",
                background: "rgba(139,92,246,0.18)",
                border: "1px solid rgba(139,92,246,0.5)",
                color: "#fff",
                fontSize: "12px",
                fontWeight: 800,
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "4px",
              }}
            >
              <span style={{ fontSize: "18px" }}>📥</span>
              Import
            </button>
          </div>

          <button
            onClick={() => setShowClearConfirm(true)}
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "12px",
              background: "rgba(239,68,68,0.15)",
              border: "1px solid rgba(239,68,68,0.5)",
              color: "#ef4444",
              fontSize: "12px",
              fontWeight: 800,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
            }}
          >
            🗑️ Clear All Data
          </button>

          {/* Info Note */}
          <div
            style={{
              marginTop: "10px",
              padding: "10px 12px",
              borderRadius: "12px",
              background: "rgba(139,92,246,0.08)",
              border: "1px dashed rgba(139,92,246,0.3)",
            }}
          >
            <p style={{ color: "rgba(200,200,230,0.75)", fontSize: "10px", margin: 0, lineHeight: 1.5 }}>
              💡 ছবি বদলাতে যেকোনো ক্যারেক্টারের **অ্যাভাটারে ট্যাপ করুন**। Export করে ব্যাকআপ রাখুন, Import করে অন্য ফোনে নিন।
            </p>
          </div>
        </div>
      </div>

      {/* Clear Confirm Modal */}
      {showClearConfirm && (
        <div className="modal-overlay" onClick={() => setShowClearConfirm(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div style={{ fontSize: "48px", textAlign: "center" }}>⚠️</div>
            <h3 style={{ color: "#fff", fontSize: "16px", marginTop: "12px", marginBottom: "8px", textAlign: "center" }}>
              সব ডেটা মুছে ফেলবেন?
            </h3>
            <p style={{ color: "var(--muted)", fontSize: "12px", marginBottom: "16px", textAlign: "center", lineHeight: 1.5 }}>
              সব মেমোরি, ক্যারেক্টার সেটিং, ছবি — সব মুছে যাবে। এটা ফিরিয়ে আনা যাবে না।
            </p>
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                onClick={handleClearAll}
                style={{
                  flex: 1, padding: "11px", borderRadius: "12px", border: "none",
                  background: "linear-gradient(135deg, #ef4444, #dc2626)",
                  color: "#fff", fontSize: "13px", fontWeight: 800, cursor: "pointer",
                }}
              >
                🗑️ হ্যাঁ, মুছুন
              </button>
              <button
                onClick={() => setShowClearConfirm(false)}
                style={{
                  flex: 1, padding: "11px", borderRadius: "12px",
                  background: "rgba(139,92,246,0.18)",
                  border: "1px solid rgba(139,92,246,0.45)",
                  color: "#fff", fontSize: "13px", fontWeight: 700, cursor: "pointer",
                }}
              >
                বাতিল
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
