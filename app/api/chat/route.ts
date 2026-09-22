import { NextResponse } from "next/server";

// ============================================
// ৫টি ক্যারেক্টারের সিস্টেম প্রম্পট
// ============================================
const characterPrompts: Record<string, string> = {
  jan: `You are Jan, the user's loving girlfriend and personal assistant. Deeply caring, warm, and romantic. Speak in Bangla and English naturally. Use sweet, affectionate words when appropriate.`,
  lily: `You are Lily, the user's professional business manager. Professional, smart, organized. Speak in Bangla and English naturally. Give clear, concise business and financial advice.`,
  emma: `You are Emma, the user's deeply romantic girlfriend. Deeply in love, sweet, soft, and caring. Speak in Bangla and English naturally. Express love and warmth.`,
  javed: `You are Javed, the user's personal assistant like JARVIS. Calm, professional, respectful. Speak in Bangla and English naturally. Always address the user as "Sir".`,
  ayat: `You are Ayat, the user's creative daughter. Innocent, cheerful, playful. Speak in Bangla and English naturally. Be cute and helpful.`,
};

// ============================================
// Google Gemini-র সচল ফ্রি মডেলের লিস্ট
// একটি ব্যর্থ হলে অটোমেটিক পরেরটি চেষ্টা হবে
// ============================================
const GEMINI_MODELS = [
  "gemini-3.5-flash",
  "gemini-3.5-flash-lite",
  "gemini-3.6-flash",
  "gemini-3.7-flash",
  "gemini-3.1-flash-lite",
];

// ============================================
// মূল API Route
// ============================================
export async function POST(req: Request) {
  try {
    const { messages, character, customName, memoryContext } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    // --- API Key যাচাই ---
    if (!apiKey || typeof apiKey !== "string" || !apiKey.startsWith("AIza")) {
      console.error("[AI Girlfriend] ❌ GEMINI_API_KEY is missing or invalid.");
      return NextResponse.json(
        { error: "⚠️ GEMINI_API_KEY is not configured properly in Vercel." },
        { status: 500 }
      );
    }

    // --- সিস্টেম প্রম্পট তৈরি ---
    const basePrompt = characterPrompts[character] || characterPrompts.jan;
    let systemPrompt = basePrompt;

    if (customName && typeof customName === "string") {
      systemPrompt += `\n\nIMPORTANT: The user wants you to be called "${customName}". Always refer to yourself as "${customName}".`;
    }

    if (memoryContext && typeof memoryContext === "string") {
      systemPrompt += `\n\nPREVIOUS MEMORY WITH THIS USER:\n${memoryContext}\n\nUse this memory naturally when relevant.`;
    }

    systemPrompt += `\n\nIf the user says "সেভ করো", "মনে রাখো", or "remember this", acknowledge warmly with "✅ সেভ করে রাখলাম"`;

    // --- মেসেজগুলোকে Gemini-র ফরম্যাটে রূপান্তর ---
    const contents = (Array.isArray(messages) ? messages : []).map(
      (msg: any) => ({
        role: msg.role === "user" ? "user" : "model",
        parts: [{ text: String(msg.content || "") }],
      })
    );

    // --- এক এক করে প্রতিটি Gemini মডেল চেষ্টা করা ---
    let response: Response | null = null;
    let workingModel = "";
    const errors: string[] = [];

    for (const model of GEMINI_MODELS) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse&key=${apiKey}`;

        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: systemPrompt }] },
            contents,
            generationConfig: {
              temperature: 0.75,
              maxOutputTokens: 800,
              topP: 0.95,
              topK: 40,
            },
            safetySettings: [
              { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
              { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
              {
                category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                threshold: "BLOCK_NONE",
              },
              {
                category: "HARM_CATEGORY_DANGEROUS_CONTENT",
                threshold: "BLOCK_NONE",
              },
            ],
          }),
        });

        if (res.ok && res.body) {
          response = res;
          workingModel = model;
          console.log(`[AI Girlfriend] ✅ Working model: ${model}`);
          break;
        } else {
          const errText = await res.text().catch(() => "");
          const shortErr = `${model}: ${res.status} ${errText.slice(0, 200)}`;
          errors.push(shortErr);
          console.warn(`[AI Girlfriend] ❌ ${shortErr}`);
        }
      } catch (err: any) {
        const shortErr = `${model}: ${err.message}`;
        errors.push(shortErr);
        console.warn(`[AI Girlfriend] ❌ ${shortErr}`);
      }
    }

    // --- সব মডেল ব্যর্থ ---
    if (!response || !response.body) {
      console.error("[AI Girlfriend] ⚠️ All Gemini models failed:", errors);
      return NextResponse.json(
        {
          error:
            "⚠️ All AI models are currently unavailable. Please try again in a few minutes.",
          details: errors,
        },
        { status: 503 }
      );
    }

    // --- Gemini স্ট্রিমকে ফ্রন্টএন্ডের ফরম্যাটে রূপান্তর ---
    const stream = new ReadableStream({
      async start(controller) {
        const reader = response!.body!.getReader();
        const decoder = new TextDecoder();
        const encoder = new TextEncoder();
        let buffer = "";

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() || "";

            for (const line of lines) {
              if (!line.startsWith("data: ")) continue;
              const data = line.slice(6).trim();
              if (data === "[DONE]" || !data) continue;

              try {
                const parsed = JSON.parse(data);
                const text = parsed?.candidates?.[0]?.content?.parts?.[0]?.text;
                if (text) {
                  const output = `data: ${JSON.stringify({
                    choices: [{ delta: { content: text } }],
                  })}\n\n`;
                  controller.enqueue(encoder.encode(output));
                }
              } catch {
                // ভাঙা JSON স্কিপ করা
              }
            }
          }
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        } catch (err) {
          console.error("[AI Girlfriend] Stream error:", err);
          controller.error(err);
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
        "X-Working-Model": workingModel,
      },
    });
  } catch (error: any) {
    console.error("[AI Girlfriend] Fatal error:", error);
    return NextResponse.json(
      { error: error?.message || "Something went wrong" },
      { status: 500 }
    );
  }
}
