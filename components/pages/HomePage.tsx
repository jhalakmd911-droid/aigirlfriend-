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
    color: "#ff2d95",
  },
  {
    id: "voice",
    icon: "🎙️",
    title: "Voice Call",
    subtitle: "Real-time voice chat",
    color: "#8b5cf6",
  },
  {
    id: "photos",
    icon: "🖼️",
    title: "Photo Exchange",
    subtitle: "Share & view photos",
    color: "#22d3ee",
  },
  {
    id: "memory",
    icon: "🧠",
    title: "Memory System",
    subtitle: "Remember your moments",
    color: "#f59e0b",
  },
  {
    id: "character",
    icon: "🎭",
    title: "Character System",
    subtitle: "5 unique characters",
    color: "#ec4899",
  },
  {
    id: "security",
    icon: "🛡️",
    title: "Security",
    subtitle: "PIN protection & privacy",
    color: "#10b981",
  },
  {
    id: "update",
    icon: "☁️",
    title: "Update System",
    subtitle: "Always up-to-date",
    color: "#6366f1",
  },
  {
    id: "export",
    icon: "📤",
    title: "Export / Import",
    subtitle: "Backup & restore data",
    color: "#ef4444",
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

    if (hour < 12) {
      setGreeting("Good morning");
    } else if (hour < 17) {
      setGreeting("Good afternoon");
    } else if (hour < 21) {
      setGreeting("Good evening");
    } else {
      setGreeting("Good night");
    }
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
        width: "100%",
        padding: "8px 0 28px",
        boxSizing: "border-box",
      }}
    >
      {/* =========================
          GREETING
      ========================== */}
      <section
        style={{
          padding: "8px 4px 18px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "12px",
          }}
        >
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: "28px",
                lineHeight: 1.15,
                fontWeight: 850,
                letterSpacing: "-0.8px",
                background:
                  "linear-gradient(90deg, #ff2997 0%, #a855f7 52%, #60a5fa 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              {greeting}
              {userName ? `, ${userName}` : ""}! 👋
            </h1>

            <p
              style={{
                margin: "7px 0 0",
                color: "rgba(190,190,220,0.78)",
                fontSize: "13px",
                lineHeight: 1.4,
              }}
            >
              How are you feeling today?
            </p>
          </div>

          <div
            style={{
              width: "42px",
              height: "42px",
              borderRadius: "50%",
              display: "grid",
              placeItems: "center",
              flexShrink: 0,
              background:
                "linear-gradient(145deg, rgba(255,45,149,0.16), rgba(99,102,241,0.12))",
              border: "1px solid rgba(168,85,247,0.42)",
              boxShadow: "0 0 20px rgba(168,85,247,0.15)",
              color: "#c4b5fd",
              fontSize: "19px",
            }}
          >
            ♡
          </div>
        </div>
      </section>

      {/* =========================
          HERO
      ========================== */}
      <section
        style={{
          position: "relative",
          minHeight: "255px",
          overflow: "hidden",
          borderRadius: "25px",
          marginBottom: "27px",
          border: "1px solid rgba(186,85,255,0.65)",
          background:
            "linear-gradient(115deg, #16091f 0%, #29103d 45%, #10132f 100%)",
          boxShadow:
            "0 0 25px rgba(255,45,149,0.18), inset 0 0 35px rgba(99,102,241,0.10)",
        }}
      >
        {/* Pink glow */}
        <div
          style={{
            position: "absolute",
            width: "250px",
            height: "250px",
            borderRadius: "50%",
            left: "-100px",
            top: "-80px",
            background:
              "radial-gradient(circle, rgba(255,45,149,0.38), transparent 70%)",
            filter: "blur(4px)",
          }}
        />

        {/* Purple glow */}
        <div
          style={{
            position: "absolute",
            width: "280px",
            height: "280px",
            borderRadius: "50%",
            right: "-120px",
            bottom: "-130px",
            background:
              "radial-gradient(circle, rgba(99,102,241,0.42), transparent 70%)",
          }}
        />

        {/* Character-style visual.
            No external image/API/path is used here. */}
        <div
          style={{
            position: "absolute",
            right: "-12px",
            top: "0",
            width: "48%",
            height: "100%",
            overflow: "hidden",
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              position: "absolute",
              width: "210px",
              height: "270px",
              right: "-35px",
              top: "-12px",
              borderRadius: "48% 48% 0 0",
              background:
                "radial-gradient(circle at 48% 27%, #f4c5b5 0 12%, transparent 12.5%), radial-gradient(circle at 39% 27%, #17203e 0 2%, transparent 2.8%), radial-gradient(circle at 58% 27%, #17203e 0 2%, transparent 2.8%), radial-gradient(circle at 49% 34%, #d98d9b 0 1.5%, transparent 2%), linear-gradient(145deg, #100a1d 12%, #2c143b 40%, #171b48 75%, #0c1028 100%)",
              boxShadow:
                "inset 30px 0 50px rgba(255,45,149,0.10), -20px 0 60px rgba(168,85,247,0.20)",
              opacity: 0.95,
              transform: "rotate(-3deg)",
            }}
          />

          <div
            style={{
              position: "absolute",
              width: "150px",
              height: "180px",
              right: "15px",
              bottom: "-45px",
              borderRadius: "50% 50% 0 0",
              background:
                "linear-gradient(145deg, rgba(255,160,180,0.52), rgba(119,62,105,0.28))",
              filter: "blur(1px)",
            }}
          />

          <div
            style={{
              position: "absolute",
              right: "70px",
              top: "38px",
              width: "72px",
              height: "18px",
              borderRadius: "50%",
              background: "rgba(255,255,255,0.18)",
              filter: "blur(12px)",
            }}
          />
        </div>

        {/* Hero content */}
        <div
          style={{
            position: "relative",
            zIndex: 2,
            width: "58%",
            minHeight: "255px",
            padding: "23px 0 23px 21px",
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
              gap: "6px",
              padding: "7px 12px",
              borderRadius: "999px",
              marginBottom: "13px",
              fontSize: "10px",
              fontWeight: 750,
              color: "#fff",
              background: "rgba(30,8,42,0.65)",
              border: "1px solid rgba(255,77,185,0.52)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
            }}
          >
            ❤️ Your AI Companion
          </div>

          <h2
            style={{
              margin: 0,
              maxWidth: "250px",
              fontSize: "25px",
              lineHeight: 1.08,
              fontWeight: 900,
              letterSpacing: "-0.8px",
              color: "#fff",
            }}
          >
            Always here for you
          </h2>

          <p
            style={{
              margin: "10px 0 17px",
              maxWidth: "255px",
              fontSize: "11px",
              lineHeight: 1.55,
              color: "rgba(238,230,255,0.78)",
            }}
          >
            Your perfect AI companion is ready to chat, listen, and be by your
            side.
          </p>

          <button
            type="button"
            onClick={() => onNavigate("chat")}
            className="btn btn-primary"
            style={{
              alignSelf: "flex-start",
              minHeight: "43px",
              padding: "0 20px",
              borderRadius: "13px",
              fontSize: "13px",
              fontWeight: 800,
              border: "none",
              background:
                "linear-gradient(90deg, #ff2997 0%, #c83ee8 52%, #7655f5 100%)",
              boxShadow:
                "0 8px 25px rgba(255,45,149,0.30), 0 0 18px rgba(168,85,247,0.18)",
            }}
          >
            💬 Start Chatting
          </button>
        </div>
      </section>

      {/* =========================
          ALL FEATURES
      ========================== */}
      <section>
        <div
          style={{
            padding: "0 3px",
            marginBottom: "14px",
          }}
        >
          <h3
            style={{
              margin: 0,
              fontSize: "19px",
              fontWeight: 850,
              letterSpacing: "-0.4px",
              color: "#fff",
            }}
          >
            ✨ All Features
          </h3>

          <p
            style={{
              margin: "5px 0 0",
              fontSize: "11px",
              color: "rgba(185,180,210,0.72)",
            }}
          >
            Everything you need in one place
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
            gap: "10px",
          }}
        >
          {FEATURES.map((feature) => (
            <button
              key={feature.id}
              type="button"
              onClick={() => handleFeatureClick(feature.id)}
              className="card"
              style={{
                position: "relative",
                minWidth: 0,
                minHeight: "104px",
                padding: "13px",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                textAlign: "left",
                borderRadius: "17px",
                border: `1px solid ${feature.color}55`,
                background:
                  "linear-gradient(145deg, rgba(18,18,48,0.95), rgba(8,12,35,0.96))",
                boxShadow: `inset 0 0 22px ${feature.color}0d, 0 7px 22px rgba(0,0,0,0.18)`,
                cursor: "pointer",
              }}
            >
              {/* Icon */}
              <div
                style={{
                  width: "43px",
                  height: "43px",
                  flexShrink: 0,
                  display: "grid",
                  placeItems: "center",
                  borderRadius: "13px",
                  fontSize: "20px",
                  background: `linear-gradient(145deg, ${feature.color}, ${feature.color}aa)`,
                  boxShadow: `0 0 20px ${feature.color}45`,
                }}
              >
                {feature.icon}
              </div>

              <div
                style={{
                  minWidth: 0,
                  flex: 1,
                }}
              >
                <div
                  style={{
                    fontSize: "12px",
                    lineHeight: 1.2,
                    fontWeight: 800,
                    color: "#fff",
                    marginBottom: "5px",
                  }}
                >
                  {feature.title}
                </div>

                <div
                  style={{
                    fontSize: "9px",
                    lineHeight: 1.35,
                    color: "rgba(181,188,220,0.72)",
                  }}
                >
                  {feature.subtitle}
                </div>
              </div>

              <div
                style={{
                  flexShrink: 0,
                  color: "#a8b9ff",
                  fontSize: "18px",
                  opacity: 0.85,
                }}
              >
                ›
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Footer */}
      <div
        style={{
          textAlign: "center",
          marginTop: "28px",
          fontSize: "10px",
          color: "var(--muted)",
          opacity: 0.6,
        }}
      >
        Made with ❤️
      </div>
    </div>
  );
}
