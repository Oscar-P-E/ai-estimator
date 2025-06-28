import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import path from 'path';
import { put, list, del } from '@vercel/blob';
import { getBusinessId } from '../../utils/businessId';

export async function POST(request: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const businessId = await getBusinessId(user.id); // Get unique business ID
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

    // Upload to Vercel Blob
    const filename = `${businessId}/${file.name}`;
    const blob = await put(filename, file, {
      access: 'public',
    });

    return NextResponse.json({ 
      success: true, 
      fileName: file.name,
      fileSize: file.size,
      fileType: fileExtension,
      url: blob.url
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
    
    const businessId = await getBusinessId(user.id);
    const { searchParams } = new URL(request.url);
    
    if (searchParams.get('list') !== '1') {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    // List files from Vercel Blob
    const { blobs } = await list({
      prefix: `${businessId}/`,
    });

    // Transform blob data to match expected format
    const files = blobs.map(blob => ({
      name: blob.pathname.replace(`${businessId}/`, ''),
      size: blob.size,
      uploadDate: blob.uploadedAt,
      url: blob.url
    }));

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
    
    const businessId = await getBusinessId(user.id);
    const { fileName } = await request.json();
    
    if (!fileName) {
      return NextResponse.json({ error: 'No filename provided' }, { status: 400 });
    }

    // Delete from Vercel Blob
    const blobPath = `${businessId}/${fileName}`;
    await del(blobPath);

    return NextResponse.json({ success: true, deletedFile: fileName });
  } catch (error) {
    console.error('Delete file error:', error);
    return NextResponse.json({ error: 'Failed to delete file' }, { status: 500 });
  }
} 