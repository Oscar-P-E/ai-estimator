import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import path from 'path';
import { readdir, readFile } from 'fs/promises';
import { systemPrompt } from '../../utils/systemPrompt';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatMessage {
  message: string;
  conversationHistory?: Message[];
  businessId?: string;
  isVoiceInput?: boolean;
}

async function loadBusinessFiles(businessId?: string): Promise<string> {
  try {
    if (!businessId) {
      // For demo purposes, try to load sample data
      try {
        const samplePath = path.join(process.cwd(), 'sample-pricing.csv');
        const sampleContent = await readFile(samplePath, 'utf-8');
        return `SAMPLE BUSINESS PRICING DATA:\n\n${sampleContent}`;
      } catch {
        return 'No business files available for this demo.';
      }
    }

    // Load all files for the specific business using business ID directly
    const businessDir = path.join(process.cwd(), 'business_files', businessId);
    let businessContext = '';
    
    try {
      const files = await readdir(businessDir);
      
      if (files.length === 0) {
        return 'No business files uploaded yet.';
      }

      businessContext += `BUSINESS FILES (${files.length} files):\n\n`;
      
      // Read each file and add to context
      for (const fileName of files) {
        const filePath = path.join(businessDir, fileName);
        const fileExtension = path.extname(fileName).toLowerCase();
        
        try {
          let fileContent = '';
          
          // Handle different file types that Claude can read directly
          if (['.txt', '.md', '.csv', '.json', '.xml', '.py', '.js', '.ts', '.html', '.css'].includes(fileExtension)) {
            fileContent = await readFile(filePath, 'utf-8');
          } else if (['.pdf', '.docx', '.xlsx', '.xls'].includes(fileExtension)) {
            // For demo purposes, note these files exist but would need proper processing
            fileContent = `[${fileExtension.toUpperCase()} FILE: ${fileName} - Claude can interpret this file type directly]`;
          } else if (['.png', '.jpg', '.jpeg', '.gif', '.webp'].includes(fileExtension)) {
            fileContent = `[IMAGE FILE: ${fileName} - Claude can analyze this image when needed]`;
          } else {
            fileContent = `[FILE: ${fileName} - Available for reference]`;
          }
          
          businessContext += `--- FILE: ${fileName} ---\n${fileContent}\n\n`;
        } catch (error) {
          console.error(`Error reading file ${fileName}:`, error);
          businessContext += `--- FILE: ${fileName} ---\n[Error reading file]\n\n`;
        }
      }
      
      return businessContext;
    } catch {
      return 'No business files uploaded yet.';
    }
  } catch (error) {
    console.error('Error loading business files:', error);
    return 'Error loading business files.';
  }
}

async function generateQuoteWithClaude(conversationHistory: Message[], businessContext: string) {
  const prompt = systemPrompt.replace('{businessContext}', businessContext);

  try {
    // Convert conversation history to Anthropic format
    const anthropicMessages = conversationHistory.map(msg => ({
      role: msg.role,
      content: msg.content
    }));

    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 800, // Slightly reduced for faster response
      temperature: 0.6, // Slightly lower for more focused responses
      system: prompt,
      messages: anthropicMessages,
    });

    return response.content[0].type === 'text' ? response.content[0].text : 'I apologize, but I encountered an error generating a response.';
  } catch (error) {
    console.error('Error calling Claude API:', error);
    throw error;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { message, conversationHistory = [], businessId, isVoiceInput }: ChatMessage = await request.json();
    
    if (!message) {
      return NextResponse.json(
        { error: 'No message provided' },
        { status: 400 }
      );
    }

    // Load all business files as context
    const businessContext = await loadBusinessFiles(businessId);

    // If no conversation history provided, create it with just the current message
    const fullConversation = conversationHistory.length > 0 
      ? conversationHistory 
      : [{ role: 'user' as const, content: message }];

    // Generate response using Claude with full conversation context
    const response = await generateQuoteWithClaude(fullConversation, businessContext);

    // Generate TTS response if this was a voice input
    let audioResponse = null;
    console.log('TTS Debug - isVoiceInput:', isVoiceInput, 'hasElevenLabsKey:', !!process.env.ELEVENLABS_API_KEY);
    if (isVoiceInput && process.env.ELEVENLABS_API_KEY) {
      try {
        console.log('Generating TTS for response:', response.substring(0, 100) + '...');
        const ttsResponse = await fetch(`${request.nextUrl.origin}/api/text-to-speech`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: response })
        });
        
        if (ttsResponse.ok) {
          const ttsData = await ttsResponse.json();
          audioResponse = ttsData.audio;
          console.log('TTS generated successfully, audio length:', audioResponse ? audioResponse.length : 0);
        } else {
          console.error('TTS API returned error:', ttsResponse.status, await ttsResponse.text());
        }
      } catch (ttsError) {
        console.error('TTS generation failed:', ttsError);
        // Continue without audio - don't fail the whole request
      }
    } else {
      console.log('TTS skipped - isVoiceInput:', isVoiceInput, 'hasKey:', !!process.env.ELEVENLABS_API_KEY);
    }

    // Count the number of files for debugging
    const fileCount = businessContext.includes('files):') ? 
      parseInt(businessContext.match(/\((\d+) files\):/)?.[1] || '0') : 0;

    return NextResponse.json({ 
      response,
      audioResponse,
      filesLoaded: fileCount
    });

  } catch (error) {
    console.error('Error processing chat message:', error);
    
    // Handle specific API errors
    if (error instanceof Anthropic.APIError) {
      return NextResponse.json(
        { error: `AI service error: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to process chat message' },
      { status: 500 }
    );
  }
} 