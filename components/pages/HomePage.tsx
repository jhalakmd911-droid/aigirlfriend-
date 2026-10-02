"use client";

import { useState, useEffect } from "react";

interface HomePageProps {
  onNavigate: (tab: string) => void;
  onOpenProfile: (characterId: string) => void;
}

const FEATURES = [
  { id: "chat", icon: "💬", title: "AI Chat", subtitle: "Chat with companion", color: "#ff2d95" },
  { id: "voice", icon: "🎙️", title: "Voice Call", subtitle: "Real-time voice", color: "#8b5cf6" },
  { id: "photos", icon: "🖼️", title: "Photo Exchange", subtitle: "Share & view", color: "#22d3ee" },
  { id: "memory", icon: "🧠", title: "Memory", subtitle: "Remember moments", color: "#f59e0b" },
  { id: "character", icon: "🎭", title: "Character", subtitle: "5 characters", color: "#ec4899" },
  { id: "security", icon: "🛡️", title: "Security", subtitle: "PIN protection", color: "#10b981" },
  { id: "update", icon: "☁️", title: "Update", subtitle: "Always fresh", color: "#6366f1" },
  { id: "export", icon: "📤", title: "Export", subtitle: "Backup & restore", color: "#ef4444" },
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
    <div style={{ width: "100%", padding: "0 0 12px", boxSizing: "border-box" }}>

      {/* GREETING */}
      <section style={{ padding: "2px 2px 8px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
          <div style={{ minWidth: 0, flex: 1 }}>
            <h1
              style={{
                margin: 0,
                fontSize: "17px",
                lineHeight: 1.15,
                fontWeight: 850,
                letterSpacing: "-0.4px",
                background: "linear-gradient(90deg, #ff2997 0%, #a855f7 52%, #60a5fa 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              {greeting}
              {userName ? `, ${userName}` : ""}! 👋
            </h1>
            <p style={{ margin: "2px 0 0", color: "rgba(190,190,220,0.78)", fontSize: "10px", lineHeight: 1.3 }}>
              How are you feeling today?
            </p>
          </div>

          <div
            style={{
              width: "30px",
              height: "30px",
              borderRadius: "50%",
              display: "grid",
              placeItems: "center",
              flexShrink: 0,
              background: "linear-gradient(145deg, rgba(255,45,149,0.16), rgba(99,102,241,0.12))",
              border: "1px solid rgba(168,85,247,0.42)",
              color: "#c4b5fd",
              fontSize: "13px",
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
          minHeight: "135px",
          overflow: "hidden",
          borderRadius: "16px",
          marginBottom: "14px",
          border: "1px solid rgba(186,85,255,0.55)",
          background: "linear-gradient(115deg, #16091f 0%, #29103d 45%, #10132f 100%)",
          boxShadow: "0 0 20px rgba(255,45,149,0.16)",
        }}
      >
        {/* Pink glow */}
        <div
          style={{
            position: "absolute",
            width: "140px",
            height: "140px",
            borderRadius: "50%",
            left: "-60px",
            top: "-60px",
            background: "radial-gradient(circle, rgba(255,45,149,0.38), transparent 70%)",
            filter: "blur(4px)",
          }}
        />
        {/* Purple glow */}
        <div
          style={{
            position: "absolute",
            width: "160px",
            height: "160px",
            borderRadius: "50%",
            right: "-80px",
            bottom: "-80px",
            background: "radial-gradient(circle, rgba(99,102,241,0.42), transparent 70%)",
          }}
        />

        {/* Right side girl image */}
        <div
          style={{
            position: "absolute",
            right: 0,
            top: 0,
            width: "42%",
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
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(90deg, #16091f 0%, rgba(22,9,31,0.7) 40%, transparent 100%)",
            }}
          />
        </div>

        {/* Hero content */}
        <div
          style={{
            position: "relative",
            zIndex: 2,
            width: "62%",
            minHeight: "135px",
            padding: "10px 0 10px 12px",
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
              gap: "3px",
              padding: "3px 7px",
              borderRadius: "999px",
              marginBottom: "6px",
              fontSize: "8px",
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
              maxWidth: "150px",
              fontSize: "15px",
              lineHeight: 1.1,
              fontWeight: 900,
              letterSpacing: "-0.4px",
              color: "#fff",
            }}
          >
            Always here for you
          </h2>

          <p
            style={{
              margin: "4px 0 8px",
              maxWidth: "160px",
              fontSize: "9px",
              lineHeight: 1.4,
              color: "rgba(238,230,255,0.78)",
            }}
          >
            Your AI companion is ready to chat and be by your side.
          </p>

          <button
            type="button"
            onClick={() => onNavigate("chat")}
            style={{
              alignSelf: "flex-start",
              minHeight: "26px",
              padding: "0 11px",
              borderRadius: "9px",
              fontSize: "10px",
              fontWeight: 800,
              border: "none",
              color: "#fff",
              background: "linear-gradient(90deg, #ff2997 0%, #c83ee8 52%, #7655f5 100%)",
              boxShadow: "0 4px 14px rgba(255,45,149,0.30)",
              cursor: "pointer",
            }}
          >
            💬 Start Chatting
          </button>
        </div>
      </section>

      {/* ALL FEATURES */}
      <section>
        <div style={{ padding: "0 2px", marginBottom: "8px" }}>
          <h3 style={{ margin: 0, fontSize: "13px", fontWeight: 850, letterSpacing: "-0.2px", color: "#fff" }}>
            ✨ All Features
          </h3>
          <p style={{ margin: "2px 0 0", fontSize: "9px", color: "rgba(185,180,210,0.72)" }}>
            Everything you need in one place
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "6px" }}>
          {FEATURES.map((feature) => (
            <button
              key={feature.id}
              type="button"
              onClick={() => handleFeatureClick(feature.id)}
              style={{
                position: "relative",
                minWidth: 0,
                minHeight: "56px",
                padding: "7px 8px",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                textAlign: "left",
                borderRadius: "11px",
                border: `1px solid ${feature.color}55`,
                background: "linear-gradient(145deg, rgba(18,18,48,0.95), rgba(8,12,35,0.96))",
                boxShadow: `inset 0 0 14px ${feature.color}0d`,
                cursor: "pointer",
              }}
            >
              <div
                style={{
                  width: "28px",
                  height: "28px",
                  flexShrink: 0,
                  display: "grid",
                  placeItems: "center",
                  borderRadius: "8px",
                  fontSize: "13px",
                  background: `linear-gradient(145deg, ${feature.color}, ${feature.color}aa)`,
                  boxShadow: `0 0 12px ${feature.color}45`,
                }}
              >
                {feature.icon}
              </div>

              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontSize: "10px", lineHeight: 1.15, fontWeight: 800, color: "#fff", marginBottom: "2px" }}>
                  {feature.title}
                </div>
                <div style={{ fontSize: "7.5px", lineHeight: 1.25, color: "rgba(181,188,220,0.72)" }}>
                  {feature.subtitle}
                </div>
              </div>

              <div style={{ flexShrink: 0, color: "#a8b9ff", fontSize: "11px", opacity: 0.85 }}>›</div>
            </button>
          ))}
        </div>
      </section>

      {/* Footer */}
      <div style={{ textAlign: "center", marginTop: "12px", fontSize: "8px", color: "var(--muted)", opacity: 0.55 }}>
        Made with ❤️
      </div>
    </div>
  );
}
