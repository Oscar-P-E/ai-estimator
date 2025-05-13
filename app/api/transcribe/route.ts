import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@deepgram/sdk';

// Initialize the Deepgram client
const deepgram = createClient(process.env.DEEPGRAM_API_KEY!);

export const runtime = 'edge'; // for low latency

export async function POST(request: NextRequest) {
  try {
    // Get the audio file from the request
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      console.error('No file provided in request');
      return NextResponse.json(
        { error: 'No audio file provided' },
        { status: 400 }
      );
    }

    console.log('Received file:', {
      name: file.name,
      type: file.type,
      size: file.size
    });

    // Convert the file to a buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    console.log('Created buffer, size:', buffer.length);

    // Send to Deepgram for transcription
    try {
      console.log('Sending to Deepgram...');
      const { result, error } = await deepgram.listen.prerecorded.transcribeFile(
        buffer,
        {
          model: 'nova-3',
          smart_format: true,
          punctuate: true,
          mimetype: file.type || 'audio/webm'
        }
      );

      if (error) {
        console.error('Deepgram API error:', error);
        return NextResponse.json(
          { error: 'Failed to transcribe audio', details: error },
          { status: 500 }
        );
      }

      console.log('Received Deepgram response:', result);

      const transcription = result.results?.channels[0]?.alternatives[0]?.transcript;

      if (!transcription) {
        console.error('No transcription in Deepgram response');
        return NextResponse.json(
          { error: 'No transcription generated', details: 'Deepgram response contained no transcript' },
          { status: 500 }
        );
      }

      console.log('Transcription successful:', transcription);
      return NextResponse.json({ transcription });
    } catch (transcriptionError) {
      console.error('Deepgram API error:', transcriptionError);
      return NextResponse.json(
        { error: 'Deepgram API error', details: transcriptionError },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Request processing error:', error);
    return NextResponse.json(
      { error: 'Failed to process audio file', details: error },
      { status: 500 }
    );
  }
}

// Set the maximum file size to 50MB (you can adjust this as needed)
export const config = {
  api: {
    bodyParser: false,
    maxDuration: 30, // 30 seconds timeout
  },
}; 