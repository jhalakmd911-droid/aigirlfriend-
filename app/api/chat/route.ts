import { NextResponse } from "next/server";
import { getOfflineResponse } from "@/lib/characterKnowledge";

const characterPrompts: Record<string, string> = {
  jan: `তুমি জান — প্রেমময়ী বান্ধবী, বুদ্ধিমতী, রহস্যময়। ছোট বাক্যে বাংলায় বলো।`,
  lily: `তুমি লিলি — পেশাদার বিজনেস ম্যানেজার, বিশ্লেষণী। সংক্ষিপ্ত, স্পষ্ট বলো।`,
  emma: `তুমি এমা — গভীর রোমান্টিক প্রেমিকা। নরম, আবেগময় বলো।`,
  javed: `তুমি মীরা — শান্ত, বুদ্ধিমতী ব্যক্তিগত সহকারী। মিনিমাল কথা বলো।`,
  ayat: `তুমি নাদিয়া — প্রাণবন্ত, দুষ্টু, কৌতূহলী। ছোট ছোট বাক্যে বলো।`,
};

const GROQ_MODEL = "llama-3.3-70b-versatile";

function createOfflineStream(text: string): Response {
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      const words = text.split(" ");
      for (const word of words) {
        const chunk = `data: ${JSON.stringify({
          choices: [{ delta: { content: word + " " } }],
        })}\n\n`;
        controller.enqueue(encoder.encode(chunk));
        await new Promise((r) => setTimeout(r, 40));
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
      "X-Working-Model": "offline-brain",
    },
  });
}

export async function POST(req: Request) {
  try {
    const { messages, character, customName, memoryContext } = await req.json();
    const apiKey = process.env.GROQ_API_KEY;

    const userMessages = (Array.isArray(messages) ? messages : []).filter(
      (m: any) => m.role === "user"
    );
    const lastUserMessage =
      userMessages[userMessages.length - 1]?.content || "";

    if (!apiKey) {
      const offlineText = getOfflineResponse(character, lastUserMessage);
      return createOfflineStream(offlineText);
    }

    const basePrompt = characterPrompts[character] || characterPrompts.jan;
    let systemPrompt = basePrompt;
    if (customName) systemPrompt += `\nইউজার তোমাকে "${customName}" নামে ডাকতে চায়।`;
    if (memoryContext) systemPrompt += `\n\nআগের স্মৃতি:\n${memoryContext}`;
    systemPrompt += `\n\n২-৩ বাক্যে উত্তর দাও। বুদ্ধিমান, রহস্যময় এবং স্বাভাবিক শোনাও।`;

    const groqMessages = [
      { role: "system", content: systemPrompt },
      ...(Array.isArray(messages) ? messages : []).map((msg: any) => ({
        role: msg.role === "user" ? "user" : "assistant",
        content: String(msg.content || "").slice(0, 500),
      })),
    ];

    try {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: GROQ_MODEL,
          messages: groqMessages,
          temperature: 0.85,
          max_tokens: 250,
          stream: true,
        }),
      });

      if (!response.ok || !response.body) {
        const offlineText = getOfflineResponse(character, lastUserMessage);
        return createOfflineStream(offlineText);
      }

      const stream = new ReadableStream({
        async start(controller) {
          const reader = response.body!.getReader();
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
                    controller.enqueue(
                      encoder.encode(
                        `data: ${JSON.stringify({
                          choices: [{ delta: { content: text } }],
                        })}\n\n`
                      )
                    );
                  }
                } catch {}
              }
            }
            controller.enqueue(encoder.encode("data: [DONE]\n\n"));
            controller.close();
          } catch {
            controller.close();
          }
        },
      });

      return new Response(stream, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          "Connection": "keep-alive",
          "X-Working-Model": GROQ_MODEL,
        },
      });
    } catch {
      const offlineText = getOfflineResponse(character, lastUserMessage);
      return createOfflineStream(offlineText);
    }
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
