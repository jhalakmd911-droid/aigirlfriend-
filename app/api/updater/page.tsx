"use client";

import { useEffect, useRef, useState } from "react";

interface PreviewStatus {
  exists: boolean;
  state?: "waiting" | "building" | "ready" | "failed";
  previewUrl?: string;
  logUrl?: string;
  files?: { name: string; status: string }[];
}

const PW_KEY = "updater_pw";

export default function UpdaterPage() {
  const [password, setPassword] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [status, setStatus] = useState<PreviewStatus>({ exists: false });
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(PW_KEY);
      if (saved) setPassword(saved);
    } catch (e) {}
  }, []);

  const headers = () => ({ "x-update-password": password });

  const refresh = async () => {
    if (!password) return;
    try {
      const res = await fetch("/api/updater", { headers: headers(), cache: "no-store" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "স্ট্যাটাস জানা যায়নি");
        return;
      }
      setError("");
      setStatus(data);
    } catch (e) {
      setError("নেটওয়ার্ক সমস্যা");
    }
  };

  // Poll while a preview exists and is not finished
  useEffect(() => {
    if (!password) return;
    refresh();
    timerRef.current = setInterval(() => {
      if (status.exists && (status.state === "ready" || status.state === "failed")) return;
      refresh();
    }, 8000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [password, status.exists, status.state]);

  const savePassword = (v: string) => {
    setPassword(v);
    try {
      sessionStorage.setItem(PW_KEY, v);
    } catch (e) {}
  };

  const upload = async () => {
    if (!file) return;
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/updater", { method: "POST", headers: headers(), body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "আপলোড ব্যর্থ");
      let msg = `✅ ${data.changed.length}টা ফাইল পাঠানো হয়েছে।`;
      if (data.deleted?.length) msg += ` মুছবে: ${data.deleted.length}টা।`;
      if (data.skipped?.length) msg += ` বাদ গেছে (নিরাপত্তার কারণে): ${data.skipped.join(", ")}`;
      setMessage(msg);
      setFile(null);
      await refresh();
    } catch (err: any) {
      setError(err.message || "আপলোড ব্যর্থ");
    } finally {
      setBusy(false);
    }
  };

  const approve = async () => {
    if (!confirm("আপডেট আসল সাইটে চালু করবেন?")) return;
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/updater", { method: "PUT", headers: headers() });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "চালু করা যায়নি");
      setMessage("🚀 চালু করা হয়েছে! ১–২ মিনিটে আসল সাইটে দেখা যাবে।");
      setStatus({ exists: false });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const reject = async () => {
    if (!confirm("এই আপডেট বাতিল করবেন? আসল সাইট যেমন আছে তেমনই থাকবে।")) return;
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/updater", { method: "DELETE", headers: headers() });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "বাতিল করা যায়নি");
      setMessage("❌ বাতিল করা হয়েছে। নতুন ZIP দিতে পারেন।");
      setStatus({ exists: false });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const stateText: Record<string, string> = {
    waiting: "⏳ পরীক্ষার সাইট বানানোর অপেক্ষা...",
    building: "🔨 পরীক্ষার সাইট বানানো হচ্ছে (১–২ মিনিট)...",
    ready: "✅ পরীক্ষার সাইট তৈরি! নিচের লিংকে খুলে দেখুন।",
    failed: "❌ পরীক্ষার সাইট বানাতে ভুল হয়েছে (কোডে সমস্যা থাকতে পারে)।",
  };

  return (
    <div style={{ width: "100%", maxWidth: 520, margin: "0 auto", padding: "16px 12px 60px", boxSizing: "border-box" }}>
      <a href="/" style={{ fontSize: 13, color: "#22d3ee", textDecoration: "none" }}>← অ্যাপে ফিরুন</a>
      <h1 style={{ margin: "10px 0 6px", fontSize: 20, fontWeight: 800 }}>☁️ আপডেট সেন্টার</h1>
      <p style={{ margin: "0 0 14px", fontSize: 13, color: "#9d94b8", lineHeight: 1.6 }}>
        শুধু বদলানো ফাইলগুলোর ZIP দিন (প্রজেক্টের মতো একই ফোল্ডার পথে)। আগে একটা পরীক্ষার সাইট তৈরি হবে।
        আপনি দেখে "ঠিক আছে" বললে তবেই আসল সাইটে চালু হবে। মুছতে চাইলে ZIP এ <code>_delete.txt</code> রাখুন,
        প্রতি লাইনে একটা ফাইলের পথ।
      </p>

      <div className="card" style={{ padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
        <input
          type="password"
          placeholder="আপডেট পাসওয়ার্ড"
          value={password}
          onChange={(e) => savePassword(e.target.value)}
          style={{ padding: 10, borderRadius: 10, border: "1px solid rgba(139,92,246,0.4)", background: "rgba(0,0,0,0.3)", color: "inherit" }}
        />

        <input type="file" accept=".zip,application/zip" disabled={busy} onChange={(e) => setFile(e.target.files?.[0] || null)} style={{ fontSize: 13 }} />

        <button className="btn btn-primary" onClick={upload} disabled={!file || !password || busy} style={{ padding: 12 }}>
          🧪 পরীক্ষার জন্য পাঠাও
        </button>

        {message && <div style={{ fontSize: 13 }}>{message}</div>}
        {error && <div style={{ fontSize: 13, color: "#ef4444" }}>⚠️ {error}</div>}
      </div>

      {status.exists && (
        <div className="card" style={{ padding: 16, marginTop: 14, display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ fontSize: 14, fontWeight: 700 }}>{stateText[status.state || "waiting"]}</div>

          {status.files && status.files.length > 0 && (
            <div style={{ fontSize: 12, color: "#9d94b8", lineHeight: 1.6, wordBreak: "break-all" }}>
              {status.files.map((f) => (
                <div key={f.name}>• {f.name} ({f.status})</div>
              ))}
            </div>
          )}

          {status.previewUrl && (
            <a href={status.previewUrl} target="_blank" rel="noreferrer" className="btn btn-secondary" style={{ padding: 12, textAlign: "center", textDecoration: "none" }}>
              🔗 পরীক্ষার সাইট খুলুন
            </a>
          )}
          {status.state === "failed" && status.logUrl && (
            <a href={status.logUrl} target="_blank" rel="noreferrer" style={{ fontSize: 13, color: "#22d3ee" }}>বিল্ড লগ দেখুন</a>
          )}

          <div style={{ display: "flex", gap: 10 }}>
            <button className="btn btn-primary" onClick={approve} disabled={busy || status.state !== "ready"} style={{ flex: 1, padding: 12 }}>
              ✅ ঠিক আছে, চালু করো
            </button>
            <button className="btn btn-secondary" onClick={reject} disabled={busy} style={{ flex: 1, padding: 12 }}>
              ❌ ঠিক নেই
            </button>
          </div>
          <div style={{ fontSize: 12, color: "#9d94b8" }}>
            "ঠিক নেই" চাপলে আসল সাইট অপরিবর্তিত থাকে। এরপর সংশোধন করা নতুন ZIP আবার দিন।
          </div>
        </div>
      )}
    </div>
  );
}
