import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import path from 'path';
import { mkdir, writeFile, readdir } from 'fs/promises';

export async function POST(request: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = user.id;
    const formData = await request.formData();
    const file = formData.get('file') as File;
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }
    const buffer = Buffer.from(await file.arrayBuffer());
    const uploadsDir = path.join(process.cwd(), 'uploads', userId);
    await mkdir(uploadsDir, { recursive: true });
    const filePath = path.join(uploadsDir, file.name);
    await writeFile(filePath, buffer);
    return NextResponse.json({ success: true, file: file.name });
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
    const userId = user.id;
    const { searchParams } = new URL(request.url);
    if (searchParams.get('list') !== '1') {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }
    const uploadsDir = path.join(process.cwd(), 'uploads', userId);
    let files: string[] = [];
    try {
      files = await readdir(uploadsDir);
    } catch (e) {
      // Directory may not exist yet
      files = [];
    }
    return NextResponse.json({ files });
  } catch (error) {
    console.error('List files error:', error);
    return NextResponse.json({ error: 'Failed to list files' }, { status: 500 });
  }
} 