import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || '';

    // Ensure uploads directory exists
    const uploadsDir = path.join(process.cwd(), 'public', 'avatars', 'uploads');
    await mkdir(uploadsDir, { recursive: true });

    let fileName = '';

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('file') as File | null;

      if (!file) {
        return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 });
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      fileName = `avatar-${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;
      const filePath = path.join(uploadsDir, fileName);

      await writeFile(filePath, buffer);
    } else if (contentType.includes('application/json')) {
      // Base64 camera snapshot
      const body = await req.json();
      const base64Data = body.image; // data:image/jpeg;base64,...

      if (!base64Data || !base64Data.includes('base64,')) {
        return NextResponse.json({ success: false, error: 'Invalid image data' }, { status: 400 });
      }

      const base64Image = base64Data.split(';base64,').pop();
      const buffer = Buffer.from(base64Image, 'base64');

      fileName = `camera-${Date.now()}-${Math.random().toString(36).substring(2, 8)}.jpg`;
      const filePath = path.join(uploadsDir, fileName);

      await writeFile(filePath, buffer);
    } else {
      return NextResponse.json({ success: false, error: 'Unsupported content type' }, { status: 400 });
    }

    const publicUrl = `/avatars/uploads/${fileName}`;
    return NextResponse.json({ success: true, url: publicUrl });
  } catch (err: any) {
    console.error('Avatar upload error:', err);
    return NextResponse.json({ success: false, error: err.message || 'Upload failed' }, { status: 500 });
  }
}
