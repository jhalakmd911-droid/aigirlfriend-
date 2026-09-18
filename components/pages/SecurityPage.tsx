"use client";

import { useState, useEffect } from "react";
import {
  hasPIN,
  setPIN,
  verifyPIN,
  removePIN,
  changePIN,
  isLockEnabled,
  setLockEnabled,
  getAutoLockMinutes,
  setAutoLockMinutes,
  getSecurityLogs,
  clearSecurityLogs,
  SecurityLogEntry,
} from "@/lib/securityManager";

export default function SecurityPage() {
  const [secHasPIN, setSecHasPIN] = useState(false);
  const [secLockEnabled, setSecLockEnabled] = useState(false);
  const [secAutoLock, setSecAutoLock] = useState(5);
  const [secLogs, setSecLogs] = useState<SecurityLogEntry[]>([]);

  const [showSetupModal, setShowSetupModal] = useState(false);
  const [showChangeModal, setShowChangeModal] = useState(false);
  const [showLogsModal, setShowLogsModal] = useState(false);

  const [pinInput, setPinInput] = useState("");
  const [pinConfirm, setPinConfirm] = useState("");
  const [oldPinInput, setOldPinInput] = useState("");
  const [newPinInput, setNewPinInput] = useState("");
  const [pinError, setPinError] = useState("");

  const refresh = () => {
    setSecHasPIN(hasPIN());
    setSecLockEnabled(isLockEnabled());
    setSecAutoLock(getAutoLockMinutes());
    setSecLogs(getSecurityLogs());
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    refresh();
  }, []);

  // ============================================
  // PIN Setup
  // ============================================
  const handleSetupPIN = () => {
    setPinError("");
    if (!/^\d{4}$/.test(pinInput)) {
      setPinError("৪ ডিজিটের PIN দিন (শুধু সংখ্যা)");
      return;
    }
    if (pinInput !== pinConfirm) {
      setPinError("PIN দুটো মিলছে না");
      return;
    }
    if (setPIN(pinInput)) {
      setLockEnabled(true);
      setPinInput("");
      setPinConfirm("");
      setShowSetupModal(false);
      refresh();
    } else {
      setPinError("PIN সেট করতে ব্যর্থ");
    }
  };

  // ============================================
  // Change PIN
  // ============================================
  const handleChangePIN = () => {
    setPinError("");
    if (!/^\d{4}$/.test(oldPinInput)) {
      setPinError("পুরনো PIN দিন");
      return;
    }
    if (!/^\d{4}$/.test(newPinInput)) {
      setPinError("নতুন PIN ৪ ডিজিটের হতে হবে");
      return;
    }
    if (changePIN(oldPinInput, newPinInput)) {
      setOldPinInput("");
      setNewPinInput("");
      setShowChangeModal(false);
      refresh();
      alert("✅ PIN পরিবর্তন সফল!");
    } else {
      setPinError("পুরনো PIN ভুল");
    }
  };

  // ============================================
  // Remove PIN
  // ============================================
  const handleRemovePIN = () => {
    if (!confirm("PIN সরিয়ে ফেললে Lock বন্ধ হয়ে যাবে। চালিয়ে যাবেন?"))
      return;
    removePIN();
    refresh();
  };

  // ============================================
  // Toggle Lock
  // ============================================
  const handleToggleLock = () => {
    if (!secHasPIN) {
      setShowSetupModal(true);
      return;
    }
    setLockEnabled(!secLockEnabled);
    refresh();
  };

  // ============================================
  // Auto-lock Change
  // ============================================
  const handleAutoLockChange = (min: number) => {
    setAutoLockMinutes(min);
    setSecAutoLock(min);
  };

  // ============================================
  // Clear Logs
  // ============================================
  const handleClearLogs = () => {
    if (!confirm("সব Security Log মুছে ফেলবেন?")) return;
    clearSecurityLogs();
    refresh();
  };

  // ============================================
  // Log Type Colors
  // ============================================
  const getLogColor = (type: SecurityLogEntry["type"]) => {
    switch (type) {
      case "unlock":
        return "#22c55e";
      case "lock":
        return "#8B5CF6";
      case "wrong_pin":
        return "#ef4444";
      case "setup":
        return "#FF2D95";
      case "change":
        return "#f59e0b";
      default:
        return "#9d94b8";
    }
  };

  const getLogIcon = (type: SecurityLogEntry["type"]) => {
    switch (type) {
      case "unlock":
        return "🔓";
      case "lock":
        return "🔒";
      case "wrong_pin":
        return "⚠️";
      case "setup":
        return "✨";
      case "change":
        return "🔄";
      default:
        return "📋";
    }
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
          marginBottom: "16px",
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
            Security
          </h1>
          <p
            style={{
              marginTop: "5px",
              fontSize: "13px",
              color: "var(--muted)",
            }}
          >
            Javed-এর সুরক্ষা
          </p>
        </div>

        <div
          style={{
            width: "46px",
            height: "46px",
            borderRadius: "50%",
            border: "1px solid rgba(139,92,246,0.35)",
            display: "grid",
            placeItems: "center",
            background: "linear-gradient(135deg, #FF2D95, #8B5CF6)",
            color: "#ffffff",
            fontSize: "22px",
            boxShadow: "0 10px 30px rgba(255,45,149,0.4)",
          }}
        >
          🛡️
        </div>
      </header>

      {/* Status Card */}
      <section
        className="card"
        style={{
          padding: "20px 18px",
          marginBottom: "16px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            width: "160px",
            height: "160px",
            borderRadius: "50%",
            background: secLockEnabled
              ? "radial-gradient(circle, rgba(34,197,94,0.22), transparent 70%)"
              : "radial-gradient(circle, rgba(239,68,68,0.22), transparent 70%)",
            top: "-70px",
            right: "-70px",
          }}
        />

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "14px",
            position: "relative",
          }}
        >
          <div
            style={{
              width: "60px",
              height: "60px",
              borderRadius: "50%",
              display: "grid",
              placeItems: "center",
              background: secLockEnabled
                ? "linear-gradient(135deg, #22c55e, #16a34a)"
                : "linear-gradient(135deg, #ef4444, #dc2626)",
              fontSize: "30px",
              boxShadow: secLockEnabled
                ? "0 0 30px rgba(34,197,94,0.5)"
                : "0 0 30px rgba(239,68,68,0.5)",
            }}
          >
            {secLockEnabled ? "🔒" : "🔓"}
          </div>

          <div style={{ flex: 1 }}>
            <h2
              style={{
                fontSize: "16px",
                fontWeight: 700,
                color: "#fff",
                marginBottom: "4px",
              }}
            >
              {secLockEnabled ? "Protected" : "Unprotected"}
            </h2>
            <p style={{ fontSize: "12px", color: "var(--muted)" }}>
              {secLockEnabled
                ? `Auto-lock: ${secAutoLock} মিনিট`
                : "PIN Lock চালু নেই"}
            </p>
          </div>
        </div>
      </section>

      {/* Lock Toggle */}
      <section
        className="card"
        style={{ padding: "16px", marginBottom: "12px" }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <p style={{ fontSize: "14px", fontWeight: 700, color: "#fff" }}>
              🔒 PIN Lock
            </p>
            <p
              style={{
                fontSize: "11px",
                color: "var(--muted)",
                marginTop: "2px",
              }}
            >
              {secLockEnabled
                ? "✅ চালু আছে"
                : secHasPIN
                ? "বন্ধ আছে"
                : "PIN সেট করা হয়নি"}
            </p>
          </div>
          <button
            onClick={handleToggleLock}
            style={{
              padding: "10px 20px",
              borderRadius: "10px",
              background: secLockEnabled
                ? "linear-gradient(135deg, #22c55e, #16a34a)"
                : "rgba(139,92,246,0.3)",
              border: "none",
              color: "#fff",
              fontSize: "13px",
              fontWeight: 700,
              cursor: "pointer",
              minWidth: "80px",
              boxShadow: secLockEnabled
                ? "0 0 20px rgba(34,197,94,0.5)"
                : "none",
            }}
          >
            {secLockEnabled ? "ON" : "OFF"}
          </button>
        </div>
      </section>

      {/* Auto Lock */}
      {secHasPIN && (
        <section
          className="card"
          style={{ padding: "16px", marginBottom: "12px" }}
        >
          <p
            style={{
              fontSize: "14px",
              fontWeight: 700,
              color: "#fff",
              marginBottom: "12px",
            }}
          >
            ⏱️ Auto-lock
          </p>
          <div style={{ display: "flex", gap: "8px" }}>
            {[1, 5, 10, 30].map((min) => (
              <button
                key={min}
                onClick={() => handleAutoLockChange(min)}
                style={{
                  flex: 1,
                  padding: "12px 8px",
                  borderRadius: "10px",
                  background:
                    secAutoLock === min
                      ? "linear-gradient(135deg, #FF2D95, #8B5CF6)"
                      : "rgba(139,92,246,0.2)",
                  border:
                    secAutoLock === min
                      ? "1px solid rgba(255,45,149,0.6)"
                      : "1px solid rgba(139,92,246,0.3)",
                  color: "#fff",
                  fontSize: "12px",
                  fontWeight: 700,
                  cursor: "pointer",
                  boxShadow:
                    secAutoLock === min
                      ? "0 0 15px rgba(255,45,149,0.4)"
                      : "none",
                }}
              >
                {min}m
              </button>
            ))}
          </div>
          <p
            style={{
              fontSize: "11px",
              color: "var(--muted)",
              marginTop: "10px",
              lineHeight: 1.5,
            }}
          >
            নিষ্ক্রিয় থাকলে {secAutoLock} মিনিট পর অ্যাপ lock হবে।
          </p>
        </section>
      )}

      {/* Setup/Change/Remove PIN */}
      {!secHasPIN ? (
        <button
          onClick={() => {
            setPinInput("");
            setPinConfirm("");
            setPinError("");
            setShowSetupModal(true);
          }}
          style={{
            width: "100%",
            padding: "16px",
            borderRadius: "14px",
            background: "linear-gradient(135deg, #FF2D95, #8B5CF6)",
            color: "#fff",
            fontSize: "14px",
            fontWeight: 700,
            border: "none",
            cursor: "pointer",
            boxShadow: "0 12px 30px rgba(255,45,149,0.4)",
            marginBottom: "12px",
          }}
        >
          ➕ PIN সেট করুন
        </button>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "10px",
            marginBottom: "12px",
          }}
        >
          <button
            onClick={() => {
              setOldPinInput("");
              setNewPinInput("");
              setPinError("");
              setShowChangeModal(true);
            }}
            style={{
              padding: "14px",
              borderRadius: "14px",
              background: "rgba(139,92,246,0.2)",
              border: "1px solid rgba(139,92,246,0.5)",
              color: "#fff",
              fontSize: "13px",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            🔄 Change PIN
          </button>
          <button
            onClick={handleRemovePIN}
            style={{
              padding: "14px",
              borderRadius: "14px",
              background: "rgba(239,68,68,0.15)",
              border: "1px solid rgba(239,68,68,0.5)",
              color: "#ef4444",
              fontSize: "13px",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            🗑️ Remove PIN
          </button>
        </div>
      )}

      {/* Security Logs Button */}
      <button
        onClick={() => setShowLogsModal(true)}
        style={{
          width: "100%",
          padding: "16px",
          borderRadius: "14px",
          background: "rgba(139,92,246,0.15)",
          border: "1px solid rgba(139,92,246,0.4)",
          color: "#fff",
          fontSize: "14px",
          fontWeight: 700,
          cursor: "pointer",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span>📋 Security Logs</span>
        <span
          style={{
            padding: "2px 10px",
            borderRadius: "10px",
            background: "rgba(255,45,149,0.25)",
            color: "#FF2D95",
            fontSize: "12px",
          }}
        >
          {secLogs.length}
        </span>
      </button>

      {/* Info Card */}
      <section
        className="card"
        style={{ padding: "16px", marginTop: "16px" }}
      >
        <p style={{ fontSize: "12px", lineHeight: 1.6, color: "var(--muted)" }}>
          💡 <strong>নিরাপত্তা টিপস:</strong>
          <br />• সহজ PIN দেবেন না (1234, 0000)
          <br />• অন্য কারো সাথে PIN শেয়ার করবেন না
          <br />• নিয়মিত PIN পরিবর্তন করুন
          <br />• আপনার ডেটা শুধু আপনার ফোনে থাকে
        </p>
      </section>

      {/* ============================================ */}
      {/* SETUP PIN MODAL */}
      {/* ============================================ */}
      {showSetupModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.8)",
            backdropFilter: "blur(8px)",
            display: "grid",
            placeItems: "center",
            zIndex: 100,
            padding: "20px",
          }}
          onClick={() => setShowSetupModal(false)}
        >
          <div
            style={{
              background: "rgba(20, 12, 40, 0.98)",
              border: "1px solid rgba(139,92,246,0.4)",
              borderRadius: "20px",
              padding: "24px",
              maxWidth: "400px",
              width: "100%",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                fontSize: "44px",
                textAlign: "center",
                marginBottom: "8px",
              }}
            >
              🔒
            </div>
            <h3
              style={{
                color: "#fff",
                fontSize: "18px",
                marginBottom: "8px",
                textAlign: "center",
              }}
            >
              PIN সেট করুন
            </h3>
            <p
              style={{
                color: "var(--muted)",
                fontSize: "12px",
                marginBottom: "20px",
                textAlign: "center",
              }}
            >
              ৪ ডিজিটের PIN দিন (শুধু সংখ্যা)
            </p>

            <input
              type="tel"
              inputMode="numeric"
              maxLength={4}
              value={pinInput}
              onChange={(e) =>
                setPinInput(e.target.value.replace(/\D/g, "").slice(0, 4))
              }
              placeholder="• • • •"
              style={{
                width: "100%",
                padding: "16px",
                borderRadius: "12px",
                border: "1px solid rgba(139,92,246,0.4)",
                background: "rgba(11,4,32,0.65)",
                color: "#fff",
                fontSize: "24px",
                letterSpacing: "8px",
                textAlign: "center",
                outline: "none",
                marginBottom: "12px",
              }}
            />

            <input
              type="tel"
              inputMode="numeric"
              maxLength={4}
              value={pinConfirm}
              onChange={(e) =>
                setPinConfirm(e.target.value.replace(/\D/g, "").slice(0, 4))
              }
              placeholder="Confirm PIN"
              style={{
                width: "100%",
                padding: "16px",
                borderRadius: "12px",
                border: "1px solid rgba(139,92,246,0.4)",
                background: "rgba(11,4,32,0.65)",
                color: "#fff",
                fontSize: "24px",
                letterSpacing: "8px",
                textAlign: "center",
                outline: "none",
                marginBottom: "12px",
              }}
            />

            {pinError && (
              <p
                style={{
                  fontSize: "12px",
                  color: "#ef4444",
                  textAlign: "center",
                  marginBottom: "12px",
                }}
              >
                ⚠️ {pinError}
              </p>
            )}

            <div style={{ display: "flex", gap: "10px" }}>
              <button
                onClick={handleSetupPIN}
                style={{
                  flex: 1,
                  padding: "14px",
                  borderRadius: "12px",
                  background: "linear-gradient(135deg, #FF2D95, #8B5CF6)",
                  color: "#fff",
                  fontSize: "14px",
                  fontWeight: 700,
                  border: "none",
                  cursor: "pointer",
                }}
              >
                ✅ Save
              </button>
              <button
                onClick={() => setShowSetupModal(false)}
                style={{
                  flex: 1,
                  padding: "14px",
                  borderRadius: "12px",
                  background: "rgba(139,92,246,0.2)",
                  border: "1px solid rgba(139,92,246,0.4)",
                  color: "#fff",
                  fontSize: "14px",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================ */}
      {/* CHANGE PIN MODAL */}
      {/* ============================================ */}
      {showChangeModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.8)",
            backdropFilter: "blur(8px)",
            display: "grid",
            placeItems: "center",
            zIndex: 100,
            padding: "20px",
          }}
          onClick={() => setShowChangeModal(false)}
        >
          <div
            style={{
              background: "rgba(20, 12, 40, 0.98)",
              border: "1px solid rgba(139,92,246,0.4)",
              borderRadius: "20px",
              padding: "24px",
              maxWidth: "400px",
              width: "100%",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                fontSize: "44px",
                textAlign: "center",
                marginBottom: "8px",
              }}
            >
              🔄
            </div>
            <h3
              style={{
                color: "#fff",
                fontSize: "18px",
                marginBottom: "8px",
                textAlign: "center",
              }}
            >
              PIN পরিবর্তন
            </h3>

            <input
              type="tel"
              inputMode="numeric"
              maxLength={4}
              value={oldPinInput}
              onChange={(e) =>
                setOldPinInput(e.target.value.replace(/\D/g, "").slice(0, 4))
              }
              placeholder="পুরনো PIN"
              style={{
                width: "100%",
                padding: "16px",
                borderRadius: "12px",
                border: "1px solid rgba(139,92,246,0.4)",
                background: "rgba(11,4,32,0.65)",
                color: "#fff",
                fontSize: "20px",
                letterSpacing: "6px",
                textAlign: "center",
                outline: "none",
                marginBottom: "12px",
              }}
            />

            <input
              type="tel"
              inputMode="numeric"
              maxLength={4}
              value={newPinInput}
              onChange={(e) =>
                setNewPinInput(e.target.value.replace(/\D/g, "").slice(0, 4))
              }
              placeholder="নতুন PIN"
              style={{
                width: "100%",
                padding: "16px",
                borderRadius: "12px",
                border: "1px solid rgba(139,92,246,0.4)",
                background: "rgba(11,4,32,0.65)",
                color: "#fff",
                fontSize: "20px",
                letterSpacing: "6px",
                textAlign: "center",
                outline: "none",
                marginBottom: "12px",
              }}
            />

            {pinError && (
              <p
                style={{
                  fontSize: "12px",
                  color: "#ef4444",
                  textAlign: "center",
                  marginBottom: "12px",
                }}
              >
                ⚠️ {pinError}
              </p>
            )}

            <div style={{ display: "flex", gap: "10px" }}>
              <button
                onClick={handleChangePIN}
                style={{
                  flex: 1,
                  padding: "14px",
                  borderRadius: "12px",
                  background: "linear-gradient(135deg, #FF2D95, #8B5CF6)",
                  color: "#fff",
                  fontSize: "14px",
                  fontWeight: 700,
                  border: "none",
                  cursor: "pointer",
                }}
              >
                ✅ Change
              </button>
              <button
                onClick={() => setShowChangeModal(false)}
                style={{
                  flex: 1,
                  padding: "14px",
                  borderRadius: "12px",
                  background: "rgba(139,92,246,0.2)",
                  border: "1px solid rgba(139,92,246,0.4)",
                  color: "#fff",
                  fontSize: "14px",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================ */}
      {/* SECURITY LOGS MODAL */}
      {/* ============================================ */}
      {showLogsModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.8)",
            backdropFilter: "blur(8px)",
            display: "grid",
            placeItems: "center",
            zIndex: 100,
            padding: "20px",
          }}
          onClick={() => setShowLogsModal(false)}
        >
          <div
            style={{
              background: "rgba(20, 12, 40, 0.98)",
              border: "1px solid rgba(139,92,246,0.4)",
              borderRadius: "20px",
              padding: "24px",
              maxWidth: "500px",
              width: "100%",
              maxHeight: "80vh",
              overflowY: "auto",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3
              style={{
                color: "#fff",
                fontSize: "18px",
                marginBottom: "8px",
              }}
            >
              📋 Security Logs
            </h3>
            <p
              style={{
                color: "var(--muted)",
                fontSize: "12px",
                marginBottom: "16px",
              }}
            >
              মোট {secLogs.length}টি ইভেন্ট
            </p>

            {secLogs.length === 0 ? (
              <p
                style={{
                  color: "var(--muted)",
                  fontSize: "13px",
                  textAlign: "center",
                  padding: "30px 20px",
                }}
              >
                এখনো কোনো লগ নেই
              </p>
            ) : (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                  marginBottom: "16px",
                }}
              >
                {[...secLogs].reverse().map((log) => (
                  <div
                    key={log.id}
                    style={{
                      padding: "10px 12px",
                      borderRadius: "10px",
                      background: "rgba(139,92,246,0.12)",
                      border: `1px solid ${getLogColor(log.type)}40`,
                      display: "flex",
                      gap: "10px",
                      alignItems: "flex-start",
                    }}
                  >
                    <span style={{ fontSize: "18px" }}>
                      {getLogIcon(log.type)}
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: "13px", color: "#fff" }}>
                        {log.message}
                      </p>
                      <p
                        style={{
                          fontSize: "10px",
                          color: "var(--muted)",
                          marginTop: "2px",
                        }}
                      >
                        {log.date}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div style={{ display: "flex", gap: "10px" }}>
              {secLogs.length > 0 && (
                <button
                  onClick={handleClearLogs}
                  style={{
                    flex: 1,
                    padding: "12px",
                    borderRadius: "12px",
                    background: "rgba(239,68,68,0.15)",
                    border: "1px solid rgba(239,68,68,0.5)",
                    color: "#ef4444",
                    fontSize: "13px",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  🗑️ Clear
                </button>
              )}
              <button
                onClick={() => setShowLogsModal(false)}
                style={{
                  flex: 1,
                  padding: "12px",
                  borderRadius: "12px",
                  background: "linear-gradient(135deg, #FF2D95, #8B5CF6)",
                  color: "#fff",
                  fontSize: "13px",
                  fontWeight: 700,
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
