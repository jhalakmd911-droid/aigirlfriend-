"use client";

interface SettingsPageProps {
  onNavigate?: (tab: string) => void;
}

const settingItems = [
  { id: "profile", icon: "👤", title: "Profile", subtitle: "Edit your profile", color: "#FF2D95" },
  { id: "character", icon: "🎭", title: "Character", subtitle: "Change your AI companion", color: "#8B5CF6" },
  { id: "voice", icon: "🎙️", title: "Voice & Audio", subtitle: "Voice settings", color: "#22D3EE" },
  { id: "chat", icon: "💬", title: "Chat Settings", subtitle: "Message preferences", color: "#F59E0B" },
  { id: "security", icon: "🔒", title: "Privacy & Security", subtitle: "PIN, privacy, data", color: "#10B981" },
  { id: "data", icon: "📁", title: "Data Management", subtitle: "Manage your data", color: "#EF4444" },
  { id: "export", icon: "📤", title: "Export Chat History", subtitle: "Download conversations", color: "#6366F1" },
  { id: "import", icon: "📥", title: "Import Chat History", subtitle: "Restore from backup", color: "#EC4899" },
  { id: "notifications", icon: "🔔", title: "Notifications", subtitle: "App notifications", color: "#F97316" },
  { id: "about", icon: "ℹ️", title: "About", subtitle: "App information", color: "#64748B" },
];

export default function SettingsPage({ onNavigate }: SettingsPageProps) {
  const handleClick = (id: string) => {
    if (onNavigate) {
      if (id === "security") onNavigate("security");
      else if (id === "character") onNavigate("character");
      else if (id === "chat") onNavigate("chat");
      else if (id === "voice") onNavigate("voice");
      else onNavigate(id);
    }
  };

  return (
    <div
      style={{
        minHeight: "100dvh",
        background: "#05030d",
        paddingBottom: "78px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Glows */}
      <div
        style={{
          position: "absolute",
          width: "260px",
          height: "260px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(255,45,149,0.20), transparent 70%)",
          top: "-80px",
          left: "-100px",
          zIndex: 0,
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          width: "260px",
          height: "260px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(99,102,241,0.20), transparent 70%)",
          bottom: "-40px",
          right: "-110px",
          zIndex: 0,
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 2,
          width: "100%",
          maxWidth: "480px",
          margin: "0 auto",
          padding: "8px 12px 0",
          boxSizing: "border-box",
        }}
      >
        {/* Home Button */}
        <button
          onClick={() => {
            if (typeof window !== "undefined") window.history.back();
          }}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "4px",
            padding: "5px 11px",
            borderRadius: "999px",
            background: "rgba(20,12,40,0.72)",
            border: "1px solid rgba(139,92,246,0.55)",
            color: "#fff",
            fontSize: "10px",
            fontWeight: 700,
            cursor: "pointer",
            marginBottom: "8px",
            backdropFilter: "blur(12px)",
          }}
        >
          ← Home
        </button>

        {/* Header */}
        <div style={{ marginBottom: "10px", paddingLeft: "2px" }}>
          <h1
            style={{
              fontSize: "22px",
              fontWeight: 900,
              margin: 0,
              lineHeight: 1.05,
              letterSpacing: "-0.5px",
              background: "linear-gradient(90deg, #FF2D95 0%, #C84CFF 60%, #8B5CF6 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Settings
          </h1>
          <p style={{ margin: "3px 0 0", fontSize: "10px", color: "rgba(200,200,230,0.7)" }}>
            Manage your app & preferences
          </p>
        </div>

        {/* Settings List */}
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          {settingItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleClick(item.id)}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "9px 12px",
                borderRadius: "12px",
                background: "linear-gradient(145deg, rgba(20,12,40,0.85), rgba(10,6,26,0.9))",
                border: `1px solid ${item.color}44`,
                boxShadow: `inset 0 0 12px ${item.color}0d`,
                color: "#fff",
                cursor: "pointer",
                textAlign: "left",
              }}
            >
              {/* Icon */}
              <div
                style={{
                  width: "34px",
                  height: "34px",
                  flexShrink: 0,
                  display: "grid",
                  placeItems: "center",
                  borderRadius: "10px",
                  fontSize: "16px",
                  background: `linear-gradient(145deg, ${item.color}, ${item.color}aa)`,
                  boxShadow: `0 0 14px ${item.color}55`,
                }}
              >
                {item.icon}
              </div>

              {/* Text */}
              <div style={{ minWidth: 0, flex: 1 }}>
                <div
                  style={{
                    fontSize: "12px",
                    fontWeight: 800,
                    color: "#fff",
                    marginBottom: "1px",
                    lineHeight: 1.15,
                  }}
                >
                  {item.title}
                </div>
                <div
                  style={{
                    fontSize: "9px",
                    color: "rgba(200,200,230,0.65)",
                    lineHeight: 1.25,
                  }}
                >
                  {item.subtitle}
                </div>
              </div>

              {/* Arrow */}
              <div style={{ flexShrink: 0, color: "#a8b9ff", fontSize: "14px", opacity: 0.85 }}>›</div>
            </button>
          ))}
        </div>

        {/* Footer */}
        <div
          style={{
            textAlign: "center",
            marginTop: "14px",
            fontSize: "9px",
            color: "rgba(200,200,230,0.5)",
          }}
        >
          AI Girlfriend v1.0.0 • Made with ❤️
        </div>
      </div>
    </div>
  );
}
