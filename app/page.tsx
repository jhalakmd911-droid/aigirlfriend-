"use client";

import { useState } from "react";

const navigationItems = [
  { id: "home", label: "Home", icon: "⌂" },
  { id: "chat", label: "Chat", icon: "♡" },
  { id: "voice", label: "Voice", icon: "◉" },
  { id: "update", label: "Updates", icon: "✦" },
];

export default function Home() {
  const [activeTab, setActiveTab] = useState("home");

  return (
    <main className="mobile-shell">
      <div className="container">
        <header
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "24px 0",
          }}
        >
          <div>
            <div
              className="gradient-text"
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "24px",
                fontWeight: 700,
              }}
            >
              AI Girlfriend
            </div>

            <p style={{ marginTop: "4px", fontSize: "14px" }}>
              Your AI companion
            </p>
          </div>

          <div
            style={{
              width: "46px",
              height: "46px",
              borderRadius: "50%",
              display: "grid",
              placeItems: "center",
              background:
                "linear-gradient(135deg, #FF4F9A, #8B5CF6)",
              color: "#ffffff",
              fontSize: "22px",
            }}
          >
            ♡
          </div>
        </header>

        <section
          className="card"
          style={{
            padding: "28px 22px",
            marginTop: "10px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: "108px",
              height: "108px",
              margin: "0 auto 20px",
              borderRadius: "32px",
              display: "grid",
              placeItems: "center",
              background:
                "linear-gradient(135deg, #FF4F9A, #8B5CF6)",
              color: "#ffffff",
              fontSize: "54px",
            }}
          >
            ♡
          </div>

          <h1 style={{ fontSize: "30px" }}>
            Meet your AI companion
          </h1>

          <p
            style={{
              marginTop: "12px",
              fontSize: "15px",
            }}
          >
            Chat, talk, and spend time with a friendly AI companion
            designed to feel natural and personal.
          </p>

          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setActiveTab("chat")}
            style={{
              marginTop: "24px",
              width: "100%",
              maxWidth: "320px",
            }}
          >
            Start chatting
          </button>
        </section>

        <section
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(2, minmax(0, 1fr))",
            gap: "12px",
            marginTop: "16px",
          }}
        >
          <button
            type="button"
            className="card"
            onClick={() => setActiveTab("chat")}
            style={{
              padding: "20px 16px",
              textAlign: "left",
              color: "var(--foreground)",
            }}
          >
            <div
              style={{
                fontSize: "28px",
                marginBottom: "8px",
              }}
            >
              ♡
            </div>

            <strong>Chat</strong>

            <p
              style={{
                fontSize: "13px",
                marginTop: "4px",
              }}
            >
              Have a conversation
            </p>
          </button>

          <button
            type="button"
            className="card"
            onClick={() => setActiveTab("voice")}
            style={{
              padding: "20px 16px",
              textAlign: "left",
              color: "var(--foreground)",
            }}
          >
            <div
              style={{
                fontSize: "28px",
                marginBottom: "8px",
              }}
            >
              ◉
            </div>

            <strong>Voice</strong>

            <p
              style={{
                fontSize: "13px",
                marginTop: "4px",
              }}
            >
              Talk naturally
            </p>
          </button>
        </section>

        <section
          className="card"
          style={{
            marginTop: "16px",
            padding: "20px",
          }}
        >
          <h2 style={{ fontSize: "20px" }}>
            Your companion
          </h2>

          <p
            style={{
              marginTop: "8px",
              fontSize: "14px",
            }}
          >
            Your conversations and preferences can become
            more personal as the app grows.
          </p>
        </section>

        <nav
          aria-label="Main navigation"
          className="glass"
          style={{
            position: "sticky",
            bottom: "16px",
            zIndex: 20,
            display: "grid",
            gridTemplateColumns:
              "repeat(4, 1fr)",
            gap: "4px",
            marginTop: "24px",
            padding: "8px",
            borderRadius: "20px",
          }}
        >
          {navigationItems.map((item) => {
            const isActive =
              activeTab === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() =>
                  setActiveTab(item.id)
                }
                style={{
                  minHeight: "58px",
                  borderRadius: "14px",
                  background: isActive
                    ? "linear-gradient(135deg, #FF4F9A, #8B5CF6)"
                    : "transparent",
                  color: isActive
                    ? "#ffffff"
                    : "var(--muted)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "3px",
                }}
              >
                <span
                  style={{
                    fontSize: "20px",
                  }}
                >
                  {item.icon}
                </span>

                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: 600,
                  }}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>
      </div>
    </main>
  );
}
