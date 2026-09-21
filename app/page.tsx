"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import HomePage from "@/components/pages/HomePage";
import ChatPage from "@/components/pages/ChatPage";
import VoicePage from "@/components/pages/VoicePage";
import UpdatePage from "@/components/pages/UpdatePage";
import SecurityPage from "@/components/pages/SecurityPage";
import ProfilePage from "@/components/pages/ProfilePage";

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
      case "chat": return <ChatPage />;
      case "voice": return <VoicePage />;
      case "security": return <SecurityPage />;
      case "update": return <UpdatePage />;
      // পরবর্তী ধাপে আমরা Photos, Memory এবং Settings পেজ বানাব
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
    </div>
  );
}
