import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { ExcelProcessor } from '@/app/services/document-processor/excel-processor';
import path from 'path';
import { readdir } from 'fs/promises';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

interface ChatMessage {
  message: string;
  businessId?: string;
  isVoiceInput?: boolean;
}

async function getBusinessPricingData(businessId?: string) {
  try {
    if (!businessId) {
      // For demo purposes, load a default file if no business ID
      const processor = new ExcelProcessor();
      // Try the gitignore folder first, then fallback to sample CSV
      try {
        return await processor.processExcelFile('./gitignore/Costings-Domestic Roofing Quotation QRX May 2016.xlsx');
      } catch (e) {
        console.log('Default Excel file not found, using sample CSV');
        return await processor.processExcelFile('./sample-pricing.csv');
      }
    }

    // Load files for specific business
    const uploadsDir = path.join(process.cwd(), 'uploads', businessId);
    let files: string[] = [];
    
    try {
      files = await readdir(uploadsDir);
    } catch (e) {
      console.log(`No uploads found for business ${businessId}`);
      return [];
    }

    const processor = new ExcelProcessor();
    let allPricingData: any[] = [];

    // Process all uploaded files for this business
    for (const file of files) {
      if (file.endsWith('.xlsx') || file.endsWith('.xls') || file.endsWith('.csv')) {
        const filePath = path.join(uploadsDir, file);
        const data = await processor.processExcelFile(filePath);
        allPricingData = [...allPricingData, ...data];
      }
    }

    return allPricingData;
  } catch (error) {
    console.error('Error loading pricing data:', error);
    return [];
  }
}

async function generateQuoteWithClaude(message: string, pricingData: any[]) {
  const systemPrompt = `You are an AI assistant helping customers get accurate quotes from a business. You have access to the business's pricing data and should use it to provide helpful, accurate quotes.

PRICING DATA:
${JSON.stringify(pricingData, null, 2)}

Your role:
1. Help customers understand what services/products are available
2. Ask clarifying questions to determine exactly what they need
3. Calculate accurate quotes based on the pricing data
4. Explain the breakdown of costs clearly
5. Be helpful and professional

Guidelines:
- Always base quotes on the actual pricing data provided
- Ask for specifics (quantities, dimensions, materials, etc.) when needed
- Provide itemized breakdowns when giving quotes
- If something isn't in the pricing data, let them know you'll need to check with the business
- Be conversational and helpful, not robotic

Current customer message: "${message}"

Respond helpfully and professionally. If this is their first message, welcome them and ask what kind of project or service they're looking for.`;

  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1000,
      temperature: 0.7,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: message,
        },
      ],
    });

    return response.content[0].type === 'text' ? response.content[0].text : 'I apologize, but I encountered an error generating a response.';
  } catch (error) {
    console.error('Error calling Claude API:', error);
    throw error;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { message, businessId, isVoiceInput }: ChatMessage = await request.json();
    
    if (!message) {
      return NextResponse.json(
        { error: 'No message provided' },
        { status: 400 }
      );
    }

    // Load pricing data for the business
    const pricingData = await getBusinessPricingData(businessId);

    // Generate response using Claude
    const response = await generateQuoteWithClaude(message, pricingData);

    // Generate TTS response if this was a voice input
    let audioResponse = null;
    if (isVoiceInput && process.env.ELEVENLABS_API_KEY) {
      try {
        const ttsResponse = await fetch(`${request.nextUrl.origin}/api/text-to-speech`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: response })
        });
        
        if (ttsResponse.ok) {
          const ttsData = await ttsResponse.json();
          audioResponse = ttsData.audio;
        }
      } catch (ttsError) {
        console.error('TTS generation failed:', ttsError);
        // Continue without audio - don't fail the whole request
      }
    }

    return NextResponse.json({ 
      response,
      audioResponse,
      pricingDataCount: pricingData.length 
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