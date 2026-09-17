"use client";

import { useState, useRef, useEffect } from "react";

interface Message {
  id: string;
  text: string;
  sender: "user" | "ai";
  timestamp: Date;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hi! I'm Lily 💓\nI'm here for you. What would you like to talk about today?",
      sender: "ai",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [selectedGirl, setSelectedGirl] = useState("lily");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const girls = [
    { id: "lily", name: "Lily", icon: "🎀" },
    { id: "emma", name: "Emma", icon: "✨" },
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    const text = inputValue.trim();
    if (!text || loading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      text,
      sender: "user",
      timestamp: new Date(),
    };

    const historyForApi = [...messages, userMsg].map((m) => ({
      role: m.sender === "user" ? "user" : "assistant",
      content: m.text,
    }));

    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: historyForApi,
          character: selectedGirl,
        }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || "Failed");

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: data.reply || "Sorry, I couldn't respond.",
        sender: "ai",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          text: "⚠️ " + (err.message || "Network error. Check API key."),
          sender: "ai",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

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
            {selectedGirl === "lily" ? "🎀" : "✨"}
          </div>
          <div>
            <h2 style={{ fontSize: "16px", fontWeight: 700, color: "#fff" }}>
              {selectedGirl === "lily" ? "Lily" : "Emma"}
            </h2>
            <p style={{ fontSize: "12px", color: "#22c55e", marginTop: "2px" }}>
              ● Online
            </p>
          </div>
        </div>

        <button
          type="button"
          style={{
            width: "38px",
            height: "38px",
            borderRadius: "50%",
            background: "rgba(139,92,246,0.15)",
            border: "1px solid rgba(139,92,246,0.35)",
            display: "grid",
            placeItems: "center",
            color: "#fff",
            fontSize: "16px",
          }}
        >
          ⋮
        </button>
      </header>

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
              justifyContent: m.sender === "user" ? "flex-end" : "flex-start",
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
              {m.text}
            </div>
          </div>
        ))}

        {loading && (
          <div style={{ display: "flex", justifyContent: "flex-start" }}>
            <div
              style={{
                padding: "12px 18px",
                borderRadius: "18px 18px 18px 4px",
                background: "rgba(139,92,246,0.16)",
                border: "1px solid rgba(139,92,246,0.35)",
                color: "#c4b5fd",
                fontSize: "14px",
              }}
            >
              ● ● ●
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Girl switch */}
      <div
        style={{
          display: "flex",
          gap: "8px",
          marginBottom: "12px",
          marginTop: "12px",
          padding: "0 4px",
        }}
      >
        {girls.map((g) => (
          <button
            key={g.id}
            onClick={() => setSelectedGirl(g.id)}
            style={{
              flex: 1,
              padding: "8px 12px",
              borderRadius: "12px",
              border:
                selectedGirl === g.id
                  ? "1px solid #FF2D95"
                  : "1px solid rgba(139,92,246,0.3)",
              background:
                selectedGirl === g.id
                  ? "linear-gradient(135deg, rgba(255,45,149,0.28), rgba(139,92,246,0.28))"
                  : "rgba(139,92,246,0.10)",
              fontSize: "12px",
              fontWeight: 700,
              color: "#fff",
              boxShadow:
                selectedGirl === g.id
                  ? "0 0 16px rgba(255,45,149,0.4)"
                  : "none",
              cursor: "pointer",
            }}
          >
            {g.name}
          </button>
        ))}
      </div>

      {/* Input */}
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
          style={{
            width: "38px",
            height: "38px",
            borderRadius: "50%",
            background: "rgba(139,92,246,0.2)",
            border: "1px solid rgba(139,92,246,0.35)",
            color: "#fff",
            fontSize: "18px",
          }}
        >
          😊
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
            width: "40px",
            height: "40px",
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
    </div>
  );
}
