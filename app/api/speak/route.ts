import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { text } = await req.json();
    const apiKey = process.env.ELEVENLABS_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
    }

    // "Rachel" ভয়েস আইডি (মেয়ে কণ্ঠ)
    const voiceId = '21m00Tcm4TlvDq8ikWAM'; 
    const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'xi-api-key': apiKey,
      },
      body: JSON.stringify({
        text: text,
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json({ error: `ElevenLabs Error: ${response.status} - ${errorText}` }, { status: response.status });
    }

    const audioBuffer = await response.arrayBuffer();
    return new NextResponse(audioBuffer, {
      headers: { 'Content-Type': 'audio/mpeg' },
    });
  } catch (error: any) {
    return NextResponse.json({ error: `Internal server error: ${error.message}` }, { status: 500 });
  }
}
