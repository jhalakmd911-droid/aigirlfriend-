"use client";

interface OnboardingPageProps {
  onGetStarted: () => void;
  onSignIn?: () => void;
}

export default function OnboardingPage({
  onGetStarted,
  onSignIn,
}: OnboardingPageProps) {
  const handleSignIn = () => {
    if (onSignIn) {
      onSignIn();
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: "40px 20px",
        boxSizing: "border-box",
        position: "relative",
        overflow: "hidden",
        background: "#05010d",
        color: "#ffffff",
        fontFamily:
          "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}
    >
      {/* Background image */}
      <img
        src="/images/ai-girlfriend.jpg"
        alt="AI Girlfriend"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: "center top",
          opacity: 0.62,
          zIndex: 0,
        }}
      />

      {/* Dark / pink overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 1,
          background:
            "linear-gradient(135deg, rgba(5,1,13,0.94) 0%, rgba(35,4,38,0.70) 42%, rgba(5,1,13,0.82) 100%)",
        }}
      />

      {/* Pink glow */}
      <div
        style={{
          position: "absolute",
          width: "420px",
          height: "420px",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(255,20,147,0.32), transparent 68%)",
          top: "8%",
          left: "-150px",
          zIndex: 1,
          pointerEvents: "none",
        }}
      />

      {/* Main content */}
      <div
        style={{
          position: "relative",
          zIndex: 2,
          width: "100%",
          maxWidth: "560px",
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {/* Heart logo */}
        <div
          style={{
            width: "150px",
            height: "150px",
            borderRadius: "50%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            marginBottom: "30px",
            background:
              "linear-gradient(135deg, #ff239d 0%, #9b4dff 100%)",
            border: "5px solid rgba(255,255,255,0.18)",
            boxShadow:
              "0 0 45px rgba(255,25,160,0.55), 0 0 90px rgba(155,77,255,0.25)",
          }}
        >
          <span
            style={{
              fontSize: "82px",
              lineHeight: 1,
              fontWeight: 300,
              color: "#ffffff",
              transform: "translateY(-3px)",
            }}
          >
            ♡
          </span>
        </div>

        {/* Title */}
        <h1
          style={{
            margin: "0 0 18px",
            fontSize: "clamp(42px, 11vw, 68px)",
            lineHeight: 1.05,
            fontWeight: 800,
            letterSpacing: "-2px",
            background:
              "linear-gradient(90deg, #ff239d 0%, #c84cff 55%, #8f55ff 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          AI Girlfriend
        </h1>

        {/* Subtitle */}
        <p
          style={{
            margin: "0 0 22px",
            fontSize: "clamp(22px, 5vw, 30px)",
            lineHeight: 1.3,
            color: "#f7f0ff",
            fontWeight: 400,
          }}
        >
          Your Perfect AI Companion
        </p>

        {/* Features */}
        <p
          style={{
            margin: "0 0 16px",
            fontSize: "clamp(16px, 4vw, 21px)",
            color: "rgba(255,255,255,0.78)",
            letterSpacing: "0.5px",
          }}
        >
          Chat&nbsp; • &nbsp;Voice&nbsp; • &nbsp;Photos&nbsp; • &nbsp;Memory
        </p>

        <p
          style={{
            margin: "0 0 42px",
            fontSize: "clamp(16px, 4vw, 20px)",
            color: "rgba(255,255,255,0.70)",
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
            minHeight: "72px",
            border: "none",
            borderRadius: "24px",
            padding: "16px 24px",
            marginBottom: "18px",
            cursor: "pointer",
            color: "#ffffff",
            fontSize: "24px",
            fontWeight: 700,
            background:
              "linear-gradient(90deg, #ff239d 0%, #bd42e8 50%, #9251ff 100%)",
            boxShadow:
              "0 12px 35px rgba(255,30,160,0.38), 0 0 25px rgba(155,70,255,0.22)",
          }}
        >
          Get Started
        </button>

        {/* Sign In */}
        <button
          type="button"
          onClick={handleSignIn}
          style={{
            width: "100%",
            minHeight: "72px",
            borderRadius: "24px",
            padding: "16px 24px",
            cursor: "pointer",
            color: "#ffffff",
            fontSize: "24px",
            fontWeight: 700,
            background: "rgba(22,10,42,0.72)",
            border: "2px solid rgba(157,77,255,0.65)",
            boxShadow: "0 8px 25px rgba(75,20,120,0.25)",
          }}
        >
          Sign In
        </button>

        {/* Privacy */}
        <div
          style={{
            marginTop: "42px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
            color: "rgba(255,255,255,0.70)",
            fontSize: "17px",
          }}
        >
          <span style={{ fontSize: "23px" }}>🛡️</span>
          <span>Your privacy matters</span>
        </div>
      </div>
    </div>
  );
}
