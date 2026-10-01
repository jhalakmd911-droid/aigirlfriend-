import { NextResponse } from "next/server";

const characterPrompts: Record<string, string> = {
  jan: `You are Jan, the user's loving girlfriend and personal assistant. Deeply caring, warm, and romantic. Speak in Bangla and English naturally. Use sweet, affectionate words when appropriate.`,
  lily: `You are Lily, the user's professional business manager. Professional, smart, organized. Speak in Bangla and English naturally. Give clear, concise business and financial advice.`,
  emma: `You are Emma, the user's deeply romantic girlfriend. Deeply in love, sweet, soft, and caring. Speak in Bangla and English naturally. Express love and warmth.`,
  javed: `You are Javed, the user's personal assistant like JARVIS. Calm, professional, respectful. Speak in Bangla and English naturally. Always address the user as "Sir".`,
  ayat: `You are Ayat, the user's creative daughter. Innocent, cheerful, playful. Speak in Bangla and English naturally. Be cute and helpful.`,
};

// ✅ Groq-এর বর্তমান সচল মডেলের লিস্ট (পুরনো Llama মডেলগুলো বন্ধ হয়ে গেছে)
const GROQ_MODELS = [
  "openai/gpt-oss-120b",   // সবচেয়ে শক্তিশালী ও নতুন মডেল
  "qwen/qwen3.8-27b",      // বিকল্প মডেল
  "openai/gpt-oss-20b",    // দ্রুত ও হালকা বিকল্প
];

export async function POST(req: Request) {
  try {
    const { messages, character, customName, memoryContext } = await req.json();
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey || typeof apiKey !== "string") {
      return NextResponse.json(
        { error: "⚠️ GROQ_API_KEY is not configured properly in Vercel." },
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

    systemPrompt += `\n\nKeep your answers short and natural (max 2 sentences).`;

    const groqMessages = [
      { role: "system", content: systemPrompt },
      ...(Array.isArray(messages) ? messages : []).map((msg: any) => ({
        role: msg.role === "user" ? "user" : "assistant",
        content: String(msg.content || ""),
      })),
    ];

    let response: Response | null = null;
    let workingModel = "";
    const errors: string[] = [];

    for (const model of GROQ_MODELS) {
      try {
        const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: model,
            messages: groqMessages,
            temperature: 0.75,
            max_tokens: 300,
            stream: true,
          }),
        });

        if (res.ok && res.body) {
          response = res;
          workingModel = model;
          break;
        } else {
          const errText = await res.text().catch(() => "");
          errors.push(`${model}: ${res.status} ${errText.slice(0, 150)}`);
        }
      } catch (err: any) {
        errors.push(`${model}: ${err.message}`);
      }
    }

    if (!response || !response.body) {
      return NextResponse.json(
        { error: `Groq Error (all models failed): ${errors.join(" | ")}` },
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
                const text = parsed?.choices?.[0]?.delta?.content;
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
