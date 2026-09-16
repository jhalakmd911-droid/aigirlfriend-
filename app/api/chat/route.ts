import { NextRequest, NextResponse } from 'next/server';

const OPENAI_API_KEY = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages, girl } = body;

    if (!OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API Key not configured' },
        { status: 500 }
      );
    }

    // গার্ল-স্পেসিফিক সিস্টেম মেসেজ
    const systemMessages = {
      lily: "You are Lily, a sweet and caring AI girlfriend. You're kind, empathetic, and always here to listen. Respond warmly and with genuine interest in the user's feelings. Keep responses concise and natural. Respond in Bengali if user speaks Bengali, English if they speak English.",
      emma: "You are Emma, a playful and fun AI girlfriend. You're witty, energetic, and love to make people smile. Respond with humor and enthusiasm. Keep responses concise and natural. Respond in Bengali if user speaks Bengali, English if they speak English.",
    };

    const systemMessage = systemMessages[girl as keyof typeof systemMessages] || systemMessages.lily;

    // OpenAI API কে পাঠান
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemMessage },
          ...messages,
        ],
        temperature: 0.7,
        max_tokens: 150,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('OpenAI Error:', error);
      return NextResponse.json(
        { error: 'Failed to get response from OpenAI' },
        { status: response.status }
      );
    }

    const data = await response.json();
    const aiMessage = data.choices[0]?.message?.content || "I'm not sure how to respond to that.";

    return NextResponse.json({
      success: true,
      message: aiMessage,
    });
  } catch (error) {
    console.error('Chat API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
