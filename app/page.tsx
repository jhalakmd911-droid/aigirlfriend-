"use client";

import Link from "next/link";

export default function HomePage() {
  const features = [
    { name: "Chat", icon: "💬", path: "/chat", desc: "Talk to your AI" },
    { name: "Memory", icon: "🧠", path: "/memory", desc: "Saved memories" },
    { name: "Photos", icon: "📸", path: "/photos", desc: "Character photos" },
    { name: "Settings", icon: "⚙️", path: "/settings", desc: "App settings" },
    { name: "Update", icon: "🔄", path: "/update", desc: "Update character" },
  ];

  return (
    <div style={{ minHeight: "100dvh", background: "#05030d", color: "#fff", padding: "24px 16px", fontFamily: "sans-serif" }}>
      <div style={{ maxWidth: "480px", margin: "0 auto" }}>
        
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "32px", marginTop: "20px" }}>
          <h1 style={{ fontSize: "28px", fontWeight: 800, background: "linear-gradient(135deg, #FF2D95, #8B5CF6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", marginBottom: "8px" }}>
            AI Girlfriend
          </h1>
          <p style={{ color: "#a78bfa", fontSize: "13px" }}>Your personal AI companion</p>
        </div>

        {/* Feature Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          {features.map((f) => (
            <Link key={f.name} href={f.path} style={{ textDecoration: "none" }}>
              <div style={{ 
                background: "rgba(20,12,40,0.8)", 
                border: "1px solid rgba(139,92,246,0.3)", 
                borderRadius: "16px", 
                padding: "20px 16px", 
                textAlign: "center",
                backdropFilter: "blur(12px)",
                transition: "all 0.2s",
                boxShadow: "0 4px 20px rgba(0,0,0,0.4)"
              }}>
                <div style={{ fontSize: "32px", marginBottom: "10px" }}>{f.icon}</div>
                <h3 style={{ fontSize: "15px", fontWeight: 700, marginBottom: "4px", color: "#fff" }}>{f.name}</h3>
                <p style={{ fontSize: "11px", color: "#a78bfa", margin: 0 }}>{f.desc}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* Chat Button */}
        <Link href="/chat" style={{ textDecoration: "none" }}>
          <div style={{ 
            marginTop: "24px", 
            background: "linear-gradient(135deg, #FF2D95, #8B5CF6)", 
            borderRadius: "16px", 
            padding: "18px", 
            textAlign: "center",
            boxShadow: "0 6px 24px rgba(255,45,149,0.4)"
          }}>
            <h2 style={{ fontSize: "18px", fontWeight: 800, margin: 0 }}>💬 Start Chatting</h2>
            <p style={{ fontSize: "12px", margin: "4px 0 0", opacity: 0.9 }}>Talk to Jan, Lily, Emma & more</p>
          </div>
        </Link>

      </div>
    </div>
  );
}
