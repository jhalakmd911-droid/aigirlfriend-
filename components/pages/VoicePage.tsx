"use client";

import { useState, useRef, useEffect } from "react";
import { getPhoto, savePhoto, resetPhoto, fileToBase64 } from "@/lib/characterPhotos";

type VoiceState = "idle" | "listening" | "thinking" | "speaking";

interface Character {
  id: string;
  name: string;
  icon: string;
  subtitle: string;
  voiceLang: string;
  voicePitch: number;
  voiceRate: number;
  defaultPhoto: string;
}

const characters: Character[] = [
  { id: "jan", name: "Jan", icon: "💫", subtitle: "Girlfriend & Assistant", voiceLang: "bn-BD", voicePitch: 1.55, voiceRate: 0.92, defaultPhoto: "/images/Jan2-8404588.png" },
  { id: "lily", name: "Lily", icon: "💼", subtitle: "Business Manager", voiceLang: "bn-BD", voicePitch: 1.4, voiceRate: 1.0, defaultPhoto: "/images/Lile2-8059037.jpg" },
  { id: "emma", name: "Emma", icon: "💕", subtitle: "Romantic Girlfriend", voiceLang: "bn-BD", voicePitch: 1.65, voiceRate: 0.88, defaultPhoto: "/images/Emma-stuff-ai-generated-8494624.jpg" },
  { id: "javed", name: "Mira", icon: "🤖", subtitle: "Personal Assistant", voiceLang: "bn-BD", voicePitch: 1.4, voiceRate: 1.0, defaultPhoto: "/images/Mira2-8296163.jpg" },
  { id: "ayat", name: "Nadia", icon: "✨", subtitle: "Creative & Social", voiceLang: "bn-BD", voicePitch: 1.7, voiceRate: 1.05, defaultPhoto: "/images/Nadia007-ai-generated-8822022.jpg" },
];

const emojiOptions = ["💫", "💼", "💕", "🤖", "✨", "🌸", "🌙", "🎀", "🦋", "⭐", "🌟", "💐"];

interface SpeechRecognitionEvent extends Event { results: SpeechRecognitionResultList; resultIndex: number; }
interface SpeechRecognitionErrorEvent extends Event { error: string; }
interface SpeechRecognitionInstance extends EventTarget {
  lang: string; continuous: boolean; interimResults: boolean;
  start: () => void; stop: () => void; abort: () => void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null; onstart: (() => void) | null;
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
  const [showNameInput, setShowNameInput] = useState(false);
  const [nameInputValue, setNameInputValue] = useState("");
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [callDuration, setCallDuration] = useState(0);
  const [isCallActive, setIsCallActive] = useState(false);
  const [textInput, setTextInput] = useState("");
  const [autoListen, setAutoListen] = useState(true);

  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const conversationRef = useRef<{ role: string; content: string }[]>([]);
  const voiceStateRef = useRef<VoiceState>("idle");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isCallActiveRef = useRef<boolean>(false);
  const autoListenRef = useRef<boolean>(true);

  useEffect(() => { voiceStateRef.current = voiceState; }, [voiceState]);
  useEffect(() => { isCallActiveRef.current = isCallActive; }, [isCallActive]);
  useEffect(() => { autoListenRef.current = autoListen; }, [autoListen]);

