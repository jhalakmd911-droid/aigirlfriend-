"use client";

import {
  Bell,
  Search,
  ArrowRight,
  MessageCircle,
  Mic,
  Image as ImageIcon,
  Brain,
  Shield,
  CloudUpload,
  Upload,
  Sparkles,
  Heart,
} from "lucide-react";

interface HomePageProps {
  onNavigate: (tab: string) => void;
  onOpenProfile: (characterId: string) => void;
}

const FEATURES = [
  {
    id: "chat",
    icon: MessageCircle,
    title: "AI Chat",
    subtitle: "Chat with your companion",
    color: "#ff2d95",
  },
  {
    id: "voice",
    icon: Mic,
    title: "Voice Call",
    subtitle: "Real-time voice chat",
    color: "#8b5cf6",
  },
  {
    id: "photos",
    icon: ImageIcon,
    title: "Photo Exchange",
    subtitle: "Share & view photos",
    color: "#22d3ee",
  },
  {
    id: "memory",
    icon: Brain,
    title: "Memory System",
    subtitle: "Remember your moments",
    color: "#f59e0b",
  },
  {
    id: "character",
    icon: Sparkles,
    title: "Character System",
    subtitle: "5 unique characters",
    color: "#ec4899",
  },
  {
    id: "security",
    icon: Shield,
    title: "Security",
    subtitle: "PIN protection & privacy",
    color: "#10b981",
  },
  {
    id: "update",
    icon: CloudUpload,
    title: "Update System",
    subtitle: "Always up-to-date",
    color: "#6366f1",
  },
  {
    id: "export",
    icon: Upload,
    title: "Export / Import",
    subtitle: "Backup & restore data",
    color: "#ef4444",
  },
];

export default function HomePage({
  onNavigate,
}: HomePageProps) {
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
    <main className="home-page">

      {/* HEADER */}

      <section className="home-header">

        <div>
          <h1 className="greeting">
            <span className="heart-glow">♥</span>
            Good morning!
            <span className="wave">👋</span>
          </h1>

          <p className="greeting-subtitle">
            How are you feeling today?
          </p>
        </div>

        <div className="header-actions">

          <button
            type="button"
            className="header-icon"
            aria-label="Search"
          >
            <Search size={24} />
          </button>

          <button
            type="button"
            className="header-icon"
            aria-label="Notifications"
          >
            <Bell size={24} />
          </button>

        </div>

      </section>


      {/* HERO */}

      <section className="hero-card">

        <div className="hero-content">

          <div className="companion-label">
            <Heart
              size={17}
              fill="#ff2d95"
              color="#ff2d95"
            />
            <span>Your AI Companion</span>
          </div>

          <h2>
            Always here
            <br />
            for you
          </h2>

          <p>
            Your perfect AI companion is ready to chat,
            listen, and be by your side.
          </p>

          <button
            type="button"
            className="start-chat-button"
            onClick={() => onNavigate("chat")}
          >
            <MessageCircle
              size={23}
              fill="white"
            />

            <span>Start Chatting</span>

            <ArrowRight size={23} />
          </button>

        </div>


        {/* YOUR NEW AI MODEL */}

        <div className="hero-image">

          <img
            src="/images/ai-companion.jpg"
            alt="AI Companion"
          />

          <div className="hero-image-overlay" />

        </div>

      </section>


      {/* ALL FEATURES */}

      <section className="features-section">

        <div className="features-heading">

          <h2>
            <span>✦</span> All Features
          </h2>

          <p>
            Everything you need in one place
          </p>

        </div>


        <div className="features-grid">

          {FEATURES.map((feature) => {

            const Icon = feature.icon;

            return (
              <button
                key={feature.id}
                type="button"
                className="feature-card"
                onClick={() =>
                  handleFeatureClick(feature.id)
                }
              >

                <div
                  className="feature-icon"
                  style={{
                    background:
                      `linear-gradient(145deg, ${feature.color}, ${feature.color}aa)`,
                    boxShadow:
                      `0 0 28px ${feature.color}55`,
                  }}
                >

                  <Icon
                    size={27}
                    color="#ffffff"
                    strokeWidth={2.2}
                  />

                </div>


                <div className="feature-text">

                  <h3>
                    {feature.title}
                  </h3>

                  <p>
                    {feature.subtitle}
                  </p>

                </div>


                <ArrowRight
                  className="feature-arrow"
                  size={22}
                />

              </button>
            );

          })}

        </div>

      </section>

    </main>
  );
}
