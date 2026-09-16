"use client";

import { useState } from "react";

type UpdateState = "available" | "downloading" | "installing" | "complete";

export default function UpdatePage() {
  const [updateState, setUpdateState] = useState<UpdateState>("available");
  const [progress, setProgress] = useState(0);

  const startUpdate = () => {
    setUpdateState("downloading");
    setProgress(0);

    // Simulate download progress
    const downloadInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(downloadInterval);
          setUpdateState("installing");
          return 100;
        }
        return prev + 10;
      });
    }, 300);
  };

  const completeUpdate = () => {
    setUpdateState("complete");
    setTimeout(() => {
      // Reset to available state
      setUpdateState("available");
      setProgress(0);
    }, 2000);
  };

  const updates = [
    { icon: "💬", title: "Better AI responses", desc: "Improved conversation quality" },
    { icon: "🎙", title: "Improved voice quality", desc: "Crystal clear audio" },
    { icon: "🐛", title: "Bug fixes & performance boost", desc: "Faster and more stable" },
  ];

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
            Updates
          </h1>
          <p
            style={{
              marginTop: "5px",
              fontSize: "13px",
              color: "var(--muted)",
            }}
          >
            Keep your app fresh
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
          🔔
        </button>
      </header>

      {/* Status Card */}
      {updateState === "available" && (
        <section
          className="card"
          style={{
            padding: "32px 24px",
            textAlign: "center",
            position: "relative",
            overflow: "hidden",
            marginBottom: "20px",
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

          <div
            style={{
              position: "relative",
              width: "120px",
              height: "120px",
              margin: "0 auto 20px",
              borderRadius: "40px",
              display: "grid",
              placeItems: "center",
              background: "linear-gradient(135deg, #FF4F9A, #8B5CF6)",
              color: "#ffffff",
              fontSize: "64px",
              boxShadow: "0 18px 45px rgba(255,79,154,0.25)",
            }}
          >
            🚀
          </div>

          <h2 style={{ fontSize: "24px", marginBottom: "12px", position: "relative" }}>
            New Update Available
          </h2>

          <p
            style={{
              fontSize: "14px",
              color: "var(--muted)",
              marginBottom: "20px",
              position: "relative",
            }}
          >
            Get the latest features and improvements.
          </p>

          <p
            style={{
              fontSize: "12px",
              color: "var(--muted)",
              position: "relative",
            }}
          >
            Version 1.2.0 • Size: 8.5 MB
          </p>
        </section>
      )}

      {/* Downloading State */}
      {updateState === "downloading" && (
        <section
          className="card"
          style={{
            padding: "32px 24px",
            textAlign: "center",
            position: "relative",
            overflow: "hidden",
            marginBottom: "20px",
          }}
        >
          <h2 style={{ fontSize: "24px", marginBottom: "32px" }}>
            Updating...
          </h2>

          {/* Progress Circle */}
          <div
            style={{
              position: "relative",
              width: "140px",
              height: "140px",
              margin: "0 auto 32px",
              display: "grid",
              placeItems: "center",
            }}
          >
            <svg
              width="140"
              height="140"
              style={{
                transform: "rotate(-90deg)",
                position: "absolute",
              }}
            >
              <circle
                cx="70"
                cy="70"
                r="65"
                fill="none"
                stroke="rgba(139,92,246,0.2)"
                strokeWidth="3"
              />
              <circle
                cx="70"
                cy="70"
                r="65"
                fill="none"
                stroke="url(#grad)"
                strokeWidth="3"
                strokeDasharray={`${(progress / 100) * 408.407} 408.407`}
                style={{ transition: "stroke-dasharray 0.3s ease" }}
              />
              <defs>
                <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FF4F9A" />
                  <stop offset="100%" stopColor="#8B5CF6" />
                </linearGradient>
              </defs>
            </svg>

            <div style={{ textAlign: "center", position: "relative", zIndex: 1 }}>
              <p style={{ fontSize: "32px", fontWeight: 700 }}>
                {progress}%
              </p>
              <p style={{ fontSize: "12px", color: "var(--muted)", marginTop: "4px" }}>
                {progress < 50 && "Downloading update"}
                {progress >= 50 && progress < 100 && "Installing new features"}
                {progress === 100 && "Optimizing system"}
              </p>
            </div>
          </div>

          {/* Progress Steps */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "8px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "14px",
              }}
            >
              <span style={{ color: "var(--success)" }}>✓</span>
              Downloading update
            </div>
            {progress >= 50 && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  fontSize: "14px",
                }}
              >
                <span style={{ color: "var(--success)" }}>✓</span>
                Installing files
              </div>
            )}
            {progress >= 100 && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  fontSize: "14px",
                }}
              >
                <span style={{ color: "#f59e0b" }}>⚡</span>
                Optimizing system
              </div>
            )}
          </div>
        </section>
      )}

      {/* Complete State */}
      {updateState === "complete" && (
        <section
          className="card"
          style={{
            padding: "32px 24px",
            textAlign: "center",
            position: "relative",
            overflow: "hidden",
            marginBottom: "20px",
          }}
        >
          <div
            style={{
              position: "absolute",
              width: "200px",
              height: "200px",
              borderRadius: "50%",
              background:
                "radial-gradient(circle, rgba(34,197,94,0.15), transparent 70%)",
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
                "radial-gradient(circle, rgba(34,197,94,0.15), transparent 70%)",
              bottom: "-100px",
              right: "-60px",
            }}
          />

          <div
            style={{
              position: "relative",
              width: "120px",
              height: "120px",
              margin: "0 auto 20px",
              borderRadius: "50%",
              display: "grid",
              placeItems: "center",
              background: "linear-gradient(135deg, #22c55e, #16a34a)",
              color: "#ffffff",
              fontSize: "64px",
              boxShadow: "0 18px 45px rgba(34,197,94,0.25)",
            }}
          >
            ✓
          </div>

          <h2 style={{ fontSize: "24px", marginBottom: "12px", position: "relative" }}>
            Update Successfully!
          </h2>

          <p
            style={{
              fontSize: "14px",
              color: "var(--muted)",
              marginBottom: "24px",
              position: "relative",
            }}
          >
            Your AI Girls app is now up to date.
          </p>

          <button
            className="btn btn-primary"
            onClick={() => setUpdateState("available")}
            style={{
              width: "100%",
              position: "relative",
            }}
          >
            Continue
          </button>
        </section>
      )}

      {/* Update Details */}
      {updateState === "available" && (
        <>
          <h3
            style={{
              fontSize: "18px",
              marginBottom: "12px",
              fontWeight: 600,
            }}
          >
            Update Details
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {updates.map((update, index) => (
              <div
                key={index}
                className="card"
                style={{
                  padding: "16px",
                  display: "flex",
                  gap: "12px",
                }}
              >
                <span style={{ fontSize: "24px" }}>{update.icon}</span>
                <div style={{ textAlign: "left" }}>
                  <p style={{ fontSize: "14px", fontWeight: 600 }}>
                    {update.title}
                  </p>
                  <p
                    style={{
                      fontSize: "12px",
                      color: "var(--muted)",
                      marginTop: "2px",
                    }}
                  >
                    {update.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Update Button */}
          <button
            className="btn btn-primary"
            onClick={startUpdate}
            style={{
              width: "100%",
              minHeight: "52px",
              marginTop: "24px",
              fontSize: "16px",
              fontWeight: 700,
            }}
          >
            📥 Update Now
          </button>
        </>
      )}

      {updateState === "downloading" && (
        <button
          className="btn btn-primary"
          onClick={completeUpdate}
          style={{
            width: "100%",
            minHeight: "52px",
            marginTop: "24px",
            fontSize: "16px",
            fontWeight: 700,
          }}
        >
          Complete
        </button>
      )}
    </div>
  );
}
