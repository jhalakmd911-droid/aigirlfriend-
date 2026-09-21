"use client";

import { useState } from "react";

interface CharacterSelectPageProps {
  onSelect: (characterId: string) => void;
}

const characters = [
  { id: "jan", name: "Jan", icon: "💫", subtitle: "Sweet & Caring", tag: "Popular" },
  { id: "lily", name: "Lily", icon: "💼", subtitle: "Playful & Fun", tag: "Popular" },
  { id: "emma", name: "Emma", icon: "💕", subtitle: "Romantic", tag: "Popular" },
  { id: "javed", name: "Javed", icon: "🤖", subtitle: "Smart & Loyal", tag: "Realistic" },
  { id: "ayat", name: "Ayat", icon: "✨", subtitle: "Creative & Cute", tag: "Anime" },
];

const categories = ["All", "Popular", "Anime", "Realistic", "Fantasy"];

export default function CharacterSelectPage({ onSelect }: CharacterSelectPageProps) {
  const [activeCategory, setActiveCategory] = useState("All");

  const filteredCharacters = activeCategory === "All"
    ? characters
    : characters.filter(c => c.tag === activeCategory);

  return (
    <div style={{ minHeight: "100vh", padding: "30px 20px", display: "flex", flexDirection: "column" }}>
      
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "24px" }}>
        <h1 className="gradient-text" style={{ fontSize: "26px", fontWeight: 800, marginBottom: "6px" }}>
          Choose Your AI Girlfriend
        </h1>
        <p style={{ color: "var(--muted)", fontSize: "13px" }}>
          Select a character and start your journey
        </p>
      </div>

      {/* Category Filters */}
      <div style={{ display: "flex", gap: "8px", overflowX: "auto", paddingBottom: "16px", marginBottom: "16px", justifyContent: "center", flexWrap: "wrap" }}>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={activeCategory === cat ? "btn btn-primary" : "btn btn-secondary"}
            style={{ padding: "6px 16px", minHeight: "36px", fontSize: "12px", borderRadius: "20px" }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Characters Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "16px", flex: 1 }}>
        {filteredCharacters.map((char) => (
          <div key={char.id} className="card" style={{ padding: "16px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>
            
            {/* Avatar */}
            <div style={{
              width: "100px", height: "100px", borderRadius: "50%",
              background: "linear-gradient(135deg, #FF2D95, #8B5CF6)",
              display: "grid", placeItems: "center", fontSize: "40px",
              boxShadow: "0 0 25px rgba(255,45,149,0.5)", marginBottom: "12px",
              border: "3px solid rgba(255,255,255,0.1)"
            }}>
              {char.icon}
            </div>

            {/* Info */}
            <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#fff", marginBottom: "4px" }}>{char.name}</h3>
            <p style={{ fontSize: "11px", color: "var(--muted)", marginBottom: "16px" }}>{char.subtitle}</p>

            {/* Select Button */}
            <button
              onClick={() => onSelect(char.id)}
              className="btn btn-primary"
              style={{ width: "100%", minHeight: "38px", fontSize: "13px", marginTop: "auto" }}
            >
              Select
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
