import { NextRequest, NextResponse } from 'next/server';

const OPENROUTER_API_KEY = `${process.env.NEXT_PUBLIC_AI_KEY_PART1}${process.env.NEXT_PUBLIC_AI_KEY_PART2}`;
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages, girl } = body;

    if (!OPENROUTER_API_KEY) {
      return NextResponse.json(
        { error: 'OpenRouter API Key not configured' },
        { status: 500 }
      );
    }

    let systemMessage = 'You are Lily, a sweet and caring AI girlfriend.';

    if (girl === 'emma') {
      systemMessage = 'You are Emma, a playful and fun AI girlfriend.';
    }

    const formattedMessages = [
      { role: 'system', content: systemMessage },
      ...messages.map((m: any) => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.text,
      }))
    ];

    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'https://github.com/jhalakmd911-droid/aigirlfriend',
        'X-Title': 'AI Girlfriend'
      },
      body: JSON.stringify({
        model: 'openai/gpt-3.5-turbo',
        messages: formattedMessages,
        temperature: 0.7,
        max_tokens: 150,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('OpenRouter Error:', data);
      return NextResponse.json(
        { error: data.error?.message || 'Failed to get response from OpenRouter' },
        { status: 500 }
      );
    }

    const reply = data.choices?.[0]?.message?.content || 'No response generated.';

    return NextResponse.json({ success: true, message: reply });

  } catch (error) {
    console.error('API Route Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
