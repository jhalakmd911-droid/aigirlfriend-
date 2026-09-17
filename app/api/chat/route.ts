import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { messages, character } = await req.json();
    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "OPENROUTER_API_KEY is not configured in .env.local" },
        { status: 500 }
      );
    }

    const systemPrompt =
      character === "emma"
        ? "You are Emma, a playful, fun, and energetic AI companion. Reply warmly and naturally in the user's language."
        : "You are Lily, a sweet, caring, and affectionate AI companion. Reply warmly and naturally in the user's language.";

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "HTTP-Referer": "https://aigirlfriend.app",
          "X-Title": "AI Girlfriend App",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "openrouter/free",
          messages: [
            { role: "system", content: systemPrompt },
            ...messages,
          ],
          temperature: 0.85,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.error?.message || "Failed to fetch from OpenRouter"
      );
    }

    const reply = data.choices?.[0]?.message?.content || "";
    return NextResponse.json({ reply });
  } catch (error: any) {
    console.error("Chat API Error:", error);
    return NextResponse.json(
      { error: error.message || "Something went wrong" },
      { status: 500 }
    );
  }
}
