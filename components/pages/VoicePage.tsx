"use client";

import { useState, useRef, useEffect } from "react";
import {
  getPhoto,
  savePhoto,
  resetPhoto,
  fileToBase64,
} from "@/lib/characterPhotos";

type VoiceState = "idle" | "listening" | "thinking" | "speaking";

interface Character {
  id: string;
  name: string;
  icon: string;
  subtitle: string;
  voiceLang: string;
  voicePitch: number;
  voiceRate: number;
}

const characters: Character[] = [
  {
    id: "jan",
    name: "Jan",
    icon: "💫",
    subtitle: "Girlfriend & Assistant",
    voiceLang: "bn-BD",
    voicePitch: 1.2,
    voiceRate: 1.0,
  },
  {
    id: "lily",
    name: "Lily",
    icon: "💼",
    subtitle: "Business Manager",
    voiceLang: "bn-BD",
    voicePitch: 1.1,
    voiceRate: 1.0,
  },
  {
    id: "emma",
    name: "Emma",
    icon: "💕",
    subtitle: "Romantic Girlfriend",
    voiceLang: "bn-BD",
    voicePitch: 1.3,
    voiceRate: 0.95,
  },
  {
    id: "javed",
    name: "Javed",
    icon: "🤖",
    subtitle: "Personal Assistant",
    voiceLang: "bn-BD",
    voicePitch: 0.9,
    voiceRate: 1.0,
  },
  {
    id: "ayat",
    name: "Ayat",
    icon: "✨",
    subtitle: "Creative & Social",
    voiceLang: "bn-BD",
    voicePitch: 1.4,
    voiceRate: 1.1,
  },
];

const emojiOptions = ["💫", "💼", "💕", "🤖", "✨", "🌸", "🌙", "🎀", "🦋", "⭐", "🌟", "💐"];

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface SpeechRecognitionInstance extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognitionInstance;
    webkitSpeechRecognition: new () => SpeechRecognitionInstance;
  }
}

