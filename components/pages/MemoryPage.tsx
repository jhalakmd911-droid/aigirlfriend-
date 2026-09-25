"use client";

import { useState, useEffect } from "react";

interface MemoryItem {
  id: string;
  category: "first_chat" | "favorite" | "important" | "preference";
  title: string;
  description: string;
  date: string;
}

const STORAGE_KEY = "user_memories";

const CATEGORIES = [
  {
    id: "first_chat",
    icon: "💬",
    title: "First Chat",
    subtitle: "Remember when we first met...",
    color: "#FF2D95",
  },
  {
    id: "favorite",
    icon: "💖",
    title: "Favorite Activities",
    subtitle: "Things we love to do together",
    color: "#8B5CF6",
  },
  {
    id: "important",
    icon: "⭐",
    title: "Important Moments",
    subtitle: "Special moments we shared",
    color: "#22D3EE",
  },
  {
    id: "preference",
    icon: "🎯",
    title: "Your Preferences",
    subtitle: "What you like and dislike",
    color: "#F59E0B",
  },
] as const;

export default function MemoryPage() {
  const [memories, setMemories] = useState<MemoryItem[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<MemoryItem["category"]>("first_chat");
  const [titleInput, setTitleInput] = useState("");
  const [descInput, setDescInput] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setMemories(JSON.parse(saved));
      } catch (e) {}
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(memories));
  }, [memories]);

  const handleAddMemory = () => {
    if (!titleInput.trim()) {
      alert("একটি টাইটেল দিন");
      return;
    }
    const newMemory: MemoryItem = {
      id: Date.now().toString(),
      category: selectedCategory,
      title: titleInput.trim(),
      description: descInput.trim(),
      date: new Date().toLocaleString("bn-BD", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
    };
    setMemories((prev) => [newMemory, ...prev]);
    setTitleInput("");
    setDescInput("");
    setShowAddModal(false);
  };

  const handleDelete = (id: string) => {
    if (!confirm("এই মেমোরিটি মুছে ফেলবেন?")) return;
    setMemories((prev) => prev.filter((m) => m.id !== id));
  };

  const getCategoryInfo = (catId: string) =>
    CATEGORIES.find((c) => c.id === catId) || CATEGORIES[0];

  return (
    <div style={{ padding: "20px 0" }}>
      {/* Header */}
      <div style={{ marginBottom: "20px" }}>
        <h1
          className="gradient-text"
          style={{ fontSize: "28px", fontWeight: 800, marginBottom: "6px" }}
        >
          🧠 Memory
        </h1>
        <p style={{ fontSize: "13px", color: "var(--muted)" }}>
          Your shared moments and memories
        </p>
      </div>

      {/* Category Cards */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          marginBottom: "20px",
        }}
      >
        {CATEGORIES.map((cat) => {
          const catMemories = memories.filter((m) => m.category === cat.id);
          return (
            <div
              key={cat.id}
              className="card"
              style={{
                padding: "16px",
                display: "flex",
                alignItems: "center",
                gap: "14px",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  width: "120px",
                  height: "120px",
                  borderRadius: "50%",
                  background: `radial-gradient(circle, ${cat.color}22, transparent 70%)`,
                  top: "-50px",
                  right: "-30px",
                  pointerEvents: "none",
                }}
              />
              <div
                style={{
                  width: "52px",
                  height: "52px",
                  borderRadius: "16px",
                  background: `linear-gradient(135deg, ${cat.color}, ${cat.color}88)`,
                  display: "grid",
                  placeItems: "center",
                  fontSize: "24px",
                  flexShrink: 0,
                  boxShadow: `0 8px 22px ${cat.color}55`,
                }}
              >
                {cat.icon}
              </div>
              <div style={{ flex: 1, minWidth: 0, position: "relative" }}>
                <h3
                  style={{
                    fontSize: "15px",
                    fontWeight: 700,
                    color: "#fff",
                    marginBottom: "4px",
                  }}
                >
                  {cat.title}
                </h3>
                <p
                  style={{
                    fontSize: "12px",
                    color: "var(--muted)",
                    lineHeight: 1.4,
                  }}
                >
                  {catMemories.length > 0
                    ? `${catMemories.length}টি সেভ করা হয়েছে`
                    : cat.subtitle}
                </p>
              </div>
              <div
                style={{
                  fontSize: "20px",
                  color: "var(--muted)",
                  position: "relative",
                }}
              >
                ›
              </div>
            </div>
          );
        })}
      </div>

      {/* Saved Memories List */}
      {memories.length > 0 && (
        <div style={{ marginBottom: "20px" }}>
          <h3
            style={{
              fontSize: "15px",
              fontWeight: 700,
              color: "#fff",
              marginBottom: "12px",
              paddingLeft: "4px",
            }}
          >
            📌 Recent Memories
          </h3>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "8px" }}
          >
            {memories.slice(0, 10).map((mem) => {
              const catInfo = getCategoryInfo(mem.category);
              return (
                <div
                  key={mem.id}
                  className="card"
                  style={{
                    padding: "12px 14px",
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "12px",
                  }}
                >
                  <div
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "12px",
                      background: `${catInfo.color}22`,
                      border: `1px solid ${catInfo.color}55`,
                      display: "grid",
                      placeItems: "center",
                      fontSize: "16px",
                      flexShrink: 0,
                    }}
                  >
                    {catInfo.icon}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p
                      style={{
                        fontSize: "13px",
                        fontWeight: 600,
                        color: "#fff",
                        marginBottom: "2px",
                      }}
                    >
                      {mem.title}
                    </p>
                    {mem.description && (
                      <p
                        style={{
                          fontSize: "12px",
                          color: "var(--muted)",
                          lineHeight: 1.4,
                          marginBottom: "4px",
                        }}
                      >
                        {mem.description}
                      </p>
                    )}
                    <p
                      style={{
                        fontSize: "10px",
                        color: "var(--muted)",
                        opacity: 0.7,
                      }}
                    >
                      {mem.date} • {catInfo.title}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(mem.id)}
                    style={{
                      background: "transparent",
                      border: "none",
                      fontSize: "14px",
                      cursor: "pointer",
                      padding: "4px",
                    }}
                    title="Delete"
                  >
                    🗑️
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Add Memory Button */}
      <button
        className="btn btn-primary"
        onClick={() => setShowAddModal(true)}
        style={{ width: "100%", padding: "14px", fontSize: "14px" }}
      >
        ✨ Add Memory
      </button>

      {/* Add Memory Modal */}
      {showAddModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowAddModal(false)}
        >
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h3
              style={{
                color: "#fff",
                fontSize: "18px",
                marginBottom: "16px",
              }}
            >
              ✨ Add New Memory
            </h3>

            <p
              style={{
                color: "var(--muted)",
                fontSize: "12px",
                marginBottom: "10px",
              }}
            >
              Category
            </p>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "8px",
                marginBottom: "16px",
              }}
            >
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={
                    selectedCategory === cat.id ? "btn btn-primary" : "btn btn-secondary"
                  }
                  style={{
                    padding: "10px 8px",
                    fontSize: "12px",
                    minHeight: "40px",
                  }}
                >
                  {cat.icon} {cat.title}
                </button>
              ))}
            </div>

            <p
              style={{
                color: "var(--muted)",
                fontSize: "12px",
                marginBottom: "6px",
              }}
            >
              Title
            </p>
            <input
              type="text"
              value={titleInput}
              onChange={(e) => setTitleInput(e.target.value)}
              placeholder="যেমন: প্রথম দেখা"
              style={{
                width: "100%",
                padding: "12px 14px",
                borderRadius: "12px",
                marginBottom: "14px",
              }}
            />

            <p
              style={{
                color: "var(--muted)",
                fontSize: "12px",
                marginBottom: "6px",
              }}
            >
              Description (optional)
            </p>
            <textarea
              value={descInput}
              onChange={(e) => setDescInput(e.target.value)}
              placeholder="বিস্তারিত লিখুন..."
              rows={3}
              style={{
                width: "100%",
                padding: "12px 14px",
                borderRadius: "12px",
                marginBottom: "16px",
                resize: "vertical",
              }}
            />

            <div style={{ display: "flex", gap: "10px" }}>
              <button
                onClick={handleAddMemory}
                className="btn btn-primary"
                style={{ flex: 1, padding: "12px" }}
              >
                ✅ Save
              </button>
              <button
                onClick={() => setShowAddModal(false)}
                className="btn btn-secondary"
                style={{ flex: 1, padding: "12px" }}
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
