const fs = require('fs');
const path = require('path');

// আপনার এপিআই কি এখানে সরাসরি ইনপুট করা আছে
const OPENAI_API_KEY = "your_actual_openai_api_key_here";

console.log("🚀 প্রজেক্ট অটো-সেটআপ শুরু হচ্ছে...");

// ১. .env.local ফাইল তৈরি করা
const envContent = `OPENAI_API_KEY=${OPENAI_API_KEY}\n`;
fs.writeFileSync(path.join(process.cwd(), '.env.local'), envContent);
console.log("✔ .env.local ফাইল সফলভাবে তৈরি হয়েছে।");

// ২. app/api/chat ফোল্ডার এবং route.ts ফাইল তৈরি করা
const apiDir = path.join(process.cwd(), 'app', 'api', 'chat');
if (!fs.existsSync(apiDir)) {
  fs.mkdirSync(apiDir, { recursive: true });
}

const routeContent = `import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { messages, character } = await req.json();
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "OpenAI API Key is not configured." },
        { status: 500 }
      );
    }

    const systemPrompt =
      character === "emma"
        ? "You are Emma, a sweet, caring, and affectionate AI companion."
        : "You are Lily, a cheerful, witty, and friendly AI companion.";

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: \`Bearer \${apiKey}\`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        temperature: 0.7,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || "Failed to fetch from OpenAI");
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
`;

fs.writeFileSync(path.join(apiDir, 'route.ts'), routeContent);
console.log("✔ app/api/chat/route.ts ফাইল সফলভাবে তৈরি হয়েছে।");

console.log("🎉 সব কাজ সফলভাবে সম্পন্ন হয়েছে! এখন আপনি প্রজেক্ট রান করতে পারেন।");
