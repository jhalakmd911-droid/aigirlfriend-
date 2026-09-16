"use client";

import { useState } from "react";
import HomePage from "@/components/pages/HomePage";
import ChatPage from "@/components/pages/ChatPage";
import VoicePage from "@/components/pages/VoicePage";
import UpdatePage from "@/components/pages/UpdatePage";

const navigationItems = [
  { id: "home", label: "Home", icon: "⌂" },
  { id: "chat", label: "Chat", icon: "♡" },
  { id: "voice", label: "Voice", icon: "◉" },
  { id: "update", label: "Update", icon: "✦" },
];

export default function Home() {
  const [activeTab, setActiveTab] = useState("home");

  const renderPage = () => {
    switch (activeTab) {
      case "chat":
        return <ChatPage />;
      case "voice":
        return <VoicePage />;
      case "update":
        return <UpdatePage />;
      default:
        return <HomePage onNavigate={setActiveTab} />;
    }
  };

  return (
    <main className="mobile-shell">
      <div className="container">
        {renderPage()}

        <nav
          aria-label="Main navigation"
          className="glass"
          style={{
            position: "fixed",
            bottom: "12px",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 20,
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "4px",
            padding: "7px",
            borderRadius: "20px",
            width: "calc(100% - 32px)",
            maxWidth: "calc(min(100% - 32px, 1180px))",
          }}
        >
          {navigationItems.map((item) => {
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                style={{
                  minHeight: "58px",
                  borderRadius: "15px",
                  background: isActive
                    ? "linear-gradient(135deg, #FF4F9A, #8B5CF6)"
                    : "transparent",
                  color: isActive ? "#ffffff" : "var(--muted)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "3px",
                  transition: "all 0.2s ease",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "inherit",
                }}
              >
                <span style={{ fontSize: "20px" }}>{item.icon}</span>
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

        {/* Safe space for bottom navigation */}
        <div style={{ height: "90px" }} />
      </div>
    </main>
  );
}
