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
        minHeight: "100vh",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: "30px 20px",
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
      {/* AI Girlfriend Background Image */}
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

      {/* Dark / Pink Overlay */}
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
          width: "280px",
          height: "280px",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(255,45,149,0.30), transparent 70%)",
          top: "8%",
          left: "-100px",
          zIndex: 1,
          pointerEvents: "none",
        }}
      />

      {/* Main Content */}
      <div
        style={{
          position: "relative",
          zIndex: 2,
          maxWidth: "380px",
          width: "100%",
        }}
      >
        {/* Heart Logo */}
        <div
          style={{
            width: "90px",
            height: "90px",
            borderRadius: "50%",
            background: "linear-gradient(135deg, #FF2D95 0%, #8B5CF6 100%)",
            display: "grid",
            placeItems: "center",
            fontSize: "44px",
            margin: "0 auto 20px",
            boxShadow:
              "0 0 45px rgba(255,45,149,0.60), 0 0 80px rgba(139,92,246,0.25)",
            border: "3px solid rgba(255,255,255,0.15)",
          }}
        >
          ♡
        </div>

        {/* Title */}
        <h1
          style={{
            margin: "0 0 8px",
            fontSize: "clamp(30px, 8.5vw, 44px)",
            lineHeight: 1.05,
            fontWeight: 800,
            letterSpacing: "-1.2px",
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
            margin: "0 0 10px",
            fontSize: "clamp(15px, 4vw, 19px)",
            color: "#ffffff",
          }}
        >
          Your Perfect AI Companion
        </p>

        {/* Features */}
        <p
          style={{
            margin: "0 0 6px",
            fontSize: "13px",
            color: "rgba(255,255,255,0.82)",
          }}
        >
          Chat • Voice • Photos • Memory
        </p>

        {/* Tagline */}
        <p
          style={{
            margin: "0 0 26px",
            fontSize: "13px",
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
            minHeight: "50px",
            border: "none",
            borderRadius: "18px",
            padding: "12px 20px",
            marginBottom: "10px",
            cursor: "pointer",
            color: "#ffffff",
            fontSize: "16px",
            fontWeight: 700,
            background:
              "linear-gradient(90deg, #FF239D 0%, #BD42E8 50%, #9251FF 100%)",
            boxShadow:
              "0 10px 30px rgba(255,30,160,0.38), 0 0 20px rgba(155,70,255,0.22)",
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
            minHeight: "50px",
            borderRadius: "18px",
            padding: "12px 20px",
            cursor: "pointer",
            color: "#ffffff",
            fontSize: "16px",
            fontWeight: 700,
            background: "rgba(22,10,42,0.72)",
            border: "2px solid rgba(157,77,255,0.65)",
            boxShadow: "0 8px 22px rgba(75,20,120,0.25)",
          }}
        >
          Sign In
        </button>

        {/* Privacy */}
        <div
          style={{
            marginTop: "22px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px",
            fontSize: "12px",
            color: "rgba(255,255,255,0.68)",
          }}
        >
          <span>🛡️</span>
          <span>Your privacy matters</span>
        </div>
      </div>
    </div>
  );
}
