"use client";

import { useState, useEffect, useRef } from "react";

interface UpdateInfo {
  version: string;
  date: string;
  message: string;
  sha: string;
}

interface CharacterData {
  id: string;
  name: string;
  icon: string;
  memoryCount: number;
  customName: string;
  hasCustomPhoto: boolean;
}

const characters = [
  { id: "jan", name: "Jan", icon: "💫" },
  { id: "lily", name: "Lily", icon: "💼" },
  { id: "emma", name: "Emma", icon: "💕" },
  { id: "javed", name: "Javed", icon: "🤖" },
  { id: "ayat", name: "Ayat", icon: "✨" },
];

export default function UpdatePage() {
  const [currentVersion] = useState("1.0.0");
  const [latestUpdate, setLatestUpdate] = useState<UpdateInfo | null>(null);
  const [checking, setChecking] = useState(true);
  const [hasUpdate, setHasUpdate] = useState(false);
  const [error, setError] = useState("");
  const [storageUsed, setStorageUsed] = useState(0);
  const [charData, setCharData] = useState<CharacterData[]>([]);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const REPO = "jhalakmd911-droid/aigirlfriend-";
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ============================================
  // Update Check
  // ============================================
  useEffect(() => {
    const checkForUpdates = async () => {
      try {
        const res = await fetch(
          `https://api.github.com/repos/${REPO}/commits?per_page=1`
        );

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
              year: "numeric",
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            }),
            message: commit.commit.message.split("\n")[0],
            sha: commit.sha,
          };

          setLatestUpdate(info);

          if (lastChecked !== commit.sha) {
            setHasUpdate(true);
          }
        }
      } catch (err: any) {
        setError(err.message || "Failed to check updates");
      } finally {
        setChecking(false);
      }
    };

    checkForUpdates();
  }, []);

  // ============================================
  // Storage Info লোড
  // ============================================
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Total storage
    let total = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        const value = localStorage.getItem(key) || "";
        total += key.length + value.length;
      }
    }
    setStorageUsed(total);

    // Character Data
    const data: CharacterData[] = characters.map((c) => {
      const mem = localStorage.getItem(`memory_${c.id}`);
      let memCount = 0;
      if (mem) {
        try {
          const arr = JSON.parse(mem);
          memCount = Array.isArray(arr) ? arr.length : 0;
        } catch (e) {}
      }

      const names = localStorage.getItem("customNames");
      let customName = "";
      if (names) {
        try {
          const parsed = JSON.parse(names);
          customName = parsed[c.id] || "";
        } catch (e) {}
      }

      const photos = localStorage.getItem("characterPhotos");
      let hasCustomPhoto = false;
      if (photos) {
        try {
          const parsed = JSON.parse(photos);
          hasCustomPhoto = !!parsed[c.id];
        } catch (e) {}
      }

      return {
        id: c.id,
        name: customName || c.name,
        icon: c.icon,
        memoryCount: memCount,
        customName,
        hasCustomPhoto,
      };
    });
    setCharData(data);
  }, []);

  const handleUpdate = () => {
    if (latestUpdate) {
      localStorage.setItem(
        "aigirlfriend_last_update_check",
        latestUpdate.sha
      );
    }
    window.location.reload();
  };

  const handleCheckAgain = () => {
    setChecking(true);
    setError("");
    window.location.reload();
  };

  // ============================================
  // Export Data
  // ============================================
  const handleExport = () => {
    if (typeof window === "undefined") return;

    try {
      const data: Record<string, any> = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          const value = localStorage.getItem(key);
          if (value) {
            try {
              data[key] = JSON.parse(value);
            } catch {
              data[key] = value;
            }
          }
        }
      }

      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `ai_girlfriend_backup_${new Date()
        .toISOString()
        .slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      alert("✅ Export সম্পূর্ণ! Downloads ফোল্ডারে সেভ হয়েছে।");
    } catch (e) {
      alert("Export ব্যর্থ হয়েছে");
    }
  };

  // ============================================
  // Import Data
  // ============================================
  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (typeof data !== "object") throw new Error("Invalid file");

        if (
          !confirm(
            "⚠️ Import করলে বর্তমান সব ডেটা মুছে যাবে। চালিয়ে যাবেন?"
          )
        ) {
          return;
        }

        localStorage.clear();
        Object.keys(data).forEach((key) => {
          const value = data[key];
          localStorage.setItem(
            key,
            typeof value === "string" ? value : JSON.stringify(value)
          );
        });

        alert("✅ Import সম্পূর্ণ! রিফ্রেশ হচ্ছে...");
        window.location.reload();
      } catch (err) {
        alert("❌ Import ব্যর্থ: ফাইলটি সঠিক নয়");
      }
    };
    reader.readAsText(file);
  };

  // ============================================
  // Clear All Data
  // ============================================
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
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        paddingTop: "20px",
        paddingBottom: "110px",
      }}
    >
      {/* Header */}
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "22px 0 18px",
          marginBottom: "16px",
        }}
      >
        <div>
          <h1
            className="gradient-text"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "26px",
              fontWeight: 800,
              letterSpacing: "-0.6px",
            }}
          >
            Updates
          </h1>
          <p
            style={{
              marginTop: "5px",
              fontSize: "13px",
              color: "var(--muted)",
            }}
          >
            Manage app & data
          </p>
        </div>

        <button
          type="button"
          onClick={handleCheckAgain}
          style={{
            width: "46px",
            height: "46px",
            borderRadius: "50%",
            border: "1px solid rgba(139,92,246,0.35)",
            display: "grid",
            placeItems: "center",
            background: "linear-gradient(135deg, #FF2D95, #8B5CF6)",
            color: "#ffffff",
            fontSize: "20px",
            boxShadow: "0 10px 30px rgba(255,45,149,0.35)",
            cursor: "pointer",
          }}
        >
          ↻
        </button>
      </header>

      {/* Checking */}
      {checking && (
        <section
          className="card"
          style={{
            padding: "40px 24px",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: "40px", marginBottom: "16px" }}>⏳</div>
          <h2 style={{ fontSize: "18px", marginBottom: "8px", color: "#fff" }}>
            Checking for updates...
          </h2>
          <p style={{ fontSize: "13px", color: "var(--muted)" }}>
            Please wait a moment
          </p>
        </section>
      )}

      {/* Error */}
      {!checking && error && (
        <section
          className="card"
          style={{
            padding: "32px 24px",
            textAlign: "center",
            marginBottom: "16px",
          }}
        >
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>⚠️</div>
          <h2 style={{ fontSize: "18px", marginBottom: "10px", color: "#fff" }}>
            Couldn't check updates
          </h2>
          <p
            style={{
              fontSize: "13px",
              color: "var(--muted)",
              marginBottom: "20px",
            }}
          >
            {error}
          </p>
        </section>
      )}

      {/* Update Available */}
      {!checking && !error && hasUpdate && latestUpdate && (
        <section
          className="card"
          style={{
            padding: "24px 20px",
            textAlign: "center",
            position: "relative",
            overflow: "hidden",
            marginBottom: "16px",
          }}
        >
          <div
            style={{
              position: "absolute",
              width: "200px",
              height: "200px",
              borderRadius: "50%",
              background:
                "radial-gradient(circle, rgba(255,45,149,0.18), transparent 70%)",
              top: "-80px",
              left: "-60px",
            }}
          />

          <div
            style={{
              position: "relative",
              width: "80px",
              height: "80px",
              margin: "0 auto 16px",
              borderRadius: "30px",
              display: "grid",
              placeItems: "center",
              background: "linear-gradient(135deg, #FF2D95, #8B5CF6)",
              color: "#ffffff",
              fontSize: "40px",
              boxShadow: "0 18px 45px rgba(255,45,149,0.35)",
            }}
          >
            🚀
          </div>

          <h2
            style={{
              fontSize: "20px",
              marginBottom: "8px",
              position: "relative",
              color: "#fff",
            }}
          >
            New Update Available
          </h2>

          <div
            style={{
              display: "flex",
              justifyContent: "space-around",
              padding: "14px 0",
              borderTop: "1px solid rgba(139,92,246,0.25)",
              borderBottom: "1px solid rgba(139,92,246,0.25)",
              marginBottom: "16px",
              position: "relative",
            }}
          >
            <div>
              <p style={{ fontSize: "10px", color: "var(--muted)" }}>
                CURRENT
              </p>
              <p style={{ fontSize: "13px", fontWeight: 700, color: "#fff" }}>
                v{currentVersion}
              </p>
            </div>
            <div>
              <p style={{ fontSize: "10px", color: "var(--muted)" }}>
                LATEST
              </p>
              <p
                style={{
                  fontSize: "13px",
                  fontWeight: 700,
                  color: "#FF2D95",
                }}
              >
                {latestUpdate.version}
              </p>
            </div>
          </div>

          <button
            className="btn btn-primary"
            onClick={handleUpdate}
            style={{
              width: "100%",
              minHeight: "48px",
              position: "relative",
              fontSize: "14px",
              fontWeight: 700,
            }}
          >
            ⚡ Update Now
          </button>
        </section>
      )}

      {/* Up to Date */}
      {!checking && !error && !hasUpdate && latestUpdate && (
        <section
          className="card"
          style={{
            padding: "24px 20px",
            textAlign: "center",
            position: "relative",
            overflow: "hidden",
            marginBottom: "16px",
          }}
        >
          <div
            style={{
              position: "relative",
              width: "70px",
              height: "70px",
              margin: "0 auto 14px",
              borderRadius: "50%",
              display: "grid",
              placeItems: "center",
              background: "linear-gradient(135deg, #22c55e, #16a34a)",
              color: "#ffffff",
              fontSize: "36px",
              boxShadow: "0 18px 45px rgba(34,197,94,0.35)",
            }}
          >
            ✓
          </div>

          <h2
            style={{
              fontSize: "18px",
              marginBottom: "6px",
              position: "relative",
              color: "#fff",
            }}
          >
            You're Up to Date!
          </h2>

          <p
            style={{
              fontSize: "12px",
              color: "var(--muted)",
              position: "relative",
            }}
          >
            Version {latestUpdate.version} • {latestUpdate.date}
          </p>
        </section>
      )}

      {/* ============================================ */}
      {/* STORAGE USAGE */}
      {/* ============================================ */}
      <section
        className="card"
        style={{
          padding: "18px",
          marginBottom: "16px",
        }}
      >
        <h3
          style={{
            fontSize: "15px",
            fontWeight: 700,
            color: "#fff",
            marginBottom: "12px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          💾 Storage Usage
        </h3>

        <div
          style={{
            padding: "12px",
            borderRadius: "12px",
            background: "rgba(139,92,246,0.15)",
            border: "1px solid rgba(139,92,246,0.3)",
            textAlign: "center",
            marginBottom: "12px",
          }}
        >
          <p
            style={{
              fontSize: "24px",
              fontWeight: 700,
              color: "#FF2D95",
            }}
          >
            {formatBytes(storageUsed)}
          </p>
          <p style={{ fontSize: "11px", color: "var(--muted)", marginTop: "4px" }}>
            Total data used
          </p>
        </div>
      </section>

      {/* ============================================ */}
      {/* CHARACTER DATA */}
      {/* ============================================ */}
      <section style={{ marginBottom: "16px" }}>
        <h3
          style={{
            fontSize: "15px",
            fontWeight: 700,
            color: "#fff",
            marginBottom: "12px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          🎭 Character Data
        </h3>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "8px",
          }}
        >
          {charData.map((c) => (
            <div
              key={c.id}
              className="card"
              style={{
                padding: "12px 14px",
                display: "flex",
                alignItems: "center",
                gap: "12px",
              }}
            >
              <div
                style={{
                  width: "42px",
                  height: "42px",
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #FF2D95, #8B5CF6)",
                  display: "grid",
                  placeItems: "center",
                  fontSize: "22px",
                  flexShrink: 0,
                }}
              >
                {c.icon}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <p
                  style={{
                    fontSize: "14px",
                    fontWeight: 700,
                    color: "#fff",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {c.name}
                </p>
                <p
                  style={{
                    fontSize: "11px",
                    color: "var(--muted)",
                    marginTop: "2px",
                  }}
                >
                  {c.memoryCount} memories
                  {c.customName && " • renamed"}
                  {c.hasCustomPhoto && " • custom photo"}
                </p>
              </div>

              <div
                style={{
                  padding: "4px 10px",
                  borderRadius: "8px",
                  background: "rgba(255,45,149,0.15)",
                  border: "1px solid rgba(255,45,149,0.35)",
                  color: "#FF2D95",
                  fontSize: "12px",
                  fontWeight: 700,
                }}
              >
                🧠 {c.memoryCount}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ============================================ */}
      {/* DATA MANAGEMENT */}
      {/* ============================================ */}
      <section style={{ marginBottom: "16px" }}>
        <h3
          style={{
            fontSize: "15px",
            fontWeight: 700,
            color: "#fff",
            marginBottom: "12px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          📁 Data Management
        </h3>

        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          style={{ display: "none" }}
          onChange={handleImport}
        />

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "10px",
          }}
        >
          <button
            onClick={handleExport}
            style={{
              padding: "14px 12px",
              borderRadius: "14px",
              background: "linear-gradient(135deg, #FF2D95, #8B5CF6)",
              color: "#fff",
              fontSize: "13px",
              fontWeight: 700,
              border: "none",
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <span style={{ fontSize: "22px" }}>📤</span>
            Export
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            style={{
              padding: "14px 12px",
              borderRadius: "14px",
              background: "rgba(139,92,246,0.2)",
              border: "1px solid rgba(139,92,246,0.5)",
              color: "#fff",
              fontSize: "13px",
              fontWeight: 700,
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <span style={{ fontSize: "22px" }}>📥</span>
            Import
          </button>
        </div>

        <button
          onClick={() => setShowClearConfirm(true)}
          style={{
            width: "100%",
            marginTop: "10px",
            padding: "14px",
            borderRadius: "14px",
            background: "rgba(239,68,68,0.15)",
            border: "1px solid rgba(239,68,68,0.5)",
            color: "#ef4444",
            fontSize: "13px",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          🗑️ Clear All Data
        </button>
      </section>

      {/* Info */}
      <section className="card" style={{ padding: "14px" }}>
        <p
          style={{
            fontSize: "11px",
            lineHeight: 1.6,
            color: "var(--muted)",
          }}
        >
          💡 আপনার সব ডেটা শুধু আপনার ফোনে সেভ থাকে। Export করে ব্যাকআপ
          রাখুন। Import করে অন্য ফোনে নিতে পারবেন।
        </p>
      </section>

      {/* Clear Confirm Modal */}
      {showClearConfirm && (
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
          onClick={() => setShowClearConfirm(false)}
        >
          <div
            style={{
              background: "rgba(20, 12, 40, 0.98)",
              border: "1px solid rgba(239,68,68,0.5)",
              borderRadius: "20px",
              padding: "24px",
              maxWidth: "400px",
              width: "100%",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ fontSize: "48px", textAlign: "center" }}>⚠️</div>
            <h3
              style={{
                color: "#fff",
                fontSize: "18px",
                marginTop: "12px",
                marginBottom: "8px",
                textAlign: "center",
              }}
            >
              সব ডেটা মুছে ফেলবেন?
            </h3>
            <p
              style={{
                color: "var(--muted)",
                fontSize: "13px",
                marginBottom: "20px",
                textAlign: "center",
                lineHeight: 1.5,
              }}
            >
              সব মেমোরি, ক্যারেক্টার সেটিং, ছবি — সব মুছে যাবে।
              এটা ফিরিয়ে আনা যাবে না।
            </p>

            <div style={{ display: "flex", gap: "10px" }}>
              <button
                onClick={handleClearAll}
                style={{
                  flex: 1,
                  padding: "12px",
                  borderRadius: "12px",
                  background: "linear-gradient(135deg, #ef4444, #dc2626)",
                  color: "#fff",
                  fontSize: "14px",
                  fontWeight: 700,
                  border: "none",
                  cursor: "pointer",
                }}
              >
                🗑️ হ্যাঁ, মুছুন
              </button>
              <button
                onClick={() => setShowClearConfirm(false)}
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
                বাতিল
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
