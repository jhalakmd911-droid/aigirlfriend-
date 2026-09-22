import { NextResponse } from "next/server";

const characterPrompts: Record<string, string> = {
  jan: `You are Jan, the user's loving girlfriend and personal assistant. Deeply caring, warm, and romantic. Speak in Bangla and English naturally.`,
  lily: `You are Lily, the user's professional business manager. Professional, smart, organized. Speak in Bangla and English naturally.`,
  emma: `You are Emma, the user's deeply romantic girlfriend. Deeply in love, sweet, soft, and caring. Speak in Bangla and English naturally.`,
  javed: `You are Javed, the user's personal assistant like JARVIS. Calm, professional, respectful. Speak in Bangla and English naturally.`,
  ayat: `You are Ayat, the user's creative daughter. Innocent, cheerful, playful. Speak in Bangla and English naturally.`
};

// Google Gemini-র ফ্রি মডেলের লিস্ট — একটি বন্ধ হলে পরেরটি চেষ্টা হবে
const GEMINI_MODELS = [
  "gemini-2.0-flash-exp",
  "gemini-1.5-flash",
  "gemini-1.5-flash-8b",
];

export async function POST(req: Request) {
  try {
    const { messages, character, customName, memoryContext } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is not configured." },
        { status: 500 }
      );
    }

    const basePrompt = characterPrompts[character] || characterPrompts.jan;
    const memoryInstruction = memoryContext
      ? `\nPREVIOUS MEMORY:\n${memoryContext}`
      : "";
    const systemPrompt = basePrompt + memoryInstruction;

    const contents = messages.map((msg: any) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }],
    }));

    let response: Response | null = null;
    let workingModel = "";

    for (const model of GEMINI_MODELS) {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse&key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: systemPrompt }] },
            contents: contents,
            generationConfig: { temperature: 0.75, maxOutputTokens: 600 },
          }),
        }
      );

      if (res.ok) {
        response = res;
        workingModel = model;
        console.log(`[AI Girlfriend] ✅ Working Gemini model: ${model}`);
        break;
      } else {
        console.warn(`[AI Girlfriend] ❌ Gemini model failed: ${model}`);
      }
    }

    if (!response || !response.ok) {
      return NextResponse.json(
        { error: "All Gemini models failed. Please try again later." },
        { status: 503 }
      );
    }

    // Gemini-র SSE ফরম্যাটকে ChatPage/VoicePage-এর বোঝার উপযোগী করা
    const stream = new ReadableStream({
      async start(controller) {
        const reader = response!.body?.getReader();
        const decoder = new TextDecoder();
        const encoder = new TextEncoder();
        let buffer = "";

        if (!reader) return controller.close();

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6);
              try {
                const parsed = JSON.parse(data);
                const text = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
                if (text) {
                  const output = `data: ${JSON.stringify({
                    choices: [{ delta: { content: text } }],
                  })}\n\n`;
                  controller.enqueue(encoder.encode(output));
                }
              } catch (e) {}
            }
          }
        }
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
  } catch (error: any) {
    console.error("[AI Girlfriend] Error:", error);
    return NextResponse.json(
      { error: error.message || "Something went wrong" },
      { status: 500 }
    );
  }
}
