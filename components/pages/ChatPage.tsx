"use client";

import { useState } from "react";

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

  const girls = [
    { id: "lily", name: "Lily", subtitle: "Sweet & Caring" },
    { id: "emma", name: "Emma", subtitle: "Playful & Fun" },
  ];

  const handleSendMessage = () => {
    if (inputValue.trim()) {
      const newMessage: Message = {
        id: Date.now().toString(),
        text: inputValue,
        sender: "user",
        timestamp: new Date(),
      };

      setMessages([...messages, newMessage]);
      setInputValue("");

      // Simulate AI response
      setTimeout(() => {
        const aiResponse: Message = {
          id: (Date.now() + 1).toString(),
          text: "I'm doing great! 😊\nTalking to you always makes my day special. What about you?",
          sender: "ai",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, aiResponse]);
      }, 500);
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
                backgroundColor:
                  message.sender === "user"
                    ? "linear-gradient(135deg, #FF4F9A, #8B5CF6)"
                    : "rgba(139,92,246,0.1)",
                color: message.sender === "user" ? "#ffffff" : "var(--foreground)",
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
            if (e.key === "Enter") handleSendMessage();
          }}
          style={{
            flex: 1,
            padding: "10px 14px",
            borderRadius: "24px",
            border: "1px solid var(--border)",
            background: "rgba(255, 255, 255, 0.9)",
            color: "var(--foreground)",
            fontSize: "14px",
            outline: "none",
          }}
        />

        <button
          type="button"
          onClick={handleSendMessage}
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "50%",
            background: "linear-gradient(135deg, #FF4F9A, #8B5CF6)",
            border: "none",
            display: "grid",
            placeItems: "center",
            cursor: "pointer",
            fontSize: "18px",
          }}
        >
          ▶
        </button>
      </div>

      {/* Girl Selector Modal (Simple version) */}
      <div
        style={{
          position: "fixed",
          bottom: "80px",
          left: "16px",
          right: "16px",
          background: "var(--card)",
          borderRadius: "20px",
          padding: "16px",
          display: "none",
          gap: "12px",
        }}
      >
        {girls.map((girl) => (
          <button
            key={girl.id}
            onClick={() => setSelectedGirl(girl.id)}
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "14px",
              background:
                selectedGirl === girl.id
                  ? "linear-gradient(135deg, #FF4F9A, #8B5CF6)"
                  : "rgba(139,92,246,0.1)",
              color: selectedGirl === girl.id ? "#ffffff" : "var(--foreground)",
              border: "none",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            {girl.name} - {girl.subtitle}
          </button>
        ))}
      </div>
    </div>
  );
}
