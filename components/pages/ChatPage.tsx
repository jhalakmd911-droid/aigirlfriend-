"use client";

import { useState, useRef, useEffect } from "react";
import {
  getPhoto,
  savePhoto,
  resetPhoto,
  fileToBase64,
} from "@/lib/characterPhotos";

interface Message {
  id: string;
  text: string;
  sender: "user" | "ai";
  timestamp: Date;
}

interface MemoryItem {
  id: string;
  text: string;
  date: string;
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

const emojiOptions = [
  "💫",
  "💼",
  "💕",
  "🤖",
  "✨",
  "🌸",
  "🌙",
  "🎀",
  "🦋",
  "⭐",
  "🌟",
  "💐",
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
  const [charPhotos, setCharPhotos] = useState<Record<string, string>>({});
  const [showNameInput, setShowNameInput] = useState(false);
  const [showPhotoMenu, setShowPhotoMenu] = useState(false);
  const [nameInputValue, setNameInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [showCharacterMenu, setShowCharacterMenu] = useState(false);
  const [showMemory, setShowMemory] = useState(false);
  const [memories, setMemories] = useState<MemoryItem[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Custom Names লোড
  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = localStorage.getItem("customNames");
    if (saved) {
      try {
        setCustomNames(JSON.parse(saved));
      } catch (e) {}
    }
  }, []);

  // Custom Names সেভ
  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem("customNames", JSON.stringify(customNames));
  }, [customNames]);

  // Photos লোড
  useEffect(() => {
    if (typeof window === "undefined") return;
    const photos: Record<string, string> = {};
    characters.forEach((c) => {
      photos[c.id] = getPhoto(c.id);
    });
    setCharPhotos(photos);
  }, []);

  // Memory লোড
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mem = localStorage.getItem(`memory_${selectedCharacter}`);
    if (mem) {
      try {
        setMemories(JSON.parse(mem));
      } catch (e) {
        setMemories([]);
      }
    } else {
      setMemories([]);
    }
  }, [selectedCharacter]);

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

  const saveMemory = (text: string) => {
    const newItem: MemoryItem = {
      id: Date.now().toString(),
      text,
      date: new Date().toLocaleString("bn-BD", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
    const updated = [...memories, newItem];
    setMemories(updated);
    localStorage.setItem(
      `memory_${selectedCharacter}`,
      JSON.stringify(updated)
    );
  };

  const isSaveCommand = (text: string): boolean => {
    const lower = text.toLowerCase();
    const triggers = [
      "সেভ করো",
      "মনে রাখো",
      "রাখো",
      "লিখে রাখো",
      "save this",
      "remember this",
      "keep this",
      "note this",
      "don't forget",
    ];
    return triggers.some((t) => lower.includes(t));
  };

  const buildMemoryContext = (): string => {
    if (memories.length === 0) return "";
    return memories
      .slice(-20)
      .map((m) => `- ${m.text}`)
      .join("\n");
  };

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

    const memoryContext = buildMemoryContext();

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
        throw new Error(errData.error || "Failed");
      }

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
            } catch (e) {}
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

      if (isSaveCommand(text)) {
        const saveText = text
          .replace(
            /সেভ করো|মনে রাখো|রাখো|লিখে রাখো|save this|remember this|keep this|note this|don't forget/gi,
            ""
          )
          .replace(/^[,:\-\s]+/, "")
          .trim();
        if (saveText) {
          saveMemory(saveText);
        }
      }
    } catch (err: any) {
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

  const directRead = (text: string) => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      alert("TTS not supported");
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "bn-BD";
    utterance.rate = 1;
    utterance.pitch = 1.2;
    window.speechSynthesis.speak(utterance);
  };

  const stopReading = () => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  };

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

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 1024 * 1024) {
      alert("ছবির সাইজ ১ MB এর কম হতে হবে");
      return;
    }

    try {
      const base64 = await fileToBase64(file);
      savePhoto(selectedCharacter, base64);
      setCharPhotos((prev) => ({ ...prev, [selectedCharacter]: base64 }));
      setShowPhotoMenu(false);
    } catch (err) {
      alert("ছবি লোড করা যায়নি");
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    savePhoto(selectedCharacter, emoji);
    setCharPhotos((prev) => ({ ...prev, [selectedCharacter]: emoji }));
    setShowPhotoMenu(false);
  };

  const handleResetPhoto = () => {
    resetPhoto(selectedCharacter);
    setCharPhotos((prev) => {
      const copy = { ...prev };
      delete copy[selectedCharacter];
      return copy;
    });
    setShowPhotoMenu(false);
  };

  const deleteMemory = (id: string) => {
    const updated = memories.filter((m) => m.id !== id);
    setMemories(updated);
    localStorage.setItem(
      `memory_${selectedCharacter}`,
      JSON.stringify(updated)
    );
  };

  const clearAllMemory = () => {
    if (!confirm("সব মেমোরি মুছে ফেলবেন?")) return;
    setMemories([]);
    localStorage.removeItem(`memory_${selectedCharacter}`);
  };

  const renderPhoto = (charId: string, size: number) => {
    const photo = charPhotos[charId];
    const fallback = characters.find((c) => c.id === charId)?.icon || "💫";

    if (photo && photo.startsWith("data:")) {
      return (
        <img
          src={photo}
          alt={charId}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            borderRadius: "50%",
          }}
        />
      );
    }
    return (
      <span style={{ fontSize: size * 0.55, lineHeight: 1 }}>
        {photo || fallback}
      </span>
    );
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
          <button
            onClick={() => setShowPhotoMenu(true)}
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
              cursor: "pointer",
              overflow: "hidden",
              border: "2px solid rgba(255,255,255,0.2)",
              padding: 0,
            }}
          >
            {renderPhoto(selectedCharacter, 48)}
          </button>
          <div>
            <h2 style={{ fontSize: "16px", fontWeight: 700, color: "#fff" }}>
              {displayName}
            </h2>
            <p
              style={{
                fontSize: "12px",
                color: "#22c55e",
                marginTop: "2px",
              }}
            >
              ● Online
            </p>
          </div>
        </div>

        <div style={{ display: "flex", gap: "6px" }}>
          <button
            type="button"
            onClick={() => setShowMemory(true)}
            style={{
              padding: "6px 12px",
              borderRadius: "10px",
              background: "rgba(255,45,149,0.15)",
              border: "1px solid rgba(255,45,149,0.35)",
              color: "#FF2D95",
              fontSize: "12px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            🧠 {memories.length}
          </button>
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
            ✏️
          </button>
        </div>
      </header>

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
          <span
            style={{ display: "flex", alignItems: "center", gap: "10px" }}
          >
            <span
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                overflow: "hidden",
                display: "grid",
                placeItems: "center",
                background: "linear-gradient(135deg, #FF2D95, #8B5CF6)",
              }}
            >
              {renderPhoto(selectedCharacter, 32)}
            </span>
            {displayName}
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
              zIndex: 100,
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
                  <span
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "50%",
                      overflow: "hidden",
                      display: "grid",
                      placeItems: "center",
                      background:
                        "linear-gradient(135deg, #FF2D95, #8B5CF6)",
                    }}
                  >
                    {renderPhoto(c.id, 32)}
                  </span>
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
              Current:{" "}
              <strong style={{ color: "#fff" }}>{displayName}</strong>
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
          </div>
        </div>
      )}

      {/* Photo Modal */}
      {showPhotoMenu && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.75)",
            backdropFilter: "blur(8px)",
            display: "grid",
            placeItems: "center",
            zIndex: 100,
            padding: "20px",
          }}
          onClick={() => setShowPhotoMenu(false)}
        >
          <div
            style={{
              background: "rgba(20, 12, 40, 0.98)",
              border: "1px solid rgba(139,92,246,0.4)",
              borderRadius: "20px",
              padding: "24px",
              maxWidth: "400px",
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
                marginBottom: "16px",
              }}
            >
              📷 {displayName}-র ছবি
            </h3>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handlePhotoUpload}
            />

            <div
              style={{
                width: "120px",
                height: "120px",
                borderRadius: "50%",
                margin: "0 auto 20px",
                overflow: "hidden",
                background: "linear-gradient(135deg, #FF2D95, #8B5CF6)",
                display: "grid",
                placeItems: "center",
                border: "3px solid rgba(255,255,255,0.2)",
                boxShadow: "0 0 30px rgba(255,45,149,0.5)",
              }}
            >
              {renderPhoto(selectedCharacter, 120)}
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "10px",
                marginBottom: "16px",
              }}
            >
              <button
                onClick={() => fileInputRef.current?.click()}
                style={{
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
                📁 Upload
              </button>
              <button
                onClick={handleResetPhoto}
                style={{
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
                🔄 Reset
              </button>
            </div>

            <p
              style={{
                fontSize: "12px",
                color: "var(--muted)",
                marginBottom: "12px",
                textAlign: "center",
              }}
            >
              অথবা Emoji বেছে নিন
            </p>

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "8px",
                justifyContent: "center",
                marginBottom: "16px",
              }}
            >
              {emojiOptions.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => handleEmojiSelect(emoji)}
                  style={{
                    width: "44px",
                    height: "44px",
                    borderRadius: "50%",
                    background: "rgba(139,92,246,0.15)",
                    border: "1px solid rgba(139,92,246,0.35)",
                    fontSize: "22px",
                    cursor: "pointer",
                  }}
                >
                  {emoji}
                </button>
              ))}
            </div>

            <p
              style={{
                fontSize: "11px",
                color: "var(--muted)",
                textAlign: "center",
                lineHeight: 1.5,
              }}
            >
              💡 ছবির সাইজ ১ MB এর কম। GIF/WebP সাপোর্ট করে।
            </p>
          </div>
        </div>
      )}

      {/* Memory Modal */}
      {showMemory && (
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
          onClick={() => setShowMemory(false)}
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
              🧠 {displayName}-র Memory
            </h3>
            <p
              style={{
                color: "var(--muted)",
                fontSize: "12px",
                marginBottom: "16px",
              }}
            >
              Total: {memories.length} items
            </p>

            {memories.length === 0 ? (
              <p
                style={{
                  color: "var(--muted)",
                  fontSize: "13px",
                  textAlign: "center",
                  padding: "20px",
                }}
              >
                কোনো মেমোরি নেই।
                <br />
                "সেভ করো" বলে কিছু লিখুন।
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
                {memories.map((m) => (
                  <div
                    key={m.id}
                    style={{
                      padding: "10px 12px",
                      borderRadius: "10px",
                      background: "rgba(139,92,246,0.15)",
                      border: "1px solid rgba(139,92,246,0.3)",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <p style={{ color: "#fff", fontSize: "13px" }}>
                        {m.text}
                      </p>
                      <p
                        style={{
                          color: "var(--muted)",
                          fontSize: "10px",
                          marginTop: "4px",
                        }}
                      >
                        {m.date}
                      </p>
                    </div>
                    <button
                      onClick={() => deleteMemory(m.id)}
                      style={{
                        padding: "4px 8px",
                        borderRadius: "6px",
                        background: "rgba(239,68,68,0.2)",
                        border: "1px solid rgba(239,68,68,0.4)",
                        color: "#ef4444",
              }}
            >
              🗑️
            </button>
          </div>
        ))}
              </div>
            )}

            <div style={{ display: "flex", gap: "10px" }}>
              <button
                onClick={() => setShowMemory(false)}
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
                Close
              </button>
              {memories.length > 0 && (
                <button
                  onClick={clearAllMemory}
                  style={{
                    flex: 1,
                    padding: "12px",
                    borderRadius: "12px",
                    background: "rgba(239,68,68,0.2)",
                    border: "1px solid rgba(239,68,68,0.4)",
                    color: "#ef4444",
                    fontSize: "14px",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  🗑️ Clear All
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
