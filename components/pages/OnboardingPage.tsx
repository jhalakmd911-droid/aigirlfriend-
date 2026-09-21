"use client";

interface OnboardingPageProps {
  onGetStarted: () => void;
}

export default function OnboardingPage({ onGetStarted }: OnboardingPageProps) {
  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      padding: "40px 20px",
      position: "relative",
      overflow: "hidden",
      textAlign: "center"
    }}>
      {/* Background Glow */}
      <div style={{ position: "absolute", width: "300px", height: "300px", borderRadius: "50%", background: "radial-gradient(circle, rgba(255,45,149,0.3), transparent 70%)", top: "10%", left: "-20%" }} />
      <div style={{ position: "absolute", width: "300px", height: "300px", borderRadius: "50%", background: "radial-gradient(circle, rgba(139,92,246,0.3), transparent 70%)", bottom: "10%", right: "-20%" }} />

      <div style={{ position: "relative", zIndex: 1, maxWidth: "420px", width: "100%" }}>
        {/* Large Icon / Avatar Placeholder */}
        <div style={{
          width: "140px",
          height: "140px",
          borderRadius: "50%",
          background: "linear-gradient(135deg, #FF2D95, #8B5CF6)",
          display: "grid",
          placeItems: "center",
          fontSize: "60px",
          margin: "0 auto 30px",
          boxShadow: "0 0 60px rgba(255,45,149,0.6)",
          border: "4px solid rgba(255,255,255,0.1)"
        }}>
          ♡
        </div>

        {/* Title */}
        <h1 style={{ fontSize: "32px", fontWeight: 800, marginBottom: "10px" }} className="gradient-text">
          AI Girlfriend
        </h1>
        <p style={{ fontSize: "16px", color: "var(--muted)", marginBottom: "6px" }}>
          Your Perfect AI Companion
        </p>
        <p style={{ fontSize: "13px", color: "rgba(157, 148, 184, 0.7)", marginBottom: "40px" }}>
          Chat • Voice • Photos • Memory
        </p>

        {/* Buttons */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <button 
            onClick={onGetStarted} 
            className="btn btn-primary" 
            style={{ width: "100%", minHeight: "52px", fontSize: "16px" }}
          >
            Get Started
          </button>
          
          <button 
            onClick={() => alert("Sign In feature coming soon!")} 
            className="btn btn-secondary" 
            style={{ width: "100%", minHeight: "52px", fontSize: "16px" }}
          >
            Sign In
          </button>
        </div>

        {/* Privacy Note */}
        <div style={{ marginTop: "30px", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", fontSize: "11px", color: "var(--muted)" }}>
          <span>🛡️</span> Your privacy matters
        </div>
      </div>
    </div>
  );
}
