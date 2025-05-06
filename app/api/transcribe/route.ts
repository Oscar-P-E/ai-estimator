import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge'; // for low latency

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.DEEPGRAM_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Deepgram API key not set' }, { status: 500 });
    }

    const formData = await request.formData();
    const audio = formData.get('audio') as File;
    if (!audio) {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 });
    }

    const buffer = Buffer.from(await audio.arrayBuffer());

    const deepgramRes = await fetch('https://api.deepgram.com/v1/listen', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${apiKey}`,
        'Content-Type': audio.type || 'audio/wav',
      },
      body: buffer,
    });

    if (!deepgramRes.ok) {
      const err = await deepgramRes.text();
      return NextResponse.json({ error: 'Deepgram error', details: err }, { status: 500 });
    }

    const dgData = await deepgramRes.json();
    const transcript = dgData.results?.channels?.[0]?.alternatives?.[0]?.transcript || '';
    return NextResponse.json({ transcript });
  } catch (error) {
    console.error('Transcription error:', error);
    return NextResponse.json({ error: 'Failed to transcribe audio' }, { status: 500 });
  }
} 