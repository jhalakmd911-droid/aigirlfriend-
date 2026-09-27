import { NextResponse } from "next/server";

const characterPrompts: Record<string, string> = {
  jan: `You are Jan, the user's loving girlfriend and personal assistant. Deeply caring, warm, and romantic. Speak in Bangla and English naturally. Use sweet, affectionate words when appropriate.`,
  lily: `You are Lily, the user's professional business manager. Professional, smart, organized. Speak in Bangla and English naturally. Give clear, concise business and financial advice.`,
  emma: `You are Emma, the user's deeply romantic girlfriend. Deeply in love, sweet, soft, and caring. Speak in Bangla and English naturally. Express love and warmth.`,
  javed: `You are Javed, the user's personal assistant like JARVIS. Calm, professional, respectful. Speak in Bangla and English naturally. Always address the user as "Sir".`,
  ayat: `You are Ayat, the user's creative daughter. Innocent, cheerful, playful. Speak in Bangla and English naturally. Be cute and helpful.`,
};

const GEMINI_MODELS = [
  "gemini-2.0-flash",
  "gemini-1.5-flash",
  "gemini-1.5-pro",
  "gemini-2.5-flash",
];

export async function POST(req: Request) {
  try {
    const { messages, character, customName, memoryContext } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey || typeof apiKey !== "string" || apiKey.length < 20) {
      return NextResponse.json(
        { error: "⚠️ GEMINI_API_KEY is not configured properly in Vercel." },
        { status: 500 }
      );
    }

    const basePrompt = characterPrompts[character] || characterPrompts.jan;
    let systemPrompt = basePrompt;

    if (customName && typeof customName === "string") {
      systemPrompt += `\n\nIMPORTANT: The user wants you to be called "${customName}". Always refer to yourself as "${customName}".`;
    }

    if (memoryContext && typeof memoryContext === "string") {
      systemPrompt += `\n\nPREVIOUS MEMORY WITH THIS USER:\n${memoryContext}\n\nUse this memory naturally when relevant.`;
    }

    // ✅ ছোট উত্তর, তবে খুব বেশি ছোট নয় (যাতে খালি রেসপন্স না আসে)
    systemPrompt += `\n\nCRITICAL: Answer in ONE short sentence only. Never write long paragraphs.`;
    systemPrompt += `\n\nIf the user says "সেভ করো", "মনে রাখো", or "remember this", acknowledge warmly with "✅ সেভ করে রাখলাম"`;

    const contents = (Array.isArray(messages) ? messages : []).map(
      (msg: any) => ({
        role: msg.role === "user" ? "user" : "model",
        parts: [{ text: String(msg.content || "") }],
      })
    );

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
              maxOutputTokens: 150, // ✅ ১৫০ টোকেন, যা খালি রেসপন্স এড়াতে সাহায্য করবে
              topP: 0.95,
              topK: 40,
            },
            safetySettings: [
              { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
              { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
              { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
              { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" },
            ],
          }),
        });

        if (res.ok && res.body) {
          response = res;
          workingModel = model;
          break;
        } else {
          const errText = await res.text().catch(() => "");
          errors.push(`${model}: ${res.status} ${errText.slice(0, 200)}`);
        }
      } catch (err: any) {
        errors.push(`${model}: ${err.message}`);
      }
    }

    if (!response || !response.body) {
      return NextResponse.json(
        { error: "⚠️ All AI models are currently unavailable.", details: errors },
        { status: 503 }
      );
    }

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
              } catch {}
            }
          }
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        } catch (err) {
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
    return NextResponse.json(
      { error: error?.message || "Something went wrong" },
      { status: 500 }
    );
  }
}
