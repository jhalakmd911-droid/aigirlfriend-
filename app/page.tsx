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
  defaultPhoto: string;
}

const characters: Character[] = [
  { id: "jan", name: "Jan", icon: "💫", subtitle: "Girlfriend & Assistant", defaultPhoto: "/images/Jan-ai-generated-8285212.jpg" },
  { id: "lily", name: "Lily", icon: "💼", subtitle: "Business Manager", defaultPhoto: "/images/Lily_yacuzzi-ai-8455080.png" },
  { id: "emma", name: "Emma", icon: "💕", subtitle: "Romantic Girlfriend", defaultPhoto: "/images/Emma-stuff-ai-generated-8494624.jpg" },
  { id: "javed", name: "Mira", icon: "🤖", subtitle: "Personal Assistant", defaultPhoto: "/images/Mira-ai-8612900.jpg" },
  { id: "ayat", name: "Nadia", icon: "✨", subtitle: "Creative & Social", defaultPhoto: "/images/Nadia007-ai-generated-8822022.jpg" },
];

const emojiOptions = ["💫", "💼", "💕", "🤖", "✨", "🌸", "🌙", "🎀", "🦋", "⭐", "🌟", "💐"];

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

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = localStorage.getItem("customNames");
    if (saved) {
      try { setCustomNames(JSON.parse(saved)); } catch (e) {}
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const photos: Record<string, string> = {};
    characters.forEach((c) => { photos[c.id] = getPhoto(c.id); });
    setCharPhotos(photos);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mem = localStorage.getItem(`memory_${selectedCharacter}`);
    if (mem) {
      try { setMemories(JSON.parse(mem)); } catch (e) { setMemories([]); }
    } else { setMemories([]); }
  }, [selectedCharacter]);

  const scrollToBottom = () => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); };
  useEffect(() => { scrollToBottom(); }, [messages]);

  const getCharacter = (): Character => characters.find((c) => c.id === selectedCharacter) || characters[0];
  const getDisplayName = (): string => customNames[selectedCharacter] || getCharacter().name;

  const getCharImage = (charId: string): string => {
    const custom = charPhotos[charId];
    if (custom && custom.startsWith("data:")) return custom;
    const found = characters.find((c) => c.id === charId);
    return found?.defaultPhoto || "/images/Jan-ai-generated-8285212.jpg";
  };

  const saveMemory = (text: string) => {
    const newItem: MemoryItem = {
      id: Date.now().toString(),
      text,
      date: new Date().toLocaleString("bn-BD", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }),
    };
    const updated = [...memories, newItem];
    setMemories(updated);
    localStorage.setItem(`memory_${selectedCharacter}`, JSON.stringify(updated));
  };

  const isSaveCommand = (text: string): boolean => {
    const lower = text.toLowerCase();
    const triggers = ["সেভ করো", "মনে রাখো", "রাখো", "লিখে রাখো", "save this", "remember this", "keep this", "note this", "don't forget"];
    return triggers.some((t) => lower.includes(t));
  };

  const buildMemoryContext = (): string => {
    if (memories.length === 0) return "";
    return memories.slice(-20).map((m) => `- ${m.text}`).join("\n");
  };

  const handleSendMessage = async () => {
    const text = inputValue.trim();
    if (!text || loading) return;

    const userMsg: Message = { id: Date.now().toString(), text, sender: "user", timestamp: new Date() };
    const historyForApi = [...messages, userMsg].map((m) => ({ role: m.sender === "user" ? "user" : "assistant", content: m.text }));
    const memoryContext = buildMemoryContext();
    const aiMsgId = (Date.now() + 1).toString();
    const aiMsg: Message = { id: aiMsgId, text: "", sender: "ai", timestamp: new Date() };

    setMessages((prev) => [...prev, userMsg, aiMsg]);
    setInputValue("");
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: historyForApi, character: selectedCharacter, customName: customNames[selectedCharacter] || "", memoryContext }),
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
                setMessages((prev) => prev.map((m) => m.id === aiMsgId ? { ...m, text: fullText } : m));
              }
            } catch (e) {}
          }
        }
      }

      if (!fullText) {
        setMessages((prev) => prev.map((m) => m.id === aiMsgId ? { ...m, text: "Sorry, I couldn't respond." } : m));
      }

      if (isSaveCommand(text)) {
        const saveText = text.replace(/সেভ করো|মনে রাখো|রাখো|লিখে রাখো|save this|remember this|keep this|note this|don't forget/gi, "").replace(/^[,:\-\s]+/, "").trim();
        if (saveText) saveMemory(saveText);
      }
    } catch (err: any) {
      setMessages((prev) => prev.map((m) => m.id === aiMsgId ? { ...m, text: "⚠️ " + (err.message || "Network error") } : m));
    } finally {
      setLoading(false);
    }
  };

  const directRead = (text: string) => {
    if (typeof window === "undefined" || !window.speechSynthesis) { alert("TTS not supported"); return; }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "bn-BD"; utterance.rate = 1; utterance.pitch = 1.2;
    window.speechSynthesis.speak(utterance);
  };

  const stopReading = () => { if (typeof window !== "undefined" && window.speechSynthesis) window.speechSynthesis.cancel(); };

  const saveCustomName = () => {
    if (nameInputValue.trim()) {
      setCustomNames((prev) => ({ ...prev, [selectedCharacter]: nameInputValue.trim() }));
    }
    setNameInputValue(""); setShowNameInput(false);
  };

  const resetCustomName = () => {
    setCustomNames((prev) => { const copy = { ...prev }; delete copy[selectedCharacter]; return copy; });
    setShowNameInput(false);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 1024 * 1024) { alert("ছবির সাইজ ১ MB এর কম হতে হবে"); return; }
    try {
      const base64 = await fileToBase64(file);
      savePhoto(selectedCharacter, base64);
      setCharPhotos((prev) => ({ ...prev, [selectedCharacter]: base64 }));
      setShowPhotoMenu(false);
    } catch (err) { alert("ছবি লোড করা যায়নি"); }
  };

  const handleEmojiSelect = (emoji: string) => {
    savePhoto(selectedCharacter, emoji);
    setCharPhotos((prev) => ({ ...prev, [selectedCharacter]: emoji }));
    setShowPhotoMenu(false);
  };

  const handleResetPhoto = () => {
    resetPhoto(selectedCharacter);
    setCharPhotos((prev) => { const copy = { ...prev }; delete copy[selectedCharacter]; return copy; });
    setShowPhotoMenu(false);
  };

  const deleteMemory = (id: string) => {
    const updated = memories.filter((m) => m.id !== id);
    setMemories(updated);
    localStorage.setItem(`memory_${selectedCharacter}`, JSON.stringify(updated));
  };

  const clearAllMemory = () => {
    if (!confirm("সব মেমোরি মুছে ফেলবেন?")) return;
    setMemories([]);
    localStorage.removeItem(`memory_${selectedCharacter}`);
  };

  // ✅ Always show character photo — never emoji
  const renderAvatar = (charId: string, size: number) => {
    return (
      <img
        src={getCharImage(charId)}
        alt={charId}
        style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }}
      />
    );
  };

  const char = getCharacter();
  const displayName = getDisplayName();
  const bgImage = getCharImage(selectedCharacter);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100dvh",
        position: "relative",
        overflow: "hidden",
        background: "#05030d",
        paddingBottom: "72px",
      }}
    >
      {/* Background character photo */}
      <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
        <img
          src={bgImage}
          alt={char.name}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center 15%",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(180deg, rgba(5,3,13,0.20) 0%, rgba(5,3,13,0.10) 25%, rgba(5,3,13,0.55) 60%, rgba(5,3,13,0.97) 100%)",
          }}
        />
      </div>

      {/* Foreground content */}
      <div
        style={{
          position: "relative",
          zIndex: 2,
          display: "flex",
          flexDirection: "column",
          height: "100%",
          width: "100%",
          maxWidth: "480px",
          margin: "0 auto",
          padding: "10px 12px 0",
          boxSizing: "border-box",
        }}
      >
        {/* Home Button */}
        <button
          onClick={() => { if (typeof window !== "undefined") window.history.back(); }}
          style={{
            alignSelf: "flex-start",
            display: "inline-flex",
            alignItems: "center",
            gap: "4px",
            padding: "6px 12px",
            borderRadius: "999px",
            background: "rgba(20,12,40,0.72)",
            border: "1px solid rgba(139,92,246,0.55)",
            color: "#fff",
            fontSize: "11px",
            fontWeight: 700,
            cursor: "pointer",
            marginBottom: "8px",
            backdropFilter: "blur(12px)",
          }}
        >
          ← Home
        </button>

        {/* Header — NO BOX, floats over photo */}
        <header
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "8px",
            padding: "4px 2px",
            marginBottom: "10px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0 }}>
            <button
              onClick={() => setShowPhotoMenu(true)}
              style={{
                width: "46px",
                height: "46px",
                borderRadius: "50%",
                overflow: "hidden",
                display: "grid",
                placeItems: "center",
                background: "linear-gradient(135deg, #FF2D95, #8B5CF6)",
                border: "2px solid rgba(255,255,255,0.35)",
                padding: 0,
                cursor: "pointer",
                boxShadow: "0 0 20px rgba(255,45,149,0.6)",
                flexShrink: 0,
              }}
            >
              {renderAvatar(selectedCharacter, 46)}
            </button>
            <div style={{ minWidth: 0 }}>
              <h2
                style={{
                  fontSize: "16px",
                  fontWeight: 800,
                  color: "#fff",
                  margin: 0,
                  lineHeight: 1.1,
                  textShadow: "0 2px 8px rgba(0,0,0,0.9)",
                }}
              >
                {displayName}
              </h2>
              <p
                style={{
                  fontSize: "11px",
                  color: "#22c55e",
                  margin: "2px 0 0",
                  fontWeight: 600,
                  textShadow: "0 2px 6px rgba(0,0,0,0.9)",
                }}
              >
                ● Online
              </p>
            </div>
          </div>

          <div style={{ display: "flex", gap: "6px", flexShrink: 0 }}>
            <button
              onClick={() => setShowMemory(true)}
              style={{
                padding: "7px 11px",
                borderRadius: "12px",
                background: "rgba(20,12,40,0.72)",
                border: "1px solid rgba(139,92,246,0.55)",
                color: "#fff",
                fontSize: "11px",
                fontWeight: 700,
                cursor: "pointer",
                backdropFilter: "blur(12px)",
              }}
            >
              🧠 {memories.length}
            </button>
            <button
              onClick={() => setShowNameInput(true)}
              style={{
                padding: "7px 11px",
                borderRadius: "12px",
                background: "rgba(20,12,40,0.72)",
                border: "1px solid rgba(139,92,246,0.55)",
                color: "#fff",
                fontSize: "11px",
                fontWeight: 700,
                cursor: "pointer",
                backdropFilter: "blur(12px)",
              }}
            >
              ✏️
            </button>
          </div>
        </header>

        {/* Character Switcher */}
        <div style={{ position: "relative", marginBottom: "10px" }}>
          <button
            onClick={() => setShowCharacterMenu(!showCharacterMenu)}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "10px 14px",
              borderRadius: "14px",
              background: "rgba(20,12,40,0.72)",
              border: "1px solid rgba(139,92,246,0.5)",
              color: "#fff",
              cursor: "pointer",
              backdropFilter: "blur(12px)",
            }}
          >
            <span style={{ display: "flex", alignItems: "center", gap: "10px" }}>
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
                {renderAvatar(selectedCharacter, 32)}
              </span>
              <span style={{ fontSize: "13px", fontWeight: 700 }}>{displayName}</span>
            </span>
            <span style={{ fontSize: "11px" }}>{showCharacterMenu ? "▲" : "▼"}</span>
          </button>

          {showCharacterMenu && (
            <div
              className="glass"
              style={{
                position: "absolute",
                top: "100%",
                left: 0,
                right: 0,
                marginTop: "4px",
                borderRadius: "14px",
                padding: "6px",
                zIndex: 100,
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
                      padding: "9px 10px",
                      borderRadius: "10px",
                      background: isSelected
                        ? "linear-gradient(135deg, rgba(255,45,149,0.3), rgba(139,92,246,0.3))"
                        : "transparent",
                      border: "none",
                      color: "#fff",
                      fontSize: "12px",
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
                        width: "30px",
                        height: "30px",
                        borderRadius: "50%",
                        overflow: "hidden",
                        display: "grid",
                        placeItems: "center",
                        background: "linear-gradient(135deg, #FF2D95, #8B5CF6)",
                        flexShrink: 0,
                      }}
                    >
                      {renderAvatar(c.id, 30)}
                    </span>
                    <div>
                      <div>{cName}</div>
                      <div style={{ fontSize: "10px", color: "var(--muted)", marginTop: "1px" }}>
                        {c.subtitle}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Chat Area */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            paddingRight: "2px",
            paddingBottom: "8px",
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
                className={m.sender === "user" ? "bubble-user" : "bubble-ai"}
                style={{
                  maxWidth: "82%",
                  padding: "10px 14px",
                  fontSize: "13px",
                  lineHeight: 1.5,
                  wordWrap: "break-word",
                  whiteSpace: "pre-wrap",
                  backdropFilter: "blur(12px)",
                  WebkitBackdropFilter: "blur(12px)",
                }}
              >
                {m.text || (loading && m.sender === "ai" ? "● ● ●" : "")}
              </div>

              {m.sender === "ai" && m.text && !loading && (
                <div style={{ display: "flex", gap: "5px", marginTop: "5px" }}>
                  <button
                    onClick={() => directRead(m.text)}
                    style={{
                      padding: "4px 10px",
                      borderRadius: "8px",
                      fontSize: "10px",
                      fontWeight: 700,
                      background: "rgba(139,92,246,0.35)",
                      border: "1px solid rgba(139,92,246,0.6)",
                      color: "#fff",
                      cursor: "pointer",
                      backdropFilter: "blur(10px)",
                    }}
                  >
                    🔊 Read
                  </button>
                  <button
                    onClick={stopReading}
                    style={{
                      padding: "4px 10px",
                      borderRadius: "8px",
                      fontSize: "10px",
                      fontWeight: 700,
                      background: "rgba(239,68,68,0.35)",
                      border: "1px solid rgba(239,68,68,0.6)",
                      color: "#fff",
                      cursor: "pointer",
                      backdropFilter: "blur(10px)",
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

        {/* Input area */}
        <div
          style={{
            display: "flex",
            gap: "8px",
            alignItems: "center",
            padding: "8px 0 12px",
          }}
        >
          <button
            onClick={() => directRead(inputValue)}
            disabled={!inputValue.trim()}
            style={{
              width: "42px",
              height: "42px",
              borderRadius: "50%",
              padding: 0,
              flexShrink: 0,
              background: "rgba(20,12,40,0.72)",
              border: "1px solid rgba(139,92,246,0.6)",
              color: "#fff",
              fontSize: "17px",
              cursor: inputValue.trim() ? "pointer" : "not-allowed",
              opacity: inputValue.trim() ? 1 : 0.5,
              backdropFilter: "blur(12px)",
            }}
          >
            🎙️
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
              fontSize: "13px",
              padding: "11px 16px",
              borderRadius: "22px",
              background: "rgba(15,8,30,0.85)",
              border: "1px solid rgba(139,92,246,0.5)",
              color: "#fff",
              outline: "none",
              backdropFilter: "blur(12px)",
            }}
          />
          <button
            onClick={handleSendMessage}
            disabled={loading || !inputValue.trim()}
            style={{
              width: "46px",
              height: "46px",
              borderRadius: "50%",
              padding: 0,
              flexShrink: 0,
              background: "linear-gradient(135deg, #FF2D95, #8B5CF6)",
              color: "#fff",
              fontSize: "18px",
              border: "none",
              cursor: loading || !inputValue.trim() ? "not-allowed" : "pointer",
              opacity: loading || !inputValue.trim() ? 0.5 : 1,
              boxShadow: "0 6px 20px rgba(255,45,149,0.45)",
            }}
          >
            {loading ? "…" : "➤"}
          </button>
        </div>
      </div>

      {/* Name Modal */}
      {showNameInput && (
        <div className="modal-overlay" onClick={() => setShowNameInput(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ color: "#fff", fontSize: "16px", marginBottom: "12px" }}>Change Name</h3>
            <p style={{ color: "var(--muted)", fontSize: "12px", marginBottom: "12px" }}>
              Current: <strong style={{ color: "#fff" }}>{displayName}</strong>
            </p>
            <input
              type="text"
              value={nameInputValue}
              onChange={(e) => setNameInputValue(e.target.value)}
              placeholder="New name..."
              style={{ width: "100%", padding: "10px 14px", borderRadius: "12px", marginBottom: "12px" }}
            />
            <div style={{ display: "flex", gap: "8px" }}>
              <button onClick={saveCustomName} className="btn btn-primary" style={{ flex: 1, padding: "10px" }}>✅ Save</button>
              <button onClick={resetCustomName} className="btn btn-secondary" style={{ flex: 1, padding: "10px" }}>🔄 Reset</button>
            </div>
          </div>
        </div>
      )}

      {/* Photo Modal */}
      {showPhotoMenu && (
        <div className="modal-overlay" onClick={() => setShowPhotoMenu(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ color: "#fff", fontSize: "16px", marginBottom: "12px" }}>📷 {displayName}-র ছবি</h3>
            <input ref={fileInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handlePhotoUpload} />
            <div
              style={{
                width: "110px",
                height: "110px",
                borderRadius: "50%",
                margin: "0 auto 16px",
                overflow: "hidden",
                background: "linear-gradient(135deg, #FF2D95, #8B5CF6)",
                display: "grid",
                placeItems: "center",
                border: "3px solid rgba(255,255,255,0.2)",
                boxShadow: "0 0 25px rgba(255,45,149,0.5)",
              }}
            >
              {renderAvatar(selectedCharacter, 110)}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "12px" }}>
              <button onClick={() => fileInputRef.current?.click()} className="btn btn-primary" style={{ padding: "10px" }}>📁 Upload</button>
              <button onClick={handleResetPhoto} className="btn btn-secondary" style={{ padding: "10px" }}>🔄 Reset</button>
            </div>
            <p style={{ fontSize: "11px", color: "var(--muted)", marginBottom: "10px", textAlign: "center" }}>অথবা Emoji বেছে নিন</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", justifyContent: "center" }}>
              {emojiOptions.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => handleEmojiSelect(emoji)}
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    background: "rgba(139,92,246,0.15)",
                    border: "1px solid rgba(139,92,246,0.35)",
                    fontSize: "20px",
                    cursor: "pointer",
                  }}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Memory Modal */}
      {showMemory && (
        <div className="modal-overlay" onClick={() => setShowMemory(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ color: "#fff", fontSize: "16px", marginBottom: "6px" }}>🧠 {displayName}-র Memory</h3>
            <p style={{ color: "var(--muted)", fontSize: "11px", marginBottom: "12px" }}>Total: {memories.length} items</p>
            {memories.length === 0 ? (
              <p style={{ color: "var(--muted)", fontSize: "12px", textAlign: "center", padding: "16px" }}>
                কোনো মেমোরি নেই।
                <br />
                "সেভ করো" বলে কিছু লিখুন।
              </p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginBottom: "12px", maxHeight: "300px", overflowY: "auto" }}>
                {memories.map((m) => (
                  <div
                    key={m.id}
                    style={{
                      padding: "8px 10px",
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
                      <p style={{ color: "#fff", fontSize: "12px", margin: 0 }}>{m.text}</p>
                      <p style={{ color: "var(--muted)", fontSize: "9px", margin: "3px 0 0" }}>{m.date}</p>
                    </div>
                    <button
                      onClick={() => deleteMemory(m.id)}
                      style={{
                        padding: "4px 8px",
                        borderRadius: "6px",
                        background: "rgba(239,68,68,0.2)",
                        border: "1px solid rgba(239,68,68,0.4)",
                        color: "#ef4444",
                        cursor: "pointer",
                      }}
                    >
                      🗑️
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div style={{ display: "flex", gap: "8px" }}>
              <button onClick={() => setShowMemory(false)} className="btn btn-primary" style={{ flex: 1, padding: "10px" }}>Close</button>
              {memories.length > 0 && (
                <button onClick={clearAllMemory} className="btn btn-secondary" style={{ flex: 1, padding: "10px", color: "#ef4444" }}>🗑️ Clear All</button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
