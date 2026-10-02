"use client";

import { useState, useEffect } from "react";

interface HomePageProps {
  onNavigate: (tab: string) => void;
  onOpenProfile: (characterId: string) => void;
}

const FEATURES = [
  { id: "chat", icon: "💬", title: "AI Chat", subtitle: "Chat with your companion", color: "#ff2d95" },
  { id: "voice", icon: "🎙️", title: "Voice Call", subtitle: "Real-time voice chat", color: "#8b5cf6" },
  { id: "photos", icon: "🖼️", title: "Photo Exchange", subtitle: "Share & view photos", color: "#22d3ee" },
  { id: "memory", icon: "🧠", title: "Memory System", subtitle: "Remember your moments", color: "#f59e0b" },
  { id: "character", icon: "🎭", title: "Character System", subtitle: "5 unique characters", color: "#ec4899" },
  { id: "security", icon: "🛡️", title: "Security", subtitle: "PIN protection & privacy", color: "#10b981" },
  { id: "update", icon: "☁️", title: "Update System", subtitle: "Always up-to-date", color: "#6366f1" },
  { id: "export", icon: "📤", title: "Export / Import", subtitle: "Backup & restore data", color: "#ef4444" },
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
    if (id === "export") onNavigate("settings");
    else if (id === "character") onNavigate("chat");
    else onNavigate(id);
  };

  return (
    <div style={{ width: "100%", padding: "4px 0 16px", boxSizing: "border-box" }}>

      {/* GREETING */}
      <section style={{ padding: "6px 2px 12px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px" }}>
          <div style={{ minWidth: 0, flex: 1 }}>
            <h1
              style={{
                margin: 0,
                fontSize: "20px",
                lineHeight: 1.15,
                fontWeight: 850,
                letterSpacing: "-0.6px",
                background: "linear-gradient(90deg, #ff2997 0%, #a855f7 52%, #60a5fa 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              {greeting}
              {userName ? `, ${userName}` : ""}! 👋
            </h1>
            <p style={{ margin: "4px 0 0", color: "rgba(190,190,220,0.78)", fontSize: "11px", lineHeight: 1.4 }}>
              How are you feeling today?
            </p>
          </div>

          <div
            style={{
              width: "34px",
              height: "34px",
              borderRadius: "50%",
              display: "grid",
              placeItems: "center",
              flexShrink: 0,
              background: "linear-gradient(145deg, rgba(255,45,149,0.16), rgba(99,102,241,0.12))",
              border: "1px solid rgba(168,85,247,0.42)",
              boxShadow: "0 0 16px rgba(168,85,247,0.15)",
              color: "#c4b5fd",
              fontSize: "15px",
            }}
          >
            ♡
          </div>
        </div>
      </section>

      {/* HERO */}
      <section
        style={{
          position: "relative",
          minHeight: "165px",
          overflow: "hidden",
          borderRadius: "20px",
          marginBottom: "18px",
          border: "1px solid rgba(186,85,255,0.55)",
          background: "linear-gradient(115deg, #16091f 0%, #29103d 45%, #10132f 100%)",
          boxShadow: "0 0 22px rgba(255,45,149,0.16), inset 0 0 30px rgba(99,102,241,0.10)",
        }}
      >
        {/* Pink glow */}
        <div
          style={{
            position: "absolute",
            width: "180px",
            height: "180px",
            borderRadius: "50%",
            left: "-80px",
            top: "-70px",
            background: "radial-gradient(circle, rgba(255,45,149,0.38), transparent 70%)",
            filter: "blur(4px)",
          }}
        />
        {/* Purple glow */}
        <div
          style={{
            position: "absolute",
            width: "200px",
            height: "200px",
            borderRadius: "50%",
            right: "-100px",
            bottom: "-100px",
            background: "radial-gradient(circle, rgba(99,102,241,0.42), transparent 70%)",
          }}
        />

        {/* ✅ Right side girl image */}
        <div
          style={{
            position: "absolute",
            right: 0,
            top: 0,
            width: "45%",
            height: "100%",
            overflow: "hidden",
            pointerEvents: "none",
          }}
        >
          <img
            src="/images/naw_20261002_031328.jpg"
            alt="AI Companion"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "center top",
              opacity: 0.95,
            }}
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = "none";
            }}
          />
          {/* fade from left */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(90deg, #16091f 0%, rgba(22,9,31,0.75) 35%, transparent 100%)",
            }}
          />
        </div>

        {/* Hero content */}
        <div
          style={{
            position: "relative",
            zIndex: 2,
            width: "60%",
            minHeight: "165px",
            padding: "14px 0 14px 14px",
            boxSizing: "border-box",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          {/* Badge */}
          <div
            style={{
              alignSelf: "flex-start",
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
              padding: "4px 9px",
              borderRadius: "999px",
              marginBottom: "8px",
              fontSize: "9px",
              fontWeight: 750,
              color: "#fff",
              background: "rgba(30,8,42,0.65)",
              border: "1px solid rgba(255,77,185,0.52)",
            }}
          >
            ❤️ Your AI Companion
          </div>

          <h2
            style={{
              margin: 0,
              maxWidth: "180px",
              fontSize: "18px",
              lineHeight: 1.1,
              fontWeight: 900,
              letterSpacing: "-0.5px",
              color: "#fff",
            }}
          >
            Always here for you
          </h2>

          <p
            style={{
              margin: "6px 0 10px",
              maxWidth: "180px",
              fontSize: "10px",
              lineHeight: 1.5,
              color: "rgba(238,230,255,0.78)",
            }}
          >
            Your perfect AI companion is ready to chat, listen, and be by your side.
          </p>

          <button
            type="button"
            onClick={() => onNavigate("chat")}
            className="btn btn-primary"
            style={{
              alignSelf: "flex-start",
              minHeight: "32px",
              padding: "0 14px",
              borderRadius: "10px",
              fontSize: "11px",
              fontWeight: 800,
              border: "none",
              background: "linear-gradient(90deg, #ff2997 0%, #c83ee8 52%, #7655f5 100%)",
              boxShadow: "0 6px 18px rgba(255,45,149,0.30)",
            }}
          >
            💬 Start Chatting
          </button>
        </div>
      </section>

      {/* ALL FEATURES */}
      <section>
        <div style={{ padding: "0 2px", marginBottom: "10px" }}>
          <h3 style={{ margin: 0, fontSize: "15px", fontWeight: 850, letterSpacing: "-0.3px", color: "#fff" }}>
            ✨ All Features
          </h3>
          <p style={{ margin: "3px 0 0", fontSize: "10px", color: "rgba(185,180,210,0.72)" }}>
            Everything you need in one place
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "8px" }}>
          {FEATURES.map((feature) => (
            <button
              key={feature.id}
              type="button"
              onClick={() => handleFeatureClick(feature.id)}
              className="card"
              style={{
                position: "relative",
                minWidth: 0,
                minHeight: "74px",
                padding: "9px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                textAlign: "left",
                borderRadius: "14px",
                border: `1px solid ${feature.color}55`,
                background: "linear-gradient(145deg, rgba(18,18,48,0.95), rgba(8,12,35,0.96))",
                boxShadow: `inset 0 0 18px ${feature.color}0d, 0 6px 18px rgba(0,0,0,0.18)`,
                cursor: "pointer",
              }}
            >
              <div
                style={{
                  width: "34px",
                  height: "34px",
                  flexShrink: 0,
                  display: "grid",
                  placeItems: "center",
                  borderRadius: "10px",
                  fontSize: "16px",
                  background: `linear-gradient(145deg, ${feature.color}, ${feature.color}aa)`,
                  boxShadow: `0 0 16px ${feature.color}45`,
                }}
              >
                {feature.icon}
              </div>

              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontSize: "11px", lineHeight: 1.2, fontWeight: 800, color: "#fff", marginBottom: "3px" }}>
                  {feature.title}
                </div>
                <div style={{ fontSize: "8px", lineHeight: 1.35, color: "rgba(181,188,220,0.72)" }}>
                  {feature.subtitle}
                </div>
              </div>

              <div style={{ flexShrink: 0, color: "#a8b9ff", fontSize: "14px", opacity: 0.85 }}>›</div>
            </button>
          ))}
        </div>
      </section>

      {/* Footer */}
      <div style={{ textAlign: "center", marginTop: "20px", fontSize: "9px", color: "var(--muted)", opacity: 0.6 }}>
        Made with ❤️
      </div>
    </div>
  );
}
