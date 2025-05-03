import { NextRequest, NextResponse } from 'next/server';
import { ExcelProcessor } from '@/app/services/document-processor/excel-processor';

// This is a placeholder for the AI service integration
// You would replace this with actual Liquid AI or other AI service integration
async function getAIResponse(message: string, pricingData: any) {
  // Here you would integrate with your chosen AI service
  // For now, we'll just return a simple response
  return `I received your message: "${message}". I have access to pricing data with ${pricingData.length} items.`;
}

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json();
    
    if (!message) {
      return NextResponse.json(
        { error: 'No message provided' },
        { status: 400 }
      );
    }

    // Load and process the pricing data
    const processor = new ExcelProcessor();
    const pricingData = await processor.processExcelFile(
      'Costings-Domestic Roofing Quotation QRX May 2016.xlsx'
    );

    // Get response from AI service
    const response = await getAIResponse(message, pricingData);

    return NextResponse.json({ response });

  } catch (error) {
    console.error('Error processing chat message:', error);
    return NextResponse.json(
      { error: 'Failed to process chat message' },
      { status: 500 }
    );
  }
} 