  useEffect(() => {
    if (isCallActive) {
      timerRef.current = setInterval(() => setCallDuration((d) => d + 1), 1000);
    } else {
      if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
      setCallDuration(0);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isCallActive]);

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = localStorage.getItem("customNames");
    if (saved) { try { setCustomNames(JSON.parse(saved)); } catch (e) {} }
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
    if (mem) { try { const arr = JSON.parse(mem); setMemoryCount(Array.isArray(arr) ? arr.length : 0); } catch (e) { setMemoryCount(0); } }
    else { setMemoryCount(0); }
  }, [selectedCharacter]);

  const getCharacter = (): Character => characters.find((c) => c.id === selectedCharacter) || characters[0];
  const getDisplayName = (): string => customNames[selectedCharacter] || getCharacter().name;

  const getCharImage = (charId: string): string => {
    const custom = charPhotos[charId];
    if (custom && custom.startsWith("data:")) return custom;
    const found = characters.find((c) => c.id === charId);
    return found?.defaultPhoto || "/images/Jan2-8404588.png";
  };

  const saveCustomName = () => {
    if (nameInputValue.trim()) setCustomNames((prev) => ({ ...prev, [selectedCharacter]: nameInputValue.trim() }));
    setNameInputValue(""); setShowNameInput(false);
  };

  const resetCustomName = () => {
    setCustomNames((prev) => { const copy = { ...prev }; delete copy[selectedCharacter]; return copy; });
    setShowNameInput(false);
  };

  const isSaveCommand = (text: string): boolean => {
    const lower = text.toLowerCase();
    const triggers = ["সেভ করো", "মনে রাখো", "রাখো", "লিখে রাখো", "save this", "remember this", "keep this", "note this", "don't forget"];
    return triggers.some((t) => lower.includes(t));
  };

  const saveMemory = (text: string) => {
    if (typeof window === "undefined") return;
    const memKey = `memory_${selectedCharacter}`;
    const existing = localStorage.getItem(memKey);
    let memories: any[] = [];
    if (existing) { try { memories = JSON.parse(existing); } catch (e) { memories = []; } }
    memories.push({ id: Date.now().toString(), text, date: new Date().toLocaleString("bn-BD") });
    localStorage.setItem(memKey, JSON.stringify(memories));
    setMemoryCount(memories.length);
  };

  const buildMemoryContext = (): string => {
    if (typeof window === "undefined") return "";
    const mem = localStorage.getItem(`memory_${selectedCharacter}`);
    if (!mem) return "";
    try {
      const memories = JSON.parse(mem);
      if (Array.isArray(memories) && memories.length > 0) return memories.slice(-20).map((m: any) => `- ${m.text}`).join("\n");
    } catch (e) {}
    return "";
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSupported(false);
      setError("Voice recognition not supported on this browser. Please use the text box below.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "bn-BD";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => { setVoiceState("listening"); setError(""); };

    recognition.onresult = async (event: SpeechRecognitionEvent) => {
      const text = event.results[0][0].transcript;
      setTranscript(text);
      setVoiceState("thinking");
      await sendToAI(text);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (event.error === "not-allowed") setError("Microphone permission denied. Please allow mic access.");
      else if (event.error === "no-speech") {
        if (isCallActiveRef.current && autoListenRef.current) {
          setTimeout(() => { try { recognitionRef.current?.start(); } catch (e) {} }, 500);
        } else setVoiceState("idle");
      }
      else if (event.error === "aborted") setError("");
      else setError("Voice error: " + event.error);
    };

    recognition.onend = () => {
      if (voiceStateRef.current !== "thinking" && voiceStateRef.current !== "speaking") {
        if (isCallActiveRef.current && autoListenRef.current) {
          setTimeout(() => { try { recognitionRef.current?.start(); } catch (e) {} }, 500);
        } else setVoiceState("idle");
      }
    };

    recognitionRef.current = recognition;
    return () => {
      if (recognitionRef.current) { try { recognitionRef.current.abort(); } catch (e) {} }
      if (typeof window !== "undefined" && window.speechSynthesis) window.speechSynthesis.cancel();
      if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
    };
  }, []);

  const sendToAI = async (userText: string) => {
    try {
      conversationRef.current.push({ role: "user", content: userText });
      const memoryContext = buildMemoryContext();
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: conversationRef.current.slice(-10), character: selectedCharacter, customName: customNames[selectedCharacter] || "", memoryContext }),
      });
      if (!response.ok) throw new Error("Failed to get response");

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
              if (delta) { fullText += delta; setAiResponse(fullText); }
            } catch (e) {}
          }
        }
      }

      if (!fullText) { fullText = "Sorry, I couldn't respond."; setAiResponse(fullText); }
      conversationRef.current.push({ role: "assistant", content: fullText });

      if (isSaveCommand(userText)) {
        const saveText = userText.replace(/সেভ করো|মনে রাখো|রাখো|লিখে রাখো|save this|remember this|keep this|note this|don't forget/gi, "").replace(/^[,:\-\s]+/, "").trim();
        if (saveText) saveMemory(saveText);
      }
      speak(fullText);
    } catch (err: any) {
      setError(err.message || "Network error");
      setVoiceState("idle");
    }
  };

  const speak = async (text: string) => {
    if (isMuted || !isSpeakerOn) { setVoiceState("idle"); return; }
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
    setVoiceState("speaking");

    try {
      const response = await fetch("/api/speak", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (!response.ok) throw new Error(`API error: ${response.status}`);

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.onended = () => {
        URL.revokeObjectURL(audioUrl);
        audioRef.current = null;
        if (isCallActiveRef.current && autoListenRef.current && !isMuted && isSpeakerOn) {
          setVoiceState("listening");
          setTimeout(() => { try { recognitionRef.current?.start(); } catch (e) { setVoiceState("idle"); } }, 500);
        } else setVoiceState("idle");
      };

      audio.onerror = () => {
        URL.revokeObjectURL(audioUrl);
        audioRef.current = null;
        setVoiceState("idle");
      };

      await audio.play();
    } catch (error: any) {
      setVoiceState("idle");
      setError(`Voice Error: ${error.message || "Unknown error"}`);
    }
  };

  const toggleListening = () => {
    if (voiceState === "speaking") {
      if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
      setVoiceState("idle");
      return;
    }
    if (voiceState === "listening") {
      try { recognitionRef.current?.stop(); } catch (e) {}
      setIsCallActive(false);
      setVoiceState("idle");
      return;
    }
    if (voiceState === "thinking") return;

    setError(""); setTranscript(""); setAiResponse("");
    setIsCallActive(true);
    try { recognitionRef.current?.start(); } catch (err) { setError("Could not start microphone. Try again."); }
  };

  const toggleAutoListen = () => {
    setAutoListen((prev) => {
      const newVal = !prev;
      if (newVal && isCallActive && voiceState !== "speaking" && voiceState !== "thinking") {
        try { recognitionRef.current?.start(); } catch (e) {}
      }
      return newVal;
    });
  };

  const endCall = () => {
    if (typeof window !== "undefined" && window.speechSynthesis) window.speechSynthesis.cancel();
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
    try { recognitionRef.current?.abort(); } catch (e) {}
    setIsCallActive(false);
    setVoiceState("idle");
    setTranscript("");
    setAiResponse("");
  };

  const switchCharacter = (id: string) => {
    if (typeof window !== "undefined" && window.speechSynthesis) window.speechSynthesis.cancel();
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
    try { recognitionRef.current?.abort(); } catch (e) {}
    conversationRef.current = [];
    setSelectedCharacter(id);
    setShowCharacterMenu(false);
    setIsCallActive(false);
    setVoiceState("idle");
    setTranscript("");
    setAiResponse("");
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

  const renderAvatar = (charId: string) => (
    <img src={getCharImage(charId)} alt={charId} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }} />
  );

  const char = getCharacter();
  const displayName = getDisplayName();
  const mainImage = getCharImage(selectedCharacter);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100dvh", background: "#05030d", paddingBottom: "70px", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", width: "280px", height: "280px", borderRadius: "50%", background: "radial-gradient(circle, rgba(255,45,149,0.22), transparent 70%)", top: "-80px", left: "-110px", zIndex: 0, pointerEvents: "none" }} />
      <div style={{ position: "absolute", width: "280px", height: "280px", borderRadius: "50%", background: "radial-gradient(circle, rgba(99,102,241,0.22), transparent 70%)", bottom: "-40px", right: "-120px", zIndex: 0, pointerEvents: "none" }} />

      <div style={{ position: "relative", zIndex: 2, width: "100%", maxWidth: "480px", margin: "0 auto", padding: "6px 12px 0", boxSizing: "border-box", display: "flex", flexDirection: "column", height: "100%" }}>
        <button onClick={() => { if (typeof window !== "undefined") window.history.back(); }} style={{ alignSelf: "flex-start", display: "inline-flex", alignItems: "center", gap: "4px", padding: "5px 11px", borderRadius: "999px", background: "rgba(20,12,40,0.72)", border: "1px solid rgba(139,92,246,0.55)", color: "#fff", fontSize: "10px", fontWeight: 700, cursor: "pointer", marginBottom: "5px", backdropFilter: "blur(12px)" }}>← Home</button>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px", marginBottom: "5px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", minWidth: 0 }}>
            <div style={{ width: "38px", height: "38px", borderRadius: "50%", overflow: "hidden", background: "linear-gradient(135deg, #FF2D95, #8B5CF6)", border: "2px solid rgba(255,77,185,0.6)", boxShadow: "0 0 18px rgba(255,45,149,0.55)", flexShrink: 0 }}>{renderAvatar(selectedCharacter)}</div>
            <div style={{ minWidth: 0 }}>
              <h1 style={{ fontSize: "18px", fontWeight: 900, margin: 0, lineHeight: 1.05, letterSpacing: "-0.4px", background: "linear-gradient(90deg, #FF2D95 0%, #C84CFF 60%, #8B5CF6 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>Voice Call</h1>
              <p style={{ margin: "1px 0 0", fontSize: "9px", color: "rgba(200,200,230,0.7)" }}>Talk with your AI companion</p>
            </div>
          </div>
          <div style={{ display: "flex", gap: "5px", flexShrink: 0 }}>
            <div style={{ padding: "5px 9px", borderRadius: "10px", background: "rgba(20,12,40,0.72)", border: "1px solid rgba(139,92,246,0.55)", color: "#fff", fontSize: "10px", fontWeight: 700, display: "flex", alignItems: "center", gap: "3px", backdropFilter: "blur(12px)" }}>🧠 {memoryCount}</div>
            <button onClick={() => setShowNameInput(true)} style={{ padding: "5px 9px", borderRadius: "10px", background: "rgba(20,12,40,0.72)", border: "1px solid rgba(139,92,246,0.55)", color: "#fff", fontSize: "10px", fontWeight: 700, cursor: "pointer", backdropFilter: "blur(12px)" }}>✏️</button>
          </div>
        </div>

        <div style={{ position: "relative", marginBottom: "5px" }}>
          <button onClick={() => setShowCharacterMenu(!showCharacterMenu)} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "7px 12px", borderRadius: "12px", background: "linear-gradient(90deg, rgba(40,15,60,0.85), rgba(30,15,55,0.85))", border: "1px solid rgba(255,77,185,0.5)", boxShadow: "0 0 14px rgba(255,45,149,0.18)", color: "#fff", cursor: "pointer" }}>
            <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ width: "28px", height: "28px", borderRadius: "50%", overflow: "hidden", background: "linear-gradient(135deg, #FF2D95, #8B5CF6)", border: "2px solid rgba(255,77,185,0.6)" }}>{renderAvatar(selectedCharacter)}</span>
              <div style={{ textAlign: "left" }}>
                <div style={{ fontSize: "12px", fontWeight: 800 }}>{displayName}</div>
                <div style={{ fontSize: "9px", color: "rgba(200,200,230,0.65)", marginTop: "1px" }}>{char.subtitle}</div>
              </div>
            </span>
            <span style={{ fontSize: "10px" }}>{showCharacterMenu ? "▲" : "▼"}</span>
          </button>

          {showCharacterMenu && (
            <div className="glass" style={{ position: "absolute", top: "100%", left: 0, right: 0, marginTop: "4px", borderRadius: "14px", padding: "6px", zIndex: 100 }}>
              {characters.map((c) => {
                const isSelected = selectedCharacter === c.id;
                const cName = customNames[c.id] || c.name;
                return (
                  <button key={c.id} onClick={() => switchCharacter(c.id)} style={{ width: "100%", padding: "8px 10px", borderRadius: "10px", background: isSelected ? "linear-gradient(135deg, rgba(255,45,149,0.3), rgba(139,92,246,0.3))" : "transparent", border: "none", color: "#fff", fontSize: "12px", fontWeight: isSelected ? 700 : 500, cursor: "pointer", textAlign: "left", display: "flex", gap: "10px", alignItems: "center" }}>
                    <span style={{ width: "28px", height: "28px", borderRadius: "50%", overflow: "hidden", background: "linear-gradient(135deg, #FF2D95, #8B5CF6)", flexShrink: 0 }}>{renderAvatar(c.id)}</span>
                    <div>
                      <div>{cName}</div>
                      <div style={{ fontSize: "9px", color: "var(--muted)", marginTop: "1px" }}>{c.subtitle}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px", padding: "7px 12px", borderRadius: "12px", marginBottom: "8px", background: autoListen ? "linear-gradient(90deg, rgba(20,25,55,0.9), rgba(15,30,60,0.9))" : "rgba(20,12,40,0.72)", border: autoListen ? "1px solid rgba(34,211,238,0.5)" : "1px solid rgba(139,92,246,0.4)", boxShadow: autoListen ? "0 0 18px rgba(34,211,238,0.18)" : "none" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", minWidth: 0 }}>
            <span style={{ width: "30px", height: "30px", borderRadius: "9px", display: "grid", placeItems: "center", fontSize: "14px", background: autoListen ? "linear-gradient(135deg, #F59E0B, #EF4444)" : "rgba(139,92,246,0.25)", boxShadow: autoListen ? "0 0 14px rgba(245,158,11,0.5)" : "none", flexShrink: 0 }}>🔁</span>
            <div style={{ minWidth: 0 }}>
              <p style={{ fontSize: "11px", fontWeight: 800, color: "#fff", margin: 0 }}>Auto-Listen {autoListen ? "ON" : "OFF"}</p>
              <p style={{ fontSize: "8.5px", color: "rgba(200,200,230,0.65)", margin: "1px 0 0" }}>{autoListen ? "একনাগাড়ে কথা বলুন" : "বারবার মাইকে চাপ দিন"}</p>
            </div>
          </div>
          <button onClick={toggleAutoListen} style={{ width: "42px", height: "24px", borderRadius: "12px", border: "none", background: autoListen ? "linear-gradient(135deg, #22c55e, #16a34a)" : "rgba(139,92,246,0.4)", position: "relative", cursor: "pointer", flexShrink: 0, boxShadow: autoListen ? "0 0 16px rgba(34,197,94,0.55)" : "none", transition: "all 0.3s" }}>
            <span style={{ position: "absolute", top: "3px", left: autoListen ? "21px" : "3px", width: "18px", height: "18px", borderRadius: "50%", background: "#fff", transition: "all 0.3s" }} />
          </button>
        </div>

        <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "8px", flex: 1, minHeight: "0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "2px", marginRight: "8px", height: "40px" }}>
            {[15, 25, 35, 20, 40, 28, 15].map((h, i) => (
              <div key={i} style={{ width: "3px", height: voiceState === "speaking" || voiceState === "listening" ? `${h}px` : "6px", borderRadius: "2px", background: "linear-gradient(180deg, #FF2D95, #8B5CF6)", transition: "height 0.3s ease", boxShadow: "0 0 8px rgba(255,45,149,0.7)" }} />
            ))}
          </div>

          <div style={{ position: "relative", flexShrink: 0 }}>
            <div style={{ width: "130px", height: "130px", borderRadius: "50%", overflow: "hidden", background: "linear-gradient(135deg, #FF2D95, #8B5CF6)", border: "3px solid rgba(255,77,185,0.7)", boxShadow: voiceState !== "idle" ? "0 0 50px rgba(255,45,149,0.75), 0 0 80px rgba(139,92,246,0.5)" : "0 0 30px rgba(255,45,149,0.45), 0 0 60px rgba(139,92,246,0.3)", transition: "all 0.3s ease" }}>
              <img src={mainImage} alt={char.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>

            <button onClick={() => setShowPhotoMenu(true)} style={{ position: "absolute", top: "-4px", right: "-4px", width: "32px", height: "32px", borderRadius: "50%", background: "rgba(30,15,55,0.95)", border: "1.5px solid rgba(255,77,185,0.6)", color: "#fff", fontSize: "13px", cursor: "pointer", boxShadow: "0 0 14px rgba(255,45,149,0.5)", display: "grid", placeItems: "center" }}>📷</button>

            {voiceState === "listening" && (
              <>
                <div style={{ position: "absolute", inset: "-10px", borderRadius: "50%", border: "2px solid rgba(255,45,149,0.5)", animation: "pulseVoice 1.6s ease-out infinite", pointerEvents: "none" }} />
                <div style={{ position: "absolute", inset: "-20px", borderRadius: "50%", border: "2px solid rgba(255,45,149,0.25)", animation: "pulseVoice 1.6s ease-out 0.6s infinite", pointerEvents: "none" }} />
              </>
            )}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "2px", marginLeft: "8px", height: "40px" }}>
            {[15, 28, 40, 20, 35, 25, 15].map((h, i) => (
              <div key={i} style={{ width: "3px", height: voiceState === "speaking" || voiceState === "listening" ? `${h}px` : "6px", borderRadius: "2px", background: "linear-gradient(180deg, #22D3EE, #8B5CF6)", transition: "height 0.3s ease", boxShadow: "0 0 8px rgba(34,211,238,0.7)" }} />
            ))}
          </div>
        </div>

        <style>{`
          @keyframes pulseVoice {
            0% { transform: scale(1); opacity: 1; }
            100% { transform: scale(1.35); opacity: 0; }
          }
        `}</style>

        <div style={{ textAlign: "center", marginBottom: "6px" }}>
          <h2 style={{ fontSize: "15px", fontWeight: 800, color: "#fff", margin: 0, marginBottom: "2px" }}>
            {voiceState === "idle" && (isCallActive ? "Waiting..." : "Tap to speak")}
            {voiceState === "listening" && "Listening..."}
            {voiceState === "thinking" && "Thinking..."}
            {voiceState === "speaking" && "Speaking..."}
          </h2>
          <p style={{ fontSize: "10px", color: "rgba(200,200,230,0.7)", margin: 0 }}>
            {voiceState === "idle" && (isCallActive ? "Auto-listen active" : "Tap the microphone and speak")}
            {voiceState === "listening" && "I'm listening to you..."}
            {voiceState === "thinking" && "Let me think..."}
            {voiceState === "speaking" && "Tap again to stop"}
          </p>
          {isCallActive && (
            <p style={{ fontSize: "9px", color: "#22c55e", fontWeight: 700, marginTop: "2px" }}>● Voice Call • {formatDuration(callDuration)}</p>
          )}
          {error && <p style={{ marginTop: "4px", fontSize: "10px", color: "#ef4444" }}>⚠️ {error}</p>}
        </div>

        <button onClick={toggleListening} disabled={voiceState === "thinking"} style={{ width: "100%", minHeight: "36px", borderRadius: "12px", marginBottom: "6px", border: voiceState !== "idle" ? "none" : "1px solid rgba(139,92,246,0.55)", background: voiceState !== "idle" ? "linear-gradient(135deg, #FF2D95, #8B5CF6)" : "rgba(20,12,40,0.72)", color: "#fff", fontSize: "12px", fontWeight: 800, cursor: voiceState === "thinking" ? "not-allowed" : "pointer", backdropFilter: "blur(12px)", boxShadow: voiceState !== "idle" ? "0 0 22px rgba(255,45,149,0.55)" : "none" }}>
          {voiceState === "idle" && (isCallActive ? "⏸ Stop Listening" : "🎤 Tap to Speak")}
          {voiceState === "listening" && "⏸ Stop Listening"}
          {voiceState === "thinking" && "⏳ Thinking..."}
          {voiceState === "speaking" && "⏸ Stop Speaking"}
        </button>

        <div style={{ display: "flex", gap: "6px", alignItems: "center", marginBottom: "6px" }}>
          <div style={{ flex: 1, display: "flex", alignItems: "center", gap: "6px", background: "rgba(15,8,30,0.85)", border: "1px solid rgba(139,92,246,0.5)", borderRadius: "20px", padding: "2px 4px 2px 12px" }}>
            <span style={{ fontSize: "12px", opacity: 0.6 }}>💬</span>
            <input type="text" value={textInput} onChange={(e) => setTextInput(e.target.value)} placeholder="Type here to test..." style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: "#fff", fontSize: "12px", padding: "6px 0" }} onKeyDown={(e) => { if (e.key === "Enter" && textInput.trim()) { setTranscript(textInput.trim()); sendToAI(textInput.trim()); setTextInput(""); setIsCallActive(true); } }} />
          </div>
          <button onClick={() => { if (textInput.trim()) { setTranscript(textInput.trim()); sendToAI(textInput.trim()); setTextInput(""); setIsCallActive(true); } }} style={{ minHeight: "36px", padding: "0 14px", borderRadius: "12px", border: "none", background: "linear-gradient(90deg, #FF2D95 0%, #8B5CF6 100%)", color: "#fff", fontSize: "12px", fontWeight: 800, cursor: "pointer", boxShadow: "0 5px 16px rgba(255,45,149,0.45)", display: "flex", alignItems: "center", gap: "4px" }}>➤ Send</button>
        </div>

        <div style={{ display: "flex", justifyContent: "center", gap: "10px", marginBottom: "8px" }}>
          <button onClick={() => setIsMuted((m) => !m)} style={{ width: "42px", height: "42px", borderRadius: "50%", padding: 0, background: isMuted ? "linear-gradient(135deg, #ef4444, #dc2626)" : "rgba(139,92,246,0.18)", border: isMuted ? "none" : "1px solid rgba(139,92,246,0.5)", color: "#fff", fontSize: "16px", cursor: "pointer", boxShadow: isMuted ? "0 0 18px rgba(239,68,68,0.5)" : "none" }} title="Mute">{isMuted ? "🔇" : "🎤"}</button>
          <button onClick={() => setIsSpeakerOn((s) => !s)} style={{ width: "42px", height: "42px", borderRadius: "50%", padding: 0, background: isSpeakerOn ? "linear-gradient(135deg, #22D3EE, #3B82F6)" : "rgba(139,92,246,0.18)", border: isSpeakerOn ? "none" : "1px solid rgba(139,92,246,0.5)", color: "#fff", fontSize: "16px", cursor: "pointer", boxShadow: isSpeakerOn ? "0 0 18px rgba(34,211,238,0.45)" : "none" }} title="Speaker">{isSpeakerOn ? "🔊" : "🔈"}</button>
          <button onClick={endCall} style={{ width: "48px", height: "48px", borderRadius: "50%", padding: 0, background: "linear-gradient(135deg, #ef4444, #dc2626)", color: "#fff", fontSize: "20px", cursor: "pointer", boxShadow: "0 0 26px rgba(239,68,68,0.6)", border: "none" }} title="End Call">📞</button>
          <button onClick={() => alert("ভিডিও কল ফিচার শীঘ্রই আসছে!")} style={{ width: "42px", height: "42px", borderRadius: "50%", padding: 0, background: "rgba(139,92,246,0.18)", border: "1px solid rgba(139,92,246,0.5)", color: "#fff", fontSize: "16px", cursor: "pointer" }} title="Video">📹</button>
        </div>

        {(transcript || aiResponse) && (
          <div style={{ padding: "10px 12px", borderRadius: "12px", background: "rgba(15,8,30,0.72)", border: "1px solid rgba(139,92,246,0.35)", backdropFilter: "blur(12px)", marginBottom: "8px", maxHeight: "100px", overflowY: "auto" }}>
            <p style={{ fontSize: "9px", color: "rgba(200,200,230,0.6)", margin: "0 0 4px" }}>Conversation</p>
            {transcript && (
              <div style={{ marginBottom: "6px" }}>
                <p style={{ fontSize: "8px", color: "rgba(255,255,255,0.55)", margin: "0 0 2px" }}>You said:</p>
                <p style={{ fontSize: "11px", color: "#fff", margin: 0 }}>{transcript}</p>
              </div>
            )}
            {aiResponse && (
              <div>
                <p style={{ fontSize: "8px", color: "rgba(255,255,255,0.55)", margin: "0 0 2px" }}>{displayName} said:</p>
                <p style={{ fontSize: "11px", color: "#fff", margin: 0 }}>{aiResponse}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {showNameInput && (
        <div className="modal-overlay" onClick={() => setShowNameInput(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ color: "#fff", fontSize: "16px", marginBottom: "12px" }}>Change Name</h3>
            <p style={{ color: "var(--muted)", fontSize: "12px", marginBottom: "12px" }}>Current: <strong style={{ color: "#fff" }}>{displayName}</strong></p>
            <input type="text" value={nameInputValue} onChange={(e) => setNameInputValue(e.target.value)} placeholder="New name..." style={{ width: "100%", padding: "10px 14px", borderRadius: "12px", marginBottom: "12px" }} />
            <div style={{ display: "flex", gap: "8px" }}>
              <button onClick={saveCustomName} className="btn btn-primary" style={{ flex: 1, padding: "10px" }}>✅ Save</button>
              <button onClick={resetCustomName} className="btn btn-secondary" style={{ flex: 1, padding: "10px" }}>🔄 Reset</button>
            </div>
          </div>
        </div>
      )}

      {showPhotoMenu && (
        <div className="modal-overlay" onClick={() => setShowPhotoMenu(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ color: "#fff", fontSize: "16px", marginBottom: "12px" }}>📷 {displayName}-র ছবি</h3>
            <input ref={fileInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handlePhotoUpload} />
            <div style={{ width: "110px", height: "110px", borderRadius: "50%", margin: "0 auto 16px", overflow: "hidden", background: "linear-gradient(135deg, #FF2D95, #8B5CF6)", display: "grid", placeItems: "center", border: "3px solid rgba(255,255,255,0.2)", boxShadow: "0 0 25px rgba(255,45,149,0.5)" }}>{renderAvatar(selectedCharacter)}</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "12px" }}>
              <button onClick={() => fileInputRef.current?.click()} className="btn btn-primary" style={{ padding: "10px" }}>📁 Upload</button>
              <button onClick={handleResetPhoto} className="btn btn-secondary" style={{ padding: "10px" }}>🔄 Reset</button>
            </div>
            <p style={{ fontSize: "11px", color: "var(--muted)", marginBottom: "10px", textAlign: "center" }}>অথবা Emoji বেছে নিন</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", justifyContent: "center" }}>
              {emojiOptions.map((emoji) => (
                <button key={emoji} onClick={() => handleEmojiSelect(emoji)} style={{ width: "40px", height: "40px", borderRadius: "50%", background: "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.35)", fontSize: "20px", cursor: "pointer" }}>{emoji}</button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
