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

export default function HomePage({
  onNavigate,
  onOpenProfile,
}: HomePageProps) {
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
    <div
      style={{
        padding: "8px 0 24px",
        maxWidth: "760px",
        margin: "0 auto",
      }}
    >
      {/* Greeting */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "20px",
        }}
      >
        <div>
          <p
            style={{
              margin: "0 0 5px",
              fontSize: "12px",
              color: "var(--muted)",
              letterSpacing: "0.4px",
            }}
          >
            Welcome back
          </p>

          <h1
            className="gradient-text"
            style={{
              margin: 0,
              fontSize: "27px",
              lineHeight: 1.15,
              fontWeight: 800,
              letterSpacing: "-0.7px",
            }}
          >
            {greeting}
            {userName ? `, ${userName}` : ""}!
          </h1>
        </div>

        <div
          style={{
            width: "42px",
            height: "42px",
            borderRadius: "50%",
            display: "grid",
            placeItems: "center",
            background:
              "linear-gradient(135deg, rgba(255,45,149,0.25), rgba(139,92,246,0.3))",
            border: "1px solid rgba(255,255,255,0.12)",
            boxShadow: "0 8px 25px rgba(139,92,246,0.18)",
            fontSize: "19px",
          }}
        >
          ❤️
        </div>
      </div>

      <p
        style={{
          margin: "-9px 0 20px",
          fontSize: "13px",
          color: "var(--muted)",
        }}
      >
        How are you feeling today?
      </p>

      {/* AI Companion Hero */}
      <section
        className="card"
        style={{
          position: "relative",
          overflow: "hidden",
          padding: 0,
          minHeight: "285px",
          marginBottom: "24px",
          borderRadius: "24px",
          border: "1px solid rgba(255,255,255,0.10)",
          background:
            "linear-gradient(145deg, rgba(255,45,149,0.18), rgba(139,92,246,0.16) 48%, rgba(15,15,25,0.95) 100%)",
          boxShadow:
            "0 18px 50px rgba(0,0,0,0.28), 0 0 45px rgba(255,45,149,0.08)",
        }}
      >
        <div
          style={{
            position: "absolute",
            width: "240px",
            height: "240px",
            borderRadius: "50%",
            right: "-85px",
            top: "-80px",
            background:
              "radial-gradient(circle, rgba(255,45,149,0.30), transparent 68%)",
            pointerEvents: "none",
          }}
        />

        <div
          style={{
            position: "absolute",
            width: "200px",
            height: "200px",
            borderRadius: "50%",
            left: "-100px",
            bottom: "-120px",
            background:
              "radial-gradient(circle, rgba(139,92,246,0.24), transparent 70%)",
            pointerEvents: "none",
          }}
        />

        <div
          style={{
            position: "relative",
            zIndex: 1,
            padding: "22px 20px",
            minHeight: "285px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          {/* Companion Visual */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginBottom: "10px",
            }}
          >
            <div
              style={{
                width: "94px",
                height: "94px",
                borderRadius: "50%",
                display: "grid",
                placeItems: "center",
                position: "relative",
                background:
                  "linear-gradient(145deg, rgba(255,45,149,0.9), rgba(139,92,246,0.95))",
                boxShadow:
                  "0 0 0 7px rgba(255,255,255,0.05), 0 12px 40px rgba(255,45,149,0.30)",
                fontSize: "43px",
              }}
            >
              💗

              <span
                style={{
                  position: "absolute",
                  right: "2px",
                  bottom: "5px",
                  width: "16px",
                  height: "16px",
                  borderRadius: "50%",
                  background: "#22c55e",
                  border: "3px solid #15131f",
                  boxShadow: "0 0 12px rgba(34,197,94,0.7)",
                }}
              />
            </div>
          </div>

          <div style={{ textAlign: "center" }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "5px 11px",
                borderRadius: "999px",
                background: "rgba(0,0,0,0.28)",
                border: "1px solid rgba(255,255,255,0.10)",
                color: "rgba(255,255,255,0.88)",
                fontSize: "10px",
                fontWeight: 700,
                letterSpacing: "0.3px",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
              }}
            >
              <span>●</span>
              AI COMPANION
            </div>

            <h2
              style={{
                margin: "11px 0 5px",
                fontSize: "23px",
                lineHeight: 1.2,
                fontWeight: 800,
                color: "#fff",
                letterSpacing: "-0.4px",
              }}
            >
              Always here for you
            </h2>

            <p
              style={{
                margin: 0,
                fontSize: "12px",
                lineHeight: 1.5,
