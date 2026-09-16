"use client";

interface HomePageProps {
  onNavigate: (tab: string) => void;
}

export default function HomePage({ onNavigate }: HomePageProps) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "14px",
        paddingBottom: "20px",
        paddingTop: "20px",
      }}
    >
      {/* Header */}
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "22px 0 18px",
        }}
      >
        <div>
          <div
            className="gradient-text"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "26px",
              fontWeight: 800,
              letterSpacing: "-0.6px",
            }}
          >
            AI Girlfriend
          </div>

          <p
            style={{
              marginTop: "5px",
              fontSize: "13px",
              color: "var(--muted)",
            }}
          >
            Your personal AI companion
          </p>
        </div>

        <button
          type="button"
          aria-label="Profile"
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
          ♡
        </button>
      </header>

      {/* Main Hero Section */}
      <section
        className="card"
        style={{
          position: "relative",
          overflow: "hidden",
          padding: "34px 22px 30px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            position: "absolute",
            width: "180px",
            height: "180px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(255,79,154,0.18), transparent 70%)",
            top: "-80px",
            left: "-60px",
          }}
        />

        <div
          style={{
            position: "absolute",
            width: "180px",
            height: "180px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(139,92,246,0.18), transparent 70%)",
            bottom: "-90px",
            right: "-60px",
          }}
        />

        <div
          style={{
            position: "relative",
            width: "118px",
            height: "118px",
            margin: "0 auto 22px",
            borderRadius: "36px",
            display: "grid",
            placeItems: "center",
            background: "linear-gradient(135deg, #FF4F9A, #8B5CF6)",
            color: "#ffffff",
            fontSize: "58px",
            boxShadow: "0 18px 45px rgba(139,92,246,0.30)",
          }}
        >
          ♡
        </div>

        <h1
          style={{
            position: "relative",
            fontSize: "30px",
            lineHeight: 1.15,
            letterSpacing: "-0.8px",
          }}
        >
          Meet your AI companion
        </h1>

        <p
          style={{
            position: "relative",
            margin: "13px auto 0",
            maxWidth: "360px",
            fontSize: "15px",
            lineHeight: 1.6,
            color: "var(--muted)",
          }}
        >
          Chat, talk, and spend time with a friendly AI companion that feels
          natural and personal.
        </p>

        <button
          type="button"
          className="btn btn-primary"
          onClick={() => onNavigate("chat")}
          style={{
            position: "relative",
            marginTop: "26px",
            width: "100%",
            maxWidth: "320px",
            minHeight: "52px",
            fontSize: "15px",
            fontWeight: 700,
          }}
        >
          Start chatting
        </button>
      </section>

      {/* Quick Actions */}
      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
          gap: "12px",
        }}
      >
        <button
          type="button"
          className="card"
          onClick={() => onNavigate("chat")}
          style={{
            padding: "20px 16px",
            textAlign: "left",
            color: "var(--foreground)",
            cursor: "pointer",
            background: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-lg)",
          }}
        >
          <div
            style={{
              width: "42px",
              height: "42px",
              borderRadius: "14px",
              display: "grid",
              placeItems: "center",
              background: "rgba(255,79,154,0.12)",
              fontSize: "24px",
              marginBottom: "12px",
            }}
          >
            ♡
          </div>

          <strong style={{ fontSize: "16px" }}>Chat</strong>

          <p
            style={{
              fontSize: "13px",
              marginTop: "5px",
              color: "var(--muted)",
            }}
          >
            Have a conversation
          </p>
        </button>

        <button
          type="button"
          className="card"
          onClick={() => onNavigate("voice")}
          style={{
            padding: "20px 16px",
            textAlign: "left",
            color: "var(--foreground)",
            cursor: "pointer",
            background: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-lg)",
          }}
        >
          <div
            style={{
              width: "42px",
              height: "42px",
              borderRadius: "14px",
              display: "grid",
              placeItems: "center",
              background: "rgba(139,92,246,0.12)",
              fontSize: "24px",
              marginBottom: "12px",
            }}
          >
            ◉
          </div>

          <strong style={{ fontSize: "16px" }}>Voice</strong>

          <p
            style={{
              fontSize: "13px",
              marginTop: "5px",
              color: "var(--muted)",
            }}
          >
            Talk naturally
          </p>
        </button>
      </section>

      {/* Info Section */}
      <section
        className="card"
        style={{
          marginTop: "14px",
          padding: "21px",
        }}
      >
        <h2 style={{ fontSize: "19px" }}>Your companion</h2>

        <p
          style={{
            marginTop: "7px",
            fontSize: "14px",
            lineHeight: 1.55,
            color: "var(--muted)",
          }}
        >
          Your conversations and preferences can become more personal as your
          companion gets to know you.
        </p>
      </section>
    </div>
  );
}
