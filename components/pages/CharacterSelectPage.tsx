"use client";

import { useState } from "react";

interface CharacterSelectPageProps {
  onSelect: (characterId: string) => void;
  onBack?: () => void;
}

const characters = [
  {
    id: "jan",
    name: "Jan",
    icon: "💫",
    subtitle: "Sweet & Caring",
    tag: "Popular",
    color: "#FF2D95",
    photo: "/images/Jan-ai-generated-8285212.jpg",
  },
  {
    id: "lily",
    name: "Lily",
    icon: "💼",
    subtitle: "Playful & Bold",
    tag: "Popular",
    color: "#8B5CF6",
    photo: "/images/Lily_yacuzzi-ai-8455080.png",
  },
  {
    id: "emma",
    name: "Emma",
    icon: "💕",
    subtitle: "Smart & Romantic",
    tag: "Popular",
    color: "#EC4899",
    photo: "/images/Emma-stuff-ai-generated-8494624.jpg",
  },
  {
    id: "javed",
    name: "Mira",
    icon: "🤖",
    subtitle: "Smart & Loyal",
    tag: "Realistic",
    color: "#10B981",
    photo: "/images/Mira-ai-8612900.jpg",
  },
  {
    id: "ayat",
    name: "Nadia",
    icon: "✨",
    subtitle: "Creative & Cute",
    tag: "Anime",
    color: "#F59E0B",
    photo: "/images/Nadia007-ai-generated-8822022.jpg",
  },
];

const categories = ["All", "Popular", "Anime", "Realistic", "Fantasy"];

export default function CharacterSelectPage({ onSelect, onBack }: CharacterSelectPageProps) {
  const [activeCategory, setActiveCategory] = useState("All");

  const filteredCharacters =
    activeCategory === "All"
      ? characters
      : characters.filter((c) => c.tag === activeCategory);

  return (
    <div
      style={{
        minHeight: "100dvh",
        padding: "14px 12px 100px",
        display: "flex",
        flexDirection: "column",
        boxSizing: "border-box",
        background: "#05030d",
        color: "#fff",
      }}
    >
      {onBack && (
        <button
          onClick={onBack}
          style={{
            alignSelf: "flex-start",
            display: "inline-flex",
            alignItems: "center",
            gap: "5px",
            padding: "7px 13px",
            borderRadius: "11px",
            background: "rgba(139,92,246,0.14)",
            border: "1px solid rgba(139,92,246,0.45)",
            color: "#fff",
            fontSize: "12px",
            fontWeight: 700,
            marginBottom: "14px",
            cursor: "pointer",
          }}
        >
          ← Back
        </button>
      )}

      <div style={{ textAlign: "center", marginBottom: "14px" }}>
        <h1
          style={{
            fontSize: "20px",
            fontWeight: 800,
            margin: 0,
            marginBottom: "4px",
            background: "linear-gradient(90deg, #FF2D95 0%, #8B5CF6 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            letterSpacing: "-0.5px",
          }}
        >
          Choose Your AI Girlfriend
        </h1>
        <p style={{ color: "rgba(190,190,220,0.72)", fontSize: "11px", margin: 0 }}>
          Select a character and start your journey
        </p>
      </div>

      {/* Category Tabs */}
      <div
        style={{
          display: "flex",
          gap: "6px",
          overflowX: "auto",
          paddingBottom: "10px",
          marginBottom: "10px",
          scrollbarWidth: "none",
        }}
      >
        {categories.map((cat) => {
          const isActive = activeCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              style={{
                flexShrink: 0,
                padding: "6px 14px",
                borderRadius: "20px",
                fontSize: "11px",
                fontWeight: 700,
                cursor: "pointer",
                transition: "all 0.2s",
                background: isActive
                  ? "linear-gradient(135deg, #FF2D95, #8B5CF6)"
                  : "rgba(139,92,246,0.12)",
                border: isActive
                  ? "1px solid rgba(255,45,149,0.6)"
                  : "1px solid rgba(139,92,246,0.35)",
                color: "#fff",
                boxShadow: isActive ? "0 0 16px rgba(255,45,149,0.4)" : "none",
              }}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Character Cards — horizontal scroll */}
      <div
        style={{
          display: "flex",
          gap: "8px",
          overflowX: "auto",
          paddingBottom: "14px",
          paddingTop: "4px",
          scrollbarWidth: "none",
          WebkitOverflowScrolling: "touch",
        }}
      >
        {filteredCharacters.length === 0 ? (
          <p style={{ color: "rgba(190,190,220,0.7)", fontSize: "12px", padding: "20px" }}>
            No characters in this category yet.
          </p>
        ) : (
          filteredCharacters.map((char) => (
            <div
              key={char.id}
              style={{
                flexShrink: 0,
                width: "110px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                padding: "10px 6px",
                borderRadius: "14px",
                background:
                  "linear-gradient(180deg, rgba(20,12,40,0.95), rgba(10,6,26,0.98))",
                border: `1px solid ${char.color}55`,
                boxShadow: `inset 0 0 14px ${char.color}0d, 0 4px 14px rgba(0,0,0,0.25)`,
              }}
            >
              {/* Photo — real image */}
              <div
                style={{
                  width: "90px",
                  height: "90px",
                  borderRadius: "50%",
                  overflow: "hidden",
                  marginBottom: "8px",
                  background: `linear-gradient(145deg, ${char.color}, ${char.color}aa)`,
                  boxShadow: `0 0 18px ${char.color}55`,
                  border: `2px solid ${char.color}`,
                  display: "grid",
                  placeItems: "center",
                }}
              >
                <img
                  src={char.photo}
                  alt={char.name}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    objectPosition: "center top",
                    display: "block",
                  }}
                  onError={(e) => {
                    const el = e.currentTarget as HTMLImageElement;
                    el.style.display = "none";
                    const parent = el.parentElement;
                    if (parent) {
                      parent.textContent = char.icon;
                      parent.style.fontSize = "34px";
                    }
                  }}
                />
              </div>

              {/* Name */}
              <div
                style={{
                  fontSize: "12px",
                  fontWeight: 800,
                  color: "#fff",
                  marginBottom: "2px",
                  textAlign: "center",
                  lineHeight: 1.1,
                }}
              >
                {char.name}
              </div>

              {/* Subtitle */}
              <div
                style={{
                  fontSize: "8px",
                  color: "rgba(190,190,220,0.75)",
                  marginBottom: "9px",
                  textAlign: "center",
                  lineHeight: 1.25,
                  minHeight: "20px",
                }}
              >
                {char.subtitle}
              </div>

              {/* Select */}
              <button
                onClick={() => onSelect(char.id)}
                style={{
                  width: "100%",
                  minHeight: "26px",
                  padding: "4px 8px",
                  borderRadius: "8px",
                  fontSize: "10px",
                  fontWeight: 800,
                  color: "#fff",
                  cursor: "pointer",
                  border: "none",
                  background: "linear-gradient(90deg, #FF2D95 0%, #8B5CF6 100%)",
                  boxShadow: "0 3px 10px rgba(255,45,149,0.35)",
                }}
              >
                Select
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
