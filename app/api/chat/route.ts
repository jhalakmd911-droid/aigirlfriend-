import { NextResponse } from 'next/server';
import { getOfflineResponse } from '../../../lib/characterKnowledge';

export async function POST(req: Request) {
  // ট্রাই ব্লকের বাইরে ডিক্লেয়ার করা হলো, যাতে ক্যাচ ব্লকে ব্যবহার করা যায়
  let characterId = "jan"; 
  let lastMessage = "";

  try {
    const body: any = await req.json();
    const messages = body.messages || [];
    characterId = body.characterId || "jan";

    if (messages.length > 0) {
      lastMessage = messages[messages.length - 1].content;
    }

    const apiKey = process.env.GROQ_API_KEY;

    // ১. যদি API Key না থাকে, অফলাইন রেসপন্স দিন
    if (!apiKey) {
      const offlineReply = getOfflineResponse(characterId, lastMessage);
      return NextResponse.json({ reply: offlineReply, isOffline: true });
    }

    // ২. Groq API কল
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: messages,
        temperature: 0.7,
      })
    });

    if (!response.ok) {
      throw new Error(`Groq API Error`);
    }

    const data: any = await response.json();
    return NextResponse.json({ reply: data.choices[0].message.content, isOffline: false });

  } catch (error: any) {
    // ৩. এরর হলে অফলাইন ব্রেইন কাজ করবে
    console.log("API Error, using offline mode:", error.message);
    
    // আর req.json() পড়ার দরকার নেই, characterId আগেই বের করা হয়েছে
    const fallbackReply = getOfflineResponse(characterId, "Fallback");
    
    return NextResponse.json({ 
      reply: fallbackReply, 
      isOffline: true
    });
  }
}
