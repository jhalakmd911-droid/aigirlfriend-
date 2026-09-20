"use client";

import { useState } from "react";
import HomePage from "@/components/pages/HomePage";
import ChatPage from "@/components/pages/ChatPage";
import VoicePage from "@/components/pages/VoicePage";
import UpdatePage from "@/components/pages/UpdatePage";
import SecurityPage from "@/components/pages/SecurityPage";
import ProfilePage from "@/components/pages/ProfilePage";

const navigationItems = [
  { id: "home", label: "Home", icon: "⌂" },
  { id: "chat", label: "Chat", icon: "♡" },
  { id: "voice", label: "Voice", icon: "◉" },
  { id: "security", label: "Security", icon: "🛡️" },
  { id: "update", label: "Update", icon: "✦" },
];

export default function Home() {
  const [activeTab, setActiveTab] = useState("home");
  const [profileChar, setProfileChar] = useState<string | null>(null);

  const handleNavigate = (tab: string, characterId?: string) => {
    setActiveTab(tab);
  };

  const renderPage = () => {
    if (profileChar) {
      return (
        <ProfilePage
          characterId={profileChar}
          onNavigate={(tab, charId) => {
            setProfileChar(null);
            handleNavigate(tab, charId);
          }}
          onBack={() => setProfileChar(null)}
        />
      );
    }

    switch (activeTab) {
      case "chat":
        return <ChatPage />;
      case "voice":
        return <VoicePage />;
      case "security":
        return <SecurityPage />;
      case "update":
        return <UpdatePage />;
      default:
        return (
          <HomePage
            onNavigate={handleNavigate}
            onOpenProfile={setProfileChar}
          />
        );
    }
  };

  return (
    <main className="mobile-shell">
      <div className="container">
        {renderPage()}

        {/* নতুন গ্লোয়িং বটম নেভিগেশন বার */}
        <nav aria-label="Main navigation" className="bottom-nav">
          {navigationItems.map((item) => {
            const isActive = activeTab === item.id && !profileChar;

            return (
              <button
                key={item.id}
                type="button"
                className={isActive ? "active" : ""}
                onClick={() => {
                  setProfileChar(null);
                  setActiveTab(item.id);
                }}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* নেভিগেশন বারের জন্য নিচে একটু জায়গা খালি রাখা */}
        <div style={{ height: "100px" }} />
      </div>
    </main>
  );
}
