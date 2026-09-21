"use client";

import { useState } from "react";

export default function PhotosPage() {
  const [activeTab, setActiveTab] = useState("gallery");

  const tabs = [
    { id: "gallery", label: "Gallery" },
    { id: "received", label: "Received" },
    { id: "favorites", label: "Favorites" },
  ];

  return (
    <div style={{ padding: "20px 0" }}>
      
      {/* Header */}
      <div style={{ marginBottom: "20px" }}>
        <h1 className="gradient-text" style={{ fontSize: "26px", fontWeight: 800 }}>
          Photos
        </h1>
        <p style={{ fontSize: "13px", color: "var(--muted)", marginTop: "4px" }}>
          Your shared memories and photos
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "20px" }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={activeTab === tab.id ? "btn btn-primary" : "btn btn-secondary"}
            style={{ padding: "8px 20px", minHeight: "36px", fontSize: "13px", borderRadius: "20px" }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Empty State */}
      <div className="card" style={{ padding: "60px 20px", textAlign: "center" }}>
        <div style={{
          width: "80px", height: "80px", borderRadius: "50%",
          background: "linear-gradient(135deg, #FF2D95, #8B5CF6)",
          display: "grid", placeItems: "center", fontSize: "36px",
          margin: "0 auto 20px", boxShadow: "0 0 30px rgba(255,45,149,0.4)"
        }}>
          🖼️
        </div>
        <h3 style={{ fontSize: "16px", color: "#fff", marginBottom: "8px" }}>
          No Photos Yet
        </h3>
        <p style={{ fontSize: "13px", color: "var(--muted)", marginBottom: "20px" }}>
          Photos you share with your AI companion will appear here.
        </p>
        <button className="btn btn-primary" style={{ padding: "12px 28px", fontSize: "14px" }}>
          📤 Upload Photos
        </button>
      </div>
    </div>
  );
}
