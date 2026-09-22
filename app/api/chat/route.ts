import { NextResponse } from "next/server";

const characterPrompts: Record<string, string> = {
  jan: `You are Jan, the user's loving girlfriend and personal assistant. Deeply caring, warm, and romantic. Speak in Bangla and English naturally.`,
  lily: `You are Lily, the user's professional business manager. Professional, smart, organized. Speak in Bangla and English naturally.`,
  emma: `You are Emma, the user's deeply romantic girlfriend. Deeply in love, sweet, soft, and caring. Speak in Bangla and English naturally.`,
  javed: `You are Javed, the user's personal assistant like JARVIS. Calm, professional, respectful. Speak in Bangla and English naturally.`,
  ayat: `You are Ayat, the user's creative daughter. Innocent, cheerful, playful. Speak in Bangla and English naturally.`
};

export async function POST(req: Request) {
  try {
    const { messages, character, customName, memoryContext } = await req.json();
    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "OPENROUTER_API_KEY is not configured." },
        { status: 500 }
      );
    }

    const basePrompt = characterPrompts[character] || characterPrompts.jan;
    const memoryInstruction = memoryContext
      ? `\nPREVIOUS MEMORY:\n${memoryContext}`
      : "";
    const systemPrompt = basePrompt + memoryInstruction;

    // একাধিক ফ্রি মডেল — একটি ব্যর্থ হলে পরেরটি চেষ্টা করবে
    const fallbackModels = [
      "google/gemma-2-9b-it:free",
      "mistralai/mistral-nemo:free",
      "qwen/qwen-2.5-7b-instruct:free",
      "microsoft/phi-3-mini-128k-instruct:free",
    ];

    let response: Response | null = null;

    for (const model of fallbackModels) {
      const res = await fetch(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "HTTP-Referer": "https://aigirlfriend-ten.vercel.app",
            "X-Title": "AI Girlfriend App",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: model,
            messages: [
              { role: "system", content: systemPrompt },
              ...messages,
            ],
            temperature: 0.75,
            max_tokens: 600,
            stream: true,
          }),
        }
      );

      if (res.ok) {
        response = res;
        break;
      }
    }

    if (!response || !response.ok) {
      throw new Error(
        "All free models are currently unavailable. Please try again later."
      );
    }

    return new Response(response.body, {
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
