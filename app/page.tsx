"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import OnboardingPage from "@/components/pages/OnboardingPage";
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
  const [showOnboarding, setShowOnboarding] = useState(true); // শুরুতে Onboarding দেখাবে
  const [activeTab, setActiveTab] = useState("home");
  const [profileChar, setProfileChar] = useState<string | null>(null);

  const handleNavigate = (tab: string, characterId?: string) => {
    setActiveTab(tab);
  };

  // যদি Onboarding শেষ না হয়, শুধু Onboarding দেখাবে
  if (showOnboarding) {
    return <OnboardingPage onGetStarted={() => setShowOnboarding(false)} />;
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
      {/* বড় স্ক্রিনের জন্য সাইডবার */}
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      
      {/* মূল কনটেন্ট */}
      <main className="main-content">
        {renderPage()}
      </main>

      {/* মোবাইলের জন্য নিচের নেভিগেশন বার */}
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
