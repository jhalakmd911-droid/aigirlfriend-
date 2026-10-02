"use client";

import { useState, useEffect } from "react";

interface MemoryItem {
  id: string;
  text: string;
  date: string;
}

interface Character {
  id: string;
  name: string;
  icon: string;
  color: string;
}

const characters: Character[] = [
  { id: "jan", name: "Jan", icon: "💫", color: "#FF2D95" },
  { id: "lily", name: "Lily", icon: "💼", color: "#8B5CF6" },
  { id: "emma", name: "Emma", icon: "💕", color: "#EC4899" },
  { id: "javed", name: "Mira", icon: "🤖", color: "#10B981" },
  { id: "ayat", name: "Nadia", icon: "✨", color: "#F59E0B" },
];

export default function MemoryPage() {
  const [memories, setMemories] = useState<MemoryItem[]>([]);
  const [selectedCharacter, setSelectedCharacter] = useState("jan");
  const [showCharacterMenu, setShowCharacterMenu] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newMemoryText, setNewMemoryText] = useState("");
  const [customNames, setCustomNames] = useState<Record<string, string>>({});

  // Load custom names
  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = localStorage.getItem("customNames");
    if (saved) { try { setCustomNames(JSON.parse(saved)); } catch (e) {} }
  }, []);

  // Load memories for selected character
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mem = localStorage.getItem(`memory_${selectedCharacter}`);
    if (mem) {
      try {
        const arr = JSON.parse(mem);
        setMemories(Array.isArray(arr) ? arr : []);
      } catch (e) { setMemories([]); }
    } else { setMemories([]); }
  }, [selectedCharacter]);

  const getCharacter = (): Character =>
    characters.find((c) => c.id === selectedCharacter) || characters[0];

  const getDisplayName = (): string =>
    customNames[selectedCharacter] || getCharacter().name;

  const handleAddMemory = () => {
    if (!newMemoryText.trim()) {
      alert("মেমোরি লিখুন");
      return;
    }
    const newItem: MemoryItem = {
      id: Date.now().toString(),
      text: newMemoryText.trim(),
      date: new Date().toLocaleString("bn-BD"),
    };
    const updated = [...memories, newItem];
    setMemories(updated);
    localStorage.setItem(`memory_${selectedCharacter}`, JSON.stringify(updated));
    setNewMemoryText("");
    setShowAddModal(false);
  };

  const handleDelete = (id: string) => {
    if (!confirm("এই মেমোরিটি মুছে ফেলবেন?")) return;
    const updated = memories.filter((m) => m.id !== id);
    setMemories(updated);
    localStorage.setItem(`memory_${selectedCharacter}`, JSON.stringify(updated));
  };

  const clearAll = () => {
    if (!confirm("সব মেমোরি মুছে ফেলবেন?")) return;
    setMemories([]);
    localStorage.removeItem(`memory_${selectedCharacter}`);
  };

  const char = getCharacter();
  const displayName = getDisplayName();

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
          padding: "8px 12px 0",
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
          height: "100%",
        }}
      >
        {/* Home Button */}
        <button
          onClick={() => { if (typeof window !== "undefined") window.history.back(); }}
          style={{
            alignSelf: "flex-start",
            display: "inline-flex",
            alignItems: "center",
            gap: "4px",
            padding: "5px 11px",
            borderRadius: "999px",
            background: "rgba(20,12,40,0.72)",
            border: "1px solid rgba(139,92,246,0.55)",
            color: "#fff",
            fontSize: "10px",
            fontWeight: 700,
            cursor: "pointer",
            marginBottom: "6px",
            backdropFilter: "blur(12px)",
          }}
        >
          ← Home
        </button>

        {/* Header */}
        <div style={{ marginBottom: "8px", paddingLeft: "2px" }}>
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
            🧠 Memory
          </h1>
          <p style={{ margin: "3px 0 0", fontSize: "10px", color: "rgba(200,200,230,0.7)" }}>
            Your shared moments and memories
          </p>
        </div>

        {/* Character Switcher */}
        <div style={{ position: "relative", marginBottom: "8px" }}>
          <button
            onClick={() => setShowCharacterMenu(!showCharacterMenu)}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "9px 12px",
              borderRadius: "12px",
              background: "linear-gradient(90deg, rgba(40,15,60,0.85), rgba(30,15,55,0.85))",
              border: `1px solid ${char.color}66`,
              boxShadow: `0 0 14px ${char.color}33`,
              color: "#fff",
              cursor: "pointer",
            }}
          >
            <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span
                style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: "50%",
                  display: "grid",
                  placeItems: "center",
                  background: `linear-gradient(135deg, ${char.color}, ${char.color}aa)`,
                  fontSize: "14px",
                  flexShrink: 0,
                }}
              >
                {char.icon}
              </span>
              <span style={{ fontSize: "12px", fontWeight: 800 }}>{displayName}</span>
            </span>
            <span style={{ fontSize: "10px" }}>{showCharacterMenu ? "▲" : "▼"}</span>
          </button>

          {showCharacterMenu && (
            <div
              className="glass"
              style={{
                position: "absolute",
                top: "100%",
                left: 0,
                right: 0,
                marginTop: "4px",
                borderRadius: "14px",
                padding: "6px",
                zIndex: 100,
              }}
            >
              {characters.map((c) => {
                const isSelected = selectedCharacter === c.id;
                const cName = customNames[c.id] || c.name;
                return (
                  <button
                    key={c.id}
                    onClick={() => { setSelectedCharacter(c.id); setShowCharacterMenu(false); }}
                    style={{
                      width: "100%",
                      padding: "8px 10px",
                      borderRadius: "10px",
                      background: isSelected
                        ? `linear-gradient(135deg, ${c.color}44, ${c.color}22)`
                        : "transparent",
                      border: "none",
                      color: "#fff",
                      fontSize: "12px",
                      fontWeight: isSelected ? 700 : 500,
                      cursor: "pointer",
                      textAlign: "left",
                      display: "flex",
                      gap: "10px",
                      alignItems: "center",
                    }}
                  >
                    <span
                      style={{
                        width: "26px",
                        height: "26px",
                        borderRadius: "50%",
                        display: "grid",
                        placeItems: "center",
                        background: `linear-gradient(135deg, ${c.color}, ${c.color}aa)`,
                        fontSize: "13px",
                        flexShrink: 0,
                      }}
                    >
                      {c.icon}
                    </span>
                    <div>{cName}</div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Memory List */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            paddingRight: "2px",
            paddingBottom: "8px",
          }}
        >
          {memories.length === 0 ? (
            <div
              style={{
                padding: "40px 20px",
                textAlign: "center",
                borderRadius: "14px",
                background: "rgba(20,12,40,0.55)",
                border: "1px dashed rgba(139,92,246,0.4)",
              }}
            >
              <div style={{ fontSize: "42px", marginBottom: "10px" }}>🧠</div>
              <p style={{ color: "#fff", fontSize: "14px", fontWeight: 700, margin: 0, marginBottom: "5px" }}>
                কোনো মেমোরি নেই
              </p>
              <p style={{ color: "rgba(200,200,230,0.65)", fontSize: "11px", margin: 0, lineHeight: 1.5 }}>
                চ্যাটে <strong style={{ color: "#FF2D95" }}>"সেভ করো"</strong> বলে কিছু লিখুন,<br />
                অথবা নিচে <strong style={{ color: "#FF2D95" }}>Add Memory</strong> ক্লিক করুন।
              </p>
            </div>
          ) : (
            <>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "8px",
                  paddingLeft: "4px",
                }}
              >
                <span style={{ fontSize: "11px", fontWeight: 700, color: "rgba(200,200,230,0.8)" }}>
                  {memories.length}টি মেমোরি
                </span>
                <button
                  onClick={clearAll}
                  style={{
                    background: "rgba(239,68,68,0.18)",
                    border: "1px solid rgba(239,68,68,0.45)",
                    color: "#ef4444",
                    padding: "4px 10px",
                    borderRadius: "8px",
                    fontSize: "10px",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  🗑️ Clear All
                </button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {memories.slice().reverse().map((mem) => (
                  <div
                    key={mem.id}
                    style={{
                      padding: "10px 12px",
                      borderRadius: "12px",
                      background: "linear-gradient(145deg, rgba(20,12,40,0.85), rgba(10,6,26,0.9))",
                      border: `1px solid ${char.color}44`,
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "10px",
                    }}
                  >
                    <div
                      style={{
                        width: "30px",
                        height: "30px",
                        borderRadius: "9px",
                        display: "grid",
                        placeItems: "center",
                        background: `${char.color}33`,
                        border: `1px solid ${char.color}66`,
                        fontSize: "14px",
                        flexShrink: 0,
                      }}
                    >
                      🧠
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p
                        style={{
                          color: "#fff",
                          fontSize: "12px",
                          margin: 0,
                          lineHeight: 1.45,
                          wordBreak: "break-word",
                        }}
                      >
                        {mem.text}
                      </p>
                      <p
                        style={{
                          color: "rgba(200,200,230,0.55)",
                          fontSize: "9px",
                          margin: "3px 0 0",
                        }}
                      >
                        {mem.date}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDelete(mem.id)}
                      style={{
                        background: "rgba(239,68,68,0.15)",
                        border: "1px solid rgba(239,68,68,0.35)",
                        color: "#ef4444",
                        padding: "3px 7px",
                        borderRadius: "7px",
                        fontSize: "11px",
                        cursor: "pointer",
                        flexShrink: 0,
                      }}
                    >
                      🗑️
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Add Memory Button */}
        <button
          onClick={() => setShowAddModal(true)}
          style={{
            width: "100%",
            minHeight: "40px",
            borderRadius: "12px",
            marginTop: "6px",
            marginBottom: "8px",
            border: "none",
            background: "linear-gradient(90deg, #FF2D95 0%, #8B5CF6 100%)",
            color: "#fff",
            fontSize: "13px",
            fontWeight: 800,
            cursor: "pointer",
            boxShadow: "0 6px 20px rgba(255,45,149,0.45)",
          }}
        >
          ✨ Add Memory
        </button>
      </div>

      {/* Add Memory Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ color: "#fff", fontSize: "16px", marginBottom: "6px" }}>
              ✨ Add Memory
            </h3>
            <p style={{ color: "var(--muted)", fontSize: "11px", marginBottom: "12px" }}>
              <strong style={{ color: char.color }}>{displayName}</strong>-র জন্য নতুন মেমোরি
            </p>

            <textarea
              value={newMemoryText}
              onChange={(e) => setNewMemoryText(e.target.value)}
              placeholder="যেমন: আজ আমরা একসাথে কফি খেয়েছি..."
              rows={4}
              autoFocus
              style={{
                width: "100%",
                padding: "12px 14px",
                borderRadius: "12px",
                marginBottom: "12px",
                resize: "vertical",
                fontSize: "13px",
              }}
            />

            <div style={{ display: "flex", gap: "8px" }}>
              <button
                onClick={handleAddMemory}
                style={{
                  flex: 1,
                  padding: "11px",
                  borderRadius: "12px",
                  border: "none",
                  background: "linear-gradient(90deg, #FF2D95 0%, #8B5CF6 100%)",
                  color: "#fff",
                  fontSize: "13px",
                  fontWeight: 800,
                  cursor: "pointer",
                }}
              >
                ✅ Save
              </button>
              <button
                onClick={() => setShowAddModal(false)}
                style={{
                  flex: 1,
                  padding: "11px",
                  borderRadius: "12px",
                  background: "rgba(139,92,246,0.18)",
                  border: "1px solid rgba(139,92,246,0.45)",
                  color: "#fff",
                  fontSize: "13px",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
