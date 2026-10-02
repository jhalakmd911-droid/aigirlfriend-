"use client";

interface OnboardingPageProps {
  onGetStarted: () => void;
}

export default function OnboardingPage({
  onGetStarted,
}: OnboardingPageProps) {
  return (
    <div
      style={{
        minHeight: "100dvh",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: "16px 18px",
        boxSizing: "border-box",
        position: "relative",
        overflow: "hidden",
        textAlign: "center",
        background: "#05030d",
        color: "#ffffff",
        fontFamily:
          "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}
    >
      {/* Background Image */}
      <img
        src="/images/file_0000000054c48208bd707ad47cc88d38.png"
        alt="AI Girlfriend"
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: "center",
          opacity: 0.72,
          zIndex: 0,
        }}
      />

      {/* Overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 1,
          background:
            "linear-gradient(90deg, rgba(5,3,13,0.96) 0%, rgba(5,3,13,0.82) 38%, rgba(5,3,13,0.48) 68%, rgba(5,3,13,0.20) 100%)",
        }}
      />

      {/* Pink Glow */}
      <div
        style={{
          position: "absolute",
          width: "240px",
          height: "240px",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(255,45,149,0.30), transparent 70%)",
          top: "10%",
          left: "-90px",
          zIndex: 1,
          pointerEvents: "none",
        }}
      />

      {/* Main Content */}
      <div
        style={{
          position: "relative",
          zIndex: 2,
          maxWidth: "360px",
          width: "100%",
        }}
      >
        {/* Heart Logo */}
        <div
          style={{
            width: "72px",
            height: "72px",
            borderRadius: "50%",
            background: "linear-gradient(135deg, #FF2D95 0%, #8B5CF6 100%)",
            display: "grid",
            placeItems: "center",
            fontSize: "34px",
            margin: "0 auto 14px",
            boxShadow:
              "0 0 35px rgba(255,45,149,0.55), 0 0 60px rgba(139,92,246,0.22)",
            border: "2px solid rgba(255,255,255,0.15)",
          }}
        >
          ♡
        </div>

        {/* Title */}
        <h1
          style={{
            margin: "0 0 5px",
            fontSize: "clamp(26px, 7.5vw, 36px)",
            lineHeight: 1.05,
            fontWeight: 800,
            letterSpacing: "-1px",
            background:
              "linear-gradient(90deg, #FF2D95 0%, #C84CFF 55%, #8B5CF6 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          AI Girlfriend
        </h1>

        {/* Subtitle */}
        <p
          style={{
            margin: "0 0 7px",
            fontSize: "clamp(13px, 3.6vw, 16px)",
            color: "#ffffff",
          }}
        >
          Your Perfect AI Companion
        </p>

        {/* Features */}
        <p
          style={{
            margin: "0 0 4px",
            fontSize: "11px",
            color: "rgba(255,255,255,0.82)",
          }}
        >
          Chat • Voice • Photos • Memory
        </p>

        {/* Tagline */}
        <p
          style={{
            margin: "0 0 18px",
            fontSize: "11px",
            color: "rgba(255,255,255,0.68)",
          }}
        >
          Always Here For You
        </p>

        {/* Get Started */}
        <button
          type="button"
          onClick={onGetStarted}
          style={{
            width: "100%",
            minHeight: "44px",
            border: "none",
            borderRadius: "16px",
            padding: "10px 18px",
            marginBottom: "8px",
            cursor: "pointer",
            color: "#ffffff",
            fontSize: "14px",
            fontWeight: 700,
            background:
              "linear-gradient(90deg, #FF239D 0%, #BD42E8 50%, #9251FF 100%)",
            boxShadow:
              "0 8px 26px rgba(255,30,160,0.36), 0 0 18px rgba(155,70,255,0.20)",
          }}
        >
          Get Started
        </button>

        {/* Sign In */}
        <button
          type="button"
          onClick={() => alert("Sign In feature coming soon!")}
          style={{
            width: "100%",
            minHeight: "44px",
            borderRadius: "16px",
            padding: "10px 18px",
            cursor: "pointer",
            color: "#ffffff",
            fontSize: "14px",
            fontWeight: 700,
            background: "rgba(22,10,42,0.72)",
            border: "1.5px solid rgba(157,77,255,0.65)",
            boxShadow: "0 6px 18px rgba(75,20,120,0.22)",
          }}
        >
          Sign In
        </button>

        {/* Privacy */}
        <div
          style={{
            marginTop: "16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "5px",
            fontSize: "11px",
            color: "rgba(255,255,255,0.65)",
          }}
        >
          <span>🛡️</span>
          <span>Your privacy matters</span>
        </div>
      </div>
    </div>
  );
}
