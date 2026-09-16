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
    { id: "lily", name: "Lily", subtitle: "Sweet & Caring" },
    { id: "emma", name: "Emma", subtitle: "Playful & Fun" },
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (inputValue.trim()) {
      const newMessage: Message = {
        id: Date.now().toString(),
        text: inputValue,
        sender: "user",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, newMessage]);
      setInputValue("");
      setLoading(true);

      try {
        // API কে কল করুন
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messages: messages.map((m) => ({
              role: m.sender === "user" ? "user" : "assistant",
              content: m.text,
            })),
            girl: selectedGirl,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to get response");
        }

        const data = await response.json();

        const aiResponse: Message = {
          id: (Date.now() + 1).toString(),
          text: data.message || "I'm not sure how to respond to that.",
          sender: "ai",
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, aiResponse]);
      } catch (error) {
        console.error("Chat error:", error);

        const errorResponse: Message = {
          id: (Date.now() + 1).toString(),
          text: "Sorry, I couldn't process that. Please try again!",
          sender: "ai",
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, errorResponse]);
      } finally {
        setLoading(false);
      }
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
      {/* Header with Girl Selection */}
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 0 16px",
          borderBottom: "1px solid var(--border)",
          marginBottom: "16px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #FF4F9A, #8B5CF6)",
              display: "grid",
              placeItems: "center",
              color: "#ffffff",
              fontSize: "24px",
            }}
          >
            {selectedGirl === "lily" ? "🎀" : "✨"}
          </div>
          <div>
            <h2 style={{ fontSize: "16px", fontWeight: 600 }}>
              {selectedGirl === "lily" ? "Lily" : "Emma"}
            </h2>
            <p
              style={{
                fontSize: "12px",
                color: "var(--muted)",
                marginTop: "2px",
              }}
            >
              ● Online
            </p>
          </div>
        </div>

        <button
          type="button"
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "50%",
            background: "transparent",
            border: "1px solid var(--border)",
            display: "grid",
            placeItems: "center",
            cursor: "pointer",
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
        {messages.map((message) => (
          <div
            key={message.id}
            style={{
              display: "flex",
              justifyContent:
                message.sender === "user" ? "flex-end" : "flex-start",
            }}
          >
            <div
              style={{
                maxWidth: "85%",
                padding: "12px 16px",
                borderRadius: "18px",
                background:
                  message.sender === "user"
                    ? "linear-gradient(135deg, #FF4F9A, #8B5CF6)"
                    : "rgba(139,92,246,0.1)",
                color:
                  message.sender === "user"
                    ? "#ffffff"
                    : "var(--foreground)",
                fontSize: "14px",
                lineHeight: 1.5,
                wordWrap: "break-word",
                whiteSpace: "pre-wrap",
              }}
            >
              {message.text}
            </div>
          </div>
        ))}

        {loading && (
          <div style={{ display: "flex", justifyContent: "flex-start" }}>
            <div
              style={{
                padding: "12px 16px",
                borderRadius: "18px",
                background: "rgba(139,92,246,0.1)",
                color: "var(--foreground)",
                fontSize: "14px",
              }}
            >
              <span
                style={{
                  display: "inline-block",
                  animation: "blink 1.5s infinite",
                }}
              >
                ● ● ●
              </span>
              <style>{`
                @keyframes blink {
                  0%, 20%, 50%, 80%, 100% { opacity: 1; }
                  40% { opacity: 0.5; }
                  60% { opacity: 0.3; }
                }
              `}</style>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Girl Selector (Quick Switch) */}
      <div
        style={{
          display: "flex",
          gap: "8px",
          marginBottom: "12px",
          padding: "0 4px",
        }}
      >
        {girls.map((girl) => (
          <button
            key={girl.id}
            onClick={() => setSelectedGirl(girl.id)}
            style={{
              flex: 1,
              padding: "8px 12px",
              borderRadius: "12px",
              border:
                selectedGirl === girl.id
                  ? "2px solid var(--primary)"
                  : "1px solid var(--border)",
              background:
                selectedGirl === girl.id
                  ? "rgba(255,79,154,0.15)"
                  : "transparent",
              fontSize: "12px",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            {girl.name}
          </button>
        ))}
      </div>

      {/* Input Area */}
      <div
        style={{
          position: "fixed",
          bottom: "80px",
          left: "0",
          right: "0",
          padding: "12px 16px",
          background: "var(--background)",
          borderTop: "1px solid var(--border)",
          display: "flex",
          gap: "8px",
          alignItems: "flex-end",
        }}
      >
        <button
          type="button"
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "50%",
            background: "rgba(139,92,246,0.2)",
            border: "none",
            display: "grid",
            placeItems: "center",
            cursor: "pointer",
            fontSize: "20px",
          }}
        >
          😊
        </button>

        <input
          type="text"
          placeholder="Type a message..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === "Enter" && !loading) handleSendMessage();
          }}
          disabled={loading}
          style={{
            flex: 1,
            padding: "10px 14px",
            borderRadius: "24px",
            border: "1px solid var(--border)",
            background: "rgba(255, 255, 255, 0.9)",
            color: "var(--foreground)",
            fontSize: "14px",
            outline: "none",
            opacity: loading ? 0.6 : 1,
          }}
        />

        <button
          type="button"
          onClick={handleSendMessage}
          disabled={loading || !inputValue.trim()}
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "50%",
            background: loading || !inputValue.trim()
              ? "rgba(139,92,246,0.5)"
              : "linear-gradient(135deg, #FF4F9A, #8B5CF6)",
            border: "none",
            display: "grid",
            placeItems: "center",
            cursor: loading || !inputValue.trim() ? "not-allowed" : "pointer",
            fontSize: "18px",
          }}
        >
          {loading ? "..." : "▶"}
        </button>
      </div>
    </div>
  );
}
