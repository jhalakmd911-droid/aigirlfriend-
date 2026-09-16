"use client";

import { useState } from "react";

type VoiceState = "idle" | "listening" | "speaking" | "playing-music";

export default function VoicePage() {
  const [voiceState, setVoiceState] = useState<VoiceState>("idle");
  const [selectedGirl, setSelectedGirl] = useState("lily");
  const [isListening, setIsListening] = useState(false);
  const [volume, setVolume] = useState(70);

  const girls = [
    { id: "lily", name: "Lily", subtitle: "Sweet & Caring", icon: "🎀" },
    { id: "emma", name: "Emma", subtitle: "Playful & Fun", icon: "✨" },
  ];

  const toggleListening = () => {
    setIsListening(!isListening);
    if (!isListening) {
      setVoiceState("listening");
      setTimeout(() => {
        setVoiceState("speaking");
        setTimeout(() => {
          setVoiceState("idle");
          setIsListening(false);
        }, 3000);
      }, 2000);
    } else {
      setVoiceState("idle");
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        paddingTop: "20px",
        paddingBottom: "110px",
      }}
    >
      {/* Header */}
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "22px 0 18px",
          marginBottom: "20px",
        }}
      >
        <div>
          <h1
            className="gradient-text"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "26px",
              fontWeight: 800,
              letterSpacing: "-0.6px",
            }}
          >
            Voice Chat
          </h1>
          <p
            style={{
              marginTop: "5px",
              fontSize: "13px",
              color: "var(--muted)",
            }}
          >
            Choose your AI girl and talk
          </p>
        </div>

        <button
          type="button"
          style={{
            width: "46px",
            height: "46px",
            borderRadius: "50%",
            border: "1px solid rgba(255,255,255,0.15)",
            display: "grid",
            placeItems: "center",
            background: "linear-gradient(135deg, #FF4F9A, #8B5CF6)",
            color: "#ffffff",
            fontSize: "22px",
            boxShadow: "0 10px 30px rgba(139,92,246,0.25)",
            cursor: "pointer",
          }}
        >
          ⚙
        </button>
      </header>

      {/* Girl Selection Cards */}
      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: "12px",
          marginBottom: "24px",
        }}
      >
        {girls.map((girl) => (
          <button
            key={girl.id}
            onClick={() => setSelectedGirl(girl.id)}
            className="card"
            style={{
              padding: "20px 16px",
              textAlign: "center",
              color: "var(--foreground)",
              cursor: "pointer",
              border:
                selectedGirl === girl.id
                  ? "2px solid var(--primary)"
                  : "1px solid var(--border)",
              position: "relative",
            }}
          >
            <div
              style={{
                width: "80px",
                height: "80px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #FF4F9A, #8B5CF6)",
                display: "grid",
                placeItems: "center",
                color: "#ffffff",
                fontSize: "48px",
                margin: "0 auto 12px",
              }}
            >
              {girl.icon}
            </div>

            <h3 style={{ fontSize: "16px", fontWeight: 600 }}>
              {girl.name}
            </h3>

            <p
              style={{
                fontSize: "12px",
                marginTop: "4px",
                color: "var(--muted)",
              }}
            >
              {girl.subtitle}
            </p>

            {selectedGirl === girl.id && (
              <div
                style={{
                  position: "absolute",
                  top: "8px",
                  right: "8px",
                  width: "24px",
                  height: "24px",
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #FF4F9A, #8B5CF6)",
                  display: "grid",
                  placeItems: "center",
                  color: "#ffffff",
                  fontSize: "14px",
                }}
              >
                ✓
              </div>
            )}
          </button>
        ))}
      </section>

      {/* Voice Interface */}
      <section
        className="card"
        style={{
          padding: "32px 20px",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            width: "200px",
            height: "200px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(255,79,154,0.15), transparent 70%)",
            top: "-80px",
            left: "-60px",
          }}
        />

        <div
          style={{
            position: "absolute",
            width: "200px",
            height: "200px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(139,92,246,0.15), transparent 70%)",
            bottom: "-100px",
            right: "-60px",
          }}
        />

        <h2 style={{ fontSize: "20px", marginBottom: "24px", position: "relative" }}>
          {voiceState === "idle" && "Tap to speak"}
          {voiceState === "listening" && "Listening..."}
          {voiceState === "speaking" && "Speaking..."}
          {voiceState === "playing-music" && "Playing music"}
        </h2>

        {/* Main Voice Button */}
        <div style={{ position: "relative", marginBottom: "32px" }}>
          <button
            onClick={toggleListening}
            style={{
              width: "160px",
              height: "160px",
              borderRadius: "50%",
              background: isListening
                ? "linear-gradient(135deg, #FF4F9A, #8B5CF6)"
                : "rgba(139,92,246,0.15)",
              border: "none",
              display: "grid",
              placeItems: "center",
              margin: "0 auto",
              cursor: "pointer",
              fontSize: "72px",
              transition: "all 0.3s ease",
              boxShadow: isListening
                ? "0 20px 60px rgba(255,79,154,0.35)"
                : "0 10px 30px rgba(139,92,246,0.15)",
              position: "relative",
              zIndex: 1,
            }}
          >
            🎤
          </button>

          {/* Listening animation */}
          {isListening && (
            <>
              <div
                style={{
                  position: "absolute",
                  width: "180px",
                  height: "180px",
                  borderRadius: "50%",
                  border: "2px solid rgba(255,79,154,0.3)",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  animation: "pulse 1.5s ease-out infinite",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  width: "200px",
                  height: "200px",
                  borderRadius: "50%",
                  border: "2px solid rgba(255,79,154,0.15)",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  animation: "pulse 1.5s ease-out 0.5s infinite",
                }}
              />
            </>
          )}
        </div>

        <style>{`
          @keyframes pulse {
            0% {
              width: 180px;
              height: 180px;
              opacity: 1;
            }
            100% {
              width: 240px;
              height: 240px;
              opacity: 0;
            }
          }
        `}</style>

        <p style={{ fontSize: "14px", color: "var(--muted)", position: "relative" }}>
          {voiceState === "idle" && "Tap the microphone to start speaking"}
          {voiceState === "listening" && "I'm listening to you..."}
          {voiceState === "speaking" && "I'm responding to you..."}
        </p>
      </section>

      {/* Music Controls */}
      <section className="card" style={{ padding: "20px", marginTop: "16px" }}>
        <h3 style={{ fontSize: "16px", marginBottom: "16px" }}>
          🎵 Background Music
        </h3>

        <div
          style={{
            display: "flex",
            gap: "8px",
            marginBottom: "16px",
          }}
        >
          {["Calm", "Lofi", "Ambient", "Jazz"].map((genre) => (
            <button
              key={genre}
              style={{
                flex: 1,
                padding: "8px",
                borderRadius: "8px",
                border: "1px solid var(--border)",
                background: "rgba(139,92,246,0.1)",
                fontSize: "12px",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
            >
              {genre}
            </button>
          ))}
        </div>

        {/* Volume Control */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ fontSize: "14px" }}>🔊</span>
          <input
            type="range"
            min="0"
            max="100"
            value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            style={{
              flex: 1,
              cursor: "pointer",
            }}
          />
          <span style={{ fontSize: "12px", color: "var(--muted)" }}>
            {volume}%
          </span>
        </div>
      </section>

      {/* Tips */}
      <section className="card" style={{ padding: "16px", marginTop: "16px" }}>
        <p style={{ fontSize: "13px", lineHeight: 1.6, color: "var(--muted)" }}>
          💡 <strong>Tip:</strong> Speak clearly for better recognition. You can
          also choose background music to make the conversation more relaxing.
        </p>
      </section>
    </div>
  );
}
