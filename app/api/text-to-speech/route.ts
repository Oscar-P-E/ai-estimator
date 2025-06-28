import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();

    if (!text) {
      return NextResponse.json(
        { error: 'No text provided' },
        { status: 400 }
      );
    }

    if (!process.env.ELEVENLABS_API_KEY) {
      return NextResponse.json(
        { error: 'ElevenLabs API key not configured' },
        { status: 500 }
      );
    }

    // ElevenLabs API call optimized for speed with Australian voice (Stuart)
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/HDA9tsk27wYi3uq0fPcK`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': process.env.ELEVENLABS_API_KEY,
      },
      body: JSON.stringify({
        text: text,
        model_id: 'eleven_turbo_v2_5', // Faster model
        voice_settings: {
          stability: 0.4, // Slightly lower for speed
          similarity_boost: 0.4, // Slightly lower for speed
          style: 0.0, // Disable style for speed
          use_speaker_boost: false // Disable for speed
        },
        optimize_streaming_latency: 4, // Maximum optimization for speed
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('ElevenLabs API error:', errorText);
      return NextResponse.json(
        { error: 'Failed to generate speech' },
        { status: response.status }
      );
    }

    // Get the audio data as ArrayBuffer
    const audioBuffer = await response.arrayBuffer();
    
    // Convert to base64 for JSON response
    const audioBase64 = Buffer.from(audioBuffer).toString('base64');

    return NextResponse.json({ 
      audio: audioBase64,
      contentType: 'audio/mpeg'
    });

  } catch (error) {
    console.error('TTS API error:', error);
    return NextResponse.json(
      { error: 'Failed to process text-to-speech request' },
      { status: 500 }
    );
  }
} 