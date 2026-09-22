import { NextResponse } from "next/server";

const characterPrompts: Record<string, string> = {
  jan: `You are Jan, the user's loving girlfriend and personal assistant. Deeply caring, warm, and romantic. Speak in Bangla and English naturally.`,
  lily: `You are Lily, the user's professional business manager. Professional, smart, organized. Speak in Bangla and English naturally.`,
  emma: `You are Emma, the user's deeply romantic girlfriend. Deeply in love, sweet, soft, and caring. Speak in Bangla and English naturally.`,
  javed: `You are Javed, the user's personal assistant like JARVIS. Calm, professional, respectful. Speak in Bangla and English naturally.`,
  ayat: `You are Ayat, the user's creative daughter. Innocent, cheerful, playful. Speak in Bangla and English naturally.`
};

// ============================================
// সব ফ্রি মডেলের লিস্ট — শক্তিশালী ও বাংলা-সাপোর্টেড মডেল আগে
// একটি বন্ধ হয়ে গেলে অটোমেটিক পরেরটি চেষ্টা হবে
// ============================================
const FREE_MODELS = [
  "google/gemma-2-9b-it:free",
  "google/gemma-2-27b-it:free",
  "mistralai/mistral-nemo:free",
  "mistralai/mistral-small-3.1-24b-instruct:free",
  "mistralai/mistral-7b-instruct:free",
  "qwen/qwen-2.5-7b-instruct:free",
  "qwen/qwen-2.5-72b-instruct:free",
  "qwen/qwq-32b:free",
  "meta-llama/llama-3.2-3b-instruct:free",
  "meta-llama/llama-3.3-70b-instruct:free",
  "meta-llama/llama-4-maverick:free",
  "meta-llama/llama-4-scout:free",
  "microsoft/phi-3-mini-128k-instruct:free",
  "microsoft/phi-3-medium-128k-instruct:free",
  "deepseek/deepseek-chat:free",
  "deepseek/deepseek-r1:free",
  "deepseek/deepseek-r1-distill-llama-70b:free",
  "nvidia/llama-3.1-nemotron-70b-instruct:free",
  "nousresearch/hermes-3-llama-3.1-405b:free",
  "cohere/command-r-plus:free",
  "cohere/command-r:free",
  "moonshotai/kimi-k2:free",
];

// ============================================
// মূল API Route
// ============================================
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

    let response: Response | null = null;
    let workingModel = "";
    const failedModels: string[] = [];

    // এক এক করে প্রতিটি ফ্রি মডেল চেষ্টা করা
    for (const model of FREE_MODELS) {
      try {
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
          workingModel = model;
          // ✅ সিগনাল: কোন মডেল কাজ করছে, তা Vercel লগে দেখা যাবে
          console.log(`[AI Girlfriend] ✅ Working model: ${model}`);
          break;
        } else {
          failedModels.push(model);
          console.warn(`[AI Girlfriend] ❌ Model failed: ${model}`);
        }
      } catch (e) {
        failedModels.push(model);
        console.warn(`[AI Girlfriend] ❌ Model error: ${model}`);
      }
    }

    if (!response || !response.ok) {
      // সব মডেল ফেইল — ক্লায়েন্টকে জানানো হচ্ছে
      console.error(`[AI Girlfriend] ⚠️ All ${FREE_MODELS.length} free models failed.`);
      return NextResponse.json(
        {
          error:
            "⚠️ All free AI models are currently unavailable. Please try again in a few minutes. (OpenRouter may have temporarily disabled their free tier.)",
        },
        { status: 503 }
      );
    }

    // সফল মডেলের নাম হেডারে পাঠিয়ে দেওয়া — ফ্রন্টএন্ড চাইলে দেখাতে পারে
    return new Response(response.body, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
        "X-Working-Model": workingModel,
      },
    });
  } catch (error: any) {
    console.error("[AI Girlfriend] Chat API Error:", error);
    return NextResponse.json(
      { error: error.message || "Something went wrong" },
      { status: 500 }
    );
  }
}
