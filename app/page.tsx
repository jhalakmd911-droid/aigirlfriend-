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

const mobileNavItems = [
  { id: "chat", label: "Chat", icon: "♡" },
  { id: "voice", label: "Voice", icon: "◉" },
  { id: "photos", label: "Photos", icon: "🖼️" },
  { id: "memory", label: "Memory", icon: "🧠" },
  { id: "security", label: "Security", icon: "🛡️" },
];

export default function Home() {
  // অ্যাপের স্টেট: onboarding -> characterSelect -> main
  const [appState, setAppState] = useState<"onboarding" | "characterSelect" | "main">("onboarding");
  const [activeTab, setActiveTab] = useState("home");
  const [profileChar, setProfileChar] = useState<string | null>(null);

  const handleNavigate = (tab: string, characterId?: string) => {
    setActiveTab(tab);
  };

  // ১. Onboarding Screen
  if (appState === "onboarding") {
    return <OnboardingPage onGetStarted={() => setAppState("characterSelect")} />;
  }

  // ২. Character Selection Screen
  if (appState === "characterSelect") {
    return (
      <CharacterSelectPage 
        onSelect={(charId) => {
          setProfileChar(charId); // সিলেক্ট করা ক্যারেক্টারকে প্রোফাইলে সেট করা
          setActiveTab("chat");   // চ্যাট ট্যাবে নিয়ে যাওয়া
          setAppState("main");    // মূল অ্যাপে প্রবেশ
        }} 
      />
    );
  }

  // ৩. Main App Screen
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
