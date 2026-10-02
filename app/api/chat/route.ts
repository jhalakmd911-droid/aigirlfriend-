import { NextResponse } from "next/server";

const characterPrompts: Record<string, string> = {
  jan: `You are Jan, the user's loving girlfriend and personal assistant. Deeply caring, warm, and romantic. Speak in Bangla and English naturally.`,
  lily: `You are Lily, the user's professional business manager. Professional, smart, organized. Speak in Bangla and English naturally.`,
  emma: `You are Emma, the user's deeply romantic girlfriend. Deeply in love, sweet, soft, and caring. Speak in Bangla and English naturally.`,
  javed: `You are Mira, the user's personal assistant like JARVIS. You are a calm, professional, respectful female assistant. Speak in Bangla and English naturally. Always address the user politely and helpfully.`,
  ayat: `You are Nadia, the user's creative and cheerful young friend. Innocent, playful, and full of energy. Speak in Bangla and English naturally. Be cute and helpful.`,
};

const GROQ_MODELS = [
  "llama-3.3-70b-versatile",
  "llama-3.1-8b-instant",
];

async function tryGroq(model: string, groqMessages: any[], apiKey: string): Promise<Response | null> {
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
        temperature: 0.7,
        max_tokens: 200,
        stream: true,
      }),
    });
    if (res.ok && res.body) return res;
    return null;
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  try {
    const { messages, character, customName, memoryContext } = await req.json();
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: "GROQ_API_KEY missing" }, { status: 500 });
    }

    const basePrompt = characterPrompts[character] || characterPrompts.jan;
    let systemPrompt = basePrompt;
    if (customName) systemPrompt += `\nYour name is "${customName}".`;
    if (memoryContext) systemPrompt += `\nMemory:\n${memoryContext}`;
    systemPrompt += `\n\nAnswer in 1-2 short Bangla sentences. Keep it simple and natural.`;

    const groqMessages = [
      { role: "system", content: systemPrompt },
      ...(Array.isArray(messages) ? messages : []).map((msg: any) => ({
        role: msg.role === "user" ? "user" : "assistant",
        content: String(msg.content || "").slice(0, 500),
      })),
    ];

    let response: Response | null = null;
    let workingModel = "";

    for (const model of GROQ_MODELS) {
      response = await tryGroq(model, groqMessages, apiKey);
      if (response) { workingModel = model; break; }
    }

    if (!response) {
      await new Promise((r) => setTimeout(r, 3000));
      for (const model of GROQ_MODELS) {
        response = await tryGroq(model, groqMessages, apiKey);
        if (response) { workingModel = model; break; }
      }
    }

    if (!response || !response.body) {
      return NextResponse.json({ error: "Groq busy. Please wait and try again." }, { status: 503 });
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
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({ choices: [{ delta: { content: text } }] })}\n\n`));
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
    return NextResponse.json({ error: error?.message || "Failed" }, { status: 500 });
  }
}
