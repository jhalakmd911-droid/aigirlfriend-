import { NextResponse } from "next/server";
import { buildSystemPrompt } from "@/lib/characterKnowledge"; // স্পেস মুছে ফেলা হয়েছে

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

// ভুল মডেল পরিবর্তন করে সঠিক মডেল বসানো হয়েছে
const DEFAULT_MODEL = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

function isMessage(value: unknown): value is ChatMessage {
  if (!value || typeof value !== "object") return false;
  const message = value as Record<string, unknown>;
  return (
    (message.role === "system" || message.role === "user" || message.role === "assistant") &&
    typeof message.content === "string"
  );
}

export async function POST(request: Request) {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: "GROQ_API_KEY is not configured." }, { status: 500 });
  }

  try {
    const body = await request.json();
    const incomingMessages = Array.isArray(body?.messages) ? body.messages : [];
    const messages = incomingMessages.filter(isMessage).slice(-30);

    if (messages.length === 0) {
      return NextResponse.json({ error: "No chat messages were provided." }, { status: 400 });
    }

    const character = typeof body?.character === "string" ? body.character : "jan";
    const customName = typeof body?.customName === "string" ? body.customName : "";
    const memoryContext = typeof body?.memoryContext === "string" ? body.memoryContext : "";

    // এই ফাংশনটি এখন lib/characterKnowledge.ts এ তৈরি করে দিচ্ছি
    const systemPrompt = buildSystemPrompt(character, customName, memoryContext);

    const groqMessages = [
      { role: "system" as const, content: systemPrompt },
      ...messages
        .filter((message) => message.role !== "system")
        .map((message) => ({
          role: message.role as "user" | "assistant",
          content: message.content.slice(0, 12000),
        })),
    ];

    const upstream = await fetch(GROQ_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        messages: groqMessages,
        temperature: 0.7,
        max_completion_tokens: 1024,
        stream: true,
      }),
      cache: "no-store",
    });

    if (!upstream.ok) {
      const errorText = await upstream.text();
      let errorMessage = "Groq API request failed.";
      try {
        const parsed = JSON.parse(errorText);
        errorMessage = parsed?.error?.message || parsed?.error || errorMessage;
      } catch {
        if (errorText) errorMessage = errorText.slice(0, 500);
      }
      return NextResponse.json({ error: errorMessage }, { status: upstream.status });
    }

    if (!upstream.body) {
      return NextResponse.json({ error: "Groq returned an empty response." }, { status: 502 });
    }

    return new Response(upstream.body, {
      status: 200,
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json({ error: "Unable to process the chat request." }, { status: 500 });
  }
}
