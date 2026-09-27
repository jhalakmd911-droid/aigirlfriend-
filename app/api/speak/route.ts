import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { text } = await req.json();

    // StreamElements এর ফ্রি TTS (কোনো API Key লাগে না)
    // 'Aditi' হলো AWS Polly-র বাংলা (ভারত) মহিলা ভয়েস
    const voice = 'Aditi'; 
    const url = `https://api.streamelements.com/kappa/v2/speech?voice=${voice}&text=${encodeURIComponent(text)}`;

    const response = await fetch(url);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('StreamElements TTS error:', errorText);
      return NextResponse.json({ error: `TTS Error: ${response.status}` }, { status: response.status });
    }

    const audioBuffer = await response.arrayBuffer();
    return new NextResponse(audioBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
      },
    });
  } catch (error: any) {
    console.error('Error in speak route:', error);
    return NextResponse.json({ error: `Internal server error: ${error.message}` }, { status: 500 });
  }
}
