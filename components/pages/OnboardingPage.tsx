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
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: "40px 20px",
        position: "relative",
        overflow: "hidden",
        textAlign: "center",
        background: "#05030d",
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
          opacity: 0.65,
          zIndex: 0,
        }}
      />

      {/* Dark overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(90deg, rgba(5,3,13,0.96) 0%, rgba(5,3,13,0.78) 45%, rgba(5,3,13,0.35) 100%)",
          zIndex: 1,
        }}
      />

      {/* Pink / Purple Glow */}
      <div
        style={{
          position: "absolute",
          width: "320px",
          height: "320px",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(255,45,149,0.28), transparent 70%)",
          top: "5%",
          left: "-25%",
          zIndex: 1,
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 2,
          maxWidth: "420px",
          width: "100%",
        }}
      >
        {/* Heart Icon */}
        <div
          style={{
            width: "120px",
            height: "120px",
            borderRadius: "50%",
            background:
              "linear-gradient(135deg, #FF2D95, #8B5CF6)",
            display: "grid",
            placeItems: "center",
            fontSize: "58px",
            margin: "0 auto 28px",
            boxShadow: "0 0 60px rgba(255,45,149,0.6)",
            border: "4px solid rgba(255,255,255,0.12)",
          }}
        >
          ♡
        </div>

        {/* Title */}
        <h1
          className="gradient-text"
          style={{
            fontSize: "36px",
            fontWeight: 800,
            marginBottom: "10px",
          }}
        >
          AI Girlfriend
        </h1>

        {/* Subtitle */}
        <p
          style={{
            fontSize: "18px",
            color: "#ffffff",
            marginBottom: "10px",
          }}
        >
          Your Perfect AI Companion
        </p>

        {/* Features */}
        <p
          style={{
            fontSize: "14px",
            color: "rgba(255,255,255,0.78)",
            marginBottom: "8px",
          }}
        >
          Chat • Voice • Photos • Memory
        </p>

        <p
          style={{
            fontSize: "14px",
            color: "rgba(255,255,255,0.65)",
            marginBottom: "38px",
          }}
        >
          Always Here For You
        </p>

        {/* Buttons */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          <button
            onClick={onGetStarted}
            className="btn btn-primary"
            style={{
              width: "100%",
              minHeight: "54px",
              fontSize: "17px",
              fontWeight: 700,
            }}
          >
            Get Started
          </button>

          <button
            onClick={() => alert("Sign In feature coming soon!")}
            className="btn btn-secondary"
            style={{
              width: "100%",
              minHeight: "54px",
              fontSize: "17px",
              fontWeight: 700,
            }}
          >
            Sign In
          </button>
        </div>

        {/* Privacy */}
        <div
          style={{
            marginTop: "30px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px",
            fontSize: "12px",
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
