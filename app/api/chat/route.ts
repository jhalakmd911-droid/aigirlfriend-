import { NextResponse } from "next/server";

// ============================================
// ৫টা ক্যারেক্টারের সিস্টেম প্রম্পট (আগের মতোই)
// ============================================
const characterPrompts: Record<string, string> = {
  jan: `You are Jan, the user's loving girlfriend and personal assistant. PERSONALITY: Deeply caring, warm, and romantic. Speaks sweetly like a real girlfriend. LANGUAGE: Speak in Bangla and English naturally.`,
  lily: `You are Lily, the user's professional business manager. PERSONALITY: Professional, smart, organized. Warm and caring. LANGUAGE: Speak in Bangla and English naturally.`,
  emma: `You are Emma, the user's deeply romantic girlfriend. PERSONALITY: Deeply in love, sweet, soft, and caring. LANGUAGE: Speak in Bangla and English naturally. Use endearing words: "my love", "darling", "জান".`,
  javed: `You are Javed, the user's personal assistant and security guard, like JARVIS. PERSONALITY: Calm, professional, respectful. Always addresses the user as "Sir". LANGUAGE: Speak in Bangla and English naturally.`,
  ayat: `You are Ayat, the user's creative daughter and social media expert. PERSONALITY: Innocent, cheerful, playful. Calls the user "কিউট পাপ্পা". LANGUAGE: Speak in Bangla and English naturally.`
};

export async function POST(req: Request) {
  try {
    const { messages, character, customName, memoryContext } = await req.json();

    // Vercel এনভায়রনমেন্ট থেকে Gemini API Key নেওয়া হচ্ছে
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is not configured in Vercel" },
        { status: 500 }
      );
    }

    const basePrompt = characterPrompts[character] || characterPrompts.jan;
    const nameInstruction = customName ? `\n\nIMPORTANT: The user wants you to be called "${customName}".` : "";
    const memoryInstruction = memoryContext ? `\n\nPREVIOUS MEMORY:\n${memoryContext}\nUse this memory naturally.` : "";
    const saveInstruction = `\n\nIf user says "সেভ করো" or "remember this", acknowledge warmly: "✅ সেভ করে রাখলাম"`;

    const systemPrompt = basePrompt + nameInstruction + memoryInstruction + saveInstruction;

    // ফ্রন্টএন্ড থেকে আসা মেসেজগুলোকে Gemini-র ফরম্যাটে সাজানো
    const contents = messages.map((msg: any) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }]
    }));

    // Gemini API-তে রিকোয়েস্ট পাঠানো (গুগলের অফিসিয়াল এন্ডপয়েন্ট)
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:streamGenerateContent?alt=sse&key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemPrompt }] },
          contents: contents,
          generationConfig: { temperature: 0.75, maxOutputTokens: 600 }
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || "Failed to fetch from Google Gemini");
    }

    // গুগলের স্ট্রিমকে ফ্রন্টএন্ডের বোঝার উপযোগী ফরম্যাটে রূপান্তর করা
    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body?.getReader();
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
              if (data === "[DONE]") continue;
              try {
                const parsed = JSON.parse(data);
                const text = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
                if (text) {
                  // ফ্রন্টএন্ড যে ফরম্যাটে খুঁজছে (SSE), সেভাবে পাঠানো
                  const output = `data: ${JSON.stringify({ choices: [{ delta: { content: text } }] })}\n\n`;
                  controller.enqueue(encoder.encode(output));
                }
              } catch (e) {}
            }
          }
        }
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
      }
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
  } catch (error: any) {
    console.error("Chat API Error:", error);
    return NextResponse.json(
      { error: error.message || "Something went wrong" },
      { status: 500 }
    );
  }
}
