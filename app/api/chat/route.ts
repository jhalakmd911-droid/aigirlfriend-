import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { messages, character } = await req.json();
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "API Key is not configured." },
        { status: 500 }
      );
    }

    const systemPrompt =
      character === "emma"
        ? "You are Emma, a sweet, caring, and affectionate AI companion."
        : "You are Lily, a cheerful, witty, and friendly AI companion.";

    // OpenRouter API Call with required headers
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "HTTP-Referer": "https://github.com/jhalakmd911-droid/aigirlfriend-", // আপনার সাইট বা গিটহাব লিংক
        "X-Title": "AI Girlfriend App", // আপনার অ্যাপের নাম
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openai/gpt-3.5-turbo", // অথবা আপনার পছন্দের ওপেনরাউটার মডেল
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || "Failed to fetch from OpenRouter");
    }

    const reply = data.choices[0].message.content;
    return NextResponse.json({ reply });
  } catch (error: any) {
    console.error("Chat API Error:", error);
    return NextResponse.json(
      { error: error.message || "Something went wrong" },
      { status: 500 }
    );
  }
}
