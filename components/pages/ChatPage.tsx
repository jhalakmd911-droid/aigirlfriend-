"use client";

import { useState, useRef, useEffect } from "react";

interface Message {
  id: string;
  text: string;
  sender: "user" | "ai";
  timestamp: Date;
}

interface Character {
  id: string;
  name: string;
  icon: string;
  subtitle: string;
}

const characters: Character[] = [
  { id: "jan", name: "Jan", icon: "💫", subtitle: "Girlfriend & Assistant" },
  { id: "lily", name: "Lily", icon: "💼", subtitle: "Business Manager" },
  { id: "emma", name: "Emma", icon: "💕", subtitle: "Romantic Girlfriend" },
  { id: "javed", name: "Javed", icon: "🤖", subtitle: "Personal Assistant" },
  { id: "ayat", name: "Ayat", icon: "✨", subtitle: "Creative & Social" },
];

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hi! I'm here for you. What would you like to talk about today?",
      sender: "ai",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [selectedCharacter, setSelectedCharacter] = useState("jan");
  const [customNames, setCustomNames] = useState<Record<string, string>>({});
  const [showNameInput, setShowNameInput] = useState(false);
  const [nameInputValue, setNameInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [showCharacterMenu, setShowCharacterMenu] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // localStorage থেকে Custom Names লোড
  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = localStorage.getItem("customNames");
    if (saved) {
      try {
        setCustomNames(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  // Custom Names সেভ
  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem("customNames", JSON.stringify(customNames));
  }, [customNames]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getCharacter = (): Character => {
    return characters.find((c) => c.id === selectedCharacter) || characters[0];
  };

  const getDisplayName = (): string => {
    return customNames[selectedCharacter] || getCharacter().name;
  };

  // ============================================
  // চ্যাট মেসেজ পাঠানো (Streaming)
  // ============================================
  const handleSendMessage = async () => {
    const text = inputValue.trim();
    if (!text || loading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      text,
      sender: "user",
      timestamp: new Date(),
    };

    // API-র জন্য history তৈরি
    const historyForApi = [...messages, userMsg].map((m) => ({
      role: m.sender === "user" ? "user" : "assistant",
      content: m.text,
    }));

    // Memory Context তৈরি (localStorage থেকে)
    let memoryContext = "";
    if (typeof window !== "undefined") {
      const mem = localStorage.getItem(`memory_${selectedCharacter}`);
      if (mem) {
        try {
          const memories = JSON.parse(mem);
          if (Array.isArray(memories) && memories.length > 0) {
            memoryContext = memories
              .slice(-20)
              .map((m: any) => `- ${m.text}`)
              .join("\n");
          }
        } catch (e) {
          console.error(e);
        }
      }
    }

    // AI-র মেসেজ প্লেসহোল্ডার
    const aiMsgId = (Date.now() + 1).toString();
    const aiMsg: Message = {
      id: aiMsgId,
      text: "",
      sender: "ai",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg, aiMsg]);
    setInputValue("");
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: historyForApi,
          character: selectedCharacter,
          customName: customNames[selectedCharacter] || "",
          memoryContext,
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to fetch");
      }

      // Streaming পড়া
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullText = "";

      if (!reader) throw new Error("No stream");

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n").filter((l) => l.trim() !== "");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") continue;
            try {
              const parsed = JSON.parse(data);
              const delta = parsed.choices?.[0]?.delta?.content;
              if (delta) {
                fullText += delta;
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === aiMsgId ? { ...m, text: fullText } : m
                  )
                );
              }
            } catch (e) {
              // ignore
            }
          }
        }
      }

      if (!fullText) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === aiMsgId
              ? { ...m, text: "Sorry, I couldn't respond." }
              : m
          )
        );
      }
    } catch (err: any) {
      console.error(err);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === aiMsgId
            ? { ...m, text: "⚠️ " + (err.message || "Network error") }
            : m
        )
      );
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // Direct Read (TTS - যা-ই হোক পড়বে)
  // ============================================
  const directRead = (text: string) => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      alert("TTS not supported in this browser");
      return;
    }
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "bn-BD";
    utterance.rate = 1;
    utterance.pitch = 1.2;
    utterance.volume = 1;
    window.speechSynthesis.speak(utterance);
  };

  const stopReading = () => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  };

  // ============================================
  // Custom Name সেভ
  // ============================================
  const saveCustomName = () => {
    if (nameInputValue.trim()) {
      setCustomNames((prev) => ({
        ...prev,
        [selectedCharacter]: nameInputValue.trim(),
      }));
    }
    setNameInputValue("");
    setShowNameInput(false);
  };

  const resetCustomName = () => {
    setCustomNames((prev) => {
      const copy = { ...prev };
      delete copy[selectedCharacter];
      return copy;
    });
    setShowNameInput(false);
  };

  const char = getCharacter();
  const displayName = getDisplayName();

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
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
          padding: "0 0 16px",
          borderBottom: "1px solid rgba(139,92,246,0.25)",
          marginBottom: "16px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #FF2D95, #8B5CF6)",
              display: "grid",
              placeItems: "center",
              color: "#fff",
              fontSize: "22px",
              boxShadow: "0 0 22px rgba(255,45,149,0.55)",
            }}
          >
            {char.icon}
          </div>
          <div>
            <h2 style={{ fontSize: "16px", fontWeight: 700, color: "#fff" }}>
              {displayName}
            </h2>
            <p style={{ fontSize: "12px", color: "#22c55e", marginTop: "2px" }}>
              ● Online
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowNameInput(true)}
          style={{
            padding: "6px 12px",
            borderRadius: "10px",
            background: "rgba(139,92,246,0.15)",
            border: "1px solid rgba(139,92,246,0.35)",
            color: "#fff",
            fontSize: "12px",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          ✏️ Name
        </button>
      </header>

      {/* Character Selector Dropdown */}
      <div style={{ position: "relative", marginBottom: "12px" }}>
        <button
          onClick={() => setShowCharacterMenu(!showCharacterMenu)}
          style={{
            width: "100%",
            padding: "12px 16px",
            borderRadius: "14px",
            background: "rgba(139,92,246,0.15)",
            border: "1px solid rgba(139,92,246,0.35)",
            color: "#fff",
            fontSize: "14px",
            fontWeight: 700,
            cursor: "pointer",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span>
            {char.icon} {displayName}
          </span>
          <span>{showCharacterMenu ? "▲" : "▼"}</span>
        </button>

        {showCharacterMenu && (
          <div
            style={{
              position: "absolute",
              top: "100%",
              left: 0,
              right: 0,
              marginTop: "4px",
              background: "rgba(20, 12, 40, 0.98)",
              border: "1px solid rgba(139,92,246,0.4)",
              borderRadius: "14px",
              padding: "6px",
              zIndex: 10,
              boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
              backdropFilter: "blur(20px)",
            }}
          >
            {characters.map((c) => {
              const isSelected = selectedCharacter === c.id;
              const cName = customNames[c.id] || c.name;
              return (
                <button
                  key={c.id}
                  onClick={() => {
                    setSelectedCharacter(c.id);
                    setShowCharacterMenu(false);
                    setMessages([
                      {
                        id: Date.now().toString(),
                        text: `Hi! I'm ${cName}. ${c.subtitle}. How can I help you?`,
                        sender: "ai",
                        timestamp: new Date(),
                      },
                    ]);
                  }}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: "10px",
                    background: isSelected
                      ? "linear-gradient(135deg, rgba(255,45,149,0.3), rgba(139,92,246,0.3))"
                      : "transparent",
                    border: "none",
                    color: "#fff",
                    fontSize: "13px",
                    fontWeight: isSelected ? 700 : 500,
                    cursor: "pointer",
                    textAlign: "left",
                    display: "flex",
                    gap: "10px",
                    alignItems: "center",
                  }}
                >
                  <span style={{ fontSize: "20px" }}>{c.icon}</span>
                  <div>
                    <div>{cName}</div>
                    <div
                      style={{
                        fontSize: "11px",
                        color: "var(--muted)",
                        marginTop: "2px",
                      }}
                    >
                      {c.subtitle}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Messages */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          paddingRight: "4px",
        }}
      >
        {messages.map((m) => (
          <div
            key={m.id}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: m.sender === "user" ? "flex-end" : "flex-start",
            }}
          >
            <div
              style={{
                maxWidth: "82%",
                padding: "12px 16px",
                borderRadius:
                  m.sender === "user"
                    ? "18px 18px 4px 18px"
                    : "18px 18px 18px 4px",
                background:
                  m.sender === "user"
                    ? "linear-gradient(135deg, #FF2D95, #8B5CF6)"
                    : "rgba(139,92,246,0.16)",
                border:
                  m.sender === "user"
                    ? "1px solid rgba(255,45,149,0.5)"
                    : "1px solid rgba(139,92,246,0.35)",
                color: "#fff",
                fontSize: "14px",
                lineHeight: 1.55,
                wordWrap: "break-word",
                whiteSpace: "pre-wrap",
                boxShadow:
                  m.sender === "user"
                    ? "0 8px 22px rgba(255,45,149,0.35)"
                    : "0 8px 22px rgba(139,92,246,0.22)",
              }}
            >
              {m.text || (loading ? "● ● ●" : "")}
            </div>

            {/* AI Message: Direct Read বাটন */}
            {m.sender === "ai" && m.text && !loading && (
              <div style={{ display: "flex", gap: "6px", marginTop: "6px" }}>
                <button
                  onClick={() => directRead(m.text)}
                  style={{
                    padding: "4px 10px",
                    borderRadius: "8px",
                    background: "rgba(255,45,149,0.15)",
                    border: "1px solid rgba(255,45,149,0.4)",
                    color: "#FF2D95",
                    fontSize: "11px",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  🔊 Read
                </button>
                <button
                  onClick={stopReading}
                  style={{
                    padding: "4px 10px",
                    borderRadius: "8px",
                    background: "rgba(139,92,246,0.15)",
                    border: "1px solid rgba(139,92,246,0.4)",
                    color: "#c4b5fd",
                    fontSize: "11px",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  ⏹ Stop
                </button>
              </div>
            )}
          </div>
        ))}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div
        style={{
          position: "fixed",
          bottom: "80px",
          left: "0",
          right: "0",
          padding: "12px 16px",
          background: "rgba(5,1,15,0.92)",
          backdropFilter: "blur(18px)",
          borderTop: "1px solid rgba(139,92,246,0.28)",
          display: "flex",
          gap: "8px",
          alignItems: "center",
        }}
      >
        <button
          type="button"
          onClick={() => directRead(inputValue)}
          disabled={!inputValue.trim()}
          title="Read the text aloud"
          style={{
            width: "40px",
            height: "40px",
            borderRadius: "50%",
            background: inputValue.trim()
              ? "linear-gradient(135deg, #FF2D95, #8B5CF6)"
              : "rgba(139,92,246,0.2)",
            border: "1px solid rgba(139,92,246,0.35)",
            color: "#fff",
            fontSize: "16px",
            display: "grid",
            placeItems: "center",
            cursor: inputValue.trim() ? "pointer" : "not-allowed",
            boxShadow: inputValue.trim()
              ? "0 0 15px rgba(255,45,149,0.5)"
              : "none",
          }}
        >
          🔊
        </button>

        <input
          type="text"
          placeholder="Type a message..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !loading) handleSendMessage();
          }}
          disabled={loading}
          style={{
            flex: 1,
            fontSize: "14px",
            padding: "12px 16px",
            borderRadius: "24px",
            border: "1px solid rgba(139,92,246,0.3)",
            background: "rgba(11,4,32,0.65)",
            color: "#fff",
            outline: "none",
          }}
        />

        <button
          type="button"
          onClick={handleSendMessage}
          disabled={loading || !inputValue.trim()}
          style={{
            width: "44px",
            height: "44px",
            borderRadius: "50%",
            background:
              loading || !inputValue.trim()
                ? "rgba(139,92,246,0.35)"
                : "linear-gradient(135deg, #FF2D95, #8B5CF6)",
            color: "#fff",
            fontSize: "16px",
            display: "grid",
            placeItems: "center",
            boxShadow:
              loading || !inputValue.trim()
                ? "none"
                : "0 0 18px rgba(255,45,149,0.55)",
            cursor: loading || !inputValue.trim() ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "..." : "▶"}
        </button>
      </div>

      {/* Custom Name Modal */}
      {showNameInput && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.7)",
            backdropFilter: "blur(8px)",
            display: "grid",
            placeItems: "center",
            zIndex: 100,
            padding: "20px",
          }}
          onClick={() => setShowNameInput(false)}
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
            <h3
              style={{
                color: "#fff",
                fontSize: "18px",
                marginBottom: "16px",
              }}
            >
              Change Name
            </h3>

            <p
              style={{
                color: "var(--muted)",
                fontSize: "13px",
                marginBottom: "16px",
              }}
            >
              Current: <strong style={{ color: "#fff" }}>{displayName}</strong>
            </p>

            <input
              type="text"
              value={nameInputValue}
              onChange={(e) => setNameInputValue(e.target.value)}
              placeholder="New name..."
              style={{
                width: "100%",
                padding: "12px 16px",
                borderRadius: "12px",
                border: "1px solid rgba(139,92,246,0.4)",
                background: "rgba(11,4,32,0.65)",
                color: "#fff",
                fontSize: "14px",
                outline: "none",
                marginBottom: "16px",
              }}
            />

            <div style={{ display: "flex", gap: "10px" }}>
              <button
                onClick={saveCustomName}
                style={{
                  flex: 1,
                  padding: "12px",
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
                onClick={resetCustomName}
                style={{
                  flex: 1,
                  padding: "12px",
                  borderRadius: "12px",
                  background: "rgba(139,92,246,0.2)",
                  border: "1px solid rgba(139,92,246,0.4)",
                  color: "#fff",
                  fontSize: "14px",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                🔄 Reset
              </button>
            </div>

            <button
              onClick={() => setShowNameInput(false)}
              style={{
                width: "100%",
                marginTop: "10px",
                padding: "10px",
                borderRadius: "12px",
                background: "transparent",
                border: "1px solid rgba(139,92,246,0.3)",
                color: "var(--muted)",
                fontSize: "13px",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
