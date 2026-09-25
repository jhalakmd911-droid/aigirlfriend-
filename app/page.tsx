"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import OnboardingPage from "@/components/pages/OnboardingPage";
import CharacterSelectPage from "@/components/pages/CharacterSelectPage";
import HomePage from "@/components/pages/HomePage";
import ChatPage from "@/components/pages/ChatPage";
import VoicePage from "@/components/pages/VoicePage";
import UpdatePage from "@/components/pages/UpdatePage";
import SecurityPage from "@/components/pages/SecurityPage";
import ProfilePage from "@/components/pages/ProfilePage";
import PhotosPage from "@/components/pages/PhotosPage";
import MemoryPage from "@/components/pages/MemoryPage";
import SettingsPage from "@/components/pages/SettingsPage";

const mobileNavItems = [
  { id: "chat", label: "Chat", icon: "♡" },
  { id: "voice", label: "Voice", icon: "◉" },
  { id: "photos", label: "Photos", icon: "🖼️" },
  { id: "memory", label: "Memory", icon: "🧠" },
  { id: "settings", label: "Settings", icon: "⚙️" },
];

export default function Home() {
  const [appState, setAppState] = useState<"onboarding" | "characterSelect" | "main">("onboarding");
  const [activeTab, setActiveTab] = useState("home");
  const [profileChar, setProfileChar] = useState<string | null>(null);

  const handleNavigate = (tab: string, characterId?: string) => {
    setActiveTab(tab);
  };

  if (appState === "onboarding") {
    return <OnboardingPage onGetStarted={() => setAppState("characterSelect")} />;
  }

  if (appState === "characterSelect") {
    return (
      <CharacterSelectPage
        onSelect={(charId) => {
          setProfileChar(null);
          setActiveTab("home");
          setAppState("main");
        }}
      />
    );
  }

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
      case "chat": return <ChatPage />;
      case "voice": return <VoicePage />;
      case "security": return <SecurityPage />;
      case "update": return <UpdatePage />;
      case "photos": return <PhotosPage />;
      case "memory": return <MemoryPage />;
      case "settings": return <SettingsPage onNavigate={handleNavigate} />;
      case "profile":
        // Profile ট্যাব নেই, তবে ভবিষ্যতে দরকার হলে ব্যবহার হবে
        return <HomePage onNavigate={handleNavigate} onOpenProfile={setProfileChar} />;
      case "home":
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
    <div className="app-layout">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="main-content">
        {renderPage()}
      </main>

      <nav className="mobile-bottom-nav">
        {mobileNavItems.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              setProfileChar(null);
              setActiveTab(item.id);
            }}
            className={`mobile-nav-item ${activeTab === item.id ? "active" : ""}`}
          >
            <span className="mobile-nav-icon">{item.icon}</span>
            <span className="mobile-nav-label">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
