"use client";

import { useState, useEffect } from "react";

interface UpdateInfo {
  version: string;
  date: string;
  message: string;
  sha: string;
}

export default function UpdatePage() {
  const [currentVersion] = useState("1.0.0");
  const [latestUpdate, setLatestUpdate] = useState<UpdateInfo | null>(null);
  const [checking, setChecking] = useState(true);
  const [hasUpdate, setHasUpdate] = useState(false);
  const [error, setError] = useState("");

  const REPO = "jhalakmd911-droid/aigirlfriend-";

  useEffect(() => {
    const checkForUpdates = async () => {
      try {
        const res = await fetch(
          `https://api.github.com/repos/${REPO}/commits?per_page=1`
        );

        if (!res.ok) throw new Error("GitHub API error");

        const data = await res.json();

        if (data && data.length > 0) {
          const commit = data[0];
          const commitDate = new Date(commit.commit.author.date);
          const lastCheckedKey = "aigirlfriend_last_update_check";
          const lastChecked = localStorage.getItem(lastCheckedKey);

          const info: UpdateInfo = {
            version: commit.sha.slice(0, 7),
            date: commitDate.toLocaleString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            }),
            message: commit.commit.message.split("\n")[0],
            sha: commit.sha,
          };

          setLatestUpdate(info);

          if (lastChecked !== commit.sha) {
            setHasUpdate(true);
          }
        }
      } catch (err: any) {
        setError(err.message || "Failed to check updates");
      } finally {
        setChecking(false);
      }
    };

    checkForUpdates();
  }, []);

  const handleUpdate = () => {
    if (latestUpdate) {
      localStorage.setItem(
        "aigirlfriend_last_update_check",
        latestUpdate.sha
      );
    }
    window.location.reload();
  };

  const handleCheckAgain = () => {
    setChecking(true);
    setError("");
    window.location.reload();
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
          onClick={handleCheckAgain}
          style={{
            width: "46px",
            height: "46px",
            borderRadius: "50%",
            border: "1px solid rgba(139,92,246,0.35)",
            display: "grid",
            placeItems: "center",
            background: "linear-gradient(135deg, #FF2D95, #8B5CF6)",
            color: "#ffffff",
            fontSize: "20px",
            boxShadow: "0 10px 30px rgba(139,92,246,0.35)",
            cursor: "pointer",
          }}
        >
          ↻
        </button>
      </header>

      {/* Checking State */}
      {checking && (
        <section
          className="card"
          style={{
            padding: "40px 24px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: "40px",
              marginBottom: "16px",
              animation: "spin 1s linear infinite",
            }}
          >
            ⏳
          </div>
          <h2 style={{ fontSize: "20px", marginBottom: "8px", color: "#fff" }}>
            Checking for updates...
          </h2>
          <p style={{ fontSize: "13px", color: "var(--muted)" }}>
            Please wait a moment
          </p>
          <style>{`
            @keyframes spin {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
          `}</style>
        </section>
      )}

      {/* Error State */}
      {!checking && error && (
        <section
          className="card"
          style={{
            padding: "32px 24px",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>⚠️</div>
          <h2 style={{ fontSize: "20px", marginBottom: "10px", color: "#fff" }}>
            Couldn't check updates
          </h2>
          <p style={{ fontSize: "13px", color: "var(--muted)", marginBottom: "20px" }}>
            {error}
          </p>
          <button
            className="btn btn-primary"
            onClick={handleCheckAgain}
            style={{ width: "100%", minHeight: "48px" }}
          >
            Try Again
          </button>
        </section>
      )}

      {/* Update Available */}
      {!checking && !error && hasUpdate && latestUpdate && (
        <>
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
                  "radial-gradient(circle, rgba(255,45,149,0.18), transparent 70%)",
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
                  "radial-gradient(circle, rgba(139,92,246,0.18), transparent 70%)",
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
                background: "linear-gradient(135deg, #FF2D95, #8B5CF6)",
                color: "#ffffff",
                fontSize: "56px",
                boxShadow: "0 18px 45px rgba(255,45,149,0.35)",
              }}
            >
              🚀
            </div>

            <h2
              style={{
                fontSize: "22px",
                marginBottom: "10px",
                position: "relative",
                color: "#fff",
              }}
            >
              New Update Available
            </h2>

            <p
              style={{
                fontSize: "13px",
                color: "var(--muted)",
                marginBottom: "20px",
                position: "relative",
              }}
            >
              A newer version of the app is ready.
            </p>

            <div
              style={{
                display: "flex",
                justifyContent: "space-around",
                padding: "14px 0",
                borderTop: "1px solid rgba(139,92,246,0.25)",
                borderBottom: "1px solid rgba(139,92,246,0.25)",
                marginBottom: "20px",
                position: "relative",
              }}
            >
              <div>
                <p style={{ fontSize: "11px", color: "var(--muted)" }}>
                  CURRENT
                </p>
                <p style={{ fontSize: "14px", fontWeight: 700, color: "#fff" }}>
                  v{currentVersion}
                </p>
              </div>
              <div>
                <p style={{ fontSize: "11px", color: "var(--muted)" }}>
                  LATEST
                </p>
                <p
                  style={{
                    fontSize: "14px",
                    fontWeight: 700,
                    color: "#FF2D95",
                  }}
                >
                  {latestUpdate.version}
                </p>
              </div>
            </div>

            <button
              className="btn btn-primary"
              onClick={handleUpdate}
              style={{
                width: "100%",
                minHeight: "52px",
                position: "relative",
                fontSize: "15px",
                fontWeight: 700,
              }}
            >
              ⚡ Update Now
            </button>
          </section>

          {/* Update Details */}
          <h3
            style={{
              fontSize: "18px",
              marginBottom: "12px",
              fontWeight: 600,
              color: "#fff",
            }}
          >
            What's New
          </h3>

          <div className="card" style={{ padding: "16px", marginBottom: "12px" }}>
            <p
              style={{
                fontSize: "12px",
                color: "var(--muted)",
                marginBottom: "6px",
              }}
            >
              {latestUpdate.date}
            </p>
            <p
              style={{
                fontSize: "14px",
                color: "#fff",
                lineHeight: 1.5,
              }}
            >
              {latestUpdate.message}
            </p>
          </div>
        </>
      )}

      {/* Up to Date */}
      {!checking && !error && !hasUpdate && latestUpdate && (
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
              boxShadow: "0 18px 45px rgba(34,197,94,0.35)",
            }}
          >
            ✓
          </div>

          <h2
            style={{
              fontSize: "22px",
              marginBottom: "10px",
              position: "relative",
              color: "#fff",
            }}
          >
            You're Up to Date!
          </h2>

          <p
            style={{
              fontSize: "13px",
              color: "var(--muted)",
              marginBottom: "20px",
              position: "relative",
            }}
          >
            You have the latest version of the app.
          </p>

          <div
            style={{
              display: "flex",
              justifyContent: "space-around",
              padding: "14px 0",
              borderTop: "1px solid rgba(139,92,246,0.25)",
              position: "relative",
            }}
          >
            <div>
              <p style={{ fontSize: "11px", color: "var(--muted)" }}>
                VERSION
              </p>
              <p style={{ fontSize: "14px", fontWeight: 700, color: "#fff" }}>
                {latestUpdate.version}
              </p>
            </div>
            <div>
              <p style={{ fontSize: "11px", color: "var(--muted)" }}>
                LAST UPDATE
              </p>
              <p style={{ fontSize: "12px", fontWeight: 600, color: "#fff" }}>
                {latestUpdate.date}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Info Card */}
      <section
        className="card"
        style={{
          padding: "16px",
          marginTop: "16px",
        }}
      >
        <p style={{ fontSize: "13px", lineHeight: 1.6, color: "var(--muted)" }}>
          💡 <strong>How it works:</strong> This page checks your GitHub
          repository for the latest commit. When you tap "Update Now", the app
          reloads with the newest version. No download needed.
        </p>
      </section>
    </div>
  );
}
