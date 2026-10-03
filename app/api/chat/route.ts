// app/api/chat/route.ts
import { NextResponse } from 'next/server';

// আপনার characterKnowledge ফাইলটি থেকে ফাংশনটি ইমপোর্ট করা হচ্ছে
// যদি নিচের লাইনটি এরর দেয়, তবে নিচের "ধাপ ৩" দেখুন
import { getOfflineResponse } from '../../../lib/characterKnowledge'; // সরাসরি রিলেটিভ পাথ

export async function POST(req: Request) {
  try {
    const body: any = await req.json();
    const messages = body.messages || [];
    const characterId = body.characterId || "jan";

    const apiKey = process.env.GROQ_API_KEY;

    // ১. যদি API Key না থাকে, অফলাইন রেসপন্স দিন
    if (!apiKey) {
      const lastMessage = messages.length > 0 ? messages[messages.length - 1].content : "";
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

    // ৩. যদি Rate Limit (429) বা অন্য কোনো এরর হয়
    if (!response.ok) {
      throw new Error(`Groq API Error`);
    }

    const data: any = await response.json();
    return NextResponse.json({ reply: data.choices[0].message.content, isOffline: false });

  } catch (error: any) {
    // ৪. যেকোনো এরর হলে অফলাইন ব্রেইন কাজ করবে
    console.log("API Error, using offline mode");
    
    // বডি থেকে characterId বের করার চেষ্টা (ফেইল করলে 'jan' ডিফল্ট)
    let charId = "jan";
    try {
       const b = await req.json(); // চেষ্টা করা হচ্ছে বডি আবার পড়তে
       if (b && b.characterId) charId = b.characterId;
    } catch(e) {}

    const fallbackReply = getOfflineResponse(charId, "Fallback");
    
    return NextResponse.json({ 
      reply: fallbackReply, 
      isOffline: true
    });
  }
}
