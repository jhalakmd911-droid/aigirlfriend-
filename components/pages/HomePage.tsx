"use client";

import { useState, useEffect } from "react";

interface HomePageProps {
  onNavigate: (tab: string) => void;
  onOpenProfile: (characterId: string) => void;
}

const FEATURES = [
  {
    id: "chat",
    icon: "💬",
    title: "AI Chat",
    subtitle: "Chat with your companion",
    color: "#FF2D95",
  },
  {
    id: "voice",
    icon: "🎙️",
    title: "Voice Call",
    subtitle: "Real-time voice chat",
    color: "#8B5CF6",
  },
  {
    id: "photos",
    icon: "🖼️",
    title: "Photo Exchange",
    subtitle: "Share & view photos",
    color: "#22D3EE",
  },
  {
    id: "memory",
    icon: "🧠",
    title: "Memory System",
    subtitle: "Remember your moments",
    color: "#F59E0B",
  },
  {
    id: "character",
    icon: "🎭",
    title: "Character System",
    subtitle: "5 unique characters",
    color: "#EC4899",
  },
  {
    id: "security",
    icon: "🛡️",
    title: "Security",
    subtitle: "PIN protection & privacy",
    color: "#10B981",
  },
  {
    id: "update",
    icon: "⬆️",
    title: "Update System",
    subtitle: "Always up-to-date",
    color: "#6366F1",
  },
  {
    id: "export",
    icon: "📤",
    title: "Export / Import",
    subtitle: "Backup & restore data",
    color: "#EF4444",
  },
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
        padding: "10px 0 28px",
        maxWidth: "760px",
        margin: "0 auto",
      }}
    >
      {/* 4 + 5: Greeting spacing and typography */}
      <div
        style={{
          marginBottom: "20px",
          padding: "2px 2px 0",
        }}
      >
        <h1
          className="gradient-text"
          style={{
            fontSize: "29px",
            fontWeight: 800,
            lineHeight: 1.15,
            margin: "0 0 7px",
            letterSpacing: "-0.8px",
          }}
        >
          {greeting}
          {userName ? `, ${userName}` : ""}! 👋
        </h1>

        <p
          style={{
            fontSize: "13px",
            lineHeight: 1.4,
            color: "var(--muted)",
            margin: 0,
          }}
        >
          How are you feeling today?
        </p>
      </div>

      {/* 1 + 2 + 3: Hero card radius, border and shadow */}
      <section
        className="card"
        style={{
          padding: "0",
          marginBottom: "25px",
          position: "relative",
          overflow: "hidden",
          minHeight: "200px",
          borderRadius: "22px",
          border: "1px solid rgba(255,255,255,0.10)",
          boxShadow:
            "0 14px 38px rgba(0,0,0,0.20), 0 0 28px rgba(255,45,149,0.08)",
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
          {/* 6: Companion badge */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              background: "rgba(0,0,0,0.30)",
              border: "1px solid rgba(255,255,255,0.16)",
              borderRadius: "999px",
              padding: "6px 13px",
              fontSize: "11px",
              fontWeight: 700,
              color: "#fff",
              marginBottom: "13px",
              alignSelf: "flex-start",
              backdropFilter: "blur(10px)",
              WebkitBackdropFilter: "blur(10px)",
            }}
          >
            ❤️ Your AI Companion
          </div>

          {/* 7: Hero heading typography */}
          <h2
            style={{
              fontSize: "23px",
              fontWeight: 800,
              color: "#fff",
              margin: "0 0 8px",
              lineHeight: 1.2,
              letterSpacing: "-0.4px",
              maxWidth: "300px",
            }}
          >
            Always here for you
          </h2>

          <p
            style={{
              fontSize: "13px",
              color: "rgba(255,255,255,0.86)",
              lineHeight: 1.55,
              margin: "0 0 19px",
              maxWidth: "300px",
            }}
          >
            Your perfect AI companion is ready to chat, listen, and be by your
            side.
          </p>

          {/* 8: Chat button refinement */}
          <button
            onClick={() => onNavigate("chat")}
            className="btn btn-primary"
            style={{
              alignSelf: "flex-start",
              padding: "12px 27px",
              minHeight: "44px",
              borderRadius: "14px",
              fontSize: "14px",
              fontWeight: 700,
              transition: "transform 0.18s ease, box-shadow 0.18s ease",
              boxShadow: "0 8px 24px rgba(255,45,149,0.24)",
            }}
          >
            💬 Start Chatting
          </button>
        </div>
      </section>

      {/* 9: Features heading */}
      <div
        style={{
          marginBottom: "14px",
          padding: "0 2px",
        }}
      >
        <h3
          style={{
            fontSize: "17px",
            fontWeight: 800,
            color: "#fff",
            margin: "0 0 5px",
            letterSpacing: "-0.2px",
          }}
        >
          ✨ All Features
        </h3>

        <p
          style={{
            fontSize: "12px",
            color: "var(--muted)",
            margin: 0,
            lineHeight: 1.4,
          }}
        >
          Everything you need in one place
        </p>
      </div>

      {/* 10 + 11 + 12 + 13: Feature cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
          gap: "11px",
        }}
      >
        {FEATURES.map((f) => (
          <button
            key={f.id}
            onClick={() => handleFeatureClick(f.id)}
            className="card"
            style={{
              padding: "14px",
              minWidth: 0,
              minHeight: "106px",
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              justifyContent: "flex-start",
              gap: "9px",
              textAlign: "left",
              cursor: "pointer",
              background:
                "linear-gradient(145deg, rgba(255,255,255,0.055), rgba(255,255,255,0.025))",
              border: "1px solid rgba(255,255,255,0.09)",
              borderRadius: "17px",
              boxShadow: "0 7px 22px rgba(0,0,0,0.13)",
              transition:
                "transform 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease",
            }}
          >
            {/* 11: Icon container */}
            <div
              style={{
                width: "42px",
                height: "42px",
                borderRadius: "13px",
                background: `linear-gradient(135deg, ${f.color}, ${f.color}88)`,
                display: "grid",
                placeItems: "center",
                fontSize: "19px",
                flexShrink: 0,
                boxShadow: `0 6px 18px ${f.color}45`,
              }}
            >
              {f.icon}
            </div>

            <div
              style={{
                minWidth: 0,
                width: "100%",
              }}
            >
              <h4
                style={{
                  fontSize: "13px",
                  fontWeight: 700,
                  color: "#fff",
                  margin: "0 0 3px",
                  lineHeight: 1.25,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {f.title}
              </h4>

              <p
                style={{
                  fontSize: "10px",
                  color: "var(--muted)",
                  lineHeight: 1.35,
                  margin: 0,
                }}
              >
                {f.subtitle}
              </p>
            </div>
          </button>
        ))}
      </div>

      {/* 14 + 16: Footer spacing and final polish */}
      <div
        style={{
          textAlign: "center",
          marginTop: "30px",
          paddingTop: "3px",
          fontSize: "10px",
          color: "var(--muted)",
          opacity: 0.65,
        }}
      >
        Made with ❤️
      </div>
    </div>
  );
}