export default function VoicePage() {
  const [voiceState, setVoiceState] = useState<VoiceState>("idle");
  const [selectedCharacter, setSelectedCharacter] = useState("jan");
  const [customNames, setCustomNames] = useState<Record<string, string>>({});
  const [charPhotos, setCharPhotos] = useState<Record<string, string>>({});
  const [transcript, setTranscript] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [error, setError] = useState("");
  const [isSupported, setIsSupported] = useState(true);
  const [showCharacterMenu, setShowCharacterMenu] = useState(false);
  const [memoryCount, setMemoryCount] = useState(0);
  const [showPhotoMenu, setShowPhotoMenu] = useState(false);

  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const conversationRef = useRef<{ role: string; content: string }[]>([]);
  const voiceStateRef = useRef<VoiceState>("idle");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    voiceStateRef.current = voiceState;
  }, [voiceState]);

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

  // Photos লোড
  useEffect(() => {
    if (typeof window === "undefined") return;
    const photos: Record<string, string> = {};
    characters.forEach((c) => {
      photos[c.id] = getPhoto(c.id);
    });
    setCharPhotos(photos);
  }, []);

  // Memory Count লোড
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mem = localStorage.getItem(`memory_${selectedCharacter}`);
    if (mem) {
      try {
        const arr = JSON.parse(mem);
        setMemoryCount(Array.isArray(arr) ? arr.length : 0);
      } catch (e) {
        setMemoryCount(0);
      }
    } else {
      setMemoryCount(0);
    }
  }, [selectedCharacter]);

  const getCharacter = (): Character => {
    return characters.find((c) => c.id === selectedCharacter) || characters[0];
  };

  const getDisplayName = (): string => {
    return customNames[selectedCharacter] || getCharacter().name;
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

  const saveMemory = (text: string) => {
    if (typeof window === "undefined") return;
    const memKey = `memory_${selectedCharacter}`;
    const existing = localStorage.getItem(memKey);
    let memories: any[] = [];
    if (existing) {
      try {
        memories = JSON.parse(existing);
      } catch (e) {
        memories = [];
      }
    }
    memories.push({
      id: Date.now().toString(),
      text,
      date: new Date().toLocaleString("bn-BD"),
    });
    localStorage.setItem(memKey, JSON.stringify(memories));
    setMemoryCount(memories.length);
  };

  const buildMemoryContext = (): string => {
    if (typeof window === "undefined") return "";
    const mem = localStorage.getItem(`memory_${selectedCharacter}`);
    if (!mem) return "";
    try {
      const memories = JSON.parse(mem);
      if (Array.isArray(memories) && memories.length > 0) {
        return memories
          .slice(-20)
          .map((m: any) => `- ${m.text}`)
          .join("\n");
      }
    } catch (e) {}
    return "";
  };

  // Speech Recognition Setup
  useEffect(() => {
    if (typeof window === "undefined") return;

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSupported(false);
      setError("Voice not supported. Please use Chrome browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "bn-BD";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setVoiceState("listening");
      setError("");
    };

    recognition.onresult = async (event: SpeechRecognitionEvent) => {
      const text = event.results[0][0].transcript;
      setTranscript(text);
      setVoiceState("thinking");
      await sendToAI(text);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error("Speech error:", event.error);
      if (event.error === "not-allowed") {
        setError("Microphone permission denied. Please allow mic access.");
      } else if (event.error === "no-speech") {
        setError("No speech detected. Please try again.");
      } else if (event.error === "aborted") {
        setError("");
      } else {
        setError("Voice error: " + event.error);
      }
      setVoiceState("idle");
    };

    recognition.onend = () => {
      if (
        voiceStateRef.current !== "thinking" &&
        voiceStateRef.current !== "speaking"
      ) {
        setVoiceState("idle");
      }
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {}
      }
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // AI-তে পাঠানো
  const sendToAI = async (userText: string) => {
    try {
      conversationRef.current.push({ role: "user", content: userText });

      const memoryContext = buildMemoryContext();

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: conversationRef.current.slice(-10),
          character: selectedCharacter,
          customName: customNames[selectedCharacter] || "",
          memoryContext,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response");
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
                setAiResponse(fullText);
              }
            } catch (e) {}
          }
        }
      }

      if (!fullText) {
        fullText = "Sorry, I couldn't respond.";
        setAiResponse(fullText);
      }

      conversationRef.current.push({ role: "assistant", content: fullText });

      if (isSaveCommand(userText)) {
        const saveText = userText
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

      speak(fullText);
    } catch (err: any) {
      setError(err.message || "Network error");
      setVoiceState("idle");
    }
  };

  const speak = (text: string) => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      setVoiceState("idle");
      return;
    }

    window.speechSynthesis.cancel();

    const char = getCharacter();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = char.voiceLang;
    utterance.pitch = char.voicePitch;
    utterance.rate = char.voiceRate;
    utterance.volume = 1;

    utterance.onstart = () => setVoiceState("speaking");
    utterance.onend = () => setVoiceState("idle");
    utterance.onerror = () => setVoiceState("idle");

    window.speechSynthesis.speak(utterance);
  };

  const toggleListening = () => {
    if (voiceState === "speaking") {
      window.speechSynthesis.cancel();
      setVoiceState("idle");
      return;
    }

    if (voiceState === "listening") {
      try {
        recognitionRef.current?.stop();
      } catch (e) {}
      setVoiceState("idle");
      return;
    }

    if (voiceState === "thinking") return;

    setError("");
    setTranscript("");
    setAiResponse("");

    try {
      recognitionRef.current?.start();
    } catch (err) {
      setError("Could not start microphone. Try again.");
    }
  };

  const switchCharacter = (id: string) => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    try {
      recognitionRef.current?.abort();
    } catch (e) {}
    conversationRef.current = [];
    setSelectedCharacter(id);
    setShowCharacterMenu(false);
    setVoiceState("idle");
    setTranscript("");
    setAiResponse("");
  };

  // Photo Handlers
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
        minHeight: "100vh",
        paddingTop: "20px",
        paddingBottom: "110px",
      }}
    >
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
            Voice Chat
          </h1>
          <p
            style={{
              marginTop: "5px",
              fontSize: "13px",
              color: "var(--muted)",
            }}
          >
            Talk with your AI companion
          </p>
        </div>

        <button
          type="button"
          style={{
            padding: "8px 14px",
            borderRadius: "12px",
            background: "rgba(255,45,149,0.15)",
            border: "1px solid rgba(255,45,149,0.35)",
            color: "#FF2D95",
            fontSize: "12px",
            fontWeight: 700,
            cursor: "default",
          }}
        >
          🧠 {memoryCount}
        </button>
      </header>

      <div style={{ position: "relative", marginBottom: "20px" }}>
        <button
          onClick={() => setShowCharacterMenu(!showCharacterMenu)}
          style={{
            width: "100%",
            padding: "14px 16px",
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
          <span style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                overflow: "hidden",
                display: "grid",
                placeItems: "center",
                background: "linear-gradient(135deg, #FF2D95, #8B5CF6)",
              }}
            >
              {renderPhoto(selectedCharacter, 36)}
            </span>
            <div style={{ textAlign: "left" }}>
              <div>{displayName}</div>
              <div
                style={{
                  fontSize: "11px",
                  color: "var(--muted)",
                  fontWeight: 400,
                  marginTop: "2px",
                }}
              >
                {char.subtitle}
              </div>
            </div>
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
                  onClick={() => switchCharacter(c.id)}
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
                      background: "linear-gradient(135deg, #FF2D95, #8B5CF6)",
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

      <section
        className="card"
        style={{
          padding: "28px 18px",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
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

        <h2
          style={{
            fontSize: "18px",
            marginBottom: "20px",
            position: "relative",
            color: "#fff",
          }}
        >
          {voiceState === "idle" && "Tap to speak"}
          {voiceState === "listening" && "Listening..."}
          {voiceState === "thinking" && "Thinking..."}
          {voiceState === "speaking" && "Speaking..."}
        </h2>

        <div style={{ position: "relative", marginBottom: "24px" }}>
          <button
            onClick={() => setShowPhotoMenu(true)}
            style={{
              position: "absolute",
              top: "0",
              right: "0",
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              background: "rgba(139,92,246,0.25)",
              border: "1px solid rgba(139,92,246,0.5)",
              color: "#fff",
              fontSize: "16px",
              cursor: "pointer",
              zIndex: 2,
            }}
          >
            📷
          </button>

          <button
            onClick={toggleListening}
            disabled={!isSupported || voiceState === "thinking"}
            style={{
              width: "140px",
              height: "140px",
              borderRadius: "50%",
              background:
                voiceState !== "idle"
                  ? "linear-gradient(135deg, #FF2D95, #8B5CF6)"
                  : "rgba(139,92,246,0.18)",
              border:
                voiceState !== "idle"
                  ? "2px solid rgba(255,45,149,0.6)"
                  : "2px solid rgba(139,92,246,0.35)",
              display: "grid",
              placeItems: "center",
              margin: "0 auto",
              cursor:
                !isSupported || voiceState === "thinking"
                  ? "not-allowed"
                  : "pointer",
              fontSize: "56px",
              transition: "all 0.3s ease",
              boxShadow:
                voiceState !== "idle"
                  ? "0 0 60px rgba(255,45,149,0.6)"
                  : "0 10px 30px rgba(139,92,246,0.2)",
              position: "relative",
              zIndex: 1,
              color: "#fff",
              opacity: !isSupported ? 0.5 : 1,
              overflow: "hidden",
            }}
          >
            {charPhotos[selectedCharacter] &&
            charPhotos[selectedCharacter].startsWith("data:") ? (
              <img
                src={charPhotos[selectedCharacter]}
                alt={char.name}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : voiceState === "speaking" ? (
              "🔊"
            ) : (
              "🎤"
            )}
          </button>

          {voiceState === "listening" && (
            <>
              <div
                style={{
                  position: "absolute",
                  width: "160px",
                  height: "160px",
                  borderRadius: "50%",
                  border: "2px solid rgba(255,45,149,0.5)",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  animation: "pulse 1.5s ease-out infinite",
                  pointerEvents: "none",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  width: "180px",
                  height: "180px",
                  borderRadius: "50%",
                  border: "2px solid rgba(255,45,149,0.25)",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  animation: "pulse 1.5s ease-out 0.5s infinite",
                  pointerEvents: "none",
                }}
              />
            </>
          )}

          <style>{`
            @keyframes pulse {
              0% { width: 140px; height: 140px; opacity: 1; }
              100% { width: 240px; height: 240px; opacity: 0; }
            }
          `}</style>
        </div>

        <p
          style={{
            fontSize: "13px",
            color: "var(--muted)",
            position: "relative",
            minHeight: "20px",
          }}
        >
          {voiceState === "idle" && "Tap the microphone and speak"}
          {voiceState === "listening" && "I'm listening to you..."}
          {voiceState === "thinking" && "Let me think..."}
          {voiceState === "speaking" && "Tap again to stop"}
        </p>

        {error && (
          <p
            style={{
              marginTop: "12px",
              fontSize: "12px",
              color: "#ef4444",
              position: "relative",
            }}
          >
            ⚠️ {error}
          </p>
        )}
      </section>

      {(transcript || aiResponse) && (
        <section
          className="card"
          style={{
            padding: "16px",
            marginTop: "16px",
          }}
        >
          <h3
            style={{
              fontSize: "14px",
              marginBottom: "12px",
              color: "#fff",
              fontWeight: 600,
            }}
          >
            Conversation
          </h3>

          {transcript && (
            <div
              style={{
                padding: "10px 14px",
                borderRadius: "12px",
                background:
                  "linear-gradient(135deg, rgba(255,45,149,0.25), rgba(139,92,246,0.25))",
                marginBottom: "10px",
                border: "1px solid rgba(255,45,149,0.4)",
              }}
            >
              <p
                style={{
                  fontSize: "11px",
                  color: "rgba(255,255,255,0.7)",
                  marginBottom: "4px",
                }}
              >
                You said:
              </p>
              <p style={{ fontSize: "14px", color: "#fff" }}>{transcript}</p>
            </div>
          )}

          {aiResponse && (
            <div
              style={{
                padding: "10px 14px",
                borderRadius: "12px",
                background: "rgba(139,92,246,0.18)",
                border: "1px solid rgba(139,92,246,0.35)",
              }}
            >
              <p
                style={{
                  fontSize: "11px",
                  color: "rgba(255,255,255,0.7)",
                  marginBottom: "4px",
                }}
              >
                {displayName} said:
              </p>
              <p style={{ fontSize: "14px", color: "#fff" }}>{aiResponse}</p>
            </div>
          )}
        </section>
      )}

      <section className="card" style={{ padding: "16px", marginTop: "16px" }}>
        <p
          style={{
            fontSize: "12px",
            lineHeight: 1.6,
            color: "var(--muted)",
          }}
        >
          💡 <strong>Tip:</strong> Works with or without headphones. Speak
          clearly. Use Chrome for best results. Say "সেভ করো" to save any
          information to memory.
        </p>
      </section>

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
            <h3 style={{ color: "#fff", fontSize: "18px", marginBottom: "16px" }}>
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
    </div>
  );
}
