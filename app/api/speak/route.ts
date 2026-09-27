import { NextResponse } from 'next/server';
import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts';

export async function POST(req: Request) {
  try {
    const { text } = await req.json();

    const tts = new MsEdgeTTS();
    await tts.setMetadata(
      "bn-IN-NabanitaNeural",
      OUTPUT_FORMAT.AUDIO_24KHZ_96KBITRATE_MONO_MP3
    );

    const { audioStream } = tts.toStream(text);

    const chunks: Buffer[] = [];
    for await (const chunk of audioStream) {
      chunks.push(chunk);
    }

    const audioBuffer = Buffer.concat(chunks);

    return new NextResponse(audioBuffer, {
      headers: { 'Content-Type': 'audio/mpeg' },
    });
  } catch (error: any) {
    console.error('Edge TTS error:', error);
    return NextResponse.json({ error: `TTS Error: ${error.message}` }, { status: 500 });
  }
}
