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
        textAlign: "left",
        background: "#05010d",
      }}
    >
      <img
        src="/images/ai-girlfriend.jpg"
        alt="AI Girlfriend"
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          width: "64%",
          height: "100%",
          objectFit: "cover",
          objectPosition: "center top",
          opacity: 0.9,
          zIndex: 0,
        }}
      />

      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 1,
          background:
            "linear-gradient(90deg, #05010d 0%, rgba(5,1,13,0.97) 30%, rgba(5,1,13,0.72) 52%, rgba(5,1,13,0.18) 78%, rgba(5,1,13,0.5) 100%)",
        }}
      />

      <div
        style={{
          position: "absolute",
          width: "360px",
          height: "360px",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(255,45,149,0.28), transparent 70%)",
          top: "22%",
          left: "-120px",
          zIndex: 1,
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 2,
          maxWidth: "520px",
          width: "100%",
          marginRight: "auto",
        }}
      >
        <div
          style={{
            width: "92px",
            height: "92px",
            borderRadius: "50%",
            background: "linear-gradient(135deg, #ff2d95, #8b5cf6)",
            display: "grid",
            placeItems: "center",
            fontSize: "48px",
            marginBottom: "28px",
            boxShadow: "0 0 55px rgba(255,45,149,0.55)",
            border: "3px solid rgba(255,255,255,0.12)",
          }}
        >
          ♡
        </div>

        <h1
          style={{
            fontSize: "clamp(32px, 7vw, 58px)",
            fontWeight: 800,
            marginBottom: "10px",
            lineHeight: 1.05,
          }}
          className="gradient-text"
        >
          AI Girlfriend
        </h1>

        <p
          style={{
            fontSize: "18px",
            color: "#eee7ff",
            marginBottom: "10px",
          }}
        >
          Your Perfect AI Companion
        </p>

        <p
          style={{
            fontSize: "14px",
            color: "rgba(220,210,240,0.78)",
            marginBottom: "12px",
          }}
        >
          Chat&nbsp; • &nbsp;Voice&nbsp; • &nbsp;Photos&nbsp; • &nbsp;Memory
        </p>

        <p
          style={{
            fontSize: "13px",
            color: "rgba(220,210,240,0.72)",
            marginBottom: "42px",
          }}
        >
          Always Here For You
        </p>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "14px",
            maxWidth: "520px",
          }}
        >
          <button
            onClick={onGetStarted}
            className="btn btn-primary"
            style={{
              width: "100%",
              minHeight: "58px",
              fontSize: "18px",
            }}
          >
            Get Started
          </button>

          <button
            onClick={() => alert("Sign In feature coming soon!")}
            className="btn btn-secondary"
            style={{
              width: "100%",
              minHeight: "58px",
              fontSize: "18px",
            }}
          >
            Sign In
          </button>
        </div>

        <div
          style={{
            marginTop: "30px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontSize: "13px",
            color: "var(--muted)",
          }}
        >
          <span>🛡️</span>
          Your privacy matters
        </div>
      </div>
    </div>
  );
}
