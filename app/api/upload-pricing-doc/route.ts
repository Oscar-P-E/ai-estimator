import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import path from 'path';
import { mkdir, writeFile, readdir, unlink, stat } from 'fs/promises';

export async function POST(request: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const businessId = user.id; // Using Clerk user ID as business ID for Phase 0
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file types (any Claude-readable format)
    const allowedExtensions = [
      '.txt', '.md', '.csv', '.json', '.xml',
      '.pdf', '.docx', '.xlsx', '.xls',
      '.py', '.js', '.ts', '.html', '.css',
      '.png', '.jpg', '.jpeg', '.gif', '.webp'
    ];
    
    const fileExtension = path.extname(file.name).toLowerCase();
    if (!allowedExtensions.includes(fileExtension)) {
      return NextResponse.json({ 
        error: `File type ${fileExtension} not supported. Supported types: ${allowedExtensions.join(', ')}` 
      }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Create business_files directory structure
    const businessDir = path.join(process.cwd(), 'business_files', businessId);
    await mkdir(businessDir, { recursive: true });
    
    const filePath = path.join(businessDir, file.name);
    await writeFile(filePath, buffer);

    return NextResponse.json({ 
      success: true, 
      fileName: file.name,
      fileSize: file.size,
      fileType: fileExtension
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const businessId = user.id;
    const { searchParams } = new URL(request.url);
    
    if (searchParams.get('list') !== '1') {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    const businessDir = path.join(process.cwd(), 'business_files', businessId);
    let files: Array<{name: string, size: number, uploadDate: string}> = [];
    
    try {
      const fileNames = await readdir(businessDir);
      
      // Get file stats for each file
      for (const fileName of fileNames) {
        const filePath = path.join(businessDir, fileName);
        const stats = await stat(filePath);
        files.push({
          name: fileName,
          size: stats.size,
          uploadDate: stats.mtime.toISOString()
        });
      }
    } catch {
      // Directory may not exist yet
      files = [];
    }

    return NextResponse.json({ files });
  } catch (error) {
    console.error('List files error:', error);
    return NextResponse.json({ error: 'Failed to list files' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const businessId = user.id;
    const { fileName } = await request.json();
    
    if (!fileName) {
      return NextResponse.json({ error: 'No filename provided' }, { status: 400 });
    }

    const filePath = path.join(process.cwd(), 'business_files', businessId, fileName);
    await unlink(filePath);

    return NextResponse.json({ success: true, deletedFile: fileName });
  } catch (error) {
    console.error('Delete file error:', error);
    return NextResponse.json({ error: 'Failed to delete file' }, { status: 500 });
  }
} 