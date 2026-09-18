"use client";

import { useState, useEffect, ReactNode } from "react";
import {
  verifyPIN,
  isLockEnabled,
  shouldAutoLock,
  updateLastActive,
} from "@/lib/securityManager";

interface PINLockWrapperProps {
  children: ReactNode;
}

export default function PINLockWrapper({ children }: PINLockWrapperProps) {
  const [isLocked, setIsLocked] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [error, setError] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [checking, setChecking] = useState(true);

  // Initial lock check
  useEffect(() => {
    if (typeof window === "undefined") return;

    const lockEnabled = isLockEnabled();
    const wasUnlocked = sessionStorage.getItem("javed_unlocked") === "true";
    const shouldLock = lockEnabled && (!wasUnlocked || shouldAutoLock());

    if (shouldLock) {
      setIsLocked(true);
    } else if (lockEnabled) {
      updateLastActive();
    }

    setChecking(false);
  }, []);

  // Auto-lock on inactivity
  useEffect(() => {
    if (!isLockEnabled()) return;
    if (isLocked) return;

    const events = ["click", "touchstart", "keydown", "mousemove", "scroll"];
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const resetTimer = () => {
      updateLastActive();
      if (timeoutId) clearTimeout(timeoutId);

      const minutes = parseInt(
        localStorage.getItem("javed_auto_lock_minutes") || "5"
      );
      timeoutId = setTimeout(() => {
        setIsLocked(true);
        sessionStorage.removeItem("javed_unlocked");
      }, minutes * 60 * 1000);
    };

    events.forEach((e) => document.addEventListener(e, resetTimer));
    resetTimer();

    return () => {
      events.forEach((e) => document.removeEventListener(e, resetTimer));
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isLocked]);

  const handlePINInput = (value: string) => {
    const cleaned = value.replace(/\D/g, "").slice(0, 4);
    setPinInput(cleaned);
    setError("");

    if (cleaned.length === 4) {
      setTimeout(() => {
        const success = verifyPIN(cleaned);
        if (success) {
          sessionStorage.setItem("javed_unlocked", "true");
          updateLastActive();
          setIsLocked(false);
          setPinInput("");
          setAttempts(0);
        } else {
          setError("ভুল PIN");
          setPinInput("");
          setAttempts((prev) => prev + 1);
        }
      }, 200);
    }
  };

  if (checking) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          background: "#05010f",
          color: "#fff",
        }}
      >
        <div
          style={{
            width: "60px",
            height: "60px",
            borderRadius: "50%",
            background: "linear-gradient(135deg, #FF2D95, #8B5CF6)",
            display: "grid",
            placeItems: "center",
            fontSize: "28px",
            boxShadow: "0 0 40px rgba(255,45,149,0.6)",
          }}
        >
          🛡️
        </div>
      </div>
    );
  }

  if (isLocked) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          background:
            "radial-gradient(circle at 20% 20%, rgba(255,45,149,0.15), transparent 40%), radial-gradient(circle at 80% 80%, rgba(139,92,246,0.15), transparent 40%), #05010f",
          padding: "20px",
        }}
      >
        <div style={{ width: "100%", maxWidth: "360px", textAlign: "center" }}>
          <div
            style={{
              width: "100px",
              height: "100px",
              margin: "0 auto 24px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #FF2D95, #8B5CF6)",
              display: "grid",
              placeItems: "center",
              fontSize: "48px",
              boxShadow: "0 0 60px rgba(255,45,149,0.6)",
            }}
          >
            🔒
          </div>

          <h1
            style={{
              fontSize: "22px",
              fontWeight: 800,
              color: "#fff",
              marginBottom: "8px",
            }}
          >
            App Locked
          </h1>

          <p style={{ fontSize: "13px", color: "#9d94b8", marginBottom: "32px" }}>
            PIN দিন অ্যাপ খুলতে
          </p>

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "16px",
              marginBottom: "32px",
            }}
          >
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                style={{
                  width: "18px",
                  height: "18px",
                  borderRadius: "50%",
                  background:
                    i < pinInput.length
                      ? "linear-gradient(135deg, #FF2D95, #8B5CF6)"
                      : "rgba(139,92,246,0.25)",
                  border:
                    i < pinInput.length
                      ? "2px solid rgba(255,45,149,0.6)"
                      : "2px solid rgba(139,92,246,0.4)",
                  boxShadow:
                    i < pinInput.length
                      ? "0 0 15px rgba(255,45,149,0.6)"
                      : "none",
                  transition: "all 0.2s ease",
                }}
              />
            ))}
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "12px",
              maxWidth: "280px",
              margin: "0 auto",
            }}
          >
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <button
                key={num}
                onClick={() => handlePINInput(pinInput + num.toString())}
                style={{
                  height: "60px",
                  borderRadius: "16px",
                  background: "rgba(139,92,246,0.15)",
                  border: "1px solid rgba(139,92,246,0.35)",
                  color: "#fff",
                  fontSize: "22px",
                  fontWeight: 700,
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
              >
                {num}
              </button>
            ))}
            <div />
            <button
              onClick={() => handlePINInput(pinInput + "0")}
              style={{
                height: "60px",
                borderRadius: "16px",
                background: "rgba(139,92,246,0.15)",
                border: "1px solid rgba(139,92,246,0.35)",
                color: "#fff",
                fontSize: "22px",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              0
            </button>
            <button
              onClick={() => setPinInput(pinInput.slice(0, -1))}
              style={{
                height: "60px",
                borderRadius: "16px",
                background: "rgba(139,92,246,0.15)",
                border: "1px solid rgba(139,92,246,0.35)",
                color: "#fff",
                fontSize: "20px",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              ⌫
            </button>
          </div>

          {error && (
            <p
              style={{
                marginTop: "20px",
                fontSize: "13px",
                color: "#ef4444",
                fontWeight: 600,
              }}
            >
              ⚠️ {error}
            </p>
          )}

          {attempts >= 3 && (
            <p style={{ marginTop: "12px", fontSize: "11px", color: "#9d94b8" }}>
              একাধিক ভুল চেষ্টা হয়েছে
            </p>
          )}
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
