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
            background: "rgba(20, 12, 40, 0.85)",
            backdropFilter: "blur(22px)",
            WebkitBackdropFilter: "blur(22px)",
            border: "1px solid rgba(139, 92, 246, 0.35)",
            boxShadow: "0 0 30px rgba(255, 45, 149, 0.25)",
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
                    ? "linear-gradient(135deg, #FF2D95, #8B5CF6)"
                    : "transparent",
                  color: isActive ? "#ffffff" : "#9d94b8",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "3px",
                  transition: "all 0.2s ease",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "inherit",
                  boxShadow: isActive
                    ? "0 0 20px rgba(255, 45, 149, 0.55)"
                    : "none",
                }}
              >
                <span style={{ fontSize: "20px" }}>{item.icon}</span>
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: 700,
                  }}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>

        <div style={{ height: "90px" }} />
      </div>
    </main>
  );
}
