"use client";

import { useState, useEffect } from "react";

interface HomePageProps {
  onNavigate: (tab: string) => void;
  onOpenProfile: (characterId: string) => void;
}

const FEATURES = [
  { id: "chat", icon: "💬", title: "AI Chat", subtitle: "Chat with your companion", color: "#FF2D95" },
  { id: "voice", icon: "🎙️", title: "Voice Call", subtitle: "Real-time voice chat", color: "#8B5CF6" },
  { id: "photos", icon: "🖼️", title: "Photo Exchange", subtitle: "Share & view photos", color: "#22D3EE" },
  { id: "memory", icon: "🧠", title: "Memory System", subtitle: "Remember your moments", color: "#F59E0B" },
  { id: "character", icon: "🎭", title: "Character System", subtitle: "5 unique characters", color: "#EC4899" },
  { id: "security", icon: "🛡️", title: "Security", subtitle: "PIN protection & privacy", color: "#10B981" },
  { id: "update", icon: "⬆️", title: "Update System", subtitle: "Always up-to-date", color: "#6366F1" },
  { id: "export", icon: "📤", title: "Export / Import", subtitle: "Backup & restore data", color: "#EF4444" },
];

export default function HomePage({ onNavigate, onOpenProfile }: HomePageProps) {
  const [userName, setUserName] = useState("");
  const [greeting, setGreeting] = useState("Hello");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = localStorage.getItem("user_name");
    if (saved) setUserName(saved);

    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good morning");
    else if (hour < 17) setGreeting("Good afternoon");
    else if (hour < 21) setGreeting("Good evening");
    else setGreeting("Good night");
  }, []);

  const handleFeatureClick = (id: string) => {
    if (id === "export") {
      onNavigate("settings");
    } else if (id === "character") {
      onNavigate("chat");
    } else {
      onNavigate(id);
    }
  };

  return (
    <div style={{ padding: "10px 0" }}>
      
      {/* Greeting Header */}
      <div style={{ marginBottom: "24px" }}>
        <h1
          className="gradient-text"
          style={{
            fontSize: "28px",
            fontWeight: 800,
            marginBottom: "6px",
            letterSpacing: "-0.6px",
          }}
        >
          {greeting}{userName ? `, ${userName}` : ""}! 👋
        </h1>
        <p style={{ fontSize: "14px", color: "var(--muted)" }}>
          How are you feeling today?
        </p>
      </div>

      {/* Hero AI Companion Card */}
      <section
        className="card"
        style={{
          padding: "0",
          marginBottom: "24px",
          position: "relative",
          overflow: "hidden",
          minHeight: "200px",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(135deg, rgba(255,45,149,0.35) 0%, rgba(139,92,246,0.35) 100%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            width: "260px",
            height: "260px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(255,45,149,0.4), transparent 70%)",
            top: "-120px",
            right: "-80px",
          }}
        />
        <div
          style={{
            position: "relative",
            padding: "24px 22px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            minHeight: "200px",
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              background: "rgba(0,0,0,0.35)",
              border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: "20px",
              padding: "4px 12px",
              fontSize: "11px",
              fontWeight: 600,
              color: "#fff",
              marginBottom: "12px",
              alignSelf: "flex-start",
              backdropFilter: "blur(10px)",
            }}
          >
            ❤️ Your AI Companion
          </div>

          <h2
            style={{
              fontSize: "22px",
              fontWeight: 800,
              color: "#fff",
              marginBottom: "8px",
              lineHeight: 1.2,
              maxWidth: "280px",
            }}
          >
            Always here for you
          </h2>

          <p
            style={{
              fontSize: "13px",
              color: "rgba(255,255,255,0.85)",
              lineHeight: 1.5,
              marginBottom: "18px",
              maxWidth: "280px",
            }}
          >
            Your perfect AI companion is ready to chat, listen, and be by your side.
          </p>

          <button
            onClick={() => onNavigate("chat")}
            className="btn btn-primary"
            style={{
              alignSelf: "flex-start",
              padding: "12px 26px",
              fontSize: "14px",
            }}
          >
            💬 Start Chatting
          </button>
        </div>
      </section>

      {/* All Features */}
      <div style={{ marginBottom: "12px" }}>
        <h3
          style={{
            fontSize: "16px",
            fontWeight: 700,
            color: "#fff",
            marginBottom: "12px",
          }}
        >
          ✨ All Features
        </h3>
        <p
          style={{
            fontSize: "12px",
            color: "var(--muted)",
            marginBottom: "14px",
          }}
        >
          Everything you need in one place
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "10px",
          }}
        >
          {FEATURES.map((f) => (
            <button
              key={f.id}
              onClick={() => handleFeatureClick(f.id)}
              className="card"
              style={{
                padding: "14px",
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                gap: "8px",
                textAlign: "left",
                cursor: "pointer",
                background: "var(--card)",
                border: "1px solid var(--border)",
              }}
            >
              <div
                style={{
                  width: "42px",
                  height: "42px",
                  borderRadius: "14px",
                  background: `linear-gradient(135deg, ${f.color}, ${f.color}88)`,
                  display: "grid",
                  placeItems: "center",
                  fontSize: "20px",
                  boxShadow: `0 6px 18px ${f.color}55`,
                }}
              >
                {f.icon}
              </div>
              <div style={{ minWidth: 0 }}>
                <h4
                  style={{
                    fontSize: "13px",
                    fontWeight: 700,
                    color: "#fff",
                    marginBottom: "2px",
                  }}
                >
                  {f.title}
                </h4>
                <p
                  style={{
                    fontSize: "10px",
                    color: "var(--muted)",
                    lineHeight: 1.3,
                  }}
                >
                  {f.subtitle}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Footer Badge */}
      <div
        style={{
          textAlign: "center",
          marginTop: "28px",
          fontSize: "11px",
          color: "var(--muted)",
          opacity: 0.7,
        }}
      >
        Powered by Google Gemini AI • Made with ❤️
      </div>
    </div>
  );
}
