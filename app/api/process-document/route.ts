import { NextRequest, NextResponse } from 'next/server';
import { ExcelProcessor } from '@/app/services/document-processor/excel-processor';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Save the file temporarily
    const buffer = Buffer.from(await file.arrayBuffer());
    const tempFilePath = path.join(process.cwd(), 'temp', file.name);
    
    // Process the Excel file
    const processor = new ExcelProcessor();
    const pricingData = await processor.processExcelFile(tempFilePath);
    
    // Here you would integrate with Liquid AI or another AI service
    // For now, we'll just return the processed data
    return NextResponse.json({
      success: true,
      data: pricingData
    });

  } catch (error) {
    console.error('Error processing document:', error);
    return NextResponse.json(
      { error: 'Failed to process document' },
      { status: 500 }
    );
  }
} 